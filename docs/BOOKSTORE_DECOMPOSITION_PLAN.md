# BookStore Decomposition Plan

**Branch:** `refactor/bookstore-decomposition`
**Related Issues:** #19 (Component tree preconditions pattern)

---

## Problem Statement

`src/stores/BookStore.tsx` is currently 375 lines with multiple tangled responsibilities:
- File system operations (paths, downloads, cleanup)
- AsyncStorage persistence
- Network-aware data loading
- Download management
- State management
- Dev settings gating

This makes it hard to test, understand, and maintain.

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      BookStoreProvider                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 DevSettings Gate                          │  │
│  │         (renders loading UI until ready)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              BookStoreProviderReady                       │  │
│  │  ┌─────────────────┐    ┌──────────────────────┐         │  │
│  │  │  useBookLoader  │    │  useBookDownloads    │         │  │
│  │  │                 │───▶│                      │         │  │
│  │  │  - books state  │    │  - downloadBook()    │         │  │
│  │  │  - loadBooks()  │    │  - removeDownloads() │         │  │
│  │  │  - loading      │    │                      │         │  │
│  │  └────────┬────────┘    └──────────┬───────────┘         │  │
│  │           │                        │                      │  │
│  │           └────────────┬───────────┘                      │  │
│  │                        ▼                                  │  │
│  │              BookStoreContext.Provider                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  bookStorage.ts │
                    │    (utils)      │
                    │                 │
                    │  - File paths   │
                    │  - File I/O     │
                    │  - AsyncStorage │
                    └─────────────────┘
```

---

## File Structure

```
src/
├── utils/
│   └── bookStorage.ts        # NEW - Pure storage utilities (~80 lines)
├── hooks/
│   ├── useBookLoader.ts      # NEW - Network-aware loading (~130 lines)
│   └── useBookDownloads.ts   # NEW - Download management (~90 lines)
└── stores/
    └── BookStore.tsx         # REFACTORED - Thin orchestration (~60 lines)
```

---

## Module Specifications

### 1. `src/utils/bookStorage.ts` (~80 lines)

**Purpose:** Pure utility functions for all storage operations (FileSystem + AsyncStorage). No React dependencies.

```typescript
// ============ Path Utilities (synchronous, pure) ============

export const BOOK_STORAGE_KEY = '@BookBucket';

export const getBookDirectoryPath = (isbn: string): string =>
  `${FileSystem.documentDirectory}books/${isbn}`;

export const getTrackFilePath = (isbn: string, trackName: string): string =>
  `${FileSystem.documentDirectory}books/${isbn}/tracks/${trackName}.mp3`;


// ============ File System Operations (async) ============

export const ensureDirectoryExists = async (path: string): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(path);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
};

export const checkTrackExists = async (
  isbn: string,
  trackName: string
): Promise<boolean> => {
  const filePath = getTrackFilePath(isbn, trackName);
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists;
};

export const downloadTrackFile = async (
  sourceUri: string,
  destPath: string
): Promise<void> => {
  await FileSystem.downloadAsync(sourceUri, destPath);
};

export const deleteBookDirectory = async (isbn: string): Promise<void> => {
  const dirPath = getBookDirectoryPath(isbn);
  const dirInfo = await FileSystem.getInfoAsync(dirPath);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(dirPath);
  }
};

export const cleanupFailedDownload = async (
  filePath: string
): Promise<void> => {
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(filePath);
  }
};


// ============ Download Status Utilities ============

export const getTrackDownloadStatus = async (
  isbn: string,
  track: Track
): Promise<DownloadStatus> => {
  const exists = await checkTrackExists(isbn, track.name);
  return exists ? DownloadStatus.DOWNLOADED : DownloadStatus.NOT_DOWNLOADED;
};

export const augmentBookWithDownloadStatuses = async (
  book: Book
): Promise<Book> => {
  if (!book.tracks) return book;

  const updatedTracks = await Promise.all(
    book.tracks.map(async (track) => ({
      ...track,
      downloadStatus: await getTrackDownloadStatus(book.isbn, track),
    }))
  );

  return { ...book, tracks: updatedTracks };
};


// ============ AsyncStorage Operations ============

export const persistBooks = async (books: BookStoreState): Promise<void> => {
  await AsyncStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify(books));
};

export const loadPersistedBooks = async (): Promise<BookStoreState | null> => {
  const json = await AsyncStorage.getItem(BOOK_STORAGE_KEY);
  if (json === null) return null;
  return JSON.parse(json);
};
```

**Testing:** Mock `expo-file-system` and `@react-native-async-storage/async-storage`. All functions are independently testable.

---

### 2. `src/hooks/useBookLoader.ts` (~130 lines)

**Purpose:** Network-aware book loading and caching. Owns the books state.

**Assumptions:**
- Rendered inside `AuthContext` provider
- Dev settings already loaded (enforced by parent component)

```typescript
import { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from 'contexts/AuthContext';
import useNetworkStatus from 'hooks/useNetworkStatus';
import APIClient from 'APIClient';
import { NetworkStatus, Book, BookStoreState } from 'types/types';
import {
  persistBooks,
  loadPersistedBooks,
  augmentBookWithDownloadStatuses,
} from 'utils/bookStorage';

interface UseBookLoaderReturn {
  books: BookStoreState;
  setBooks: React.Dispatch<React.SetStateAction<BookStoreState>>;
  loading: boolean;
  loadBooks: () => Promise<void>;
}

export const useBookLoader = (): UseBookLoaderReturn => {
  const [books, setBooks] = useState<BookStoreState>({});
  const [loading, setLoading] = useState(false);
  const loadingGuard = useRef(false);

  const networkStatus = useNetworkStatus();
  const [authSeal] = useContext(AuthContext);

  // Track previous network status for change detection
  const networkStatusRef = useRef(networkStatus);

  // ============ Loading Functions ============

  const loadFromStorage = async (): Promise<void> => {
    console.log('Loading Books from Storage...');
    const stored = await loadPersistedBooks();
    if (stored) {
      setBooks(stored);
      console.log('Books loaded from Storage!');
    } else {
      console.log('No books found in local storage');
    }
  };

  const loadFromAPI = async (): Promise<void> => {
    console.log('Loading Books from API...');
    if (authSeal === null) {
      throw new Error('Cannot make API call without auth seal');
    }

    const response = await APIClient.getHomeBooks(authSeal);
    if (!response) {
      throw new Error('Could not fetch home books');
    }

    const { library, featured, newReleases, onSale } = response;
    const organizedBooks = await prepBooks(library, [featured, newReleases, onSale].flat());

    persistBooks(organizedBooks); // Fire and forget - cache for offline
    setBooks(organizedBooks);
    console.log('Books loaded from API!');
  };

  const prepBooks = async (
    ownedBooks: Book[],
    unownedBooks: Book[]
  ): Promise<BookStoreState> => {
    // Unowned books first (will be overwritten by owned if duplicate)
    const organized: BookStoreState = {};
    unownedBooks.forEach((book) => {
      organized[book.isbn] = book;
    });

    // Owned books with download statuses
    const augmentedOwned = await Promise.all(
      ownedBooks.map(augmentBookWithDownloadStatuses)
    );
    augmentedOwned.forEach((book) => {
      organized[book.isbn] = book;
    });

    return organized;
  };

  const loadBooks = async (): Promise<void> => {
    if (loadingGuard.current) {
      console.log('Books already loading, skipping...');
      return;
    }

    loadingGuard.current = true;
    setLoading(true);

    try {
      switch (networkStatus) {
        case NetworkStatus.ONLINE:
          await loadFromAPI();
          break;

        case NetworkStatus.UNKNOWN:
          try {
            await loadFromAPI();
          } catch (e) {
            console.error('API failed, falling back to storage:', e);
            await loadFromStorage();
          }
          break;

        case NetworkStatus.OFFLINE:
        default:
          await loadFromStorage();
          break;
      }
    } finally {
      setLoading(false);
      loadingGuard.current = false;
    }
  };

  // ============ Effects ============

  // Reload when network becomes available
  useEffect(() => {
    const prevStatus = networkStatusRef.current;
    if (
      prevStatus !== networkStatus &&
      (networkStatus === NetworkStatus.ONLINE || networkStatus === NetworkStatus.UNKNOWN)
    ) {
      console.log(`Network: ${prevStatus} → ${networkStatus}`);
      loadBooks();
    }
    networkStatusRef.current = networkStatus;
  }, [networkStatus]);

  // Load on auth change
  useEffect(() => {
    if (authSeal !== null) {
      loadBooks();
    }
  }, [authSeal]);

  return { books, setBooks, loading, loadBooks };
};
```

**Testing:** Mock `AuthContext`, `useNetworkStatus`, `APIClient`, and `bookStorage` utilities.

---

### 3. `src/hooks/useBookDownloads.ts` (~90 lines)

**Purpose:** Download lifecycle management. Takes books state as input (doesn't own it).

```typescript
import { useCallback } from 'react';
import { Book, BookStoreState, DownloadStatus, Track } from 'types/types';
import {
  getTrackFilePath,
  getBookDirectoryPath,
  ensureDirectoryExists,
  downloadTrackFile,
  deleteBookDirectory,
  cleanupFailedDownload,
  persistBooks,
} from 'utils/bookStorage';

type SetBooks = React.Dispatch<React.SetStateAction<BookStoreState>>;

interface UseBookDownloadsReturn {
  downloadBook: (isbn: string) => Promise<void>;
  removeDownloads: (isbn: string) => Promise<void>;
}

export const useBookDownloads = (
  books: BookStoreState,
  setBooks: SetBooks
): UseBookDownloadsReturn => {

  const updateTrackStatus = useCallback(
    (isbn: string, trackName: string, status: DownloadStatus) => {
      setBooks((prev) => {
        const book = prev[isbn];
        if (!book?.tracks) return prev;

        const updatedTracks = book.tracks.map((t) =>
          t.name === trackName ? { ...t, downloadStatus: status } : t
        );

        const newBooks = {
          ...prev,
          [isbn]: { ...book, tracks: updatedTracks },
        };

        persistBooks(newBooks); // Keep cache in sync
        return newBooks;
      });
    },
    [setBooks]
  );

  const downloadBook = useCallback(
    async (isbn: string): Promise<void> => {
      const book = books[isbn];
      if (!book) {
        throw new Error(`Unknown book: ${isbn}`);
      }
      if (!book.tracks) {
        throw new Error(`Book ${isbn} has no tracks`);
      }

      // Ensure directory exists
      const tracksDir = `${getBookDirectoryPath(isbn)}/tracks`;
      await ensureDirectoryExists(tracksDir);

      // Download all tracks in parallel
      await Promise.all(
        book.tracks.map(async (track) => {
          const destPath = getTrackFilePath(isbn, track.name);
          console.log(`Downloading: ${track.name}`);

          try {
            updateTrackStatus(isbn, track.name, DownloadStatus.DOWNLOADING);
            await downloadTrackFile(track.uri, destPath);
            updateTrackStatus(isbn, track.name, DownloadStatus.DOWNLOADED);
          } catch (error) {
            console.error(`Download failed: ${track.name}`, error);
            updateTrackStatus(isbn, track.name, DownloadStatus.FAILED);
            await cleanupFailedDownload(destPath);
          }
        })
      );
    },
    [books, updateTrackStatus]
  );

  const removeDownloads = useCallback(
    async (isbn: string): Promise<void> => {
      await deleteBookDirectory(isbn);

      setBooks((prev) => {
        const book = prev[isbn];
        if (!book?.tracks) return prev;

        const updatedTracks = book.tracks.map((t) => ({
          ...t,
          downloadStatus: DownloadStatus.NOT_DOWNLOADED,
        }));

        const newBooks = {
          ...prev,
          [isbn]: { ...book, tracks: updatedTracks },
        };

        persistBooks(newBooks);
        return newBooks;
      });
    },
    [setBooks]
  );

  return { downloadBook, removeDownloads };
};
```

**Testing:** Mock `bookStorage` utilities. Pass in mock `books` state and `setBooks` function.

---

### 4. `src/stores/BookStore.tsx` (~60 lines)

**Purpose:** Thin orchestration layer. Composes hooks and provides context.

```typescript
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { ActivityIndicator, Text } from 'react-native-paper';
import { View } from 'react-native';
import { Book, BookStoreState } from 'types/types';
import useDevSettings from 'hooks/useDevSettings';
import { useBookLoader } from 'hooks/useBookLoader';
import { useBookDownloads } from 'hooks/useBookDownloads';
import { ensureDirectoryExists, checkTrackExists } from 'utils/bookStorage';
import * as FileSystem from 'expo-file-system';

interface BookStoreContextType {
  books: BookStoreState;
  loadBooks: () => Promise<void>;
  downloadAudioFiles: (isbn: Book['isbn']) => Promise<void>;
  removeDownloads: (isbn: Book['isbn']) => Promise<void>;
  trackFileExists: (isbn: Book['isbn'], trackName: string) => Promise<boolean>;
  loading: boolean;
}

const BookStoreContext = createContext<BookStoreContextType | null>(null);

// ============ Inner Component (dev settings guaranteed ready) ============

const BookStoreProviderReady = ({ children }: { children: ReactNode }) => {
  const { books, setBooks, loading, loadBooks } = useBookLoader();
  const { downloadBook, removeDownloads } = useBookDownloads(books, setBooks);

  // One-time directory setup
  useEffect(() => {
    ensureDirectoryExists(`${FileSystem.documentDirectory}books`);
  }, []);

  const contextValue: BookStoreContextType = {
    books,
    loadBooks,
    downloadAudioFiles: downloadBook,
    removeDownloads,
    trackFileExists: checkTrackExists,
    loading,
  };

  return (
    <BookStoreContext.Provider value={contextValue}>
      {children}
    </BookStoreContext.Provider>
  );
};

// ============ Outer Component (gates on dev settings) ============

const BookStoreProvider = ({ children }: { children: ReactNode }) => {
  const { loaded: devSettingsLoaded } = useDevSettings();

  if (!devSettingsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 10 }}>Loading settings...</Text>
      </View>
    );
  }

  return <BookStoreProviderReady>{children}</BookStoreProviderReady>;
};

// ============ Consumer Hook ============

const useBookStore = (): BookStoreContextType => {
  const context = useContext(BookStoreContext);
  if (context === null) {
    throw new Error('useBookStore must be used within BookStoreProvider');
  }
  return context;
};

export { BookStoreContext, BookStoreProvider, useBookStore };
```

**Testing:** Integration tests only - this is just wiring.

---

## Migration Steps

### Phase 1: Extract utilities (low risk)
1. Create `src/utils/bookStorage.ts`
2. Move pure functions from BookStore
3. Update BookStore imports
4. Verify tests pass

### Phase 2: Extract useBookDownloads (medium risk)
1. Create `src/hooks/useBookDownloads.ts`
2. Move download logic
3. Update BookStore to use hook
4. Write tests for hook

### Phase 3: Extract useBookLoader (higher risk)
1. Create `src/hooks/useBookLoader.ts`
2. Move loading logic and state
3. Update BookStore to use hook
4. Write tests for hook

### Phase 4: Simplify BookStore (cleanup)
1. Refactor to inner component pattern
2. Remove redundant dev settings checks
3. Verify all consumers still work
4. Final integration tests

---

## Size Comparison

| Before | After | Lines |
|--------|-------|-------|
| BookStore.tsx (375) | bookStorage.ts | ~80 |
| | useBookLoader.ts | ~130 |
| | useBookDownloads.ts | ~90 |
| | BookStore.tsx | ~60 |
| **Total: 375** | **Total: ~360** | -15 |

Similar total lines, but now:
- Each file has a single responsibility
- Each module is independently testable
- Clear dependency graph
- Follows React idioms (hooks, composition)

---

## Open Questions

1. **Should `useBookDownloads` expose download progress?** Currently it just updates status. Could add a progress callback or state if UI needs it.

2. **Error handling strategy?** Currently errors are logged and tracks marked FAILED. Should there be a retry mechanism?

3. **Should `trackFileExists` be exposed on context?** It's currently passed through but only used by PlaybackContext. Could be imported directly from utils instead.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Book, BookStoreState, DownloadStatus, Track } from 'types/types';

// ============ Constants ============

export const BOOK_STORAGE_KEY = '@BookBucket';

// ============ Path Utilities (synchronous, pure) ============

export const getBookDirectoryPath = (isbn: string): string => {
    return `${FileSystem.documentDirectory}books/${isbn}`;
};

export const getTrackFilePath = (isbn: string, trackName: string): string => {
    return `${FileSystem.documentDirectory}books/${isbn}/tracks/${trackName}.mp3`;
};

// ============ File System Operations (async) ============

export const ensureDirectoryExists = async (path: string): Promise<void> => {
    const dirInfo = await FileSystem.getInfoAsync(path);
    if (!dirInfo.exists) {
        console.log(`Creating directory at ${path}`);
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
        console.log(`Deleting book directory at ${dirPath}`);
        await FileSystem.deleteAsync(dirPath);
    }
};

export const cleanupFailedDownload = async (filePath: string): Promise<void> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(filePath);
            console.log(`Deleted partial file for failed download`);
        }
    } catch (error) {
        console.error(`Error cleaning up failed download:`, error);
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

export const augmentBookWithDownloadStatuses = async (book: Book): Promise<Book> => {
    if (!book.tracks) {
        return book;
    }

    const updatedTracks = await Promise.all(
        book.tracks.map(async (track) => {
            const downloadStatus = await getTrackDownloadStatus(book.isbn, track);
            return { ...track, downloadStatus };
        })
    );

    return { ...book, tracks: updatedTracks };
};

// ============ AsyncStorage Operations ============

export const persistBooks = async (books: BookStoreState): Promise<void> => {
    await AsyncStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify(books));
};

export const loadPersistedBooks = async (): Promise<BookStoreState | null> => {
    const json = await AsyncStorage.getItem(BOOK_STORAGE_KEY);
    if (json === null) {
        return null;
    }
    return JSON.parse(json);
};

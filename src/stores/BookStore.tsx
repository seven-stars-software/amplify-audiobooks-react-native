import AsyncStorage from "@react-native-async-storage/async-storage"
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { Book, DownloadStatus, Track } from "types/types";
import AuthContext from "contexts/AuthContext";
import APIClient from "APIClient";
import useCallbackState from "hooks/useCallbackState";
import * as FileSystem from 'expo-file-system';
import useDevSettings from "hooks/useDevSettings";
import useNetworkStatus from "hooks/useNetworkStatus";
import { ActivityIndicator, Text } from "react-native-paper";
import { View } from "react-native";

const BookStoreBucket = '@BookBucket'
const saveToStorage = async (books: BookStoreState) => {
    await AsyncStorage.setItem(`${BookStoreBucket}`, JSON.stringify(books))
}

export const getTrackFilePath = (isbn: Book['isbn'], trackName: string) => {
    return `${FileSystem.documentDirectory}books/${isbn}/tracks/${trackName}.mp3`;
}

export const trackFileExists = async (isbn: Book['isbn'], trackName: string) => {
    const trackFilePath = getTrackFilePath(isbn, trackName);
    const fileInfo = await FileSystem.getInfoAsync(trackFilePath);
    return fileInfo.exists;
};

export const getTrackDownloadStatus = async (isbn: Book['isbn'], track: Track) => {
    const exists = await trackFileExists(isbn, track.name);
    return exists ? DownloadStatus.DOWNLOADED : DownloadStatus.NOT_DOWNLOADED
}

const cleanupFailedDownload = async (filePath: string, trackName: string) => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(filePath);
            console.log(`Deleted partial file for failed download: ${trackName}`);
        }
    } catch (error) {
        console.error(`Error cleaning up failed download ${trackName}:`, error);
    }
}

const augmentBookWithDownloadStatuses = async (book: Book): Promise<Book> => {
    if (!book.tracks) return book;

    const updatedTracks = await Promise.all(
        book.tracks.map(async (track) => {
            const downloadStatus = await getTrackDownloadStatus(book.isbn, track);
            return { ...track, downloadStatus };
        })
    );

    return { ...book, tracks: updatedTracks };
}

interface BookStoreContextType {
    books: BookStoreState,
    loadBooks: () => Promise<void>,
    downloadAudioFiles: (isbn: Book['isbn']) => Promise<void>,
    removeDownloads: (isbn: Book['isbn']) => Promise<void>,
    trackFileExists: (isbn: Book['isbn'], trackName: string) => Promise<boolean>,
    loading: boolean
}

type BookStoreState = {
    [key: Book['isbn']]: Book
}

const BookStoreContext = createContext<BookStoreContextType | null>(null);


/**
 * The number of Book objects needed by the app is expected to be limited, below 1000.
 * The BookStoreProvider tries to prefetch all the Book objects a user will need the first time the Provider mounts.
 * If the app is not connected to internet service, it will instead try to load books from local storage.
 * The local storage cache is updated every time Book objects are fetched from the API.
 *
 *
 */

const BookStoreProvider = ({ children }: { children?: ReactNode }) => {
    const [books, setBooks] = useCallbackState<BookStoreState>({})

    // UI loading state - triggers re-renders to show/hide loading indicators
    const [loading, setLoading] = useState(false)

    // Race condition guard - synchronously prevents concurrent loadBooks() calls
    // Using a ref instead of state because refs update immediately (synchronous),
    // while setState() is asynchronous and wouldn't prevent race conditions
    const loadingGuard = useRef(false);

    const { isInternetReachable } = useNetworkStatus();
    const { devSettings, loaded: devSettingsLoaded } = useDevSettings();
    const [authSeal] = useContext(AuthContext);

    //Monitor internet reachability changes to attempt reload of books when connectivity is regained
    const internetReachableRef = useRef(isInternetReachable);
    useEffect(() => {
        // Don't attempt to load until dev settings are ready
        if (!devSettingsLoaded) return;

        const prevInternetReachable = internetReachableRef.current;

        if (prevInternetReachable !== isInternetReachable &&
            (isInternetReachable === true || isInternetReachable === null)) {
            console.log(`Internet Reachability changed: ${internetReachableRef.current} --> ${isInternetReachable}`);
            //We may have regained internet connectivity
            //Attempt to reload books
            loadBooks();
        }
        internetReachableRef.current = isInternetReachable;
    }, [isInternetReachable, devSettingsLoaded])

    //Load books on initial mount if we have an auth seal
    //And whenever the auth seal changes
    //Wait for dev settings to load before loading books
    useEffect(() => {
        if (!devSettingsLoaded) return;

        if (authSeal !== null) {
            loadBooks()
        }
    }, [authSeal, devSettingsLoaded])

    //One time setup
    useEffect(() => {
        //Ensure downloads directory is created
        const setupDownloadDirectory = async () => {
            try {
                const booksDirectoryPath = `${FileSystem.documentDirectory}books`;
                const dirInfo = await FileSystem.getInfoAsync(booksDirectoryPath);
                if (!dirInfo.exists) {
                    console.log(`Creating books directory at ${booksDirectoryPath}`);
                    await FileSystem.makeDirectoryAsync(booksDirectoryPath, { intermediates: true });
                }
            } catch (e) {
                console.error(`Error during download setup: ${e}`)
            }
        };
        setupDownloadDirectory();
    }, [])

    //Destructive overwrite of 'books' state
    const loadFromStorage = async () => {
        console.log(`Loading Books from Storage...`)
        setLoading(true)
        try {
            const booksFromStorageJSON = await AsyncStorage.getItem(`${BookStoreBucket}`)
            if (booksFromStorageJSON != null) {
                const booksFromStorage = JSON.parse(booksFromStorageJSON)
                setBooks(booksFromStorage, () => setLoading(false))
                console.log(`Books loaded from Storage!`)
            } else {
                console.log(`No books found in local storage`)
            }
        } catch (e) {
            console.error(`Error loading books from storage: ${e}`)
            throw e
        } finally {
            setLoading(false)
        }
    }

    //Destructive overwrite of 'books' state
    //Automatically saves to local storage
    const loadFromAPI = async () => {
        console.log(`Loading Books from API...`)
        setLoading(true)
        try {
            if (authSeal === null) throw new Error('Cannot make API call without first loading auth seal')

            const response = await APIClient.getHomeBooks(authSeal);
            if (!response) throw new Error("Could not fetch home books")

            const { library, featured, newReleases, onSale } = response;
            const organizedBooks = await prepBooks(library, [featured, newReleases, onSale].flat());

            //Update local storage any time we fetch fresh data from the API
            saveToStorage(organizedBooks)
            //Update state
            setBooks(organizedBooks, () => setLoading(false))
            console.log(`Books loaded from API!`)
        } catch (e) {
            console.error(`Error loading books from API: ${e}`)
            throw e
        } finally {
            //Ensure loading is reset to false even in case of errors
            setLoading(false)
        }
    }

    //Merge ownedBooks and unownedBooks, giving precedence to ownedBooks in case of duplicates
    //Also augment ownedBooks with download statuses
    const prepBooks = async (ownedBooks: Book[], unownedBooks: Book[]): Promise<BookStoreState> => {
        //In case a user owns a book that is also in another category,
        //ignore the book data in the other category in favor of the version in the user's library
        const organizedBooks: { [key: Book['isbn']]: Book } = {}
        unownedBooks.forEach((book) => {
            organizedBooks[book.isbn] = book
        })
        const augmentedOwnedBooks = await Promise.all(
            ownedBooks.map(async (book) => {
                return await augmentBookWithDownloadStatuses(book)
            })
        )
        augmentedOwnedBooks.forEach(book => {
            organizedBooks[book.isbn] = book
        })
        return organizedBooks;
    }

    const loadBooks = async () => {
        // Guard against race conditions: multiple useEffects can trigger loadBooks() simultaneously
        // Check the guard synchronously before proceeding
        if (loadingGuard.current) {
            console.log(`Books are already loading, skipping redundant load request.`)
            return;
        }
        console.log(`Loading Books...`)
        loadingGuard.current = true; // Set guard synchronously to block concurrent calls
        try {
            if (isInternetReachable === true || isInternetReachable === null) {
                console.log(`Internet might be reachable, attempting to load from API...`)
                try {
                    await loadFromAPI()
                } catch (e) {
                    console.error(`Error loading books from API: ${e}. Falling back to local storage.`)
                    await loadFromStorage()
                }
            } else if (isInternetReachable === false) {
                console.log(`Internet not reachable, loading from local storage...`)
                await loadFromStorage()
            }
        } finally {
            loadingGuard.current = false; // Always release the guard when done
        }
    }



    const setTrackDownloadStatus = (isbn: Book['isbn'], trackName: string, status: DownloadStatus) => {
        setBooks(prevBooks => {
            const updatedBook = { ...prevBooks[isbn] };
            //If there are no tracks, nothing to update
            if (!updatedBook.tracks) return prevBooks;

            const updatedTracks = updatedBook.tracks.map(t => {
                if (t.name === trackName) {
                    return { ...t, downloadStatus: status };
                }
                return t;
            });
            updatedBook.tracks = updatedTracks;

            const newBooks = { ...prevBooks, [isbn]: updatedBook };
            saveToStorage(newBooks);
            return newBooks;
        });
    }

    const downloadAudioFiles = async (isbn: Book['isbn']) => {
        const book = books[isbn];
        if (!book) {
            throw new Error(`Cannot download audio files for unknown book with ISBN [${isbn}]`)
        }
        const tracks = book.tracks;
        if (!tracks) {
            throw new Error(`Book with ISBN [${isbn}] has no tracks to download`)
        }

        // Ensure the tracks directory exists
        const bookTracksDirectoryPath = `${FileSystem.documentDirectory}books/${isbn}/tracks`;
        const dirInfo = await FileSystem.getInfoAsync(bookTracksDirectoryPath);
        if (!dirInfo.exists) {
            console.log(`Creating tracks directory at ${bookTracksDirectoryPath}`);
            await FileSystem.makeDirectoryAsync(bookTracksDirectoryPath, { intermediates: true });
        }

        // Download all tracks
        await Promise.all(tracks.map(async (track) => {
            const fileToBeCreated = getTrackFilePath(isbn, track.name);
            console.log(`Downloading track [${track.name}] to [${fileToBeCreated}]`)
            try {
                //Update track download status in state
                setTrackDownloadStatus(isbn, track.name, DownloadStatus.DOWNLOADING);
                await FileSystem.downloadAsync(track.uri, fileToBeCreated);
                setTrackDownloadStatus(isbn, track.name, DownloadStatus.DOWNLOADED);
            } catch (error) {
                console.error(`Error downloading track ${track.name}:`, error);
                setTrackDownloadStatus(isbn, track.name, DownloadStatus.FAILED);
                await cleanupFailedDownload(fileToBeCreated, track.name);
            }
        }));
    }

    const removeDownloads = async (isbn: Book['isbn']) => {
        const bookDirectoryPath = `${FileSystem.documentDirectory}books/${isbn}`;
        const dirInfo = await FileSystem.getInfoAsync(bookDirectoryPath);
        if (dirInfo.exists) {
            console.log(`Deleting book directory at ${bookDirectoryPath}`);
            await FileSystem.deleteAsync(bookDirectoryPath);
        }

        // Update all tracks to NOT_DOWNLOADED status
        setBooks(prevBooks => {
            const updatedBook = { ...prevBooks[isbn] };
            if (!updatedBook.tracks) return prevBooks;

            const updatedTracks = updatedBook.tracks.map(track => ({
                ...track,
                downloadStatus: DownloadStatus.NOT_DOWNLOADED
            }));
            updatedBook.tracks = updatedTracks;

            const newBooks = { ...prevBooks, [isbn]: updatedBook };
            saveToStorage(newBooks);
            return newBooks;
        });
    }

    // Wait for dev settings to load before rendering children
    // In production, devSettingsLoaded is immediately true
    if (!devSettingsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator animating={true} size="large" />
                <Text style={{ marginTop: 10 }}>Loading dev settings...</Text>
            </View>
        );
    }

    return (
        <BookStoreContext.Provider value={{ books, loadBooks, downloadAudioFiles, removeDownloads, trackFileExists, loading }}>
            {children}
        </BookStoreContext.Provider>
    )
}

const useBookStore = () => {
    const contextValue = useContext(BookStoreContext);
    if (contextValue === null) {
        throw new Error("Attempted use of BookStoreContext outside of Provider")
    }
    return contextValue

}

export {
    BookStoreContext,
    BookStoreProvider,
    useBookStore
};

import AsyncStorage from "@react-native-async-storage/async-storage"
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { addEventListener, useNetInfo } from "@react-native-community/netinfo";
import { Book, DownloadStatus } from "types/types";
import AuthContext from "contexts/AuthContext";
import APIClient from "APIClient";
import useCallbackState from "hooks/useCallbackState";
import * as FileSystem from 'expo-file-system';

const BookStoreBucket = '@BookBucket'
const saveToStorage = async (books: BookStoreState) => {
    await AsyncStorage.setItem(`${BookStoreBucket}`, JSON.stringify(books))
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
    const [loading, setLoading] = useState(false)
    const { isInternetReachable } = useNetInfo();
    const [authSeal] = useContext(AuthContext);

    //Monitor internet reachability changes to attempt reload of books when connectivity is regained
    const internetReachableRef = useRef(isInternetReachable);
    useEffect(() => {
        const prevInternetReachable = internetReachableRef.current;
        if (prevInternetReachable !== isInternetReachable &&
            (isInternetReachable === true || isInternetReachable === null)) {
            console.log(`Internet Reachability changed: ${internetReachableRef.current} --> ${isInternetReachable}`);
            //We may have regained internet connectivity
            loadBooks();
        }
        internetReachableRef.current = isInternetReachable;
    }, [isInternetReachable])

    useEffect(() => {
        if (authSeal !== null) {
            loadBooks()
        }
    }, [authSeal])

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

                const sampleBookISBN = Object.keys(booksFromStorage).find((isbn) => { return booksFromStorage[isbn].purchased }) || ''

                setBooks(booksFromStorage, () => setLoading(false))
                console.log(`Books loaded from Storage!`)
            } else {
                console.log(`No books found in local storage`)
            }
        } catch(e){
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

            //In case a user owns a book that is also in another category, ignore the book data in the other category in favor of the version in the user's library
            const booksFromAPI: { [key: Book['isbn']]: Book } = {}
            const unownedBooks = [featured, newReleases, onSale].flat()
            unownedBooks.forEach((book) => {
                booksFromAPI[book.isbn] = book
            })
            library.forEach((book) => {
                booksFromAPI[book.isbn] = book
            })

            //Update local storage any time we fetch fresh data from the API
            saveToStorage(booksFromAPI)
            //Update state
            setBooks(booksFromAPI, () => setLoading(false))
            console.log(`Books loaded from API!`)
        } catch(e){
            console.error(`Error loading books from API: ${e}`)
            throw e
        } finally {
            //Ensure loading is reset to false even in case of errors
            setLoading(false)
        }
    }

    const loadBooks = async () => {
        console.log(`Loading Books...`)
        console.log(`Internet Reachable...? [${isInternetReachable}]`)
        if (isInternetReachable === true || isInternetReachable === null) {
            try {
                await loadFromAPI()
            } catch (e) {
                console.error(`Error loading books from API: ${e}. Falling back to local storage.`)
                await loadFromStorage()
            }
        } else if (isInternetReachable === false) {
            await loadFromStorage()
        }
        await initAllBookTracksDownloadStatus();
    }

    const initAllBookTracksDownloadStatus = async () => {
        const currentBooks = books;
        const updatedBooks: BookStoreState = {}

        for (const [isbn, book] of Object.entries(currentBooks)) {
            if (book.tracks) {
                const updatedTracks = await Promise.all(
                    book.tracks.map(async (track) => {
                        const exists = await trackFileExists(book.isbn, track.name);
                        return {
                            ...track,
                            downloadStatus: exists ? DownloadStatus.DOWNLOADED : DownloadStatus.NOT_DOWNLOADED
                        };
                    })
                );
                updatedBooks[isbn] = { ...book, tracks: updatedTracks };
            } else {
                updatedBooks[isbn] = book;
            }
        }

        setBooks(updatedBooks);
    }

    const getTrackFilePath = (isbn: Book['isbn'], trackName: string) => {
        return `${FileSystem.documentDirectory}books/${isbn}/tracks/${trackName}.mp3`;
    }

    const trackFileExists = async (isbn: Book['isbn'], trackName: string) => {
        const trackFilePath = getTrackFilePath(isbn, trackName);
        const fileInfo = await FileSystem.getInfoAsync(trackFilePath);
        return fileInfo.exists;
    };

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

            return { ...prevBooks, [isbn]: updatedBook };
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
                setTrackDownloadStatus(isbn, track.name, DownloadStatus.NOT_DOWNLOADED);
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

            return { ...prevBooks, [isbn]: updatedBook };
        });
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

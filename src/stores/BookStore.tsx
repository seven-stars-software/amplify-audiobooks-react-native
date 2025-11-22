import AsyncStorage from "@react-native-async-storage/async-storage"
import { ReactNode, createContext, use, useContext, useEffect, useRef, useState } from "react";
import { addEventListener, useNetInfo } from "@react-native-community/netinfo";
import { Book, DownloadStatus } from "types/types";
import AuthContext from "contexts/AuthContext";
import APIClient from "APIClient";
import useCallbackState from "hooks/useCallbackState";
import { Directory, Paths, File } from "expo-file-system";

const BookStoreBucket = '@BookBucket'
const saveToStorage = async (books: BookStoreState) => {
    await AsyncStorage.setItem(`${BookStoreBucket}`, JSON.stringify(books))
}

interface BookStoreContextType {
    books: BookStoreState,
    loadBooks: () => Promise<void>,
    downloadAudioFiles: (isbn: Book['isbn']) => Promise<(File | undefined)[]>,
    removeDownloads: (isbn: Book['isbn']) => Promise<void>,
    trackFileExists: (isbn: Book['isbn'], trackName: string) => boolean,
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
        try {
            const booksDirectory: Directory = new Directory(Paths.document, 'books');
            if (!booksDirectory.exists) {
                console.log(`Creating books directory at ${booksDirectory.uri}`);
                booksDirectory.create();
            }
        } catch (e) {
            console.error(`Error during download setup: ${e}`)
        }
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
        initAllBookTracksDownloadStatus();
    }

    const initAllBookTracksDownloadStatus = () => {
        setBooks(prevBooks => {
            const updatedBooks: BookStoreState = {}
            Object.entries(prevBooks).forEach(([isbn, book]) => {
                const updatedTracks = book.tracks?.map(track => {
                    return {
                        ...track,
                        downloadStatus: trackFileExists(book.isbn, track.name) ? DownloadStatus.DOWNLOADED : DownloadStatus.NOT_DOWNLOADED
                    }
                });
                updatedBooks[isbn] = { ...book, tracks: updatedTracks };
            })
            return updatedBooks;
        });
    }

    const getTrackFile = (isbn: Book['isbn'], trackName: string) => {
        const file = new File(Paths.document, 'books', isbn, 'tracks', trackName + '.mp3');
        return file;
    }

    const trackFileExists = (isbn: Book['isbn'], trackName: string) => {
        const trackFile = getTrackFile(isbn, trackName);
        return trackFile.exists;
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

        const bookTracksDirectory = new Directory(Paths.document, 'books', isbn, 'tracks');
        if (!bookTracksDirectory.exists) {
            console.log(`Creating tracks directory at ${bookTracksDirectory.uri}`);
            bookTracksDirectory.create({ intermediates: true });
        }

        const audioFiles = await Promise.all(tracks.map(async (track) => {
            const fileToBeCreated = getTrackFile(isbn, track.name);
            console.log(`Downloading track [${track.name}] to [${fileToBeCreated.uri}]`)
            let createdFile;
            try {
                //Update track download status in state
                setTrackDownloadStatus(isbn, track.name, DownloadStatus.DOWNLOADING);
                createdFile = await File.downloadFileAsync(track.uri, fileToBeCreated, { idempotent: true }) as File;
                setTrackDownloadStatus(isbn, track.name, DownloadStatus.DOWNLOADED);
            } catch (error) {
                console.error(error);
            }
            return createdFile;
        }));
        return audioFiles;
    }

    const removeDownloads = async (isbn: Book['isbn']) => {
        const bookDirectory = new Directory(Paths.document, 'books', isbn);
        if (bookDirectory.exists) {
            console.log(`Deleting book directory at ${bookDirectory.uri}`);
            bookDirectory.delete();
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

import AsyncStorage from "@react-native-async-storage/async-storage"
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { Book } from "types/types";
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
    const { isInternetReachable } = { isInternetReachable: true } //DEBUG DO NOT COMMIT useNetInfo()
    const [authSeal] = useContext(AuthContext);

    useEffect(() => {
        if (authSeal !== null) {
            loadBooks()
        }
    }, [authSeal])

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
            } else {
                console.log(`No books found in local storage`)
            }
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
            if (!isInternetReachable) throw new Error("Cannot load books from API without network connection")
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
        } finally {
            //Ensure loading is reset to false even in case of errors
            setLoading(false)
        }
    }

    const loadBooks = async () => {
        console.log(`Loading Books...`)
        console.log(`Internet Reachable...? [${isInternetReachable}]`)
        if (isInternetReachable) {
            try {
                return await loadFromAPI()
            } catch (e) {
                return await loadFromStorage()
            }
        } else {
            return await loadFromStorage()
        }
    }

    const getTrackFile = (isbn: Book['isbn'], trackName: string) => {
        return new File(Paths.document, 'books', isbn, 'tracks', trackName + '.mp3');
    }

    const trackFileExists = async (isbn: Book['isbn'], trackName: string) => {
        const trackFile = getTrackFile(isbn, trackName);
        return trackFile.exists;
    };

    const downloadAudioFiles = async (isbn: Book['isbn']) => {
        const book = books[isbn];
        if (!book) {
            throw new Error(`Cannot download audio files for unknown book with ISBN [${isbn}]`)
        }
        const tracks = book.tracks;
        if (!tracks) {
            throw new Error(`Book with ISBN [${isbn}] has no tracks to download`)
        }

        const audioFiles = await Promise.all(tracks.map(async (track) => {
            const fileToBeCreated = getTrackFile(isbn, track.name);
            let createdFile;
            try {
                createdFile = await File.downloadFileAsync(track.uri, fileToBeCreated) as File;
                console.log(`${track.name}: ${createdFile.exists?'exists':'doesnt'}`); // true
                console.log(`   ${createdFile.uri}`); // path to the downloaded file, e.g., '${cacheDirectory}/pdfs/sample.pdf'
            } catch (error) {
                console.error(error);
            }
            return createdFile;
        }));
        return audioFiles;
    }

    return (
        <BookStoreContext.Provider value={{ books, loadBooks, downloadAudioFiles, trackFileExists, loading }}>
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
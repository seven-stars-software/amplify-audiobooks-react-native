import AsyncStorage from "@react-native-async-storage/async-storage"
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { Book } from "types/types";
import AuthContext from "contexts/AuthContext";
import APIClient from "APIClient";
import useCallbackState from "hooks/useCallbackState";

const BookStoreBucket = '@BookBucket'
const saveToStorage = async (books: BookStoreState) => {
    await AsyncStorage.setItem(`${BookStoreBucket}`, JSON.stringify(books))
}

interface BookStoreContextType {
    books: BookStoreState,
    loadBooks: () => void,
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
    const { isConnected } = useNetInfo()
    const [authSeal] = useContext(AuthContext);

    //Load books on first render
    useEffect(() => {
        loadBooks()
    }, [])

    //Destructive overwrite of 'books' state
    const loadFromStorage = async () => {
        setLoading(true)
        try {
            const booksFromStorageJSON = await AsyncStorage.getItem(`${BookStoreBucket}`)
            if (booksFromStorageJSON === null) {
                throw new Error("Could not find books in local storage")
            }
            const booksFromStorage = JSON.parse(booksFromStorageJSON)
            setBooks(booksFromStorage, () => setLoading(false))
        } catch (e) {
            //Ensure loading is reset to false even in case of errors
            setLoading(false)
            throw e;
        }
    }

    //Destructive overwrite of 'books' state
    //Automatically saves to local storage
    const loadFromAPI = async () => {
        setLoading(true)
        try {
            if (!isConnected) throw new Error("Cannot load books from API without network connection")
            if (authSeal === null) throw new Error('Cannot make API call without first loading auth seal')

            const response = await APIClient.getHomeBooks(authSeal);
            if (!response) throw new Error("Could not fetch home books")

            const { library, featured, newReleases, onSale } = response;
            const booksFromAPI: { [key: Book['isbn']]: Book } = {}
            const unownedBooks = [featured, newReleases, onSale].flat()
            unownedBooks.forEach((book) => {
                booksFromAPI[book.isbn] = book
            })
            //In case a user owns a book that is also on-sale or featured, make sure to overwrite the version of the book that came back from the API in the on-sale or featured category since these will not have purchased:true
            library.forEach((book) => {
                booksFromAPI[book.isbn] = book
            })

            //Update local storage any time we fetch fresh data from the API
            saveToStorage(booksFromAPI)
            //Update state
            setBooks(booksFromAPI, ()=>setLoading(false))
        } catch(e){
            //Ensure loading is reset to false even in case of errors
            setLoading(false)
            throw e;
        }
    }

    const loadBooks = () => {
        if (isConnected) {
            loadFromAPI()
        } else {
            loadFromStorage()
        }
    }

    return (
        <BookStoreContext.Provider value={{ books, loadBooks }}>
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
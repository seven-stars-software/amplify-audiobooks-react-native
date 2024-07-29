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
    const { isInternetReachable } = useNetInfo()
    const [authSeal] = useContext(AuthContext);
    const [initialLoadCompleted, setInitialLoadCompleted] = useState(false)

    useEffect(() => {
        if (authSeal !== null && !initialLoadCompleted) {
            loadBooks()
            setInitialLoadCompleted(true)
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

                const sampleBookISBN = Object.keys(booksFromStorage).find((isbn)=>{return booksFromStorage[isbn].purchased}) || ''
                

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
            console.log(`Library Summary: ${JSON.stringify(library, null, 4)}`)

            //In case a user owns a book that is also on-sale or featured, make sure to overwrite the version of the book that came back from the API in the on-sale or featured category since these will not have purchased:true
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
            setBooks(booksFromAPI, ()=>setLoading(false))
        } finally {
            //Ensure loading is reset to false even in case of errors
            setLoading(false)
        }
    }

    const loadBooks = async () => {
        console.log(`Loading Books...`)
        console.log(`Internet Reachable...? [${isInternetReachable}]`)
        //null means an unknown network connection
        if (isInternetReachable) {
            try{
                await loadFromAPI()
            } catch (e){
                loadFromStorage()
            }
        } else {
            loadFromStorage()
        }
    }

    return (
        <BookStoreContext.Provider value={{ books, loadBooks, loading }}>
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
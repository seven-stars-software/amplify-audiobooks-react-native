import APIClient from "APIClient";
import { useLibraryCache } from "caches/LibraryCache";
import AuthContext from "contexts/AuthContext";
import useLoader from "hooks/useLoader";
import { useContext, } from "react";
import { Dimensions, View } from "react-native";
import {
    ActivityIndicator, Text,
} from 'react-native-paper';
import BookList from "./BookList";
import { Cache } from "caches/GenericCache";
import { Book } from "types/types";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const Library = () => {
    const { books, setBooks, lastLoad } = useLibraryCache()
    const [authSeal,] = useContext(AuthContext);

    const loadLibrary = async () => {
        if (!authSeal) throw new Error('Cannot get library without logged in auth seal')
        const response = await APIClient.getLibrary(authSeal);
        if (!response) throw new Error("Could not fetch library")
        const books: Cache<Book> = {}
        response.forEach((book) => { books[book.isbn] = book })
        setBooks(books)
    }

    // If the Library Cache's last load time is null, that means it has never loaded.
    // Show the spinner in the case that the cache has not loaded
    const loading = useLoader(loadLibrary, lastLoad !== null)


    return (
        loading ?
            (
                <ActivityIndicator animating={true} style={{ marginTop: 40 }} />
            ) :
            (
                <BookList
                    header={<Text variant='headlineMedium' style={{ marginBottom: 20 }}>My Library</Text>}
                    items={Object.values(books)}
                    onRefresh={loadLibrary}
                />
            )
    )
}

export default Library;
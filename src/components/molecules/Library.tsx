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
import { useBookStore } from "stores/BookStore";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const Library = () => {
    const { loading, books, loadBooks } = useBookStore()
    const library = Object.values(books).filter((book)=>book.purchased)

    return (
        loading ?
            (
                <ActivityIndicator animating={true} style={{ marginTop: 40 }} />
            ) :
            (
                <BookList
                    header={<Text variant='headlineMedium' style={{ marginBottom: 20 }}>My Library</Text>}
                    items={library}
                    onRefresh={loadBooks}
                />
            )
    )
}

export default Library;
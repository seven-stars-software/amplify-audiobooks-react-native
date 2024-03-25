import { useContext } from "react";
import { Book } from "types/types";
import { Cache, createCacheContext, getCacheProvider } from "./GenericCache";

export const NewReleaseBooksCacheContext = createCacheContext<Book>()
export const useNewReleaseBooksCache = () => {
    const { data, setKeys, clear, lastLoad } = useContext(NewReleaseBooksCacheContext)

    const updateNewReleaseBooks = (newReleaseBooks: Cache<Book>) => {
        setKeys(newReleaseBooks)
    }

    return {
        lastLoad,
        updateNewReleaseBooks,
        newReleaseBooks: data,
        clear
    }
}
export const NewReleaseBooksCacheProvider = getCacheProvider(NewReleaseBooksCacheContext)
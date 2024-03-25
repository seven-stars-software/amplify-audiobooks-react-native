import { useContext } from "react";
import { Book } from "types/types";
import { createCacheContext, getCacheProvider, CacheContextValue, Cache } from "./GenericCache";

export const LibraryCacheContext = createCacheContext<Book>()

type LibraryCacheValue = {
    books: Cache<Book>,
    setBooks: (books: Cache<Book>) => void,
    lastLoad: CacheContextValue<Book>['lastLoad'],
    clear: () => void
}

export const useLibraryCache = (): LibraryCacheValue => {
    const { data, setKeys, clear, lastLoad } = useContext(LibraryCacheContext)
    return {
        books: data,
        setBooks: setKeys,
        lastLoad,
        clear
    }
}
export const LibraryCacheProvider = getCacheProvider(LibraryCacheContext)
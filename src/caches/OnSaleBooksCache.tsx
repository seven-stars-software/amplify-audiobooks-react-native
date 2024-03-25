import { useContext } from "react"
import { Book } from "types/types"
import { Cache, createCacheContext, getCacheProvider } from "./GenericCache"

export const OnSaleBooksCacheContext = createCacheContext<Book>()
export const useOnSaleBooksCache = () => {
    const { data, setKeys, clear, lastLoad } = useContext(OnSaleBooksCacheContext)

    const updateOnSaleBooks = (onSaleBooks: Cache<Book>) => {
        setKeys(onSaleBooks)
    }

    return {
        onSaleBooks: data,
        updateOnSaleBooks,
        lastLoad,
        clear
    }
}
export const OnSaleBooksCacheProvider = getCacheProvider(OnSaleBooksCacheContext)
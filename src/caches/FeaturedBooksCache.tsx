import { useContext } from "react"
import { Book } from "types/types"
import { Cache, createCacheContext, getCacheProvider } from "./GenericCache"

export const FeaturedBooksCacheContext = createCacheContext<Book>()
export const useFeaturedBooksCache = () => {
    const { data, setKeys, clear, lastLoad } = useContext(FeaturedBooksCacheContext)

    const updateFeaturedBooks = (featuredBooks: Cache<Book>) => {
        setKeys(featuredBooks)
    }

    return {
        featuredBooks: data,
        updateFeaturedBooks,
        lastLoad,
        clear
    }
}
export const FeaturedBooksCacheProvider = getCacheProvider(FeaturedBooksCacheContext)
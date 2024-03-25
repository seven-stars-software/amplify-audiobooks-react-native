import { createContext, ReactNode, useState } from "react"
import { DefinedReactState } from "types/types"

export type Cache<Item> = {
    [key: string]: Item
}
export type CacheContextValue<Item> = {
    data: Cache<Item>,
    setKey: (key: string, item: Item) => void,
    setKeys: (partialCache: Cache<Item>) => void,
    clear: () => void,
    lastLoad: number | null //Date.now timestamp
}
export const createCacheContext = <Item extends any = never>(): React.Context<CacheContextValue<Item>> => {
    const context = createContext<CacheContextValue<Item>>({
        data: {},
        setKey: (key: string, item: Item) => { },
        setKeys: (partialCache: Cache<Item>) => { },
        clear: () => { },
        lastLoad: null
    })
    return context;
}

export const getCacheContextValues = <Item,>(
    cacheState: DefinedReactState<Cache<Item>>,
    lastLoadState: DefinedReactState<number | null>
): CacheContextValue<Item> => {
    const [cache, setCache] = cacheState
    const [lastLoad, setLastLoad] = lastLoadState
    const updateLastLoad = () => setLastLoad(Date.now())
    return {
        data: cache,
        setKey: (key: string, item: Item) => {
            setCache((prevCache) => {
                return {
                    ...prevCache,
                    [key]: item
                }
            })
            updateLastLoad()
        },
        setKeys: (partialCache: Cache<Item>) => {
            setCache((prevCache) => {
                return {
                    ...prevCache,
                    ...partialCache
                }
            })
            updateLastLoad()
        },
        clear: () => {
            setCache({});
            setLastLoad(null);
        },
        lastLoad
    }
}
export const getCacheProvider = <Item,>(Context: React.Context<CacheContextValue<Item>>) => {
    const CacheProvider = ({ children }: { children?: ReactNode }) => {
        const cacheState = useState<Cache<Item>>({});
        const loadState = useState<number | null>(null);
        const contextValue = getCacheContextValues<Item>(cacheState, loadState)
        return (
            <Context.Provider value={contextValue}>
                {children}
            </Context.Provider>
        )
    }
    return CacheProvider;
}


const GenericCacheContext = createCacheContext()

export const GenericCacheProvider = getCacheProvider(GenericCacheContext)

export default GenericCacheContext
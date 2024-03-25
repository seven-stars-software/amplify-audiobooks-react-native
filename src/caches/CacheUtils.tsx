import { Cache } from "./GenericCache"

/**
 * 
 * @param keyProperty The name of a property present on every item in the list that can be used as a unique key in the resulting cache object
 * @param list A list of objects, each with a property that can be used as a unique key
 * @returns 
 */
const listToCache = <T extends { [key: string]: any }>(keyProperty: keyof T, list: T[]): Cache<T> => {
    return list.reduce((cache, item) => {
        const key = item[keyProperty];
        if (key === undefined) throw new Error(`Cannot find key property on item!\n Key Property: ${String(keyProperty)}\n Item: ${JSON.stringify(item, null, 4)}`)
        if (key in cache) throw new Error(`Key collision! Each item in the list must have a unique value for the key property\n Key Property: ${String(keyProperty)}\n Problem Key: ${key}`)
        return { ...cache, [key]: item }
    }, {})
}

/**
 * 
 * @param cache A cache object where each item is stored at a unique key
 * @returns A list of all items in the cache
 */
const cacheToList = <T extends { [key: string]: any }>(cache: Cache<T>): T[] => {
    return Object.entries(cache).map(([key, value]) => value)
}


export { listToCache, cacheToList }
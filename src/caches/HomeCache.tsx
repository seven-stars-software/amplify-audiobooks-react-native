import APIClient from "APIClient";
import AuthContext from "contexts/AuthContext";
import useLoader from "hooks/useLoader";
import { useContext, useEffect, useState } from "react";
import { listToCache } from "./CacheUtils";
import { useFeaturedBooksCache } from "./FeaturedBooksCache";
import { useLibraryCache } from "./LibraryCache";
import { useNewReleaseBooksCache } from "./NewReleaseBooksCache";
import { useOnSaleBooksCache } from "./OnSaleBooksCache";

const useHomeCache = () => {
    const [authSeal] = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    const {
        books: libraryBooks,
        setBooks: updateLibraryBooks,
        lastLoad: libraryLastLoad,
        clear: clearLibraryCache
    } = useLibraryCache();
    const {
        newReleaseBooks, updateNewReleaseBooks,
        lastLoad: newReleaseLastLoad,
        clear: clearNewReleaseCache
    } = useNewReleaseBooksCache();
    const {
        featuredBooks,
        updateFeaturedBooks,
        lastLoad: featuredLastLoad,
        clear: clearFeaturedCache
    } = useFeaturedBooksCache();
    const {
        onSaleBooks,
        updateOnSaleBooks,
        lastLoad: onSaleLastLoad,
        clear: clearOnSaleCache
    } = useOnSaleBooksCache();

    const cachesAreLoaded = 
    [libraryLastLoad, newReleaseLastLoad, featuredLastLoad, onSaleLastLoad]
        .every((lastLoad) => lastLoad !== null)
    
    useEffect(() => {
        if (cachesAreLoaded) setLoading(false)
    }, [cachesAreLoaded])

    const loadHomeBooks = async () => {
        if (authSeal === null) throw new Error('Cannot make API call without first loading auth seal')
        const response = await APIClient.getHomeBooks(authSeal);
        if (!response) throw new Error("Could not fetch home books")
        const { library, featured, newReleases, onSale} = response;
        const [libraryCache, featuredCache, newReleaseCache, onSaleBooksCache] = [library, featured, newReleases, onSale].map((list) => {
            return listToCache('isbn', list)
        })
        updateLibraryBooks(libraryCache)
        updateFeaturedBooks(featuredCache)
        updateNewReleaseBooks(newReleaseCache)
        updateOnSaleBooks(onSaleBooksCache)
    }

    const clear = () => {
        clearLibraryCache()
        clearFeaturedCache()
        clearNewReleaseCache()
        clearOnSaleCache()
    }

    useEffect(() => {
        if (authSeal !== null) {
            loadHomeBooks()
        }
    }, [authSeal])

    return {
        loading,
        libraryBooks,
        featuredBooks,
        newReleaseBooks,
        onSaleBooks,
        clear
    }
}

export default useHomeCache
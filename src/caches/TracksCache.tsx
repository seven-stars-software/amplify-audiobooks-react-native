import APIClient from "APIClient";
import AuthContext from "contexts/AuthContext";
import useLoader from "hooks/useLoader";
import { useContext, useEffect, useRef, useState } from "react";
import { Book, Track } from "types/types";
import { createCacheContext, getCacheProvider } from "./GenericCache";


/**
 * The Tracks Cache holds lists of tracks keyed by the ISBN of the book those tracks belong to.
 */

export const TracksCacheContext = createCacheContext<Track[]>()

type LoadingStatusTracker = {
    [isbn: Book['isbn']]: 'loading' | 'loaded'
}

const tracker: LoadingStatusTracker = {}

const useTracksLoader = (book: Book) => {
    const [authSeal,] = useContext(AuthContext);
    const { data, setKey, clear } = useContext(TracksCacheContext)
    const isLoaded = book !== undefined && data[book.isbn] !== undefined

    useEffect(() => {
        const loadTracks = async () => {
            if (!authSeal) throw new Error("Cannot load tracks without auth seal")
            const tracks = await APIClient.getBookTracks({ isbn: book.isbn, seal: authSeal });
            tracker[book.isbn] = 'loaded'
            setKey(book.isbn, tracks)
        }

        const bookTracksAreLoading = tracker[book.isbn] === 'loading'
        if (!isLoaded && !bookTracksAreLoading) {
            tracker[book.isbn] = 'loading'
            loadTracks();
        }
    }, [book])

    return {
        loading: !isLoaded,
        tracks: book ? data[book.isbn] : [],
        clear
    }
}

export const useTracksCache = (book: Book) => {
    return useTracksLoader(book)
}

export const prefetch = async (book: Book) => {
    return useTracksLoader(book)
}

export const TracksCacheProvider = getCacheProvider(TracksCacheContext)
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNetInfo } from "@react-native-community/netinfo"
import APIClient from "APIClient"
import AuthContext from "contexts/AuthContext"
import useCallbackState from "hooks/useCallbackState"
import { ReactNode, createContext, useContext, useState } from "react"
import { Book, Track } from "types/types"

const TrackStoreBucket = '@TrackBucket'

type TrackStoreState = {
    [key: Book['isbn']]: Track
}

const saveToStorage = async (tracks: TrackStoreState) => {
    await AsyncStorage.setItem(`${TrackStoreBucket}`, JSON.stringify(tracks))
}

interface TrackStoreContextType {
    tracks: TrackStoreState,
    loadTracks: (bookISBNs: Book['isbn'][]) => void,
    loading: boolean
}

const TrackStoreContext = createContext<TrackStoreContextType | null>(null);

const TrackStoreProvider = ({ children }: { children?: ReactNode }) => {
    const [tracks, setTracks] = useCallbackState<TrackStoreState>({})
    const [loading, setLoading] = useState(false)
    const { isInternetReachable } = {isInternetReachable: true} //DEBUG DO NOT COMMIT useNetInfo()
    const [authSeal] = useContext(AuthContext);
    const [initialLoadCompleted, setInitialLoadCompleted] = useState(false)

    const loadFromAPI = async (bookISBNs: Book['isbn'][]) => {
        console.log(`Loading Tracks from API...`)
        setLoading(true)
        try {
            if (!isInternetReachable) throw new Error("Cannot load tracks from API without network connection")
            if (authSeal === null) throw new Error('Cannot make API call without first loading auth seal')
            const rawTracks: Track[] = await APIClient.getBookTracks({ isbn: book.isbn, seal: authSeal });

        } catch (e) {
            
            throw e;
        } finally {
            //Ensure loading is reset to false even in case of errors
            setLoading(false)
        }
    }
}

const useTrackStore = () => {
    const contextValue = useContext(TrackStoreContext);
    if (contextValue === null) {
        throw new Error("Attempted use of TrackStoreContext outside of Provider")
    }
    return contextValue
}

export {
    TrackStoreContext,
    TrackStoreProvider,
    useTrackStore
}
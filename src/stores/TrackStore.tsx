import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNetInfo } from "@react-native-community/netinfo"
import AuthContext from "contexts/AuthContext"
import useCallbackState from "hooks/useCallbackState"
import { ReactNode, createContext, useContext, useState } from "react"
import { Book, Track } from "types/types"

const TrackStoreBucket = '@TrackBucket'

type TrackStore = {
    [key: Book['isbn']]: Track
}

const saveToStorage = async (tracks: TrackStore) => {
    await AsyncStorage.setItem(`${TrackStoreBucket}`, JSON.stringify(tracks))
}

interface TrackStoreContextType {
    tracks: TrackStore,
    loadTracks: (bookISBNs: Book['isbn'][]) => void,
    loading: boolean
}

const TrackStoreContext = createContext<TrackStoreContextType | null>(null);

const TrackStoreProvider = ({ children }: { children?: ReactNode }) => {
    const [tracks, setTracks] = useCallbackState<TrackStore>({})
    const [loading, setLoading] = useState(false)
    const { isConnected } = useNetInfo()
    const [authSeal] = useContext(AuthContext);

    const loadFromAPI = async (bookISBNs: Book['isbn'][]) => {
        setLoading(true)
        try {
            
        } catch (e) {
            //Ensure loading is reset to false even in case of errors
            setLoading(false)
            throw e;
        }
    }
}
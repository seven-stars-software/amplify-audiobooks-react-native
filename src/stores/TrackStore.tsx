import useCallbackState from "hooks/useCallbackState";
import { ReactNode, createContext } from "react";
import { Book, Track } from "types/types";

interface TackStoreContextType {
    tracks: TrackStoreState
}

type TrackStoreState = {
    [key: Book['isbn']]: Track[]
}

const TrackStoreContext = createContext<TackStoreContextType | null>(null);

const TrackStoreProvider = ({ children }: { children?: ReactNode }) => {
    const [tracks, setTracks] = useCallbackState<TrackStoreState>({});

    const loadBookTracksFromAPI = (book: Book)=>{
        
    }

    return(
        <TrackStoreContext.Provider value={{tracks}}>
            {children}
        </TrackStoreContext.Provider>
    )
}

import { ActivityIndicator } from 'react-native-paper';

import { Dimensions, FlatList, Pressable, View } from "react-native";
import TrackItem from "./TrackItem";
import { useTracksCache } from "caches/TracksCache";
import { useContext } from "react";
import PlaybackContext from "contexts/PlaybackContext";
import { Book } from 'types/types';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export type Props = {
    book: Book
}
const BookTracks = ({ book }: Props) => {
    const { loading, tracks } = useTracksCache(book)
    const { playBook } = useContext(PlaybackContext);
    const tracksMinusSample = tracks ? tracks.filter((track) => {
        if (track?.isSample) return
        return track
    }) : []

    const pressTrack = (trackNumber: number) => {
        playBook(book, tracks, {trackNumber})
    }

    return (
        <View>
            {
                loading ?
                    (<ActivityIndicator animating={true} />)
                    :
                    tracksMinusSample.map((track, index) => {
                        return (
                            <Pressable key={index} onPress={()=>{pressTrack(index)}}>
                                <TrackItem track={track} key={index} />
                            </Pressable>
                        )
                    })

            }
        </View>
    )
}

export default BookTracks;
import { ActivityIndicator } from 'react-native-paper';

import { Dimensions, FlatList, Pressable, View } from "react-native";
import TrackItem from "./TrackItem";
import { useTracksCache } from "caches/TracksCache";
import { useContext } from "react";
import PlaybackContext from "contexts/PlaybackContext";
import { Book } from 'types/types';
import { useBookStore } from 'stores/BookStore';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export type Props = {
    isbn: Book['isbn']
}
const BookTracks = ({ isbn }: Props) => {
    const { loading, books, loadBooks } = useBookStore()
    const { playBook } = useContext(PlaybackContext);
    const book = books[isbn]
    const { tracks } = book;
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
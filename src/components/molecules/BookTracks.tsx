import { ActivityIndicator } from 'react-native-paper';

import { Dimensions, Pressable, View } from "react-native";
import TrackItem from "./TrackItem";
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
    const { loading, books } = useBookStore()
    const book = books[isbn]

    if (!book) {
        return null;
    }

    let { tracks } = book;
    if(tracks === undefined){
        console.log('No tracks available for book:', book.name)
        console.log(`Does user own book? ${book.purchased?'Yes':'No'}`)
        tracks = [];
    }

    const { playBook } = useContext(PlaybackContext);

    const pressTrack = (trackNumber: number) => {
        playBook(book, book.tracks, {trackNumber})
    }

    return (
        <View>
            {
                loading ?
                    (<ActivityIndicator animating={true} />)
                    :
                    tracks.map((track, index) => {
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
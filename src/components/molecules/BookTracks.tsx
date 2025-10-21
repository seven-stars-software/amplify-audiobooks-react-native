import { ActivityIndicator } from 'react-native-paper';

import { Dimensions, FlatList, Pressable, View } from "react-native";
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
    const { loading: loadingBooks, books, trackFileExists } = useBookStore()
    const book = books[isbn]
    let { tracks } = book;
    if(tracks === undefined){
        console.log('No tracks available for book:', book.name)
        console.log(`Does user own book? ${book.purchased?'Yes':'No'}`)
        tracks = [];
    }
    const tracksWithDownloadStatus = tracks.map(track => {
        return {
            ...track,
            downloaded: trackFileExists(isbn, track.name)
        }
    })
    
    const { playBook } = useContext(PlaybackContext);

    const pressTrack = (trackNumber: number) => {
        playBook(book, tracks, {trackNumber})
    }

    return (
        <View>
            {
                loadingBooks ?
                    (<ActivityIndicator animating={true} />)
                    :
                    tracksWithDownloadStatus.map((track, index) => {
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
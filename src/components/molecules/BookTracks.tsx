import { ActivityIndicator } from 'react-native-paper';

import { Dimensions, Pressable, View } from "react-native";
import TrackItem from "./TrackItem";
import { Book } from 'types/types';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export type Props = {
    tracks: Book['tracks']
    loading?: boolean
    onTrackPress: (trackNumber: number, track: Book['tracks'][0]) => void
}
const BookTracks = ({ tracks = [], loading = false, onTrackPress }: Props) => {
    return (
        <View>
            {
                loading ?
                    (<ActivityIndicator animating={true} />)
                    :
                    tracks.map((track, index) => {
                        return (
                            <Pressable
                                key={index}
                                onPress={() => onTrackPress(index, track)}>
                                <TrackItem track={track} />
                            </Pressable>
                        )
                    })

            }
        </View>
    )
}

export default BookTracks;
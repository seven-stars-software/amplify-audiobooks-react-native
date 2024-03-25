import { Dimensions, View } from "react-native";
import { Text } from 'react-native-paper';


const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    track: Track
}
const TrackItem = ({ track }: Props) => {
    return (
        <View style={{
            paddingVertical: height/32,
            paddingHorizontal: width / 16,
            borderTopWidth: 1,
            borderTopColor: "rgba(0,0,0,0.2)"
        }}>
            <Text variant="bodyLarge">{track.name}</Text>
        </View>
    )
}

export default TrackItem;
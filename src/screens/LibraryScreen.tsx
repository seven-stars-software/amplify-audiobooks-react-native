import TopBanner from "components/atoms/TopBanner";
import Library from "components/molecules/Library"
import useStyles from "hooks/useStyles";
import { Dimensions, View, SafeAreaView } from "react-native"
import { Text } from "react-native-paper";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const LibraryScreen = () => {
    const styles = useStyles();

    return (
        <View style={{
            ...styles.BGColor,
            flex: 1,
        }}>
            <TopBanner />
            <Library />
        </View>
    )
}

export default LibraryScreen
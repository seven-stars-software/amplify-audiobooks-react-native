import TopBanner, { TopBannerHeight } from "components/atoms/TopBanner";
import Library from "components/molecules/Library"
import useStyles from "hooks/useStyles";
import { Dimensions, View, } from "react-native"
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const LibraryScreen = () => {
    const styles = useStyles();

    return (
        <SafeAreaView style={{
            ...styles.BGColor,
            flex: 1,
        }}>
            <TopBanner />
            <Library />
        </SafeAreaView>
    )
}

export default LibraryScreen
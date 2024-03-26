import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParams } from "navigators/RootNavigator";
import { useContext, useEffect } from "react";
import PlaybackContext from "contexts/PlaybackContext";
import useStyles from "hooks/useStyles";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const PlaybackProblemScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
    const globalStyles = useStyles()
    const theme = useTheme();
    const primaryColor = theme.colors.primary

    const { nowPlaying, playBook, pauseBook } = useContext(PlaybackContext)

    const attemptReset = () => {
        if (nowPlaying) {
            playBook(nowPlaying)
        }
        navigation.navigate('Core');
    }

    return (
        <SafeAreaView style={{ ...globalStyles.BGColor, ...styles.ScreenContainer }}>
            <View style={styles.ContentContainer}>
                <View>
                    <Text variant="displayMedium">Playback Error</Text>
                    <Text style={{ marginTop: 10 }} variant="bodyLarge">This can happen when your network connection is interrupted.</Text>
                </View>
                <Pressable style={{ alignItems: 'center', marginTop: 60 }} onPress={attemptReset}>
                    <Icon name="reload" size={64} color={primaryColor} />
                    <Text variant='bodyMedium'>Reset Playback</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    ScreenContainer: {
        display: "flex",
        height: "100%",
        justifyContent: 'center',
        flexDirection: 'column'
    },
    ContentContainer: {
        paddingHorizontal: width / 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
})


export default PlaybackProblemScreen;
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigators/RootNavigator';
import { useContext } from 'react';
import PlaybackContext from 'contexts/PlaybackContext';
import useStyles from 'hooks/useStyles';

const width = Dimensions.get('window').width; //full width

const PlaybackProblemScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
    const globalStyles = useStyles();
    const theme = useTheme();
    const primaryColor = theme.colors.primary;

    const { nowPlaying, playBook } = useContext(PlaybackContext);

    const attemptReset = () => {
        if (nowPlaying && nowPlaying.tracks) {
            console.log(`Resetting playback for book: ${nowPlaying.name}`);
            playBook(nowPlaying, nowPlaying.tracks, { reset: true });
        }
        navigation.navigate('Core');
    };

    return (
        <SafeAreaView style={{ ...globalStyles.BGColor, ...styles.ScreenContainer }}>
            <Pressable
                style={styles.BackButton}
                onPress={() => {
                    navigation.goBack();
                }}
            >
                <AntIcon name="left" size={24} color={theme.colors.primary} />
            </Pressable>
            <View style={styles.ContentContainer}>
                <View>
                    <Text variant="displayMedium">Playback Error</Text>
                    <Text style={{ marginTop: 10 }} variant="bodyLarge">This can happen when your network connection is interrupted.</Text>
                </View>
                <Pressable style={{ alignItems: 'center', marginTop: 60 }} onPress={attemptReset}>
                    <IonIcon name="reload" size={64} color={primaryColor} />
                    <Text variant="bodyMedium">Reset Playback</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    ScreenContainer: {
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
    },
    ContentContainer: {
        paddingHorizontal: width / 16,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    BackButton: {
        width: 24,
        height: 24,
        marginLeft: 20,
        marginBottom: 10,
    },
});


export default PlaybackProblemScreen;

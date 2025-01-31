import { useNavigation } from "@react-navigation/native";
import PlaybackContext from "contexts/PlaybackContext";
import { useCurrentTrack } from "hooks/useCurrentTrack";
import { useContext } from "react";
import { Dimensions, Image, Pressable, StyleSheet, View } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { Surface, Text, ProgressBar, useTheme } from "react-native-paper";
import TrackPlayer, { State as TrackPlayerState, usePlaybackState } from 'react-native-track-player';
import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParams } from "navigators/RootNavigator";
import usePlaybackProgress from "hooks/usePlaybackProgress";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export const nowPlayingCardHeight = 80;

const NowPlayingCard = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
    const theme = useTheme();
    const playerState = usePlaybackState()

    const isPlaying = playerState.state === TrackPlayerState.Playing
    const currentTrack = useCurrentTrack();

    const { position, duration } = usePlaybackProgress()

    const { nowPlaying } = useContext(PlaybackContext);
    if (!nowPlaying) {
        throw new Error("Somehow the NowPlayingCard rendered without an active book in the PlaybackContext")
    }

    const goToNowPlaying = () => {
        navigation.navigate('NowPlaying')
    }

    const togglePlay = () => {
        if (isPlaying) {
            TrackPlayer.pause();
        } else {
            TrackPlayer.play();
        }
    }

    return (
        <Surface style={styles.CardSurface}>
            <Pressable style={styles.PressableContainer} onPress={goToNowPlaying}>

                <Image style={styles.CoverImage} source={{ uri: nowPlaying.images[0] }} />

                <View style={styles.Details}>
                    <Text numberOfLines={1} style={styles.TrackName}>{currentTrack?.title}</Text>
                    <Text numberOfLines={1} style={styles.Book}>{nowPlaying?.name}</Text>
                </View>

                <View style={styles.Controls}>
                    <Pressable onPress={togglePlay}>
                        {isPlaying ?
                            <Icon name="pause-sharp" size={32} color={theme.colors.primary} />
                            : <Icon name="play" size={32} color={theme.colors.primary} />
                        }
                    </Pressable>
                </View>
            </Pressable>
            <View style={styles.Progress}>
                <ProgressBar progress={duration > 0 ? position / duration : 0} color={theme.colors.primary} />
            </View>
        </Surface>
    )
}

const styles = StyleSheet.create({
    CardSurface: {
        height: nowPlayingCardHeight,
        borderRadius: 5,
        justifyContent: 'space-between',
    },
    PressableContainer: {
        padding: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch"
    },
    ImageContainer: {
        height: '100%',
    },
    CoverImage: {
        height: height / 16,
        width: height / 16,
        resizeMode: "contain",
        borderRadius: 10,
    },
    Details: {
        flex: 3,
        marginLeft: 10,
        justifyContent: 'center'
    },
    TrackName: {
        fontSize: width / 30,
        fontWeight: "800",
    },
    Book: {
        marginTop: 5,
    },
    Controls: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    Progress: {
        
    }
})

export default NowPlayingCard;
import { useNavigation } from "@react-navigation/native";
import PlaybackContext from "contexts/PlaybackContext";
import { useCurrentTrack } from "hooks/useCurrentTrack";
import { useContext } from "react";
import { Dimensions, Image, ImageBackground, Pressable, StyleSheet, View } from "react-native";
import {Ionicons} from '@react-native-vector-icons/ionicons'
import { Surface, Text, ProgressBar, useTheme } from "react-native-paper";
import TrackPlayer, { State as TrackPlayerState, usePlaybackState } from 'react-native-track-player';
import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParams } from "navigators/RootNavigator";
import usePlaybackProgress from "hooks/usePlaybackProgress";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export const nowPlayingCardHeight = 70;

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
            <ImageBackground
                resizeMode='cover'
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: nowPlayingCardHeight,
                    overflow: 'hidden',
                }}
                blurRadius={10}
                source={require('@assets/images/fancy-bg-copy.png')}
            >
                <View style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'space-between',
                    paddingHorizontal: nowPlayingCardHeight / 4,
                }}>
                    <Pressable style={styles.PressableContainer} onPress={goToNowPlaying}>

                        <Image style={styles.CoverImage} source={{ uri: nowPlaying.images[0] }} />

                        <View style={styles.Details}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    ...styles.TrackName,
                                    color: theme.colors.onPrimary
                                }}>
                                {currentTrack?.title}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={{
                                    ...styles.Book,
                                    color: theme.colors.onPrimary
                                }}>
                                {nowPlaying?.name}
                            </Text>
                        </View>

                        <View style={styles.Controls}>
                            <Pressable onPress={togglePlay}>
                                {isPlaying ?
                                    <Ionicons name="pause-sharp" size={32} color={theme.colors.onPrimary} />
                                    : <Ionicons name="play" size={32} color={theme.colors.onPrimary} />
                                }
                            </Pressable>
                        </View>
                    </Pressable>
                    <View style={styles.Progress}>
                        <ProgressBar 
                        progress={duration > 0 ? position / duration : 0} 
                        color={theme.colors.onPrimary}
                        theme={{
                            colors:{
                                surfaceVariant: 'rgba(0,0,0,0.2)'
                            }
                        }}
                        />
                    </View>
                </View>
            </ImageBackground>
        </Surface>
    )
}

const styles = StyleSheet.create({
    CardSurface: {
        height: nowPlayingCardHeight,
        borderRadius: nowPlayingCardHeight,
    },
    PressableContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        paddingTop: 10
    },
    ImageContainer: {
        height: '100%',
    },
    CoverImage: {
        height: height / 18,
        width: height / 18,
        resizeMode: "contain",
        borderRadius: 12,
    },
    Details: {
        flex: 3,
        marginLeft: 10,
        justifyContent: 'center',
    },
    TrackName: {
        fontSize: width / 30,
        fontWeight: "800",
    },
    Book: {
        marginTop: 5,
        fontWeight: "500",
    },
    Controls: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    Progress: {
        width: "100%",

    }
})

export default NowPlayingCard;
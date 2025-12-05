import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigators/RootNavigator';
import { useContext } from 'react';
import PlaybackContext from 'contexts/PlaybackContext';
import AutoHeightImage from 'components/atoms/AutoHeightImage';
import usePlaybackProgress from 'hooks/usePlaybackProgress';
import Scrubber from 'react-native-scrubber';

import TrackPlayer, { usePlaybackState, State as TrackPlayerState } from 'react-native-track-player';
import { useCurrentTrack } from 'hooks';
import JumpIcon from 'components/atoms/JumpButton';
import { metadataOptions } from 'services';
import useStyles from 'hooks/useStyles';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const NowPlayingScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
    const globalStyles = useStyles();
    const theme = useTheme();
    const primaryColor = theme.colors.primary;

    const playerState = usePlaybackState();
    const isPlaying = playerState.state === TrackPlayerState.Playing;

    const { nowPlaying } = useContext(PlaybackContext);
    const currentTrack = useCurrentTrack();
    const { position, duration, buffered } = usePlaybackProgress();

    const handleScrub = async (position) => {
        await TrackPlayer.seekTo(position);
    };

    const controlHandlers = {
        skipBack: async () => {
            await TrackPlayer.skipToPrevious();
        },
        skipForward: async () => {
            await TrackPlayer.skipToNext();
        },
        jumpBack: async () => {
            const position = (await TrackPlayer.getPosition()) - metadataOptions.backwardJumpInterval;
            await TrackPlayer.seekTo(position);
        },
        jumpForward: async () => {
            const position = (await TrackPlayer.getPosition()) + metadataOptions.forwardJumpInterval;
            await TrackPlayer.seekTo(position);
        },
        play: async () => {
            await TrackPlayer.play();
        },
        pause: async () => {
            await TrackPlayer.pause();
        },
    };

    return (
        <SafeAreaView style={{...globalStyles.BGColor, ...styles.ScreenContainer}}>
            <Pressable
                style={styles.BackButton}
                onPress={() => {
                    navigation.goBack();
                }}
            >
                <Icon name="down" size={24} color={theme.colors.primary} />
            </Pressable>
            <View style={styles.ContentContainer}>
                <View style={styles.CoverContainer}>
                    <AutoHeightImage
                        source={{ uri: nowPlaying ? nowPlaying.images[0] : '' }}
                        containerWidth={width - width / 8}
                    />
                </View>
                <View style={styles.BookInfo}>
                    <Text variant="headlineSmall">{currentTrack?.title}</Text>
                </View>

                <Scrubber
                    value={position}
                    bufferedValue={buffered}
                    totalDuration={duration}
                    onSlidingComplete={handleScrub}
                    trackColor={primaryColor}
                    scrubbedColor={theme.colors.primary}
                />

                <View style={styles.ControlsContainer}>
                    <Pressable onPress={controlHandlers.skipBack}>
                        <Icon name="stepbackward" size={32} color={primaryColor} />
                    </Pressable>
                    <Pressable onPress={controlHandlers.jumpBack}>
                        <JumpIcon direction="backward" iconProps={{ size: 48, color: theme.colors.primary }} />
                    </Pressable>
                    {isPlaying ?
                        <Pressable onPress={controlHandlers.pause}>
                            <Icon name="pausecircle" size={64} color={primaryColor} />
                        </Pressable>
                        :
                        <Pressable onPress={controlHandlers.play}>
                            <Icon name="play" size={64} color={primaryColor} />
                        </Pressable>
                    }
                    <Pressable onPress={controlHandlers.jumpForward}>
                        <JumpIcon direction="forward" iconProps={{ size: 48, color: primaryColor }} />
                    </Pressable>
                    <Pressable onPress={controlHandlers.skipForward}>
                        <Icon name="stepforward" size={32} color={primaryColor} />
                    </Pressable>
                </View>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    ScreenContainer: {
        display: 'flex',
        height: '100%',
    },
    BackButton: {
        width: 24,
        height: 24,
        marginLeft: 20,
        marginTop: 10,
    },
    ContentContainer: {
        paddingHorizontal: width / 16,
        paddingTop: 20,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    CoverContainer: {
    },
    BookInfo: {
        paddingTop: height / 56,
        paddingBottom: height / 32,
        alignItems: 'center',
    },
    ControlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    PlayPauseButton: {

    },
});


export default NowPlayingScreen;

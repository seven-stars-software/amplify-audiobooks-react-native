
import Icon from 'react-native-vector-icons/AntDesign';
import PlaybackContext from 'contexts/PlaybackContext';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import TrackPlayer, { State as PlayerState, usePlaybackState,} from 'react-native-track-player';
import { Book, DownloadStatus } from 'types/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigators/RootNavigator';
import { useBookStore } from "stores/BookStore";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book,
    size: React.ComponentProps<typeof Icon>['size'],
    isOffline?: boolean,
    onOfflinePlayAttempt?: () => void
}
const PlayBookButton = ({ book, size = 24, isOffline = false, onOfflinePlayAttempt }: Props) => {
    const theme = useTheme();
    const {nowPlaying, playBook} = useContext(PlaybackContext);
    const { loading: loadingBooks, books, } = useBookStore()

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
    const goToNowPlaying = () => {
        navigation.navigate('NowPlaying')
    }

    const [buttonColor, setButtonColor] = useState(theme.colors.primary);

    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const [playOnLoad, setPlayOnLoad] = useState(false)

    const playerState = usePlaybackState()
    const thisBookIsPlaying =
        playerState.state === PlayerState.Playing
        && nowPlaying?.name === book.name

    // Check if all tracks are downloaded (for offline mode)
    const allTracksDownloaded = book.tracks?.every(track => track.downloadStatus === DownloadStatus.DOWNLOADED) ?? false;
    const canPlayOffline = !isOffline || allTracksDownloaded;

    useEffect(() => {
        if (!loadingBooks) {
            setShowLoadingIndicator(false)
        }
        if (playOnLoad){
            togglePlay()
        }
    }, [loadingBooks])

    const pressIn = () => {
        setButtonColor(theme.colors.secondary)
        if (loadingBooks) setShowLoadingIndicator(true)
    }
    const pressOut = () => {
        setButtonColor(theme.colors.primary)
    }

    const togglePlay = ()=>{
        if (thisBookIsPlaying){
            TrackPlayer.pause();
        } else if(!loadingBooks){
            // Check if we can play offline before attempting
            if (!canPlayOffline && onOfflinePlayAttempt) {
                onOfflinePlayAttempt();
                return;
            }
            playBook(book, book.tracks)
        }
    }

    const press = async () => {
        if(loadingBooks){
            setPlayOnLoad(true)
        } else {
            togglePlay()
        }
    }

    return (
        <Pressable
            style={{ flexBasis: 'auto' }}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={press}>
            {thisBookIsPlaying ?
                <Icon name="pausecircle" size={size} color={buttonColor} />
                : <Icon name="play" size={size} color={buttonColor} />}

            {
                showLoadingIndicator ?
                    <ActivityIndicator color={theme.colors.onPrimary} animating={true} size={size} style={{ position: "absolute" }} />
                    : null
            }
        </Pressable>
    )
}

export default PlayBookButton;
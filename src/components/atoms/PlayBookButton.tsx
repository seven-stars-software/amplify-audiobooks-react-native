
import {AntDesign} from "@react-native-vector-icons/ant-design";
import { useTracksCache } from 'caches/TracksCache';
import PlaybackContext from 'contexts/PlaybackContext';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import TrackPlayer, { State as PlayerState, usePlaybackState,} from 'react-native-track-player';
import { Book } from 'types/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigators/RootNavigator';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book,
    size: React.ComponentProps<typeof AntDesign>['size']
}
const PlayBookButton = ({ book, size = 24 }: Props) => {
    const theme = useTheme();
    const {nowPlaying, playBook} = useContext(PlaybackContext);
    const {loading, tracks} = useTracksCache(book)
    
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

    useEffect(() => {
        if (!loading) {
            setShowLoadingIndicator(false)
        }
        if (playOnLoad){
            togglePlay()
        }
    }, [loading])

    const pressIn = () => {
        setButtonColor(theme.colors.secondary)
        if (loading) setShowLoadingIndicator(true)
    }
    const pressOut = () => {
        setButtonColor(theme.colors.primary)
    }

    const togglePlay = ()=>{
        if (thisBookIsPlaying){
            TrackPlayer.pause();
        } else if(!loading){
            playBook(book, tracks)
        }
    }

    const press = async () => {
        if(loading){
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
                <AntDesign name="pause-circle" size={size} color={buttonColor} />
                : <AntDesign name="play-circle" size={size} color={buttonColor} />}

            {
                showLoadingIndicator ?
                    <ActivityIndicator color={theme.colors.onPrimary} animating={true} size={size} style={{ position: "absolute" }} />
                    : null
            }
        </Pressable>
    )
}

export default PlayBookButton;
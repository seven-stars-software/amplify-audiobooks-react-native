
import Icon from 'react-native-vector-icons/Feather';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { Book } from 'types/types';
import { useTracksCache } from 'caches/TracksCache';
import * as FileSystem from 'expo-file-system';
import PlaybackContext from 'contexts/PlaybackContext';
import TrackPlayer from 'react-native-track-player';
import { Audio } from 'expo-av';
import { json } from 'stream/consumers';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book,
    size: React.ComponentProps<typeof Icon>['size']
}
const DownloadBookButton = ({ book, size = 24 }: Props) => {
    const theme = useTheme();
    const [buttonColor, setButtonColor] = useState(theme.colors.primary);

    const { nowPlaying, playBook } = useContext(PlaybackContext);
    const [savedURI, setSavedURI] = useState(null);
    const { loading, tracks } = useTracksCache(book)

    const pressIn = () => {
        setButtonColor(theme.colors.secondary)
    }
    const pressOut = () => {
        setButtonColor(theme.colors.primary)
    }

    const makeLocalBookDirectories = async (book: Book) => {
        const booksDirectoryInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}books`);
        console.log(`Info for ${FileSystem.documentDirectory}books`)
        console.log(JSON.stringify(booksDirectoryInfo, null, 4))
        if('exists' in booksDirectoryInfo && !booksDirectoryInfo.exists){
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}books`)
        }

        const isbnDirectoryInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}books/${book.isbn}`);
        console.log(`Info for ${FileSystem.documentDirectory}books/${book.isbn}`)
        console.log(JSON.stringify(isbnDirectoryInfo, null, 4))
        if('exists' in isbnDirectoryInfo && !isbnDirectoryInfo.exists){
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}books/${book.isbn}`)
        }

        const tracksDirectoryInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}books/${book.isbn}/tracks`);
        console.log(`Info for ${FileSystem.documentDirectory}books/${book.isbn}/tracks`)
        console.log(JSON.stringify(tracksDirectoryInfo, null, 4))
        if('exists' in tracksDirectoryInfo && !tracksDirectoryInfo.exists){
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}books/${book.isbn}/tracks`)
        }
    }

    const onPress = async () => {
        const track = tracks[0];

        //create local directories to store track files
        await makeLocalBookDirectories(book)

        //create downloadable
        const downloadResumable = FileSystem.createDownloadResumable(
            track.uri,
            `${FileSystem.documentDirectory}books/${book.isbn}/tracks/${track.name}.mp3`,
            {},
        );
        //begin download
        const downloadResponse = await downloadResumable.downloadAsync();
        console.log(JSON.stringify(downloadResponse, null, 4))

        const finalFileUri = decodeURI(downloadResponse?.uri || "");
        console.log(`Final File URI: ${finalFileUri}`)

        const dir = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}books/${book.isbn}/tracks/`)
        console.log(`LS: ${JSON.stringify(dir, null, 4)}`)

        const info = await FileSystem.getInfoAsync(finalFileUri);
        console.log(JSON.stringify(info, null, 4))

       
        await TrackPlayer.add({
            id: "1",
            url: finalFileUri,
            title: track.name,
            artist: book.author,
        });
        await TrackPlayer.play();
    }

    useEffect(() => {
        console.log(savedURI)
    }, [savedURI])

    return (
        <Pressable
            style={{ flexBasis: 'auto' }}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={onPress}
        >
            <Icon name="arrow-down-circle" size={size} color={buttonColor} />
        </Pressable>
    )
}

export default DownloadBookButton;
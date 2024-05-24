
import Icon from 'react-native-vector-icons/Ionicons';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, Tooltip, useTheme } from 'react-native-paper';
import { Book, Track } from 'types/types';
import { useTracksCache } from 'caches/TracksCache';
import * as FileSystem from 'expo-file-system';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book,
    size: React.ComponentProps<typeof Icon>['size']
}
const DownloadBookButton = ({ book, size = 24 }: Props) => {
    const theme = useTheme();
    const [buttonColor, setButtonColor] = useState(theme.colors.primary);
    const [showDownloadIndicator, setShowDownloadIndicator] = useState(false);

    const { loading, tracks, downloadTracks } = useTracksCache(book)

    const allTracksDownloaded = tracks?.every((track) => track.downloadStatus === 'downloaded')

    const pressIn = () => {
        setButtonColor(theme.colors.secondary)
    }
    const pressOut = () => {
        setButtonColor(theme.colors.primary)
    }

    const onPress = async () => {
        //Don't do anything if tracks are already downloaded
        if (allTracksDownloaded) {
            return;
        }

        //Otherwise, start book download
        setShowDownloadIndicator(true)
        console.log(`INITIATE BOOK DOWNLOAD`)        
        await downloadTracks()
        console.log(`BOOK DOWNLOAD COMPLETED`)

        //Log download directory
        const dir = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}books/${book.isbn}/tracks/`)
        console.log(`LS: ${JSON.stringify(dir, null, 4)}`)
    }

    return (
        <Pressable
            style={{ flexBasis: 'auto' }}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={onPress}
        >
            {
                allTracksDownloaded ?
                    <Icon name="arrow-down-circle" size={size} color={buttonColor} />
                    : <Icon name="arrow-down-circle-outline" size={size} color={buttonColor} />
            }
            {
                showDownloadIndicator ?
                    <ActivityIndicator color={theme.colors.primary} animating={true} size={size} style={{ position: "absolute" }} />
                    : null
            }
        </Pressable>
    )
}

export default DownloadBookButton;
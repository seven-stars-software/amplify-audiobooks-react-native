
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, Tooltip, useTheme } from 'react-native-paper';
import { Book, Track } from 'types/types';
import { useTracksCache } from 'caches/TracksCache';
import * as FileSystem from 'expo-file-system';
import RemoveDownloadsDialog from './RemoveDownloadsDialog';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book,
    size: React.ComponentProps<typeof Ionicons>['size']
}
const DownloadBookButton = ({ book, size = 24 }: Props) => {
    const theme = useTheme();
    const [buttonColor, setButtonColor] = useState(theme.colors.primary);
    const [showDownloadIndicator, setShowDownloadIndicator] = useState(false);

    const [removalDialogVisible, setRemovalDialogVisible] = useState(false);

    const { loading, tracks, downloadTracks, removeDownloads } = useTracksCache(book)

    const allTracksDownloaded = tracks?.every((track) => track.downloadStatus === 'downloaded')

    const pressIn = () => {
        setButtonColor(theme.colors.secondary)
    }
    const pressOut = () => {
        setButtonColor(theme.colors.primary)
    }

    const onPress = async () => {
        //If tracks are already downloaded, button will open download removal dialog
        if (allTracksDownloaded) {
            setRemovalDialogVisible(true)
            return;
        }

        //Otherwise, start book download
        setShowDownloadIndicator(true)
        console.log(`INITIATE BOOK DOWNLOAD`)
        await downloadTracks()
        console.log(`BOOK DOWNLOAD COMPLETED`)
        setShowDownloadIndicator(false)

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
                    <Ionicons name="checkmark-circle" size={size} color={buttonColor} />
                    : <Ionicons name="arrow-down-circle-outline" size={size} color={buttonColor} />
            }
            {
                showDownloadIndicator ?
                    <ActivityIndicator color={theme.colors.primary} animating={true} size={size} style={{ position: "absolute" }} />
                    : null
            }
            <RemoveDownloadsDialog
                visible={removalDialogVisible}
                setVisible={setRemovalDialogVisible}
                removeDownloads={async ()=>{
                    await removeDownloads()
                    setRemovalDialogVisible(false)
                }}
            />
        </Pressable>
    )
}

export default DownloadBookButton;
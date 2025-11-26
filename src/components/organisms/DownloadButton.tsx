
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, Tooltip, useTheme } from 'react-native-paper';
import { Book, DownloadStatus } from 'types/types';
import RemoveDownloadsDialog from 'components/atoms/RemoveDownloadsDialog';
import { useBookStore } from 'stores/BookStore';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book,
    size: React.ComponentProps<typeof Icon>['size'],
    isOffline?: boolean,
    onOfflineDownloadAttempt?: () => void
}
const DownloadBookButton = ({ book, size = 24, isOffline = false, onOfflineDownloadAttempt }: Props) => {
    const theme = useTheme();
    const [buttonColor, setButtonColor] = useState(theme.colors.primary);
    const [showDownloadIndicator, setShowDownloadIndicator] = useState(false);

    const [removalDialogVisible, setRemovalDialogVisible] = useState(false);

    const {downloadAudioFiles, removeDownloads} = useBookStore()

    // Check if all tracks are downloaded by looking at their download status
    // This reacts to real-time status updates during downloads
    const allTracksDownloaded = book.tracks?.every(track => track.downloadStatus === DownloadStatus.DOWNLOADED) ?? false;

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

        //If offline, show the offline modal instead of attempting download
        if (isOffline && onOfflineDownloadAttempt) {
            onOfflineDownloadAttempt();
            return;
        }

        //Otherwise, start book download
        setShowDownloadIndicator(true)
        console.log(`INITIATE BOOK DOWNLOAD`)
        const audioFiles = await downloadAudioFiles(book.isbn)
        console.log(`BOOK DOWNLOAD COMPLETED`)
        setShowDownloadIndicator(false)
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
                    <Icon name="checkmark-circle" size={size} color={buttonColor} />
                    : <Icon name="arrow-down-circle-outline" size={size} color={buttonColor} />
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
                    await removeDownloads(book.isbn)
                    setRemovalDialogVisible(false)
                }}
            />
        </Pressable>
    )
}

export default DownloadBookButton;
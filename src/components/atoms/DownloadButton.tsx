
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, Tooltip, useTheme } from 'react-native-paper';
import { Book } from 'types/types';
import RemoveDownloadsDialog from './RemoveDownloadsDialog';
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

    const {downloadAudioFiles, removeDownloads, trackFileExists} = useBookStore()

    //State to check if all tracks are downloaded
    const [bookDownloaded, setBookDownloaded] = useState<boolean>(false);
    useEffect(() => {
        const checkAllTracksDownloaded = async () => {
            if(!book.tracks){
                console.log(`Book [${book.name}] has no tracks.`)
                setBookDownloaded(false);
                return;
            }
            const trackDownloadStatuses = await Promise.all(
                book.tracks.map(async (track) => {
                    return trackFileExists(book.isbn, track.name)
                })
            );
            const allTracksDownloaded = trackDownloadStatuses.every(status => status === true);
            setBookDownloaded(allTracksDownloaded || false);
        }
        checkAllTracksDownloaded();
    }, [book]);

    const allTracksDownloaded = bookDownloaded

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
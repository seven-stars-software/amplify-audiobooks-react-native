
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, Tooltip, useTheme } from 'react-native-paper';
import { Book, Track } from 'types/types';
import { useTracksCache } from 'caches/TracksCache';
import * as FileSystem from 'expo-file-system';
import RemoveDownloadsDialog from './RemoveDownloadsDialog';
import { useBookStore } from 'stores/BookStore';

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

    const {downloadAudioFiles, trackFileExists} = useBookStore()

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
                    return await trackFileExists(book.isbn, track.name)
                })
            );
            const allTracksDownloaded = trackDownloadStatuses.every(status => status === true);
            setBookDownloaded(allTracksDownloaded || false);
        }
        checkAllTracksDownloaded();
    }, [book]);

    

    const pressIn = () => {
        setButtonColor(theme.colors.secondary)
    }
    const pressOut = () => {
        setButtonColor(theme.colors.primary)
    }

    const onPress = async () => {
        //If tracks are already downloaded, button will open download removal dialog
        if (bookDownloaded) {
            setRemovalDialogVisible(true)
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
                bookDownloaded ?
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
                    //await removeDownloads()
                    setRemovalDialogVisible(false)
                }}
            />
        </Pressable>
    )
}

export default DownloadBookButton;
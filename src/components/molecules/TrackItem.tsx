import { Dimensions, View } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { DownloadStatus, Track } from 'types/types';


const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height


type DownloadStatusIndicatorProps = {
    track: Track
}
const DownloadStatusIndicator = ({ track }: DownloadStatusIndicatorProps) => {
    const theme = useTheme();
    const size = 24;

    if (track.downloadStatus === DownloadStatus.DOWNLOADED) {
        return <Icon name="checkmark-circle" size={size} color={theme.colors.primary} />;
    } else if (track.downloadStatus === DownloadStatus.DOWNLOADING) {
        return (
            <View>
                <Icon name="arrow-down-circle-outline" size={size} color={theme.colors.primary} />
                <ActivityIndicator color={theme.colors.primary} animating={true} size={size} style={{ position: 'absolute' }} />
            </View>
        );
    } else {
        // Download status is DownloadStatus.NOT_DOWNLOADED or DownloadStatus.FAILED
        return null;
    }
};

type Props = {
    track: Track
}
const TrackItem = ({ track }: Props) => {
    return (
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: height / 32,
            paddingHorizontal: width / 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.2)',
        }}>
            <Text variant="bodyLarge">{track.name}</Text>
            <DownloadStatusIndicator track={track} />
        </View>
    );
};

export default TrackItem;

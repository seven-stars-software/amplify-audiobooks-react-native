import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Dimensions, Image, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Dialog, Portal, Surface, Text, useTheme } from 'react-native-paper';
import BookTracks from "components/molecules/BookTracks";

import Icon from 'react-native-vector-icons/AntDesign';

import { useNavigation } from "@react-navigation/native";
import PlayBookButton from "components/organisms/PlayBookButton";
import { Book, NetworkStatus } from "types/types";
import { HomeStackParams } from "navigators/HomeNavigator";
import { LibraryStackParams } from "navigators/LibraryNavigator";
import { SettingsStackParams } from "navigators/SettingsNavigator";
import useStyles from "hooks/useStyles";
import DownloadButton from "components/organisms/DownloadButton";
import { tabBarPlusNowPlayingHeight } from 'components/organisms/CoreTabBar';
import useNetworkStatus from 'hooks/useNetworkStatus';
import { useState } from "react";
import { useBookStore } from "stores/BookStore";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export type BookScreenParams = { book: Book }
type Props = NativeStackScreenProps<{ 'Book': BookScreenParams }, 'Book'>

const BookScreen = ({ route }: Props) => {
    const globalStyles = useStyles()
    const theme = useTheme();
    const { book: routeBook } = route.params;

    // Get fresh book data from BookStore to react to download status changes
    const { books } = useBookStore();
    const book = books[routeBook.isbn] || routeBook;

    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParams | LibraryStackParams | SettingsStackParams>>();

    const networkStatus = useNetworkStatus();
    const isOffline = networkStatus === NetworkStatus.OFFLINE;
    const [offlineModalVisible, setOfflineModalVisible] = useState(false);

    const showOfflineModal = () => setOfflineModalVisible(true);
    const hideOfflineModal = () => setOfflineModalVisible(false);

    const openProductPage = () => {
        Linking.openURL(book.permalink);
    }

    return (
        <SafeAreaView style={{ ...globalStyles.BGColor, ...styles.ScreenContainer }}>
            <Pressable
                style={styles.BackButton}
                onPress={() => {
                    navigation.goBack()
                }}
            >
                <Icon name="left" size={24} color={theme.colors.primary} />
            </Pressable>
            <ScrollView>
                <View style={styles.ContentContainer}>
                    <View style={styles.CoverContainer}>
                        <Image style={styles.BookCover} source={{ uri: book.images[0] }} />
                    </View>
                    <View style={styles.BookInfo}>
                        <View style={{ flex: 1, paddingRight: 5 }}>
                            <Text variant="headlineMedium">{book.name}</Text>
                            <Text variant="titleLarge">{book.author}</Text>
                        </View>
                        <PlayBookButton book={book} size={width / 6} isOffline={isOffline} onOfflinePlayAttempt={showOfflineModal} />
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Button
                            mode="contained"
                            onPress={openProductPage}
                            style={styles.ReviewButton}>
                            Write a Review
                        </Button>
                        <View style={{ paddingLeft: 5,  }}>
                            <DownloadButton book={book} size={width / 10} isOffline={isOffline} onOfflineDownloadAttempt={showOfflineModal} />
                        </View>

                    </View>
                </View>
                <Surface elevation={2} style={styles.ChaptersContainer}>
                    <BookTracks isbn={book.isbn} isOffline={isOffline} onOfflinePlayAttempt={showOfflineModal} />
                </Surface>
            </ScrollView>
            <Portal>
                <Dialog visible={offlineModalVisible} onDismiss={hideOfflineModal}>
                    <Dialog.Icon icon="wifi-off" size={width/10} />
                    <Dialog.Title style={{ textAlign: 'center' }}>It Appears You're Offline</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyLarge" style={{ marginBottom: 10, textAlign: 'center' }}>
                            Sorry, we can't access this book offline because it hasn't been downloaded to your device yet.
                        </Text>
                        <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
                        When you reconnect to the internet, you can listen to this book or download if for offline listening.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideOfflineModal}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    ScreenContainer: {
        display: "flex",
        height: "100%"
    },
    ContentContainer: {
        paddingHorizontal: width / 16,
        marginBottom: 14,
    },
    BookInfo: {
        flexDirection: "row",
        alignItems: 'center',
        paddingTop: height / 56,
        paddingBottom: height / 56,
    },
    ReviewButton: {
        margin: 4,
        flexGrow: 1,
        height: 40,
        paddingBottom: 0
    },
    BackButton: {
        width: 24,
        height: 24,
        marginLeft: 20,
        marginBottom: 10
    },
    CoverContainer: {
        display: "flex",
        flexDirection: 'row',
    },
    BookCover: {
        resizeMode: 'contain',
        flex: 1,
        aspectRatio: 1,
        borderRadius: 10,
    },
    ChaptersContainer: {
        flex: 1,
        paddingVertical: 20,
        marginBottom: tabBarPlusNowPlayingHeight
    }
})


export default BookScreen;
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Dimensions, Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import BookTracks from "components/molecules/BookTracks";

import Icon from 'react-native-vector-icons/AntDesign';

import { useNavigation } from "@react-navigation/native";
import PlayBookButton from "components/atoms/PlayBookButton";
import { Book } from "types/types";
import { HomeStackParams } from "navigators/HomeNavigator";
import { LibraryStackParams } from "navigators/LibraryNavigator";
import { SettingsStackParams } from "navigators/SettingsNavigator";
import useStyles from "hooks/useStyles";
import DownloadButton from "components/atoms/DownloadButton";
import { tabBarPlusNowPlayingHeight } from 'components/molecules/CoreTabBar';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export type BookScreenParams = { book: Book }
type Props = NativeStackScreenProps<{ 'Book': BookScreenParams }, 'Book'>

const BookScreen = ({ route }: Props) => {
    const globalStyles = useStyles()
    const theme = useTheme();
    const { book } = route.params;

    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParams | LibraryStackParams | SettingsStackParams>>();

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
                        <PlayBookButton book={book} size={width / 6} />
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
                            <DownloadButton book={book} size={width / 10} />
                        </View>

                    </View>
                </View>
                <Surface elevation={2} style={styles.ChaptersContainer}>
                    <BookTracks isbn={book.isbn} />
                </Surface>
            </ScrollView>
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
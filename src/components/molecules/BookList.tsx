import BookCard from "components/atoms/BookCard";
import CatalogLinkListItem from "components/atoms/CatalogLinkListItem";
import { ReactNode, ReactPropTypes, useContext, useState } from "react";
import { Dimensions, FlatList, Linking, RefreshControl, StyleSheet, View } from "react-native";
import { MD3Theme, Text, useTheme } from "react-native-paper";
import { Book } from "types/types";
import { tabBarHeight, tabBarPlusNowPlayingHeight } from "components/organisms/CoreTabBar";
import LayoutContext from "contexts/LayoutContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParams } from "navigators/RootNavigator";
import URLs from "URLs";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type BookListProps = {
    items: Book[],
    onRefresh: () => Promise<void>,
    header?: React.ComponentProps<typeof FlatList>['ListHeaderComponent']
}
const BookList = ({ items, onRefresh, header }: BookListProps) => {
    const [{topBannerHeight}] = useContext(LayoutContext);
    const theme = useTheme();
    const styles = makeStyles(theme)
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();

    const handleRefresh = async () => {
        setRefreshing(true)
        await onRefresh()
        setRefreshing(false)
    }

    const handleBookPress = (book: Book) => {
        navigation.navigate('Book', { book });
    };

    return (
        <FlatList
            data={items}
            renderItem={({ item }) => {
                return (<BookCard book={item} onPress={() => handleBookPress(item)} />)
            }}
            ListEmptyComponent={
                <Text style={styles.EmptyText} variant='bodyLarge'>Looks like you don't have any books yet!</Text>
            }
            ListFooterComponent={ListFooterComponent}
            ListHeaderComponent={header}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    title="Reload"
                    tintColor={theme.colors.primary}
                    titleColor={"black"}
                    progressViewOffset={topBannerHeight}
                />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 20
            }}
        />
    )
}

const ListFooterComponent = () => {
    const openCatalog = () => {
        Linking.openURL(URLs.CatalogURL);
    };

    return(
        <View style={{
            marginBottom: tabBarPlusNowPlayingHeight
        }}>
            <CatalogLinkListItem onPress={openCatalog} />
        </View>
    )
}

const makeStyles = (paperTheme: MD3Theme) => {
    return StyleSheet.create({
        EmptyText: {
            textAlign: "center",
            marginBottom: 6
        },
        Button: {
            margin: 4,
            backgroundColor: paperTheme.colors.primary
        },
        ButtonText: {
            color: paperTheme.colors.onPrimary
        }
    })
}


export default BookList;
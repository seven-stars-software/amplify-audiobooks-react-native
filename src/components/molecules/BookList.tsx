import BookCard from "components/atoms/BookCard";
import CatalogLinkListItem from "components/atoms/CatalogLinkListItem";
import { topBannerHeight } from "components/atoms/TopBanner";
import { ReactNode, ReactPropTypes, useState } from "react";
import { Dimensions, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { MD3Theme, Text, useTheme } from "react-native-paper";
import { Book } from "types/types";
import { tabBarHeight, tabBarPlusNowPlayingHeight } from "./CoreTabBar";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type BookListProps = {
    items: Book[],
    onRefresh: () => Promise<void>,
    header?: React.ComponentProps<typeof FlatList>['ListHeaderComponent']
}
const BookList = ({ items, onRefresh, header }: BookListProps) => {
    const theme = useTheme();
    const styles = makeStyles(theme)
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true)
        await onRefresh()
        setRefreshing(false)
    }

    return (
        <FlatList
            data={items}
            renderItem={({ item }) => {
                return (<BookCard book={item} />)
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
    return(
        <View style={{
            marginBottom: tabBarPlusNowPlayingHeight
        }}>
            <CatalogLinkListItem />
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
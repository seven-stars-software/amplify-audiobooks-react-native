import BookCard from "components/atoms/BookCard";
import CatalogLinkListItem from "components/atoms/CatalogLinkListItem";
import { TopBannerHeight } from "components/atoms/TopBanner";
import { ReactNode, ReactPropTypes, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { MD3Theme, Text, useTheme } from "react-native-paper";
import { Book } from "types/types";

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
            ListEmptyComponent={<Text style={styles.EmptyText} variant='bodyLarge'>Looks like you don't have any books yet!</Text>}
            ListFooterComponent={<CatalogLinkListItem />}
            ListHeaderComponent={header}
            onRefresh={handleRefresh}
            refreshing={refreshing} 
            progressViewOffset={TopBannerHeight}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: TopBannerHeight,
                paddingBottom: 20
            }}
        />
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
import BookTile from "components/atoms/BookTile";
import { FlatList, StyleSheet, View } from "react-native";
import { Book } from "types/types";

type Props = {
    books: Book[],
    booksAreInLibrary?: boolean,
    FooterComponent?: React.ComponentProps<typeof FlatList>['ListFooterComponent']
}
const BooksSideScroll = ({ books, booksAreInLibrary, FooterComponent }: Props) => {

    const BookItem = ({ item }: { item: Book }) => {
        return <BookTile style={styles.Tile} book={item} inLibrary={booksAreInLibrary} key={item.isbn} />
    }

    return (
        <FlatList
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            data={books}
            renderItem={BookItem}
            ListHeaderComponent={MarginHeader}
            ListFooterComponent={FooterComponent}
            ItemSeparatorComponent={Separator}
        />
    )
}

const MarginHeader = () => {
    return <View style={{ marginLeft: 20 }}></View>
}

const Separator = () => {
    return <View style={{ marginLeft: 5 }}></View>
}

const styles = StyleSheet.create({
    Container: {
        justifyContent: 'space-between'
    },
    Tile: {
        marginRight: 20
    }
})

export default BooksSideScroll;
import BookTile from 'components/molecules/BookTile';
import { FlatList, Linking, StyleSheet, View } from 'react-native';
import { Book } from 'types/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigators/RootNavigator';

type Props = {
    books: Book[],
    booksAreInLibrary?: boolean,
    FooterComponent?: React.ComponentProps<typeof FlatList>['ListFooterComponent']
}
const BooksSideScroll = ({ books, booksAreInLibrary, FooterComponent }: Props) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();

    const handleBookPress = (book: Book) => {
        if (booksAreInLibrary) {
            navigation.navigate('Book', { book });
        } else {
            Linking.openURL(book.permalink);
        }
    };

    const BookItem = ({ item }: { item: Book }) => {
        return <BookTile style={styles.Tile} book={item} onPress={() => handleBookPress(item)} key={item.isbn} />;
    };

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
    );
};

const MarginHeader = () => {
    return <View style={{ marginLeft: 20 }} />;
};

const Separator = () => {
    return <View style={{ marginLeft: 5 }} />;
};

const styles = StyleSheet.create({
    Container: {
        justifyContent: 'space-between',
    },
    Tile: {
        marginRight: 20,
    },
});

export default BooksSideScroll;

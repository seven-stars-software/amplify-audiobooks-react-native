import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Text as PaperText, useTheme } from 'react-native-paper';
import { Surface } from 'react-native-paper';
import { Book } from 'types/types';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book
    onPress?: () => void
}
const BookCard = ({ book, onPress }: Props) => {
    const theme = useTheme();

    return (
        <Pressable onPress={onPress}>
            <Surface elevation={2} style={styles.CardSurface}>

                <View style={styles.Cover} >
                    <Image style={styles.CoverImage} source={{ uri: book.images[0] }}  />
                </View>
                <View style={styles.Details}>
                    <View style={styles.TitleAndAuthor}>
                        <Pressable onPress={onPress}>
                            <PaperText variant="titleMedium" ellipsizeMode='tail' numberOfLines={1}>{book.name}</PaperText>
                        </Pressable>
                        <Text style={{...styles.Author, color: theme.colors.primary}}>by {book.author}</Text>
                    </View>
                    <Text style={{color: theme.colors.secondary}}>{book.duration}</Text>
                </View>
            </Surface>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    CardSurface: {
        padding: 10,
        flexDirection: "row",
        justifyContent: 'flex-start',
        borderRadius: 5,
        marginBottom: 20
    },
    Cover: {
        width: width/4,
        height: width/4,
        //flex: 2,
    },
    CoverImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 10,
    },
    Details: {
        flex: 3,
        marginLeft: 10,
        justifyContent: 'space-between'
    },
    TitleAndAuthor: {

    },
    Author: {
        marginTop: 5,
    },
})

export default BookCard;
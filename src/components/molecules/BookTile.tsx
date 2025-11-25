import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dimensions, Image, Linking, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Text as PaperText, useTheme } from 'react-native-paper';
import { Book } from 'types/types';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book,
    inLibrary?: boolean,
    style?: ViewStyle
}
const BookTile = ({ book, inLibrary, style }: Props) => {
    const theme = useTheme();
    const navigation = useNavigation();

    const handlePress = () => {
        if (inLibrary) {
            // Navigator type is unknowable
            // @ts-ignore
            navigation.navigate('Book', { book })
        } else {
            Linking.openURL(book.permalink)
        }
    }

    return (
        <Pressable onPress={handlePress} style={{ ...styles.Container, ...style }}>

            <View style={styles.Cover} >
                <Image style={styles.CoverImage} source={{ uri: book.images[0] }} />
            </View>
            <View style={styles.Details}>
                <View>
                    <Pressable onPress={handlePress}>
                        <PaperText variant="titleMedium" numberOfLines={1}>{book.name}</PaperText>
                    </Pressable>
                    <Text style={{color: theme.colors.secondary, ...styles.Author}} numberOfLines={1}>{book.author}</Text>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    Container: {
        flexDirection: "column",
        justifyContent: 'flex-start',
        width: (width / 3)
    },
    Cover: {
        width: width / 3,
        height: width / 3,
    },
    CoverImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 10,
    },
    Details: {
        paddingTop: 10,
        justifyContent: 'space-between'
    },
    Author: {
        
    },
})

export default BookTile;
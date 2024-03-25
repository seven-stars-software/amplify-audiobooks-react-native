import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LibraryScreenParams } from 'navigators/LibraryNavigator';
import { Dimensions, Image, Linking, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MD3Theme, Text as PaperText, useTheme } from 'react-native-paper';
import { Book } from 'types/types';
import URLs from 'URLs';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    style?: ViewStyle
}
const BookTile = ({ style }: Props) => {
    const theme = useTheme();
    const styles = makeStyles(theme)

    const openCatalog = () => {
        Linking.openURL(URLs.CatalogURL)
    }

    return (
        <Pressable onPress={openCatalog} style={{ ...styles.Container, ...style }}>

            <View style={styles.Cover} >
                <PaperText style={styles.Plus} variant="displayLarge">+</PaperText>
            </View>
            <View style={styles.Details}>
                <PaperText variant="titleSmall" >Discover New Audiobooks!</PaperText>
            </View>
        </Pressable>
    )
}

const makeStyles = (paperTheme: MD3Theme) => {
    return StyleSheet.create({
        Container: {
            flexDirection: "column",
            justifyContent: 'flex-start',
            width: (width / 3)
        },
        Cover: {
            width: width / 3,
            height: width / 3,
            borderWidth: 5,
            borderStyle: 'dashed',
            borderRadius: 10,
            borderColor: paperTheme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center'
        },
        Plus:{
            color: paperTheme.colors.primary
        },
        Details: {
            justifyContent: 'space-between'
        },
        TitleAndAuthor: {

        },
        Author: {
            marginTop: 5,
            color: '#7b00ff'
        },
        Duration: {
            color: '#666666'
        }
    })
}

export default BookTile;
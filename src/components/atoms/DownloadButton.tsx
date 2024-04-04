
import Icon from 'react-native-vector-icons/Feather';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { Book } from 'types/types';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Props = {
    book: Book,
    size: React.ComponentProps<typeof Icon>['size']
}
const DownloadBookButton = ({ book, size = 24 }: Props) => {
    const theme = useTheme();

    const [buttonColor, setButtonColor] = useState(theme.colors.primary);

    const pressIn = () => {
        setButtonColor(theme.colors.secondary)
    }
    const pressOut = () => {
        setButtonColor(theme.colors.primary)
    }

    const onPress = () => {
        
    }

    return (
        <Pressable
            style={{ flexBasis: 'auto' }}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={onPress}
        >
            <Icon name="arrow-down-circle" size={size} color={buttonColor} />
        </Pressable>
    )
}

export default DownloadBookButton;
import { Text, useTheme } from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Dimensions, Linking, Pressable, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type IconLib = 'Material' | 'Ion'

type Props = {
    iconLib: IconLib,
    iconName: React.ComponentProps<typeof MaterialIcon>['name'] | React.ComponentProps<typeof IonIcon>['name'],
    label?: string,
    url?: string,
    screenName?: string
}
const IconNavButton = ({iconLib, iconName, label, url, screenName}: Props) => {
    const navigation = useNavigation();
    const theme = useTheme()

    const handlePress = () => {
        if(url){
            Linking.openURL(url)
        } else if(screenName){
            // Navigator cannot be statically typed. Varies at runtime depending on usage of this component.
            // @ts-ignore
            navigation.navigate(screenName)
        }
    }

    const Icon = ({lib}: {lib: IconLib}) => {
        switch(lib){
            case 'Material':
                return <MaterialIcon name={iconName} size={36} color={theme.colors.primary} />
            case 'Ion':
                return <IonIcon name={iconName} size={36} color={theme.colors.primary} />
        }
    }

    return(
        <Pressable onPress={handlePress} style={styles.Container}>
            <Icon lib={iconLib} />
            <Text variant='labelLarge'>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    Container:{
        width: width/3,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default IconNavButton;
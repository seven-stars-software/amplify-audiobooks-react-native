import LogoImageSource from '@assets/images/black-and-white-logo.png'
import styler from "styler/styler"
import { Dimensions, StyleSheet, Text, View } from "react-native"
import AnimatedBG from 'components/molecules/AnimatedBG'
import RegisterForm from 'components/molecules/RegisterForm'
import { ScrollView } from 'react-native-gesture-handler'

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const RegisterScreen = ({ navigation }: any) => {

    return (
        <View style={styles.ScreenContainer}>
            <AnimatedBG />
            <ScrollView
                contentContainerStyle={styles.ScrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <LogoContainer>
                    <LogoImage source={LogoImageSource} />
                </LogoContainer>
                <RegisterForm />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    ScreenContainer: {
        alignItems: "center",
        width: width,
        minHeight: height
    },
    ScrollContainer: {
        alignItems: 'center',
        marginTop: height / 6,
        width: width
    }
})

const LogoContainer = styler.View({
    height: 120,
    width: 120,
    marginVertical: 20,
    padding: 20,
    alignItems: 'center',

    borderRadius: 60,
    //backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 3
})

const LogoImage = styler.Image({
    flex: 1,
    resizeMode: 'contain',
})

export default RegisterScreen
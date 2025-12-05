import LogoImageSource from '@assets/images/logo-bw.png';
import styler from 'styler/styler';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import LoginForm from 'components/organisms/LoginForm';
import AnimatedBG from 'components/molecules/AnimatedBG';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const LoginScreen = ({ navigation: _navigation }: any) => {

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
                <LoginForm />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    ScreenContainer: {
        alignItems: 'center',
        width: width,
        height: height,
    },
    ScrollContainer: {
        alignItems: 'center',
        marginTop: height / 6,
        width: width,
    },
});

const LogoContainer = styler.View({
    height: 120,
    width: 120,
    marginVertical: 20,
    padding: 20,
    alignItems: 'center',

    borderRadius: 60,
    //backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 3,
});

const LogoImage = styler.Image({
    flex: 1,
    resizeMode: 'contain',
});

export default LoginScreen;

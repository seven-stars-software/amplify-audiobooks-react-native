import { Image, View } from 'react-native';
import { Text } from 'react-native-paper';

const SplashLogo = () => {
    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
        }}>
            <Image style={{
                width: 120,
                height: 100,
            }} source={require('@assets/images/logo-bw.png')} />

            <Text style={{
                fontSize: 48,
                fontFamily: 'GlacialIndifference-Bold',
                color: 'white',
                width: 300,
                textAlign: 'center',
            }}>AMPlify</Text>
            <Text style={{
                fontSize: 26,
                fontFamily: 'GlacialIndifference-Bold',
                color: 'white',
                width: 300,
                textAlign: 'center',
                marginTop: -10,
            }}>Audiobooks</Text>
        </View>
    );
};

export default SplashLogo;

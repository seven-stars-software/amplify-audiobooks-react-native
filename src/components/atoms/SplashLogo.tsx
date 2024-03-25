import { Image, View } from "react-native"
import { ActivityIndicator, Text, useTheme } from "react-native-paper"
import { Circle, Text as SvgText, Path, TextPath, TSpan, G, Svg }
    from 'react-native-svg';


const TextOnPath = () => {
    return (
        <Svg style={{ position: 'absolute', borderWidth: 0 }} height="300" width="300"
            viewBox="0 0 400 400">
            <G id="curve">
                <Path d="M 0 0 C 50 400, 350 400, 400 0" stroke="black" strokeWidth={0} fill="transparent" />
            </G>
            <SvgText fill="#fff" fontSize="46" fontFamily="Shrikhand" letterSpacing={8}>
                <TextPath href="#curve" startOffset="32%" spacing="auto" >
                    <TSpan dx={0} dy={0}>
                        Amplify
                    </TSpan>
                </TextPath>
            </SvgText>
        </Svg>
    )
}

const SplashLogo = () => {
    const theme = useTheme();

    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
        }}>
            <Image style={{
                width: 120,
                height: 100
            }} source={require('@assets/images/black-and-white-logo.png')} />

            <Text style={{
                fontSize: 48,
                fontFamily: 'Shrikhand',
                color: 'white',
                width: 300,
                textAlign: 'center',
            }}>AMPlify</Text>
            <Text style={{
                fontSize: 30,
                fontFamily: 'Shrikhand',
                color: 'white',
                width: 300,
                textAlign: 'center',
                marginTop: -20,
            }}>Audiobooks</Text>
        </View>
    )
}

export default SplashLogo
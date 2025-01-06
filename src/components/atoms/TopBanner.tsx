import { Image, ImageBackground, Text, View, SafeAreaView } from "react-native"


const logoHeight = 1255
const logoWidth = 1526
const ratio = logoWidth / logoHeight

export const TopBannerHeight = 100

const TopBanner = () => {
    return (
        <View style={{
            width: "100%",
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0)',
            position: 'absolute',
            zIndex: 2,

            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
            shadowColor: 'black'
        }}>
            <ImageBackground
                resizeMode='cover'
                style={{
                    height: "100%",
                    width: "110%",
                    alignItems: 'center',
                    borderBottomLeftRadius: 100,
                    borderBottomRightRadius: 100,
                    overflow: "hidden",
                }}
                source={require('@assets/images/fancy-bg.png')}
            >
                <SafeAreaView>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingBottom: 10,
                        height: TopBannerHeight,
                    }}>
                    <Image style={{
                        width: 40 * ratio,
                        height: 40,
                        
                    }} source={require('@assets/images/logo-bw.png')} />

                    <Text style={{
                        fontSize: 24,
                        fontFamily: 'GlacialIndifference-Bold',
                        color: 'white',
                        textAlign: 'center',
                        
                    }}>AMPlify</Text>
                    <Text style={{
                        fontSize: 12,
                        fontFamily: 'GlacialIndifference-Bold',
                        color: 'white',
                        textAlign: 'center',
                        marginTop: -6,
                        
                    }}>Audiobooks</Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    )
}

export default TopBanner
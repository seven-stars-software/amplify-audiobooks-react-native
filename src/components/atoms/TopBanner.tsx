import { Image, ImageBackground, SafeAreaView, Text, View } from "react-native"


const logoHeight = 1255
const logoWidth = 1526
const ratio = logoWidth / logoHeight

export const TopBannerHeight = 140

const TopBanner = () => {
    return (
        <View style={{
            height: TopBannerHeight,
            width: "100%",
            alignItems: 'center', 
            backgroundColor: 'rgba(0,0,0,0)',
            position: 'absolute',
            zIndex: 2,
            
            shadowOffset: {width: 1, height: 1},
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
                    borderBottomLeftRadius: 400,
                    borderBottomRightRadius: 400,
                    overflow: "hidden",
                }}
                source={require('@assets/images/fancy-bg.png')}
            >
                <SafeAreaView style={{
                    marginBottom: 5,
                    display: 'flex',
                    height: '100%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                </SafeAreaView>
            </ImageBackground>
        </View>
    )
}

export default TopBanner
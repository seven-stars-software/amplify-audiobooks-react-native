import LayoutContext from "contexts/LayoutContext"
import { useContext, useLayoutEffect, useRef } from "react"
import { Image, ImageBackground, Text, View, SafeAreaView, useWindowDimensions } from "react-native"

const logoHeight = 1255
const logoWidth = 1526
const ratio = logoWidth / logoHeight

const TopBanner = () => {
    const bannerRef = useRef<View>(null)
    const [layout, setLayout] = useContext(LayoutContext);

    useLayoutEffect(() => {
        bannerRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setLayout({topBannerHeight: height})
        });
    }, []);

    return (
        <View ref={bannerRef} style={{
            position: 'absolute',
            zIndex: 2,
            width: '100%',

            display: "flex",
            justifyContent: "center",
            alignItems: 'center',

            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
            shadowColor: 'black',

            backgroundColor: 'transparent',
        }}>
            <ImageBackground
                resizeMode='cover'
                style={{
                    width: "100%",
                    height: "100%",
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
                        justifyContent: 'center',
                        paddingBottom: 10,
                        height: "100%",
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
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import useHomeCache from "caches/HomeCache"
import SplashLogo from "components/atoms/SplashLogo"
import AuthContext from "contexts/AuthContext"
import useWelcome, { WelcomeStatus } from "hooks/useWelcome"
import { RootStackParams } from "navigators/RootNavigator"
import { useContext, useEffect, useRef, useState } from "react"
import { ImageBackground, View } from "react-native"
import { Text, useTheme } from "react-native-paper"
import { SetupService } from "services"

type Props = NativeStackScreenProps<RootStackParams>

const quips = [
    "Thanks for AMPlify-ing an author's impact!",
    "Fetching your audiobooks off the shelf!",
    "Thanks for using The Equitable Audiobook Platform!",
    "Every listen helps to AMPlify an author's impact!",
    "Feeding Starving Authors",
    "Adopt a starving author today!",
    "No Authors = No Audiobooks!",
    "Audiobooks: When reading is just too hard",
    "Bury Me with an Audiobook",
    `Building Community
One audiobook at a time`
]

const SplashScreen = ({ navigation }: Props) => {
    const theme = useTheme()

    const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
    const [authSeal,] = useContext(AuthContext);
    const loggedIn = useRef(authSeal !== null);
    loggedIn.current = authSeal !== null

    //Random starting index in the quips array
    const [quipsIndex, setQuipsIndex] = useState(Math.floor(Math.random() * quips.length));

    const { welcomeStatus } = useWelcome();

    const ready = useRef(isPlayerReady && welcomeStatus !== undefined);
    ready.current = isPlayerReady && welcomeStatus !== undefined;

    // Warm up caches
    useHomeCache()


    const navigateToFirstScreen = () => {
        if (welcomeStatus === WelcomeStatus.incomplete) navigation.navigate('Welcome')
        else if (!loggedIn.current) navigation.navigate('Login')
        else navigation.navigate('Core')
    }

    useEffect(() => {
        async function run() {
            const isSetup = await SetupService();
            setIsPlayerReady(isSetup);
        }
        run();

        let timeout: NodeJS.Timeout;
        const setReadyAfterTimeout = (ms: number) => {
            timeout = setTimeout(() => {
                console.log(`ready check timeout ${ms}: ready? ${ready.current}`)
                if (ready.current) {
                    //navigateToFirstScreen()
                } else {
                    setReadyAfterTimeout(1000)
                }
            }, ms)
        }
        setReadyAfterTimeout(2000)

        return () => clearTimeout(timeout)
    }, []);

    return (
        <View style={{
            flex: 1,
            backgroundColor: theme.colors.background,
        }}>
            <ImageBackground
                resizeMode='cover'
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                source={require('@assets/images/fancy-bg.png')}>
                <View style={{ alignItems: 'center' }}>
                    <SplashLogo />
                    <View style={{marginTop: 20, paddingHorizontal: 20}}>
                        <Text
                            style={{
                                color: "white",
                                textAlign: 'center',
                                fontSize: 32,
                                lineHeight: 24,
                                fontFamily: 'NanumPen-Regular',
                                paddingVertical: 10
                            }}>
                            {quips[quipsIndex]}
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </View>
    )
}

export default SplashScreen
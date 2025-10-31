import { NativeStackScreenProps } from "@react-navigation/native-stack"
import SplashLogo from "components/atoms/SplashLogo"
import AuthContext from "contexts/AuthContext"
import useWelcome, { WelcomeStatus } from "hooks/useWelcome"
import { RootStackParams } from "navigators/RootNavigator"
import { useContext, useEffect, useRef, useState } from "react"
import { ImageBackground, View } from "react-native"
import { Text, useTheme } from "react-native-paper"
import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from "react-native-track-player"

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

export const TrackPlayerSetupOptions = {
  android: {
    appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
  },
  forwardJumpInterval: 15,
  backwardJumpInterval: 15,
  progressUpdateEventInterval: 10,
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
    Capability.JumpForward,
    Capability.JumpBackward,
    Capability.SeekTo,
  ],
  compactCapabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
  ],
}

const SplashScreen = ({ navigation }: Props) => {
    const theme = useTheme()

    const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
    const [authSeal,] = useContext(AuthContext);
    const loggedIn = authSeal !== null;

    //Random starting index in the quips array
    const [quipsIndex, setQuipsIndex] = useState(Math.floor(Math.random() * quips.length));

    const { welcomeStatus } = useWelcome();

    const ready = isPlayerReady && welcomeStatus !== undefined;


    const navigateToFirstScreen = () => {
        if (welcomeStatus === WelcomeStatus.incomplete) navigation.navigate('Welcome')
        else if (!loggedIn) navigation.navigate('Login')
        else navigation.navigate('Core')
    }

    useEffect(() => {
        const SetupService = async (): Promise<boolean> => {
          let isSetup = false;
          try {
            // this method will only reject if player has not been setup yet
            console.log(JSON.stringify(Object.keys(TrackPlayer), null, 4))
            if(typeof TrackPlayer.getCurrentTrack === 'function'){
                console.log(`getCurrentTrack is available`);
            }
            if(typeof TrackPlayer.setupPlayer === 'function'){
                console.log(`setupPlayer is available`);
            }
            if(typeof TrackPlayer.getActiveTrackIndex === 'function'){
                console.log(`getActiveTrackIndex is available`);
            }
            await TrackPlayer.setupPlayer();
            await TrackPlayer.getActiveTrackIndex();
            await TrackPlayer.updateOptions(TrackPlayerSetupOptions);
            isSetup = true;
          } catch(e) {
            console.error("TrackPlayer setup error:", e);
          } finally {
            // eslint-disable-next-line no-unsafe-finally
            return isSetup;
          }
        };
        

        async function run() {
            const isSetup = await SetupService();
            setIsPlayerReady(isSetup);
        }
        run();

        let timeout: NodeJS.Timeout;
        const setReadyAfterTimeout = (ms: number) => {
            timeout = setTimeout(async () => {
                console.log(`ready check timeout ${ms}: ready? ${ready}`)
                if (ready) {
                    navigateToFirstScreen()
                } else {
                    const isSetup = await SetupService();
                    setIsPlayerReady(isSetup);
                    setReadyAfterTimeout(2000)
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
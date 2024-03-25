import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "screens/LoginScreen";
import CoreTabs from "./CoreTabs";
import NowPlayingScreen from "screens/NowPlayingScreen";
import WelcomeNavigator from "./WelcomeNavigator";
import SplashScreen from "screens/SplashScreen";
import RegisterScreen from "screens/RegisterScreen";
import PlaybackProblemScreen from "screens/PlaybackProblemScreen";

export type RootStackParams = {
    'Splash': undefined,
    'Core': undefined,
    'Login': undefined,
    'Register': undefined,
    'Welcome': undefined,
    'NowPlaying': undefined,
    'PlaybackProblem': undefined
}


const RootStack = createNativeStackNavigator<RootStackParams>();

const RootNavigator = () => {
    return (
        <RootStack.Navigator>
            <RootStack.Screen
                name="Splash"
                component={SplashScreen}
                options={{ headerShown: false, freezeOnBlur: true }}
            />

            <RootStack.Screen
                name="Core"
                component={CoreTabs}
                options={{ headerShown: false }}
            />

            <RootStack.Screen
                name="NowPlaying"
                component={NowPlayingScreen}
                options={{ headerShown: false, gestureDirection: 'vertical' }}
            />

            <RootStack.Screen
                name="PlaybackProblem"
                component={PlaybackProblemScreen}
                options={{ headerShown: false, gestureDirection: 'vertical', gestureEnabled: false }}
            />

            <RootStack.Screen
                name="Welcome"
                component={WelcomeNavigator}
                options={{ headerShown: false }}
            />

            <RootStack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />

            <RootStack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
            />       
            
        </RootStack.Navigator>
    )
}

export default RootNavigator
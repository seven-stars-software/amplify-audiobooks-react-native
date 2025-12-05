import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStartedScreen from 'screens/Welcome/GetStartedScreen';
import CreatorsScreen from 'screens/Welcome/CreatorsScreen';

export type WelcomeStackParams = {
    CreatorsFirst: undefined,
    GetStarted: undefined,
}

const WelcomeStack = createNativeStackNavigator<WelcomeStackParams>();

const WelcomeNavigator = () => {
    return(
        <WelcomeStack.Navigator screenOptions={{ headerShown: false }}>
            <WelcomeStack.Screen name="CreatorsFirst" component={CreatorsScreen} />
            <WelcomeStack.Screen name="GetStarted" component={GetStartedScreen} />
        </WelcomeStack.Navigator>
    );
};

export default WelcomeNavigator;

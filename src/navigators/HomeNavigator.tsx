import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookScreen, { BookScreenParams } from 'screens/BookScreen';
import HomeScreen from 'screens/HomeScreen';

export type HomeStackParams = {
    'Home': undefined
    'Book': BookScreenParams
}

const HomeStack = createNativeStackNavigator<HomeStackParams>();

const HomeNavigator = () => {
    return(
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Home" component={HomeScreen} />
            <HomeStack.Screen name="Book" component={BookScreen} />
        </HomeStack.Navigator>
    );
};

export default HomeNavigator;

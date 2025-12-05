import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookScreen, { BookScreenParams } from 'screens/BookScreen';
import LibraryScreen from 'screens/LibraryScreen';

export type LibraryStackParams = {
    'Library': undefined
    'Book': BookScreenParams
}

const LibraryStack = createNativeStackNavigator<LibraryStackParams>();

const LibraryNavigator = () => {
    return(
        <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
            <LibraryStack.Screen name="Library" component={LibraryScreen} />
            <LibraryStack.Screen name="Book" component={BookScreen} />
        </LibraryStack.Navigator>
    );
};

export default LibraryNavigator;

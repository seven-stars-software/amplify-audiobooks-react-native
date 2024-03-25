import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookScreen, { BookScreenParams } from "screens/BookScreen";
import SearchScreen from "screens/SearchScreen";
import SettingsScreen from "screens/SettingsScreen";

export type SettingsStackParams = {
    'Settings': undefined
    'Book': BookScreenParams
}

const SettingsStack = createNativeStackNavigator<SettingsStackParams>();

const SettingsNavigator = () => {
    return (
        <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
            <SettingsStack.Screen name="Settings" component={SettingsScreen} />
            <SettingsStack.Screen name="Book" component={BookScreen} />
        </SettingsStack.Navigator>
    )
}

export default SettingsNavigator
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CoreTabBar from "components/organisms/CoreTabBar";
import HomeNavigator from "./HomeNavigator";
import LibraryNavigator from "./LibraryNavigator";
import SettingsNavigator from "./SettingsNavigator";

const Tab = createBottomTabNavigator();

export type TabParamList = {
    HomeTab: undefined,
    LibraryTab: undefined,
    SettingsTab: undefined,
}

const CoreTabsNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={({ state, descriptors, navigation, insets }: BottomTabBarProps) => {
                return <CoreTabBar
                    state={state}
                    descriptors={descriptors}
                    navigation={navigation}
                    insets={insets} />
            }}
            screenOptions={{
                headerShown: false,
            }}
            backBehavior='history'
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="LibraryTab"
                component={LibraryNavigator}
                options={{ tabBarLabel: 'Library' }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsNavigator}
                options={{ tabBarLabel: 'Settings' }}
            />
        </Tab.Navigator >
    )
}

export default CoreTabsNavigator;

import Icon from 'react-native-vector-icons/Ionicons';
import { BottomTabBarProps, BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ReactNode, useContext } from "react";
import { ImageBackground, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import NowPlayingCard from './NowPlayingCard';
import { TabParamList } from 'navigators/CoreTabs';
import PlaybackContext from 'contexts/PlaybackContext';
import theme from 'styler/theme';

type RouteName = BottomTabScreenProps<TabParamList>['route']['name']

type args = {
    focused: boolean,
    routeName: RouteName,
    [key: string]: any
}
const TabIcon = ({ focused, routeName, color }: args) => {
    const routeToIconMap: { [key in RouteName]: React.ComponentProps<typeof Icon>['name'] } = {
        'HomeTab': focused ? 'home' : 'home-outline',
        'LibraryTab': focused ? 'book' : 'book-outline',
        'SettingsTab': focused ? 'settings' : 'settings-outline'
    }
    return (
        <Icon
            name={routeToIconMap[routeName]}
            size={24}
            color={color}
        />
    )
}

export const tabBarHeight = 100;

const CoreTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {

    const theme = useTheme();
    const { nowPlaying } = useContext(PlaybackContext)

    return (
        <View style={{
            position: 'absolute',
            bottom: 0,
            height: tabBarHeight,
            width: "100%",

            backgroundColor: 'transparent',
        }}>
            {
                nowPlaying ?
                    <View style={styles.NowPlayingContainer}>
                        <NowPlayingCard />
                    </View> :
                    null
            }
            <ImageBackground
                resizeMode='cover'
                style={{
                    width: "100%",
                    height: "100%",
                    alignItems: 'center',
                    borderTopLeftRadius: 100,
                    borderTopRightRadius: 100,
                    overflow: "hidden",
                }}
                source={require('@assets/images/fancy-bg.png')}
            >
                <View style={{
                    height: '100%',
                    width: "100%",
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    
                    paddingHorizontal: 20
                }}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;

                        const isFocused = state.index === index;
                        const color = isFocused ? theme.colors.primary : theme.colors.onPrimary;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({
                                type: 'tabLongPress',
                                target: route.key,
                            });
                        };

                        return (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarTestID}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isFocused ? theme.colors.background : 'transparent',
                                    borderRadius: 100,
                                    width: 80,
                                    height: 60,
                                    
                                }}
                                key={index}
                            >
                                <TabIcon focused={isFocused} routeName={route.name as RouteName} color={color} />
                                <Text style={{ color }}>
                                    {label as ReactNode}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    NowPlayingContainer: {
        position: 'absolute',
        top: '-100%',
        width: "100%",
        paddingHorizontal: 5,
    },
    TabItem: {
        
    }
})

export default CoreTabBar
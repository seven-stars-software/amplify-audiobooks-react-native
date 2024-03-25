
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomTabBarProps, BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ReactNode, useContext } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import NowPlayingCard from './NowPlayingCard';
import { TabParamList } from 'navigators/CoreTabs';
import PlaybackContext from 'contexts/PlaybackContext';
import useStyles from 'hooks/useStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RouteName = BottomTabScreenProps<TabParamList>['route']['name']

type args = {
    focused: boolean,
    routeName: RouteName,
    [key: string]: any
}
const TabIcon = ({ focused, routeName, color }: args) => {
    const routeToIconMap: { [key in RouteName]: React.ComponentProps<typeof Icon>['name'] } = {
        'HomeTab': focused?'home':'home-outline',
        'LibraryTab': focused?'book':'book-outline',
        'SettingsTab': focused?'settings':'settings-outline'
    }
    return (
        <Icon
            name={routeToIconMap[routeName]}
            size={24}
            color={color}
        />
    )
}

const CoreTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const globalStyles = useStyles()
    const theme = useTheme();
    const { nowPlaying } = useContext(PlaybackContext)
    const insets = useSafeAreaInsets()

    return (
        <View style={{backgroundColor: theme.colors.background}}>
            {
                nowPlaying ?
                    <View style={styles.NowPlayingContainer}>
                        <NowPlayingCard />
                    </View> :
                    null
            }
            <Surface style={{paddingBottom: insets.bottom>0?insets.bottom:10, ...styles.TabsContainer}}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;
                    const color = isFocused ? theme.colors.primary : theme.colors.secondary

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
                            style={styles.TabItem}
                            key={index}
                        >
                            <TabIcon focused={isFocused} routeName={route.name as RouteName} color={color} />
                            <Text style={{ color }}>
                                {label as ReactNode}
                            </Text>
                        </Pressable>
                    );
                })}
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    NowPlayingContainer: {
        paddingTop: 5,
        paddingHorizontal: 5,
    },
    TabsContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
    },
    TabItem: {
        alignItems: 'center',
        flex: 1
    }
})

export default CoreTabBar
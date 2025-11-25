import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import AuthContext from "contexts/AuthContext";
import { RootStackParams } from "navigators/RootNavigator";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Linking, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Button, Divider, List, Modal, Portal, Text, useTheme } from "react-native-paper"
import APIClient from 'APIClient';
import UserContext from 'contexts/UserContext';
import MainScreenContainer from 'components/molecules/MainScreenContainer';
import { tabBarPlusNowPlayingHeight } from 'components/organisms/CoreTabBar';
import LayoutContext from 'contexts/LayoutContext';
import useDevSettings from 'hooks/useDevSettings';

const BugReportFormURL = 'https://form.asana.com/?k=aL3z-9pBJ-WVl37kGN9CkQ&d=234782228840442'
const PrivacyPolicyURL = 'https://proaudiovoices.com/privacy-policy/'

const ArrowIcon = () => {
    const theme = useTheme()
    return (
        <Icon name="chevron-forward" color={theme.colors.onBackground} size={20} />
    )
}

type Props = NativeStackScreenProps<RootStackParams>

const SettingsScreen = ({ navigation }: Props) => {
    const [{topBannerHeight}] = useContext(LayoutContext);
    const theme = useTheme()
    const [user, setUser] = useContext(UserContext)
    const [authSeal, setAuthSeal, deleteAuthSeal] = useContext(AuthContext)
    const [loggingOut, setLoggingOut] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [accountDeleted, setAccountDeleted] = useState(false)
    const { devSettings, updateDevSettings, isDev } = useDevSettings()

    const logout = async () => {
        setLoggingOut(true)
        await deleteAuthSeal()
        await setUser(null)
        hideModal()
        setLoggingOut(false)
    }

    useEffect(() => {
        const goToLogin = async () => {
            await logout()
            navigation.navigate('Login')
        }
        if (accountDeleted) {
            goToLogin()
        }
    }, [accountDeleted, navigation])

    const showModal = () => setModalVisible(true);
    const hideModal = () => setModalVisible(false);

    const holdAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

    const holdTimeMS = 3000

    const startPressHoldAnim = () => {
        Animated.timing(holdAnim, {
            toValue: 1,
            duration: holdTimeMS,
            useNativeDriver: false,
        }).start();
    }
    const resetPressHoldAnim = () => {
        Animated.timing(holdAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false,
        }).start();
    }

    const startAccountDeletion = async () => {
        setDeleteLoading(true)
        await APIClient.deleteAccount({ userID: user?.wpUser?.id })
        setDeleteLoading(false)
        setAccountDeleted(true)
    }

    const handleLogout = async () => {
        await logout()
        navigation.navigate('Login')
    }

    const openBugReport = () => {
        Linking.openURL(BugReportFormURL)
    }

    const openPrivacyPolicy = () => {
        Linking.openURL(PrivacyPolicyURL)
    }

    const promptForAccountDeletion = () => {
        showModal()
    }

    return (
        <MainScreenContainer>
            <View style={{ 
                paddingHorizontal: 20, 
                paddingTop: topBannerHeight + 20,
                marginBottom: tabBarPlusNowPlayingHeight
                }}>
                <Text style={{
                    fontWeight: "900"
                }} variant="headlineMedium">Settings</Text>
                <List.Section>
                    <List.Item title="Report a Bug" onPress={openBugReport} right={ArrowIcon} />
                    <Divider />
                    <List.Item title="Privacy Policy" onPress={openPrivacyPolicy} right={ArrowIcon} />
                    <Divider />
                    <List.Item title="Delete Account" onPress={promptForAccountDeletion} right={ArrowIcon} />
                </List.Section>
                {isDev && (
                    <>
                        <Text style={{
                            fontWeight: "900",
                            marginTop: 20
                        }} variant="headlineMedium">Dev Settings</Text>
                        <List.Section>
                            <List.Item
                                title="Simulate Offline Mode"
                                description="Override network state to test offline functionality"
                                right={() => (
                                    <Pressable onPress={() => updateDevSettings({ simulateOffline: !devSettings.simulateOffline })}>
                                        <Text>{devSettings.simulateOffline ? 'ON' : 'OFF'}</Text>
                                    </Pressable>
                                )}
                            />
                        </List.Section>
                    </>
                )}
                <Button mode='contained' onPress={handleLogout} loading={loggingOut}>Logout</Button>
            </View>
            <Portal>
                <Modal
                    contentContainerStyle={{
                        padding: 20,
                        margin: 20,
                        backgroundColor: theme.colors.errorContainer,
                    }}
                    visible={modalVisible}
                    onDismiss={hideModal}
                >
                    <Text
                        style={{ color: theme.colors.error, textAlign: 'center' }}
                        variant='titleLarge'
                    >
                        ⚠️ Warning ⚠️
                    </Text>
                    <Text
                        style={{ color: theme.colors.error, marginBottom: 20, textAlign: 'center' }}
                        variant='bodyLarge'
                    >
                        Are you sure you want to delete your account? This is permanent and cannot be undone.
                    </Text>
                    <View>
                        <View style={{ marginBottom: 10 }}>
                            {
                                accountDeleted ?
                                    <Text variant='bodyLarge' style={{ color: theme.colors.error, textAlign: 'center' }}>Account Deleted</Text> :
                                    (
                                        deleteLoading ?
                                            <ActivityIndicator
                                                color={theme.colors.error}
                                                animating={true}
                                                size={20}
                                            />
                                            :
                                            <Animated.View
                                                style={{
                                                    height: 10,
                                                    width: holdAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ["0%", "100%"]
                                                    }),
                                                    backgroundColor: theme.colors.error,
                                                    borderRadius: 5,
                                                }}
                                            ></Animated.View>
                                    )
                            }
                        </View>
                        <Button
                            mode='elevated'
                            textColor={theme.colors.error}
                            style={{ marginBottom: 20 }}
                            onPressIn={() => {
                                console.log(`On Press In: ${(new Date()).toTimeString()}`)
                                startPressHoldAnim()
                            }}
                            onPress={() => { console.log(`HELLO`) }}
                            delayLongPress={holdTimeMS}
                            onLongPress={startAccountDeletion}
                            onPressOut={resetPressHoldAnim}
                        >
                            Press and Hold to Delete Account
                        </Button>
                    </View>
                    <Button
                        buttonColor={theme.colors.onError}
                        textColor={theme.colors.error} mode='contained'
                        onPress={() => {
                            hideModal()
                            resetPressHoldAnim()
                        }}
                    >
                        Nevermind
                    </Button>
                </Modal>
            </Portal>
        </MainScreenContainer>
    )
}

export default SettingsScreen
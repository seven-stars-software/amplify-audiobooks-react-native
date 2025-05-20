import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useWelcome from "hooks/useWelcome";
import { WelcomeStackParams } from "navigators/WelcomeNavigator";
import { Dimensions, Image, SafeAreaView, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import Screen from "./Screen";
import { useContext } from "react";
import LayoutContext from "contexts/LayoutContext";

const CreatorsScreen = ({ navigation }: NativeStackScreenProps<WelcomeStackParams>) => {
    const [{topBannerHeight}] = useContext(LayoutContext);
    const theme = useTheme();
    const { skipWelcome } = useWelcome();

    const goToNextScreen = () => {
        navigation.navigate('GetStarted')
    }

    const goToLogin = () => {
        skipWelcome()
        navigation.navigate('Login')
    }

    return (
        <Screen>
            <View style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: topBannerHeight + 40,
                alignItems: 'center',
            }}>
                <Text style={{
                    fontSize: 40,
                    fontFamily: 'Shrikhand',
                    color: 'white',
                    textAlign: 'center',
                }}>
                    Did you know...
                </Text>
                <Text variant='headlineMedium' style={{
                    textAlign: 'left',
                }}>
                    Typically, most of what you spend on audiobooks never reaches the author.
                </Text>
                <Text variant='headlineSmall' style={{
                    textAlign: 'right',
                    marginTop: 40,
                    fontWeight: '600'
                }}>
                    By listening on AMPlify{"\n"} you're helping change the world of audiobooks one story at a time!
                </Text>
                <View style={{
                    marginTop: 40,
                }}>
                    <Button onPress={goToNextScreen} mode='contained'>Next</Button>
                    <Button onPress={goToLogin}>Skip</Button>
                </View>
            </View>
        </Screen>
    )
}

export default CreatorsScreen;
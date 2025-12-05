import { View } from 'react-native';
import Screen from './Screen';
import { Button, Text } from 'react-native-paper';
import useWelcome from 'hooks/useWelcome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigators/RootNavigator';

const GetStartedScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
    const {completeWelcome} = useWelcome();

    const goToRegistration = () => {
        completeWelcome();
        navigation.navigate('Register');
    };

    const goToLogin = () => {
        completeWelcome();
        navigation.navigate('Login');
    };

    return (
        <Screen>
            <View style={{
                flex: 1,
                paddingHorizontal: 20,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text variant="headlineLarge" style={{
                    textAlign: 'center',
                    marginBottom: 20,
                }}>Create an account to get started!</Text>
                <Button onPress={goToRegistration} mode="contained">Create Account</Button>
                <Text variant="headlineSmall" style={{
                    textAlign: 'center',
                    marginTop: 40,
                    marginBottom: 10,
                }}>Already have an audiobook?</Text>
                <Button onPress={goToLogin} mode="contained">Login</Button>
            </View>
        </Screen>
    );
};

export default GetStartedScreen;

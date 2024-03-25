import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParams } from "navigators/RootNavigator";
import { createContext, ReactNode, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { MD3Theme, Text, useTheme } from "react-native-paper";
import theme from "styler/theme";

type ThrowContainer = {
    thrown: unknown,
    caught: boolean
}

type ErrorContextValue = {
    handleThrown: (e: unknown) => void,
    handlePlaybackError: (e: unknown) => void
}
const ErrorContext = createContext<ErrorContextValue>({
    handleThrown: (e: unknown) => { },
    handlePlaybackError: (e: unknown) => { }
});

export const ErrorContextProvider = ({ children }: { children?: ReactNode }) => {
    const [{ thrown, caught }, setThrowContainer] = useState<ThrowContainer>({ thrown: undefined, caught: false });
    const theme = useTheme();
    const styles = makeStyles(theme);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();

    const handleThrown = (thrown: unknown) => {
        setThrowContainer({
            thrown,
            caught: true
        });
    }

    const handlePlaybackError = (e: unknown) => {
        navigation.navigate('PlaybackProblem');
    }

    let error;
    if (thrown instanceof Error) {
        error = thrown;
    } else if(caught) {
        // This can happen if some code throws something that's not an Error
        // Yes, it's possible. You can `throw 'Flowers'`. IDK. 
        error = new Error();
    }

    return (
        <ErrorContext.Provider value={{ handleThrown, handlePlaybackError }}>
            {
                error ?
                    <SafeAreaView style={styles.Container}>
                        <ScrollView style={{ padding: 20 }}>
                            <Text style={styles.Text} variant="displaySmall">Oops! Something went wrong</Text>
                            <Text style={styles.Text} variant="bodyLarge">{error.name !== error.message ? error.name : null}</Text>
                            <Text style={styles.Text} variant="bodyLarge">{error.message}</Text>
                            <Text style={styles.Text} variant="bodyLarge">{error.stack}</Text>
                        </ScrollView>
                    </SafeAreaView>
                    : children
            }
        </ErrorContext.Provider>
    )
}


const makeStyles = (paperTheme: MD3Theme) => {
    return StyleSheet.create({
        Container:{
            backgroundColor: 'black'
        },
        Text:{
            color: 'white'
        },
    })
}


export default ErrorContext;
import { Button, List, useTheme, Text, MD3Theme } from 'react-native-paper';
import { useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, TextInput, View, Linking, Keyboard } from "react-native";

import APIClient from "APIClient";
import AuthContext from "contexts/AuthContext";
import UserContext from "contexts/UserContext";

import theme from "styler/theme";
import ErrorContext from 'contexts/ErrorContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigators/RootNavigator';
import URLs from 'URLs'
import Icon from 'react-native-vector-icons/MaterialIcons';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height



type Fields = {
    username: string,
    password: string
}

const LoginForm = () => {
    const [authSeal, setAuthSeal] = useContext(AuthContext);
    const [user, setUser] = useContext(UserContext)

    const [isLoading, setIsLoading] = useState(false)
    const [loginFailed, setLoginFailed] = useState(false)
    const [passwordVisible, setPasswordVisibile] = useState(false);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>()

    const { handleThrown } = useContext(ErrorContext)

    const theme = useTheme();
    const styles = makeStyles(theme)

    const passwordInputRef = useRef<TextInput>(null);

    const [fields, setFields] = useState<Fields>({ username: "", password: "" });
    const onChange = (fieldName: string, value: string) => {
        setFields(
            (prevFields) => {
                const newFields = { ...prevFields, [fieldName]: value }
                return newFields
            }
        )
    }

    useEffect(() => {
        if (isLoading) setLoginFailed(false)
    }, [isLoading])

    useEffect(() => {
        if (authSeal !== null) navigation.navigate('Core')
    }, [authSeal])

    const handleLogin = async () => {
        Keyboard.dismiss()
        setIsLoading(true)
        try {
            const res = await APIClient.login({ username: fields.username, password: fields.password })
            if (!res?.success) {
                setLoginFailed(true)
            }
            //Set Auth Seal
            const newAuthSeal = res?.seal || null
            if(newAuthSeal == null) throw new Error("No auth seal returned")
            setAuthSeal(newAuthSeal)

            //Set WP User
            const wpUser = res?.wpUser
            console.log(JSON.stringify(wpUser, null, 4))
            setUser(
                (prevUser) =>
                    ({ ...prevUser, wpUser })
            )

            setIsLoading(false)
        } catch (e) {
            handleThrown(e)
        }
    }

    const resetPassword = () => {
        Linking.openURL(URLs.ResetPasswordURL)
    }

    const createAccount = () => {
        navigation.navigate('Register')
    }

    return (
        <View style={styles.FormContainer}>
            <View style={styles.InputWrapper}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Username"
                    placeholderTextColor={'grey'}
                    onChangeText={(value) => {
                        onChange('username', value)
                    }}
                    returnKeyType='next'
                    autoCorrect={false}
                    onSubmitEditing={() => passwordInputRef?.current?.focus()}
                />
            </View>
            <View style={styles.InputWrapper}>
                <TextInput
                    style={styles.TextInput}
                    placeholderTextColor={'grey'}
                    secureTextEntry={!passwordVisible}
                    onChangeText={(value) => {
                        onChange('password', value)
                    }}
                    autoCorrect={false}
                    placeholder="Password"
                    returnKeyType='done'
                    onSubmitEditing={handleLogin}
                    ref={passwordInputRef}
                />
                <Pressable
                    onPress={() => setPasswordVisibile(!passwordVisible)}
                    style={styles.VisibilityToggle}
                >
                    <Icon size={20} name={passwordVisible ? "visibility-off" : "visibility"} />
                </Pressable>
            </View>
            {
                loginFailed ?
                    <View style={styles.LoginError}>
                        <Text variant='labelMedium'>Login Failed. Try Again?</Text>
                    </View>
                    : null
            }
            <View style={styles.LoginButtonContainer}>
                <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.LoginButton}
                    labelStyle={[styles.LoginButtonText]}
                    loading={isLoading}
                >
                    Login
                </Button>
            </View>
            <View style={styles.LoginOptionsContainer}>
                <Text style={{ ...styles.FirstLoginOption, ...styles.LoginOption }} onPress={resetPassword}>Reset Password</Text>
                <Text style={styles.LoginOption} onPress={createAccount}>Create Account</Text>
            </View>
            <View style={{ height: 500, width: '100%' }}></View>
        </View>
    )
}

const makeStyles = (paperTheme: MD3Theme) => {
    return StyleSheet.create({
        FormContainer: {
            display: "flex",
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        InputWrapper: {
            height: height / 15.5,
            margin: height / 50,
            borderRadius: 20,
            borderTopEndRadius: 20,
            borderTopStartRadius: 20,
            justifyContent: "space-between",
            textTransform: "lowercase",
            backgroundColor: "white",
            alignItems: "center",
            flexDirection: "row",
        },
        TextInput: {
            width: "100%",
            height: "100%",
            margin: height / 50,
            borderRadius: 20,
            borderTopEndRadius: 20,
            borderTopStartRadius: 20,
            justifyContent: "space-between",
            textTransform: "lowercase",
            backgroundColor: "white",
            color: "black",
            alignItems: "center",
            flexDirection: "row",
            fontSize: width / 20,
        },
        LoginError: {
            padding: 10
        },
        LoginButtonContainer: {

        },
        VisibilityToggle: {
            position: 'absolute',
            right: 0,
            paddingRight: 20
        },
        LoginButton: {
            margin: 4,
            backgroundColor: theme.colors.violet,
        },
        LoginButtonText: {
            color: "white",
            fontSize: width / 20,
            lineHeight: 32,
        },
        LoginOptionsContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginTop: 10,
            color: paperTheme.colors.primary
        },
        FirstLoginOption: {
            paddingRight: 20
        },
        LoginOption: {
            color: paperTheme.colors.onPrimary
        }
    })
}

export default LoginForm;
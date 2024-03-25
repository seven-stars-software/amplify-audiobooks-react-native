import { Button,useTheme, Text, MD3Theme } from 'react-native-paper';
import { useContext, useEffect, useRef, useState } from "react";
import { Dimensions,StyleSheet, TextInput, View, Keyboard, Pressable } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import APIClient from "APIClient";
import AuthContext from "contexts/AuthContext";
import UserContext from "contexts/UserContext";

import theme from "styler/theme";
import ErrorContext from 'contexts/ErrorContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigators/RootNavigator';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type Fields = {
    username: string,
    email: string,
    password: string
}

const RegisterForm = () => {
    const [authSeal, setAuthSeal] = useContext(AuthContext);
    const [user, setUser] = useContext(UserContext)

    const [isLoading, setIsLoading] = useState(false)
    const [registrationFailed, setRegistrationFailed] = useState(false)
    const [registrationMessage, setRegistrationMessage] = useState('')
    const [failureReason, setFailureReason] = useState(null)
    const [passwordVisible, setPasswordVisibile] = useState(false);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>()

    const { handleThrown } = useContext(ErrorContext)

    const theme = useTheme();
    const styles = makeStyles(theme)

    const usernameInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);


    const [fields, setFields] = useState<Fields>({ username: "", email: "", password: "" });
    const onChange = (fieldName: string, value: string) => {
        setFields(
            (prevFields) => {
                const newFields = { ...prevFields, [fieldName]: value }
                return newFields
            }
        )
    }

    useEffect(() => {
        if (authSeal !== null) navigation.navigate('Core')
    }, [authSeal])

    const handleRegister = async () => {
        Keyboard.dismiss()
        setRegistrationFailed(false)
        setIsLoading(true)
        try {
            const res = await APIClient.register({
                username: fields.username,
                email: fields.email,
                password: fields.password
            })
            if (!res?.success) {
                setRegistrationFailed(true)
                setRegistrationMessage(res?.message)
            } else {
                //Set Auth Seal
                const newAuthSeal = res?.seal
                setAuthSeal(newAuthSeal)

                //Set WP User
                const wpUser = res?.wpUser
                console.log(JSON.stringify(wpUser, null, 4))
                setUser(
                    (prevUser) =>
                        ({ ...prevUser, wpUser })
                )
            }
            setIsLoading(false)
        } catch (e) {
            handleThrown(e)
        }
    }

    const goToLogin = () => {
        navigation.navigate('Login')
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
                        onSubmitEditing={() => emailInputRef?.current?.focus()}
                        ref={usernameInputRef}
                    />
                </View>
                <View style={styles.InputWrapper}>
                    <TextInput
                        style={styles.TextInput}
                        placeholder="Email"
                        placeholderTextColor={'grey'}
                        onChangeText={(value) => {
                            onChange('email', value)
                        }}
                        returnKeyType='next'
                        autoCorrect={false}
                        ref={emailInputRef}
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
                        autoComplete='off'
                        autoCapitalize='none'
                        placeholder="Password"
                        returnKeyType='done'
                        onSubmitEditing={handleRegister}
                        ref={passwordInputRef}
                    />
                    <Pressable 
                        onPress={()=>setPasswordVisibile(!passwordVisible)}
                        style={styles.VisibilityToggle}
                    >
                        <Icon size={20} name={passwordVisible?"visibility-off":"visibility"} />
                    </Pressable>
                </View>
            {
                registrationFailed ?
                    <View style={styles.RegistrationError}>
                        <Text variant='labelMedium'>Registration Failed</Text>
                        <Text variant='labelMedium'>{registrationMessage}</Text>
                    </View>
                    : null
            }
            <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.RegisterButton}
                labelStyle={[styles.RegisterButtonText]}
                loading={isLoading}
            >
                Register
            </Button>
            <Text style={styles.LoginOption} onPress={goToLogin}>Login</Text>
            <View style={{ height: 500, width: '100%'}}></View>
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
            backgroundColor: "white",
            color: paperTheme.colors.onPrimary,
            alignItems: "center",
            flexDirection: "row",
            fontSize: width / 20,
        },
        VisibilityToggle:{
            position: 'absolute',
            right: 0,
            paddingRight: 20
        },
        RegistrationError: {
            padding: 10,
            alignItems: 'center'
        },
        RegisterButton: {
            margin: 4,
            backgroundColor: theme.colors.violet,
        },
        RegisterButtonText: {
            color: "white",
            fontSize: width / 20,
            lineHeight: 32,
        },
        LoginOption: {
            color: paperTheme.colors.onPrimary,
            marginTop: 10,
        }
    })
}

export default RegisterForm;
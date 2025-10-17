import { createContext, ReactNode, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSeal } from "types/types";

type AuthContextType = [
    AuthSeal | null,
    (arg0: AuthSeal) => void,
    () => void
]

const AuthContext = createContext<AuthContextType>([
    null, () => null, () => null
]);

const storageKey = 'auth_seal'

export const AuthContextProvider = ({ children }: { children?: ReactNode }) => {
    const [authSeal, setAuthSeal] = useState<AuthSeal | null>(null);

    useEffect(() => {
        const loadAuthSealFromStorage = async () => {
            const fromStorage = await AsyncStorage.getItem(storageKey);
            if (fromStorage !== undefined) {
                setAuthSeal(fromStorage)
            }
        }
        if (authSeal === null) {
            loadAuthSealFromStorage()
        }
    }, [])

    const setAndStoreAuthSeal = async (seal: AuthSeal) => {
        setAuthSeal(seal)
        if (seal !== null) {
            await AsyncStorage.setItem(
                storageKey,
                seal
            );
        }
    }

    const deleteAuthSeal = async () => {
        try {
            await AsyncStorage.removeItem(storageKey);
            setAuthSeal(null)
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <AuthContext.Provider value={[authSeal, setAndStoreAuthSeal, deleteAuthSeal]}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;


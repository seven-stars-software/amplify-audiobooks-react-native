import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorContext from 'contexts/ErrorContext';
import { useContext, useEffect, useState } from 'react';

const WelcomeStorageBucket = '@WelcomeBucket';
const WelcomeStatusKey = 'status';

export enum WelcomeStatus {
    complete = 'COMPLETE',
    incomplete = 'INCOMPLETE',
    skipped = 'SKIPPED'
}

const useWelcome = () => {
    const { handleThrown } = useContext(ErrorContext);
    const [welcomeStatus, setWelcomeStatus] = useState<WelcomeStatus>();

    useEffect(()=>{
        const initWelcomeStatus = async () => {
            const locallyStoredWelcomeStatus = await getLocalStorageWelcomeStatus();
            setWelcomeStatus(locallyStoredWelcomeStatus);
        };
        initWelcomeStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setLocalStorageWelcomeStatus = async (status: WelcomeStatus) => {
        try {
            await AsyncStorage.setItem(`${WelcomeStorageBucket}:${WelcomeStatusKey}`, status);
        } catch (e) {
            handleThrown(e);
        }
    };

    const getLocalStorageWelcomeStatus = async (): Promise<WelcomeStatus | undefined> => {
        try {
            const value = await AsyncStorage.getItem(`${WelcomeStorageBucket}:${WelcomeStatusKey}`);
            if (value === null) {
                return WelcomeStatus.incomplete;
            }
            if (!Object.values(WelcomeStatus).includes(value as WelcomeStatus)) {
                console.log(`WelcomeStatus Enum: ${JSON.stringify(WelcomeStatus, null, 4)}`);
                handleThrown(new Error(`Unknown Welcome Status: ${value}}`));
            }
            return value as WelcomeStatus;
        } catch (e) {
            handleThrown(e);
        }
    };

    const skipWelcome = async () => {
        setWelcomeStatus(WelcomeStatus.skipped);
        setLocalStorageWelcomeStatus(WelcomeStatus.skipped);
    };

    const completeWelcome = async () => {
        console.log('completeWelcome');
        setWelcomeStatus(WelcomeStatus.complete);
        setLocalStorageWelcomeStatus(WelcomeStatus.complete);
    };

    return {
        skipWelcome,
        completeWelcome,
        welcomeStatus,
    };
};

export default useWelcome;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const DEV_SETTINGS_KEY = '@DevSettings';

export type DevSettings = {
    simulateOffline: boolean;
}

const defaultDevSettings: DevSettings = {
    simulateOffline: false,
};

/**
 * Hook for managing development-only settings.
 * Only available when __DEV__ is true.
 */
const useDevSettings = () => {
    const [devSettings, setDevSettings] = useState<DevSettings>(defaultDevSettings);
    const [loaded, setLoaded] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const loadDevSettings = async () => {
            if (!__DEV__) {
                setLoaded(true);
                return;
            }

            try {
                const stored = await AsyncStorage.getItem(DEV_SETTINGS_KEY);
                if (stored) {
                    setDevSettings(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Error loading dev settings:', error);
            } finally {
                setLoaded(true);
            }
        };
        loadDevSettings();
    }, []);

    // Save settings to AsyncStorage
    const updateDevSettings = async (updates: Partial<DevSettings>) => {
        if (!__DEV__) {return;}

        const newSettings = { ...devSettings, ...updates };
        setDevSettings(newSettings);

        try {
            await AsyncStorage.setItem(DEV_SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving dev settings:', error);
        }
    };

    return {
        devSettings,
        updateDevSettings,
        loaded,
        isDev: __DEV__,
    };
};

export default useDevSettings;

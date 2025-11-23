import { useNetInfo } from '@react-native-community/netinfo';
import useDevSettings from './useDevSettings';

/**
 * Custom hook that wraps useNetInfo and applies dev settings overrides.
 *
 * In development mode, the "Simulate Offline Mode" dev setting can override
 * the actual network state to facilitate testing offline functionality.
 *
 * @returns Object with isInternetReachable (boolean | null) and isOffline (boolean)
 */
const useNetworkStatus = () => {
    const { isInternetReachable: rawIsInternetReachable } = useNetInfo();
    const { devSettings } = useDevSettings();

    // Override network state with dev settings if simulate offline is enabled (dev only)
    const isInternetReachable = (__DEV__ && devSettings.simulateOffline)
        ? false
        : rawIsInternetReachable;

    // Convenience flag for offline state (explicitly false)
    const isOffline = isInternetReachable === false;

    return {
        isInternetReachable,
        isOffline
    };
};

export default useNetworkStatus;

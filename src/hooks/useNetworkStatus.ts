import { useNetInfo } from '@react-native-community/netinfo';
import { NetworkStatus } from 'types/types';
import useDevSettings from './useDevSettings';

/**
 * Custom hook that wraps useNetInfo and applies dev settings overrides.
 *
 * In development mode, the "Simulate Offline Mode" dev setting can override
 * the actual network state to facilitate testing offline functionality.
 *
 * @returns NetworkStatus enum value (ONLINE, OFFLINE, or UNKNOWN)
 */
const useNetworkStatus = (): NetworkStatus => {
    const { isInternetReachable: rawIsInternetReachable } = useNetInfo();
    const { devSettings } = useDevSettings();

    // Override network state with dev settings if simulate offline is enabled (dev only)
    const isInternetReachable = (__DEV__ && devSettings.simulateOffline)
        ? false
        : rawIsInternetReachable;

    // Map to NetworkStatus enum
    if (isInternetReachable === true) {
        return NetworkStatus.ONLINE;
    } else if (isInternetReachable === false) {
        return NetworkStatus.OFFLINE;
    } else {
        return NetworkStatus.UNKNOWN;
    }
};

export default useNetworkStatus;

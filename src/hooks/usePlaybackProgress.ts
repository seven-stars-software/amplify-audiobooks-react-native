import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useProgress } from 'react-native-track-player';

/**
 * Wraps `useProgress` from react-native-track-player.
 * Fixes a bug in react-native-track-player
 * https://github.com/doublesymmetry/react-native-track-player/issues/792#issuecomment-756171765
 * @param updateInterval The interval at which progress is updated in milliseconds.
 * @returns Track player position, seconds buffered and duration of current track
 */
const usePlaybackProgress = (updateInterval = 1000) => {
    const [appState, setAppState] = useState<AppStateStatus>('active');
    const appStateChange = (appState: AppStateStatus) => setAppState(appState);
    useEffect(() => {
        const subscription = AppState.addEventListener('change', appStateChange);
        return () => subscription.remove();
    }, []);

    // Needed to handle a bug in RNTP https://github.com/doublesymmetry/react-native-track-player/issues/792#issuecomment-756171765
    const { position, buffered, duration } = useProgress(appState === 'active' ? updateInterval : 50000);
    return {position, buffered, duration};
};

export default usePlaybackProgress;

import { useCallback } from 'react';
import TrackPlayer, {
  usePlaybackState,
  State,
} from 'react-native-track-player';

export const useOnTogglePlayback = () => {
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;

  return useCallback(() => {
    if (isPlaying) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  }, [isPlaying]);
};

import { useState, useEffect } from 'react';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
} from 'react-native-track-player';
import type { Track } from 'react-native-track-player';

const getTrackFromQueue = async (index: number) => {
  try{
    const currentTrack = await TrackPlayer.getTrack(index);
    return currentTrack;
  } catch (e) {
    console.log('getTrack error');
    console.log(e);
    return null;
  }
};

export const useCurrentTrack = (): Track | null => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    (async () => {
      // getCurrentTrack returns an index, not a track 🙄
      const currentIndex = await TrackPlayer.getCurrentTrack();
      if (currentIndex !== null) {
        const currentTrack = await getTrackFromQueue(currentIndex);
        setCurrentTrack(currentTrack);
      }
    })();
  }, []);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async ({ nextTrack: nextTrackIndex }) => {
    if (nextTrackIndex !== null && nextTrackIndex !== undefined) {
      const currentTrack = await getTrackFromQueue(nextTrackIndex);
      setCurrentTrack(currentTrack);
    }
  });

  return currentTrack;
};

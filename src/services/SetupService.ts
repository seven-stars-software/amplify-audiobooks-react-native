import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
} from 'react-native-track-player';

// https://react-native-track-player.js.org/docs/api/objects/metadata-options
export const metadataOptions = {
  android: {
    appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
  },
  forwardJumpInterval: 15,
  backwardJumpInterval: 15,
  progressUpdateEventInterval: 10,
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
    Capability.JumpForward,
    Capability.JumpBackward,
    Capability.SeekTo,
  ],
  compactCapabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
  ],
}

export const SetupService = async (): Promise<boolean> => {
  let isSetup = false;
  try {
    // this method will only reject if player has not been setup yet
    console.log(JSON.stringify(Object.keys(TrackPlayer), null, 4))
    await TrackPlayer.getActiveTrackIndex();
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions(metadataOptions);
    isSetup = true;
  } catch(e) {
    console.error("TrackPlayer setup error:", e);
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return isSetup;
  }
};

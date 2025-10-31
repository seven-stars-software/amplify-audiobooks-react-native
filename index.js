console.log(`App starting...`);

// Must be first:
try {
  // Use RN's internal BatchedBridge to pre-register the callable module
  // RN will overwrite this shortly with the real implementation.
  const BatchedBridge = require('react-native/Libraries/BatchedBridge/BatchedBridge').default
    || require('react-native/Libraries/BatchedBridge/BatchedBridge');
  if (BatchedBridge && typeof BatchedBridge.registerCallableModule === 'function') {
    console.log(`Patching BatchedBridge to pre-register RCTEventEmitter...`);
    const names = Object.keys(BatchedBridge._callableModules || {});
    if (!names.includes('RCTEventEmitter')) {
        console.log(`Registering empty RCTEventEmitter module...`);
      BatchedBridge.registerCallableModule('RCTEventEmitter', {
        receiveEvent() {},
        receiveTouches() {},
        receiveCancellableEvent() {},
      });
    }
  }
} catch (e) {
    console.error(`Error patching BatchedBridge: ${e}`);
}

import 'react-native-gesture-handler';
console.log(`react-native-gesture-handler imported.`);
import { enableScreens } from 'react-native-screens';
enableScreens(true);
console.log(`react-native-screens enabled.`);
import 'polyfills/earlyBridge';
import { Platform } from 'react-native';
if (Platform.OS === 'android') {
    require('@expo/metro-runtime'); // Must be first! Ensures that Expo's URL polyfill is loaded. Otherwise URL won't work on Android!
}

import { AppRegistry, InteractionManager } from 'react-native';
import TrackPlayer from 'react-native-track-player';
console.log(`react-native-track-player imported.`);
import { PlaybackService } from './src/services';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => {
    InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => { // extra deferral
            console.log(`Registering playback service...`);
            const TrackPlayer = require('react-native-track-player').default;
            const { PlaybackService } = require('./src/services');
            TrackPlayer.registerPlaybackService(() => PlaybackService);
            console.log(`Playback service registered.`);
        });
    });
    return App;
});

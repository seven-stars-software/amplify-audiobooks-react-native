/**
 * @format
 */
import '@expo/metro-runtime'; // Must be first! Ensures that Expo's URL polyfill is loaded. Otherwise URL won't work on Android!
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import {PlaybackService} from './src/services';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => PlaybackService);

/* eslint-disable no-undef */
// Note: @testing-library/react-native v12.4+ has built-in Jest matchers

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(() => ({
    isInternetReachable: true,
    isConnected: true,
    type: 'wifi',
  })),
  fetch: jest.fn(() => Promise.resolve({
    isInternetReachable: true,
    isConnected: true,
    type: 'wifi',
  })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  useActiveTrack: jest.fn(() => null),
  useProgress: jest.fn(() => ({ position: 0, duration: 0, buffered: 0 })),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  useTrackPlayerEvents: jest.fn(),
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  seekTo: jest.fn(() => Promise.resolve()),
  skip: jest.fn(() => Promise.resolve()),
  skipToNext: jest.fn(() => Promise.resolve()),
  skipToPrevious: jest.fn(() => Promise.resolve()),
  add: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
  reset: jest.fn(() => Promise.resolve()),
  getQueue: jest.fn(() => Promise.resolve([])),
  getTrack: jest.fn(() => Promise.resolve(null)),
  getCurrentTrack: jest.fn(() => Promise.resolve(null)),
  getActiveTrackIndex: jest.fn(() => Promise.resolve(null)),
  setupPlayer: jest.fn(() => Promise.resolve()),
  registerPlaybackService: jest.fn(),
  default: {
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
    seekTo: jest.fn(() => Promise.resolve()),
    getTrack: jest.fn(() => Promise.resolve(null)),
    getCurrentTrack: jest.fn(() => Promise.resolve(null)),
    getQueue: jest.fn(() => Promise.resolve([])),
  },
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
  },
  Event: {
    PlaybackState: 'playback-state',
    PlaybackError: 'playback-error',
    PlaybackTrackChanged: 'playback-track-changed',
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteStop: 'remote-stop',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteSeek: 'remote-seek',
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    Stop: 'stop',
    SeekTo: 'seek-to',
    Skip: 'skip',
    SkipToNext: 'skip-to-next',
    SkipToPrevious: 'skip-to-previous',
  },
  RepeatMode: {
    Off: 0,
    Track: 1,
    Queue: 2,
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  downloadAsync: jest.fn(() => Promise.resolve({ uri: 'file:///mock/downloaded' })),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn(() => Promise.resolve({ uri: 'file:///mock/downloaded' })),
  })),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  return {
    Provider: ({ children }) => children,
    useTheme: () => ({
      colors: {
        primary: '#6200ee',
        background: '#ffffff',
        surface: '#ffffff',
        accent: '#03dac4',
        error: '#b00020',
        text: '#000000',
        onSurface: '#000000',
        disabled: '#00000061',
        placeholder: '#00000061',
        backdrop: '#00000052',
        notification: '#f50057',
      },
    }),
    ActivityIndicator: 'ActivityIndicator',
    Button: 'Button',
    Text: 'Text',
    Surface: 'Surface',
    Card: 'Card',
    IconButton: 'IconButton',
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Set up global __DEV__ variable
global.__DEV__ = true;

// Silence console.error for expected test errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

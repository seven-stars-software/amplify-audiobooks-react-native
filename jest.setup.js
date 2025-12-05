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
  AppKilledPlaybackBehavior: {
    ContinuePlayback: 'continue-playback',
    PausePlayback: 'pause-playback',
    StopPlaybackAndRemoveNotification: 'stop-playback-and-remove-notification',
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
  const { Text: RNText, TouchableOpacity, View } = require('react-native');
  const mockColors = {
    primary: '#6200ee',
    background: '#ffffff',
    surface: '#ffffff',
    accent: '#03dac4',
    error: '#b00020',
    text: '#000000',
    onSurface: '#000000',
    onBackground: '#000000',
    onPrimary: '#ffffff',
    secondary: '#03dac6',
    disabled: '#00000061',
    placeholder: '#00000061',
    backdrop: '#00000052',
    notification: '#f50057',
  };
  return {
    Provider: ({ children }) => children,
    MD3LightTheme: { colors: mockColors },
    useTheme: () => ({ colors: mockColors }),
    ActivityIndicator: ({ testID }) => React.createElement(View, { testID }),
    Button: ({ children, onPress, loading, testID, disabled }) =>
      React.createElement(
        TouchableOpacity,
        { onPress, testID, disabled: disabled || loading, accessibilityRole: 'button' },
        React.createElement(RNText, null, children),
        loading && React.createElement(View, { testID: 'loading-indicator' })
      ),
    Text: ({ children, onPress, style, variant }) =>
      React.createElement(RNText, { onPress, style }, children),
    Surface: ({ children, style }) => React.createElement(View, { style }, children),
    Card: ({ children, style }) => React.createElement(View, { style }, children),
    IconButton: ({ onPress, icon, testID }) =>
      React.createElement(TouchableOpacity, { onPress, testID }, icon),
    Divider: () => React.createElement(View),
    List: {
      Item: ({ title, description, onPress }) =>
        React.createElement(TouchableOpacity, { onPress },
          React.createElement(RNText, null, title),
          description && React.createElement(RNText, null, description)
        ),
      Section: ({ children, title }) =>
        React.createElement(View, null,
          title && React.createElement(RNText, null, title),
          children
        ),
    },
    Modal: ({ children, visible }) => visible ? children : null,
    Portal: ({ children }) => children,
  };
});

// Mock react-native-scrubber
jest.mock('react-native-scrubber', () => 'Scrubber');

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

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock @react-navigation/native
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    reset: mockReset,
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
}));

// Export navigation mocks for test assertions
global.mockNavigate = mockNavigate;
global.mockGoBack = mockGoBack;
global.mockReset = mockReset;

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Keyboard
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
}));

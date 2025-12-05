import { renderHook } from '@testing-library/react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import useNetworkStatus from '../../src/hooks/useNetworkStatus';
import useDevSettings from '../../src/hooks/useDevSettings';
import { NetworkStatus } from '../../src/types/types';

// Mock useDevSettings
jest.mock('../../src/hooks/useDevSettings');

const mockUseNetInfo = useNetInfo as jest.MockedFunction<typeof useNetInfo>;
const mockUseDevSettings = useDevSettings as jest.MockedFunction<typeof useDevSettings>;

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: dev settings disabled
    mockUseDevSettings.mockReturnValue({
      devSettings: { simulateOffline: false },
      updateDevSettings: jest.fn(),
      loaded: true,
      isDev: true,
    });
  });

  it('should return ONLINE when isInternetReachable is true', () => {
    mockUseNetInfo.mockReturnValue({
      isInternetReachable: true,
      isConnected: true,
      type: 'wifi',
      details: null,
    } as ReturnType<typeof useNetInfo>);

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(NetworkStatus.ONLINE);
  });

  it('should return OFFLINE when isInternetReachable is false', () => {
    mockUseNetInfo.mockReturnValue({
      isInternetReachable: false,
      isConnected: false,
      type: 'none',
      details: null,
    } as ReturnType<typeof useNetInfo>);

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(NetworkStatus.OFFLINE);
  });

  it('should return UNKNOWN when isInternetReachable is null', () => {
    mockUseNetInfo.mockReturnValue({
      isInternetReachable: null,
      isConnected: null,
      type: 'unknown',
      details: null,
    } as ReturnType<typeof useNetInfo>);

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(NetworkStatus.UNKNOWN);
  });

  it('should return UNKNOWN when isInternetReachable is undefined', () => {
    mockUseNetInfo.mockReturnValue({
      isInternetReachable: undefined,
      isConnected: undefined,
      type: 'unknown',
      details: null,
    } as unknown as ReturnType<typeof useNetInfo>);

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(NetworkStatus.UNKNOWN);
  });

  describe('dev settings override', () => {
    beforeEach(() => {
      // @ts-expect-error - __DEV__ is a global
      global.__DEV__ = true;
    });

    it('should return OFFLINE when simulateOffline is enabled in dev mode', () => {
      mockUseNetInfo.mockReturnValue({
        isInternetReachable: true,
        isConnected: true,
        type: 'wifi',
        details: null,
      } as ReturnType<typeof useNetInfo>);

      mockUseDevSettings.mockReturnValue({
        devSettings: { simulateOffline: true },
        updateDevSettings: jest.fn(),
        loaded: true,
        isDev: true,
      });

      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current).toBe(NetworkStatus.OFFLINE);
    });

    it('should respect actual network status when simulateOffline is disabled', () => {
      mockUseNetInfo.mockReturnValue({
        isInternetReachable: true,
        isConnected: true,
        type: 'wifi',
        details: null,
      } as ReturnType<typeof useNetInfo>);

      mockUseDevSettings.mockReturnValue({
        devSettings: { simulateOffline: false },
        updateDevSettings: jest.fn(),
        loaded: true,
        isDev: true,
      });

      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current).toBe(NetworkStatus.ONLINE);
    });
  });

  describe('production mode', () => {
    beforeEach(() => {
      // @ts-expect-error - __DEV__ is a global
      global.__DEV__ = false;
    });

    afterEach(() => {
      // @ts-expect-error - __DEV__ is a global
      global.__DEV__ = true;
    });

    it('should ignore simulateOffline in production mode', () => {
      mockUseNetInfo.mockReturnValue({
        isInternetReachable: true,
        isConnected: true,
        type: 'wifi',
        details: null,
      } as ReturnType<typeof useNetInfo>);

      mockUseDevSettings.mockReturnValue({
        devSettings: { simulateOffline: true },
        updateDevSettings: jest.fn(),
        loaded: true,
        isDev: false,
      });

      const { result } = renderHook(() => useNetworkStatus());
      // In production, simulateOffline should be ignored
      // Note: The actual hook checks __DEV__ which we've set to false
      expect(result.current).toBe(NetworkStatus.ONLINE);
    });
  });

  it('should update when network status changes', () => {
    mockUseNetInfo.mockReturnValue({
      isInternetReachable: true,
      isConnected: true,
      type: 'wifi',
      details: null,
    } as ReturnType<typeof useNetInfo>);

    const { result, rerender } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(NetworkStatus.ONLINE);

    // Simulate network change
    mockUseNetInfo.mockReturnValue({
      isInternetReachable: false,
      isConnected: false,
      type: 'none',
      details: null,
    } as ReturnType<typeof useNetInfo>);

    rerender({});
    expect(result.current).toBe(NetworkStatus.OFFLINE);
  });
});

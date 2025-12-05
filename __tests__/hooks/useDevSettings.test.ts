import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useDevSettings from '../../src/hooks/useDevSettings';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useDevSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // @ts-expect-error - __DEV__ is a global
    global.__DEV__ = true;
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default settings', async () => {
    const { result } = renderHook(() => useDevSettings());

    expect(result.current.devSettings).toEqual({
      simulateOffline: false,
    });
  });

  it('should load settings from AsyncStorage on mount', async () => {
    const storedSettings = { simulateOffline: true };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedSettings));

    const { result } = renderHook(() => useDevSettings());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.devSettings).toEqual(storedSettings);
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@DevSettings');
  });

  it('should update settings and save to AsyncStorage', async () => {
    const { result } = renderHook(() => useDevSettings());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    await act(async () => {
      await result.current.updateDevSettings({ simulateOffline: true });
    });

    expect(result.current.devSettings.simulateOffline).toBe(true);
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      '@DevSettings',
      JSON.stringify({ simulateOffline: true })
    );
  });

  it('should merge partial updates with existing settings', async () => {
    const storedSettings = { simulateOffline: false };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedSettings));

    const { result } = renderHook(() => useDevSettings());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    await act(async () => {
      await result.current.updateDevSettings({ simulateOffline: true });
    });

    expect(result.current.devSettings).toEqual({
      simulateOffline: true,
    });
  });

  it('should return isDev as true when __DEV__ is true', () => {
    const { result } = renderHook(() => useDevSettings());
    expect(result.current.isDev).toBe(true);
  });

  it('should handle AsyncStorage errors gracefully on load', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useDevSettings());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    // Should still have default settings
    expect(result.current.devSettings).toEqual({
      simulateOffline: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should handle AsyncStorage errors gracefully on save', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useDevSettings());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    await act(async () => {
      await result.current.updateDevSettings({ simulateOffline: true });
    });

    // State should still update even if storage fails
    expect(result.current.devSettings.simulateOffline).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
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

    it('should not load from AsyncStorage in production', async () => {
      const { result } = renderHook(() => useDevSettings());

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(mockAsyncStorage.getItem).not.toHaveBeenCalled();
    });

    it('should not save to AsyncStorage in production', async () => {
      const { result } = renderHook(() => useDevSettings());

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      await act(async () => {
        await result.current.updateDevSettings({ simulateOffline: true });
      });

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should return isDev as false in production', () => {
      const { result } = renderHook(() => useDevSettings());
      expect(result.current.isDev).toBe(false);
    });
  });
});

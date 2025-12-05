import { renderHook, act, waitFor } from '@testing-library/react-native';
import useLoader from '../../src/hooks/useLoader';

describe('useLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when not loaded', () => {
    const loader = jest.fn(() => Promise.resolve());

    const { result } = renderHook(() => useLoader(loader, false));

    expect(result.current).toBe(true);
  });

  it('should return false when already loaded', () => {
    const loader = jest.fn(() => Promise.resolve());

    const { result } = renderHook(() => useLoader(loader, true));

    expect(result.current).toBe(false);
  });

  it('should call loader when loading is true', async () => {
    const loader = jest.fn(() => Promise.resolve());

    renderHook(() => useLoader(loader, false));

    await waitFor(() => {
      expect(loader).toHaveBeenCalled();
    });
  });

  it('should not call loader when already loaded', () => {
    const loader = jest.fn(() => Promise.resolve());

    renderHook(() => useLoader(loader, true));

    expect(loader).not.toHaveBeenCalled();
  });

  it('should transition from loading to not loading when loaded becomes true', async () => {
    const loader = jest.fn(() => Promise.resolve());

    const { result, rerender } = renderHook(
      ({ loaded }) => useLoader(loader, loaded),
      { initialProps: { loaded: false } }
    );

    expect(result.current).toBe(true);

    rerender({ loaded: true });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should handle loader errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const loader = jest.fn(() => Promise.reject(new Error('Load failed')));

    renderHook(() => useLoader(loader, false));

    await waitFor(() => {
      expect(loader).toHaveBeenCalled();
    });

    // Should log error but not crash
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should call loader only once on initial mount', async () => {
    const loader = jest.fn(() => Promise.resolve());

    const { rerender } = renderHook(
      ({ loaded }) => useLoader(loader, loaded),
      { initialProps: { loaded: false } }
    );

    await waitFor(() => {
      expect(loader).toHaveBeenCalledTimes(1);
    });

    // Rerender with same props
    rerender({ loaded: false });

    // Should not call loader again since loading state hasn't changed
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('should handle async loader', async () => {
    let resolveLoader: () => void;
    const loader = jest.fn(() => new Promise<void>((resolve) => {
      resolveLoader = resolve;
    }));

    const { result, rerender } = renderHook(
      ({ loaded }) => useLoader(loader, loaded),
      { initialProps: { loaded: false } }
    );

    expect(result.current).toBe(true);

    // Simulate loader completing and external state updating
    await act(async () => {
      resolveLoader!();
    });

    // Simulate external loaded state change
    rerender({ loaded: true });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

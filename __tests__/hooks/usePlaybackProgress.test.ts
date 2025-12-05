import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useProgress } from 'react-native-track-player';
import usePlaybackProgress from '../../src/hooks/usePlaybackProgress';

const mockUseProgress = useProgress as jest.MockedFunction<typeof useProgress>;

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    currentState: 'active',
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

describe('usePlaybackProgress', () => {
  let appStateCallback: ((state: string) => void) | null = null;
  let mockRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRemove = jest.fn();

    (AppState.addEventListener as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'change') {
        appStateCallback = callback;
      }
      return { remove: mockRemove };
    });

    mockUseProgress.mockReturnValue({
      position: 0,
      duration: 0,
      buffered: 0,
    });
  });

  it('should return position, buffered, and duration', () => {
    mockUseProgress.mockReturnValue({
      position: 30,
      duration: 180,
      buffered: 60,
    });

    const { result } = renderHook(() => usePlaybackProgress());

    expect(result.current).toEqual({
      position: 30,
      duration: 180,
      buffered: 60,
    });
  });

  it('should use default update interval of 1000ms when active', () => {
    renderHook(() => usePlaybackProgress());

    expect(mockUseProgress).toHaveBeenCalledWith(1000);
  });

  it('should use custom update interval when provided', () => {
    renderHook(() => usePlaybackProgress(500));

    expect(mockUseProgress).toHaveBeenCalledWith(500);
  });

  it('should register AppState event listener', () => {
    renderHook(() => usePlaybackProgress());

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should cleanup AppState listener on unmount', () => {
    const { unmount } = renderHook(() => usePlaybackProgress());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('should use longer interval when app is in background', () => {
    const { rerender } = renderHook(() => usePlaybackProgress(1000));

    // Initial call with active state
    expect(mockUseProgress).toHaveBeenLastCalledWith(1000);

    // Simulate app going to background
    act(() => {
      if (appStateCallback) {
        appStateCallback('background');
      }
    });

    rerender({});

    // Should use 50000ms interval when in background
    expect(mockUseProgress).toHaveBeenLastCalledWith(50000);
  });

  it('should return to normal interval when app becomes active', () => {
    const { rerender } = renderHook(() => usePlaybackProgress(1000));

    // Go to background
    act(() => {
      if (appStateCallback) {
        appStateCallback('background');
      }
    });

    rerender({});
    expect(mockUseProgress).toHaveBeenLastCalledWith(50000);

    // Come back to active
    act(() => {
      if (appStateCallback) {
        appStateCallback('active');
      }
    });

    rerender({});
    expect(mockUseProgress).toHaveBeenLastCalledWith(1000);
  });

  it('should handle inactive state same as background', () => {
    const { rerender } = renderHook(() => usePlaybackProgress(1000));

    act(() => {
      if (appStateCallback) {
        appStateCallback('inactive');
      }
    });

    rerender({});

    // Should use 50000ms interval when inactive
    expect(mockUseProgress).toHaveBeenLastCalledWith(50000);
  });

  it('should update progress values when they change', () => {
    mockUseProgress.mockReturnValue({
      position: 0,
      duration: 180,
      buffered: 0,
    });

    const { result, rerender } = renderHook(() => usePlaybackProgress());

    expect(result.current.position).toBe(0);

    mockUseProgress.mockReturnValue({
      position: 30,
      duration: 180,
      buffered: 45,
    });

    rerender({});

    expect(result.current.position).toBe(30);
    expect(result.current.buffered).toBe(45);
  });
});

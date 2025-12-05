import { renderHook, act } from '@testing-library/react-native';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import { useOnTogglePlayback } from '../../src/hooks/useOnTogglePlayback';

const mockUsePlaybackState = usePlaybackState as jest.MockedFunction<typeof usePlaybackState>;
const mockTrackPlayer = TrackPlayer as jest.Mocked<typeof TrackPlayer>;

describe('useOnTogglePlayback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a function', () => {
    mockUsePlaybackState.mockReturnValue({ state: State.Paused });

    const { result } = renderHook(() => useOnTogglePlayback());
    expect(typeof result.current).toBe('function');
  });

  it('should call pause when currently playing', () => {
    mockUsePlaybackState.mockReturnValue({ state: State.Playing });

    const { result } = renderHook(() => useOnTogglePlayback());

    act(() => {
      result.current();
    });

    expect(mockTrackPlayer.pause).toHaveBeenCalled();
    expect(mockTrackPlayer.play).not.toHaveBeenCalled();
  });

  it('should call play when currently paused', () => {
    mockUsePlaybackState.mockReturnValue({ state: State.Paused });

    const { result } = renderHook(() => useOnTogglePlayback());

    act(() => {
      result.current();
    });

    expect(mockTrackPlayer.play).toHaveBeenCalled();
    expect(mockTrackPlayer.pause).not.toHaveBeenCalled();
  });

  it('should call play when state is none', () => {
    mockUsePlaybackState.mockReturnValue({ state: State.None });

    const { result } = renderHook(() => useOnTogglePlayback());

    act(() => {
      result.current();
    });

    expect(mockTrackPlayer.play).toHaveBeenCalled();
    expect(mockTrackPlayer.pause).not.toHaveBeenCalled();
  });

  it('should call play when state is stopped', () => {
    mockUsePlaybackState.mockReturnValue({ state: State.Stopped });

    const { result } = renderHook(() => useOnTogglePlayback());

    act(() => {
      result.current();
    });

    expect(mockTrackPlayer.play).toHaveBeenCalled();
  });

  it('should call play when state is ready', () => {
    mockUsePlaybackState.mockReturnValue({ state: State.Ready });

    const { result } = renderHook(() => useOnTogglePlayback());

    act(() => {
      result.current();
    });

    expect(mockTrackPlayer.play).toHaveBeenCalled();
  });

  it('should call play when state is buffering', () => {
    mockUsePlaybackState.mockReturnValue({ state: State.Buffering });

    const { result } = renderHook(() => useOnTogglePlayback());

    act(() => {
      result.current();
    });

    expect(mockTrackPlayer.play).toHaveBeenCalled();
  });

  it('should update callback when playback state changes', () => {
    mockUsePlaybackState.mockReturnValue({ state: State.Paused });

    const { result, rerender } = renderHook(() => useOnTogglePlayback());
    const firstCallback = result.current;

    // Change to playing
    mockUsePlaybackState.mockReturnValue({ state: State.Playing });
    rerender({});

    const secondCallback = result.current;

    // Callbacks should be different due to useCallback dependency
    expect(firstCallback).not.toBe(secondCallback);
  });
});

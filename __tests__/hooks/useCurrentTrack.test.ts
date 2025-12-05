import { renderHook, waitFor } from '@testing-library/react-native';
import TrackPlayer, { useTrackPlayerEvents } from 'react-native-track-player';
import { useCurrentTrack } from '../../src/hooks/useCurrentTrack';

const mockTrackPlayer = TrackPlayer as jest.Mocked<typeof TrackPlayer>;
const mockUseTrackPlayerEvents = useTrackPlayerEvents as jest.MockedFunction<typeof useTrackPlayerEvents>;

describe('useCurrentTrack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTrackPlayer.getCurrentTrack.mockResolvedValue(null);
    mockTrackPlayer.getTrack.mockResolvedValue(null);
    mockUseTrackPlayerEvents.mockImplementation(() => {});
  });

  it('should return null initially when no track is playing', async () => {
    mockTrackPlayer.getCurrentTrack.mockResolvedValue(null);

    const { result } = renderHook(() => useCurrentTrack());

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it('should return the current track on mount', async () => {
    const mockTrack = {
      id: '1',
      url: 'http://example.com/track.mp3',
      title: 'Test Track',
      artist: 'Test Artist',
    };

    mockTrackPlayer.getCurrentTrack.mockResolvedValue(0);
    mockTrackPlayer.getTrack.mockResolvedValue(mockTrack);

    const { result } = renderHook(() => useCurrentTrack());

    await waitFor(() => {
      expect(result.current).toEqual(mockTrack);
    });
  });

  it('should register track player event listener', () => {
    renderHook(() => useCurrentTrack());

    expect(mockUseTrackPlayerEvents).toHaveBeenCalled();
  });

  it('should handle getTrack error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    mockTrackPlayer.getCurrentTrack.mockResolvedValue(0);
    mockTrackPlayer.getTrack.mockRejectedValue(new Error('Track not found'));

    const { result } = renderHook(() => useCurrentTrack());

    await waitFor(() => {
      // Should log error and return null
      expect(result.current).toBeNull();
    });

    consoleSpy.mockRestore();
  });

  it('should handle getCurrentTrack returning null', async () => {
    mockTrackPlayer.getCurrentTrack.mockResolvedValue(null);

    const { result } = renderHook(() => useCurrentTrack());

    await waitFor(() => {
      expect(result.current).toBeNull();
    });

    // getTrack should not be called if getCurrentTrack returns null
    expect(mockTrackPlayer.getTrack).not.toHaveBeenCalled();
  });

  describe('track change events', () => {
    it('should update current track when event fires', async () => {
      let eventCallback: ((event: { nextTrack: number | null }) => void) | null = null;

      mockUseTrackPlayerEvents.mockImplementation((events, callback) => {
        eventCallback = callback as (event: { nextTrack: number | null }) => void;
      });

      const initialTrack = {
        id: '1',
        url: 'http://example.com/track1.mp3',
        title: 'Track 1',
      };

      const nextTrack = {
        id: '2',
        url: 'http://example.com/track2.mp3',
        title: 'Track 2',
      };

      mockTrackPlayer.getCurrentTrack.mockResolvedValue(0);
      mockTrackPlayer.getTrack
        .mockResolvedValueOnce(initialTrack)
        .mockResolvedValueOnce(nextTrack);

      const { result } = renderHook(() => useCurrentTrack());

      await waitFor(() => {
        expect(result.current).toEqual(initialTrack);
      });

      // Simulate track change event
      if (eventCallback) {
        await eventCallback({ nextTrack: 1 });
      }

      await waitFor(() => {
        expect(mockTrackPlayer.getTrack).toHaveBeenCalledWith(1);
      });
    });

    it('should handle null nextTrack in event', async () => {
      let eventCallback: ((event: { nextTrack: number | null }) => void) | null = null;

      mockUseTrackPlayerEvents.mockImplementation((events, callback) => {
        eventCallback = callback as (event: { nextTrack: number | null }) => void;
      });

      mockTrackPlayer.getCurrentTrack.mockResolvedValue(null);

      const { result } = renderHook(() => useCurrentTrack());

      await waitFor(() => {
        expect(result.current).toBeNull();
      });

      // Simulate track change event with null
      if (eventCallback) {
        await eventCallback({ nextTrack: null });
      }

      // getTrack should not be called for null nextTrack
      expect(mockTrackPlayer.getTrack).not.toHaveBeenCalled();
    });

    it('should handle undefined nextTrack in event', async () => {
      let eventCallback: ((event: { nextTrack: number | undefined }) => void) | null = null;

      mockUseTrackPlayerEvents.mockImplementation((events, callback) => {
        eventCallback = callback as (event: { nextTrack: number | undefined }) => void;
      });

      mockTrackPlayer.getCurrentTrack.mockResolvedValue(null);

      renderHook(() => useCurrentTrack());

      // Simulate track change event with undefined
      if (eventCallback) {
        await eventCallback({ nextTrack: undefined });
      }

      // getTrack should not be called for undefined nextTrack
      expect(mockTrackPlayer.getTrack).not.toHaveBeenCalled();
    });
  });
});

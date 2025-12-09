import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import TrackPlayer from 'react-native-track-player';
import * as FileSystem from 'expo-file-system';
import { PlaybackContextProvider } from '../../src/contexts/PlaybackContext';
import PlaybackContext from '../../src/contexts/PlaybackContext';
import ErrorContext from '../../src/contexts/ErrorContext';
import { DownloadStatus } from '../../src/types/types';

// Mock BookStore
jest.mock('../../src/stores/BookStore', () => ({
  getTrackFilePath: jest.fn((isbn: string, trackName: string) =>
    `file:///mock/${isbn}/${trackName}.mp3`
  ),
}));

// Mock useCheckpoints
jest.mock('../../src/hooks/useCheckpoints', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getCheckpoint: jest.fn(() => Promise.resolve(null)),
    setCheckpoint: jest.fn(() => Promise.resolve()),
  })),
}));

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockTrackPlayer = TrackPlayer as jest.Mocked<typeof TrackPlayer>;

describe('PlaybackContext', () => {
  const mockBook = {
    isbn: '123456789',
    name: 'Test Book',
    author: 'Test Author',
    images: ['https://example.com/cover.jpg'],
    downloadStatus: DownloadStatus.NOT_DOWNLOADED,
  };

  const mockTracks = [
    {
      id: 1,
      name: 'Chapter 1',
      uri: 'https://example.com/track1.mp3',
      downloadStatus: DownloadStatus.NOT_DOWNLOADED,
    },
    {
      id: 2,
      name: 'Chapter 2',
      uri: 'https://example.com/track2.mp3',
      downloadStatus: DownloadStatus.NOT_DOWNLOADED,
    },
  ];

  const mockErrorContext = {
    handleThrown: jest.fn(),
    handlePlaybackError: jest.fn(),
    clearError: jest.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ErrorContext.Provider value={mockErrorContext}>
      <PlaybackContextProvider>{children}</PlaybackContextProvider>
    </ErrorContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
  });

  describe('pauseBook', () => {
    it('calls TrackPlayer.pause', async () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.pauseBook();
      });

      expect(mockTrackPlayer.pause).toHaveBeenCalled();
    });
  });

  describe('playBook', () => {
    it('plays a new book by resetting queue and adding tracks', async () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.playBook(mockBook, mockTracks, { reset: true });
      });

      expect(mockTrackPlayer.reset).toHaveBeenCalled();
      expect(mockTrackPlayer.add).toHaveBeenCalled();
      expect(mockTrackPlayer.play).toHaveBeenCalled();
    });

    it('throws error when playing new book without tracks', async () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.playBook(mockBook);
      });

      expect(mockErrorContext.handleThrown).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cannot play a new book without providing tracks',
        })
      );
    });

    it('skips to specific track when trackNumber provided', async () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.playBook(mockBook, mockTracks, {
          trackNumber: 1,
          reset: true,
        });
      });

      expect(mockTrackPlayer.skip).toHaveBeenCalledWith(1);
      expect(mockTrackPlayer.play).toHaveBeenCalled();
    });

    it('updates nowPlaying state when playing a book', async () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.playBook(mockBook, mockTracks, { reset: true });
      });

      expect(result.current.nowPlaying).toEqual(mockBook);
    });

    it('uses local file path for downloaded tracks', async () => {
      const downloadedTracks = [
        {
          ...mockTracks[0],
          downloadStatus: DownloadStatus.DOWNLOADED,
        },
      ];

      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        uri: 'file:///mock/123456789/Chapter 1.mp3',
      } as any);

      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.playBook(mockBook, downloadedTracks, { reset: true });
      });

      expect(mockFileSystem.getInfoAsync).toHaveBeenCalled();
      expect(mockTrackPlayer.add).toHaveBeenCalled();
    });

    it('falls back to remote URI if downloaded file does not exist', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const downloadedTracks = [
        {
          ...mockTracks[0],
          downloadStatus: DownloadStatus.DOWNLOADED,
        },
      ];

      mockFileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false } as any);

      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.playBook(mockBook, downloadedTracks, { reset: true });
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expected downloaded track file to exist')
      );
      expect(mockTrackPlayer.add).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('creates PlayerTrack with correct metadata', async () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.playBook(mockBook, mockTracks, { reset: true });
      });

      const addCall = mockTrackPlayer.add.mock.calls[0][0];
      await waitFor(async () => {
        const playerTracks = await addCall;
        expect(playerTracks[0]).toMatchObject({
          url: mockTracks[0].uri,
          title: mockTracks[0].name,
          artist: mockBook.author,
          album: mockBook.name,
          artwork: mockBook.images[0],
        });
      });
    });

    it('plays same book without resetting queue', async () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      // First, play the book
      await act(async () => {
        await result.current.playBook(mockBook, mockTracks, { reset: true });
      });

      jest.clearAllMocks();

      // Then play the same book again without reset
      await act(async () => {
        await result.current.playBook(mockBook);
      });

      expect(mockTrackPlayer.reset).not.toHaveBeenCalled();
      expect(mockTrackPlayer.add).not.toHaveBeenCalled();
      expect(mockTrackPlayer.play).toHaveBeenCalled();
    });
  });

  describe('nowPlaying', () => {
    it('initially returns undefined', () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      expect(result.current.nowPlaying).toBeUndefined();
    });

    it('updates when a book is played', async () => {
      const { result } = renderHook(() => React.useContext(PlaybackContext), { wrapper });

      await act(async () => {
        await result.current.playBook(mockBook, mockTracks, { reset: true });
      });

      expect(result.current.nowPlaying).toEqual(mockBook);
    });
  });
});

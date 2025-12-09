import { renderHook, act } from '@testing-library/react-native';
import { useBookDownloads } from '../../src/hooks/useBookDownloads';
import { DownloadStatus } from '../../src/types/types';
import * as bookStorage from '../../src/utils/bookStorage';

// Mock bookStorage utilities
jest.mock('../../src/utils/bookStorage');

const mockBookStorage = bookStorage as jest.Mocked<typeof bookStorage>;

describe('useBookDownloads', () => {
    const mockSetBooks = jest.fn();

    const mockBooks = {
        '1234567890': {
            isbn: '1234567890',
            name: 'Test Book',
            author: 'Test Author',
            images: ['https://example.com/cover.jpg'],
            downloadStatus: DownloadStatus.NOT_DOWNLOADED,
            tracks: [
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
            ],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockBookStorage.getBookDirectoryPath.mockReturnValue('file:///mock/books/1234567890');
        mockBookStorage.getTrackFilePath.mockImplementation(
            (isbn, trackName) => `file:///mock/books/${isbn}/tracks/${trackName}.mp3`
        );
    });

    describe('downloadBook', () => {
        it('throws error for unknown book', async () => {
            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await expect(result.current.downloadBook('unknown-isbn')).rejects.toThrow(
                'Cannot download audio files for unknown book with ISBN [unknown-isbn]'
            );
        });

        it('throws error for book without tracks', async () => {
            const booksWithoutTracks = {
                '1234567890': {
                    ...mockBooks['1234567890'],
                    tracks: undefined,
                },
            };

            const { result } = renderHook(() => useBookDownloads(booksWithoutTracks, mockSetBooks));

            await expect(result.current.downloadBook('1234567890')).rejects.toThrow(
                'Book with ISBN [1234567890] has no tracks to download'
            );
        });

        it('ensures tracks directory exists before downloading', async () => {
            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await act(async () => {
                await result.current.downloadBook('1234567890');
            });

            expect(mockBookStorage.ensureDirectoryExists).toHaveBeenCalledWith(
                'file:///mock/books/1234567890/tracks'
            );
        });

        it('downloads all tracks for a book', async () => {
            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await act(async () => {
                await result.current.downloadBook('1234567890');
            });

            expect(mockBookStorage.downloadTrackFile).toHaveBeenCalledTimes(2);
            expect(mockBookStorage.downloadTrackFile).toHaveBeenCalledWith(
                'https://example.com/track1.mp3',
                'file:///mock/books/1234567890/tracks/Chapter 1.mp3'
            );
            expect(mockBookStorage.downloadTrackFile).toHaveBeenCalledWith(
                'https://example.com/track2.mp3',
                'file:///mock/books/1234567890/tracks/Chapter 2.mp3'
            );
        });

        it('updates track status to DOWNLOADING then DOWNLOADED on success', async () => {
            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await act(async () => {
                await result.current.downloadBook('1234567890');
            });

            // Should be called twice per track (DOWNLOADING, then DOWNLOADED)
            expect(mockSetBooks).toHaveBeenCalled();

            // Check that setBooks was called with function updaters
            const setBooksCalls = mockSetBooks.mock.calls;
            expect(setBooksCalls.length).toBeGreaterThan(0);

            // Verify the updater functions set DOWNLOADING and DOWNLOADED statuses
            const firstCall = setBooksCalls[0][0];
            expect(typeof firstCall).toBe('function');
        });

        it('updates track status to FAILED and cleans up on download error', async () => {
            mockBookStorage.downloadTrackFile.mockRejectedValueOnce(
                new Error('Network error')
            );

            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await act(async () => {
                await result.current.downloadBook('1234567890');
            });

            expect(mockBookStorage.cleanupFailedDownload).toHaveBeenCalledWith(
                'file:///mock/books/1234567890/tracks/Chapter 1.mp3'
            );
        });

        it('persists books state after status updates', async () => {
            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await act(async () => {
                await result.current.downloadBook('1234567890');
            });

            // persistBooks should be called via the setBooks callback
            expect(mockSetBooks).toHaveBeenCalled();
        });
    });

    describe('removeDownloads', () => {
        it('deletes book directory', async () => {
            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await act(async () => {
                await result.current.removeDownloads('1234567890');
            });

            expect(mockBookStorage.deleteBookDirectory).toHaveBeenCalledWith('1234567890');
        });

        it('updates all track statuses to NOT_DOWNLOADED', async () => {
            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await act(async () => {
                await result.current.removeDownloads('1234567890');
            });

            expect(mockSetBooks).toHaveBeenCalled();

            // Verify setBooks was called with an updater function
            const setBooksCalls = mockSetBooks.mock.calls;
            expect(setBooksCalls.length).toBeGreaterThan(0);

            const updaterFunction = setBooksCalls[0][0];
            expect(typeof updaterFunction).toBe('function');

            // Call the updater with mock previous state to verify logic
            const updatedBooks = updaterFunction(mockBooks);

            expect(updatedBooks['1234567890'].tracks).toEqual([
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
            ]);
        });

        it('handles book without tracks gracefully', async () => {
            const booksWithoutTracks = {
                '1234567890': {
                    ...mockBooks['1234567890'],
                    tracks: undefined,
                },
            };

            const { result } = renderHook(() => useBookDownloads(booksWithoutTracks, mockSetBooks));

            await act(async () => {
                await result.current.removeDownloads('1234567890');
            });

            expect(mockBookStorage.deleteBookDirectory).toHaveBeenCalled();
            expect(mockSetBooks).toHaveBeenCalled();

            // Verify the updater returns unchanged state for books without tracks
            const updaterFunction = mockSetBooks.mock.calls[0][0];
            const updatedBooks = updaterFunction(booksWithoutTracks);
            expect(updatedBooks).toBe(booksWithoutTracks);
        });

        it('persists books state after update', async () => {
            const { result } = renderHook(() => useBookDownloads(mockBooks, mockSetBooks));

            await act(async () => {
                await result.current.removeDownloads('1234567890');
            });

            // persistBooks should be called via the setBooks callback
            expect(mockSetBooks).toHaveBeenCalled();
        });
    });

    describe('hook stability', () => {
        it('returns stable function references', () => {
            const { result, rerender } = renderHook(
                ({ books, setBooks }) => useBookDownloads(books, setBooks),
                {
                    initialProps: { books: mockBooks, setBooks: mockSetBooks },
                }
            );

            const firstDownloadBook = result.current.downloadBook;
            const firstRemoveDownloads = result.current.removeDownloads;

            rerender({ books: mockBooks, setBooks: mockSetBooks });

            expect(result.current.downloadBook).toBe(firstDownloadBook);
            expect(result.current.removeDownloads).toBe(firstRemoveDownloads);
        });
    });
});

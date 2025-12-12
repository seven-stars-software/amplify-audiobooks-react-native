import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DownloadStatus } from '../../src/types/types';
import {
    BOOK_STORAGE_KEY,
    getBookDirectoryPath,
    getTrackFilePath,
    ensureDirectoryExists,
    checkTrackExists,
    downloadTrackFile,
    deleteBookDirectory,
    cleanupFailedDownload,
    getTrackDownloadStatus,
    augmentBookWithDownloadStatuses,
    persistBooks,
    loadPersistedBooks,
} from '../../src/utils/bookStorage';

// Mock modules
jest.mock('expo-file-system');
jest.mock('@react-native-async-storage/async-storage');

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('bookStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Set up a default documentDirectory for tests
        (mockFileSystem.documentDirectory as string) = 'file:///mock/documents/';
    });

    describe('Path Utilities', () => {
        describe('getBookDirectoryPath', () => {
            it('returns correct directory path for ISBN', () => {
                const path = getBookDirectoryPath('1234567890');
                expect(path).toBe('file:///mock/documents/books/1234567890');
            });
        });

        describe('getTrackFilePath', () => {
            it('returns correct file path for track', () => {
                const path = getTrackFilePath('1234567890', 'Chapter 1');
                expect(path).toBe('file:///mock/documents/books/1234567890/tracks/Chapter 1.mp3');
            });
        });
    });

    describe('File System Operations', () => {
        describe('ensureDirectoryExists', () => {
            it('creates directory if it does not exist', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: false,
                } as any);

                await ensureDirectoryExists('file:///mock/path');

                expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith('file:///mock/path');
                expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
                    'file:///mock/path',
                    { intermediates: true }
                );
            });

            it('does not create directory if it already exists', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: true,
                } as any);

                await ensureDirectoryExists('file:///mock/path');

                expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith('file:///mock/path');
                expect(mockFileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
            });
        });

        describe('checkTrackExists', () => {
            it('returns true when track file exists', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: true,
                } as any);

                const exists = await checkTrackExists('1234567890', 'Chapter 1');

                expect(exists).toBe(true);
                expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith(
                    'file:///mock/documents/books/1234567890/tracks/Chapter 1.mp3'
                );
            });

            it('returns false when track file does not exist', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: false,
                } as any);

                const exists = await checkTrackExists('1234567890', 'Chapter 1');

                expect(exists).toBe(false);
            });
        });

        describe('downloadTrackFile', () => {
            it('downloads file from source URI to destination path', async () => {
                await downloadTrackFile(
                    'https://example.com/track.mp3',
                    'file:///mock/dest/track.mp3'
                );

                expect(mockFileSystem.downloadAsync).toHaveBeenCalledWith(
                    'https://example.com/track.mp3',
                    'file:///mock/dest/track.mp3'
                );
            });
        });

        describe('deleteBookDirectory', () => {
            it('deletes directory if it exists', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: true,
                } as any);

                await deleteBookDirectory('1234567890');

                expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith(
                    'file:///mock/documents/books/1234567890'
                );
                expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith(
                    'file:///mock/documents/books/1234567890'
                );
            });

            it('does not delete if directory does not exist', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: false,
                } as any);

                await deleteBookDirectory('1234567890');

                expect(mockFileSystem.getInfoAsync).toHaveBeenCalled();
                expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
            });
        });

        describe('cleanupFailedDownload', () => {
            it('deletes file if it exists', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: true,
                } as any);

                await cleanupFailedDownload('file:///mock/partial.mp3');

                expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith('file:///mock/partial.mp3');
                expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith('file:///mock/partial.mp3');
            });

            it('does not delete if file does not exist', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: false,
                } as any);

                await cleanupFailedDownload('file:///mock/partial.mp3');

                expect(mockFileSystem.getInfoAsync).toHaveBeenCalled();
                expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
            });

            it('handles errors gracefully', async () => {
                mockFileSystem.getInfoAsync.mockRejectedValueOnce(new Error('Permission denied'));

                // Should not throw
                await expect(cleanupFailedDownload('file:///mock/partial.mp3')).resolves.toBeUndefined();
            });
        });
    });

    describe('Download Status Utilities', () => {
        describe('getTrackDownloadStatus', () => {
            it('returns DOWNLOADED when track file exists', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: true,
                } as any);

                const track = { id: 1, name: 'Chapter 1', uri: 'https://example.com/track.mp3' };
                const status = await getTrackDownloadStatus('1234567890', track);

                expect(status).toBe(DownloadStatus.DOWNLOADED);
            });

            it('returns NOT_DOWNLOADED when track file does not exist', async () => {
                mockFileSystem.getInfoAsync.mockResolvedValueOnce({
                    exists: false,
                } as any);

                const track = { id: 1, name: 'Chapter 1', uri: 'https://example.com/track.mp3' };
                const status = await getTrackDownloadStatus('1234567890', track);

                expect(status).toBe(DownloadStatus.NOT_DOWNLOADED);
            });
        });

        describe('augmentBookWithDownloadStatuses', () => {
            it('returns book unchanged if it has no tracks', async () => {
                const book = {
                    isbn: '1234567890',
                    name: 'Test Book',
                    author: 'Test Author',
                    images: [],
                    downloadStatus: DownloadStatus.NOT_DOWNLOADED,
                };

                const result = await augmentBookWithDownloadStatuses(book);

                expect(result).toEqual(book);
                expect(mockFileSystem.getInfoAsync).not.toHaveBeenCalled();
            });

            it('augments all tracks with download statuses', async () => {
                const book = {
                    isbn: '1234567890',
                    name: 'Test Book',
                    author: 'Test Author',
                    images: [],
                    downloadStatus: DownloadStatus.NOT_DOWNLOADED,
                    tracks: [
                        { id: 1, name: 'Chapter 1', uri: 'https://example.com/track1.mp3' },
                        { id: 2, name: 'Chapter 2', uri: 'https://example.com/track2.mp3' },
                    ],
                };

                // First track exists, second doesn't
                mockFileSystem.getInfoAsync
                    .mockResolvedValueOnce({ exists: true } as any)
                    .mockResolvedValueOnce({ exists: false } as any);

                const result = await augmentBookWithDownloadStatuses(book);

                expect(result.tracks).toEqual([
                    {
                        id: 1,
                        name: 'Chapter 1',
                        uri: 'https://example.com/track1.mp3',
                        downloadStatus: DownloadStatus.DOWNLOADED,
                    },
                    {
                        id: 2,
                        name: 'Chapter 2',
                        uri: 'https://example.com/track2.mp3',
                        downloadStatus: DownloadStatus.NOT_DOWNLOADED,
                    },
                ]);
            });
        });
    });

    describe('AsyncStorage Operations', () => {
        describe('persistBooks', () => {
            it('saves books to AsyncStorage as JSON', async () => {
                const books = {
                    '1234567890': {
                        isbn: '1234567890',
                        name: 'Test Book',
                        author: 'Test Author',
                        images: [],
                        downloadStatus: DownloadStatus.NOT_DOWNLOADED,
                    },
                };

                await persistBooks(books);

                expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                    BOOK_STORAGE_KEY,
                    JSON.stringify(books)
                );
            });
        });

        describe('loadPersistedBooks', () => {
            it('loads books from AsyncStorage', async () => {
                const books = {
                    '1234567890': {
                        isbn: '1234567890',
                        name: 'Test Book',
                        author: 'Test Author',
                        images: [],
                        downloadStatus: DownloadStatus.NOT_DOWNLOADED,
                    },
                };

                mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(books));

                const result = await loadPersistedBooks();

                expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(BOOK_STORAGE_KEY);
                expect(result).toEqual(books);
            });

            it('returns null when no books are stored', async () => {
                mockAsyncStorage.getItem.mockResolvedValueOnce(null);

                const result = await loadPersistedBooks();

                expect(result).toBeNull();
            });
        });
    });
});

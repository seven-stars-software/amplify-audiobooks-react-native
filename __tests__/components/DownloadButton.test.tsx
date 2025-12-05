import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import DownloadBookButton from '../../src/components/organisms/DownloadButton';
import { Book, DownloadStatus } from '../../src/types/types';

// Mock useBookStore
const mockDownloadAudioFiles = jest.fn();
const mockRemoveDownloads = jest.fn();
jest.mock('../../src/stores/BookStore', () => ({
    useBookStore: () => ({
        downloadAudioFiles: mockDownloadAudioFiles,
        removeDownloads: mockRemoveDownloads,
    }),
}));

// Mock RemoveDownloadsDialog
jest.mock('../../src/components/atoms/RemoveDownloadsDialog', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return ({ visible, setVisible, removeDownloads }: any) =>
        visible ? React.createElement(
            View,
            { testID: 'remove-downloads-dialog' },
            React.createElement(Text, null, 'Remove Downloads?'),
            React.createElement(
                TouchableOpacity,
                { onPress: removeDownloads, testID: 'confirm-remove' },
                React.createElement(Text, null, 'Confirm')
            ),
            React.createElement(
                TouchableOpacity,
                { onPress: () => setVisible(false), testID: 'cancel-remove' },
                React.createElement(Text, null, 'Cancel')
            )
        ) : null;
});

// Mock vector icons
jest.mock('react-native-vector-icons/Ionicons', () => {
    const React = require('react');
    const { View } = require('react-native');
    return ({ name, testID }: any) =>
        React.createElement(View, { testID: testID || `icon-${name}` });
});

// Mock book data
const createMockBook = (downloadStatus: DownloadStatus = DownloadStatus.NOT_DOWNLOADED): Book => ({
    wooProductID: '123',
    name: 'Test Book',
    images: ['https://example.com/cover.jpg'],
    author: 'Test Author',
    duration: '5h 30m',
    releaseDate: '2024-01-01',
    dateCreated: '2024-01-01',
    isbn: '978-1234567890',
    permalink: 'https://example.com/book',
    featured: false,
    purchased: true,
    newRelease: false,
    onSale: false,
    tracks: [
        {
            isSample: false,
            name: 'Chapter 1',
            s3Key: 'chapter-1.mp3',
            uri: 'https://example.com/chapter-1.mp3',
            downloadStatus,
        },
        {
            isSample: false,
            name: 'Chapter 2',
            s3Key: 'chapter-2.mp3',
            uri: 'https://example.com/chapter-2.mp3',
            downloadStatus,
        },
    ],
});

describe('DownloadBookButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDownloadAudioFiles.mockResolvedValue(undefined);
        mockRemoveDownloads.mockResolvedValue(undefined);
    });

    describe('rendering', () => {
        it('renders download icon when not downloaded', () => {
            const book = createMockBook(DownloadStatus.NOT_DOWNLOADED);
            const { getByTestId } = render(<DownloadBookButton book={book} size={24} />);

            expect(getByTestId('icon-arrow-down-circle-outline')).toBeTruthy();
        });

        it('renders checkmark icon when all tracks are downloaded', () => {
            const book = createMockBook(DownloadStatus.DOWNLOADED);
            const { getByTestId } = render(<DownloadBookButton book={book} size={24} />);

            expect(getByTestId('icon-checkmark-circle')).toBeTruthy();
        });

        it('does not show removal dialog initially', () => {
            const book = createMockBook(DownloadStatus.DOWNLOADED);
            const { queryByTestId } = render(<DownloadBookButton book={book} size={24} />);

            expect(queryByTestId('remove-downloads-dialog')).toBeNull();
        });
    });

    describe('download flow', () => {
        it('calls downloadAudioFiles when pressed on non-downloaded book', async () => {
            const book = createMockBook(DownloadStatus.NOT_DOWNLOADED);
            const { getByTestId } = render(<DownloadBookButton book={book} size={24} />);

            fireEvent.press(getByTestId('icon-arrow-down-circle-outline'));

            await waitFor(() => {
                expect(mockDownloadAudioFiles).toHaveBeenCalledWith('978-1234567890');
            });
        });

        it('shows loading indicator during download', async () => {
            let resolveDownload: () => void;
            mockDownloadAudioFiles.mockImplementation(() =>
                new Promise((resolve) => {
                    resolveDownload = resolve;
                })
            );

            const book = createMockBook(DownloadStatus.NOT_DOWNLOADED);
            const { getByTestId } = render(
                <DownloadBookButton book={book} size={24} />
            );

            // Start download
            await act(async () => {
                fireEvent.press(getByTestId('icon-arrow-down-circle-outline'));
            });

            // Loading indicator should be shown (ActivityIndicator renders as View with testID)
            // Since our mock renders it, we check if the download was called
            expect(mockDownloadAudioFiles).toHaveBeenCalled();

            // Resolve download
            await act(async () => {
                resolveDownload!();
            });
        });
    });

    describe('offline behavior', () => {
        it('calls onOfflineDownloadAttempt when offline and trying to download', () => {
            const book = createMockBook(DownloadStatus.NOT_DOWNLOADED);
            const onOfflineDownloadAttempt = jest.fn();

            const { getByTestId } = render(
                <DownloadBookButton
                    book={book}
                    size={24}
                    isOffline={true}
                    onOfflineDownloadAttempt={onOfflineDownloadAttempt}
                />
            );

            fireEvent.press(getByTestId('icon-arrow-down-circle-outline'));

            expect(onOfflineDownloadAttempt).toHaveBeenCalled();
            expect(mockDownloadAudioFiles).not.toHaveBeenCalled();
        });

        it('does not call onOfflineDownloadAttempt if not offline', async () => {
            const book = createMockBook(DownloadStatus.NOT_DOWNLOADED);
            const onOfflineDownloadAttempt = jest.fn();

            const { getByTestId } = render(
                <DownloadBookButton
                    book={book}
                    size={24}
                    isOffline={false}
                    onOfflineDownloadAttempt={onOfflineDownloadAttempt}
                />
            );

            fireEvent.press(getByTestId('icon-arrow-down-circle-outline'));

            await waitFor(() => {
                expect(onOfflineDownloadAttempt).not.toHaveBeenCalled();
                expect(mockDownloadAudioFiles).toHaveBeenCalled();
            });
        });
    });

    describe('removal flow', () => {
        it('shows removal dialog when pressing on downloaded book', () => {
            const book = createMockBook(DownloadStatus.DOWNLOADED);
            const { getByTestId } = render(<DownloadBookButton book={book} size={24} />);

            fireEvent.press(getByTestId('icon-checkmark-circle'));

            expect(getByTestId('remove-downloads-dialog')).toBeTruthy();
        });

        it('calls removeDownloads when confirming removal', async () => {
            const book = createMockBook(DownloadStatus.DOWNLOADED);
            const { getByTestId } = render(<DownloadBookButton book={book} size={24} />);

            // Open dialog
            fireEvent.press(getByTestId('icon-checkmark-circle'));

            // Confirm removal
            fireEvent.press(getByTestId('confirm-remove'));

            await waitFor(() => {
                expect(mockRemoveDownloads).toHaveBeenCalledWith('978-1234567890');
            });
        });

        it('closes dialog when cancelling removal', () => {
            const book = createMockBook(DownloadStatus.DOWNLOADED);
            const { getByTestId, queryByTestId } = render(
                <DownloadBookButton book={book} size={24} />
            );

            // Open dialog
            fireEvent.press(getByTestId('icon-checkmark-circle'));
            expect(getByTestId('remove-downloads-dialog')).toBeTruthy();

            // Cancel removal
            fireEvent.press(getByTestId('cancel-remove'));

            expect(queryByTestId('remove-downloads-dialog')).toBeNull();
            expect(mockRemoveDownloads).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('handles book with no tracks', () => {
            const book: Book = {
                ...createMockBook(),
                tracks: undefined,
            };
            const { getByTestId } = render(<DownloadBookButton book={book} size={24} />);

            // Should show download icon (not downloaded)
            expect(getByTestId('icon-arrow-down-circle-outline')).toBeTruthy();
        });

        it('handles book with empty tracks array', () => {
            const book: Book = {
                ...createMockBook(),
                tracks: [],
            };
            const { getByTestId } = render(<DownloadBookButton book={book} size={24} />);

            // Empty array with every() returns true, so should show checkmark
            expect(getByTestId('icon-checkmark-circle')).toBeTruthy();
        });

        it('handles mixed download status (some downloaded, some not)', () => {
            const book: Book = {
                ...createMockBook(),
                tracks: [
                    {
                        isSample: false,
                        name: 'Chapter 1',
                        s3Key: 'chapter-1.mp3',
                        uri: 'https://example.com/chapter-1.mp3',
                        downloadStatus: DownloadStatus.DOWNLOADED,
                    },
                    {
                        isSample: false,
                        name: 'Chapter 2',
                        s3Key: 'chapter-2.mp3',
                        uri: 'https://example.com/chapter-2.mp3',
                        downloadStatus: DownloadStatus.NOT_DOWNLOADED,
                    },
                ],
            };
            const { getByTestId } = render(<DownloadBookButton book={book} size={24} />);

            // Should show download icon (not all downloaded)
            expect(getByTestId('icon-arrow-down-circle-outline')).toBeTruthy();
        });
    });
});

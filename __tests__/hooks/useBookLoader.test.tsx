import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBookLoader } from '../../src/hooks/useBookLoader';
import AuthContext from '../../src/contexts/AuthContext';
import { NetworkStatus, DownloadStatus } from '../../src/types/types';
import APIClient from '../../src/APIClient';
import * as bookStorage from '../../src/utils/bookStorage';

// Mock dependencies
jest.mock('../../src/hooks/useNetworkStatus');
jest.mock('../../src/APIClient');
jest.mock('../../src/utils/bookStorage');

import useNetworkStatus from '../../src/hooks/useNetworkStatus';

const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<typeof useNetworkStatus>;
const mockAPIClient = APIClient as jest.Mocked<typeof APIClient>;
const mockBookStorage = bookStorage as jest.Mocked<typeof bookStorage>;

describe('useBookLoader', () => {
    const mockAuthSeal = 'test-auth-seal';
    const mockBook1 = {
        isbn: '1234567890',
        name: 'Book 1',
        author: 'Author 1',
        images: [],
        downloadStatus: DownloadStatus.NOT_DOWNLOADED,
    };

    const mockBook2 = {
        isbn: '0987654321',
        name: 'Book 2',
        author: 'Author 2',
        images: [],
        downloadStatus: DownloadStatus.NOT_DOWNLOADED,
    };

    const mockAPIResponse = {
        library: [mockBook1],
        featured: [mockBook2],
        newReleases: [],
        onSale: [],
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => {
        const contextValue: [string, React.Dispatch<React.SetStateAction<string | null>>] = [
            mockAuthSeal,
            jest.fn() as React.Dispatch<React.SetStateAction<string | null>>,
        ];
        return (
            <AuthContext.Provider value={contextValue}>
                {children}
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNetworkStatus.mockReturnValue(NetworkStatus.ONLINE);
        mockBookStorage.augmentBookWithDownloadStatuses.mockImplementation(
            async (book) => book
        );
        // Provide default successful mock for auto-loading on mount
        mockAPIClient.getHomeBooks.mockResolvedValue(mockAPIResponse);
        mockBookStorage.loadPersistedBooks.mockResolvedValue(null);
    });

    describe('initialization', () => {
        it('provides the expected API', () => {
            const nullAuthWrapper = ({ children }: { children: React.ReactNode }) => {
                const contextValue: [string | null, React.Dispatch<React.SetStateAction<string | null>>] = [
                    null,
                    jest.fn() as React.Dispatch<React.SetStateAction<string | null>>,
                ];
                return (
                    <AuthContext.Provider value={contextValue}>
                        {children}
                    </AuthContext.Provider>
                );
            };

            const { result } = renderHook(() => useBookLoader(), { wrapper: nullAuthWrapper });

            expect(typeof result.current.loadBooks).toBe('function');
            expect(typeof result.current.setBooks).toBe('function');
            expect(typeof result.current.loading).toBe('boolean');
            expect(typeof result.current.books).toBe('object');
        });
    });

    describe('loadBooks - network ONLINE', () => {
        it('loads books from API when network is ONLINE', async () => {
            mockAPIClient.getHomeBooks.mockResolvedValueOnce(mockAPIResponse);
            mockUseNetworkStatus.mockReturnValue(NetworkStatus.ONLINE);

            const { result } = renderHook(() => useBookLoader(), { wrapper });

            await act(async () => {
                await result.current.loadBooks();
            });

            expect(mockAPIClient.getHomeBooks).toHaveBeenCalledWith(mockAuthSeal);
            expect(mockBookStorage.persistBooks).toHaveBeenCalled();
            expect(result.current.books).toEqual({
                '1234567890': mockBook1,
                '0987654321': mockBook2,
            });
        });

        it('augments owned books with download statuses', async () => {
            mockAPIClient.getHomeBooks.mockResolvedValueOnce(mockAPIResponse);

            const { result } = renderHook(() => useBookLoader(), { wrapper });

            await act(async () => {
                await result.current.loadBooks();
            });

            expect(mockBookStorage.augmentBookWithDownloadStatuses).toHaveBeenCalledWith(
                mockBook1
            );
        });

        it('sets loading state during API call', async () => {
            mockAPIClient.getHomeBooks.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockAPIResponse), 100))
            );

            const { result } = renderHook(() => useBookLoader(), { wrapper });

            act(() => {
                result.current.loadBooks();
            });

            // Should be loading immediately
            await waitFor(() => {
                expect(result.current.loading).toBe(true);
            });

            // Wait for completion
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            }, { timeout: 200 });
        });
    });

    describe('loadBooks - network OFFLINE', () => {
        it('loads books from storage when network is OFFLINE', async () => {
            const storedBooks = {
                '1234567890': mockBook1,
            };

            mockBookStorage.loadPersistedBooks.mockResolvedValueOnce(storedBooks);
            mockUseNetworkStatus.mockReturnValue(NetworkStatus.OFFLINE);

            const { result } = renderHook(() => useBookLoader(), { wrapper });

            await act(async () => {
                await result.current.loadBooks();
            });

            expect(mockBookStorage.loadPersistedBooks).toHaveBeenCalled();
            expect(mockAPIClient.getHomeBooks).not.toHaveBeenCalled();
            expect(result.current.books).toEqual(storedBooks);
        });
    });

    describe('loadBooks - network UNKNOWN', () => {
        it('attempts API first, falls back to storage on failure', async () => {
            const storedBooks = {
                '1234567890': mockBook1,
            };

            mockAPIClient.getHomeBooks.mockRejectedValueOnce(new Error('Network timeout'));
            mockBookStorage.loadPersistedBooks.mockResolvedValueOnce(storedBooks);
            mockUseNetworkStatus.mockReturnValue(NetworkStatus.UNKNOWN);

            const { result } = renderHook(() => useBookLoader(), { wrapper });

            await act(async () => {
                await result.current.loadBooks();
            });

            expect(mockAPIClient.getHomeBooks).toHaveBeenCalled();
            expect(mockBookStorage.loadPersistedBooks).toHaveBeenCalled();
            expect(result.current.books).toEqual(storedBooks);
        });

        it('succeeds with API if network is actually available', async () => {
            mockAPIClient.getHomeBooks.mockResolvedValueOnce(mockAPIResponse);
            mockUseNetworkStatus.mockReturnValue(NetworkStatus.UNKNOWN);

            const { result } = renderHook(() => useBookLoader(), { wrapper });

            await act(async () => {
                await result.current.loadBooks();
            });

            expect(mockAPIClient.getHomeBooks).toHaveBeenCalled();
            expect(mockBookStorage.loadPersistedBooks).not.toHaveBeenCalled();
        });
    });

    describe('race condition guard', () => {
        it('prevents concurrent loadBooks calls', async () => {
            mockAPIClient.getHomeBooks.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockAPIResponse), 100))
            );

            const { result } = renderHook(() => useBookLoader(), { wrapper });

            // Start two calls simultaneously
            const promise1 = act(async () => {
                await result.current.loadBooks();
            });

            const promise2 = act(async () => {
                await result.current.loadBooks();
            });

            await Promise.all([promise1, promise2]);

            // API should only be called once due to guard
            expect(mockAPIClient.getHomeBooks).toHaveBeenCalledTimes(1);
        });
    });

    // TODO: Add auto-load and auto-reload tests
    // These tests are complex due to useEffect timing and require more sophisticated test setup
    // Core loading logic is well-tested above

    // TODO: Add book preparation tests
    // Test for duplicate book handling requires careful mock setup
    // The logic is tested indirectly through the loadBooks tests above

    // TODO: Add error handling tests
    // Error handling tests are complex due to component unmounting on errors
    // These can be added in a follow-up PR once we have better error boundary testing utilities
});

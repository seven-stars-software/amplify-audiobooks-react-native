import { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from 'contexts/AuthContext';
import useNetworkStatus from 'hooks/useNetworkStatus';
import useCallbackState from 'hooks/useCallbackState';
import APIClient from 'APIClient';
import { NetworkStatus, Book, BookStoreState } from 'types/types';
import {
    persistBooks,
    loadPersistedBooks,
    augmentBookWithDownloadStatuses,
} from 'utils/bookStorage';

interface UseBookLoaderReturn {
    books: BookStoreState;
    setBooks: React.Dispatch<React.SetStateAction<BookStoreState>>;
    loading: boolean;
    loadBooks: () => Promise<void>;
}

export const useBookLoader = (): UseBookLoaderReturn => {
    const [books, setBooks] = useCallbackState<BookStoreState>({});
    const [loading, setLoading] = useState(false);
    const loadingGuard = useRef(false);

    const networkStatus = useNetworkStatus();
    const [authSeal] = useContext(AuthContext);

    // Track previous network status for change detection
    const networkStatusRef = useRef(networkStatus);

    // ============ Loading Functions ============

    const loadFromStorage = async (): Promise<void> => {
        console.log('Loading Books from Storage...');
        setLoading(true);
        try {
            const booksFromStorage = await loadPersistedBooks();
            if (booksFromStorage != null) {
                setBooks(booksFromStorage, () => setLoading(false));
                console.log('Books loaded from Storage!');
            } else {
                console.log('No books found in local storage');
            }
        } catch (e) {
            console.error(`Error loading books from storage: ${e}`);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const loadFromAPI = async (): Promise<void> => {
        console.log('Loading Books from API...');
        setLoading(true);
        try {
            if (authSeal === null) {
                throw new Error('Cannot make API call without first loading auth seal');
            }

            const response = await APIClient.getHomeBooks(authSeal);
            if (!response) {
                throw new Error('Could not fetch home books');
            }

            const { library, featured, newReleases, onSale } = response;
            const organizedBooks = await prepBooks(library, [featured, newReleases, onSale].flat());

            //Update local storage any time we fetch fresh data from the API
            persistBooks(organizedBooks);
            //Update state
            setBooks(organizedBooks, () => setLoading(false));
            console.log('Books loaded from API!');
        } catch (e) {
            console.error(`Error loading books from API: ${e}`);
            throw e;
        } finally {
            //Ensure loading is reset to false even in case of errors
            setLoading(false);
        }
    };

    const prepBooks = async (
        ownedBooks: Book[],
        unownedBooks: Book[]
    ): Promise<BookStoreState> => {
        //In case a user owns a book that is also in another category,
        //ignore the book data in the other category in favor of the version in the user's library
        const organizedBooks: { [key: Book['isbn']]: Book } = {};
        unownedBooks.forEach((book) => {
            organizedBooks[book.isbn] = book;
        });
        const augmentedOwnedBooks = await Promise.all(
            ownedBooks.map(async (book) => {
                return await augmentBookWithDownloadStatuses(book);
            })
        );
        augmentedOwnedBooks.forEach(book => {
            organizedBooks[book.isbn] = book;
        });
        return organizedBooks;
    };

    const loadBooks = async (): Promise<void> => {
        // Guard against race conditions: multiple useEffects can trigger loadBooks() simultaneously
        // Check the guard synchronously before proceeding
        if (loadingGuard.current) {
            console.log('Books are already loading, skipping redundant load request.');
            return;
        }
        console.log('Loading Books...');
        loadingGuard.current = true; // Set guard synchronously to block concurrent calls
        try {
            switch (networkStatus) {
                case NetworkStatus.ONLINE:
                    // Network is definitely available
                    console.log('Network is online, loading from API...');
                    await loadFromAPI();
                    break;

                case NetworkStatus.UNKNOWN:
                    // Network state is unknown - optimistically attempt API, fall back to storage
                    console.log('Network state unknown, optimistically attempting API...');
                    try {
                        await loadFromAPI();
                    } catch (e) {
                        console.error(`API failed during unknown network state: ${e}. Falling back to local storage.`);
                        await loadFromStorage();
                    }
                    break;

                case NetworkStatus.OFFLINE:
                    // Network is definitely offline
                    console.log('Network is offline, loading from local storage...');
                    await loadFromStorage();
                    break;

                default:
                    console.error(`Unexpected network status: ${networkStatus}. Falling back to local storage.`);
                    await loadFromStorage();
                    break;
            }
        } finally {
            loadingGuard.current = false; // Always release the guard when done
        }
    };

    // ============ Effects ============

    // Reload when network becomes available
    useEffect(() => {
        const prevNetworkStatus = networkStatusRef.current;

        // Reload when network becomes available or detectable (ONLINE or UNKNOWN)
        if (prevNetworkStatus !== networkStatus &&
            (networkStatus === NetworkStatus.ONLINE || networkStatus === NetworkStatus.UNKNOWN)) {
            console.log(`Network status changed: ${prevNetworkStatus} --> ${networkStatus}`);
            //We may have regained internet connectivity
            //Attempt to reload books
            loadBooks();
        }
        networkStatusRef.current = networkStatus;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkStatus]);

    // Load on auth change
    useEffect(() => {
        if (authSeal !== null) {
            loadBooks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authSeal]);

    return { books, setBooks, loading, loadBooks };
};

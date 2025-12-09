import { ReactNode, createContext, useContext, useEffect } from 'react';
import { Book } from 'types/types';
import * as FileSystem from 'expo-file-system';
import useDevSettings from 'hooks/useDevSettings';
import { ActivityIndicator, Text } from 'react-native-paper';
import { View } from 'react-native';
import { useBookDownloads } from 'hooks/useBookDownloads';
import { useBookLoader } from 'hooks/useBookLoader';
import { checkTrackExists as trackFileExists } from 'utils/bookStorage';

interface BookStoreContextType {
    books: BookStoreState,
    loadBooks: () => Promise<void>,
    downloadAudioFiles: (isbn: Book['isbn']) => Promise<void>,
    removeDownloads: (isbn: Book['isbn']) => Promise<void>,
    trackFileExists: (isbn: Book['isbn'], trackName: string) => Promise<boolean>,
    loading: boolean
}

type BookStoreState = {
    [key: Book['isbn']]: Book
}

const BookStoreContext = createContext<BookStoreContextType | null>(null);


/**
 * The number of Book objects needed by the app is expected to be limited, below 1000.
 * The BookStoreProvider tries to prefetch all the Book objects a user will need the first time the Provider mounts.
 * If the app is not connected to internet service, it will instead try to load books from local storage.
 * The local storage cache is updated every time Book objects are fetched from the API.
 *
 *
 */

// ============ Inner Component (dev settings guaranteed ready) ============

const BookStoreProviderReady = ({ children }: { children: ReactNode }) => {
    // Use the book loader hook (assumes dev settings are loaded)
    const { books, setBooks, loading, loadBooks } = useBookLoader();

    // Use the download management hook
    const { downloadBook, removeDownloads } = useBookDownloads(books, setBooks);

    // One time setup - ensure downloads directory exists
    useEffect(() => {
        const setupDownloadDirectory = async () => {
            try {
                const booksDirectoryPath = `${FileSystem.documentDirectory}books`;
                const dirInfo = await FileSystem.getInfoAsync(booksDirectoryPath);
                if (!dirInfo.exists) {
                    console.log(`Creating books directory at ${booksDirectoryPath}`);
                    await FileSystem.makeDirectoryAsync(booksDirectoryPath, { intermediates: true });
                }
            } catch (e) {
                console.error(`Error during download setup: ${e}`);
            }
        };
        setupDownloadDirectory();
    }, []);

    return (
        <BookStoreContext.Provider value={{ books, loadBooks, downloadAudioFiles: downloadBook, removeDownloads, trackFileExists, loading }}>
            {children}
        </BookStoreContext.Provider>
    );
};

// ============ Outer Component (gates on dev settings) ============

const BookStoreProvider = ({ children }: { children?: ReactNode }) => {
    const { loaded: devSettingsLoaded } = useDevSettings();

    if (!devSettingsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator animating size="large" />
                <Text style={{ marginTop: 10 }}>Loading settings...</Text>
            </View>
        );
    }

    return <BookStoreProviderReady>{children}</BookStoreProviderReady>;
};

const useBookStore = () => {
    const contextValue = useContext(BookStoreContext);
    if (contextValue === null) {
        throw new Error('Attempted use of BookStoreContext outside of Provider');
    }
    return contextValue;

};

export {
    BookStoreContext,
    BookStoreProvider,
    useBookStore,
};

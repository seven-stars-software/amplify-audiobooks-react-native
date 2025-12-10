import { useCallback } from 'react';
import { BookStoreState, DownloadStatus } from 'types/types';
import {
    getTrackFilePath,
    getBookDirectoryPath,
    ensureDirectoryExists,
    downloadTrackFile,
    deleteBookDirectory,
    cleanupFailedDownload,
    persistBooks,
} from 'utils/bookStorage';

type SetBooks = React.Dispatch<React.SetStateAction<BookStoreState>>;

interface UseBookDownloadsReturn {
    downloadBook: (isbn: string) => Promise<void>;
    removeDownloads: (isbn: string) => Promise<void>;
}

export const useBookDownloads = (
    books: BookStoreState,
    setBooks: SetBooks
): UseBookDownloadsReturn => {

    const updateTrackStatus = useCallback(
        (isbn: string, trackName: string, status: DownloadStatus) => {
            setBooks((prev) => {
                const book = prev[isbn];
                if (!book?.tracks) return prev;

                const updatedTracks = book.tracks.map((t) =>
                    t.name === trackName ? { ...t, downloadStatus: status } : t
                );

                const newBooks = {
                    ...prev,
                    [isbn]: { ...book, tracks: updatedTracks },
                };

                persistBooks(newBooks); // Keep cache in sync
                return newBooks;
            });
        },
        [setBooks]
    );

    const downloadBook = useCallback(
        async (isbn: string): Promise<void> => {
            const book = books[isbn];
            if (!book) {
                throw new Error(`Cannot download audio files for unknown book with ISBN [${isbn}]`);
            }
            if (!book.tracks) {
                throw new Error(`Book with ISBN [${isbn}] has no tracks to download`);
            }

            // Ensure directory exists
            const tracksDir = `${getBookDirectoryPath(isbn)}/tracks`;
            await ensureDirectoryExists(tracksDir);

            // Download all tracks in parallel
            await Promise.all(
                book.tracks.map(async (track) => {
                    const destPath = getTrackFilePath(isbn, track.name);
                    console.log(`Downloading track [${track.name}] to [${destPath}]`);

                    try {
                        updateTrackStatus(isbn, track.name, DownloadStatus.DOWNLOADING);
                        await downloadTrackFile(track.uri, destPath);
                        updateTrackStatus(isbn, track.name, DownloadStatus.DOWNLOADED);
                    } catch (error) {
                        console.error(`Error downloading track ${track.name}:`, error);
                        updateTrackStatus(isbn, track.name, DownloadStatus.FAILED);
                        await cleanupFailedDownload(destPath);
                    }
                })
            );
        },
        [books, updateTrackStatus]
    );

    const removeDownloads = useCallback(
        async (isbn: string): Promise<void> => {
            await deleteBookDirectory(isbn);

            setBooks((prev) => {
                const book = prev[isbn];
                if (!book?.tracks) return prev;

                const updatedTracks = book.tracks.map((t) => ({
                    ...t,
                    downloadStatus: DownloadStatus.NOT_DOWNLOADED,
                }));

                const newBooks = {
                    ...prev,
                    [isbn]: { ...book, tracks: updatedTracks },
                };

                persistBooks(newBooks);
                return newBooks;
            });
        },
        [setBooks]
    );

    return { downloadBook, removeDownloads };
};

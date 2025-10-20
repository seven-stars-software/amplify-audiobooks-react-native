import APIClient from "APIClient";
import AuthContext from "contexts/AuthContext";
import { useContext, useEffect, useRef, useState } from "react";
import { Book, Track } from "types/types";
import { createCacheContext, getCacheProvider } from "./GenericCache";
import * as FileSystem from 'expo-file-system';
import { requestPermissionsAsync } from "expo-av/build/Audio";


/**
 * The Tracks Cache holds lists of tracks keyed by the ISBN of the book those tracks belong to.
 */

export const isTrackDownloaded = async (isbn: Book['isbn'], track: Track) => {
    const trackURI = getTrackURI(isbn, track);
    const trackFileInfo = await FileSystem.getInfoAsync(trackURI);
    return trackFileInfo.exists;
}

export const getTrackURI = (isbn: Book['isbn'], track: Track) => {
    const bookURI = getBookURI(isbn);
    return `${bookURI}/tracks/${track.name}.mp3`;
}

export const getBookURI = (isbn: Book['isbn']) => {
    return `${FileSystem.documentDirectory}books/${isbn}`;
}

export const getTrackDownloadable = async (isbn: Book['isbn'], track: Track) => {
    return await FileSystem.createDownloadResumable(
        track.uri,
        getTrackURI(isbn, track),
        {},
    );
}

export const deleteBook = async (isbn: Book['isbn']) => {
    const bookURI = getBookURI(isbn);
    const bookDirInfo = await FileSystem.getInfoAsync(bookURI);
    if(bookDirInfo.exists){
        await FileSystem.deleteAsync(bookURI);
    }
}

export const makeLocalBookDirectories = async (isbn: Book['isbn']) => {
    const booksDirectoryInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}books`);
    console.log(`Info for ${FileSystem.documentDirectory}books`)
    console.log(JSON.stringify(booksDirectoryInfo, null, 4))
    if ('exists' in booksDirectoryInfo && !booksDirectoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}books`)
    }

    const isbnDirectoryInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}books/${isbn}`);
    console.log(`Info for ${FileSystem.documentDirectory}books/${isbn}`)
    console.log(JSON.stringify(isbnDirectoryInfo, null, 4))
    if ('exists' in isbnDirectoryInfo && !isbnDirectoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}books/${isbn}`)
    }

    const tracksDirectoryInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}books/${isbn}/tracks`);
    console.log(`Info for ${FileSystem.documentDirectory}books/${isbn}/tracks`)
    console.log(JSON.stringify(tracksDirectoryInfo, null, 4))
    if ('exists' in tracksDirectoryInfo && !tracksDirectoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}books/${isbn}/tracks`)
    }
}

type TracksLoadingState = undefined | 'loading' | 'loaded' | 'error'
export const TracksCacheContext = createCacheContext<{loadingState: TracksLoadingState, tracks:Track[]}>()

const useTracksLoader = (book: Book) => {
    console.log(`
        Initializing useTracksLoader for [${book.name}]`);
    if(book === undefined){
        throw new Error("Cannot load tracks for undefined book")
    }
    const [authSeal,] = useContext(AuthContext);
    const { data: tracksCache, setKey, clear } = useContext(TracksCacheContext)
    const loadingState = tracksCache[book.isbn]?.loadingState;
    const tracks = book ? tracksCache[book.isbn] : [];

    useEffect(() => {
        console.log(`
            useTracksLoader effect for [${book.name}]`)
        const loadTracks = async () => {
            if (!authSeal) throw new Error("Cannot load tracks without auth seal")

            console.log(`Fetching tracks for [${book.name}]`)
            const rawTracks: Track[] = await APIClient.getBookTracks({ isbn: book.isbn, seal: authSeal });
            console.log(`Got [${rawTracks.length}] tracks for [${book.name}]`)

            //augment API tracks with local storage info
            const completeTracks: Track[] = await Promise.all(
                rawTracks.map(
                    async (track): Promise<Track> => {
                        const isDownloaded = await isTrackDownloaded(book.isbn, track)
                        let localURI = undefined
                        if (isDownloaded) localURI = getTrackURI(book.isbn, track)
                        return { ...track, downloadStatus: isDownloaded ? 'downloaded' : 'not_downloaded', localURI }
                    }
                )
            )
            
            setKey(book.isbn, {loadingState: 'loaded', tracks: completeTracks})
        }
        
        if(loadingState !== 'loaded' && loadingState !== 'loading'){
            setKey(book.isbn, {loadingState: 'loading', tracks: []});
            loadTracks();
        }
    }, [book, loadingState])

    const downloadTracks = async () => {
        //Build all the EXPO download objects
        console.log('Building Expo Downloadables...')

        //Only download tracks that are not already downloaded
        const tracksToDownload = tracks.filter((track) => track.downloadStatus === 'not_downloaded')

        //Create downloadables for each track
        const trackDownloadables = await Promise.all(
            tracksToDownload.map(async (track) => {
                return {
                    downloadable: await getTrackDownloadable(book.isbn, track),
                    s3Key: track.s3Key
                }
            })
        )

        //Ensure directories exist
        console.log('Making local directories...')
        await makeLocalBookDirectories(book.isbn)

        //Kick off downloads
        console.log('Starting downloads...')
        await Promise.all(
            trackDownloadables.map(async (trackDownloadable) => {
                const targetTrack = tracks.find((track) => track.s3Key === trackDownloadable.s3Key)
                if (!targetTrack) throw new Error()

                //Set track download status to 'downloading'
                let updatedTrack = targetTrack;
                updatedTrack.downloadStatus = 'downloading'
                updateTrack(book.isbn, updatedTrack)

                //Start track download
                await trackDownloadable.downloadable.downloadAsync()
                console.log(`   [${trackDownloadable.s3Key}] finished downloading`)

                //update tracks cache with new localURI
                updatedTrack.downloadStatus = 'downloaded'
                updatedTrack.localURI = getTrackURI(book.isbn, updatedTrack)
                updateTrack(book.isbn, updatedTrack)
            })
        )
    }

    const removeDownloads = async () => {
        await deleteBook(book.isbn)
        markAllTracksNotDownloaded(book.isbn)
    }

    const markAllTracksNotDownloaded = (isbn: Book['isbn']) => {
        const bookTracks = data[isbn];
        const downloadStatus: Track['downloadStatus'] = 'not_downloaded';
        const updatedBookTracks = bookTracks.map((track) => {
            return {
                ...track,
                downloadStatus: downloadStatus
            }
        })
        setKey(isbn, updatedBookTracks)
    }

    return {
        loading: loadingState === 'loading',
        tracks: tracksCache[book.isbn]?.tracks || [],
        downloadTracks,
        removeDownloads,
        clear
    }
}

export const useTracksCache = (book: Book) => {
    return useTracksLoader(book)
}

export const TracksCacheProvider = getCacheProvider(TracksCacheContext)
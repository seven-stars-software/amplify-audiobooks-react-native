import { Directory, File, Paths } from 'expo-file-system';
import { Book, Track } from 'types/types';

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
    return Paths.document
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

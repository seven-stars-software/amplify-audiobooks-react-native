import TrackPlayer, { Event, usePlaybackState, Track as PlayerTrack, useTrackPlayerEvents, State, } from 'react-native-track-player';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Book, Track } from 'types/types';
import useCheckpoints, { Checkpoint } from 'hooks/useCheckpoints';
import ErrorContext from './ErrorContext';

type PlaybackController = {
    nowPlaying?: Book,
    pauseBook: () => Promise<void>
    playBook: (
        book: Book,
        tracks?: Track[],
        options?: {
            trackNumber?: number,
            playFromCheckpoint?: boolean
        }
    ) => any
}

const PlaybackContext = createContext<PlaybackController>({
    nowPlaying: undefined,
    pauseBook: async () => { },
    playBook: async (book, tracks?) => { }
});

const playerTrackFromTrack = (book: Book, track: Track): PlayerTrack => {
    return {
        url: track.localURI || track.uri,
        title: track.name,
        artist: book.author,
        album: book.name,
        artwork: book.images[0], // Load artwork from the network
    }
}

/**
 * Invariant: Track Player queue should only ever contain all the tracks from a single book in order. 
 */

export const PlaybackContextProvider = ({ children }: { children?: ReactNode }) => {
    const { handleThrown, handlePlaybackError } = useContext(ErrorContext);
    const playerState = usePlaybackState()
    const [playbackProblemTimeout, setPlaybackProblemTimeout] = useState<number>();
    const [nowPlaying, setNowPlaying] = useState<Book>()
    const { getCheckpoint, setCheckpoint } = useCheckpoints();
    const checkpointRef = useRef<Checkpoint | null>(null)

    useEffect(() => {
        console.log(`Playback State Changed: ${JSON.stringify(playerState, null, 4)}`)
        if(playbackProblemTimeout){
            clearTimeout(playbackProblemTimeout);
        }
        if (playerState.state === State.Buffering 
            || playerState.state === State.Loading) {
            const timeout = setTimeout(() => {
                handlePlaybackError({ error: 'Buffering or Loading took too long' })
            }, 10000);
            setPlaybackProblemTimeout(timeout);
        }
    }, [playerState])

    // Set listener for checkpoints on the active book
    // The `PlaybackProgressUpdated` event triggers on play and pause as well as on interval set in options
    useTrackPlayerEvents([Event.PlaybackProgressUpdated], async (event) => {
        const mostRecentCheckpoint = checkpointRef.current;
        const checkpoint = {
            trackNumber: event.track,
            position: event.position
        }

        // Do not bother saving a checkpoint if progress has not actually updated. The PlaybackProgressUpdated event can fire even when event.track and event.position haven't changed
        const progressChanged = checkpoint.position !== mostRecentCheckpoint?.position
            || checkpoint.trackNumber !== mostRecentCheckpoint?.trackNumber
        if (progressChanged) {

            //NowPlaying should be defined eventually
            if (nowPlaying === undefined) {
                console.log('Track playback progress changed while nowPlaying is undefined')
                return;
            }

            // Saving the checkpoint
            await setCheckpoint(nowPlaying.isbn, checkpoint)

            // Update ref tracking most recently saved checkpoint
            checkpointRef.current = checkpoint
        }
    })

    useTrackPlayerEvents([Event.PlaybackError], async (event) => {
        console.log(`Event.PlaybackError: ${event}`)
        handlePlaybackError(event);
    })

    const PlaybackController: PlaybackController = {
        nowPlaying,
        pauseBook: async () => {
            await TrackPlayer.pause();
        },
        playBook: async (
            book: Book,
            tracks?: Track[],
            options?
        ) => {
            //Update nowPlaying object
            setNowPlaying(book)

            // Get optional args
            let trackNumber;
            let playFromCheckpoint = true;
            if (options) {
                ({ trackNumber, playFromCheckpoint=true } = options)
            }
            // If another book is already playing, clear the queue and add the new book's tracks
            if (book.isbn !== nowPlaying?.isbn) {
                if (!tracks) {
                    return handleThrown(new Error(`Cannot play a new book without providing tracks`))
                }
                await TrackPlayer.reset()
                console.log(`Queueing tracks...`)
                await TrackPlayer.add(tracks.map((track) => {
                    const playerTrack = playerTrackFromTrack(book, track)
                    return playerTrack
                }))
            }
            // If a trackumber is provided, skip ahead to that track
            if (trackNumber !== undefined) {
                await TrackPlayer.skip(trackNumber)
            }
            // trackNumber option overrides playFromCheckpoint
            else if (playFromCheckpoint) {
                const checkpoint = await getCheckpoint(book.isbn)
                if (checkpoint !== null) {
                    await TrackPlayer.skip(checkpoint.trackNumber, checkpoint.position)
                }
            }
            // If asked to play a book that is already active, simply hit play
            await TrackPlayer.play();
        }
    }
    return (
        <PlaybackContext.Provider value={PlaybackController}>
            {children}
        </PlaybackContext.Provider>
    )
}

export default PlaybackContext;


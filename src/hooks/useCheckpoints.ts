import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorContext from 'contexts/ErrorContext';
import { useContext } from 'react';
import { Book } from 'types/types';

export type Checkpoint = {
    trackNumber: number,
    position: number
}

type UseCheckpointReturnType = {
    getCheckpoint: (isbn: Book['isbn']) => Promise<Checkpoint>
    setCheckpoint: (isbn: Book['isbn'], checkpoint: Checkpoint) => Promise<void>
}

const CheckpointStorageBucket = '@CheckpointBucket';

const useCheckpoints = (): UseCheckpointReturnType => {
    const { handleThrown } = useContext(ErrorContext);

    return {
        getCheckpoint: async (isbn) => {
            try {
                const value = await AsyncStorage.getItem(`${CheckpointStorageBucket}:${isbn}`);
                if (value !== null) {
                    const checkpoint = JSON.parse(value);
                    return checkpoint;
                }
                return null;
            } catch (e) {
                handleThrown(e);
            }
        },
        setCheckpoint: async (isbn, checkpoint) => {
            try {
                await AsyncStorage.setItem(`${CheckpointStorageBucket}:${isbn}`, JSON.stringify(checkpoint));
            } catch (e) {
                handleThrown(e);
            }
        },
    };
};

export default useCheckpoints;

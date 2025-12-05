import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import useCheckpoints, { Checkpoint } from '../../src/hooks/useCheckpoints';
import ErrorContext from '../../src/contexts/ErrorContext';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Create a wrapper with ErrorContext
const createWrapper = (handleThrown: jest.Mock = jest.fn()) => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      ErrorContext.Provider,
      { value: { handleThrown, clearError: jest.fn(), errorMessage: null } },
      children
    );
  return wrapper;
};

describe('useCheckpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('getCheckpoint', () => {
    it('should return null when no checkpoint exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(),
      });

      let checkpoint: Checkpoint | null = null;
      await act(async () => {
        checkpoint = await result.current.getCheckpoint('ISBN123');
      });

      expect(checkpoint).toBeNull();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@CheckpointBucket:ISBN123');
    });

    it('should return stored checkpoint', async () => {
      const storedCheckpoint: Checkpoint = { trackNumber: 3, position: 125.5 };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedCheckpoint));

      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(),
      });

      let checkpoint: Checkpoint | null = null;
      await act(async () => {
        checkpoint = await result.current.getCheckpoint('ISBN123');
      });

      expect(checkpoint).toEqual(storedCheckpoint);
    });

    it('should call handleThrown on error', async () => {
      const error = new Error('Storage error');
      mockAsyncStorage.getItem.mockRejectedValue(error);
      const handleThrown = jest.fn();

      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(handleThrown),
      });

      await act(async () => {
        await result.current.getCheckpoint('ISBN123');
      });

      expect(handleThrown).toHaveBeenCalledWith(error);
    });

    it('should use correct storage key format', async () => {
      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.getCheckpoint('978-3-16-148410-0');
      });

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        '@CheckpointBucket:978-3-16-148410-0'
      );
    });
  });

  describe('setCheckpoint', () => {
    it('should store checkpoint in AsyncStorage', async () => {
      const checkpoint: Checkpoint = { trackNumber: 5, position: 300.25 };

      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.setCheckpoint('ISBN456', checkpoint);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@CheckpointBucket:ISBN456',
        JSON.stringify(checkpoint)
      );
    });

    it('should call handleThrown on error', async () => {
      const error = new Error('Storage error');
      mockAsyncStorage.setItem.mockRejectedValue(error);
      const handleThrown = jest.fn();

      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(handleThrown),
      });

      await act(async () => {
        await result.current.setCheckpoint('ISBN456', { trackNumber: 1, position: 0 });
      });

      expect(handleThrown).toHaveBeenCalledWith(error);
    });

    it('should store checkpoint with position 0', async () => {
      const checkpoint: Checkpoint = { trackNumber: 0, position: 0 };

      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.setCheckpoint('ISBN789', checkpoint);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@CheckpointBucket:ISBN789',
        JSON.stringify(checkpoint)
      );
    });

    it('should overwrite existing checkpoint', async () => {
      const oldCheckpoint: Checkpoint = { trackNumber: 1, position: 50 };
      const newCheckpoint: Checkpoint = { trackNumber: 2, position: 100 };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(oldCheckpoint));

      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.setCheckpoint('ISBN123', newCheckpoint);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@CheckpointBucket:ISBN123',
        JSON.stringify(newCheckpoint)
      );
    });
  });

  describe('integration', () => {
    it('should get and set checkpoints for different books', async () => {
      const checkpoint1: Checkpoint = { trackNumber: 1, position: 100 };
      const checkpoint2: Checkpoint = { trackNumber: 5, position: 500 };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(checkpoint1))
        .mockResolvedValueOnce(JSON.stringify(checkpoint2));

      const { result } = renderHook(() => useCheckpoints(), {
        wrapper: createWrapper(),
      });

      let result1: Checkpoint | null = null;
      let result2: Checkpoint | null = null;

      await act(async () => {
        result1 = await result.current.getCheckpoint('Book1');
        result2 = await result.current.getCheckpoint('Book2');
      });

      expect(result1).toEqual(checkpoint1);
      expect(result2).toEqual(checkpoint2);
    });
  });
});

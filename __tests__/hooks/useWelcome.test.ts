import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import useWelcome, { WelcomeStatus } from '../../src/hooks/useWelcome';
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

describe('useWelcome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('initialization', () => {
    it('should return incomplete status when no stored value', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useWelcome(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.welcomeStatus).toBe(WelcomeStatus.incomplete);
      });
    });

    it('should return stored complete status', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(WelcomeStatus.complete);

      const { result } = renderHook(() => useWelcome(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.welcomeStatus).toBe(WelcomeStatus.complete);
      });
    });

    it('should return stored skipped status', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(WelcomeStatus.skipped);

      const { result } = renderHook(() => useWelcome(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.welcomeStatus).toBe(WelcomeStatus.skipped);
      });
    });

    it('should call handleThrown for invalid stored status', async () => {
      const handleThrown = jest.fn();
      mockAsyncStorage.getItem.mockResolvedValue('INVALID_STATUS');

      renderHook(() => useWelcome(), {
        wrapper: createWrapper(handleThrown),
      });

      await waitFor(() => {
        expect(handleThrown).toHaveBeenCalled();
      });
    });
  });

  describe('skipWelcome', () => {
    it('should update status to skipped', async () => {
      const { result } = renderHook(() => useWelcome(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.welcomeStatus).toBe(WelcomeStatus.incomplete);
      });

      await act(async () => {
        await result.current.skipWelcome();
      });

      expect(result.current.welcomeStatus).toBe(WelcomeStatus.skipped);
    });

    it('should persist skipped status to AsyncStorage', async () => {
      const { result } = renderHook(() => useWelcome(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.welcomeStatus).toBeDefined();
      });

      await act(async () => {
        await result.current.skipWelcome();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@WelcomeBucket:status',
        WelcomeStatus.skipped
      );
    });
  });

  describe('completeWelcome', () => {
    it('should update status to complete', async () => {
      const { result } = renderHook(() => useWelcome(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.welcomeStatus).toBe(WelcomeStatus.incomplete);
      });

      await act(async () => {
        await result.current.completeWelcome();
      });

      expect(result.current.welcomeStatus).toBe(WelcomeStatus.complete);
    });

    it('should persist complete status to AsyncStorage', async () => {
      const { result } = renderHook(() => useWelcome(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.welcomeStatus).toBeDefined();
      });

      await act(async () => {
        await result.current.completeWelcome();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@WelcomeBucket:status',
        WelcomeStatus.complete
      );
    });
  });

  describe('error handling', () => {
    it('should call handleThrown when getItem fails', async () => {
      const error = new Error('Storage error');
      const handleThrown = jest.fn();
      mockAsyncStorage.getItem.mockRejectedValue(error);

      renderHook(() => useWelcome(), {
        wrapper: createWrapper(handleThrown),
      });

      await waitFor(() => {
        expect(handleThrown).toHaveBeenCalledWith(error);
      });
    });

    it('should call handleThrown when setItem fails', async () => {
      const error = new Error('Storage error');
      const handleThrown = jest.fn();
      mockAsyncStorage.setItem.mockRejectedValue(error);

      const { result } = renderHook(() => useWelcome(), {
        wrapper: createWrapper(handleThrown),
      });

      await waitFor(() => {
        expect(result.current.welcomeStatus).toBeDefined();
      });

      await act(async () => {
        await result.current.completeWelcome();
      });

      await waitFor(() => {
        expect(handleThrown).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('WelcomeStatus enum', () => {
    it('should have correct values', () => {
      expect(WelcomeStatus.complete).toBe('COMPLETE');
      expect(WelcomeStatus.incomplete).toBe('INCOMPLETE');
      expect(WelcomeStatus.skipped).toBe('SKIPPED');
    });
  });
});

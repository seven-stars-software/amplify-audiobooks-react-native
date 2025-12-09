import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextProvider } from '../../src/contexts/AuthContext';
import AuthContext from '../../src/contexts/AuthContext';

describe('AuthContext', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthContextProvider', () => {
    it('provides initial null auth seal', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      expect(result.current[0]).toBeNull();
    });

    it('loads auth seal from AsyncStorage on mount', async () => {
      const mockSeal = 'test-seal-from-storage';
      mockAsyncStorage.getItem.mockResolvedValueOnce(mockSeal);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_seal');
        expect(result.current[0]).toBe(mockSeal);
      });
    });

    it('does not set auth seal if AsyncStorage returns undefined', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(undefined as any);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_seal');
      });

      // Auth seal should remain null since storage returned undefined
      expect(result.current[0]).toBeNull();
    });

    it('stores auth seal to AsyncStorage when set', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      const newSeal = 'new-test-seal';
      const setAuthSeal = result.current[1];

      await act(async () => {
        await setAuthSeal(newSeal);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_seal', newSeal);
    });

    it('does not store to AsyncStorage when seal is null', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      const setAuthSeal = result.current[1];

      await act(async () => {
        await setAuthSeal(null as any);
      });

      expect(result.current[0]).toBeNull();
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('deletes auth seal from storage and state', async () => {
      // First, set a seal
      const initialSeal = 'seal-to-delete';
      mockAsyncStorage.getItem.mockResolvedValueOnce(initialSeal);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current[0]).toBe(initialSeal);
      });

      // Now delete it
      const deleteAuthSeal = result.current[2];

      await act(async () => {
        await deleteAuthSeal();
      });

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_seal');
      expect(result.current[0]).toBeNull();
    });

    it('handles errors gracefully when deleting auth seal', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const deleteError = new Error('AsyncStorage delete failed');
      mockAsyncStorage.removeItem.mockRejectedValueOnce(deleteError);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      const deleteAuthSeal = result.current[2];

      await act(async () => {
        await deleteAuthSeal();
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(deleteError);
      expect(result.current[0]).toBeNull();

      consoleLogSpy.mockRestore();
    });

    it('provides set and delete functions via context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      expect(result.current).toHaveLength(3);
      expect(typeof result.current[1]).toBe('function'); // setAndStoreAuthSeal
      expect(typeof result.current[2]).toBe('function'); // deleteAuthSeal
    });
  });
});

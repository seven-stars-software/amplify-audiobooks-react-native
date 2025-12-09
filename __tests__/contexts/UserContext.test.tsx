import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { UserContextProvider } from '../../src/contexts/UserContext';
import UserContext from '../../src/contexts/UserContext';

describe('UserContext', () => {
  describe('UserContextProvider', () => {
    it('provides initial null user', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UserContextProvider>{children}</UserContextProvider>
      );

      const { result } = renderHook(() => React.useContext(UserContext), { wrapper });

      expect(result.current[0]).toBeNull();
    });

    it('provides setUser function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UserContextProvider>{children}</UserContextProvider>
      );

      const { result } = renderHook(() => React.useContext(UserContext), { wrapper });

      expect(typeof result.current[1]).toBe('function');
    });

    it('updates user state when setUser is called', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UserContextProvider>{children}</UserContextProvider>
      );

      const { result } = renderHook(() => React.useContext(UserContext), { wrapper });

      const newUser = {
        wpUser: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      act(() => {
        result.current[1](newUser);
      });

      expect(result.current[0]).toEqual(newUser);
    });

    it('can clear user by setting to null', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UserContextProvider>{children}</UserContextProvider>
      );

      const { result } = renderHook(() => React.useContext(UserContext), { wrapper });

      // First set a user
      act(() => {
        result.current[1]({ wpUser: { id: 1 } });
      });

      expect(result.current[0]).not.toBeNull();

      // Then clear it
      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
    });

    it('can update user with wpUser containing any properties', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UserContextProvider>{children}</UserContextProvider>
      );

      const { result } = renderHook(() => React.useContext(UserContext), { wrapper });

      const userWithCustomProps = {
        wpUser: {
          id: 1,
          customField: 'custom value',
          nestedObject: {
            key: 'value',
          },
          arrayField: [1, 2, 3],
        },
      };

      act(() => {
        result.current[1](userWithCustomProps);
      });

      expect(result.current[0]).toEqual(userWithCustomProps);
    });

    it('updates user state using function updater', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UserContextProvider>{children}</UserContextProvider>
      );

      const { result } = renderHook(() => React.useContext(UserContext), { wrapper });

      // Set initial user
      act(() => {
        result.current[1]({ wpUser: { id: 1, name: 'Original' } });
      });

      // Update using function
      act(() => {
        result.current[1]((prev) => ({
          wpUser: {
            ...prev?.wpUser,
            name: 'Updated',
          },
        }));
      });

      expect(result.current[0]?.wpUser?.name).toBe('Updated');
      expect(result.current[0]?.wpUser?.id).toBe(1);
    });
  });
});

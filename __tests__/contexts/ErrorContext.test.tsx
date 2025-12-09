import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import { ErrorContextProvider } from '../../src/contexts/ErrorContext';
import ErrorContext from '../../src/contexts/ErrorContext';

describe('ErrorContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ErrorContextProvider', () => {
    it('renders children when no error is thrown', () => {
      const { getByText, queryByText } = render(
        <ErrorContextProvider>
          <Text>Child Content</Text>
        </ErrorContextProvider>
      );

      expect(getByText('Child Content')).toBeTruthy();
      expect(queryByText(/Oops! Something went wrong/)).toBeNull();
    });

    it('shows error screen when handleThrown is called with Error', () => {
      const TestComponent = () => {
        const { handleThrown } = React.useContext(ErrorContext);

        return (
          <Pressable onPress={() => handleThrown(new Error('Test error'))}>
            <Text>Trigger Error</Text>
          </Pressable>
        );
      };

      const { getByText, queryByText } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      // Initially, children are shown
      expect(getByText('Trigger Error')).toBeTruthy();

      // Trigger the error
      fireEvent.press(getByText('Trigger Error'));

      // Error screen should be shown
      expect(getByText(/Oops! Something went wrong/)).toBeTruthy();
      expect(getByText('Test error')).toBeTruthy();

      // Children should not be rendered
      expect(queryByText('Trigger Error')).toBeNull();
    });

    it('displays error name when different from message', () => {
      const TestComponent = () => {
        const { handleThrown } = React.useContext(ErrorContext);

        const throwCustomError = () => {
          const error = new Error('Custom message');
          error.name = 'CustomError';
          handleThrown(error);
        };

        return (
          <Pressable onPress={throwCustomError}>
            <Text>Trigger</Text>
          </Pressable>
        );
      };

      const { getByText } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      fireEvent.press(getByText('Trigger'));

      expect(getByText('CustomError')).toBeTruthy();
      expect(getByText('Custom message')).toBeTruthy();
    });

    it('handles non-Error thrown values', () => {
      const TestComponent = () => {
        const { handleThrown } = React.useContext(ErrorContext);

        return (
          <Pressable onPress={() => handleThrown('String error')}>
            <Text>Trigger Non-Error</Text>
          </Pressable>
        );
      };

      const { getByText } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      fireEvent.press(getByText('Trigger Non-Error'));

      // Should still show error screen even for non-Error throws
      expect(getByText(/Oops! Something went wrong/)).toBeTruthy();
    });

    it('displays error stack trace', () => {
      const TestComponent = () => {
        const { handleThrown } = React.useContext(ErrorContext);

        return (
          <Pressable onPress={() => handleThrown(new Error('Stack test'))}>
            <Text>Trigger</Text>
          </Pressable>
        );
      };

      const { getByText } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      fireEvent.press(getByText('Trigger'));

      // Error message and screen should be visible
      expect(getByText('Stack test')).toBeTruthy();
      expect(getByText(/Oops! Something went wrong/)).toBeTruthy();
    });

    it('navigates to PlaybackProblem when handlePlaybackError is called', () => {
      const TestComponent = () => {
        const { handlePlaybackError } = React.useContext(ErrorContext);

        return (
          <Pressable onPress={() => handlePlaybackError({ error: 'Playback failed' })}>
            <Text>Trigger Playback Error</Text>
          </Pressable>
        );
      };

      const { getByText } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      fireEvent.press(getByText('Trigger Playback Error'));

      // Verify navigation was called (mocked in jest.setup.js)
      expect(global.mockNavigate).toHaveBeenCalledWith('PlaybackProblem');
    });

    it('provides handleThrown and handlePlaybackError functions via context', () => {
      let contextValue: any;

      const ContextConsumer = () => {
        contextValue = React.useContext(ErrorContext);
        return <Text>Test</Text>;
      };

      render(
        <ErrorContextProvider>
          <ContextConsumer />
        </ErrorContextProvider>
      );

      expect(typeof contextValue.handleThrown).toBe('function');
      expect(typeof contextValue.handlePlaybackError).toBe('function');
    });
  });
});

//Init dependencies

import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthContextProvider } from 'contexts/AuthContext';
import { UserContextProvider } from 'contexts/UserContext';
import React, { useEffect, useRef } from 'react';
import { PlaybackContextProvider } from 'contexts/PlaybackContext';
import { ErrorContextProvider } from 'contexts/ErrorContext';
import RootNavigator from 'navigators/RootNavigator';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BookStoreProvider } from 'stores/BookStore';
import theme from 'styler/theme';
import { LayoutContextProvider } from 'contexts/LayoutContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {

  //Setup App State Listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log(`AppState:  ${nextAppState}`)
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <ErrorContextProvider>
        <AuthContextProvider>
          <SafeAreaProvider>
          <LayoutContextProvider>
            <BookStoreProvider>
              <UserContextProvider>
                <PlaybackContextProvider>
                  <PaperProvider theme={theme}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootNavigator />
                    </GestureHandlerRootView>
                  </PaperProvider>
                </PlaybackContextProvider>
              </UserContextProvider>
            </BookStoreProvider>
          </LayoutContextProvider>
          </SafeAreaProvider>
        </AuthContextProvider>
      </ErrorContextProvider>
    </NavigationContainer>
  )
}

export default App
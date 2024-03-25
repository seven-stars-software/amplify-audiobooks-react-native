//Init dependencies

import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthContextProvider } from 'contexts/AuthContext';
import { UserContextProvider } from 'contexts/UserContext';
import React, { useEffect, useRef } from 'react';
import { CachesProvider } from 'contexts/CachesProvider';
import { PlaybackContextProvider } from 'contexts/PlaybackContext';
import { ErrorContextProvider } from 'contexts/ErrorContext';
import RootNavigator from 'navigators/RootNavigator';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {
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
        <CachesProvider>
          <AuthContextProvider>
            <UserContextProvider>
              <PlaybackContextProvider>
                <PaperProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <RootNavigator />
                  </GestureHandlerRootView>
                </PaperProvider>
              </PlaybackContextProvider>
            </UserContextProvider>
          </AuthContextProvider>
        </CachesProvider>
      </ErrorContextProvider>
    </NavigationContainer>
  )
}

export default App
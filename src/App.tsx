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
import { AppState, View } from 'react-native';
import { GestureHandlerRootView, Text } from 'react-native-gesture-handler';
import { BookStoreProvider } from 'stores/BookStore';
import theme from 'styler/theme';
import { LayoutContextProvider } from 'contexts/LayoutContext';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

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
      <SafeAreaProvider>
        <View>
          <Text>App is running...</Text>
        </View>
      </SafeAreaProvider>
      
    </NavigationContainer>
  )

  /*
  return (
    <NavigationContainer>
      <SafeAreaProvider>
      <ErrorContextProvider>
        <AuthContextProvider>
          
          <LayoutContextProvider>
            <BookStoreProvider>
              <CachesProvider>

                <UserContextProvider>
                  <PlaybackContextProvider>
                    <PaperProvider theme={theme}>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <RootNavigator />
                      </GestureHandlerRootView>
                    </PaperProvider>
                  </PlaybackContextProvider>
                </UserContextProvider>

              </CachesProvider>
            </BookStoreProvider>
          </LayoutContextProvider>
          
        </AuthContextProvider>
      </ErrorContextProvider>
      </SafeAreaProvider>
    </NavigationContainer>
  )
    */
}

export default App
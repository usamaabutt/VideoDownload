import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AppProviders = ({ children }) => (
  <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider>{children}</SafeAreaProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AppProviders;

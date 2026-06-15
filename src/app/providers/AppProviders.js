import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const AppProviders = ({ children }) => (
  <GestureHandlerRootView style={styles.root}>
    {children}
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AppProviders;

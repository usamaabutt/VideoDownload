import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '@theme';

const LoadingState = ({ message = 'Loading videos...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.accent} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    color: colors.textDim,
    fontSize: 14,
  },
});

export default LoadingState;

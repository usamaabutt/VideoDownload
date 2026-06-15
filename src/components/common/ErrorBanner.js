import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '@theme';

const ErrorBanner = ({ message, onDismiss }) => (
  <TouchableOpacity style={styles.banner} onPress={onDismiss} activeOpacity={0.8}>
    <Text style={styles.text}>⚠ {message} — tap to dismiss</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.errorBackground,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.accentMuted,
  },
  text: {
    color: colors.error,
    fontSize: 13,
  },
});

export default ErrorBanner;

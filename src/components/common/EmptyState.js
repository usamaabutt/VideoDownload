import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@theme';

const EmptyState = ({
  icon = '📭',
  title = 'No videos found',
  subtitle = 'Try a different search term',
}) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 14,
  },
});

export default EmptyState;

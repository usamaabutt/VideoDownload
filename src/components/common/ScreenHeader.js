import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@theme';

const ScreenHeader = ({ title = 'VidFlow' }) => (
  <View style={styles.header}>
    <Text style={styles.logo}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  logo: {
    color: colors.accent,
    ...typography.logo,
  },
});

export default ScreenHeader;

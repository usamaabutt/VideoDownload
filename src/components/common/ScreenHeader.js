import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@theme';

const ScreenHeader = ({ title = 'VidFlow', subtitle }) => (
  <View style={styles.header}>
    <Text style={styles.logo}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.headerGradientEnd,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  logo: {
    color: colors.textOnPrimary,
    ...typography.logo,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ScreenHeader;

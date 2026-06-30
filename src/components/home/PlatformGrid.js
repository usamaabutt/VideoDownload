import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, shadows } from '@theme';
import { PLATFORM_TILES } from '@config/platforms';
import { PlatformIcon } from '@components/icons/AppIcons';

const PlatformGrid = ({ onPressPlatform, title = 'Download videos from' }) => (
  <View style={styles.wrapper}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.grid}>
      {PLATFORM_TILES.map((platform) => (
        <TouchableOpacity
          key={platform.id}
          style={[styles.tile, shadows.card]}
          onPress={() => onPressPlatform?.(platform.id)}
          activeOpacity={0.85}
        >
          <View style={[styles.iconCircle, { backgroundColor: platform.bg }]}>
            <PlatformIcon platformId={platform.id} color={platform.color} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {platform.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tile: {
    width: '22%',
    minWidth: 72,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PlatformGrid;

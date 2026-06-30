import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { colors, spacing } from '@theme';

const OnboardingHero = ({ tagline = 'Download · Edit · Organize' }) => (
  <View style={styles.hero}>
    <SafeAreaView edges={['top']} style={styles.heroSafe}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Feather name="play" size={18} color={colors.textOnPrimary} />
        </View>
        <View>
          <Text style={styles.brand}>VidFlow</Text>
          <Text style={styles.tagline}>{tagline}</Text>
        </View>
      </View>
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.headerGradientEnd,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: spacing.xl,
  },
  heroSafe: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.textOnPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
});

export default OnboardingHero;

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@theme';
import { MIN_INTERESTS, MAX_INTERESTS } from '@config/interests';
import useUserStore from '@store/userStore';
import useFeedStore from '@store/feedStore';
import OnboardingHero from '@components/onboarding/OnboardingHero';
import InterestPicker from '@components/onboarding/InterestPicker';

const InterestSelectionScreen = () => {
  const name = useUserStore((s) => s.name);
  const setInterests = useUserStore((s) => s.setInterests);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const greeting = useMemo(() => (name ? `Hi ${name.split(' ')[0]}!` : 'Almost done!'), [name]);

  const handleToggle = useCallback((id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_INTERESTS) {
        return current;
      }
      return [...current, id];
    });
    setError('');
  }, []);

  const handleFinish = useCallback(async () => {
    if (selectedIds.length < MIN_INTERESTS) {
      setError(`Pick at least ${MIN_INTERESTS} topic to continue.`);
      return;
    }

    setLoading(true);
    try {
      setInterests(selectedIds);
      completeOnboarding();
      await useFeedStore.getState().fetchHomeSections(selectedIds);
    } finally {
      setLoading(false);
    }
  }, [selectedIds, setInterests, completeOnboarding]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerGradientEnd} />
      <OnboardingHero tagline="Choose your interests" />

      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.step}>Step 2 of 2</Text>
          <Text style={styles.title}>{greeting}</Text>
          <Text style={styles.subtitle}>
            Select up to {MAX_INTERESTS} topics you enjoy. Each one gets its own row on My Feed.
          </Text>

          <InterestPicker
            selectedIds={selectedIds}
            onToggle={handleToggle}
            hint={`${selectedIds.length}/${MAX_INTERESTS} selected`}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (loading || selectedIds.length < MIN_INTERESTS) && styles.primaryBtnDisabled,
            ]}
            onPress={handleFinish}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.primaryBtnText}>Continue to VidFlow</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerGradientEnd,
  },
  sheet: {
    flex: 1,
    marginTop: -spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  step: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryBtnText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default InterestSelectionScreen;

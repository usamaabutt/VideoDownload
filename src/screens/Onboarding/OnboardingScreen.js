import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '@config/routes';
import { ONBOARDING_SLIDES } from '@config/interests';
import { colors, spacing } from '@theme';
import OnboardingHero from '@components/onboarding/OnboardingHero';
import OnboardingSlide from '@components/onboarding/OnboardingSlide';

const OnboardingScreen = ({ navigation }) => {
  const listRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  const handleNext = useCallback(() => {
    if (!isLastSlide) {
      const nextIndex = activeIndex + 1;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
      return;
    }
    navigation.navigate(ROUTES.SIGNUP);
  }, [activeIndex, isLastSlide, navigation]);

  const handleSkip = useCallback(() => {
    navigation.navigate(ROUTES.SIGNUP);
  }, [navigation]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]?.index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerGradientEnd} />
      <OnboardingHero />

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <FlatList
          ref={listRef}
          data={ONBOARDING_SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
          renderItem={({ item }) => (
            <OnboardingSlide
              slideId={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              highlights={item.highlights}
            />
          )}
        />

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <View style={styles.progressRow}>
            <View style={styles.dots}>
              {ONBOARDING_SLIDES.map((slide, index) => (
                <View
                  key={slide.id}
                  style={[styles.dot, index === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
            <Text style={styles.counter}>
              {activeIndex + 1} / {ONBOARDING_SLIDES.length}
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>{isLastSlide ? 'Create account' : 'Continue'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} hitSlop={12}>
            <Text style={styles.skipText}>Skip introduction</Text>
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
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.accent,
  },
  counter: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OnboardingScreen;

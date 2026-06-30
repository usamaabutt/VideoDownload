import React, { useState, useCallback } from 'react';
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
import Feather from 'react-native-vector-icons/Feather';
import { MIN_INTERESTS, MAX_INTERESTS } from '@config/interests';
import { colors, spacing } from '@theme';
import useUserStore from '@store/userStore';
import useFeedStore from '@store/feedStore';
import InterestPicker from '@components/onboarding/InterestPicker';

const FeedPreferencesScreen = ({ navigation }) => {
  const savedInterests = useUserStore((s) => s.interests);
  const setInterests = useUserStore((s) => s.setInterests);

  const [selectedIds, setSelectedIds] = useState(savedInterests);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleSave = useCallback(async () => {
    if (selectedIds.length < MIN_INTERESTS) {
      setError(`Keep at least ${MIN_INTERESTS} topic saved.`);
      return;
    }

    setSaving(true);
    try {
      setInterests(selectedIds);
      await useFeedStore.getState().fetchHomeSections(selectedIds);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }, [selectedIds, setInterests, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Feather name="x" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily feed</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your interests</Text>
        <Text style={styles.subtitle}>
          Each topic you pick gets its own row on My Feed, below Trending.
        </Text>

        <InterestPicker
          selectedIds={selectedIds}
          onToggle={handleToggle}
          hint={`${selectedIds.length}/${MAX_INTERESTS} selected`}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.9}
        >
          {saving ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.primaryBtnText}>Save interests</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 22,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.error,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
    opacity: 0.7,
  },
  primaryBtnText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FeedPreferencesScreen;

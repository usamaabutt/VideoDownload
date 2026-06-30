import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, spacing } from '@theme';
import { getInterestById } from '@config/interests';

const FeedInterestBar = ({ interestIds = [], activeLabel, onEditPress }) => {
  if (!interestIds.length) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Your daily feed</Text>
          {activeLabel ? <Text style={styles.activeLabel}>Now showing · {activeLabel}</Text> : null}
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={onEditPress} activeOpacity={0.85}>
          <Feather name="sliders" size={14} color={colors.accent} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {interestIds.map((id) => {
          const interest = getInterestById(id);
          if (!interest) return null;
          const isActive = activeLabel === interest.label;

          return (
            <View
              key={id}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Feather
                name={interest.icon}
                size={13}
                color={isActive ? colors.textOnPrimary : interest.color}
              />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {interest.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  activeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.accentLight,
  },
  editText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.textOnPrimary,
  },
});

export default FeedInterestBar;

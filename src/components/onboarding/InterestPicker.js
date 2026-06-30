import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, spacing, shadows } from '@theme';
import { FEED_INTERESTS, MAX_INTERESTS } from '@config/interests';

const InterestPicker = ({ selectedIds = [], onToggle, hint }) => {
  const atLimit = selectedIds.length >= MAX_INTERESTS;

  return (
    <View style={styles.wrapper}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.grid}>
        {FEED_INTERESTS.map((interest) => {
          const selected = selectedIds.includes(interest.id);
          const disabled = !selected && atLimit;

          return (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.chip,
                shadows.card,
                selected && styles.chipSelected,
                disabled && styles.chipDisabled,
              ]}
              onPress={() => onToggle?.(interest.id)}
              disabled={disabled}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: selected ? interest.color : `${interest.color}18` },
                ]}
              >
                <Feather
                  name={interest.icon}
                  size={18}
                  color={selected ? colors.textOnPrimary : interest.color}
                />
              </View>
              <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
                {interest.label}
              </Text>
              {selected ? (
                <View style={styles.check}>
                  <Feather name="check" size={12} color={colors.textOnPrimary} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    position: 'relative',
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.accentDark,
  },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InterestPicker;

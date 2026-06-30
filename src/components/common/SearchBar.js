import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@theme';

const SearchBar = ({
  value,
  placeholder = 'Search or paste video link...',
  onChangeText,
  onSubmit,
  onClear,
  light = false,
}) => (
  <View style={[styles.container, light && styles.containerLight]}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
      style={[styles.input, light && styles.inputLight]}
      placeholder={placeholder}
      placeholderTextColor={light ? 'rgba(255,255,255,0.75)' : colors.textDim}
      value={value}
      onChangeText={onChangeText}
      returnKeyType="search"
      onSubmitEditing={onSubmit}
    />
    {value.length > 0 && (
      <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
        <Text style={[styles.clearText, light && styles.clearTextLight]}>✕</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerLight: {
    marginHorizontal: 0,
    marginVertical: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: 'transparent',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 11,
  },
  inputLight: {
    color: colors.textPrimary,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearText: {
    color: colors.textDim,
    fontSize: 14,
  },
  clearTextLight: {
    color: colors.textMuted,
  },
});

export default SearchBar;

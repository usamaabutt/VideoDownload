import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { colors, spacing } from '@theme';
import { formatMegabytes } from '@utils/format';

const QualityPickerModal = ({
  visible,
  title,
  thumbnail,
  qualities = [],
  loading = false,
  onSelect,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
        <Text style={styles.heading}>Choose quality</Text>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} resizeMode="cover" />
        ) : null}
        {title ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {title}
          </Text>
        ) : null}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Fetching available qualities…</Text>
          </View>
        ) : (
          <ScrollView style={styles.list} bounces={false}>
            {qualities.map((quality) => (
              <TouchableOpacity
                key={`${quality.height}-${quality.label}`}
                style={styles.option}
                onPress={() => onSelect(quality)}
                activeOpacity={0.85}
              >
                <View>
                  <Text style={styles.optionLabel}>{quality.label}</Text>
                  {quality.fileSize > 0 ? (
                    <Text style={styles.optionMeta}>
                      ~{formatMegabytes(quality.fileSize)}
                    </Text>
                  ) : (
                    <Text style={styles.optionMeta}>Estimated size unavailable</Text>
                  )}
                </View>
                <Text style={styles.optionArrow}>↓</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  thumbnail: {
    width: '100%',
    height: 168,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  list: {
    maxHeight: 320,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionMeta: {
    color: colors.textDim,
    fontSize: 12,
  },
  optionArrow: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QualityPickerModal;

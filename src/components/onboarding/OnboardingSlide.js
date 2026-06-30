import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, spacing, shadows } from '@theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;

const SlideIllustration = ({ slideId }) => {
  if (slideId === 'download') {
    return (
      <View style={[styles.mockCard, shadows.card]}>
        <View style={styles.mockHeader}>
          <Feather name="link-2" size={16} color={colors.accent} />
          <Text style={styles.mockHeaderText}>Paste video link</Text>
        </View>
        <View style={styles.platformRow}>
          {['youtube', 'instagram', 'facebook', 'music'].map((icon) => (
            <View key={icon} style={styles.platformDot}>
              <Feather name={icon === 'music' ? 'music' : icon === 'youtube' ? 'play' : 'globe'} size={14} color={colors.accent} />
            </View>
          ))}
        </View>
        <View style={styles.mockDownloadBar}>
          <Feather name="download" size={14} color={colors.textOnPrimary} />
          <Text style={styles.mockDownloadText}>Save to gallery</Text>
        </View>
      </View>
    );
  }

  if (slideId === 'edit') {
    return (
      <View style={[styles.mockCard, shadows.card]}>
        <View style={styles.toolGrid}>
          {[
            { icon: 'scissors', label: 'Trim' },
            { icon: 'minimize-2', label: 'Compress' },
            { icon: 'layers', label: 'Merge' },
            { icon: 'share-2', label: 'Share' },
          ].map((tool) => (
            <View key={tool.label} style={styles.toolTile}>
              <Feather name={tool.icon} size={18} color={colors.accent} />
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mockCard, shadows.card]}>
      <View style={styles.videoRow}>
        <View style={styles.thumb} />
        <View style={styles.videoMeta}>
          <View style={styles.metaLine} />
          <View style={[styles.metaLine, styles.metaLineShort]} />
          <View style={styles.metaBadge}>
            <Feather name="download" size={12} color={colors.download} />
            <Text style={styles.metaBadgeText}>Ready</Text>
          </View>
        </View>
      </View>
      <View style={styles.videoRow}>
        <View style={[styles.thumb, styles.thumbAlt]} />
        <View style={styles.videoMeta}>
          <View style={styles.metaLine} />
          <View style={[styles.metaLine, styles.metaLineShort]} />
        </View>
      </View>
    </View>
  );
};

const OnboardingSlide = ({ slideId, icon, title, description, highlights = [] }) => (
  <View style={[styles.slide, { width }]}>
    <SlideIllustration slideId={slideId} />

    <View style={styles.iconBadge}>
      <Feather name={icon} size={18} color={colors.accent} />
    </View>

    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>

    <View style={styles.highlights}>
      {highlights.map((item) => (
        <View key={item} style={styles.highlightChip}>
          <Feather name="check" size={12} color={colors.accent} />
          <Text style={styles.highlightText}>{item}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  slide: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  mockCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    width: CARD_WIDTH,
    alignSelf: 'center',
  },
  mockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentLight,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  mockHeaderText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  platformDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockDownloadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.download,
    borderRadius: 10,
    paddingVertical: spacing.sm,
  },
  mockDownloadText: {
    color: colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  toolTile: {
    width: '47%',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  toolLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  videoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: {
    width: 72,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.accentLight,
  },
  thumbAlt: {
    backgroundColor: '#E3F2FD',
  },
  videoMeta: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  metaLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    width: '90%',
  },
  metaLineShort: {
    width: '55%',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.downloadLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metaBadgeText: {
    color: colors.downloadDark,
    fontSize: 11,
    fontWeight: '700',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  highlightText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OnboardingSlide;

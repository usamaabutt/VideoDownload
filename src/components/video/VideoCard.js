import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography } from '@theme';
import { formatViewCount, timeAgo } from '@utils/format';

const VideoCard = ({
  video,
  onPress,
  onDownload,
  isDownloading = false,
  downloadProgress = 0,
}) => (
  <View style={styles.card}>
    <TouchableOpacity
      onPress={() => onPress(video)}
      activeOpacity={0.85}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>YT</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.meta}>
          {video.channelTitle} · {formatViewCount(video.viewCount)} ·{' '}
          {timeAgo(video.publishedAt)}
        </Text>
      </View>
    </TouchableOpacity>

    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.downloadBtn, isDownloading && styles.downloadBtnActive]}
        onPress={() => onDownload(video)}
        disabled={isDownloading}
        activeOpacity={0.7}
      >
        {isDownloading ? (
          <View style={styles.downloadingRow}>
            <ActivityIndicator size="small" color={colors.textPrimary} />
            <Text style={styles.downloadText}>
              {downloadProgress > 0
                ? `${Math.round(downloadProgress * 100)}%`
                : 'Downloading…'}
            </Text>
          </View>
        ) : (
          <Text style={styles.downloadText}>↓ Download</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  platformBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.youtube,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  platformText: {
    color: colors.textPrimary,
    ...typography.badge,
  },
  info: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    ...typography.cardTitle,
    marginBottom: 6,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  actions: {
    borderTopWidth: 0.5,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  downloadBtn: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  downloadBtnActive: {
    borderColor: colors.accent,
  },
  downloadText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  downloadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

export default VideoCard;

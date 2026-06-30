import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, spacing, typography, shadows } from '@theme';
import { formatViewCount, formatNumber, timeAgo } from '@utils/format';

export const CAROUSEL_THUMB_RATIO = 9 / 16;
export const CAROUSEL_INFO_HEIGHT = 84;
export const DOWNLOAD_FAB_SIZE = 32;
export const CARD_SHADOW_BLEED = 4;

export const getCarouselMetrics = (cardWidth) => {
  const thumbHeight = Math.round(cardWidth * CAROUSEL_THUMB_RATIO);
  const thumbWidth = Math.max(cardWidth - spacing.sm * 2, 0);
  const contentHeight =
    spacing.sm + thumbHeight + CAROUSEL_INFO_HEIGHT + spacing.sm + spacing.sm;
  const cardHeight = contentHeight + CARD_SHADOW_BLEED;
  return { cardWidth, cardHeight, thumbHeight, thumbWidth, contentHeight };
};

const buildThumbnailUris = (video) => {
  const id = video.videoId || video.id;
  const fallback = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  return [video.thumbnail, video.thumbnailHigh, fallback].filter(Boolean);
};

const VideoCard = ({
  video,
  onPress,
  onDownload,
  isDownloading = false,
  downloadProgress = 0,
  variant = 'list',
  width,
  thumbHeight,
  thumbWidth,
}) => {
  const isCarousel = variant === 'carousel';
  const thumbUris = useMemo(() => buildThumbnailUris(video), [video]);
  const [thumbUriIndex, setThumbUriIndex] = useState(0);
  const videoKey = video.videoId || video.id;

  useEffect(() => {
    setThumbUriIndex(0);
  }, [videoKey, video.thumbnail, video.thumbnailHigh]);

  const thumbnailUri = thumbUris[thumbUriIndex] ?? thumbUris[0];
  const handleThumbError = useCallback(() => {
    setThumbUriIndex((index) => (index + 1 < thumbUris.length ? index + 1 : index));
  }, [thumbUris.length]);

  const resolvedThumbHeight =
    thumbHeight ?? (isCarousel && width ? Math.round(width * CAROUSEL_THUMB_RATIO) : null);
  const resolvedThumbWidth =
    thumbWidth ?? (isCarousel && width ? Math.max(width - spacing.sm * 2, 0) : null);

  if (isCarousel) {
    return (
      <View style={[styles.cardShell, styles.cardShellCarousel, shadows.cardSubtle, width ? { width } : null]}>
        <View style={[styles.card, styles.cardCarousel]}>
          <View style={styles.carouselContent}>
            <View
              style={[
                styles.carouselThumbBox,
                resolvedThumbWidth && resolvedThumbHeight
                  ? { width: resolvedThumbWidth, height: resolvedThumbHeight }
                  : null,
              ]}
            >
              <TouchableOpacity
                style={styles.thumbPressArea}
                onPress={() => onPress(video)}
                activeOpacity={0.9}
              >
                {thumbnailUri ? (
                  <Image
                    key={`${videoKey}-${thumbUriIndex}`}
                    source={{ uri: thumbnailUri }}
                    style={
                      resolvedThumbWidth && resolvedThumbHeight
                        ? { width: resolvedThumbWidth, height: resolvedThumbHeight }
                        : styles.thumbnailImage
                    }
                    resizeMode="cover"
                    onError={handleThumbError}
                  />
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.downloadFab, isDownloading && styles.downloadFabActive]}
                onPress={() => onDownload(video)}
                disabled={isDownloading}
                activeOpacity={0.85}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <Feather name="arrow-down" size={16} color={colors.textOnPrimary} />
                )}
              </TouchableOpacity>

              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.infoCarousel}
              onPress={() => onPress(video)}
              activeOpacity={0.85}
            >
              <Text style={styles.titleCarousel} numberOfLines={2}>
                {video.title}
              </Text>
              <Text style={styles.metaCarousel} numberOfLines={1}>
                {video.channelTitle}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Feather name="eye" size={10} color={colors.textMuted} />
                  <Text style={styles.statsCarousel} numberOfLines={1}>
                    {formatViewCount(video.viewCount)}
                  </Text>
                </View>
                <Text style={styles.statsDot}>·</Text>
                <Text style={styles.statsCarousel} numberOfLines={1}>
                  {timeAgo(video.publishedAt)}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Feather name="heart" size={10} color={colors.textMuted} />
                  <Text style={styles.statsCarousel} numberOfLines={1}>
                    {formatNumber(video.likeCount || 0)} likes
                  </Text>
                </View>
                <Text style={styles.statsDot}>·</Text>
                <View style={styles.statItem}>
                  <Feather name="clock" size={10} color={colors.textMuted} />
                  <Text style={styles.statsCarousel} numberOfLines={1}>
                    {video.duration}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.cardShell, styles.cardShellList, shadows.card]}>
      <View style={styles.card}>
      <TouchableOpacity style={styles.body} onPress={() => onPress(video)} activeOpacity={0.85}>
        <View style={styles.thumbnailContainer}>
          {thumbnailUri ? (
            <Image
              key={`${videoKey}-${thumbUriIndex}`}
              source={{ uri: thumbnailUri }}
              style={styles.thumbnailImage}
              resizeMode="cover"
              onError={handleThumbError}
            />
          ) : null}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        </View>

        <View style={styles.infoList}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {video.channelTitle}
          </Text>
          <Text style={styles.metaLight} numberOfLines={1}>
            {formatViewCount(video.viewCount)} · {timeAgo(video.publishedAt)}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.downloadBtn, isDownloading && styles.downloadBtnActive]}
        onPress={() => onDownload(video)}
        disabled={isDownloading}
        activeOpacity={0.8}
      >
        {isDownloading ? (
          <View style={styles.downloadingRow}>
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
            <Text style={styles.downloadText}>
              {downloadProgress > 0 ? `${Math.round(downloadProgress * 100)}%` : '…'}
            </Text>
          </View>
        ) : (
          <>
            <Feather name="download" size={16} color={colors.textOnPrimary} />
            <Text style={styles.downloadText}>Download</Text>
          </>
        )}
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 12,
  },
  cardShellCarousel: {
    paddingBottom: CARD_SHADOW_BLEED,
  },
  cardShellList: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
  },
  cardCarousel: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  carouselContent: {
    paddingHorizontal: spacing.sm,
  },
  body: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.md,
  },
  thumbnailContainer: {
    width: 128,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  carouselThumbBox: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  thumbPressArea: {
    ...StyleSheet.absoluteFillObject,
  },
  downloadFab: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: DOWNLOAD_FAB_SIZE,
    height: DOWNLOAD_FAB_SIZE,
    borderRadius: DOWNLOAD_FAB_SIZE / 2,
    backgroundColor: colors.download,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  downloadFabActive: {
    backgroundColor: colors.downloadDark,
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.overlay,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  infoList: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  infoCarousel: {
    minHeight: CAROUSEL_INFO_HEIGHT,
    marginTop: spacing.xs,
    justifyContent: 'flex-start',
  },
  title: {
    color: colors.textPrimary,
    ...typography.cardTitle,
    fontSize: 13,
    marginBottom: 4,
  },
  titleCarousel: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaCarousel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 4,
    marginTop: 3,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  statsCarousel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    flexShrink: 1,
  },
  statsDot: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  metaLight: {
    color: colors.textMuted,
    fontSize: 10,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.download,
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  downloadBtnActive: {
    backgroundColor: colors.downloadDark,
  },
  downloadText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  downloadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

export default VideoCard;

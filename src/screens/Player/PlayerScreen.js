import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { colors, spacing, typography } from '@theme';
import { formatNumber } from '@utils/format';
import { getYouTubeWatchUrl } from '@utils/youtube';
import { getVideoThumbnailUri } from '@utils/videoThumbnail';
import YouTubePlayer from '@components/video/YouTubePlayer';

const PlayerScreen = ({ route, navigation }) => {
  const { video } = route.params;
  const [playing, setPlaying] = useState(true);
  const thumbnailUri = getVideoThumbnailUri(video);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${video.title}\n${getYouTubeWatchUrl(video.videoId)}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <YouTubePlayer
        videoId={video.videoId}
        playing={playing}
        onPlayingChange={setPlaying}
        thumbnailUri={thumbnailUri}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{video.title}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.stat}>{formatNumber(video.viewCount)} views</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.stat}>{formatNumber(video.likeCount)} likes</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.stat}>{video.duration}</Text>
          </View>
          <Text style={styles.channel}>{video.channelTitle}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setPlaying((prev) => !prev)}
          >
            <Text style={styles.actionIcon}>{playing ? '⏸' : '▶'}</Text>
            <Text style={styles.actionLabel}>{playing ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
        </View>

        {video.description ? (
          <View style={styles.descContainer}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.desc} numberOfLines={5}>
              {video.description}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  backText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  infoContainer: {
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    ...typography.title,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stat: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statDot: {
    color: '#555555',
    marginHorizontal: 6,
    fontSize: 13,
  },
  channel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  descContainer: {
    padding: spacing.lg,
  },
  descLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  desc: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default PlayerScreen;

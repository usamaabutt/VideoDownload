import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing } from '@theme';
import VideoCard, { getCarouselMetrics } from '@components/video/VideoCard';

const END_REACHED_THRESHOLD = 0.35;
const LOAD_MORE_ROW_WIDTH = 56;

const FeedVideoRow = ({
  title,
  videos = [],
  cardWidth,
  cardHeight,
  thumbHeight,
  thumbWidth,
  onVideoPress,
  onDownload,
  getDownloadState,
  onLoadMore,
  loadingMore = false,
  hasMore = false,
}) => {
  const renderItem = useCallback(
    ({ item }) => {
      const { isDownloading, progress } = getDownloadState?.(item) ?? {};
      return (
        <VideoCard
          video={item}
          variant="carousel"
          width={cardWidth}
          thumbHeight={thumbHeight}
          thumbWidth={thumbWidth}
          onPress={onVideoPress}
          onDownload={onDownload}
          isDownloading={isDownloading}
          downloadProgress={progress}
        />
      );
    },
    [cardWidth, cardHeight, thumbHeight, thumbWidth, onVideoPress, onDownload, getDownloadState],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore) {
      onLoadMore?.();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={[styles.loadMoreSlot, { height: cardHeight }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }, [loadingMore, cardHeight]);

  if (!videos.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => `${title}-${item.id}`}
        showsHorizontalScrollIndicator={false}
        style={{ height: cardHeight, overflow: 'visible' }}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        nestedScrollEnabled
        onEndReached={handleEndReached}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 2,
    alignItems: 'flex-start',
  },
  separator: {
    width: spacing.sm,
  },
  loadMoreSlot: {
    width: LOAD_MORE_ROW_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { getCarouselMetrics };
export default FeedVideoRow;

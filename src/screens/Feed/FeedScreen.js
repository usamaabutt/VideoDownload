import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ROUTES } from '@config/routes';
import { colors, spacing } from '@theme';
import useVideoFeed from '@hooks/useVideoFeed';
import VidmateHeader from '@components/common/VidmateHeader';
import SafeHeader from '@components/common/SafeHeader';
import SearchBar from '@components/common/SearchBar';
import PlatformGrid from '@components/home/PlatformGrid';
import FeedVideoRow, { getCarouselMetrics } from '@components/home/FeedVideoRow';
import ErrorBanner from '@components/common/ErrorBanner';
import LoadingState from '@components/common/LoadingState';
import EmptyState from '@components/common/EmptyState';
import useDownloadStore from '@store/downloadStore';
import useUserStore from '@store/userStore';
import { isActiveDownload } from '@utils/download';
import useQualityDownload from '@hooks/useQualityDownload';

const CARD_GAP = spacing.sm;
const VISIBLE_CARDS = 2.15;

const FeedScreen = ({ navigation }) => {
  const { width: screenWidth } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();

  const cardWidth = Math.floor(
    (screenWidth - spacing.lg * 2 - CARD_GAP) / VISIBLE_CARDS,
  );
  const { cardHeight, thumbHeight, thumbWidth } = useMemo(
    () => getCarouselMetrics(cardWidth),
    [cardWidth],
  );

  const {
    videos,
    homeSections,
    isSearchMode,
    loading,
    error,
    query,
    refreshing,
    clearError,
    handleRefresh,
    handleSearchChange,
    handleSearchSubmit,
    handleClearSearch,
    handleLoadMoreSection,
    handleSearchLoadMore,
    nextPageToken,
    searchLoadingMore,
  } = useVideoFeed();

  const userName = useUserStore((s) => s.name);
  const activeDownloads = useDownloadStore((s) => s.active);
  const { pickerModal, startQualityDownload } = useQualityDownload({
    onStarted: () => navigation.navigate(ROUTES.DOWNLOADS),
  });

  const handleVideoPress = useCallback(
    (video) => navigation.navigate(ROUTES.PLAYER, { video }),
    [navigation],
  );

  const handleDownload = useCallback(
    (video) => startQualityDownload(video),
    [startQualityDownload],
  );

  const handlePlatformPress = useCallback(() => {
    navigation.navigate(ROUTES.IMPORT);
  }, [navigation]);

  const handleOpenAccount = useCallback(() => {
    navigation.navigate(ROUTES.ACCOUNT);
  }, [navigation]);

  const getDownloadState = useCallback(
    (video) => {
      const download = Object.values(activeDownloads).find(
        (entry) =>
          entry.videoId === video.id ||
          entry.videoId === video.videoId ||
          entry.videoId.startsWith(`${video.id}_`) ||
          (video.videoId && entry.videoId.startsWith(`${video.videoId}_`)),
      );
      return {
        isDownloading: isActiveDownload(download),
        progress: download?.progress ?? 0,
      };
    },
    [activeDownloads],
  );

  const headerSubtitle = userName
    ? `Welcome back, ${userName.split(' ')[0]}`
    : 'Download videos · Music · More';

  const showInitialLoading = loading && !isSearchMode && homeSections.length === 0;
  const showEmpty = !loading && isSearchMode && videos.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerGradientEnd} />
      <SafeHeader>
        <VidmateHeader subtitle={headerSubtitle} onProfilePress={handleOpenAccount}>
          <SearchBar
            light
            value={query}
            placeholder="Search YouTube videos..."
            onChangeText={handleSearchChange}
            onSubmit={handleSearchSubmit}
            onClear={handleClearSearch}
          />
        </VidmateHeader>
      </SafeHeader>

      {pickerModal}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.md }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <PlatformGrid
          onPressPlatform={handlePlatformPress}
          title="Download videos from"
        />

        {showInitialLoading ? (
          <LoadingState />
        ) : showEmpty ? (
          <EmptyState />
        ) : isSearchMode ? (
          <FeedVideoRow
            title="Search results"
            videos={videos}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            thumbHeight={thumbHeight}
            thumbWidth={thumbWidth}
            onVideoPress={handleVideoPress}
            onDownload={handleDownload}
            getDownloadState={getDownloadState}
            onLoadMore={handleSearchLoadMore}
            loadingMore={searchLoadingMore}
            hasMore={!!nextPageToken}
          />
        ) : (
          homeSections.map((section) => (
            <FeedVideoRow
              key={section.id}
              title={section.title}
              videos={section.videos}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              thumbHeight={thumbHeight}
              thumbWidth={thumbWidth}
              onVideoPress={handleVideoPress}
              onDownload={handleDownload}
              getDownloadState={getDownloadState}
              onLoadMore={() => handleLoadMoreSection(section.id)}
              loadingMore={section.loadingMore}
              hasMore={!!section.nextPageToken}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingTop: spacing.sm,
  },
  footer: {
    marginVertical: spacing.lg,
  },
});

export default FeedScreen;

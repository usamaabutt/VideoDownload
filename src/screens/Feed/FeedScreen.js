import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ROUTES } from '@config/routes';
import { colors, spacing } from '@theme';
import useVideoFeed from '@hooks/useVideoFeed';
import ScreenHeader from '@components/common/ScreenHeader';
import SearchBar from '@components/common/SearchBar';
import ErrorBanner from '@components/common/ErrorBanner';
import LoadingState from '@components/common/LoadingState';
import EmptyState from '@components/common/EmptyState';
import VideoCard from '@components/video/VideoCard';
import useDownloadStore from '@store/downloadStore';
import { isActiveDownload } from '@utils/download';

const FeedScreen = ({ navigation }) => {
  const {
    videos,
    loading,
    error,
    query,
    refreshing,
    loadMore,
    clearError,
    handleRefresh,
    handleSearchChange,
    handleSearchSubmit,
    handleClearSearch,
  } = useVideoFeed();

  const downloadVideo = useDownloadStore((s) => s.downloadVideo);
  const activeDownloads = useDownloadStore((s) => s.active);

  const handleVideoPress = useCallback(
    (video) => navigation.navigate(ROUTES.PLAYER, { video }),
    [navigation],
  );

  const handleDownload = useCallback(
    (video) => downloadVideo(video),
    [downloadVideo],
  );

  const renderItem = useCallback(
    ({ item }) => {
      const download = activeDownloads[item.id];
      return (
        <VideoCard
          video={item}
          onPress={handleVideoPress}
          onDownload={handleDownload}
          isDownloading={isActiveDownload(download)}
          downloadProgress={download?.progress ?? 0}
        />
      );
    },
    [handleVideoPress, handleDownload, activeDownloads],
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return <ActivityIndicator color={colors.accent} style={styles.footer} />;
  };

  const renderEmpty = () => {
    if (loading) return null;
    return <EmptyState />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScreenHeader />

      <SearchBar
        value={query}
        onChangeText={handleSearchChange}
        onSubmit={handleSearchSubmit}
        onClear={handleClearSearch}
      />

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {loading && videos.length === 0 ? (
        <LoadingState />
      ) : (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: 80,
  },
  footer: {
    marginVertical: spacing.lg,
  },
});

export default FeedScreen;

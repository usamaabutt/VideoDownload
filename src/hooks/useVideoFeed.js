import { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SEARCH_MIN_CHARS, FEED_AUTO_REFRESH_MS } from '@config/env';
import useFeedStore from '@store/feedStore';
import useUserStore from '@store/userStore';

const useVideoFeed = () => {
  const interests = useUserStore((s) => s.interests);
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);
  const hydrated = useUserStore((s) => s.hydrated);

  const {
    videos,
    homeSections,
    isSearchMode,
    loading,
    error,
    nextPageToken,
    fetchHomeSections,
    refreshHomeSections,
    refreshHomeSectionsInBackground,
    loadMoreSection,
    loadMore,
    search,
    clearError,
  } = useFeedStore();

  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const interestKey = interests.join(',');
  const isSearchModeRef = useRef(isSearchMode);

  useEffect(() => {
    isSearchModeRef.current = isSearchMode;
  }, [isSearchMode]);

  useEffect(() => {
    if (!hydrated || !hasCompletedOnboarding) {
      return;
    }

    fetchHomeSections(interests);
  }, [hydrated, hasCompletedOnboarding, interestKey, fetchHomeSections, interests]);

  useFocusEffect(
    useCallback(() => {
      if (!hydrated || !hasCompletedOnboarding) {
        return undefined;
      }

      const timer = setInterval(() => {
        if (!isSearchModeRef.current) {
          refreshHomeSectionsInBackground(interests);
        }
      }, FEED_AUTO_REFRESH_MS);

      return () => clearInterval(timer);
    }, [hydrated, hasCompletedOnboarding, interests, refreshHomeSectionsInBackground]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isSearchMode && query.trim()) {
      await search(query);
    } else {
      await refreshHomeSections(interests);
    }
    setRefreshing(false);
  }, [isSearchMode, query, search, refreshHomeSections, interests]);

  const handleSearchChange = useCallback(
    (text) => {
      setQuery(text);
      if (text.trim().length >= SEARCH_MIN_CHARS) {
        search(text);
      } else if (text.trim().length === 0) {
        fetchHomeSections(interests);
      }
    },
    [search, fetchHomeSections, interests],
  );

  const handleSearchSubmit = useCallback(() => {
    if (query.trim()) {
      search(query);
    }
  }, [query, search]);

  const handleClearSearch = useCallback(() => {
    setQuery('');
    fetchHomeSections(interests);
  }, [fetchHomeSections, interests]);

  const handleLoadMoreSection = useCallback(
    (sectionId) => {
      loadMoreSection(sectionId);
    },
    [loadMoreSection],
  );

  const handleSearchLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const searchLoadingMore = isSearchMode && loading && videos.length > 0;

  return {
    videos,
    homeSections,
    isSearchMode,
    loading,
    error,
    query,
    refreshing,
    nextPageToken,
    searchLoadingMore,
    clearError,
    handleRefresh,
    handleSearchChange,
    handleSearchSubmit,
    handleClearSearch,
    handleLoadMoreSection,
    handleSearchLoadMore,
    interests,
  };
};

export default useVideoFeed;

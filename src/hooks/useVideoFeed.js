import { useEffect, useState, useCallback } from 'react';
import { SEARCH_MIN_CHARS } from '@config/env';
import useFeedStore from '@store/feedStore';

const useVideoFeed = () => {
  const {
    videos,
    loading,
    error,
    fetchTrending,
    refreshTrending,
    search,
    loadMore,
    clearError,
  } = useFeedStore();

  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshTrending();
    setRefreshing(false);
  }, [refreshTrending]);

  const handleSearchChange = useCallback(
    (text) => {
      setQuery(text);
      if (text.trim().length >= SEARCH_MIN_CHARS) search(text);
      else if (text.trim().length === 0) fetchTrending();
    },
    [search, fetchTrending],
  );

  const handleSearchSubmit = useCallback(() => {
    if (query.trim()) search(query);
  }, [query, search]);

  const handleClearSearch = useCallback(() => {
    setQuery('');
    fetchTrending();
  }, [fetchTrending]);

  return {
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
  };
};

export default useVideoFeed;

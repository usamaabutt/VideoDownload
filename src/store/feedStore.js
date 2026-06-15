import { create } from 'zustand';
import { fetchTrendingVideos, searchVideos } from '@services/youtube';
import { TRENDING_CATEGORIES } from '@config/categories';
import { DEFAULT_REGION_CODE } from '@config/env';
import { logger, logAxiosError } from '@utils/logger';

const useFeedStore = create((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  nextPageToken: null,
  searchQuery: '',
  isSearchMode: false,
  lastDebug: null,
  categoryIndex: 0,
  activeCategoryId: null,

  fetchTrending: async () => {
    logger.info('Store', 'fetchTrending started');
    set({ loading: true, error: null, categoryIndex: 0, activeCategoryId: null });
    try {
      const { videos, nextPageToken } = await fetchTrendingVideos(DEFAULT_REGION_CODE);
      const debug = { action: 'fetchTrending', ok: true, count: videos.length };
      logger.info('Store', 'fetchTrending success', debug);
      set({
        videos,
        nextPageToken,
        loading: false,
        isSearchMode: false,
        lastDebug: debug,
      });
    } catch (err) {
      const debug = { action: 'fetchTrending', ok: false, ...logAxiosError('Store', err) };
      set({ error: getErrorMessage(err), loading: false, lastDebug: debug });
    }
  },

  refreshTrending: async () => {
    const { nextPageToken, categoryIndex } = get();
    logger.info('Store', 'refreshTrending', { nextPageToken, categoryIndex });

    set({ loading: true, error: null });

    try {
      let videos;
      let newToken;
      let newCategoryIndex = categoryIndex;
      let activeCategoryId = null;

      if (nextPageToken) {
        ({ videos, nextPageToken: newToken } = await fetchTrendingVideos(
          DEFAULT_REGION_CODE,
          nextPageToken,
          get().activeCategoryId,
        ));
        activeCategoryId = get().activeCategoryId;
      } else {
        newCategoryIndex = (categoryIndex + 1) % TRENDING_CATEGORIES.length;
        const category = TRENDING_CATEGORIES[newCategoryIndex];
        activeCategoryId = category.id;
        ({ videos, nextPageToken: newToken } = await fetchTrendingVideos(
          DEFAULT_REGION_CODE,
          null,
          category.id,
        ));
      }

      set({
        videos,
        nextPageToken: newToken,
        categoryIndex: newCategoryIndex,
        activeCategoryId,
        loading: false,
        isSearchMode: false,
        lastDebug: { action: 'refreshTrending', ok: true, count: videos.length, activeCategoryId },
      });
    } catch (err) {
      set({
        error: getErrorMessage(err),
        loading: false,
        lastDebug: { action: 'refreshTrending', ok: false, ...logAxiosError('Store', err) },
      });
    }
  },

  search: async (query) => {
    if (!query.trim()) return get().fetchTrending();
    logger.info('Store', 'search started', { query });
    set({ loading: true, error: null, searchQuery: query });
    try {
      const { videos, nextPageToken } = await searchVideos(query);
      const debug = { action: 'search', ok: true, query, count: videos.length };
      logger.info('Store', 'search success', debug);
      set({ videos, nextPageToken, loading: false, isSearchMode: true, lastDebug: debug });
    } catch (err) {
      const debug = { action: 'search', ok: false, query, ...logAxiosError('Store', err) };
      set({ error: getErrorMessage(err), loading: false, lastDebug: debug });
    }
  },

  loadMore: async () => {
    const { nextPageToken, searchQuery, isSearchMode, videos, loading, activeCategoryId } = get();
    if (!nextPageToken || loading) return;
    logger.info('Store', 'loadMore started', { isSearchMode, nextPageToken });
    set({ loading: true });
    try {
      const { videos: more, nextPageToken: newToken } = isSearchMode
        ? await searchVideos(searchQuery, nextPageToken)
        : await fetchTrendingVideos(DEFAULT_REGION_CODE, nextPageToken, activeCategoryId);
      const debug = { action: 'loadMore', ok: true, added: more.length };
      set({
        videos: [...videos, ...more],
        nextPageToken: newToken,
        loading: false,
        lastDebug: debug,
      });
    } catch (err) {
      const debug = { action: 'loadMore', ok: false, ...logAxiosError('Store', err) };
      set({ error: getErrorMessage(err), loading: false, lastDebug: debug });
    }
  },

  clearError: () => set({ error: null }),
}));

function getErrorMessage(err) {
  const apiError = err.response?.data?.error;
  if (typeof apiError === 'string' && apiError.includes('API key')) {
    return 'Invalid YouTube API key — set YOUTUBE_API_KEY in vidflow-server/.env';
  }
  if (apiError) return apiError;
  if (err.message === 'Network Error') {
    return 'Cannot reach server — run "npm start" in vidflow-server';
  }
  return err.message;
}

export default useFeedStore;

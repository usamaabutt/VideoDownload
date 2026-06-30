import { create } from 'zustand';
import { fetchTrendingVideos, searchVideos } from '@services/youtube';
import { TRENDING_CATEGORIES } from '@config/categories';
import { getInterestLabel } from '@config/interests';
import { DEFAULT_REGION_CODE } from '@config/env';
import { logger, logAxiosError } from '@utils/logger';

const useFeedStore = create((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  nextPageToken: null,
  searchQuery: '',
  isSearchMode: false,
  isPersonalized: false,
  lastDebug: null,
  categoryIndex: 0,
  activeCategoryId: null,
  activeInterestIndex: 0,
  activeCategoryLabel: null,
  userInterestIds: [],

  fetchTrending: async () => {
    logger.info('Store', 'fetchTrending started');
    set({
      loading: true,
      error: null,
      categoryIndex: 0,
      activeCategoryId: null,
      activeInterestIndex: 0,
      activeCategoryLabel: null,
      isPersonalized: false,
      userInterestIds: [],
    });
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

  fetchPersonalizedFeed: async (interestIds = []) => {
    if (!interestIds.length) {
      return get().fetchTrending();
    }

    logger.info('Store', 'fetchPersonalizedFeed started', { interestIds });
    const categoryId = interestIds[0];
    set({
      loading: true,
      error: null,
      isSearchMode: false,
      isPersonalized: true,
      userInterestIds: interestIds,
      activeInterestIndex: 0,
      activeCategoryId: categoryId,
      activeCategoryLabel: getInterestLabel(categoryId),
      nextPageToken: null,
    });

    try {
      const { videos, nextPageToken } = await fetchTrendingVideos(
        DEFAULT_REGION_CODE,
        null,
        categoryId,
      );
      const debug = {
        action: 'fetchPersonalizedFeed',
        ok: true,
        count: videos.length,
        categoryId,
      };
      logger.info('Store', 'fetchPersonalizedFeed success', debug);
      set({
        videos,
        nextPageToken,
        loading: false,
        lastDebug: debug,
      });
    } catch (err) {
      const debug = {
        action: 'fetchPersonalizedFeed',
        ok: false,
        ...logAxiosError('Store', err),
      };
      set({ error: getErrorMessage(err), loading: false, lastDebug: debug });
    }
  },

  refreshTrending: async () => {
    const { isPersonalized, userInterestIds } = get();
    if (isPersonalized && userInterestIds.length > 0) {
      return get().refreshPersonalizedFeed(userInterestIds);
    }

    const { nextPageToken, categoryIndex } = get();
    logger.info('Store', 'refreshTrending', { nextPageToken, categoryIndex });

    set({ loading: true, error: null });

    try {
      let videos;
      let newToken;
      let newCategoryIndex = categoryIndex;
      let activeCategoryId = null;
      let activeCategoryLabel = null;

      if (nextPageToken) {
        ({ videos, nextPageToken: newToken } = await fetchTrendingVideos(
          DEFAULT_REGION_CODE,
          nextPageToken,
          get().activeCategoryId,
        ));
        activeCategoryId = get().activeCategoryId;
        activeCategoryLabel = get().activeCategoryLabel;
      } else {
        newCategoryIndex = (categoryIndex + 1) % TRENDING_CATEGORIES.length;
        const category = TRENDING_CATEGORIES[newCategoryIndex];
        activeCategoryId = category.id;
        activeCategoryLabel = category.label;
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
        activeCategoryLabel,
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

  refreshPersonalizedFeed: async (interestIds = get().userInterestIds) => {
    if (!interestIds.length) {
      return get().refreshTrending();
    }

    const { nextPageToken, activeInterestIndex } = get();
    logger.info('Store', 'refreshPersonalizedFeed', { nextPageToken, activeInterestIndex });

    set({ loading: true, error: null, userInterestIds: interestIds, isPersonalized: true });

    try {
      let videos;
      let newToken;
      let newInterestIndex = activeInterestIndex;
      let activeCategoryId;
      let activeCategoryLabel;

      if (nextPageToken) {
        activeCategoryId = get().activeCategoryId;
        activeCategoryLabel = get().activeCategoryLabel;
        ({ videos, nextPageToken: newToken } = await fetchTrendingVideos(
          DEFAULT_REGION_CODE,
          nextPageToken,
          activeCategoryId,
        ));
      } else {
        newInterestIndex = (activeInterestIndex + 1) % interestIds.length;
        activeCategoryId = interestIds[newInterestIndex];
        activeCategoryLabel = getInterestLabel(activeCategoryId);
        ({ videos, nextPageToken: newToken } = await fetchTrendingVideos(
          DEFAULT_REGION_CODE,
          null,
          activeCategoryId,
        ));
      }

      set({
        videos,
        nextPageToken: newToken,
        activeInterestIndex: newInterestIndex,
        activeCategoryId,
        activeCategoryLabel,
        loading: false,
        isSearchMode: false,
        lastDebug: {
          action: 'refreshPersonalizedFeed',
          ok: true,
          count: videos.length,
          activeCategoryId,
        },
      });
    } catch (err) {
      set({
        error: getErrorMessage(err),
        loading: false,
        lastDebug: { action: 'refreshPersonalizedFeed', ok: false, ...logAxiosError('Store', err) },
      });
    }
  },

  search: async (query) => {
    if (!query.trim()) {
      return get().fetchHomeSections(get().userInterestIds);
    }

    logger.info('Store', 'search started', { query });
    set({ loading: true, error: null, searchQuery: query, isSearchMode: true, homeSections: [] });
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
    const {
      nextPageToken,
      searchQuery,
      isSearchMode,
      videos,
      loading,
      activeCategoryId,
      isPersonalized,
    } = get();
    if (!nextPageToken || loading) return;
    logger.info('Store', 'loadMore started', { isSearchMode, nextPageToken });
    set({ loading: true });
    try {
      const { videos: more, nextPageToken: newToken } = isSearchMode
        ? await searchVideos(searchQuery, nextPageToken)
        : await fetchTrendingVideos(DEFAULT_REGION_CODE, nextPageToken, activeCategoryId);
      const debug = { action: 'loadMore', ok: true, added: more.length, isPersonalized };
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

  homeSections: [],
  isSearchMode: false,
  lastFeedRefreshAt: null,
  isBackgroundRefreshing: false,

  fetchHomeSections: async (interestIds = []) => {
    logger.info('Store', 'fetchHomeSections', { interestIds });
    set({
      loading: true,
      error: null,
      isSearchMode: false,
      homeSections: [],
      userInterestIds: interestIds,
    });

    const sectionDefs = [
      { id: 'trending', title: 'Trending on YouTube', categoryId: null },
      ...interestIds.map((categoryId) => ({
        id: categoryId,
        title: getInterestLabel(categoryId),
        categoryId,
      })),
    ];

    try {
      const sections = await Promise.all(
        sectionDefs.map(async (section) => {
          const { videos, nextPageToken } = await fetchTrendingVideos(
            DEFAULT_REGION_CODE,
            null,
            section.categoryId || undefined,
          );
          return { ...section, videos, nextPageToken, loadingMore: false };
        }),
      );

      set({
        homeSections: sections,
        videos: sections[0]?.videos ?? [],
        loading: false,
        isSearchMode: false,
        lastFeedRefreshAt: Date.now(),
        lastDebug: { action: 'fetchHomeSections', ok: true, sections: sections.length },
      });
    } catch (err) {
      const debug = { action: 'fetchHomeSections', ok: false, ...logAxiosError('Store', err) };
      set({ error: getErrorMessage(err), loading: false, lastDebug: debug });
    }
  },

  loadMoreSection: async (sectionId) => {
    const { homeSections } = get();
    const sectionIndex = homeSections.findIndex((section) => section.id === sectionId);
    if (sectionIndex === -1) return;

    const section = homeSections[sectionIndex];
    if (!section.nextPageToken || section.loadingMore) return;

    logger.info('Store', 'loadMoreSection', { sectionId, nextPageToken: section.nextPageToken });

    const loadingSections = homeSections.map((entry, index) =>
      index === sectionIndex ? { ...entry, loadingMore: true } : entry,
    );
    set({ homeSections: loadingSections });

    try {
      const { videos: more, nextPageToken } = await fetchTrendingVideos(
        DEFAULT_REGION_CODE,
        section.nextPageToken,
        section.categoryId || undefined,
      );

      const currentSections = get().homeSections;
      const currentIndex = currentSections.findIndex((entry) => entry.id === sectionId);
      if (currentIndex === -1) return;

      const updatedSections = [...currentSections];
      updatedSections[currentIndex] = {
        ...updatedSections[currentIndex],
        videos: [...updatedSections[currentIndex].videos, ...more],
        nextPageToken,
        loadingMore: false,
      };

      set({
        homeSections: updatedSections,
        lastDebug: {
          action: 'loadMoreSection',
          ok: true,
          sectionId,
          added: more.length,
        },
      });
    } catch (err) {
      const currentSections = get().homeSections;
      const currentIndex = currentSections.findIndex((entry) => entry.id === sectionId);
      if (currentIndex === -1) return;

      const updatedSections = [...currentSections];
      updatedSections[currentIndex] = {
        ...updatedSections[currentIndex],
        loadingMore: false,
      };

      set({
        homeSections: updatedSections,
        error: getErrorMessage(err),
        lastDebug: { action: 'loadMoreSection', ok: false, ...logAxiosError('Store', err) },
      });
    }
  },

  refreshHomeSectionsInBackground: async (interestIds = get().userInterestIds) => {
    const { isSearchMode, loading, isBackgroundRefreshing, homeSections } = get();
    if (isSearchMode || loading || isBackgroundRefreshing) return;
    if (homeSections.some((section) => section.loadingMore)) return;

    const sectionDefs = [
      { id: 'trending', title: 'Trending on YouTube', categoryId: null },
      ...interestIds.map((categoryId) => ({
        id: categoryId,
        title: getInterestLabel(categoryId),
        categoryId,
      })),
    ];

    set({ isBackgroundRefreshing: true });

    try {
      const sections = await Promise.all(
        sectionDefs.map(async (section) => {
          const { videos, nextPageToken } = await fetchTrendingVideos(
            DEFAULT_REGION_CODE,
            null,
            section.categoryId || undefined,
          );
          return { ...section, videos, nextPageToken, loadingMore: false };
        }),
      );

      set({
        homeSections: sections,
        videos: sections[0]?.videos ?? [],
        isBackgroundRefreshing: false,
        lastFeedRefreshAt: Date.now(),
        lastDebug: { action: 'refreshHomeSectionsInBackground', ok: true, sections: sections.length },
      });
    } catch (err) {
      set({
        isBackgroundRefreshing: false,
        lastDebug: {
          action: 'refreshHomeSectionsInBackground',
          ok: false,
          ...logAxiosError('Store', err),
        },
      });
    }
  },

  refreshHomeSections: async (interestIds = []) => get().fetchHomeSections(interestIds),
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

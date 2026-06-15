import apiClient from '@services/api/client';
import { DEFAULT_PAGE_SIZE, DEFAULT_REGION_CODE } from '@config/env';
import { logger } from '@utils/logger';

export const fetchTrendingVideos = async (
  regionCode = DEFAULT_REGION_CODE,
  pageToken = null,
  videoCategoryId = null,
) => {
  logger.info('YouTube', 'fetchTrendingVideos', { regionCode, pageToken, videoCategoryId });
  const { data } = await apiClient.get('/api/youtube/trending', {
    params: {
      maxResults: DEFAULT_PAGE_SIZE,
      regionCode,
      pageToken: pageToken || undefined,
      videoCategoryId: videoCategoryId || undefined,
    },
  });
  logger.info('YouTube', 'fetchTrendingVideos result', {
    count: data.videos?.length ?? 0,
    nextPageToken: data.nextPageToken,
  });
  return data;
};

export const searchVideos = async (query, pageToken = null) => {
  logger.info('YouTube', 'searchVideos', { query, pageToken });
  const { data } = await apiClient.get('/api/youtube/search', {
    params: { q: query, maxResults: DEFAULT_PAGE_SIZE, pageToken },
  });
  logger.info('YouTube', 'searchVideos result', {
    count: data.videos?.length ?? 0,
    nextPageToken: data.nextPageToken,
  });
  return data;
};

export const fetchVideoById = async (videoId) => {
  logger.info('YouTube', 'fetchVideoById', { videoId });
  const { data } = await apiClient.get(`/api/youtube/video/${videoId}`);
  logger.info('YouTube', 'fetchVideoById result', { title: data.title });
  return data;
};

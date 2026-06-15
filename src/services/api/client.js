import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '@config/env';
import { logger, logAxiosError } from '@utils/logger';

if (__DEV__) {
  logger.info('API', 'Client initialized', {
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
  });
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use((config) => {
  if (__DEV__) {
    const fullUrl = `${config.baseURL}${config.url}`;
    logger.info('API →', `${config.method?.toUpperCase()} ${fullUrl}`, {
      params: config.params,
    });
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      logger.info('API ←', `${response.status} ${response.config.url}`, {
        videoCount: response.data?.videos?.length,
        hasNextPage: !!response.data?.nextPageToken,
        keys: Object.keys(response.data || {}),
      });
    }
    return response;
  },
  (error) => {
    logAxiosError('API', error);
    return Promise.reject(error);
  },
);

export default apiClient;

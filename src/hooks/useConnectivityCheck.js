import { useEffect } from 'react';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@config/env';
import { logger } from '@utils/logger';

const useConnectivityCheck = () => {
  useEffect(() => {
    if (!__DEV__) return;

    const check = async () => {
      const url = `${API_BASE_URL}/health`;
      logger.info('Health', `Checking ${url}`);
      try {
        const res = await fetch(url, { method: 'GET' });
        const data = await res.json();
        logger.info('Health', `OK ${res.status}`, data);
        if (data.youtubeApiKey === 'missing') {
          logger.error('Health', 'Server has no YouTube API key — restart vidflow-server');
        } else if (!data.youtubeApiKey) {
          logger.warn(
            'Health',
            'Old server on port 3000 — kill it and restart: cd vidflow-server && npm start',
          );
        }
      } catch (err) {
        logger.error('Health', 'FAILED — cannot reach server', {
          url,
          message: err.message,
          hint:
            Platform.OS === 'android'
              ? 'Physical device: run "yarn adb:reverse" then reload. Server: npm run restart in vidflow-server'
              : 'Run: cd vidflow-server && npm start',
        });
      }
    };
    check();
  }, []);
};

export default useConnectivityCheck;

import { create } from 'zustand';
import { Alert } from 'react-native';
import {
  fetchDownloadInfo,
  fetchUrlDownloadInfo,
  downloadVideoToGallery,
} from '@services/download';
import { isSupportedVideoUrl, normalizeVideoUrlInput } from '@utils/videoUrl';
import { requestGalleryPermission, showPermissionDeniedAlert } from '@utils/permissions';
import { APP_GALLERY_ALBUM } from '@config/env';
import { DOWNLOAD_STATUS } from '@config/routes';
import { logger } from '@utils/logger';
import { trackDownloadSpeed, clearSpeedTracker } from '@utils/downloadSpeed';

const useDownloadStore = create((set, get) => ({
  active: {},
  history: [],

  clearHistory: () => set({ history: [] }),

  downloadVideo: async (video) => {
    const downloadId = video.id || video.videoId;
    const { title } = video;
    if (get().active[downloadId]) return false;

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      showPermissionDeniedAlert();
      return false;
    }

    clearSpeedTracker(downloadId);

    const entry = {
      videoId: downloadId,
      title,
      thumbnail: video.thumbnail,
      channelTitle: video.channelTitle,
      platform: video.platform,
      sourceUrl: video.sourceUrl,
      status: DOWNLOAD_STATUS.DOWNLOADING,
      received: 0,
      total: video.fileSize || 0,
      progress: 0,
      speed: 0,
      startedAt: Date.now(),
    };

    set((state) => ({
      active: { ...state.active, [downloadId]: entry },
    }));

    let knownTotal = video.fileSize || 0;
    if (!knownTotal) {
      try {
        const info = video.sourceUrl
          ? await fetchUrlDownloadInfo(video.sourceUrl)
          : await fetchDownloadInfo(video.videoId);
        knownTotal = info.fileSize || 0;
        set((state) => ({
          active: {
            ...state.active,
            [downloadId]: {
              ...state.active[downloadId],
              title: info.title || state.active[downloadId].title,
              thumbnail: info.thumbnail || state.active[downloadId].thumbnail,
              total: knownTotal,
              progress: 0,
              received: 0,
            },
          },
        }));
      } catch (err) {
        logger.warn('Download', 'Could not fetch file size', {
          downloadId,
          message: err.message,
        });
      }
    }

    try {
      await downloadVideoToGallery(video, {
        knownTotal,
        onProgress: ({ received, total, progress }) => {
          const speed = trackDownloadSpeed(downloadId, received);
          set((state) => ({
            active: {
              ...state.active,
              [downloadId]: {
                ...state.active[downloadId],
                status: DOWNLOAD_STATUS.DOWNLOADING,
                received,
                total,
                progress,
                speed,
              },
            },
          }));
        },
        onSaving: () => {
          set((state) => ({
            active: {
              ...state.active,
              [downloadId]: {
                ...state.active[downloadId],
                status: DOWNLOAD_STATUS.SAVING,
              },
            },
          }));
        },
      });

      clearSpeedTracker(downloadId);

      const completed = {
        ...get().active[downloadId],
        status: DOWNLOAD_STATUS.COMPLETED,
        progress: 1,
        speed: 0,
        completedAt: Date.now(),
      };

      set((state) => {
        const nextActive = { ...state.active };
        delete nextActive[downloadId];
        return {
          active: nextActive,
          history: [completed, ...state.history].slice(0, 20),
        };
      });

      Alert.alert(
        'Download complete',
        `"${title}" saved to Gallery → ${APP_GALLERY_ALBUM}`,
      );
      return true;
    } catch (err) {
      logger.error('Download', 'Failed', { downloadId, message: err.message });
      clearSpeedTracker(downloadId);

      const failed = {
        ...get().active[downloadId],
        status: DOWNLOAD_STATUS.FAILED,
        error: err.message || 'Could not download video',
        completedAt: Date.now(),
      };

      set((state) => {
        const nextActive = { ...state.active };
        delete nextActive[downloadId];
        return {
          active: nextActive,
          history: [failed, ...state.history].slice(0, 20),
        };
      });

      Alert.alert('Download failed', err.message || 'Could not download video');
      return false;
    }
  },

  downloadFromUrl: async (url) => {
    const trimmed = normalizeVideoUrlInput(url);
    if (!trimmed) {
      Alert.alert('Paste a link', 'Enter a video URL to download.');
      return false;
    }

    if (!isSupportedVideoUrl(trimmed)) {
      Alert.alert(
        'Unsupported link',
        'Paste a YouTube, TikTok, Instagram, or Facebook video link.',
      );
      return false;
    }

    try {
      const info = await fetchUrlDownloadInfo(trimmed);
      const video = {
        id: info.id,
        videoId: info.id,
        title: info.title,
        thumbnail: info.thumbnail,
        channelTitle: info.channelTitle,
        platform: info.platform,
        sourceUrl: trimmed,
        fileSize: info.fileSize,
      };
      return get().downloadVideo(video);
    } catch (err) {
      logger.error('Download', 'URL resolve failed', { message: err.message });
      Alert.alert(
        'Could not fetch video',
        err.response?.data?.error || err.message || 'Check the link and try again.',
      );
      return false;
    }
  },
}));

export default useDownloadStore;

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

  downloadVideo: async (video, { qualityHeight = null, knownTotal: presetTotal = 0 } = {}) => {
    const baseId = video.id || video.videoId;
    const downloadId =
      qualityHeight && qualityHeight > 0 ? `${baseId}_${qualityHeight}p` : baseId;
    const { title } = video;
    const qualityLabel =
      qualityHeight && qualityHeight > 0 ? `${qualityHeight}p` : 'Best';

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
      qualityHeight,
      qualityLabel,
      status: DOWNLOAD_STATUS.DOWNLOADING,
      received: 0,
      total: presetTotal || video.fileSize || 0,
      progress: 0,
      speed: 0,
      startedAt: Date.now(),
    };

    set((state) => ({
      active: { ...state.active, [downloadId]: entry },
    }));

    let knownTotal = presetTotal || video.fileSize || 0;
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
      const result = await downloadVideoToGallery(video, {
        knownTotal,
        qualityHeight,
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
        localPath: result.localPath,
        galleryUri: result.galleryUri,
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
        `"${title}" (${qualityLabel}) saved to Gallery → ${APP_GALLERY_ALBUM}`,
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

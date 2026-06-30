import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import apiClient from '@services/api/client';
import {
  API_BASE_URL,
  APP_GALLERY_ALBUM,
  DOWNLOAD_TIMEOUT_MS,
  DOWNLOAD_INFO_TIMEOUT_MS,
} from '@config/env';
import { logger } from '@utils/logger';

function sanitizeFilename(title, videoId) {
  const base = (title || videoId).replace(/[^a-z0-9 _-]/gi, '_').slice(0, 80);
  return `${base}.mp4`;
}

function calcProgress(received, total) {
  if (!total || total <= 0) return received > 0 ? 0.02 : 0;
  return Math.min(Math.max(received / total, 0), 0.99);
}

function emitProgress(onProgress, received, total) {
  const safeReceived = Number(received) || 0;
  const safeTotal = Number(total) > 0 ? Number(total) : 0;
  onProgress?.({
    received: safeReceived,
    total: safeTotal,
    progress: calcProgress(safeReceived, safeTotal),
  });
}

export async function fetchDownloadInfo(videoId) {
  const { data } = await apiClient.get(`/api/youtube/download/${videoId}/info`);
  logger.info('Download', 'File size fetched', {
    videoId,
    fileSize: data.fileSize,
    fileSizeMB: data.fileSizeMB,
  });
  return data;
}

export async function fetchUrlDownloadInfo(sourceUrl) {
  const { data } = await apiClient.post('/api/download/info', { url: sourceUrl }, {
    timeout: DOWNLOAD_INFO_TIMEOUT_MS,
  });
  logger.info('Download', 'URL info fetched', {
    platform: data.platform,
    title: data.title,
    fileSize: data.fileSize,
  });
  return data;
}

function getDownloadStreamUrl(video, qualityHeight) {
  const heightQuery =
    qualityHeight && qualityHeight > 0
      ? `&height=${encodeURIComponent(qualityHeight)}`
      : '';

  if (video.sourceUrl) {
    return `${API_BASE_URL}/api/download/stream?url=${encodeURIComponent(video.sourceUrl)}${heightQuery}`;
  }

  const heightSuffix =
    qualityHeight && qualityHeight > 0
      ? `?height=${encodeURIComponent(qualityHeight)}`
      : '';

  return `${API_BASE_URL}/api/youtube/download/${video.videoId}${heightSuffix}`;
}

function buildDownloadFilename(title, videoId, qualityHeight) {
  const base = sanitizeFilename(title, videoId).replace(/\.mp4$/i, '');
  const suffix = qualityHeight && qualityHeight > 0 ? `_${qualityHeight}p` : '';
  return `${base}${suffix}.mp4`;
}

export async function downloadVideoToGallery(
  video,
  { knownTotal = 0, qualityHeight = null, onProgress, onSaving } = {},
) {
  const url = getDownloadStreamUrl(video, qualityHeight);
  const filename = buildDownloadFilename(video.title, video.videoId, qualityHeight);
  const localPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${filename}`;
  let effectiveTotal = knownTotal;
  let pollTimer = null;
  let lastPolledSize = 0;

  logger.info('Download', `Starting ${filename}`, { url, knownTotal });

  const pollFileSize = () => {
    pollTimer = setInterval(async () => {
      try {
        const exists = await ReactNativeBlobUtil.fs.exists(localPath);
        if (!exists) return;
        const stat = await ReactNativeBlobUtil.fs.stat(localPath);
        const size = Number(stat.size) || 0;
        if (size !== lastPolledSize) {
          lastPolledSize = size;
          emitProgress(onProgress, size, effectiveTotal);
        }
      } catch {
        // file not ready yet
      }
    }, 400);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  try {
    pollFileSize();

    const task = ReactNativeBlobUtil.config({
      fileCache: true,
      path: localPath,
      timeout: DOWNLOAD_TIMEOUT_MS,
    }).fetch('GET', url);

    task.progress({ interval: 200, count: -1 }, (received, total) => {
      const headerTotal = Number(total) > 0 ? Number(total) : 0;
      if (headerTotal > 0) effectiveTotal = headerTotal;
      const receivedBytes = Number(received) || lastPolledSize;
      if (receivedBytes > lastPolledSize) lastPolledSize = receivedBytes;
      emitProgress(onProgress, receivedBytes, effectiveTotal);
    });

    const response = await task;
    stopPolling();

    const filePath = response.path();
    const stat = await ReactNativeBlobUtil.fs.stat(filePath).catch(() => null);
    const finalSize = Number(stat?.size) || lastPolledSize || effectiveTotal;

    if (finalSize > 0) effectiveTotal = finalSize;

    onProgress?.({
      received: finalSize,
      total: effectiveTotal,
      progress: 1,
    });

    onSaving?.();

    logger.info('Download', 'Saving to gallery', {
      album: APP_GALLERY_ALBUM,
      finalSize,
    });

    const savedAsset = await CameraRoll.saveAsset(filePath, {
      type: 'video',
      album: APP_GALLERY_ALBUM,
    });

    const galleryUri = savedAsset?.node?.image?.uri || null;
    const editsDir = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/vidflow-edits`;
    await ReactNativeBlobUtil.fs.mkdir(editsDir).catch(() => {});
    const editCopyPath = `${editsDir}/${filename}`;
    await ReactNativeBlobUtil.fs.cp(filePath, editCopyPath);

    const copyExists = await ReactNativeBlobUtil.fs.exists(editCopyPath);
    if (!copyExists) {
      logger.warn('Download', 'Edit copy missing after save', { editCopyPath });
    }

    await ReactNativeBlobUtil.fs.unlink(filePath).catch(() => {});

    logger.info('Download', 'Saved to gallery', {
      album: APP_GALLERY_ALBUM,
      editCopyPath,
      galleryUri,
    });
    return {
      album: APP_GALLERY_ALBUM,
      filename,
      fileSize: finalSize,
      localPath: copyExists ? editCopyPath : null,
      galleryUri,
    };
  } catch (err) {
    stopPolling();
    throw err;
  }
}

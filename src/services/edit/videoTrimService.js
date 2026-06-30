import { Alert } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { launchImageLibrary } from 'react-native-image-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  showEditor,
  isValidFile,
  compress,
  extractAudio,
  getFrameAt,
  toGif,
  merge,
  share,
  deleteFile,
} from 'react-native-video-trim';
import { APP_GALLERY_ALBUM } from '@config/env';
import { requestGalleryPermission, showPermissionDeniedAlert } from '@utils/permissions';
import { resolveEditableVideoPath, stripFileScheme, toFileUri } from '@utils/mediaPath';
import { logger } from '@utils/logger';

const BASE_EDITOR_CONFIG = {
  maxDuration: 600000,
  saveToPhoto: false,
  headerText: 'VidFlow Studio',
  trimmerColor: '#FF5722',
  fullScreenModalIOS: true,
  theme: 'dark',
  saveButtonText: 'Export',
};

export const FREE_EDITOR_FEATURES = [
  { id: 'full', icon: '🎬', label: 'Full editor', desc: 'Trim, crop, rotate, flip' },
  { id: 'trim', icon: '✂️', label: 'Trim & crop', desc: 'Cut start/end, resize frame' },
  { id: 'speed', icon: '⏩', label: 'Speed', desc: '0.25x to 4x in editor' },
  { id: 'mute', icon: '🔇', label: 'Remove audio', desc: 'Export video without sound' },
];

export const FREE_QUICK_TOOLS = [
  { id: 'compress-low', icon: '🗜️', label: 'Compress (low)', desc: 'Smallest file size' },
  { id: 'compress-medium', icon: '📦', label: 'Compress (medium)', desc: 'Balanced quality' },
  { id: 'compress-high', icon: '✨', label: 'Compress (high)', desc: 'Best quality, smaller' },
  { id: 'mute', icon: '🔇', label: 'Quick mute', desc: 'Remove audio in one tap' },
  { id: 'thumbnail', icon: '🖼️', label: 'Save thumbnail', desc: 'Extract a still frame' },
  { id: 'audio', icon: '🎵', label: 'Extract audio', desc: 'Save audio track as M4A' },
  { id: 'gif', icon: '🎞️', label: 'Make GIF', desc: 'Convert clip to animated GIF' },
  { id: 'merge', icon: '🔗', label: 'Merge clips', desc: 'Join 2+ videos into one' },
  { id: 'share', icon: '📤', label: 'Share video', desc: 'Open system share sheet' },
];

async function ensureGalleryPermission() {
  const permitted = await requestGalleryPermission();
  if (!permitted) {
    showPermissionDeniedAlert();
    return false;
  }
  return true;
}

async function normalizeVideoRef(videoRef) {
  if (typeof videoRef === 'string') {
    return resolveEditableVideoPath({ localPath: videoRef });
  }
  return resolveEditableVideoPath(videoRef);
}

async function validateVideoUri(videoRef) {
  const resolvedPath = await normalizeVideoRef(videoRef);
  const candidates = [
    resolvedPath,
    stripFileScheme(resolvedPath),
    toFileUri(stripFileScheme(resolvedPath)),
  ].filter((value, index, list) => value && list.indexOf(value) === index);

  for (const path of candidates) {
    try {
      const result = await isValidFile(path);
      const valid = typeof result === 'boolean' ? result : Boolean(result?.isValid);
      if (valid) {
        logger.info('Edit', 'Validated video path', { path, fileType: result?.fileType });
        return path;
      }
    } catch (err) {
      logger.warn('Edit', 'Validation attempt failed', { path, message: err.message });
    }
  }

  const absPath = stripFileScheme(resolvedPath);
  if (!absPath.startsWith('content://') && !absPath.startsWith('ph://')) {
    const exists = await ReactNativeBlobUtil.fs.exists(absPath).catch(() => false);
    if (exists) {
      logger.warn('Edit', 'Using path without validation', { absPath });
      return absPath;
    }
  }

  throw new Error(
    'This video file cannot be opened for editing. Re-download it or pick from gallery.',
  );
}

export async function saveVideoToGallery(outputPath) {
  await CameraRoll.saveAsset(toFileUri(outputPath), {
    type: 'video',
    album: APP_GALLERY_ALBUM,
  });
}

export async function saveImageToGallery(outputPath) {
  await CameraRoll.saveAsset(toFileUri(outputPath), {
    type: 'photo',
    album: APP_GALLERY_ALBUM,
  });
}

async function cleanupOutput(outputPath) {
  if (!outputPath) return;
  await deleteFile(outputPath).catch(() => false);
}

export async function pickVideoFromGallery() {
  if (!(await ensureGalleryPermission())) {
    return null;
  }

  const result = await launchImageLibrary({
    mediaType: 'video',
    selectionLimit: 1,
    quality: 1,
  });

  if (result.didCancel) {
    return null;
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage || result.errorCode);
  }

  return result.assets?.[0]?.uri || null;
}

export async function pickVideosFromGallery(selectionLimit = 5) {
  if (!(await ensureGalleryPermission())) {
    return [];
  }

  const result = await launchImageLibrary({
    mediaType: 'video',
    selectionLimit,
    quality: 1,
  });

  if (result.didCancel) {
    return [];
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage || result.errorCode);
  }

  return (result.assets || []).map((asset) => asset.uri).filter(Boolean);
}

export async function openVideoEditor(videoRef, config = {}) {
  if (!videoRef) {
    return false;
  }

  const path = await validateVideoUri(videoRef);
  logger.info('Edit', 'Opening video editor', { path, config });
  showEditor(path, { ...BASE_EDITOR_CONFIG, ...config });
  return true;
}

export async function pickAndOpenEditor(config = {}) {
  const uri = await pickVideoFromGallery();
  if (!uri) {
    return false;
  }
  return openVideoEditor(uri, config);
}

export async function runEditorPreset(videoUri, preset) {
  const presets = {
    full: {
      headerText: 'Full editor',
    },
    trim: {
      headerText: 'Trim & crop',
    },
    speed: {
      headerText: 'Adjust speed',
      saveButtonText: 'Apply speed',
    },
    mute: {
      headerText: 'Remove audio',
      removeAudio: true,
      saveButtonText: 'Export muted',
    },
  };

  return openVideoEditor(videoUri, presets[preset] || presets.full);
}

export async function compressVideo(videoUri, quality = 'medium') {
  const uri = await validateVideoUri(videoUri);
  const { outputPath } = await compress(uri, { quality });
  await saveVideoToGallery(outputPath);
  await cleanupOutput(outputPath);
  return outputPath;
}

export async function muteVideo(videoUri) {
  const uri = await validateVideoUri(videoUri);
  const { outputPath } = await compress(uri, {
    quality: 'high',
    removeAudio: true,
  });
  await saveVideoToGallery(outputPath);
  await cleanupOutput(outputPath);
  return outputPath;
}

export async function extractVideoAudio(videoUri) {
  const uri = await validateVideoUri(videoUri);
  const { outputPath } = await extractAudio(uri, { outputExt: 'm4a' });
  await share(outputPath);
  await cleanupOutput(outputPath);
  return outputPath;
}

export async function getVideoPreviewFrame(videoUri, timeMs = 0) {
  const uri = await validateVideoUri(videoUri);
  const { outputPath } = await getFrameAt(uri, {
    time: timeMs,
    format: 'jpeg',
    quality: 80,
    maxWidth: 960,
  });
  return toFileUri(outputPath);
}

export async function extractVideoThumbnail(videoUri, timeMs = 1000) {
  const uri = await validateVideoUri(videoUri);
  const { outputPath } = await getFrameAt(uri, {
    time: timeMs,
    format: 'jpeg',
    quality: 90,
    maxWidth: 1280,
  });
  await saveImageToGallery(outputPath);
  await cleanupOutput(outputPath);
  return outputPath;
}

export async function convertVideoToGif(videoUri, durationMs = 5000) {
  const uri = await validateVideoUri(videoUri);
  const { outputPath } = await toGif(uri, {
    startTime: 0,
    endTime: durationMs,
    fps: 12,
    width: 480,
  });
  await saveImageToGallery(outputPath);
  await cleanupOutput(outputPath);
  return outputPath;
}

export async function mergeSelectedVideos(videoUris) {
  if (!videoUris?.length || videoUris.length < 2) {
    throw new Error('Pick at least 2 videos to merge.');
  }

  const uris = [];
  for (const videoUri of videoUris) {
    uris.push(await validateVideoUri(videoUri));
  }

  const { outputPath, duration } = await merge(uris, { outputExt: 'mp4' });
  await saveVideoToGallery(outputPath);
  await cleanupOutput(outputPath);
  return { outputPath, duration };
}

export async function shareVideoFile(videoUri) {
  const uri = await validateVideoUri(videoUri);
  await share(uri);
  return uri;
}

export async function runQuickTool(toolId, videoUri) {
  switch (toolId) {
    case 'compress-low':
      return compressVideo(videoUri, 'low');
    case 'compress-medium':
      return compressVideo(videoUri, 'medium');
    case 'compress-high':
      return compressVideo(videoUri, 'high');
    case 'thumbnail':
      return extractVideoThumbnail(videoUri);
    case 'audio':
      return extractVideoAudio(videoUri);
    case 'gif':
      return convertVideoToGif(videoUri);
    case 'share':
      return shareVideoFile(videoUri);
    case 'mute':
      return muteVideo(videoUri);
    default:
      throw new Error('Unknown tool');
  }
}

export async function runMergeFromGallery() {
  const uris = await pickVideosFromGallery(5);
  if (uris.length < 2) {
    if (uris.length === 1) {
      Alert.alert('Need more clips', 'Select at least 2 videos to merge.');
    }
    return null;
  }
  return mergeSelectedVideos(uris);
}

export function getToolSuccessMessage(toolId) {
  const messages = {
    'compress-low': 'Compressed video saved to Gallery.',
    'compress-medium': 'Compressed video saved to Gallery.',
    'compress-high': 'Compressed video saved to Gallery.',
    thumbnail: 'Thumbnail saved to Gallery.',
    audio: 'Audio extracted — use the share sheet to save it.',
    gif: 'GIF saved to Gallery.',
    share: 'Share sheet opened.',
    mute: 'Muted video saved to Gallery.',
    merge: 'Merged video saved to Gallery.',
  };
  return messages[toolId] || 'Done.';
}

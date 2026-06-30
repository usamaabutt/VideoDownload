import ReactNativeBlobUtil from 'react-native-blob-util';

/** Strip file:// so native modules receive a plain absolute path. */
export function stripFileScheme(path) {
  if (!path) return path;
  if (path.startsWith('file://')) {
    return decodeURI(path.replace(/^file:\/\//, ''));
  }
  return path;
}

export function toFileUri(path) {
  if (!path) return path;
  if (
    path.startsWith('file://') ||
    path.startsWith('content://') ||
    path.startsWith('ph://')
  ) {
    return path;
  }
  return `file://${path}`;
}

/**
 * Resolve the best path for native video editing.
 * Tries local edit copy first, then gallery URI from CameraRoll.
 */
export async function resolveEditableVideoPath({ localPath, galleryUri } = {}) {
  const candidates = [localPath, galleryUri].filter(Boolean);

  if (!candidates.length) {
    throw new Error('No video file is linked to this download.');
  }

  for (const candidate of candidates) {
    if (candidate.startsWith('content://') || candidate.startsWith('ph://')) {
      return candidate;
    }

    const absPath = stripFileScheme(candidate);
    const exists = await ReactNativeBlobUtil.fs.exists(absPath).catch(() => false);
    if (exists) {
      return absPath;
    }
  }

  throw new Error(
    'This video is no longer on your device. Re-download it or pick from gallery in Studio.',
  );
}

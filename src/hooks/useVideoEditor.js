import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import NativeVideoTrim from 'react-native-video-trim';
import { APP_GALLERY_ALBUM } from '@config/env';
import { toFileUri } from '@utils/mediaPath';
import { logger } from '@utils/logger';

async function saveEditedVideo(outputPath) {
  await CameraRoll.saveAsset(toFileUri(outputPath), {
    type: 'video',
    album: APP_GALLERY_ALBUM,
  });
}

export default function useVideoEditor() {
  const listeners = useRef({});

  useEffect(() => {
    listeners.current.onFinishTrimming = NativeVideoTrim.onFinishTrimming(
      async ({ outputPath, duration }) => {
        try {
          await saveEditedVideo(outputPath);
          const seconds = Math.max(1, Math.round((duration || 0) / 1000));
          Alert.alert(
            'Export saved',
            `Edited video saved to Gallery → ${APP_GALLERY_ALBUM} (${seconds}s)`,
          );
          logger.info('Edit', 'Export saved to gallery', { outputPath, duration });
        } catch (err) {
          logger.error('Edit', 'Gallery save failed', { message: err.message });
          Alert.alert('Save failed', err.message || 'Could not save edited video.');
        }
      },
    );

    listeners.current.onError = NativeVideoTrim.onError(({ message, errorCode }) => {
      logger.error('Edit', 'Editor error', { message, errorCode });
      Alert.alert('Editor error', message || 'Something went wrong while editing.');
    });

    return () => {
      Object.values(listeners.current).forEach((listener) => listener?.remove?.());
    };
  }, []);
}

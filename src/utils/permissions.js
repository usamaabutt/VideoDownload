import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import {
  iosReadGalleryPermission,
  iosRequestReadWriteGalleryPermission,
} from '@react-native-camera-roll/camera-roll';

async function requestIosGalleryPermission() {
  let status = await iosReadGalleryPermission('readWrite');
  if (status === 'granted' || status === 'limited') {
    return true;
  }
  if (status === 'blocked' || status === 'denied') {
    return false;
  }

  status = await iosRequestReadWriteGalleryPermission();
  return status === 'granted' || status === 'limited';
}

export async function requestGalleryPermission() {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        {
          title: 'Storage Permission',
          message: 'VidFlow needs access to save videos to your gallery.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (Platform.Version <= 28) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'VidFlow needs access to save videos to your gallery.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  return requestIosGalleryPermission();
}

export function showPermissionDeniedAlert() {
  Alert.alert(
    'Permission required',
    'Allow gallery access in Settings to save downloaded videos.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
  );
}

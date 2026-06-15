// Android emulator: use localhost + run `adb reverse tcp:3000 tcp:3000`
// (automatically done by `npm run android`)
// iOS simulator: localhost works directly
// Physical device: use your Mac's LAN IP (e.g. http://192.168.1.5:3000)
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-production-api.com';

export const API_TIMEOUT_MS = 10000;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_REGION_CODE = 'US';
export const SEARCH_MIN_CHARS = 3;
export const APP_GALLERY_ALBUM = 'VidFlow';
export const DOWNLOAD_TIMEOUT_MS = 600000;
export const DOWNLOAD_INFO_TIMEOUT_MS = 60000;

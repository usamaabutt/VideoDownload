jest.mock('react-native-blob-util', () => ({
  fs: { dirs: { CacheDir: '/cache' }, unlink: jest.fn(() => Promise.resolve()) },
  config: () => ({
    fetch: () => ({
      progress: jest.fn(),
      then: (cb) => Promise.resolve(cb({ path: () => '/cache/video.mp4' })),
    }),
  }),
}));

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {
    saveAsset: jest.fn(() => Promise.resolve({ node: { image: { uri: 'file://x' } } })),
  },
  iosReadGalleryPermission: jest.fn(() => Promise.resolve('granted')),
  iosRequestReadWriteGalleryPermission: jest.fn(() => Promise.resolve('granted')),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ status: 'ok' }),
  }),
);

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }) => <View>{children}</View>,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlatList: View,
    gestureHandlerRootHOC: (component) => component,
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
  };
});

jest.mock('@react-navigation/stack', () => {
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: () => null,
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: () => null,
    }),
    useBottomTabBarHeight: () => 64,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');
jest.mock('react-native-vector-icons/Ionicons', () => 'IonIcon');

jest.mock('react-native-youtube-iframe', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ testID = 'youtube-player' }) => <View testID={testID} />;
});

jest.mock('react-native-video-trim', () => ({
  __esModule: true,
  default: {
    onFinishTrimming: jest.fn(() => ({ remove: jest.fn() })),
    onError: jest.fn(() => ({ remove: jest.fn() })),
  },
  showEditor: jest.fn(),
  isValidFile: jest.fn(() => Promise.resolve(true)),
  compress: jest.fn(() => Promise.resolve({ outputPath: '/cache/out.mp4' })),
  extractAudio: jest.fn(() => Promise.resolve({ outputPath: '/cache/out.m4a' })),
  getFrameAt: jest.fn(() => Promise.resolve({ outputPath: '/cache/frame.jpg' })),
  toGif: jest.fn(() => Promise.resolve({ outputPath: '/cache/out.gif' })),
  merge: jest.fn(() => Promise.resolve({ outputPath: '/cache/merged.mp4', duration: 1000 })),
  share: jest.fn(() => Promise.resolve(true)),
  deleteFile: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

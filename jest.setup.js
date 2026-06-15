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

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: () => null,
    }),
  };
});

jest.mock('react-native-youtube-iframe', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ testID = 'youtube-player' }) => <View testID={testID} />;
});

import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '@config/routes';
import { colors, shadows } from '@theme';
import useDownloadStore from '@store/downloadStore';
import { countActiveDownloads } from '@utils/download';
import { TAB_ICONS, TabIcon } from '@components/icons/AppIcons';
import FeedScreen from '@screens/Feed';
import ImportScreen from '@screens/Import';
import DownloadsScreen from '@screens/Downloads';
import EditScreen from '@screens/Edit';

const Tab = createBottomTabNavigator();

const TAB_BAR_BASE_HEIGHT = 56;

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const activeMap = useDownloadStore((s) => s.active);
  const activeCount = useMemo(() => countActiveDownloads(activeMap), [activeMap]);

  const tabBarStyle = useMemo(
    () => [
      styles.tabBar,
      {
        height: TAB_BAR_BASE_HEIGHT + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 8),
      },
    ],
    [insets.bottom],
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const icons = {
            [ROUTES.FEED]: TAB_ICONS.feed,
            [ROUTES.IMPORT]: TAB_ICONS.import,
            [ROUTES.EDIT]: TAB_ICONS.edit,
            [ROUTES.DOWNLOADS]: TAB_ICONS.downloads,
          };
          return <TabIcon name={icons[route.name]} focused={focused} />;
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.FEED}
        component={FeedScreen}
        options={{ tabBarLabel: 'My Feed' }}
      />
      <Tab.Screen
        name={ROUTES.IMPORT}
        component={ImportScreen}
        options={{ tabBarLabel: 'Paste Link' }}
      />
      <Tab.Screen
        name={ROUTES.EDIT}
        component={EditScreen}
        options={{ tabBarLabel: 'Tools' }}
      />
      <Tab.Screen
        name={ROUTES.DOWNLOADS}
        component={DownloadsScreen}
        options={{
          tabBarLabel: 'Files',
          tabBarBadge: activeCount > 0 ? activeCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: 6,
    ...shadows.card,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default MainTabNavigator;

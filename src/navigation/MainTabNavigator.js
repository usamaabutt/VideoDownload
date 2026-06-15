import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from '@config/routes';
import { colors } from '@theme';
import useDownloadStore from '@store/downloadStore';
import { countActiveDownloads } from '@utils/download';
import FeedScreen from '@screens/Feed';
import ImportScreen from '@screens/Import';
import DownloadsScreen from '@screens/Downloads';

const Tab = createBottomTabNavigator();

const tabIcon = (icon) => ({ color, size }) => (
  <Text style={{ fontSize: size - 4, color }}>{icon}</Text>
);

const MainTabNavigator = () => {
  const activeMap = useDownloadStore((s) => s.active);
  const activeCount = useMemo(() => countActiveDownloads(activeMap), [activeMap]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name={ROUTES.FEED}
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: tabIcon('🏠'),
        }}
      />
      <Tab.Screen
        name={ROUTES.IMPORT}
        component={ImportScreen}
        options={{
          tabBarLabel: 'Import',
          tabBarIcon: tabIcon('🔗'),
        }}
      />
      <Tab.Screen
        name={ROUTES.DOWNLOADS}
        component={DownloadsScreen}
        options={{
          tabBarLabel: 'Downloads',
          tabBarIcon: tabIcon('⬇️'),
          tabBarBadge: activeCount > 0 ? activeCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 0.5,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.accent,
    fontSize: 10,
  },
});

export default MainTabNavigator;

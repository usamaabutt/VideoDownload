import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@theme';

export const TAB_ICONS = {
  feed: 'home',
  import: 'link-2',
  edit: 'scissors',
  downloads: 'folder',
};

export const PLATFORM_ICONS = {
  youtube: 'logo-youtube',
  facebook: 'logo-facebook',
  instagram: 'logo-instagram',
  tiktok: 'logo-tiktok',
};

export const TabIcon = ({ name, focused, size = 22 }) => (
  <Feather
    name={name}
    size={size}
    color={focused ? colors.accent : colors.textMuted}
  />
);

export const PlatformIcon = ({ platformId, color, size = 24 }) => (
  <Ionicons
    name={PLATFORM_ICONS[platformId] || 'globe-outline'}
    size={size}
    color={color}
  />
);

export const AppLogoIcon = ({ size = 20, color = colors.textOnPrimary }) => (
  <Feather name="play" size={size} color={color} />
);

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme';

const SafeHeader = ({ children, style }) => (
  <SafeAreaView edges={['top']} style={[styles.safeTop, style]}>
    {children}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeTop: {
    backgroundColor: colors.headerGradientEnd,
  },
});

export default SafeHeader;

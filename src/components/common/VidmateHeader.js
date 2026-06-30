import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, spacing, typography, shadows } from '@theme';
import { AppLogoIcon } from '@components/icons/AppIcons';

const VidmateHeader = ({ title = 'VidFlow', subtitle, children, onProfilePress }) => (
  <View style={[styles.header, shadows.header]}>
    <View style={styles.brandRow}>
      <View style={styles.logoBadge}>
        <AppLogoIcon size={24} />
      </View>
      <View style={styles.brandText}>
        <Text style={styles.logo}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onProfilePress ? (
        <TouchableOpacity style={styles.profileBtn} onPress={onProfilePress} activeOpacity={0.85}>
          <Feather name="user" size={18} color={colors.textOnPrimary} />
        </TouchableOpacity>
      ) : null}
    </View>
    {children ? <View style={styles.children}>{children}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.headerGradientEnd,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flex: 1,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: colors.textOnPrimary,
    ...typography.logo,
    fontSize: 24,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  children: {
    marginTop: spacing.xs,
  },
});

export default VidmateHeader;

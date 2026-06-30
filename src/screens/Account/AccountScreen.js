import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { ROUTES } from '@config/routes';
import { colors, spacing, shadows } from '@theme';
import { getInterestLabels } from '@config/interests';
import useUserStore from '@store/userStore';
import useFeedStore from '@store/feedStore';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const MenuRow = ({ icon, label, value, onPress, danger }) => (
  <TouchableOpacity
    style={styles.menuRow}
    onPress={onPress}
    activeOpacity={onPress ? 0.85 : 1}
    disabled={!onPress}
  >
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Feather name={icon} size={18} color={danger ? colors.error : colors.accent} />
    </View>
    <View style={styles.menuBody}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {value ? <Text style={styles.menuValue} numberOfLines={1}>{value}</Text> : null}
    </View>
    {onPress ? <Feather name="chevron-right" size={18} color={colors.textDim} /> : null}
  </TouchableOpacity>
);

const AccountScreen = ({ navigation }) => {
  const name = useUserStore((s) => s.name);
  const email = useUserStore((s) => s.email);
  const interests = useUserStore((s) => s.interests);
  const signOut = useUserStore((s) => s.signOut);
  const fetchTrending = useFeedStore((s) => s.fetchTrending);

  const interestSummary = interests.length ? getInterestLabels(interests) : 'Not customized';

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign out',
      'You will return to the welcome screen. Your downloads on this device are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            signOut();
            await fetchTrending();
          },
        },
      ],
    );
  }, [signOut, fetchTrending]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerGradientEnd} />

      <View style={styles.hero}>
        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
              <Feather name="arrow-left" size={22} color={colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>Account</Text>
            <View style={styles.backBtn} />
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </View>
            <Text style={styles.name}>{name || 'VidFlow user'}</Text>
            <Text style={styles.email}>{email || 'No email added'}</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={[styles.menuCard, shadows.card]}>
          <MenuRow
            icon="sliders"
            label="Daily feed"
            value={interestSummary}
            onPress={() => navigation.navigate(ROUTES.FEED_PREFERENCES)}
          />
        </View>

        <Text style={styles.sectionLabel}>Session</Text>
        <View style={[styles.menuCard, shadows.card]}>
          <MenuRow icon="log-out" label="Sign out" onPress={handleSignOut} danger />
        </View>

        <Text style={styles.footerNote}>
          Signing out clears your profile on this device. You can sign up again anytime.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.headerGradientEnd,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: spacing.xl,
  },
  heroSafe: {
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  email: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: colors.errorBackground,
  },
  menuBody: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  menuLabelDanger: {
    color: colors.error,
  },
  menuValue: {
    color: colors.textMuted,
    fontSize: 12,
  },
  footerNote: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});

export default AccountScreen;

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { ROUTES } from '@config/routes';
import { colors, spacing, shadows } from '@theme';
import useUserStore from '@store/userStore';
import OnboardingHero from '@components/onboarding/OnboardingHero';

const SignupScreen = ({ navigation }) => {
  const setProfile = useUserStore((s) => s.setProfile);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleContinue = useCallback(() => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Please enter your name to continue.');
      return;
    }

    setError('');
    setProfile(trimmedName, email);
    navigation.navigate(ROUTES.INTERESTS);
  }, [name, email, navigation, setProfile]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerGradientEnd} />
      <OnboardingHero tagline="Set up your account" />

      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.step}>Step 1 of 2</Text>
          <Text style={styles.title}>Welcome to VidFlow</Text>
          <Text style={styles.subtitle}>
            Create a quick profile to save your downloads and set up your account.
          </Text>

          <View style={[styles.formCard, shadows.card]}>
            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <View style={styles.inputWrap}>
                <Feather name="user" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textDim}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrap}>
                <Feather name="mail" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com (optional)"
                  placeholderTextColor={colors.textDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </View>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.legal}>
            By continuing, you agree to VidFlow&apos;s Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerGradientEnd,
  },
  sheet: {
    flex: 1,
    marginTop: -spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  step: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginTop: spacing.md,
  },
  legal: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SignupScreen;

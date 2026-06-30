import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ROUTES } from '@config/routes';
import { colors, spacing, shadows } from '@theme';
import VidmateHeader from '@components/common/VidmateHeader';
import SafeHeader from '@components/common/SafeHeader';
import PlatformGrid from '@components/home/PlatformGrid';
import useDownloadStore from '@store/downloadStore';
import { isSupportedVideoUrl, normalizeVideoUrlInput } from '@utils/videoUrl';
import { isActiveDownload } from '@utils/download';
import useQualityDownload from '@hooks/useQualityDownload';

const ImportScreen = ({ navigation }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const [url, setUrl] = useState('');
  const activeMap = useDownloadStore((s) => s.active);
  const [loading, setLoading] = useState(false);
  const { pickerModal, startUrlQualityDownload } = useQualityDownload({
    onStarted: () => navigation.navigate(ROUTES.DOWNLOADS),
  });

  const trimmedUrl = normalizeVideoUrlInput(url);
  const isValid = isSupportedVideoUrl(trimmedUrl);
  const canDownload = isValid && !loading;

  const activeImport = useMemo(() => {
    const entries = Object.values(activeMap);
    return entries.find((item) => item.sourceUrl === trimmedUrl && isActiveDownload(item));
  }, [activeMap, trimmedUrl]);

  const handleDownload = useCallback(async () => {
    if (!canDownload) return;

    setLoading(true);
    try {
      await startUrlQualityDownload(trimmedUrl);
    } finally {
      setLoading(false);
    }
  }, [canDownload, startUrlQualityDownload, trimmedUrl]);

  const handleClear = useCallback(() => setUrl(''), []);

  const handlePaste = useCallback((text) => {
    const cleaned = normalizeVideoUrlInput(text);
    setUrl(cleaned || text);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerGradientEnd} />
      <SafeHeader>
        <VidmateHeader title="Paste Link" subtitle="Download from any supported site" />
      </SafeHeader>
      {pickerModal}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.md }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PlatformGrid title="Download from" />

          <View style={[styles.pasteCard, shadows.card]}>
            <Text style={styles.pasteLabel}>Paste video URL here</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="https://youtube.com/... or any supported link"
                placeholderTextColor={colors.textDim}
                value={url}
                onChangeText={handlePaste}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                multiline
                textAlignVertical="top"
              />
              {url.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {trimmedUrl.length > 0 && !isValid && (
              <Text style={styles.errorText}>
                Unsupported link — use YouTube, TikTok, Instagram, or Facebook
              </Text>
            )}

            <TouchableOpacity
              style={[styles.downloadBtn, !canDownload && styles.downloadBtnDisabled]}
              onPress={handleDownload}
              disabled={!canDownload}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <Text style={styles.downloadBtnText}>↓  Download Video</Text>
              )}
            </TouchableOpacity>
          </View>

          {activeImport && (
            <View style={[styles.activeBox, shadows.card]}>
              <Text style={styles.activeTitle}>Downloading…</Text>
              <Text style={styles.activeSubtitle} numberOfLines={2}>
                {activeImport.title}
              </Text>
              <Text style={styles.activeHint}>Check Files tab for progress</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {},
  pasteCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pasteLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  inputBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    minHeight: 96,
    marginBottom: spacing.md,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 68,
    paddingRight: spacing.lg,
  },
  clearBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
  clearText: {
    color: colors.textDim,
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  downloadBtn: {
    backgroundColor: colors.download,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  downloadBtnDisabled: {
    backgroundColor: colors.border,
  },
  downloadBtnText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  activeBox: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  activeTitle: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  activeSubtitle: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  activeHint: {
    color: colors.textDim,
    fontSize: 12,
  },
});

export default ImportScreen;

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ROUTES } from '@config/routes';
import { colors, spacing } from '@theme';
import ScreenHeader from '@components/common/ScreenHeader';
import useDownloadStore from '@store/downloadStore';
import {
  isSupportedVideoUrl,
  normalizeVideoUrlInput,
  PLATFORM_LABELS,
} from '@utils/videoUrl';
import { isActiveDownload } from '@utils/download';

const SUPPORTED_PLATFORMS = ['youtube', 'tiktok', 'instagram', 'facebook'];

const ImportScreen = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const downloadFromUrl = useDownloadStore((s) => s.downloadFromUrl);
  const activeMap = useDownloadStore((s) => s.active);
  const [loading, setLoading] = useState(false);

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
      const started = await downloadFromUrl(trimmedUrl);
      if (started) {
        navigation.navigate(ROUTES.DOWNLOADS);
      }
    } finally {
      setLoading(false);
    }
  }, [canDownload, downloadFromUrl, trimmedUrl, navigation]);

  const handleClear = useCallback(() => setUrl(''), []);

  const handlePaste = useCallback((text) => {
    const cleaned = normalizeVideoUrlInput(text);
    setUrl(cleaned || text);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScreenHeader title="Import" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Paste a video link</Text>
          <Text style={styles.subtitle}>
            Works with YouTube, TikTok, Instagram, and Facebook
          </Text>

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="https://..."
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
              Unsupported link — use a YouTube, TikTok, Instagram, or Facebook URL
            </Text>
          )}

          <View style={styles.platformRow}>
            {SUPPORTED_PLATFORMS.map((platform) => (
              <View key={platform} style={styles.platformChip}>
                <Text style={styles.platformText}>{PLATFORM_LABELS[platform]}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.downloadBtn, !canDownload && styles.downloadBtnDisabled]}
            onPress={handleDownload}
            disabled={!canDownload}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.downloadBtnText}>Download</Text>
            )}
          </TouchableOpacity>

          {activeImport && (
            <View style={styles.activeBox}>
              <Text style={styles.activeTitle}>Downloading…</Text>
              <Text style={styles.activeSubtitle} numberOfLines={2}>
                {activeImport.title}
              </Text>
              <Text style={styles.activeHint}>Check the Downloads tab for progress</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 80,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    marginBottom: spacing.lg,
  },
  inputBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    minHeight: 100,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 72,
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
    marginTop: spacing.sm,
  },
  platformRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  platformChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  platformText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  downloadBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  downloadBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  downloadBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  activeBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
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

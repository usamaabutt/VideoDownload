import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { colors, spacing, shadows } from '@theme';
import { DOWNLOAD_STATUS } from '@config/routes';
import ScreenHeader from '@components/common/ScreenHeader';
import SafeHeader from '@components/common/SafeHeader';
import useDownloadStore from '@store/downloadStore';
import { resolveEditableVideoPath } from '@utils/mediaPath';
import {
  FREE_EDITOR_FEATURES,
  FREE_QUICK_TOOLS,
  getToolSuccessMessage,
  getVideoPreviewFrame,
  pickVideoFromGallery,
  runEditorPreset,
  runMergeFromGallery,
  runQuickTool,
} from '@services/edit';

const ToolCard = ({ tool, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.toolCard, disabled && styles.toolCardDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.85}
  >
    <Text style={styles.toolIcon}>{tool.icon}</Text>
    <View style={styles.toolBody}>
      <Text style={styles.toolLabel}>{tool.label}</Text>
      <Text style={styles.toolDesc}>{tool.desc}</Text>
    </View>
    <Text style={styles.toolArrow}>›</Text>
  </TouchableOpacity>
);

const EditScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const history = useDownloadStore((s) => s.history);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const isSameSelection = useCallback(
    (item) =>
      selectedVideo &&
      typeof selectedVideo === 'object' &&
      (selectedVideo.localPath === item.localPath ||
        selectedVideo.galleryUri === item.galleryUri),
    [selectedVideo],
  );

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      if (!selectedVideo) {
        setPreviewUri(null);
        setPreviewLoading(false);
        return;
      }

      if (selectedThumbnail) {
        setPreviewUri(selectedThumbnail);
        setPreviewLoading(false);
        return;
      }

      setPreviewLoading(true);
      try {
        const path =
          typeof selectedVideo === 'string'
            ? selectedVideo
            : await resolveEditableVideoPath(selectedVideo);
        const frameUri = await getVideoPreviewFrame(path);
        if (!cancelled) {
          setPreviewUri(frameUri);
        }
      } catch {
        if (!cancelled) {
          setPreviewUri(null);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [selectedVideo, selectedThumbnail]);

  const editableDownloads = useMemo(
    () =>
      history.filter(
        (item) =>
          item.status === DOWNLOAD_STATUS.COMPLETED &&
          (item.localPath || item.galleryUri),
      ),
    [history],
  );

  const runAction = useCallback(async (action, successMessage) => {
    setLoading(true);
    try {
      await action();
      if (successMessage) {
        Alert.alert('Done', successMessage);
      }
    } catch (err) {
      Alert.alert('Tool error', err.message || 'Could not complete this action.');
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureVideo = useCallback(async () => {
    if (selectedVideo) {
      return selectedVideo;
    }

    const uri = await pickVideoFromGallery();
    if (!uri) {
      return null;
    }

    setSelectedVideo(uri);
    setSelectedLabel('Gallery video');
    setSelectedThumbnail(null);
    return uri;
  }, [selectedVideo]);

  const handlePickVideo = useCallback(
    () =>
      runAction(async () => {
        const uri = await pickVideoFromGallery();
        if (uri) {
          setSelectedVideo(uri);
          setSelectedLabel('Gallery video');
          setSelectedThumbnail(null);
        }
      }),
    [runAction],
  );

  const handleSelectDownload = useCallback((item) => {
    setSelectedVideo({ localPath: item.localPath, galleryUri: item.galleryUri });
    setSelectedLabel(item.title);
    setSelectedThumbnail(item.thumbnail || null);
  }, []);

  const handleEditorTool = useCallback(
    (preset) =>
      runAction(async () => {
        const videoRef = selectedVideo || (await ensureVideo());
        if (!videoRef) return;
        await runEditorPreset(videoRef, preset);
      }),
    [selectedVideo, ensureVideo, runAction],
  );

  const handleQuickTool = useCallback(
    (toolId) =>
      runAction(async () => {
        if (toolId === 'merge') {
          const result = await runMergeFromGallery();
          if (!result) return;
          Alert.alert('Done', getToolSuccessMessage('merge'));
          return;
        }

        const videoRef = selectedVideo || (await ensureVideo());
        if (!videoRef) return;
        await runQuickTool(toolId, videoRef);
        Alert.alert('Done', getToolSuccessMessage(toolId));
      }, null),
    [selectedVideo, ensureVideo, runAction],
  );

  const clearSelection = useCallback(() => {
    setSelectedVideo(null);
    setSelectedLabel('');
    setSelectedThumbnail(null);
    setPreviewUri(null);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerGradientEnd} />
      <SafeHeader>
        <ScreenHeader title="Video Tools" subtitle="Trim · Compress · Merge" />
      </SafeHeader>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.md }]}>
        <View style={[styles.selectionBox, shadows.card]}>
          <Text style={styles.selectionTitle}>Selected video</Text>
          {selectedVideo ? (
            <>
              <View style={styles.previewBox}>
                {previewLoading ? (
                  <View style={styles.previewPlaceholder}>
                    <ActivityIndicator color={colors.accent} />
                  </View>
                ) : previewUri ? (
                  <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Text style={styles.previewPlaceholderText}>Preview unavailable</Text>
                  </View>
                )}
              </View>
              <Text style={styles.selectionValue} numberOfLines={2}>
                {selectedLabel || 'Ready to edit'}
              </Text>
              <TouchableOpacity onPress={clearSelection} disabled={loading}>
                <Text style={styles.changeLink}>Change video</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.selectionEmpty}>No video selected yet</Text>
              <TouchableOpacity
                style={[styles.pickBtn, loading && styles.btnDisabled]}
                onPress={handlePickVideo}
                disabled={loading}
              >
                <Text style={styles.pickBtnText}>Pick from gallery</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Visual editor (free)</Text>
        <Text style={styles.sectionHint}>
          Opens full native editor — trim, crop, rotate, flip, speed & mute.
        </Text>
        {FREE_EDITOR_FEATURES.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            disabled={loading}
            onPress={() => handleEditorTool(tool.id)}
          />
        ))}

        <Text style={styles.sectionTitle}>Quick tools (free)</Text>
        <Text style={styles.sectionHint}>
          One-tap processing — compress, thumbnail, audio, GIF, merge & share.
        </Text>
        {FREE_QUICK_TOOLS.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            disabled={loading}
            onPress={() => handleQuickTool(tool.id)}
          />
        ))}

        {editableDownloads.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent downloads</Text>
            {editableDownloads.map((item) => (
              <TouchableOpacity
                key={`${item.videoId}-${item.completedAt}`}
                style={[
                  styles.downloadRow,
                  isSameSelection(item) && styles.downloadRowActive,
                ]}
                onPress={() => handleSelectDownload(item)}
                disabled={loading}
                activeOpacity={0.85}
              >
                {item.thumbnail ? (
                  <Image source={{ uri: item.thumbnail }} style={styles.downloadThumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.downloadThumb, styles.downloadThumbEmpty]}>
                    <Text style={styles.downloadThumbIcon}>▶</Text>
                  </View>
                )}
                <View style={styles.downloadBody}>
                  <Text style={styles.downloadTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.downloadMeta}>Tap to use for editing</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Processing…</Text>
          </View>
        )}

        <Text style={styles.footerNote}>
          Not included in free SDK: multi-track timeline, filters, stickers, text
          overlays, and background music. Those need a paid SDK like Meishe later.
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  selectionBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  selectionTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  previewBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  previewPlaceholderText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  selectionValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  selectionEmpty: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  changeLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  pickBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickBtnText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  sectionHint: {
    color: colors.textDim,
    fontSize: 12,
    marginBottom: spacing.sm,
    lineHeight: 17,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
  toolCardDisabled: {
    opacity: 0.6,
  },
  toolIcon: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  toolBody: {
    flex: 1,
  },
  toolLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  toolDesc: {
    color: colors.textDim,
    fontSize: 12,
  },
  toolArrow: {
    color: colors.textMuted,
    fontSize: 22,
    marginLeft: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  downloadThumb: {
    width: 72,
    height: 48,
    borderRadius: 8,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  downloadThumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadThumbIcon: {
    color: colors.textMuted,
    fontSize: 16,
  },
  downloadRowActive: {
    borderColor: colors.accent,
  },
  downloadBody: {
    flex: 1,
    marginRight: spacing.sm,
  },
  downloadTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  downloadMeta: {
    color: colors.textDim,
    fontSize: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  footerNote: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default EditScreen;

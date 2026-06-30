import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { colors, spacing } from '@theme';
import { APP_GALLERY_ALBUM } from '@config/env';
import useDownloadStore from '@store/downloadStore';
import { listActiveDownloads } from '@utils/download';
import { openVideoEditor } from '@services/edit';
import DownloadItem from '@components/download/DownloadItem';
import ScreenHeader from '@components/common/ScreenHeader';
import SafeHeader from '@components/common/SafeHeader';
import EmptyState from '@components/common/EmptyState';

const DownloadsScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const activeMap = useDownloadStore((s) => s.active);
  const history = useDownloadStore((s) => s.history);
  const clearHistory = useDownloadStore((s) => s.clearHistory);

  const active = useMemo(() => listActiveDownloads(activeMap), [activeMap]);

  const hasActive = active.length > 0;
  const hasHistory = history.length > 0;

  const handleEdit = useCallback(async (item) => {
    try {
      await openVideoEditor({
        localPath: item.localPath,
        galleryUri: item.galleryUri,
      });
    } catch (err) {
      Alert.alert('Editor error', err.message || 'Could not open editor');
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerGradientEnd} />
      <SafeHeader>
        <ScreenHeader title="My Files" subtitle={`Saved to Gallery → ${APP_GALLERY_ALBUM}`} />
      </SafeHeader>

      {!hasActive && !hasHistory ? (
        <EmptyState
          icon="⬇️"
          title="No downloads yet"
          subtitle="Download from Home or Paste Link tab"
        />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + spacing.md }]}>
          {hasActive && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>In progress</Text>
              {active.map((item) => (
                <DownloadItem key={item.videoId} item={item} onEdit={handleEdit} />
              ))}
            </View>
          )}

          {hasHistory && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleInline}>Recent</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearBtn}>Clear</Text>
                </TouchableOpacity>
              </View>
              {history.map((item) => (
                <DownloadItem
                  key={`${item.videoId}-${item.completedAt}`}
                  item={item}
                  onEdit={handleEdit}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleInline: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  clearBtn: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default DownloadsScreen;

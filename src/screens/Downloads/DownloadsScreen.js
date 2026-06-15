import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing } from '@theme';
import { APP_GALLERY_ALBUM } from '@config/env';
import useDownloadStore from '@store/downloadStore';
import { listActiveDownloads } from '@utils/download';
import DownloadItem from '@components/download/DownloadItem';
import ScreenHeader from '@components/common/ScreenHeader';
import EmptyState from '@components/common/EmptyState';

const DownloadsScreen = () => {
  const activeMap = useDownloadStore((s) => s.active);
  const history = useDownloadStore((s) => s.history);
  const clearHistory = useDownloadStore((s) => s.clearHistory);

  const active = useMemo(() => listActiveDownloads(activeMap), [activeMap]);

  const hasActive = active.length > 0;
  const hasHistory = history.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScreenHeader title="Downloads" />

      <Text style={styles.subtitle}>
        Videos save to Gallery → {APP_GALLERY_ALBUM}
      </Text>

      {!hasActive && !hasHistory ? (
        <EmptyState
          icon="⬇️"
          title="No downloads yet"
          subtitle="Download from Feed or paste a link in the Import tab"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {hasActive && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>In progress</Text>
              {active.map((item) => (
                <DownloadItem key={item.videoId} item={item} />
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
                <DownloadItem key={`${item.videoId}-${item.completedAt}`} item={item} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 12,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: 80,
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
    color: colors.textDim,
    fontSize: 13,
  },
});

export default DownloadsScreen;

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@theme';
import { formatMegabytes, formatSpeed } from '@utils/format';
import { DOWNLOAD_STATUS } from '@config/routes';

const StatRow = ({ label, value, highlight }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, highlight && styles.statHighlight]}>{value}</Text>
  </View>
);

const DownloadItem = ({ item }) => {
  const { title, thumbnail, status, received, total, progress, speed, error } = item;
  const remaining = total > 0 ? Math.max(total - received, 0) : 0;
  const percent =
    total > 0
      ? Math.round(Math.min((received / total) * 100, 100))
      : Math.round((progress || 0) * 100);

  const statusLabel = {
    [DOWNLOAD_STATUS.DOWNLOADING]: 'Downloading',
    [DOWNLOAD_STATUS.SAVING]: 'Saving to gallery…',
    [DOWNLOAD_STATUS.COMPLETED]: 'Completed',
    [DOWNLOAD_STATUS.FAILED]: 'Failed',
  }[status];

  const totalLabel = total > 0 ? formatMegabytes(total) : 'Fetching size…';
  const downloadedLabel = formatMegabytes(received);
  const remainingLabel = total > 0 ? formatMegabytes(remaining) : '—';
  const speedLabel = formatSpeed(speed);

  return (
    <View style={styles.card}>
      <Image source={{ uri: thumbnail }} style={styles.thumb} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.status}>{statusLabel}</Text>

        {status === DOWNLOAD_STATUS.DOWNLOADING && (
          <>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
            <Text style={styles.percent}>{percent}% complete</Text>

            <View style={styles.statsBox}>
              <StatRow label="Video size" value={totalLabel} />
              <StatRow label="Downloaded" value={downloadedLabel} highlight />
              <StatRow label="Remaining" value={remainingLabel} />
              <StatRow label="Speed" value={speedLabel} highlight />
            </View>
          </>
        )}

        {status === DOWNLOAD_STATUS.SAVING && (
          <View style={styles.statsBox}>
            <StatRow label="Downloaded" value={downloadedLabel} highlight />
            <StatRow label="Video size" value={total > 0 ? formatMegabytes(total) : downloadedLabel} />
          </View>
        )}

        {status === DOWNLOAD_STATUS.COMPLETED && (
          <View style={styles.statsBox}>
            <StatRow
              label="Saved"
              value={total > 0 ? formatMegabytes(total) : formatMegabytes(received)}
              highlight
            />
          </View>
        )}

        {status === DOWNLOAD_STATUS.FAILED && (
          <Text style={styles.error}>{error}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  thumb: {
    width: 120,
    height: 90,
    backgroundColor: colors.surfaceElevated,
  },
  body: {
    flex: 1,
    padding: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    ...typography.cardTitle,
    fontSize: 13,
    marginBottom: 4,
  },
  status: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressTrack: {
    height: 5,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  percent: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  statsBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: spacing.sm,
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 11,
  },
  statValue: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  statHighlight: {
    color: colors.textPrimary,
  },
  error: {
    color: colors.error,
    fontSize: 11,
  },
});

export default DownloadItem;

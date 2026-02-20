import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useOfflineStore from '../store/offlineStore';
import useSubscriptionStore from '../store/subscriptionStore';
import PremiumGate from './PremiumGate';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function OfflineDownloadButton({ trail }) {
  const { isOffline, downloadTrail, removeTrail, downloadProgress, offlineTrails } =
    useOfflineStore();
  const { subscribed, loading: subLoading } = useSubscriptionStore();

  if (!trail || !trail.coordinates?.length) return null;

  if (!subLoading && !subscribed) {
    return <PremiumGate feature="Offline Maps" compact />;
  }

  const trailId = trail._id;
  const isDownloaded = isOffline(trailId);
  const progress = downloadProgress[trailId];
  const isDownloading = progress !== undefined && progress < 100;
  const downloadedData = offlineTrails[trailId];

  const handleDownload = () => {
    Alert.alert(
      'Download for Offline',
      `Download "${trail.name}" map tiles and trail data for offline use? This may use significant data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => downloadTrail(trail) },
      ]
    );
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Offline Data',
      `Remove offline data for "${trail.name}"? You will need internet access to view this trail again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeTrail(trailId) },
      ]
    );
  };

  if (isDownloading) {
    return (
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <Ionicons name="cloud-download-outline" size={20} color={COLORS.primary} />
          <Text style={styles.progressText}>Downloading... {progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  }

  if (isDownloaded) {
    const downloadDate = downloadedData?.downloadedAt
      ? new Date(downloadedData.downloadedAt).toLocaleDateString()
      : '';

    return (
      <View style={styles.container}>
        <View style={styles.downloadedRow}>
          <View style={styles.downloadedInfo}>
            <View style={styles.downloadedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.downloadedText}>Available Offline</Text>
            </View>
            {downloadDate && (
              <Text style={styles.dateText}>Downloaded {downloadDate}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
      <Ionicons name="cloud-download-outline" size={20} color={COLORS.primary} />
      <Text style={styles.downloadBtnText}>Download for Offline</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  downloadedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadedInfo: {
    gap: 2,
  },
  downloadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 24,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

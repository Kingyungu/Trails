import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import useTrackingStore from '../store/trackingStore';

export default function TrackingPanel() {
  const { isTracking, distance, duration, route } = useTrackingStore();

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pace = duration > 0 && distance > 0
    ? ((duration / 60) / distance).toFixed(1)
    : '0.0';

  return (
    <View style={styles.panel}>
      <View style={styles.stats}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{formatTime(duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{pace}</Text>
          <Text style={styles.statLabel}>min/km</Text>
        </View>
      </View>
      <View style={styles.indicator}>
        <View style={[styles.dot, isTracking && styles.dotActive]} />
        <Text style={styles.indicatorText}>
          {isTracking ? 'Recording' : 'Paused'} · {route.length} points
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    margin: SPACING.md,
    ...SHADOWS.lg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBlock: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textLight,
  },
  dotActive: {
    backgroundColor: COLORS.error,
  },
  indicatorText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

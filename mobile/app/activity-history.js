import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getActivities, deleteActivity } from '../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ActivityHistoryScreen() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await getActivities();
      setActivities(data.activities);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Activity', 'Remove this hike from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteActivity(id);
            setActivities((prev) => prev.filter((a) => a._id !== id));
          } catch {
            Alert.alert('Error', 'Could not delete activity');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Ionicons name="footsteps" size={20} color={COLORS.tint} />
          <Text style={styles.trailName}>{item.trailName || 'Free Hike'}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.systemGray} />
        </TouchableOpacity>
      </View>

      <Text style={styles.date}>{formatDate(item.completed_at)}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="resize" size={16} color={COLORS.tint} />
          <Text style={styles.statValue}>{item.distance_km} km</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="time" size={16} color={COLORS.systemOrange} />
          <Text style={styles.statValue}>{formatDuration(item.duration_seconds)}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="speedometer" size={16} color={COLORS.systemBlue} />
          <Text style={styles.statValue}>{item.avgSpeed} km/h</Text>
        </View>
      </View>

      {item.trail && (
        <TouchableOpacity
          style={styles.viewTrailBtn}
          onPress={() => router.push(`/trail/${item.trail._id || item.trail}`)}
        >
          <Text style={styles.viewTrailText}>View Trail</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.tint} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.tint} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="footsteps-outline" size={48} color={COLORS.systemGray3} />
            <Text style={styles.emptyTitle}>No Hikes Yet</Text>
            <Text style={styles.emptyText}>
              Complete and save a trail to see your hiking history here.
            </Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/tracking')}>
              <Text style={styles.startBtnText}>Start a Hike</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: 60,
  },
  loadingText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
  },
  card: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  trailName: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
    flex: 1,
  },
  date: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.tertiaryLabel,
    marginTop: 4,
    marginLeft: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.label,
  },
  viewTrailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  viewTrailText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.tint,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
    marginTop: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
    textAlign: 'center',
    marginTop: SPACING.sm,
    maxWidth: 260,
  },
  startBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.tint,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  startBtnText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
});

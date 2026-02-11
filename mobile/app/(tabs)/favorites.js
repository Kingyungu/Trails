import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import useTrailStore from '../../store/trailStore';
import TrailCard from '../../components/TrailCard';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { favorites, loading, fetchFavorites } = useTrailStore();

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const handleRefresh = useCallback(() => {
    if (user) fetchFavorites();
  }, [user, fetchFavorites]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Ionicons name="heart-outline" size={60} color={COLORS.systemGray3} />
        <Text style={styles.emptyTitle}>Save your favorites</Text>
        <Text style={styles.emptyText}>Sign in to bookmark trails you love</Text>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={favorites}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <TrailCard trail={item} />}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor={COLORS.tint}
          colors={[COLORS.tint]}
        />
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={60} color={COLORS.systemGray3} />
          <Text style={styles.emptyTitle}>No saved trails yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart icon on any trail to save it here
          </Text>
        </View>
      }
    />
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
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
    marginTop: SPACING.lg,
  },
  emptyText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  signInBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.tint,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    minWidth: 200,
    alignItems: 'center',
  },
  signInText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
});

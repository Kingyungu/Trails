import React, { memo, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTrailStore from '../store/trailStore';
import DifficultyBadge from './DifficultyBadge';
import { getCurrentLocation } from '../services/location';
import { COLORS, SPACING, RADIUS, SHADOWS, DIFFICULTY } from '../constants/theme';

export default memo(function NearbyTrails() {
  const router = useRouter();
  const {
    nearbyAppTrails,
    nearbyOsmTrails,
    nearbyLoading,
    fetchNearbyTrails,
  } = useTrailStore();
  const [locationError, setLocationError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadNearby();
  }, []);

  const loadNearby = async () => {
    try {
      const loc = await getCurrentLocation();
      if (!loc) {
        setLocationError(true);
        return;
      }
      await fetchNearbyTrails(loc.coords.latitude, loc.coords.longitude, 50);
      setLoaded(true);
    } catch {
      setLocationError(true);
    }
  };

  if (locationError) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, styles.sectionTitlePadded]}>Nearby Trails</Text>
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={28} color={COLORS.textLight} />
          <Text style={styles.emptyText}>Enable location to see nearby trails</Text>
        </View>
      </View>
    );
  }

  if (nearbyLoading && !loaded) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, styles.sectionTitlePadded]}>Nearby Trails</Text>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding trails near you...</Text>
        </View>
      </View>
    );
  }

  const allTrails = [...nearbyAppTrails, ...nearbyOsmTrails];

  if (allTrails.length === 0 && loaded) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, styles.sectionTitlePadded]}>Nearby Trails</Text>
        <View style={styles.emptyState}>
          <Ionicons name="trail-sign-outline" size={28} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No trails found nearby</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Nearby Trails</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{allTrails.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {nearbyAppTrails.map((trail) => (
          <TouchableOpacity
            key={`app-${trail._id}`}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/trail/${trail._id}`)}
          >
            <View style={styles.cardBadgeRow}>
              <View style={styles.appBadge}>
                <Text style={styles.badgeText}>In App</Text>
              </View>
              <DifficultyBadge difficulty={trail.difficulty} size="sm" />
            </View>
            <Text style={styles.cardName} numberOfLines={2}>
              {trail.name}
            </Text>
            <View style={styles.cardStats}>
              <View style={styles.cardStat}>
                <Ionicons name="navigate-outline" size={12} color={COLORS.accent} />
                <Text style={styles.cardStatText}>
                  {trail.distance_from_user} km away
                </Text>
              </View>
              <View style={styles.cardStat}>
                <Ionicons name="resize" size={12} color={COLORS.primaryLight} />
                <Text style={styles.cardStatText}>{trail.distance_km} km</Text>
              </View>
            </View>
            {trail.rating_avg > 0 && (
              <View style={styles.cardStat}>
                <Ionicons name="star" size={12} color={COLORS.star} />
                <Text style={styles.cardStatText}>{trail.rating_avg.toFixed(1)}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {nearbyOsmTrails.map((trail) => (
          <View key={`osm-${trail.osm_id}`} style={[styles.card, styles.osmCard]}>
            <View style={styles.cardBadgeRow}>
              <View style={styles.osmBadge}>
                <Text style={styles.osmBadgeText}>OSM</Text>
              </View>
              <View style={[styles.diffDot, {
                backgroundColor: DIFFICULTY[trail.difficulty]?.color || COLORS.textLight,
              }]} />
            </View>
            <Text style={styles.cardName} numberOfLines={2}>
              {trail.name}
            </Text>
            <View style={styles.cardStats}>
              <View style={styles.cardStat}>
                <Ionicons name="navigate-outline" size={12} color={COLORS.accent} />
                <Text style={styles.cardStatText}>
                  {trail.distance_from_user} km away
                </Text>
              </View>
              {trail.distance_km > 0 && (
                <View style={styles.cardStat}>
                  <Ionicons name="resize" size={12} color={COLORS.primaryLight} />
                  <Text style={styles.cardStatText}>{trail.distance_km} km</Text>
                </View>
              )}
            </View>
            {trail.surface !== 'unknown' && (
              <Text style={styles.surfaceText}>{trail.surface}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionTitlePadded: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  countText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    width: 180,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  osmCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  appBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  osmBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  osmBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  diffDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  cardStats: {
    gap: 4,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardStatText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  surfaceText: {
    fontSize: 11,
    color: COLORS.textLight,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});

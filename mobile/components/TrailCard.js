import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, DIFFICULTY } from '../constants/theme';
import DifficultyBadge from './DifficultyBadge';
import OfflineBadge from './OfflineBadge';
import useOfflineStore from '../store/offlineStore';

const TrailCard = memo(function TrailCard({ trail, compact = false }) {
  const router = useRouter();
  const diff = DIFFICULTY[trail.difficulty];
  const isAvailableOffline = useOfflineStore((s) => s.isOffline(trail._id));

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      activeOpacity={0.85}
      onPress={() => router.push(`/trail/${trail._id}`)}
    >
      <Image
        source={{ uri: trail.images?.[0] || 'https://via.placeholder.com/400x200' }}
        style={[styles.image, compact && styles.imageCompact]}
      />
      <View style={styles.overlay}>
        <DifficultyBadge difficulty={trail.difficulty} />
      </View>
      {isAvailableOffline && <OfflineBadge />}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{trail.name}</Text>
        <Text style={styles.region}>{trail.region}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color={COLORS.star} />
            <Text style={styles.statText}>{trail.rating_avg}</Text>
            <Text style={styles.statSub}>({trail.review_count})</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="resize" size={14} color={COLORS.primaryLight} />
            <Text style={styles.statText}>{trail.distance_km} km</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="trending-up" size={14} color={COLORS.primaryLight} />
            <Text style={styles.statText}>{trail.elevation_m}m</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default TrailCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardCompact: {
    width: 260,
    marginRight: SPACING.md,
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imageCompact: {
    height: 140,
  },
  overlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  region: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  statSub: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});

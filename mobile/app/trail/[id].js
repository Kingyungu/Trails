import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTrailStore from '../../store/trailStore';
import useAuthStore from '../../store/authStore';
import DifficultyBadge from '../../components/DifficultyBadge';
import TrailMapEnhanced from '../../components/TrailMapEnhanced';
import PhotoGallery from '../../components/PhotoGallery';
import ReviewCard from '../../components/ReviewCard';
import ElevationProfile from '../../components/ElevationProfile';
import OfflineDownloadButton from '../../components/OfflineDownloadButton';
import WeatherWidget from '../../components/WeatherWidget';
import ConditionReports from '../../components/ConditionReports';
import useOfflineStore from '../../store/offlineStore';
import { getReviews } from '../../services/api';
import { formatDuration } from '../../services/location';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TrailDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { trail, loading, fetchTrail, toggleFav, clearTrail } = useTrailStore();
  const user = useAuthStore((s) => s.user);
  const { getOfflineTrail } = useOfflineStore();
  const [reviews, setReviews] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    loadTrail();
    loadReviews();
    return () => clearTrail();
  }, [id]);

  const loadTrail = async () => {
    try {
      await fetchTrail(id);
    } catch {
      // Fall back to offline data
      const offlineTrail = getOfflineTrail(id);
      if (offlineTrail) {
        setIsOfflineMode(true);
      }
    }
  };

  // Use offline trail data as fallback
  const displayTrail = trail || getOfflineTrail(id);

  useEffect(() => {
    if (user && displayTrail) {
      setIsFav(user.favorites?.includes(displayTrail._id));
    }
  }, [user, displayTrail]);

  const loadReviews = async () => {
    try {
      const { data } = await getReviews(id);
      setReviews(data);
    } catch {
      // silent
    }
  };

  const handleFavorite = async () => {
    if (!user) return router.push('/auth/login');
    const result = await toggleFav(displayTrail._id);
    setIsFav(result);
  };

  const handleShare = async () => {
    if (!displayTrail) return;
    await Share.share({
      title: displayTrail.name,
      message: `Check out ${displayTrail.name} on Trails Kenya! ${displayTrail.description.substring(0, 100)}...`,
    });
  };

  if (loading || !displayTrail) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Offline mode banner */}
      {isOfflineMode && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color={COLORS.white} />
          <Text style={styles.offlineBannerText}>Viewing offline data</Text>
        </View>
      )}

      {/* Hero Image */}
      <View style={styles.heroWrap}>
        <Image
          source={{ uri: displayTrail.images?.[0] || 'https://via.placeholder.com/800x400' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color={isFav ? COLORS.systemRed : COLORS.label}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={COLORS.label} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title section */}
        <View style={styles.titleRow}>
          <View style={styles.titleInfo}>
            <Text style={styles.trailName}>{displayTrail.name}</Text>
            <View style={styles.regionRow}>
              <Ionicons name="location" size={14} color={COLORS.secondaryLabel} />
              <Text style={styles.regionText}>{displayTrail.region}</Text>
            </View>
          </View>
          <DifficultyBadge difficulty={displayTrail.difficulty} size="lg" />
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= Math.round(displayTrail.rating_avg) ? 'star' : 'star-outline'}
                size={20}
                color={COLORS.systemYellow}
              />
            ))}
          </View>
          <Text style={styles.ratingNum}>{displayTrail.rating_avg}</Text>
          <Text style={styles.reviewCount}>({displayTrail.review_count} reviews)</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatItem icon="resize" label="Distance" value={`${displayTrail.distance_km} km`} />
          <StatItem icon="trending-up" label="Elevation" value={`${displayTrail.elevation_m}m`} />
          <StatItem icon="time" label="Duration" value={formatDuration(displayTrail.duration_hours)} />
          <StatItem icon="star" label="Rating" value={displayTrail.rating_avg.toFixed(1)} />
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>About this trail</Text>
        <Text style={styles.description}>{displayTrail.description}</Text>

        {/* Features */}
        {displayTrail.features?.length > 0 && (
          <View style={styles.featuresRow}>
            {displayTrail.features.map((f) => (
              <View key={f} style={styles.featurePill}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Weather */}
        <Text style={styles.sectionTitle}>Weather</Text>
        <WeatherWidget lat={displayTrail.location.lat} lng={displayTrail.location.lng} />

        {/* Trail Conditions */}
        <ConditionReports trailId={displayTrail._id} trailName={displayTrail.name} />

        {/* Map */}
        <Text style={styles.sectionTitle}>Trail Map</Text>
        <TrailMapEnhanced
          location={displayTrail.location}
          coordinates={displayTrail.coordinates}
          style={styles.mapContainer}
        />

        {/* Elevation Profile */}
        <Text style={styles.sectionTitle}>Elevation Profile</Text>
        <ElevationProfile trailId={id} />

        {/* Photos */}
        {displayTrail.images?.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>Photos</Text>
            <PhotoGallery images={displayTrail.images} />
          </>
        )}

        {/* Offline Download */}
        <OfflineDownloadButton trail={displayTrail} />

        {/* Reviews */}
        <View style={styles.reviewHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <TouchableOpacity
            style={styles.writeReviewBtn}
            onPress={() => {
              if (!user) return router.push('/auth/login');
              router.push(`/review/${displayTrail._id}`);
            }}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.tint} />
            <Text style={styles.writeReviewText}>Write Review</Text>
          </TouchableOpacity>
        </View>
        {reviews.length > 0 ? (
          reviews.slice(0, 5).map((r) => <ReviewCard key={r._id} review={r} />)
        ) : (
          <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
        )}

        {/* Start Trail button */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push(`/tracking?trailId=${displayTrail._id}`)}
        >
          <Ionicons name="navigate" size={20} color={COLORS.white} />
          <Text style={styles.startBtnText}>Navigate Trail</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={22} color={COLORS.tint} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.systemGroupedBackground,
  },
  heroWrap: {
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroActions: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  trailName: {
    ...TYPOGRAPHY.title1,
    color: COLORS.label,
    lineHeight: 34,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  regionText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingNum: {
    ...TYPOGRAPHY.callout,
    fontWeight: '700',
    color: COLORS.label,
  },
  reviewCount: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.tertiaryLabel,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    color: COLORS.label,
  },
  statLabel: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.tertiaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
    color: COLORS.secondaryLabel,
    marginBottom: SPACING.md,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  featurePill: {
    backgroundColor: COLORS.tertiarySystemFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  featureText: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '500',
    color: COLORS.label,
  },
  mapContainer: {
    height: 220,
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  writeReviewText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.tint,
  },
  noReviews: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.tertiaryLabel,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  startBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.tint,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  startBtnText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.systemOrange,
    paddingVertical: SPACING.sm,
  },
  offlineBannerText: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '600',
    color: COLORS.white,
  },
});

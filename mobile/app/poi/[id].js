import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import usePoiStore from '../../store/poiStore';
import POIMarker, { getPOIStyle } from '../../components/POIMarker';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DIFFICULTY_LABELS = ['', 'Easy', 'Moderate', 'Challenging', 'Difficult', 'Extreme'];
const DIFFICULTY_COLORS = ['', COLORS.systemGreen, COLORS.systemBlue, COLORS.systemOrange, COLORS.systemRed, COLORS.systemPurple];

export default function POIDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getPOI } = usePoiStore();
  const [poi, setPoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    loadPOI();
  }, [id]);

  const loadPOI = async () => {
    setLoading(true);
    const data = await getPOI(id);
    setPoi(data);
    setLoading(false);
  };

  const handleCall = () => {
    if (poi?.contact?.phone) {
      Linking.openURL(`tel:${poi.contact.phone}`);
    }
  };

  const handleWebsite = () => {
    if (poi?.contact?.website) {
      Linking.openURL(poi.contact.website);
    }
  };

  const handleEmail = () => {
    if (poi?.contact?.email) {
      Linking.openURL(`mailto:${poi.contact.email}`);
    }
  };

  const handleDirections = () => {
    if (poi?.location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.location.lat},${poi.location.lng}`;
      Linking.openURL(url);
    }
  };

  const onImageScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={COLORS.tint} />
      </View>
    );
  }

  if (!poi) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.errorText}>POI not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const poiStyle = getPOIStyle(poi.type);
  const hasImages = poi.images && poi.images.length > 0;
  const hasMultipleImages = poi.images && poi.images.length > 1;
  const hasContact = poi.contact?.phone || poi.contact?.website || poi.contact?.email;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: poi.name,
          headerBackTitle: 'Explore',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {hasImages && (
          <View style={styles.imageGallery}>
            <FlatList
              data={poi.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onImageScroll}
              scrollEventThrottle={16}
              keyExtractor={(_, index) => `img-${index}`}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.heroImage} />
              )}
            />
            {hasMultipleImages && (
              <View style={styles.imageDots}>
                {poi.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === activeImageIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
            {hasMultipleImages && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {activeImageIndex + 1}/{poi.images.length}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Header Info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{poi.name}</Text>
              {poi.verified && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.systemGreen} />
              )}
            </View>
            <View style={[styles.typeBadge, { backgroundColor: poiStyle.color }]}>
              <Ionicons name={poiStyle.icon} size={14} color={COLORS.white} />
              <Text style={styles.typeText}>{poi.type.replace('_', ' ')}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color={COLORS.secondaryLabel} />
            <Text style={styles.region}>{poi.region}</Text>
          </View>

          {/* Rating & Reviews */}
          {poi.rating_avg > 0 && (
            <View style={styles.ratingRow}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(poi.rating_avg) ? 'star' : 'star-outline'}
                    size={18}
                    color={COLORS.systemYellow}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{poi.rating_avg.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({poi.review_count} reviews)</Text>
            </View>
          )}

          {/* Difficulty Badge */}
          {poi.difficulty && (
            <View style={styles.difficultyRow}>
              <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[poi.difficulty] + '20' }]}>
                <Ionicons name="speedometer" size={14} color={DIFFICULTY_COLORS[poi.difficulty]} />
                <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[poi.difficulty] }]}>
                  {DIFFICULTY_LABELS[poi.difficulty]} (Level {poi.difficulty}/5)
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{poi.description}</Text>
        </View>

        {/* Quick Info Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoGrid}>
            {poi.elevation_m && (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: poiStyle.color + '20' }]}>
                  <Ionicons name="trending-up" size={20} color={poiStyle.color} />
                </View>
                <Text style={styles.infoLabel}>Elevation</Text>
                <Text style={styles.infoValue}>{poi.elevation_m.toLocaleString()}m</Text>
              </View>
            )}

            {poi.fees?.hasEntry ? (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: COLORS.systemOrange + '20' }]}>
                  <Ionicons name="cash" size={20} color={COLORS.systemOrange} />
                </View>
                <Text style={styles.infoLabel}>Entry Fee</Text>
                <Text style={styles.infoValue}>
                  {poi.fees.amount} {poi.fees.currency}
                </Text>
              </View>
            ) : poi.fees && !poi.fees.hasEntry ? (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: COLORS.systemGreen + '20' }]}>
                  <Ionicons name="cash" size={20} color={COLORS.systemGreen} />
                </View>
                <Text style={styles.infoLabel}>Entry Fee</Text>
                <Text style={[styles.infoValue, { color: COLORS.systemGreen }]}>Free</Text>
              </View>
            ) : null}

            {poi.openingHours && (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: COLORS.systemIndigo + '20' }]}>
                  <Ionicons name="time" size={20} color={COLORS.systemIndigo} />
                </View>
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoValue}>
                  {poi.openingHours.open} - {poi.openingHours.close}
                </Text>
              </View>
            )}

            {poi.difficulty && (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: DIFFICULTY_COLORS[poi.difficulty] + '20' }]}>
                  <Ionicons name="speedometer" size={20} color={DIFFICULTY_COLORS[poi.difficulty]} />
                </View>
                <Text style={styles.infoLabel}>Difficulty</Text>
                <Text style={[styles.infoValue, { color: DIFFICULTY_COLORS[poi.difficulty] }]}>
                  {DIFFICULTY_LABELS[poi.difficulty]}
                </Text>
              </View>
            )}

            {poi.review_count > 0 && (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: COLORS.systemYellow + '20' }]}>
                  <Ionicons name="chatbubbles" size={20} color={COLORS.systemYellow} />
                </View>
                <Text style={styles.infoLabel}>Reviews</Text>
                <Text style={styles.infoValue}>{poi.review_count}</Text>
              </View>
            )}

            {poi.verified && (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: COLORS.systemGreen + '20' }]}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.systemGreen} />
                </View>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, { color: COLORS.systemGreen }]}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Features & Amenities */}
        {poi.features && poi.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features & Amenities</Text>
            <View style={styles.featureGrid}>
              {poi.features.map((feature, index) => (
                <View key={index} style={styles.featureChip}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.systemGreen} />
                  <Text style={styles.featureChipText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact */}
        {hasContact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactList}>
              {poi.contact.phone && (
                <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                  <View style={[styles.contactIconCircle, { backgroundColor: COLORS.systemGreen + '20' }]}>
                    <Ionicons name="call" size={18} color={COLORS.systemGreen} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{poi.contact.phone}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.systemGray3} />
                </TouchableOpacity>
              )}
              {poi.contact.email && (
                <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
                  <View style={[styles.contactIconCircle, { backgroundColor: COLORS.systemBlue + '20' }]}>
                    <Ionicons name="mail" size={18} color={COLORS.systemBlue} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{poi.contact.email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.systemGray3} />
                </TouchableOpacity>
              )}
              {poi.contact.website && (
                <TouchableOpacity style={styles.contactRow} onPress={handleWebsite}>
                  <View style={[styles.contactIconCircle, { backgroundColor: COLORS.systemIndigo + '20' }]}>
                    <Ionicons name="globe" size={18} color={COLORS.systemIndigo} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Website</Text>
                    <Text style={styles.contactValue} numberOfLines={1}>{poi.contact.website}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.systemGray3} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Location Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.coordinatesRow}>
            <Ionicons name="navigate" size={14} color={COLORS.secondaryLabel} />
            <Text style={styles.coordinatesText}>
              {poi.location.lat.toFixed(4)}, {poi.location.lng.toFixed(4)}
            </Text>
          </View>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: poi.location.lat,
                longitude: poi.location.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: poi.location.lat,
                  longitude: poi.location.lng,
                }}
              >
                <POIMarker type={poi.type} />
              </Marker>
            </MapView>
          </View>
        </View>

        {/* Spacer for bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.directionsBtn}
          onPress={handleDirections}
        >
          <Ionicons name="navigate" size={20} color={COLORS.white} />
          <Text style={styles.directionsBtnText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.systemGroupedBackground,
  },
  scrollView: {
    flex: 1,
  },
  // Image Gallery
  imageGallery: {
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: COLORS.systemGray5,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 20,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  imageCounterText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.white,
    fontWeight: '600',
  },
  // Header
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  region: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    color: COLORS.label,
  },
  reviewCount: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
  },
  difficultyRow: {
    marginTop: SPACING.sm,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  difficultyText: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '600',
  },
  // Sections
  section: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
    color: COLORS.secondaryLabel,
  },
  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.tertiarySystemFill,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.secondaryLabel,
    marginTop: SPACING.xs,
  },
  infoValue: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    color: COLORS.label,
    marginTop: 2,
  },
  // Features
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.tertiarySystemFill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  featureChipText: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '500',
    color: COLORS.label,
  },
  // Contact
  contactList: {
    gap: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.tertiarySystemFill,
    padding: SPACING.md,
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.secondaryLabel,
  },
  contactValue: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '500',
    color: COLORS.tint,
    marginTop: 2,
  },
  // Coordinates
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  coordinatesText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.secondaryLabel,
  },
  // Map
  mapContainer: {
    height: 200,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(249, 249, 249, 0.94)',
    padding: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.tint,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  directionsBtnText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
  errorText: {
    ...TYPOGRAPHY.callout,
    color: COLORS.secondaryLabel,
    marginBottom: SPACING.lg,
  },
  backBtn: {
    backgroundColor: COLORS.tint,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  backBtnText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.white,
  },
});

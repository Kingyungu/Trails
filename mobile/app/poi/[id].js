import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import usePoiStore from '../../store/poiStore';
import POIMarker, { getPOIStyle } from '../../components/POIMarker';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function POIDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getPOI } = usePoiStore();
  const [poi, setPoi] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleDirections = () => {
    if (poi?.location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.location.lat},${poi.location.lng}`;
      Linking.openURL(url);
    }
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: poi.name,
          headerBackTitle: 'Explore',
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Hero Image */}
        {poi.images && poi.images.length > 0 && (
          <Image source={{ uri: poi.images[0] }} style={styles.heroImage} />
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

          {poi.rating_avg > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color={COLORS.systemYellow} />
              <Text style={styles.ratingText}>{poi.rating_avg.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({poi.review_count} reviews)</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{poi.description}</Text>
        </View>

        {/* Quick Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoGrid}>
            {poi.elevation_m && (
              <View style={styles.infoCard}>
                <Ionicons name="trending-up" size={20} color={poiStyle.color} />
                <Text style={styles.infoLabel}>Elevation</Text>
                <Text style={styles.infoValue}>{poi.elevation_m}m</Text>
              </View>
            )}

            {poi.fees?.hasEntry && (
              <View style={styles.infoCard}>
                <Ionicons name="cash" size={20} color={poiStyle.color} />
                <Text style={styles.infoLabel}>Entry Fee</Text>
                <Text style={styles.infoValue}>
                  {poi.fees.amount} {poi.fees.currency}
                </Text>
              </View>
            )}

            {poi.openingHours && (
              <View style={styles.infoCard}>
                <Ionicons name="time" size={20} color={poiStyle.color} />
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoValue}>
                  {poi.openingHours.open} - {poi.openingHours.close}
                </Text>
              </View>
            )}

            {poi.difficulty && (
              <View style={styles.infoCard}>
                <Ionicons name="speedometer" size={20} color={poiStyle.color} />
                <Text style={styles.infoLabel}>Access</Text>
                <Text style={styles.infoValue}>Level {poi.difficulty}/5</Text>
              </View>
            )}
          </View>
        </View>

        {/* Features */}
        {poi.features && poi.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features & Amenities</Text>
            <View style={styles.featureList}>
              {poi.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.systemGreen} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact */}
        {(poi.contact?.phone || poi.contact?.website || poi.contact?.email) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactButtons}>
              {poi.contact.phone && (
                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                  <Ionicons name="call" size={18} color={COLORS.tint} />
                  <Text style={styles.contactBtnText}>Call</Text>
                </TouchableOpacity>
              )}
              {poi.contact.website && (
                <TouchableOpacity style={styles.contactBtn} onPress={handleWebsite}>
                  <Ionicons name="globe" size={18} color={COLORS.tint} />
                  <Text style={styles.contactBtnText}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
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
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.systemGray5,
  },
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
    gap: 4,
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
  featureList: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.label,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.tertiarySystemFill,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  contactBtnText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.tint,
  },
  mapContainer: {
    height: 200,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  bottomBar: {
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

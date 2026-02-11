import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import useTrailStore from '../../store/trailStore';
import usePoiStore from '../../store/poiStore';
import DifficultyBadge from '../../components/DifficultyBadge';
import POIMarker from '../../components/POIMarker';
import POIFilter from '../../components/POIFilter';
import { getCurrentLocation } from '../../services/location';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const { trails, fetchTrails, nearbyOsmTrails, fetchNearbyTrails } = useTrailStore();
  const { pois, fetchPOIs, selectedTypes, setSelectedTypes, getFilteredPOIs } = usePoiStore();
  const [selected, setSelected] = useState(null);
  const [showPOIs, setShowPOIs] = useState(true);
  const [showOsmTrails, setShowOsmTrails] = useState(true);
  const slideAnim = useRef(new Animated.Value(150)).current;

  useEffect(() => {
    if (trails.length === 0) fetchTrails(true);
    if (pois.length === 0) fetchPOIs({ verified: true });
    loadNearbyTrails();
  }, []);

  const loadNearbyTrails = async () => {
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        fetchNearbyTrails(loc.coords.latitude, loc.coords.longitude, 50);
      }
    } catch {
      // silent - location not available
    }
  };

  const handleToggleType = (type) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
  };

  const filteredPOIs = getFilteredPOIs();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selected ? 0 : 150,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, [selected]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 0.0236,
          longitude: 37.9062,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* App trail markers */}
        {trails.map((trail) => (
          <Marker
            key={`trail-${trail._id}`}
            coordinate={{
              latitude: trail.location.lat,
              longitude: trail.location.lng,
            }}
            onPress={() => setSelected({ type: 'trail', data: trail })}
          >
            <View
              style={[
                styles.marker,
                selected?.type === 'trail' && selected?.data?._id === trail._id && styles.markerActive,
              ]}
            >
              <Ionicons name="trail-sign" size={16} color={COLORS.white} />
            </View>
          </Marker>
        ))}

        {/* OSM nearby trail markers */}
        {showOsmTrails && nearbyOsmTrails.map((trail) => (
          <Marker
            key={`osm-${trail.osm_id}`}
            coordinate={{
              latitude: trail.location.lat,
              longitude: trail.location.lng,
            }}
            onPress={() => setSelected({ type: 'osm', data: trail })}
          >
            <View
              style={[
                styles.osmMarker,
                selected?.type === 'osm' && selected?.data?.osm_id === trail.osm_id && styles.osmMarkerActive,
              ]}
            >
              <Ionicons name="footsteps" size={14} color={COLORS.white} />
            </View>
          </Marker>
        ))}

        {/* POI markers */}
        {showPOIs && filteredPOIs.map((poi) => (
          <Marker
            key={`poi-${poi._id}`}
            coordinate={{
              latitude: poi.location.lat,
              longitude: poi.location.lng,
            }}
            onPress={() => setSelected({ type: 'poi', data: poi })}
          >
            <POIMarker
              type={poi.type}
              isActive={selected?.type === 'poi' && selected?.data?._id === poi._id}
            />
          </Marker>
        ))}
      </MapView>

      {/* POI Filter */}
      <POIFilter
        selectedTypes={selectedTypes}
        onToggleType={handleToggleType}
        style={styles.poiFilter}
      />

      {/* Trail count overlay */}
      <View style={styles.countBadge}>
        <Ionicons name="navigate" size={14} color={COLORS.tint} />
        <Text style={styles.countText}>{trails.length} trails</Text>
        <View style={styles.divider} />
        <TouchableOpacity
          onPress={() => setShowOsmTrails(!showOsmTrails)}
          style={styles.poiToggle}
        >
          <Ionicons
            name={showOsmTrails ? 'footsteps' : 'footsteps-outline'}
            size={14}
            color={showOsmTrails ? COLORS.systemBlue : COLORS.systemGray}
          />
          <Text style={[styles.countText, !showOsmTrails && styles.countTextMuted]}>
            {nearbyOsmTrails.length} OSM
          </Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          onPress={() => setShowPOIs(!showPOIs)}
          style={styles.poiToggle}
        >
          <Ionicons
            name={showPOIs ? 'location' : 'location-outline'}
            size={14}
            color={showPOIs ? COLORS.systemOrange : COLORS.systemGray}
          />
          <Text style={[styles.countText, !showPOIs && styles.countTextMuted]}>
            {filteredPOIs.length} POIs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom card */}
      <Animated.View
        style={[styles.bottomCard, { transform: [{ translateY: slideAnim }] }]}
      >
        {selected && selected.type === 'trail' && (
          <TouchableOpacity
            style={styles.cardInner}
            activeOpacity={0.9}
            onPress={() => router.push(`/trail/${selected.data._id}`)}
          >
            <View style={styles.dragHandle} />
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {selected.data.name}
                </Text>
                <Text style={styles.cardRegion}>{selected.data.region}</Text>
              </View>
              <DifficultyBadge difficulty={selected.data.difficulty} />
            </View>
            <View style={styles.cardStats}>
              <View style={styles.cardStat}>
                <Ionicons name="star" size={16} color={COLORS.systemYellow} />
                <Text style={styles.cardStatVal}>{selected.data.rating_avg}</Text>
              </View>
              <View style={styles.cardStat}>
                <Ionicons name="resize" size={16} color={COLORS.tint} />
                <Text style={styles.cardStatVal}>{selected.data.distance_km} km</Text>
              </View>
              <View style={styles.cardStat}>
                <Ionicons name="trending-up" size={16} color={COLORS.tint} />
                <Text style={styles.cardStatVal}>{selected.data.elevation_m}m</Text>
              </View>
              <TouchableOpacity style={styles.goBtn}>
                <Text style={styles.goBtnText}>View Trail</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.tint} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {selected && selected.type === 'osm' && (
          <View style={styles.cardInner}>
            <View style={styles.dragHandle} />
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {selected.data.name}
                </Text>
                <Text style={styles.cardRegion}>OpenStreetMap Trail</Text>
              </View>
              <View style={styles.osmTypeBadge}>
                <Text style={styles.osmTypeText}>OSM</Text>
              </View>
            </View>
            <View style={styles.cardStats}>
              {selected.data.distance_km > 0 && (
                <View style={styles.cardStat}>
                  <Ionicons name="resize" size={16} color={COLORS.tint} />
                  <Text style={styles.cardStatVal}>{selected.data.distance_km} km</Text>
                </View>
              )}
              <View style={styles.cardStat}>
                <Ionicons name="navigate-outline" size={16} color={COLORS.systemOrange} />
                <Text style={styles.cardStatVal}>{selected.data.distance_from_user} km away</Text>
              </View>
              {selected.data.surface !== 'unknown' && (
                <View style={styles.cardStat}>
                  <Ionicons name="footsteps" size={16} color={COLORS.tint} />
                  <Text style={styles.cardStatVal}>{selected.data.surface}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {selected && selected.type === 'poi' && (
          <TouchableOpacity
            style={styles.cardInner}
            activeOpacity={0.9}
            onPress={() => router.push(`/poi/${selected.data._id}`)}
          >
            <View style={styles.dragHandle} />
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {selected.data.name}
                </Text>
                <Text style={styles.cardRegion}>{selected.data.region}</Text>
              </View>
              <View style={styles.poiTypeBadge}>
                <Text style={styles.poiTypeText}>
                  {selected.data.type.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <View style={styles.cardStats}>
              {selected.data.rating_avg > 0 && (
                <View style={styles.cardStat}>
                  <Ionicons name="star" size={16} color={COLORS.systemYellow} />
                  <Text style={styles.cardStatVal}>{selected.data.rating_avg}</Text>
                </View>
              )}
              {selected.data.fees?.hasEntry && (
                <View style={styles.cardStat}>
                  <Ionicons name="cash" size={16} color={COLORS.tint} />
                  <Text style={styles.cardStatVal}>
                    {selected.data.fees.amount} {selected.data.fees.currency}
                  </Text>
                </View>
              )}
              {selected.data.verified && (
                <View style={styles.cardStat}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.systemGreen} />
                  <Text style={styles.cardStatVal}>Verified</Text>
                </View>
              )}
              <TouchableOpacity style={styles.goBtn}>
                <Text style={styles.goBtnText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.tint} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.tint,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  markerActive: {
    backgroundColor: COLORS.systemOrange,
    transform: [{ scale: 1.2 }],
  },
  osmMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.systemBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  osmMarkerActive: {
    backgroundColor: COLORS.systemIndigo,
    transform: [{ scale: 1.2 }],
  },
  osmTypeBadge: {
    backgroundColor: COLORS.systemBlue,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  osmTypeText: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '600',
    color: COLORS.white,
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  countText: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '600',
    color: COLORS.label,
  },
  countTextMuted: {
    color: COLORS.secondaryLabel,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 16,
    backgroundColor: COLORS.separator,
  },
  poiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  poiFilter: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
  },
  poiTypeBadge: {
    backgroundColor: COLORS.tintLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  poiTypeText: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cardInner: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: COLORS.systemGray4,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardName: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
  },
  cardRegion: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.secondaryLabel,
    marginTop: 2,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardStatVal: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '600',
    color: COLORS.label,
  },
  goBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  goBtnText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.tint,
  },
});

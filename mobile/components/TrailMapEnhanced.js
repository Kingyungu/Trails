import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, RADIUS } from '../constants/theme';

const MAP_TYPES = [
  { key: 'standard', label: 'Standard' },
  { key: 'satellite', label: 'Satellite' },
  { key: 'hybrid', label: 'Hybrid' },
  { key: 'terrain', label: 'Terrain' },
];

export default function TrailMapEnhanced({
  location,
  coordinates = [],
  trails = [],
  onMarkerPress,
  style,
  showRoute = true,
  interactive = true,
}) {
  const [typeIndex, setTypeIndex] = useState(0);

  if (!location && trails.length === 0) return null;

  const currentType = MAP_TYPES[typeIndex];

  const toggleMapType = () => {
    setTypeIndex((prev) => (prev + 1) % MAP_TYPES.length);
  };

  const region = location
    ? {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : {
        latitude: 0.0236,
        longitude: 37.9062,
        latitudeDelta: 10,
        longitudeDelta: 10,
      };

  const routeCoords = coordinates.map((c) => ({
    latitude: c.lat,
    longitude: c.lng,
  }));

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        mapType={currentType.key}
        initialRegion={region}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={interactive}
      >
        {/* Trail route line */}
        {showRoute && routeCoords.length > 1 && (
          <>
            <Polyline
              coordinates={routeCoords}
              strokeColor="#FFFFFF"
              strokeWidth={7}
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLORS.primary}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

        {/* Trailhead marker */}
        {location && (
          <Marker
            coordinate={{ latitude: location.lat, longitude: location.lng }}
          >
            <View style={styles.startMarker}>
              <Ionicons name="flag" size={20} color={COLORS.white} />
            </View>
          </Marker>
        )}

        {/* Multiple trail markers */}
        {trails.map((trail) => (
          <Marker
            key={trail._id}
            coordinate={{
              latitude: trail.location.lat,
              longitude: trail.location.lng,
            }}
            onPress={() => onMarkerPress?.(trail)}
          >
            <View style={styles.customMarker}>
              <Text style={styles.markerText}>
                {trail.rating_avg.toFixed(1)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map controls */}
      {interactive && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleMapType}
            activeOpacity={0.7}
          >
            <Ionicons name="layers-outline" size={20} color={COLORS.primary} />
            <Text style={styles.controlText}>{currentType.label}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Legend */}
      {showRoute && coordinates.length > 1 && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendLine} />
            <Text style={styles.legendText}>Trail Path</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    height: 220,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  startMarker: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  customMarker: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    gap: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  controlText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  legend: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendLine: {
    width: 24,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
});

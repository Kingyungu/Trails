import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const MAP_STYLES = [
  { key: 'outdoors', label: 'Outdoors', url: Mapbox.StyleURL.Outdoors },
  { key: 'satellite', label: 'Satellite', url: Mapbox.StyleURL.Satellite },
  { key: 'satelliteStreet', label: 'Sat+Labels', url: Mapbox.StyleURL.SatelliteStreet },
  { key: 'street', label: 'Street', url: Mapbox.StyleURL.Street },
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
  const [styleIndex, setStyleIndex] = useState(0);

  if (!location && trails.length === 0) return null;

  const currentStyle = MAP_STYLES[styleIndex];

  const toggleMapStyle = () => {
    setStyleIndex((prev) => (prev + 1) % MAP_STYLES.length);
  };

  // Build GeoJSON for route line
  const routeGeoJSON = coordinates.length > 1
    ? {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates.map((c) => [c.lng, c.lat]),
        },
      }
    : null;

  return (
    <View style={[styles.container, style]}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={currentStyle.url}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={interactive}
        attributionEnabled={false}
        logoEnabled={false}
        compassEnabled={interactive}
        scaleBarEnabled={interactive}
      >
        <Mapbox.Camera
          centerCoordinate={
            location
              ? [location.lng, location.lat]
              : [37.9062, 0.0236]
          }
          zoomLevel={location ? 14 : 5}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* Trail route line */}
        {showRoute && routeGeoJSON && (
          <Mapbox.ShapeSource id="trailRouteEnhanced" shape={routeGeoJSON}>
            <Mapbox.LineLayer
              id="trailRouteBorderEnhanced"
              style={{
                lineColor: '#FFFFFF',
                lineWidth: 7,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Mapbox.LineLayer
              id="trailRouteLineEnhanced"
              style={{
                lineColor: COLORS.primary,
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              aboveLayerID="trailRouteBorderEnhanced"
            />
          </Mapbox.ShapeSource>
        )}

        {/* Trailhead marker */}
        {location && (
          <Mapbox.PointAnnotation
            id="trailheadEnhanced"
            coordinate={[location.lng, location.lat]}
          >
            <View style={styles.startMarker}>
              <Ionicons name="flag" size={20} color={COLORS.white} />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Multiple trail markers */}
        {trails.map((trail) => (
          <Mapbox.PointAnnotation
            key={trail._id}
            id={`trail-enhanced-${trail._id}`}
            coordinate={[trail.location.lng, trail.location.lat]}
            onSelected={() => onMarkerPress?.(trail)}
          >
            <View style={styles.customMarker}>
              <Text style={styles.markerText}>
                {trail.rating_avg.toFixed(1)}
              </Text>
            </View>
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* Map controls */}
      {interactive && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleMapStyle}
            activeOpacity={0.7}
          >
            <Ionicons name="layers-outline" size={20} color={COLORS.primary} />
            <Text style={styles.controlText}>{currentStyle.label}</Text>
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

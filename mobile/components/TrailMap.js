import { StyleSheet, View, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

export default function TrailMap({
  location,
  coordinates = [],
  trails = [],
  onMarkerPress,
  style,
  showRoute = true,
  interactive = true,
}) {
  if (!location && trails.length === 0) return null;

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
        styleURL={Mapbox.StyleURL.Outdoors}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
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
          zoomLevel={location ? 13 : 5}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* Trail route line */}
        {showRoute && routeGeoJSON && (
          <Mapbox.ShapeSource id="trailRoute" shape={routeGeoJSON}>
            <Mapbox.LineLayer
              id="trailRouteBorder"
              style={{
                lineColor: '#FFFFFF',
                lineWidth: 6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Mapbox.LineLayer
              id="trailRouteLine"
              style={{
                lineColor: COLORS.primary,
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              aboveLayerID="trailRouteBorder"
            />
          </Mapbox.ShapeSource>
        )}

        {/* Single location marker */}
        {location && (
          <Mapbox.PointAnnotation
            id="trailhead"
            coordinate={[location.lng, location.lat]}
          >
            <View style={styles.startMarker}>
              <Ionicons name="flag" size={18} color={COLORS.white} />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Multiple trail markers */}
        {trails.map((trail) => (
          <Mapbox.PointAnnotation
            key={trail._id}
            id={`trail-${trail._id}`}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    height: 220,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  markerText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

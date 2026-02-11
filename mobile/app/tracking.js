import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import useTrackingStore from '../store/trackingStore';
import TrackingPanel from '../components/TrackingPanel';
import { getCurrentLocation } from '../services/location';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

export default function TrackingScreen() {
  const {
    isTracking,
    route,
    distance,
    duration,
    startTracking,
    stopTracking,
    reset,
  } = useTrackingStore();
  const mapRef = useRef(null);
  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      if (loc) {
        setUserLoc({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  // Follow user on map when tracking
  useEffect(() => {
    if (route.length > 0 && mapRef.current) {
      const last = route[route.length - 1];
      mapRef.current.animateToRegion({
        latitude: last.lat,
        longitude: last.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  }, [route.length]);

  const handleStart = async () => {
    const started = await startTracking();
    if (!started) {
      Alert.alert('Location Required', 'Please enable location services to track your hike.');
    }
  };

  const handleStop = () => {
    Alert.alert('Stop Tracking', 'Do you want to finish recording this trail?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: stopTracking,
      },
    ]);
  };

  const handleShare = async () => {
    const mins = Math.floor(duration / 60);
    await Share.share({
      message: `I just completed a ${distance.toFixed(2)}km hike in ${mins} minutes on Trails Kenya!`,
    });
  };

  const handleReset = () => {
    Alert.alert('Reset', 'Discard this trail recording?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: reset },
    ]);
  };

  const routeCoords = route.map((p) => ({
    latitude: p.lat,
    longitude: p.lng,
  }));

  const initialRegion = userLoc
    ? { ...userLoc, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : { latitude: -1.2921, longitude: 36.8219, latitudeDelta: 0.02, longitudeDelta: 0.02 };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        followsUserLocation={isTracking}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* Tracked route line */}
        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={COLORS.tint}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Start marker */}
        {route.length > 0 && (
          <Marker
            coordinate={{
              latitude: route[0].lat,
              longitude: route[0].lng,
            }}
          >
            <View style={styles.startMarker}>
              <Ionicons name="flag" size={14} color={COLORS.white} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Stats panel */}
      <TrackingPanel />

      {/* Controls */}
      <View style={styles.controls}>
        {!isTracking && route.length === 0 && (
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Ionicons name="play" size={28} color={COLORS.white} />
            <Text style={styles.startText}>Start Tracking</Text>
          </TouchableOpacity>
        )}

        {isTracking && (
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <Ionicons name="stop" size={28} color={COLORS.white} />
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        )}

        {!isTracking && route.length > 0 && (
          <View style={styles.finishedRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social" size={22} color={COLORS.white} />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Ionicons name="refresh" size={22} color={COLORS.systemRed} />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  startMarker: {
    backgroundColor: COLORS.systemGreen,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  controls: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  startBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.tint,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
  },
  startText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
    fontSize: 18,
  },
  stopBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.systemRed,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
  },
  stopText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
    fontSize: 18,
  },
  finishedRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.tint,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  shareBtnText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.tertiarySystemFill,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  resetText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.systemRed,
  },
});

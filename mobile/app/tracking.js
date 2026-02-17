import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTrackingStore from '../store/trackingStore';
import useNavigationStore from '../store/navigationStore';
import useAuthStore from '../store/authStore';
import NavigationPanel from '../components/NavigationPanel';
import TrackingPanel from '../components/TrackingPanel';
import { getCurrentLocation } from '../services/location';
import { getTrail } from '../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

export default function TrackingScreen() {
  const { trailId } = useLocalSearchParams();

  const {
    isTracking,
    route,
    distance,
    duration,
    startTracking,
    stopTracking,
    saveCompletedHike,
    savedActivity,
    reset,
    waypoints,
    dropWaypoint,
  } = useTrackingStore();

  const {
    guidedTrail,
    startGuidedNavigation,
    stopNavigation,
    updateNavigation,
  } = useNavigationStore();

  const user = useAuthStore((s) => s.user);
  const mapRef = useRef(null);

  const [userLoc, setUserLoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingTrail, setLoadingTrail] = useState(false);

  // Waypoint drop modal
  const [wpModalVisible, setWpModalVisible] = useState(false);
  const [wpLabel, setWpLabel] = useState('');

  // ── Load guided trail if trailId was passed ─────────────────────────────
  useEffect(() => {
    if (!trailId) return;
    setLoadingTrail(true);
    getTrail(trailId)
      .then(({ data }) => {
        if (data?.coordinates?.length) {
          startGuidedNavigation(data);
        }
      })
      .catch(() => {}) // silent — just no guidance if offline
      .finally(() => setLoadingTrail(false));
  }, [trailId]);

  // ── Initial user location ────────────────────────────────────────────────
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

  // ── Follow user on map while tracking ───────────────────────────────────
  useEffect(() => {
    if (route.length > 0 && mapRef.current) {
      const last = route[route.length - 1];
      mapRef.current.animateToRegion(
        {
          latitude: last.lat,
          longitude: last.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
      // Update navigation guidance
      if (guidedTrail) {
        updateNavigation(last.lat, last.lng);
      }
    }
  }, [route.length]);

  // ── Controls ─────────────────────────────────────────────────────────────

  const handleStart = async () => {
    const started = await startTracking();
    if (!started) {
      Alert.alert(
        'Location Required',
        'Please enable location services to track your hike.',
      );
    }
  };

  const handleStop = () => {
    Alert.alert('Stop Tracking', 'Finish recording this trail?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: () => {
          stopTracking();
          stopNavigation();
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save your hike.');
      return;
    }
    setSaving(true);
    const result = await saveCompletedHike(
      guidedTrail?._id,
      guidedTrail?.name,
    );
    setSaving(false);
    if (result) {
      Alert.alert('Hike Saved!', `${result.distance_km} km recorded to your activity history.`);
    } else {
      Alert.alert('Error', 'Could not save hike. Please try again.');
    }
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
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          reset();
          stopNavigation();
        },
      },
    ]);
  };

  // ── Waypoint drop ─────────────────────────────────────────────────────────

  const openWaypointModal = () => {
    setWpLabel('');
    setWpModalVisible(true);
  };

  const confirmWaypoint = () => {
    if (route.length === 0) return;
    const last = route[route.length - 1];
    dropWaypoint(last.lat, last.lng, wpLabel.trim() || undefined);
    setWpModalVisible(false);
  };

  // ── Derived map data ──────────────────────────────────────────────────────

  const routeCoords = route.map((p) => ({
    latitude: p.lat,
    longitude: p.lng,
  }));

  const ghostCoords = guidedTrail?.coordinates?.map((p) => ({
    latitude: p.lat,
    longitude: p.lng,
  })) ?? [];

  const initialRegion = userLoc
    ? { ...userLoc, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : { latitude: -1.2921, longitude: 36.8219, latitudeDelta: 0.02, longitudeDelta: 0.02 };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        followsUserLocation={isTracking}
        showsMyLocationButton
        showsCompass
        showsScale
      >
        {/* Ghost trail (planned route) */}
        {ghostCoords.length > 1 && (
          <Polyline
            coordinates={ghostCoords}
            strokeColor="rgba(82,183,136,0.45)"
            strokeWidth={4}
            lineDashPattern={[8, 5]}
          />
        )}

        {/* Live tracked route */}
        {routeCoords.length > 1 && (
          <>
            {/* White outline */}
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLORS.white}
              strokeWidth={7}
              lineCap="round"
              lineJoin="round"
            />
            {/* Colored fill */}
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLORS.tint}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

        {/* Start marker */}
        {route.length > 0 && (
          <Marker
            coordinate={{ latitude: route[0].lat, longitude: route[0].lng }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.startMarker}>
              <Ionicons name="flag" size={13} color={COLORS.white} />
            </View>
          </Marker>
        )}

        {/* Waypoint markers */}
        {waypoints.map((wp, idx) => (
          <Marker
            key={wp.id}
            coordinate={{ latitude: wp.lat, longitude: wp.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.waypointMarker}>
              <Text style={styles.waypointNumber}>{idx + 1}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Navigation HUD — shown when guided trail is active */}
      <NavigationPanel />

      {/* Loading indicator for trail fetch */}
      {loadingTrail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={COLORS.tint} />
          <Text style={styles.loadingText}>Loading trail data…</Text>
        </View>
      )}

      {/* Waypoint drop FAB — only while tracking */}
      {isTracking && (
        <TouchableOpacity style={styles.waypointFab} onPress={openWaypointModal}>
          <Ionicons name="flag" size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}

      {/* Tracking stats panel */}
      <TrackingPanel />

      {/* Controls */}
      <View style={styles.controls}>
        {!isTracking && route.length === 0 && (
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Ionicons name="play" size={28} color={COLORS.white} />
            <Text style={styles.startText}>
              {guidedTrail ? `Navigate ${guidedTrail.name}` : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        )}

        {isTracking && (
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <Ionicons name="stop" size={28} color={COLORS.white} />
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        )}

        {!isTracking && route.length > 0 && (
          <View style={styles.finishedControls}>
            {!savedActivity && (
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving…' : 'Save Hike'}
                </Text>
              </TouchableOpacity>
            )}

            {savedActivity && (
              <View style={styles.savedBanner}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.systemGreen} />
                <Text style={styles.savedText}>Hike saved to your history!</Text>
              </View>
            )}

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

            {/* Waypoints summary */}
            {waypoints.length > 0 && (
              <View style={styles.wpSummary}>
                <Ionicons name="flag" size={14} color={COLORS.tint} />
                <Text style={styles.wpSummaryText}>
                  {waypoints.length} waypoint{waypoints.length !== 1 ? 's' : ''} recorded
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Waypoint name modal */}
      <Modal
        visible={wpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWpModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Drop Waypoint</Text>
            <Text style={styles.modalSub}>Add an optional label for this point.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={`WP${waypoints.length + 1}`}
              placeholderTextColor={COLORS.placeholderText}
              value={wpLabel}
              onChangeText={setWpLabel}
              maxLength={30}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setWpModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmWaypoint}>
                <Text style={styles.modalConfirmText}>Drop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Markers
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
  waypointMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.systemOrange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  waypointNumber: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 13,
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  loadingText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.white,
  },

  // Waypoint FAB
  waypointFab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.systemOrange,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },

  // Controls
  controls: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
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
  finishedControls: {
    gap: SPACING.md,
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.systemGreen,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  saveBtnText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
  savedBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  savedText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.systemGreen,
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
  wpSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  wpSummaryText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.tint,
    fontWeight: '600',
  },

  // Waypoint modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.systemBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
  },
  modalSub: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
    marginTop: -SPACING.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.label,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.tertiarySystemFill,
    alignItems: 'center',
  },
  modalCancelText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.systemOrange,
    alignItems: 'center',
  },
  modalConfirmText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
});

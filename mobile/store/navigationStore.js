import { create } from 'zustand';

// ─── Geometry helpers ────────────────────────────────────────────────────────

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Bearing from point 1 → 2, degrees [0, 360)
function calcBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const la1 = (lat1 * Math.PI) / 180;
  const la2 = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(la2);
  const x =
    Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Signed difference between two bearings [-180, 180]
function bearingDiff(b1, b2) {
  let d = ((b2 - b1) + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

/**
 * Project point P onto segment AB using a flat-earth approximation.
 * Returns { dist (km), t (0–1 along segment) }.
 */
function pointToSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const scale = Math.cos((pLat * Math.PI) / 180);
  // Convert to pseudo-Cartesian (km)
  const px = (pLng - aLng) * scale * 111.32;
  const py = (pLat - aLat) * 111.32;
  const dx = (bLng - aLng) * scale * 111.32;
  const dy = (bLat - aLat) * 111.32;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq > 0 ? (px * dx + py * dy) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  const nx = aLng + (bLng - aLng) * t;
  const ny = aLat + (bLat - aLat) * t;
  return { dist: haversine(pLat, pLng, ny, nx), t };
}

/**
 * Scan ahead from the current segment for the first significant turn (>= threshold degrees).
 * Returns { direction: 'left'|'right', distance: km, angle: degrees } or null.
 */
function findNextTurn(coords, fromIdx, fromT, threshold = 25) {
  if (coords.length < 3) return null;
  const si = Math.min(fromIdx, coords.length - 2);
  let prevBear = calcBearing(
    coords[si].lat, coords[si].lng,
    coords[si + 1].lat, coords[si + 1].lng,
  );

  // Distance remaining on the current segment
  const segLen = haversine(
    coords[si].lat, coords[si].lng,
    coords[si + 1].lat, coords[si + 1].lng,
  );
  let distAhead = segLen * (1 - fromT);

  for (let i = si + 1; i < coords.length - 1; i++) {
    const b = calcBearing(
      coords[i].lat, coords[i].lng,
      coords[i + 1].lat, coords[i + 1].lng,
    );
    const diff = bearingDiff(prevBear, b);
    if (Math.abs(diff) >= threshold) {
      return {
        direction: diff > 0 ? 'right' : 'left',
        distance: distAhead,
        angle: Math.abs(diff),
      };
    }
    distAhead += haversine(
      coords[i].lat, coords[i].lng,
      coords[i + 1].lat, coords[i + 1].lng,
    );
    prevBear = b;
  }
  return null;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const useNavigationStore = create((set, get) => ({
  guidedTrail: null,       // { _id, name, coordinates: [{lat, lng}], distance_km }
  currentSegmentIdx: 0,
  progressPercent: 0,
  distanceToEnd: 0,        // km
  isOffRoute: false,
  deviation: 0,            // metres from trail
  nextTurn: null,          // { direction, distance, angle } | null

  startGuidedNavigation: (trail) => {
    if (!trail?.coordinates?.length) return;
    set({
      guidedTrail: trail,
      currentSegmentIdx: 0,
      progressPercent: 0,
      distanceToEnd: trail.distance_km || 0,
      isOffRoute: false,
      deviation: 0,
      nextTurn: findNextTurn(trail.coordinates, 0, 0),
    });
  },

  stopNavigation: () => {
    set({
      guidedTrail: null,
      currentSegmentIdx: 0,
      progressPercent: 0,
      distanceToEnd: 0,
      isOffRoute: false,
      deviation: 0,
      nextTurn: null,
    });
  },

  updateNavigation: (lat, lng) => {
    const { guidedTrail } = get();
    if (!guidedTrail?.coordinates?.length || guidedTrail.coordinates.length < 2) return;

    const coords = guidedTrail.coordinates;

    // Find the nearest trail segment
    let minDist = Infinity;
    let nearestIdx = 0;
    let nearestT = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const { dist, t } = pointToSegment(
        lat, lng,
        coords[i].lat, coords[i].lng,
        coords[i + 1].lat, coords[i + 1].lng,
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
        nearestT = t;
      }
    }

    // Distance traveled along the trail to nearest point
    let progressDist = 0;
    for (let i = 0; i < nearestIdx; i++) {
      progressDist += haversine(
        coords[i].lat, coords[i].lng,
        coords[i + 1].lat, coords[i + 1].lng,
      );
    }
    progressDist +=
      nearestT *
      haversine(
        coords[nearestIdx].lat, coords[nearestIdx].lng,
        coords[nearestIdx + 1].lat, coords[nearestIdx + 1].lng,
      );

    const total = guidedTrail.distance_km || 1;
    const progressPercent = Math.min(100, (progressDist / total) * 100);
    const distanceToEnd = Math.max(0, total - progressDist);
    const isOffRoute = minDist > 0.075;  // 75 m threshold
    const deviation = Math.round(minDist * 1000);
    const nextTurn = findNextTurn(coords, nearestIdx, nearestT);

    set({
      progressPercent,
      distanceToEnd,
      isOffRoute,
      deviation,
      nextTurn,
      currentSegmentIdx: nearestIdx,
    });
  },
}));

export default useNavigationStore;

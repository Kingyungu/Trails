const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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

function calculatePathDistance(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1].lat, coords[i - 1].lng, coords[i].lat, coords[i].lng);
  }
  return total;
}

function guessDifficulty(tags) {
  const scale = tags.sac_scale || '';
  if (scale.includes('hiking')) return 1;
  if (scale.includes('mountain_hiking')) return 2;
  if (scale.includes('demanding_mountain_hiking')) return 3;
  if (scale.includes('alpine_hiking')) return 4;
  if (scale.includes('demanding_alpine')) return 5;
  if (tags.highway === 'path') return 2;
  if (tags.highway === 'track') return 1;
  return 2; // default moderate
}

function buildOverpassQuery(lat, lng, radiusMeters) {
  return `
    [out:json][timeout:25];
    (
      way["highway"="path"]["name"](around:${radiusMeters},${lat},${lng});
      way["highway"="footway"]["name"](around:${radiusMeters},${lat},${lng});
      relation["route"="hiking"](around:${radiusMeters},${lat},${lng});
      way["highway"="track"]["name"](around:${radiusMeters},${lat},${lng});
    );
    out body;
    >;
    out skel qt;
  `;
}

function parseOverpassResponse(data, userLat, userLng) {
  const nodes = new Map();
  const trails = [];

  // Index all nodes
  data.elements
    .filter((e) => e.type === 'node')
    .forEach((n) => {
      nodes.set(n.id, { lat: n.lat, lng: n.lon });
    });

  // Process ways
  data.elements
    .filter((e) => e.type === 'way' && e.tags)
    .forEach((way) => {
      const coordinates = way.nodes.map((nodeId) => nodes.get(nodeId)).filter(Boolean);

      if (coordinates.length < 2) return;

      const name = way.tags.name || way.tags.ref || 'Unnamed Trail';
      const startPoint = coordinates[0];
      const distance = calculatePathDistance(coordinates);
      const distFromUser = haversine(userLat, userLng, startPoint.lat, startPoint.lng);

      trails.push({
        osm_id: way.id,
        name,
        source: 'osm',
        location: startPoint,
        coordinates,
        distance_km: Math.round(distance * 100) / 100,
        distance_from_user: Math.round(distFromUser * 100) / 100,
        difficulty: guessDifficulty(way.tags),
        surface: way.tags.surface || 'unknown',
        sac_scale: way.tags.sac_scale || null,
      });
    });

  // Sort by distance from user
  trails.sort((a, b) => a.distance_from_user - b.distance_from_user);
  return trails.slice(0, 20);
}

function getCacheKey(lat, lng, radius) {
  return `${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;
}

async function getNearbyOsmTrails(lat, lng, radiusKm = 10) {
  const key = getCacheKey(lat, lng, radiusKm);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const radiusMeters = radiusKm * 1000;
  const query = buildOverpassQuery(lat, lng, radiusMeters);

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  const trails = parseOverpassResponse(data, lat, lng);

  cache.set(key, { data: trails, timestamp: Date.now() });
  return trails;
}

module.exports = { getNearbyOsmTrails };

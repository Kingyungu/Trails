const OPEN_ELEVATION_URL = 'https://api.open-elevation.com/api/v1/lookup';
const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

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

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY * (i + 1)));
    }
  }
}

async function fetchElevationProfile(coordinates) {
  const allResults = [];

  for (let i = 0; i < coordinates.length; i += BATCH_SIZE) {
    const batch = coordinates.slice(i, i + BATCH_SIZE);
    const locations = batch.map((c) => ({
      latitude: c.lat,
      longitude: c.lng,
    }));

    const data = await fetchWithRetry(OPEN_ELEVATION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations }),
    });

    allResults.push(...data.results);

    // Rate limiting between batches
    if (i + BATCH_SIZE < coordinates.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Build profile with cumulative distance
  let cumulativeDistance = 0;
  const profile = allResults.map((point, index) => {
    if (index > 0) {
      cumulativeDistance += haversine(
        coordinates[index - 1].lat,
        coordinates[index - 1].lng,
        coordinates[index].lat,
        coordinates[index].lng
      );
    }
    return {
      lat: coordinates[index].lat,
      lng: coordinates[index].lng,
      elevation: point.elevation,
      distance_from_start: Math.round(cumulativeDistance * 1000) / 1000,
    };
  });

  // Calculate summary stats
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < profile.length; i++) {
    const diff = profile[i].elevation - profile[i - 1].elevation;
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }

  const elevations = profile.map((p) => p.elevation);

  return {
    profile,
    elevation_gain: Math.round(gain),
    elevation_loss: Math.round(loss),
    elevation_max: Math.round(Math.max(...elevations)),
    elevation_min: Math.round(Math.min(...elevations)),
  };
}

module.exports = { fetchElevationProfile };

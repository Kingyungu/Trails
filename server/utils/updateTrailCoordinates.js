/**
 * Update trail seed data with real OSM coordinates
 * Matches trails to nearby OSM data and updates with detailed GPS points
 */

const fs = require('fs');
const path = require('path');

// Read OSM data
const osmData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'osm_trails_data.json'), 'utf8')
);

// Our existing trails (from seed data)
const existingTrails = {
  'Mount Kenya - Sirimon Route': { lat: -0.1521, lng: 37.3084, region: 'Mount Kenya' },
  'Mount Kenya - Chogoria Route': { lat: -0.1300, lng: 37.3500, region: 'Mount Kenya' },
  "Hell's Gate National Park": { lat: -0.9167, lng: 36.3167, region: 'Rift Valley' },
  'Karura Forest Trail': { lat: -1.2364, lng: 36.8340, region: 'Nairobi' },
  'Ngong Hills': { lat: -1.4000, lng: 36.6500, region: 'Nairobi' },
  'Mount Longonot': { lat: -0.9142, lng: 36.4461, region: 'Rift Valley' },
  'Aberdare Ranges': { lat: -0.3833, lng: 36.7000, region: 'Mount Kenya' },
  'Ol Donyo Sabuk': { lat: -1.0667, lng: 37.2500, region: 'Mount Kenya' },
  'Menengai Crater': { lat: -0.2000, lng: 36.0667, region: 'Rift Valley' },
};

/**
 * Calculate distance between two points in kilometers
 */
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find OSM trails near a specific location
 */
function findNearbyTrails(location, regionName, maxDistance = 5) {
  const region = osmData.find(r => r.region === regionName);
  if (!region) return [];

  const nearby = [];

  region.trails.forEach(trail => {
    if (trail.coordinates.length > 5) { // Only trails with decent detail
      const firstPoint = trail.coordinates[0];
      const dist = distance(location.lat, location.lng, firstPoint.lat, firstPoint.lng);

      if (dist < maxDistance) {
        nearby.push({ ...trail, distance: dist });
      }
    }
  });

  return nearby.sort((a, b) => a.distance - b.distance);
}

/**
 * Combine multiple trail segments into one route
 */
function combineTrailSegments(segments, targetLength = 50) {
  const allCoords = [];
  let currentLength = 0;

  for (const segment of segments) {
    if (currentLength >= targetLength) break;

    allCoords.push(...segment.coordinates);
    currentLength += segment.coordinates.length;
  }

  // Simplify if too many points (keep every nth point)
  if (allCoords.length > 100) {
    const step = Math.ceil(allCoords.length / 50);
    return allCoords.filter((_, i) => i % step === 0);
  }

  return allCoords;
}

/**
 * Main function to update coordinates
 */
function updateTrailCoordinates() {
  console.log('========================================');
  console.log('Updating Trail Coordinates');
  console.log('========================================\n');

  const updates = {};

  for (const [trailName, location] of Object.entries(existingTrails)) {
    console.log(`\nProcessing: ${trailName}`);

    const nearby = findNearbyTrails(location, location.region, 10);
    console.log(`  Found ${nearby.length} nearby OSM trails`);

    if (nearby.length > 0) {
      // Get the best trails (closest ones)
      const bestTrails = nearby.slice(0, 5);
      const coordinates = combineTrailSegments(bestTrails, 50);

      console.log(`  ✓ Generated ${coordinates.length} coordinate points`);
      console.log(`  Closest trail: ${bestTrails[0].distance.toFixed(2)}km away`);

      updates[trailName] = coordinates;
    } else {
      console.log(`  ✗ No nearby trails found, keeping original coordinates`);
    }
  }

  // Save to file
  const outputFile = path.join(__dirname, 'trail_coordinates_update.json');
  fs.writeFileSync(outputFile, JSON.stringify(updates, null, 2));

  console.log('\n========================================');
  console.log(`✓ Saved coordinate updates to: trail_coordinates_update.json`);
  console.log(`Updated ${Object.keys(updates).length} trails`);
  console.log('========================================\n');

  return updates;
}

// Run if called directly
if (require.main === module) {
  const updates = updateTrailCoordinates();

  // Show example
  const firstTrail = Object.keys(updates)[0];
  if (firstTrail) {
    console.log('Example updated coordinates:');
    console.log(`${firstTrail}:`);
    console.log(JSON.stringify(updates[firstTrail].slice(0, 5), null, 2));
    console.log(`... and ${updates[firstTrail].length - 5} more points\n`);
  }
}

module.exports = { updateTrailCoordinates };

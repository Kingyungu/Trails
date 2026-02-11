/**
 * OpenStreetMap Trail Data Fetcher
 * Fetches real hiking trails, footpaths, and walking paths from OpenStreetMap
 *
 * Usage:
 *   node osmTrailFetcher.js
 *
 * This will fetch trail data for Kenya regions and output coordinates
 */

const https = require('https');
const fs = require('fs');

// Define bounding boxes for major Kenya trail regions
const regions = {
  'Mount Kenya': {
    name: 'Mount Kenya',
    bbox: {
      south: -0.2,
      west: 37.1,
      north: 0.0,
      east: 37.5
    }
  },
  'Nairobi': {
    name: 'Nairobi Area',
    bbox: {
      south: -1.4,
      west: 36.6,
      north: -1.1,
      east: 36.9
    }
  },
  'Rift Valley': {
    name: 'Rift Valley',
    bbox: {
      south: -1.0,
      west: 36.0,
      north: -0.1,
      east: 36.5
    }
  }
};

/**
 * Fetch trail data from OpenStreetMap using Overpass API
 */
function fetchTrailsForRegion(regionName, bbox) {
  return new Promise((resolve, reject) => {
    const query = `
      [out:json][timeout:25];
      (
        way["highway"="path"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["highway"="footway"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["highway"="track"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["route"="hiking"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      );
      out geom;
    `;

    const encodedQuery = encodeURIComponent(query);
    const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

    console.log(`\nFetching trails for ${regionName}...`);

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✓ Found ${json.elements.length} trail segments in ${regionName}`);
          resolve({ region: regionName, data: json });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Convert OSM trail data to coordinate arrays
 */
function convertToCoordinates(osmData) {
  const trails = [];

  osmData.elements.forEach((element) => {
    if (element.type === 'way' && element.geometry) {
      const coordinates = element.geometry.map(node => ({
        lat: node.lat,
        lng: node.lon
      }));

      if (coordinates.length > 1) {
        trails.push({
          osmId: element.id,
          name: element.tags?.name || 'Unnamed Trail',
          type: element.tags?.highway || element.tags?.route || 'path',
          surface: element.tags?.surface,
          difficulty: element.tags?.sac_scale,
          coordinates: coordinates,
          length_km: calculateDistance(coordinates)
        });
      }
    }
  });

  return trails;
}

/**
 * Calculate approximate trail length in kilometers
 */
function calculateDistance(coordinates) {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const lat1 = coordinates[i - 1].lat;
    const lon1 = coordinates[i - 1].lng;
    const lat2 = coordinates[i].lat;
    const lon2 = coordinates[i].lng;

    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return parseFloat(total.toFixed(2));
}

/**
 * Main function
 */
async function main() {
  console.log('========================================');
  console.log('OpenStreetMap Trail Data Fetcher');
  console.log('========================================');

  const allResults = [];

  for (const [key, region] of Object.entries(regions)) {
    try {
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await fetchTrailsForRegion(region.name, region.bbox);
      const trails = convertToCoordinates(result.data);

      allResults.push({
        region: region.name,
        trailCount: trails.length,
        trails: trails
      });

      console.log(`  → Processed ${trails.length} trails`);
    } catch (error) {
      console.error(`✗ Error fetching ${region.name}:`, error.message);
    }
  }

  // Save to file
  const outputFile = './osm_trails_data.json';
  fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2));
  console.log(`\n✓ Trail data saved to ${outputFile}`);
  console.log('\nSummary:');
  allResults.forEach(r => {
    console.log(`  ${r.region}: ${r.trailCount} trails`);
  });

  // Example usage
  console.log('\n========================================');
  console.log('How to use this data:');
  console.log('========================================');
  console.log('1. Open osm_trails_data.json');
  console.log('2. Copy coordinates arrays to your trail seed data');
  console.log('3. Replace existing coordinates in trails.js');
  console.log('\nExample:');
  if (allResults[0]?.trails[0]) {
    const example = allResults[0].trails[0];
    console.log(`\ncoordinates: ${JSON.stringify(example.coordinates.slice(0, 3), null, 2)}...`);
    console.log(`// ${example.coordinates.length} total points for detailed path`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchTrailsForRegion, convertToCoordinates };

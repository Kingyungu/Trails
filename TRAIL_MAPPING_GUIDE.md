# Trail Mapping Enhancement Guide

## Current Implementation

Your app now displays trails with:
- **Hybrid map type** (satellite imagery + roads/labels)
- **Enhanced polylines** with white outline for better visibility
- **Trail coordinates** rendered as paths on the map

## Getting Detailed Trail Data

To show **exact trails and walking paths**, you need GPS coordinate data. Here are the best sources:

### 1. OpenStreetMap (OSM) - FREE
OpenStreetMap has detailed trail and path data for Kenya.

**How to get trail coordinates:**
```bash
# Install overpass-turbo query tool or use web interface
# Visit: https://overpass-turbo.eu/
```

**Example query for trails in an area:**
```
[out:json];
(
  way["highway"="path"]({{bbox}});
  way["highway"="footway"]({{bbox}});
  way["highway"="track"]({{bbox}});
  way["route"="hiking"]({{bbox}});
);
out geom;
```

This returns detailed GPS coordinates for:
- Hiking paths
- Walking trails
- Footpaths
- Tracks

### 2. GPS Tracking Apps
- **Strava** - Download GPX files from popular routes
- **AllTrails** - Trail data and GPS tracks
- **Wikiloc** - Community-contributed trails
- **Komoot** - Detailed trail routing

### 3. Manual GPS Recording
Walk the trails with a GPS tracker app:
- **GPX Logger** (Android)
- **MyTracks** (iOS)
- **Gaia GPS**

Export as GPX and convert to coordinate arrays.

## Map Providers with Trail Data

### Option 1: Mapbox (Recommended)
Mapbox has an **Outdoors style** that shows trails, paths, and contour lines.

**Setup:**
```bash
npm install react-native-mapbox-gl
```

**Benefits:**
- Shows hiking trails, footpaths, and bike paths
- Topographic contour lines
- Better for outdoor/trail apps
- Free tier: 50,000 map loads/month

### Option 2: Google Maps with Terrain Layer
Already implemented! The hybrid view shows:
- Satellite imagery
- Roads and paths
- Terrain features

**To show more detail:**
- Increase map zoom level (latitudeDelta: 0.01 for closer view)
- The map will automatically show more paths when zoomed in

### Option 3: OpenStreetMap Overlay
Add OSM tile layer on top of your map:
```javascript
import { UrlTile } from 'react-native-maps';

// In your MapView:
<UrlTile
  urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  maximumZ={19}
  opacity={0.7}
/>
```

## Enhancing Your Trail Data

### Update coordinates in seed data
Replace basic coordinates with detailed GPS points:

**Before (5 points):**
```javascript
coordinates: [
  { lat: -0.1000, lng: 37.2200 },
  { lat: -0.1100, lng: 37.2400 },
  { lat: -0.1250, lng: 37.2600 },
  { lat: -0.1400, lng: 37.2800 },
  { lat: -0.1521, lng: 37.3084 },
]
```

**After (50+ points from GPS data):**
```javascript
coordinates: [
  { lat: -0.1000, lng: 37.2200 },
  { lat: -0.1005, lng: 37.2205 },
  { lat: -0.1010, lng: 37.2210 },
  // ... 50+ more coordinates for exact path
  { lat: -0.1521, lng: 37.3084 },
]
```

## Converting GPX to Coordinates

**Python script to convert GPX files:**
```python
import gpxpy
import json

with open('trail.gpx', 'r') as gpx_file:
    gpx = gpxpy.parse(gpx_file)

coordinates = []
for track in gpx.tracks:
    for segment in track.segments:
        for point in segment.points:
            coordinates.append({
                'lat': point.latitude,
                'lng': point.longitude
            })

print(json.dumps(coordinates, indent=2))
```

**Node.js script:**
```javascript
const fs = require('fs');
const xml2js = require('xml2js');

fs.readFile('trail.gpx', 'utf8', (err, data) => {
  xml2js.parseString(data, (err, result) => {
    const points = result.gpx.trk[0].trkseg[0].trkpt;
    const coordinates = points.map(p => ({
      lat: parseFloat(p.$.lat),
      lng: parseFloat(p.$.lon)
    }));
    console.log(JSON.stringify(coordinates, null, 2));
  });
});
```

## Recommended Next Steps

1. **Use Mapbox Outdoors Style** - Best for trail visibility
2. **Import real GPS data** from OSM or trail tracking apps
3. **Add elevation profiles** using elevation APIs
4. **Show nearby trails** by querying OSM Overpass API in real-time

## Google Maps API Key Setup

Make sure you have Google Maps enabled in your project:

**For Android:** `android/app/src/main/AndroidManifest.xml`
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

**For iOS:** `ios/YourApp/AppDelegate.m`
```objective-c
#import <GoogleMaps/GoogleMaps.h>

[GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY"];
```

## API Recommendations

### Free Elevation Data
- **Open-Elevation API**: `https://api.open-elevation.com/api/v1/lookup`
- **USGS Elevation API**
- **MapBox Terrain-RGB tiles**

### Trail Routing APIs
- **GraphHopper** (hiking routes)
- **OSRM** (Open Source Routing Machine)
- **Mapbox Directions API** (walking profile)

## Testing Your Enhanced Map

1. Run your app: `npm start`
2. View a trail detail page
3. The map should now show:
   - Satellite/hybrid imagery with terrain
   - Bold, visible trail paths
   - Points of interest
   - More detailed paths when zoomed in

## Resources

- [OpenStreetMap Wiki - Hiking](https://wiki.openstreetmap.org/wiki/Hiking)
- [Overpass API Examples](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_API_by_Example)
- [Mapbox Outdoors Style](https://www.mapbox.com/maps/outdoors)
- [GPX Format Documentation](https://www.topografix.com/gpx.asp)

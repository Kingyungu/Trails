# 🗺️ Points of Interest (POI) Features - Setup Guide

## Overview
Your trails app now includes 19 different types of Points of Interest including parks, waterfalls, climbing walls, viewpoints, camping sites, and more!

## 🚀 Quick Start

### Step 1: Start the Backend Server

```bash
cd server
npm run dev
```

The server should start on `http://localhost:5000`

### Step 2: Seed the POI Data

In a new terminal:

```bash
cd server
npm run seed:pois
```

This will add 20+ POIs across Kenya including:
- Mount Kenya National Park
- Hell's Gate National Park
- Karuru Falls (Kenya's tallest waterfall)
- Fischer's Tower (climbing wall)
- Ngong Hills Viewpoint
- And many more!

### Step 3: Configure Mobile App API URL

The mobile app needs to know where your backend server is running.

**Option A: Using localhost (iOS Simulator)**
If you're using iOS Simulator, edit `mobile/store/poiStore.js`:
```javascript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
```

**Option B: Using your computer's IP (Physical Device/Android Emulator)**
1. Find your computer's local IP address:
   - Windows: Run `ipconfig` in terminal, look for IPv4 Address
   - Mac/Linux: Run `ifconfig` or `ip addr`
2. Update `mobile/store/poiStore.js`:
```javascript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://YOUR_IP_HERE:5000';
```

**Option C: Using environment variable (Recommended)**
Create `mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:5000
```

### Step 4: Restart the Mobile App

```bash
cd mobile
npm start
```

Press `r` to reload the app.

---

## ✨ Features

### 19 POI Types Available:

| Icon | Type | Examples |
|------|------|----------|
| 🌳 | **Parks** | National parks, nature reserves |
| 👁️ | **Viewpoints** | Scenic overlooks, observation points |
| 💧 | **Waterfalls** | Karuru Falls, Fourteen Falls |
| 🧗 | **Climbing Walls** | Fischer's Tower, Lukenya Hills |
| ⛺ | **Camping** | Camping sites, picnic areas |
| 🅿️ | **Parking** | Trailhead parking, secure lots |
| 🚰 | **Water Sources** | Springs, refill points |
| 🦁 | **Wildlife** | Giraffe Centre, viewing spots |
| 🏞️ | **Lakes** | Lake Naivasha, crater lakes |
| 🗼 | **Lookout Towers** | Observation platforms |
| 🕳️ | **Caves** | Kitum Cave, lava tubes |
| 🍽️ | **Restaurants** | Trout Tree Restaurant |
| 🏢 | **Facilities** | Visitor centers, restrooms |
| 🚩 | **Trailheads** | Trail starting points |
| 🌉 | **Bridges** | Notable crossings |
| 🏛️ | **Monuments** | Historical sites |
| 🍔 | **Picnic Areas** | Designated picnic spots |
| 🏠 | **Shelters** | Mountain huts, rest stops |

### Interactive Map Features:

✅ **Toggle POIs** - Show/hide all POIs with one tap
✅ **Filter by Type** - Tap filter chips to show only specific types
✅ **Color-Coded Markers** - Each POI type has a unique color and icon
✅ **Mixed View** - See both trails and POIs on the same map
✅ **Quick Info Cards** - Tap any marker to see basic info
✅ **Detailed View** - Tap "View Details" for full POI information

### POI Detail Screen Includes:

- 📸 Hero images
- ⭐ Ratings and reviews
- 💰 Entry fees and hours
- 📍 Interactive map with "Get Directions" button
- 📞 Contact info (call/website buttons)
- ✅ Verified badge for official locations
- 🎯 Features and amenities list
- 🏔️ Elevation and access difficulty

---

## 🔧 Troubleshooting

### "Network request failed" Error

**Cause:** The mobile app can't reach the backend server.

**Solutions:**
1. Make sure the backend server is running (`npm run dev` in server folder)
2. Check that the API_URL in `mobile/store/poiStore.js` is correct
3. If using a physical device, ensure your phone and computer are on the same WiFi network
4. Try using your computer's IP address instead of `localhost`

### No POIs Showing on Map

**Solutions:**
1. Run `npm run seed:pois` in the server folder to add POI data
2. Check that POI toggle is ON (should show filled location icon)
3. Try selecting different filter types
4. Check the browser console or terminal for errors

### POI Markers Not Appearing

**Solutions:**
1. Make sure you've run `fetchPOIs()` - it's called automatically when the explore screen loads
2. Check that `showPOIs` is true
3. Verify POIs exist in the database (check server logs)

---

## 🗄️ Database

### POI Model Fields:

```javascript
{
  name: String,           // "Mount Kenya National Park"
  description: String,    // Detailed description
  type: String,          // "park", "waterfall", "climbing_wall", etc.
  location: {            // Coordinates
    lat: Number,
    lng: Number
  },
  region: String,        // "Central Kenya"
  images: [String],      // Image URLs
  features: [String],    // ["Wildlife viewing", "Camping"]
  difficulty: Number,    // 1-5 (access difficulty)
  elevation_m: Number,   // Elevation in meters
  openingHours: {
    open: String,        // "06:00"
    close: String        // "18:00"
  },
  fees: {
    hasEntry: Boolean,
    amount: Number,
    currency: String     // "USD" or "KES"
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  rating_avg: Number,    // Average rating
  review_count: Number,  // Number of reviews
  verified: Boolean      // Official/verified location
}
```

---

## 🎯 API Endpoints

### GET /api/pois
Get all POIs with optional filters

**Query Parameters:**
- `type` - Filter by POI type(s), comma-separated
- `region` - Filter by region name
- `search` - Text search in name/description
- `lat`, `lng`, `radius` - Find POIs near location (radius in km)
- `verified` - Filter by verified status (true/false)
- `limit` - Max results (default: 100)
- `sort` - Sort field (default: -created_at)

**Example:**
```bash
GET /api/pois?type=park,waterfall&region=Central%20Kenya&verified=true
```

### GET /api/pois/types
Get all POI types with counts

### GET /api/pois/:id
Get single POI by ID

### POST /api/pois
Create new POI (requires auth)

### PUT /api/pois/:id
Update POI (requires auth)

### DELETE /api/pois/:id
Delete POI (requires auth)

---

## 📱 Mobile App Files

### State Management
- `mobile/store/poiStore.js` - Zustand store for POI data

### Components
- `mobile/components/POIMarker.js` - Map marker component
- `mobile/components/POIFilter.js` - Filter chips component

### Screens
- `mobile/app/(tabs)/explore.js` - Main map with trails + POIs
- `mobile/app/poi/[id].js` - POI detail screen

---

## 🎨 Customization

### Adding New POI Types

1. Update the enum in `server/models/POI.js`:
```javascript
enum: [
  'park',
  'your_new_type',  // Add here
  // ...
]
```

2. Add icon and color in `mobile/components/POIMarker.js`:
```javascript
const styles = {
  your_new_type: { icon: 'icon-name', color: '#hex-color' },
  // ...
};
```

3. Add to filter list in `mobile/components/POIFilter.js`:
```javascript
const POI_TYPES = [
  { id: 'your_new_type', label: 'Display Name' },
  // ...
];
```

### Changing POI Colors/Icons

Edit `mobile/components/POIMarker.js`:
```javascript
park: { icon: 'leaf', color: '#059669' },  // Change icon or color
```

Available Ionicons: https://ionic.io/ionicons

---

## 📊 Seed Data

The seed file includes 20+ real POIs across Kenya:
- 3 National Parks (Mount Kenya, Hell's Gate, Aberdare)
- 2 Waterfalls (Karuru Falls, Fourteen Falls)
- 2 Climbing Walls (Fischer's Tower, Lukenya Hills)
- 2 Viewpoints (Ngong Hills, Menengai Crater)
- Plus camping sites, parking areas, wildlife spots, and more!

To add more POIs, edit `server/seed/pois.js` and run:
```bash
npm run seed:pois
```

---

## 🚀 Next Steps

### Suggested Enhancements:
1. **Add Reviews** - Let users review POIs
2. **User-Generated POIs** - Allow users to add new locations
3. **Photo Upload** - Let users upload POI photos
4. **Favorites** - Bookmark favorite POIs
5. **Nearby Search** - Show POIs near user's current location
6. **Navigation Integration** - Direct integration with Google/Apple Maps
7. **Offline Support** - Cache POIs for offline viewing
8. **AR View** - Augmented reality POI discovery
9. **Social Sharing** - Share POIs with friends
10. **Trip Planning** - Create multi-POI itineraries

---

## 📝 License

This POI feature is part of the Kenya Nature Trails app.

---

**Need Help?** Check the troubleshooting section or review the code comments in the source files.

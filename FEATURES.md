# Trails App — Feature Reference

> Last updated: 2026-02-17
> Stack: React Native (Expo) · Node.js/Express · MongoDB

---

## Table of Contents
1. [Screens](#screens)
2. [Components](#components)
3. [State Stores](#state-stores)
4. [Server API](#server-api)
5. [Data Models](#data-models)
6. [Authentication](#authentication)
7. [GPS Tracking & Navigation](#gps-tracking--navigation)
8. [Weather & Conditions](#weather--conditions)
9. [Points of Interest](#points-of-interest)
10. [Reviews](#reviews)
11. [Offline Mode](#offline-mode)
12. [Search & Filtering](#search--filtering)
13. [User Statistics](#user-statistics)
14. [Tech Stack](#tech-stack)

---

## Screens

### Tab Screens

#### Home (`(tabs)/index.js`)
- Browse all trails with full-text search (name, description, region)
- Filter by region and difficulty level
- "Top Rated" carousel — top 5 trails
- "Nearby Trails" section using device location
- Pagination (20 trails per page)
- Pull-to-refresh

#### Explore (`(tabs)/explore.js`)
- Interactive map view (MapView)
- Three marker types: app trails (blue), OSM trails (light blue), POIs (category icons)
- Live badge showing trail/POI counts
- Toggle OSM trails and POIs independently
- POI type filtering
- Bottom slide-up card on marker selection
- Navigate to trail or POI detail from card

#### Favorites (`(tabs)/favorites.js`)
- List of user's saved/hearted trails
- Requires authentication — shows sign-in prompt otherwise
- Pull-to-refresh, auto-refetch on tab focus

#### Profile (`(tabs)/profile.js`)
- User avatar with upload (image picker, 70% compression)
- Join date
- Hiking stats: total hikes, distance, time, elevation, avg speed, longest hike, saved trails
- Quick-action menu: Activity History, Saved Trails, Track a Trail, Settings, About
- Sign Out button
- Sign-in/register prompts when unauthenticated

---

### Non-Tab Screens

#### Trail Tracking (`tracking.js`)
- Real-time GPS tracking during hikes
- Live route polyline on map
- "Ghost trail" dashed overlay for planned route when navigating
- Start / Stop / Reset controls
- Drop waypoints with custom labels (FAB + modal)
- Navigation HUD: progress %, distance remaining, off-route warning + deviation
- Turn-by-turn instructions (direction, distance, angle)
- Save completed hike to activity history
- Share hike data to social media

#### Activity History (`activity-history.js`)
- List of all completed hikes
- Per-activity: trail name, date, distance, duration, avg speed
- Delete activity
- Link to associated trail detail
- Pull-to-refresh, empty state CTA

#### Trail Detail (`trail/[id].js`)
- Hero image with favorite + share buttons
- Name, region, difficulty badge, star rating + review count
- Stats grid: distance, elevation, duration, rating
- Description text + feature tags
- Weather widget (current conditions at trail location)
- Community condition reports
- Interactive route map
- Elevation profile graph
- Photo gallery (horizontal scroll + indicators)
- Offline download button
- Up to 5 user reviews + "Write Review" button
- "Navigate Trail" → opens tracking screen

#### POI Detail (`poi/[id].js`)
- Image gallery with pagination indicator
- Name, type badge, verification status
- Info grid: elevation, entry fee, hours, difficulty, review count
- Features & amenities checklist
- Contact section: call, email, website (all clickable)
- Map with POI coordinates
- "Get Directions" → Google Maps integration

#### Review Writing (`review/[trailId].js`)
- 5-star rating selector
- Text input (min 10 characters)
- Upload up to 4 photos with removal capability
- Loading state + success confirmation

#### Settings (`settings.js`)
- Distance units: km / mi
- Map type: Standard / Satellite / Terrain
- Notifications toggle
- Clear offline cache (shows cached trail count)
- Reset all settings to defaults
- Edit display name inline
- Change password (local accounts only)
- Delete account (destructive, requires confirmation)
- App version display (v1.0.0)

#### Forgot Password (`auth/forgot-password.js`)
- Step 1: Enter email → receive reset code
- Step 2: Enter code + new password
- Resend code option
- 15-minute code validity, 8-character numeric code

#### Login (`auth/login.js`)
- Email + password inputs, password visibility toggle
- Error message display
- "Forgot Password?" link
- Redirect to Register

#### Register (`auth/register.js`)
- Full name (min 2 chars), email, password (min 6 chars)
- Validation + error display
- Redirect to Login

---

## Components

| Component | Description |
|---|---|
| `DifficultyBadge` | Color-coded difficulty badge (1–5 scale) |
| `TrailCard` | Trail image, name, region, rating, distance, elevation |
| `ReviewCard` | Individual review with star rating + text |
| `TrailMapEnhanced` | Interactive map with full trail route |
| `ElevationProfile` | Line chart of elevation change over distance |
| `PhotoGallery` | Horizontal scrolling gallery with pagination dots |
| `WeatherWidget` | Current weather at trail location (temp, condition, wind) |
| `ConditionReports` | Community trail condition feed |
| `OfflineDownloadButton` | Download trail for offline use |
| `OfflineBadge` | Indicator when viewing cached offline data |
| `NavigationPanel` | Guided nav HUD (progress, next turn, off-route alert) |
| `TrackingPanel` | Live stats during active hike (distance, duration, speed) |
| `SearchBar` | Search input with region + difficulty filter triggers |
| `NearbyTrails` | Trails near device location using haversine distance |
| `POIMarker` | Custom map marker per POI type |
| `POIFilter` | Horizontal toggle buttons for POI type visibility |
| `FilterModal` | Full filter modal (region, difficulty, sort) |

---

## State Stores

All stores use **Zustand**.

### `authStore.js`
- User state + JWT stored in Expo Secure Store (encrypted)
- `login()`, `register()`, `socialLogin()`, `logout()`, `update()`, `clearError()`
- Auto-restore session on app launch
- OAuth support: Google, Apple

### `trailStore.js`
- `fetchTrails(filters)` — paginated with search, region, difficulty, sort
- `fetchTrail(id)` — single trail detail
- `fetchRegions()` — distinct region list
- `fetchFavorites()` — user's saved trails
- `toggleFav(id)` — add/remove favorites
- `fetchNearbyTrails(lat, lng, radius)` — haversine distance filtering

### `trackingStore.js`
- `startTracking()` — request GPS permission, begin position watch
- `stopTracking()` — stop watcher
- `saveCompletedHike()` — POST route to backend
- `dropWaypoint(label)` / `removeWaypoint(id)` — waypoint management
- `reset()` — clear all tracking state
- GPS config: Best accuracy, 3s interval, 5m distance threshold
- Distance calculated with haversine formula

### `navigationStore.js`
- `startGuidedNavigation(coordinates)` — begin turn-by-turn
- `updateNavigation(position)` — recalculate from current position
- `stopNavigation()`
- Geometric calculations: haversine distance, bearing, point-to-segment projection
- Off-route threshold: 75m deviation
- Significant turn threshold: 25° bearing change

### `poiStore.js`
- `fetchPOIs(filters)` — with optional type filter
- `getPOI(id)` — single POI
- `getPOITypes()` — available categories
- `setSelectedTypes(types)` / `getFilteredPOIs()` — client-side filter
- `searchNearby(lat, lng, radius)` — POIs within radius

### `settingsStore.js`
- Persisted to AsyncStorage
- `units`: `km` | `mi`
- `mapType`: `standard` | `satellite` | `terrain`
- `notifications`: `boolean`
- `setSetting(key, value)`, `resetSettings()`

---

## Server API

Base URL: `/api`

### Auth (`/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login with credentials |
| GET | `/auth/me` | ✓ | Get current user |
| PUT | `/auth/me` | ✓ | Update name / avatar |
| PUT | `/auth/password` | ✓ | Change password |
| POST | `/auth/forgot-password` | — | Request reset code |
| POST | `/auth/reset-password` | — | Reset with code |
| DELETE | `/auth/me` | ✓ | Delete account |
| POST | `/auth/oauth` | — | Social login (Google/Apple) |

### Trails (`/trails`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/trails` | — | List with search, filter, sort, pagination |
| GET | `/trails/regions` | — | Distinct region list |
| GET | `/trails/nearby` | — | App + OSM trails near `lat,lng,radius` |
| GET | `/trails/user/favorites` | ✓ | User's saved trails |
| GET | `/trails/:id` | — | Single trail detail |
| GET | `/trails/:id/elevation` | — | Elevation profile (cached after first gen) |
| POST | `/trails/:id/favorite` | ✓ | Toggle favorite |

### Activities (`/activities`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/activities` | ✓ | Save completed hike |
| GET | `/activities` | ✓ | User history (paginated, newest first) |
| GET | `/activities/stats` | ✓ | Aggregate stats (total distance, time, elevation, etc.) |
| DELETE | `/activities/:id` | ✓ | Delete activity |

### Conditions (`/conditions`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/conditions/:trailId` | — | Recent reports (last 30 days, max 10) |
| POST | `/conditions` | ✓ | Submit report (1 per user per trail per 24h) |

---

## Data Models

### User
- `name`, `email` (unique), `password` (bcrypt hashed)
- `avatar` (URL), `provider` (local / google / apple), `providerId`
- `favorites: [Trail]`
- `resetPasswordToken` (hashed), `resetPasswordExpires` (15 min)
- `created_at`

### Trail
- `name`, `description`, `region`, `difficulty` (1–5)
- `distance_km`, `elevation_m`, `duration_hours`
- `location: { lat, lng }`, `coordinates: [{ lat, lng }]`
- `elevation_profile: [{ lat, lng, elevation, distance_from_start }]` (cached)
- `elevation_gain/loss/max/min`
- `images: [URL]`, `features: [String]`
- `rating_avg`, `review_count`
- Text search index on name, description, region

### Activity
- `user`, `trail` (optional), `trailName` (default: "Free Hike")
- `distance_km`, `duration_seconds`, `elevation_gain`
- `route: [{ lat, lng }]`, `waypoints: [{ lat, lng, label, timestamp }]`
- `avgSpeed` (km/h, calculated), `completed_at`

### Review
- `user`, `trail`, `rating` (1–5), `text` (min 10 chars)
- `photos: [URL]` (max 4), `created_at`

### ConditionReport
- `user`, `trail`
- `status`: good | muddy | overgrown | flooded | icy | closed | caution
- `description` (max 500 chars)
- `created_at`, `expires_at` (30 days — TTL index auto-deletes)

### POI
- `name`, `type` (restaurant / hotel / viewpoint / camping / parking / water_source / shelter / …)
- `location: { lat, lng }`, `description`
- `contact: { phone, email, website }`, `hours`, `entry_fee`
- `images: [URL]`, `features: [String]`
- `rating`, `verified: Boolean`

---

## Authentication

| Flow | Details |
|---|---|
| Local auth | Email + password, bcrypt hashing, JWT (30-day expiry) |
| Social login | Google + Apple OAuth — auto-creates account if new |
| Session restore | JWT stored in Expo Secure Store, loaded on app launch |
| Password reset | 8-digit code via email, 15-min validity, 2-step flow |
| Account deletion | Removes all user data from DB |

---

## GPS Tracking & Navigation

### Tracking
- Expo Location — high-accuracy, 3s interval, 5m distance threshold
- Haversine formula for distance calculation
- Records full route as `[{ lat, lng }]` array
- Waypoint markers with custom labels + timestamps
- Saves to Activity history on stop

### Guided Navigation
- Compares live position against trail `coordinates` array
- Progress %: nearest point index / total points
- Off-route detection: >75m from nearest trail segment
- Turn detection: bearing change ≥25° between consecutive segments
- Shows: next turn direction (left/right), distance to turn, turn angle
- Deviation displayed in metres when off-route

### Nearby Trails
- Haversine distance from device location to each trail's `location`
- Merges app DB trails + OpenStreetMap (Overpass API) results

---

## Weather & Conditions

- **WeatherWidget**: Current temp, weather condition, wind at trail coordinates
- **ConditionReports**: Community-submitted status updates
  - Statuses: good, muddy, overgrown, flooded, icy, closed, caution
  - 30-day TTL, max 1 report per user per trail per 24 hours
  - Shows summary of most common recent status + last 10 reports

---

## Points of Interest

- Type-based map markers with category icons
- Verified badge for trusted POIs
- Clickable contact info (phone / email / website)
- Operating hours + entry fee display
- Difficulty rating (for adventure POIs)
- Photo gallery
- Features & amenities checklist
- "Get Directions" → Google Maps deep link
- Client-side POI type filtering on map

---

## Reviews

- 5-star rating
- Text body (minimum 10 characters)
- Up to 4 photos per review
- Reviews update `rating_avg` and `review_count` on Trail document
- Up to 5 shown on trail detail; full list accessible via "Write Review" flow

---

## Offline Mode

- Download trail data (map, route, info) via `OfflineDownloadButton`
- `offlineStore` caches trail data to device
- Offline badge shown when serving cached data
- Cached trail count shown in Settings
- "Clear Cache" option in Settings

---

## Search & Filtering

- Full-text search: name, description, region (MongoDB text index)
- Region filter (dropdown from distinct regions)
- Difficulty filter (1–5)
- Sort options: rating (default), name, difficulty, distance, newest
- Pagination: 20 trails per page

---

## User Statistics

Calculated from Activity history:

| Stat | Source |
|---|---|
| Total hikes | Count of Activity documents |
| Total distance | Sum of `distance_km` |
| Total time | Sum of `duration_seconds` |
| Elevation gained | Sum of `elevation_gain` |
| Average speed | Mean of `avgSpeed` |
| Longest hike | Max `distance_km` |
| Saved trails | Length of `User.favorites` |

---

## Tech Stack

### Mobile
| Tool | Purpose |
|---|---|
| React Native + Expo | UI framework |
| Expo Router | File-based navigation |
| Zustand | State management |
| Axios | HTTP client |
| React Native Maps | Map rendering |
| Expo Location | GPS |
| Expo Image Picker | Avatar + photo upload |
| Expo Secure Store | Encrypted token storage |
| AsyncStorage | Settings persistence |

### Server
| Tool | Purpose |
|---|---|
| Node.js + Express | API server |
| MongoDB + Mongoose | Database + ODM |
| JWT | Authentication tokens |
| Bcryptjs | Password hashing |

### External Services
| Service | Used For |
|---|---|
| OpenStreetMap / Overpass API | Nearby trail discovery |
| Google Maps | "Get Directions" deep link |
| Elevation API | Elevation profile generation |

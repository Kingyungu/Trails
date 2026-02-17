const express = require('express');
const Trail = require('../models/Trail');
const { auth, optionalAuth } = require('../middleware/auth');
const { fetchElevationProfile } = require('../services/elevation');
const { getNearbyOsmTrails } = require('../services/overpass');

const router = express.Router();

// GET /api/trails - List with search, filter, pagination
router.get('/', async (req, res) => {
  try {
    const { search, region, difficulty, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (region) {
      filter.region = region;
    }
    if (difficulty) {
      filter.difficulty = Number(difficulty);
    }

    let sortOption = { rating_avg: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'difficulty') sortOption = { difficulty: 1 };
    if (sort === 'distance') sortOption = { distance_km: 1 };
    if (sort === 'newest') sortOption = { created_at: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [trails, total] = await Promise.all([
      Trail.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
      Trail.countDocuments(filter),
    ]);

    res.json({
      trails,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trails/regions - Get distinct regions
router.get('/regions', async (req, res) => {
  try {
    const regions = await Trail.distinct('region');
    res.json(regions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trails/nearby - Get nearby trails from DB and OSM
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Haversine for distance filtering
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

    // Get nearby trails from our database
    const dbTrails = await Trail.find({});
    const nearbyDbTrails = dbTrails
      .map((trail) => ({
        ...trail.toObject(),
        source: 'app',
        distance_from_user: Math.round(
          haversine(userLat, userLng, trail.location.lat, trail.location.lng) * 100
        ) / 100,
      }))
      .filter((t) => t.distance_from_user <= radiusKm)
      .sort((a, b) => a.distance_from_user - b.distance_from_user);

    // Get nearby trails from Overpass/OSM
    let osmTrails = [];
    try {
      osmTrails = await getNearbyOsmTrails(userLat, userLng, radiusKm);
    } catch {
      // OSM may fail, continue with DB results only
    }

    res.json({
      app_trails: nearbyDbTrails,
      osm_trails: osmTrails,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trails/user/favorites - Get user's saved trails (must be before /:id)
router.get('/user/favorites', auth, async (req, res) => {
  try {
    const user = await req.user.populate('favorites');
    res.json(user.favorites.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trails/:id/elevation - Get or generate elevation profile
router.get('/:id/elevation', async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id);
    if (!trail) return res.status(404).json({ message: 'Trail not found' });

    // Return cached profile if it exists
    if (trail.elevation_profile && trail.elevation_profile.length > 0) {
      return res.json({
        profile: trail.elevation_profile,
        elevation_gain: trail.elevation_gain,
        elevation_loss: trail.elevation_loss,
        elevation_max: trail.elevation_max,
        elevation_min: trail.elevation_min,
      });
    }

    if (!trail.coordinates || trail.coordinates.length < 2) {
      return res.status(400).json({ message: 'Trail has insufficient coordinates' });
    }

    // Generate and cache
    const elevationData = await fetchElevationProfile(trail.coordinates);

    trail.elevation_profile = elevationData.profile;
    trail.elevation_gain = elevationData.elevation_gain;
    trail.elevation_loss = elevationData.elevation_loss;
    trail.elevation_max = elevationData.elevation_max;
    trail.elevation_min = elevationData.elevation_min;
    await trail.save();

    res.json(elevationData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trails/:id - Trail details
router.get('/:id', async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id);
    if (!trail) return res.status(404).json({ message: 'Trail not found' });
    res.json(trail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trails/:id/favorite - Toggle favorite
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const trailId = req.params.id;
    const user = req.user;
    const index = user.favorites.findIndex((id) => id.toString() === trailId);

    if (index === -1) {
      user.favorites.push(trailId);
    } else {
      user.favorites.splice(index, 1);
    }
    await user.save();
    res.json({ favorites: user.favorites, isFavorite: index === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

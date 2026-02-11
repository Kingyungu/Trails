const express = require('express');
const router = express.Router();
const POI = require('../models/POI');
const { auth } = require('../middleware/auth');

// GET /api/pois - Get all POIs with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      region,
      search,
      lat,
      lng,
      radius, // in kilometers
      verified,
      limit = 100,
      sort = '-created_at'
    } = req.query;

    let query = {};

    // Filter by type
    if (type) {
      const types = type.split(',');
      query.type = { $in: types };
    }

    // Filter by region
    if (region) {
      query.region = new RegExp(region, 'i');
    }

    // Filter by verified status
    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location-based search (find POIs near coordinates)
    if (lat && lng && radius) {
      const radiusInRadians = parseFloat(radius) / 6371; // Earth radius in km
      query.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
        }
      };
    }

    const pois = await POI.find(query)
      .limit(parseInt(limit))
      .sort(sort)
      .lean();

    res.json(pois);
  } catch (error) {
    console.error('Error fetching POIs:', error);
    res.status(500).json({ error: 'Failed to fetch POIs' });
  }
});

// GET /api/pois/types - Get available POI types with counts
router.get('/types', async (req, res) => {
  try {
    const typeCounts = await POI.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(typeCounts);
  } catch (error) {
    console.error('Error fetching POI types:', error);
    res.status(500).json({ error: 'Failed to fetch POI types' });
  }
});

// GET /api/pois/:id - Get single POI
router.get('/:id', async (req, res) => {
  try {
    const poi = await POI.findById(req.params.id);

    if (!poi) {
      return res.status(404).json({ error: 'POI not found' });
    }

    res.json(poi);
  } catch (error) {
    console.error('Error fetching POI:', error);
    res.status(500).json({ error: 'Failed to fetch POI' });
  }
});

// POST /api/pois - Create new POI
router.post('/', auth, async (req, res) => {
  try {
    const poi = new POI(req.body);
    await poi.save();
    res.status(201).json(poi);
  } catch (error) {
    console.error('Error creating POI:', error);
    res.status(500).json({ error: 'Failed to create POI' });
  }
});

// PUT /api/pois/:id - Update POI
router.put('/:id', auth, async (req, res) => {
  try {
    const poi = await POI.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!poi) {
      return res.status(404).json({ error: 'POI not found' });
    }

    res.json(poi);
  } catch (error) {
    console.error('Error updating POI:', error);
    res.status(500).json({ error: 'Failed to update POI' });
  }
});

// DELETE /api/pois/:id - Delete POI
router.delete('/:id', auth, async (req, res) => {
  try {
    const poi = await POI.findByIdAndDelete(req.params.id);

    if (!poi) {
      return res.status(404).json({ error: 'POI not found' });
    }

    res.json({ message: 'POI deleted successfully' });
  } catch (error) {
    console.error('Error deleting POI:', error);
    res.status(500).json({ error: 'Failed to delete POI' });
  }
});

module.exports = router;

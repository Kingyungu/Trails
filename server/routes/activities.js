const express = require('express');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/activities - Save a completed hike
router.post('/', auth, async (req, res) => {
  try {
    const { trail, trailName, distance_km, duration_seconds, elevation_gain, route, waypoints } = req.body;

    if (!distance_km || !duration_seconds) {
      return res.status(400).json({ message: 'distance_km and duration_seconds are required' });
    }

    const avgSpeed = duration_seconds > 0
      ? Math.round((distance_km / (duration_seconds / 3600)) * 100) / 100
      : 0;

    const activity = await Activity.create({
      user: req.user._id,
      trail: trail || undefined,
      trailName: trailName || 'Free Hike',
      distance_km: Math.round(distance_km * 100) / 100,
      duration_seconds,
      elevation_gain: elevation_gain || 0,
      route: route || [],
      waypoints: waypoints || [],
      avgSpeed,
    });

    res.status(201).json(activity);
  } catch {
    res.status(500).json({ message: 'Could not save activity. Please try again.' });
  }
});

// GET /api/activities - Get user's activity history
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [activities, total] = await Promise.all([
      Activity.find({ user: req.user._id })
        .populate('trail', 'name images region difficulty')
        .sort({ completed_at: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Activity.countDocuments({ user: req.user._id }),
    ]);

    res.json({ activities, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// GET /api/activities/stats - Get user's aggregated stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Activity.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalHikes: { $sum: 1 },
          totalDistance: { $sum: '$distance_km' },
          totalDuration: { $sum: '$duration_seconds' },
          totalElevation: { $sum: '$elevation_gain' },
          avgSpeed: { $avg: '$avgSpeed' },
          longestHike: { $max: '$distance_km' },
        },
      },
    ]);

    const result = stats[0] || {
      totalHikes: 0,
      totalDistance: 0,
      totalDuration: 0,
      totalElevation: 0,
      avgSpeed: 0,
      longestHike: 0,
    };

    result.totalDistance = Math.round(result.totalDistance * 100) / 100;
    result.avgSpeed = Math.round((result.avgSpeed || 0) * 100) / 100;
    result.longestHike = Math.round((result.longestHike || 0) * 100) / 100;

    res.json(result);
  } catch {
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// DELETE /api/activities/:id - Delete an activity
router.delete('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, user: req.user._id });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    await activity.deleteOne();
    res.json({ message: 'Activity deleted' });
  } catch {
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

module.exports = router;

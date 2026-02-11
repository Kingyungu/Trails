const express = require('express');
const Review = require('../models/Review');
const Trail = require('../models/Trail');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/:trailId
router.get('/:trailId', async (req, res) => {
  try {
    const reviews = await Review.find({ trail: req.params.trailId })
      .populate('user', 'name avatar')
      .sort({ created_at: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    const { trail, rating, text, photos } = req.body;

    const review = await Review.create({
      user: req.user._id,
      trail,
      rating,
      text,
      photos: photos || [],
    });

    // Update trail rating
    const reviews = await Review.find({ trail });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Trail.findByIdAndUpdate(trail, {
      rating_avg: Math.round(avg * 10) / 10,
      review_count: reviews.length,
    });

    const populated = await review.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

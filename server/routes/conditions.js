const express = require('express');
const ConditionReport = require('../models/ConditionReport');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/conditions/:trailId - Get recent condition reports for a trail
router.get('/:trailId', async (req, res) => {
  try {
    const reports = await ConditionReport.find({
      trail: req.params.trailId,
      expires_at: { $gt: new Date() },
    })
      .populate('user', 'name avatar')
      .sort({ created_at: -1 })
      .limit(10);

    // Calculate summary - most common recent status
    const statusCounts = {};
    reports.forEach((r) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    const summary = Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])[0];

    res.json({
      reports,
      summary: summary ? { status: summary[0], count: summary[1] } : null,
      totalReports: reports.length,
    });
  } catch {
    res.status(500).json({ message: 'Could not fetch condition reports. Please try again.' });
  }
});

// POST /api/conditions - Submit a condition report
router.post('/', auth, async (req, res) => {
  try {
    const { trail, status, description } = req.body;

    if (!trail || !status) {
      return res.status(400).json({ message: 'trail and status are required' });
    }

    const validStatuses = ['good', 'muddy', 'overgrown', 'flooded', 'icy', 'closed', 'caution'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    // Prevent duplicate reports within 24 hours by same user
    const recent = await ConditionReport.findOne({
      user: req.user._id,
      trail,
      created_at: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recent) {
      return res.status(400).json({ message: 'You already submitted a report for this trail today' });
    }

    const report = await ConditionReport.create({
      user: req.user._id,
      trail,
      status,
      description: description || '',
    });

    const populated = await report.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch {
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

module.exports = router;

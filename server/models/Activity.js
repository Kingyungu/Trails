const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trail: { type: mongoose.Schema.Types.ObjectId, ref: 'Trail' },
  trailName: { type: String, default: 'Free Hike' },
  distance_km: { type: Number, required: true },
  duration_seconds: { type: Number, required: true },
  elevation_gain: { type: Number, default: 0 },
  route: [{ lat: Number, lng: Number }],
  waypoints: [{
    lat: Number,
    lng: Number,
    label: { type: String, default: '' },
    timestamp: Number,
  }],
  avgSpeed: { type: Number, default: 0 }, // km/h
  completed_at: { type: Date, default: Date.now },
});

activitySchema.index({ user: 1, completed_at: -1 });

module.exports = mongoose.model('Activity', activitySchema);

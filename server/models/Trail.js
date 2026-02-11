const mongoose = require('mongoose');

const trailSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  region: { type: String, required: true, index: true },
  difficulty: { type: Number, required: true, min: 1, max: 5 },
  distance_km: { type: Number, required: true },
  elevation_m: { type: Number, required: true },
  duration_hours: { type: Number, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  coordinates: [{ lat: Number, lng: Number }],
  elevation_profile: [{
    lat: Number,
    lng: Number,
    elevation: Number,
    distance_from_start: Number,
  }],
  elevation_gain: { type: Number, default: 0 },
  elevation_loss: { type: Number, default: 0 },
  elevation_max: { type: Number, default: 0 },
  elevation_min: { type: Number, default: 0 },
  images: [String],
  features: [String],
  rating_avg: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

trailSchema.index({ name: 'text', description: 'text', region: 'text' });

module.exports = mongoose.model('Trail', trailSchema);

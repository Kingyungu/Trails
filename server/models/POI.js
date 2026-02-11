const mongoose = require('mongoose');

const poiSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'park',           // National parks, nature reserves
      'viewpoint',      // Scenic viewpoints
      'parking',        // Parking areas
      'water',          // Water sources, springs
      'camping',        // Camping sites
      'climbing_wall',  // Natural or artificial climbing walls
      'waterfall',      // Waterfalls
      'cave',           // Caves
      'wildlife',       // Wildlife viewing spots
      'picnic',         // Picnic areas
      'shelter',        // Shelters, huts
      'facility',       // Restrooms, facilities
      'restaurant',     // Restaurants, cafes
      'trailhead',      // Trail starting points
      'bridge',         // Notable bridges
      'monument',       // Historical monuments
      'lookout',        // Lookout towers
      'lake',           // Lakes, ponds
      'other'           // Other POIs
    ],
    index: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  region: { type: String, required: true, index: true },
  images: [String],
  features: [String], // Amenities available
  difficulty: { type: Number, min: 1, max: 5 }, // Difficulty to access (optional)
  elevation_m: { type: Number },
  openingHours: {
    open: { type: String },
    close: { type: String }
  },
  fees: {
    hasEntry: { type: Boolean, default: false },
    amount: { type: Number },
    currency: { type: String, default: 'KES' }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  rating_avg: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Text search index
poiSchema.index({ name: 'text', description: 'text', region: 'text' });

// Geospatial index for location-based queries
poiSchema.index({ location: '2dsphere' });

// Update timestamp on save
poiSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('POI', poiSchema);

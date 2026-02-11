const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trail: { type: mongoose.Schema.Types.ObjectId, ref: 'Trail', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  photos: [String],
  created_at: { type: Date, default: Date.now },
});

reviewSchema.index({ trail: 1, created_at: -1 });

module.exports = mongoose.model('Review', reviewSchema);

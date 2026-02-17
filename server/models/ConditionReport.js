const mongoose = require('mongoose');

const conditionReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trail: { type: mongoose.Schema.Types.ObjectId, ref: 'Trail', required: true },
  status: {
    type: String,
    enum: ['good', 'muddy', 'overgrown', 'flooded', 'icy', 'closed', 'caution'],
    required: true,
  },
  description: { type: String, maxlength: 500 },
  created_at: { type: Date, default: Date.now },
  // Reports older than 30 days are considered stale
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
});

conditionReportSchema.index({ trail: 1, created_at: -1 });
conditionReportSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ConditionReport', conditionReportSchema);

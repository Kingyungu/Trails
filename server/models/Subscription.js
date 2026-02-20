const mongoose = require('mongoose');

const PLAN_DURATIONS = { monthly: 30, annual: 365 };

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: ['monthly', 'annual'], required: true },
  status: { type: String, enum: ['active', 'expired', 'pending'], default: 'pending' },
  startDate: { type: Date },
  endDate: { type: Date },
  mpesaReceiptNumber: { type: String },
  phone: { type: String },
  amount: { type: Number },
  checkoutRequestId: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

subscriptionSchema.index({ checkoutRequestId: 1 });

subscriptionSchema.methods.isActive = function () {
  return this.status === 'active' && this.endDate && this.endDate > new Date();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
module.exports.PLAN_DURATIONS = PLAN_DURATIONS;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6 },
  avatar: { type: String, default: '' },
  provider: { type: String, enum: ['local', 'google', 'apple'], default: 'local' },
  providerId: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trail' }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  created_at: { type: Date, default: Date.now },
});

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(4).toString('hex'); // 8-char code
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return token;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

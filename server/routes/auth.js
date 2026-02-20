const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/email');

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many accounts created from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many reset requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ user, token });
  } catch {
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/me - Update profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (name) req.user.name = name;
    if (avatar) req.user.avatar = avatar;
    await req.user.save();
    res.json(req.user);
  } catch {
    res.status(500).json({ message: 'Could not update profile. Please try again.' });
  }
});

// PUT /api/auth/password - Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    if (req.user.provider !== 'local') {
      return res.status(400).json({ message: 'Cannot change password for social login accounts' });
    }

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    req.user.password = newPassword;
    await req.user.save();
    res.json({ message: 'Password updated' });
  } catch {
    res.status(500).json({ message: 'Could not update password. Please try again.' });
  }
});

// POST /api/auth/forgot-password - Request password reset code
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return res.json({ message: 'If an account exists, a reset code has been sent to your email' });
    }
    if (user.provider !== 'local') {
      return res.status(400).json({ message: `This account uses ${user.provider} login` });
    }

    const resetCode = user.createPasswordResetToken();
    await user.save();

    await sendPasswordResetEmail(user.email, resetCode);

    res.json({ message: 'If an account exists, a reset code has been sent to your email' });
  } catch {
    res.status(500).json({ message: 'Could not send reset email. Please try again.' });
  }
});

// POST /api/auth/reset-password - Reset password with code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedCode,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: 'Password reset successful', user, token });
  } catch {
    res.status(500).json({ message: 'Could not reset password. Please try again.' });
  }
});

// DELETE /api/auth/me - Delete account
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch {
    res.status(500).json({ message: 'Could not delete account. Please try again.' });
  }
});

// POST /api/auth/oauth - Social login (Google, Apple)
router.post('/oauth', async (req, res) => {
  try {
    const { provider, providerId, email, name, avatar } = req.body;

    if (!provider || !providerId || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let user = await User.findOne({ email, provider });

    if (!user) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: `Email already registered with ${existingUser.provider} login`,
        });
      }

      user = await User.create({ name, email, provider, providerId, avatar: avatar || '' });
    } else {
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch {
    res.status(500).json({ message: 'Authentication failed. Please try again.' });
  }
});

// POST /api/auth/push-token - Register device push token
router.post('/push-token', auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Push token is required' });

    if (!req.user.pushTokens.includes(token)) {
      req.user.pushTokens.push(token);
      await req.user.save();
    }
    res.json({ message: 'Push token registered' });
  } catch {
    res.status(500).json({ message: 'Could not register push token.' });
  }
});

// DELETE /api/auth/push-token - Remove device push token on logout
router.delete('/push-token', auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Push token is required' });

    req.user.pushTokens = req.user.pushTokens.filter((t) => t !== token);
    await req.user.save();
    res.json({ message: 'Push token removed' });
  } catch {
    res.status(500).json({ message: 'Could not remove push token.' });
  }
});

module.exports = router;

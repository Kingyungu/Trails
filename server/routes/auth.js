const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/oauth - Social login (Google, Apple)
router.post('/oauth', async (req, res) => {
  try {
    const { provider, providerId, email, name, avatar } = req.body;

    if (!provider || !providerId || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find or create user
    let user = await User.findOne({ email, provider });

    if (!user) {
      // Check if email exists with different provider
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: `Email already registered with ${existingUser.provider} login`
        });
      }

      // Create new OAuth user
      user = await User.create({
        name,
        email,
        provider,
        providerId,
        avatar: avatar || '',
      });
    } else {
      // Update avatar if provided
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

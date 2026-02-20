require('dotenv').config();
const Sentry = require('@sentry/node');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.2 });
}

const authRoutes = require('./routes/auth');
const trailRoutes = require('./routes/trails');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/uploads');
const poiRoutes = require('./routes/pois');
const activityRoutes = require('./routes/activities');
const conditionRoutes = require('./routes/conditions');

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to configured origin(s) in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : true; // allow all in development (no ALLOWED_ORIGINS set)

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '2mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trails', trailRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/pois', poiRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/conditions', conditionRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler — never expose internals to clients
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'An unexpected error occurred.' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

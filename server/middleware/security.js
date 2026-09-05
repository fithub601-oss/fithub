const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const makeLimiter = ({ windowMs, limit, message = 'Too many requests. Please try again later.' } = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message }
  });

// Auth endpoints: strict, per-IP throttling against brute-force / OTP spraying
const authLoginLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, limit: 15, message: 'Too many login attempts. Try again in 15 minutes.' });
const authStrictLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, limit: 5, message: 'Too many requests. Try again in 15 minutes.' });
const apiLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, limit: 600, message: 'Too many requests. Please slow down.' });

// Reject malformed MongoDB ObjectIds before they reach controllers (prevents CastError 500s)
const validateObjectId = (req, res, next) => {
  for (const [key, value] of Object.entries(req.params || {})) {
    if ((key === 'id' || key.endsWith('Id')) && value && !mongoose.isValidObjectId(value)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
  }
  next();
};

const notFound = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  console.error('[FITHUB ERROR]', err);
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID provided' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request payload too large' });
  if (err.message && err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({ message: 'Not allowed by CORS policy' });
  }
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};

module.exports = { authLoginLimiter, authStrictLimiter, apiLimiter, validateObjectId, notFound, errorHandler };
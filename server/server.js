require('./dns-patch');
require('dotenv').config();

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const {
  authLoginLimiter,
  authStrictLimiter,
  apiLimiter,
  notFound,
  errorHandler
} = require('./middleware/security');

if (!process.env.JWT_SECRET) {
  console.error('[SECURITY] JWT_SECRET is not set. Aborting startup.');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('[SECURITY] Warning: JWT_SECRET is shorter than 32 characters. Use a long random string in production.');
}

const app = express();

// Behind Render's reverse proxy — required for rate-limiting to see real client IPs
app.set('trust proxy', 1);

connectDB();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5000',
  'https://fithub-api-3wjz.onrender.com'
].filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", 'https://checkout.razorpay.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin(origin, callback) {
    // Allow same-origin (no Origin header) and known development origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// NoSQL injection + query parameter pollution protection
app.use('/api', mongoSanitize());
app.use('/api', hpp());

// Rate limiting
app.use('/api/auth/login', authLoginLimiter);
app.use('/api/auth/register', authStrictLimiter);
app.use('/api/auth/login-phone', authStrictLimiter);
app.use('/api/auth/send-otp', authStrictLimiter);
app.use('/api/auth/forgot-password', authStrictLimiter);
app.use('/api/auth/reset-password', authStrictLimiter);
app.use('/api/auth/verify-otp', authStrictLimiter);
app.use('/api/auth/verify-phone-otp', authStrictLimiter);
app.use('/api', apiLimiter);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/events', require('./routes/calendarRoutes'));

// Serve React production build (built during deploy) if it exists
const clientBuild = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res, next) => {
    // Let API routes through; serve index.html for all other GET requests (SPA fallback)
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
  console.log('[SERVE] Serving FITHUB frontend from client/build');
}

app.get('/api', (req, res) => {
  res.json({ message: 'FITHUB API is running' });
});

// Central error handling — no stack traces or internal details ever reach the client
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FITHUB server running on port ${PORT}`);
  const { startScheduler } = require('./services/reminderService');
  startScheduler();
});

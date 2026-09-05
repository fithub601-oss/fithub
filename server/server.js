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
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FITHUB server running on port ${PORT}`);
});

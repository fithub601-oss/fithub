require('./dns-patch');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Product = require('./models/Product');
const Banner = require('./models/Banner');

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Subscription.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});

    const salt = await bcrypt.genSalt(10);

    // Admin user (plain password, model's pre-save hook will hash it)
    await User.create({
      name: 'Admin',
      email: 'admin@fithub.com',
      phone: '+911234567890',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    console.log('✓ Admin user created (admin@fithub.com / admin123)');

    // Subscriptions
    const subs = await Subscription.create([
      {
        name: 'Starter',
        description: 'Perfect for beginners',
        duration: 1,
        durationUnit: 'month',
        price: 999,
        features: ['Gym access (6 AM - 10 PM)', 'Basic equipment', 'Locker facility'],
        isPopular: false
      },
      {
        name: 'Gold',
        description: 'Most popular - complete fitness package',
        duration: 1,
        durationUnit: 'month',
        price: 1999,
        features: ['24/7 gym access', 'All equipment', 'Free group classes', 'Locker & shower', 'One personal training session'],
        isPopular: true
      },
      {
        name: 'Platinum',
        description: 'Premium experience with full support',
        duration: 3,
        durationUnit: 'month',
        price: 4999,
        features: ['24/7 gym access', 'Personal trainer', 'Diet plan', 'Free supplements starter kit', 'Free group classes', 'Priority booking'],
        isPopular: false
      }
    ]);
    console.log(`✓ Created ${subs.length} subscriptions`);

    // Products
    const products = await Product.create([
      { name: 'Whey Protein (1kg)', description: '100% pure whey protein isolate', price: 2400, stockQuantity: 15, category: 'supplement' },
      { name: 'Creatine Monohydrate', description: 'Pure creatine for strength gains', price: 900, stockQuantity: 20, category: 'supplement' },
      { name: 'Pre-Workout', description: 'Boost energy and focus for workouts', price: 1100, stockQuantity: 10, category: 'supplement' },
      { name: 'Gym Gloves', description: 'Anti-slip padded gym gloves', price: 450, stockQuantity: 25, category: 'accessory' },
      { name: 'Resistance Bands Set', description: '5-band set for home workouts', price: 800, stockQuantity: 12, category: 'equipment' },
      { name: 'FITHUB T-Shirt', description: 'Official FITHUB branded gym tee', price: 599, stockQuantity: 30, category: 'apparel' }
    ]);
    console.log(`✓ Created ${products.length} products`);

    // Banners
    const banners = await Banner.create([
      {
        title: 'New Year, New You! 🔥',
        description: 'Get 30% off on annual memberships. Limited time offer!',
        buttonText: 'Claim Now',
        buttonLink: '/subscriptions',
        position: 'hero',
        isActive: true
      },
      {
        title: 'Refer a Friend & Earn!',
        description: 'Bring a friend - both of you get 15% off your next month.',
        buttonText: 'Learn More',
        buttonLink: '/contact',
        position: 'midpage',
        isActive: true
      }
    ]);
    console.log(`✓ Created ${banners.length} banners`);

    console.log('\n✅ Seed completed successfully!');
    console.log('Admin login: admin@fithub.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();

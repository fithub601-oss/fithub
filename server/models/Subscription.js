const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add subscription name']
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    required: true,
    default: 1
  },
  durationUnit: {
    type: String,
    enum: ['day', 'week', 'month', 'year'],
    default: 'month'
  },
  price: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

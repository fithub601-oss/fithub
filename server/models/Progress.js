const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  weight: {
    type: Number,
    required: [true, 'Please add your weight']
  },
  chest: { type: Number, default: null },
  waist: { type: Number, default: null },
  biceps: { type: Number, default: null },
  thighs: { type: Number, default: null },
  note: {
    type: String,
    default: ''
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
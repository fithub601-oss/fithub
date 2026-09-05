const Progress = require('../models/Progress');

// @desc    Get current user's progress entries
// @route   GET /api/progress
// @access  Private
const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id }).sort('date');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a progress entry
// @route   POST /api/progress
// @access  Private
const addProgress = async (req, res) => {
  try {
    const { date, weight, chest, waist, biceps, thighs, note } = req.body;
    if (!weight) {
      return res.status(400).json({ message: 'Please add your weight' });
    }
    const entry = await Progress.create({
      user: req.user._id,
      date: date || Date.now(),
      weight,
      chest: chest || undefined,
      waist: waist || undefined,
      biceps: biceps || undefined,
      thighs: thighs || undefined,
      note: note || ''
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a progress entry
// @route   DELETE /api/progress/:id
// @access  Private
const deleteProgress = async (req, res) => {
  try {
    const entry = await Progress.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyProgress,
  addProgress,
  deleteProgress
};
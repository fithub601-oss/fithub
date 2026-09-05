const Review = require('../models/Review');

// @desc    Get approved public reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(50);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all reviews (for moderation)
// @route   GET /api/reviews/all
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Rating must be an integer between 1 and 5
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
    }

    // Comment must be a non-empty string
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    // Sanitize input: strip markup, dangerous tokens, collapse whitespace
    const sanitize = (value) =>
      String(value)
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    const clean = sanitize(comment);
    if (!clean) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }
    const text = clean.slice(0, 500);

    // Spam / duplicate protection (server-enforced, keyed to the logged-in user)
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const todayCount = await Review.countDocuments({ user: req.user._id, createdAt: { $gte: dayStart } });
    if (todayCount >= 1) {
      return res.status(429).json({ message: 'You already posted a review today — post again tomorrow!' });
    }
    const totalCount = await Review.countDocuments({ user: req.user._id });
    if (totalCount >= 10) {
      return res.status(429).json({ message: 'Review limit reached for this account.' });
    }

    // Identity always comes from the verified JWT, never from the client
    const review = await Review.create({
      user: req.user._id,
      name: req.user.name || 'Fithub Member',
      rating: parsedRating,
      comment: text,
      status: 'approved'
    });

    await review.populate('user', 'name');
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update review status (approve / hide)
// @route   PUT /api/reviews/:id
// @access  Private/Admin
const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'hidden'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or hidden' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    review.status = status;
    await review.save();
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getReviews,
  getAllReviews,
  createReview,
  updateReviewStatus,
  deleteReview
};
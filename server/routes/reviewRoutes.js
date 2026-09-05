const router = require('express').Router();
const {
  getReviews,
  getAllReviews,
  createReview,
  updateReviewStatus,
  deleteReview
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getReviews);
router.get('/all', protect, admin, getAllReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, admin, updateReviewStatus);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
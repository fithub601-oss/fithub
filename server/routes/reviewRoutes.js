const router = require('express').Router();
const {
  getReviews,
  getAllReviews,
  createReview,
  updateReviewStatus,
  deleteReview
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/security');

router.get('/', getReviews);
router.get('/all', protect, admin, getAllReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, admin, validateObjectId, updateReviewStatus);
router.delete('/:id', protect, admin, validateObjectId, deleteReview);

module.exports = router;
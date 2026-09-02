const router = require('express').Router();
const {
  getSubscriptions,
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription
} = require('../controllers/subscriptionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getSubscriptions);
router.get('/all', protect, admin, getAllSubscriptions);
router.post('/', protect, admin, createSubscription);
router.put('/:id', protect, admin, updateSubscription);
router.delete('/:id', protect, admin, deleteSubscription);

module.exports = router;

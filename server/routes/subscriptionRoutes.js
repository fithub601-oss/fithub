const router = require('express').Router();
const {
  getSubscriptions,
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription
} = require('../controllers/subscriptionController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/security');

router.get('/', getSubscriptions);
router.get('/all', protect, admin, getAllSubscriptions);
router.post('/', protect, admin, createSubscription);
router.put('/:id', protect, admin, validateObjectId, updateSubscription);
router.delete('/:id', protect, admin, validateObjectId, deleteSubscription);

module.exports = router;

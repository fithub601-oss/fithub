const router = require('express').Router();
const {
  createProductOrder,
  verifyProductPayment,
  getMyOrders,
  getAllOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createProductOrder);
router.post('/verify', protect, verifyProductPayment);
router.get('/me', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);

module.exports = router;

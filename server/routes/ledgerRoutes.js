const router = require('express').Router();
const { getCombinedLedger } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getCombinedLedger);

module.exports = router;
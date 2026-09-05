const router = require('express').Router();
const {
  getMyProgress,
  addProgress,
  deleteProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyProgress);
router.post('/', protect, addProgress);
router.delete('/:id', protect, deleteProgress);

module.exports = router;
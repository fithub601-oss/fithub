const router = require('express').Router();
const {
  getMyProgress,
  addProgress,
  deleteProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/security');

router.get('/', protect, getMyProgress);
router.post('/', protect, addProgress);
router.delete('/:id', protect, validateObjectId, deleteProgress);

module.exports = router;
const router = require('express').Router();
const {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/security');

router.get('/', getBanners);
router.get('/all', protect, admin, getAllBanners);
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, validateObjectId, updateBanner);
router.delete('/:id', protect, admin, validateObjectId, deleteBanner);

module.exports = router;

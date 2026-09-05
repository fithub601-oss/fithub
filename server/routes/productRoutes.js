const router = require('express').Router();
const {
  getProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/security');

router.get('/', getProducts);
router.get('/all', protect, admin, getAllProducts);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, validateObjectId, updateProduct);
router.delete('/:id', protect, admin, validateObjectId, deleteProduct);

module.exports = router;

const Product = require('../models/Product');

// Convert kommodo.ai share-page links (HTML) into direct image URLs
const normalizeImage = (url) => {
  if (!url) return '';
  const match = url.match(/kommodo\.ai\/i\/([A-Za-z0-9]+)/);
  if (match) {
    return `https://plain-apac-prod-public.komododecks.com/202609/05/${match[1]}/image.png`;
  }
  return url;
};

const toPublic = (product) => {
  const obj = product.toObject ? product.toObject() : product;
  if (obj.image) obj.image = normalizeImage(obj.image);
  return obj;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true }).sort('category');
    res.json(products.map(toPublic));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all products (admin)
// @route   GET /api/products/all
// @access  Private/Admin
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.json(products.map(toPublic));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};

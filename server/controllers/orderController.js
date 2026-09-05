const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

const toPublic = (prod) => {
  const obj = prod.toObject ? prod.toObject() : prod;
  if (obj.image) {
    const match = obj.image.match(/kommodo\.ai\/i\/([A-Za-z0-9]+)/);
    if (match) obj.image = `https://plain-apac-prod-public.komododecks.com/202609/05/${match[1]}/image.png`;
  }
  return obj;
};

// @desc    Create Razorpay order for a cart of products
// @route   POST /api/orders/create-order
// @access  Private
const createProductOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body; // [{productId, quantity}]

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const products = await Product.find({ _id: { $in: items.map(i => i.productId) } });
    if (products.length !== items.length) {
      return res.status(400).json({ message: 'Some products are no longer available' });
    }

    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) return null;
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      };
    });

    if (!razorpay) {
      return res.json({
        key: null,
        amount: total * 100,
        currency: 'INR',
        message: 'Online payment not configured. Please pay at the gym.',
        orderItems,
        total
      });
    }

    const options = {
      amount: total * 100,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        type: 'products',
        userId: req.user?._id?.toString() || '',
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : ''
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      orderItems,
      total
    });
  } catch (error) {
    console.error('Order create error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// @desc    Verify product payment and create order record
// @route   POST /api/orders/verify
// @access  Private
const verifyProductPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      paymentMethod,
      totalAmount,
      shippingAddress
    } = req.body;

    const isOffline = paymentMethod === 'cash' || paymentMethod === 'offline';

    if (!isOffline) {
      if (!razorpay_signature || !razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({ message: 'Incomplete payment details' });
      }
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    const products = await Product.find({ _id: { $in: items.map(i => i.productId) } });
    if (products.length !== items.length) {
      return res.status(400).json({ message: 'Some products are no longer available' });
    }

    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find(p => p._id.toString() === item.productId);
      const qty = item.quantity || 1;
      total += product.price * qty;
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image
      };
    });

    // Validate stock and decrement
    for (const item of orderItems) {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.stockQuantity -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user?._id,
      items: orderItems.map(i => ({ ...i, image: i.image })),
      totalAmount: total,
      paymentMethod: isOffline ? 'cash' : 'razorpay',
      paymentStatus: isOffline ? 'pending' : 'paid',
      razorpayOrderId: isOffline ? undefined : razorpay_order_id,
      razorpayPaymentId: isOffline ? undefined : razorpay_payment_id,
      shippingAddress: shippingAddress || undefined,
      status: 'placed'
    });

    res.status(201).json({
      message: isOffline ? 'Order placed. Pay at the gym to confirm.' : 'Payment successful, order placed!',
      order
    });
  } catch (error) {
    console.error('Order verify error:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/me
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProductOrder,
  verifyProductPayment,
  getMyOrders,
  getAllOrders
};

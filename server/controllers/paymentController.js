const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const Membership = require('../models/Membership');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (!razorpay) {
      return res.json({
        key: null,
        amount: subscription.price * 100,
        currency: 'INR',
        message: 'Online payment not configured. Please pay at the gym or contact admin.',
        subscription
      });
    }

    const options = {
      amount: subscription.price * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        subscriptionId: subscription._id.toString(),
        subscriptionName: subscription.name,
        userId: userId || req.user?._id?.toString() || ''
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      subscription
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};
// @desc    Verify payment and create membership
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscriptionId,
      userId,
      paymentMethod
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

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const uid = userId || req.user?._id;
    const start = new Date();
    const end = new Date(start);
    if (subscription.durationUnit === 'day') end.setDate(end.getDate() + subscription.duration);
    else if (subscription.durationUnit === 'week') end.setDate(end.getDate() + subscription.duration * 7);
    else if (subscription.durationUnit === 'month') end.setMonth(end.getMonth() + subscription.duration);
    else if (subscription.durationUnit === 'year') end.setFullYear(end.getFullYear() + subscription.duration);

    await Membership.updateMany(
      { user: uid, status: 'active' },
      { $set: { status: 'expired' } }
    );

    const membership = await Membership.create(
      isOffline
        ? {
            user: uid,
            subscription: subscriptionId,
            startDate: start,
            endDate: end,
            status: 'pending',
            totalAmount: subscription.price,
            amountPaid: 0,
            amountRemaining: subscription.price,
            paymentStatus: 'pending',
            paymentMethod: 'cash',
            notes: 'Awaiting payment confirmation at gym'
          }
        : {
            user: uid,
            subscription: subscriptionId,
            startDate: start,
            endDate: end,
            status: 'active',
            totalAmount: subscription.price,
            amountPaid: subscription.price,
            amountRemaining: 0,
            paymentStatus: 'paid',
            paymentMethod: 'razorpay',
            renewals: [{ amount: subscription.price, method: 'razorpay' }]
          }
    );

    res.status(201).json({
      message: isOffline ? 'Membership request submitted. Admin will confirm after payment.' : 'Payment verified, membership activated',
      membership
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};

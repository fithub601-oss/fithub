import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, cartTotal, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    const missing = required.find(f => !address[f]?.trim());
    if (missing) {
      toast.error('Please fill in all delivery address fields');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(address.phone)) {
      toast.error('Enter a valid 10-digit phone number');
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error('Enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (cart.length === 0) return;

    if (!address.fullName || !address.phone || !address.address || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill in your delivery address below');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(address.phone)) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error('Enter a valid 6-digit pincode');
      return;
    }

    setCheckoutLoading(true);
    try {
      const items = cart.map(i => ({ productId: i._id, quantity: i.qty, size: i.size || undefined }));
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load');
        return;
      }

      const { data } = await api.post('/orders/create-order', { items, shippingAddress: address });

      if (!data.key) {
        // Cash fallback
        await api.post('/orders/verify', {
          items,
          paymentMethod: 'cash',
          totalAmount: data.total,
          shippingAddress: address
        });
        toast.success('Order placed! Pay at the gym to confirm.');
        clearCart();
        navigate('/products');
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'FITHUB',
        description: `Store Order - ${items.length} item(s)`,
        image: '/logo192.png',
        order_id: data.id,
        handler: async (response) => {
          try {
            await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items,
              paymentMethod: 'razorpay',
              totalAmount: data.total,
              shippingAddress: address
            });
            toast.success('Payment successful! Order placed 🎉');
            clearCart();
            navigate('/products');
          } catch (error) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#4F46E5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-16 bg-dark-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">
              YOUR <span className="text-neon-pink">CART</span>
            </h1>
            <p className="text-gray-400 mt-1">{cart.length} item(s) in your cart</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 text-sm font-medium rounded-full hover:bg-white/10"
          >
            <FaArrowLeft /> Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-dark-800 rounded-2xl border border-white/5">
            <div className="text-6xl mb-4 flex justify-center"><FaShoppingCart className="text-gray-600" /></div>
            <h3 className="text-white font-bold text-xl mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-6">Browse our store and add some gear!</p>
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items + Address */}
            <div className="lg:col-span-2 space-y-4">
              {/* Delivery Address */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <h2 className="font-display text-xl text-slate-900 mb-4">
                  <span className="text-primary-600 mr-2">📍</span>Delivery Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      placeholder="10-digit mobile"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 text-xs mb-1">Address (House, Street, Area) *</label>
                    <input
                      type="text"
                      name="address"
                      value={address.address}
                      onChange={handleAddressChange}
                      placeholder="House no, street, area"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                      placeholder="6-digit pincode"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Landmark (optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      value={address.landmark}
                      onChange={handleAddressChange}
                      placeholder="Near..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
              {/* Items */}
              {cart.map((item) => (
                <motion.div
                  key={item.key || item._id}
                  layout
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft flex items-center gap-4"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-slate-50 aspect-square p-1.5">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain object-center" />
                    ) : (
                      <FaShoppingBag className="text-3xl text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 font-semibold truncate">{item.name}</h3>
                    {item.size && (
                      <p className="text-slate-400 text-xs mt-0.5">
                        Size: <span className="font-semibold text-slate-600">{item.size}</span>
                      </p>
                    )}
                    <p className="text-emerald-600 font-bold mt-1">₹{item.price}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-slate-100 rounded-full">
                        <button
                          onClick={() => updateQty(item.key || item._id, item.qty - 1)}
                          className="w-8 h-8 text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-slate-800 font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.key || item._id, item.qty + 1)}
                          className="w-8 h-8 text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-slate-400 text-xs">Stock: {item.stockQuantity}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-slate-900 font-bold">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                    <button
                      onClick={() => {
                        removeFromCart(item.key || item._id);
                        toast.success(`${item.name} removed`);
                      }}
                      className="mt-2 text-red-500 hover:text-red-400 text-sm"
                    >
                      <FaTrash className="inline mr-1" /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 text-red-500 text-sm font-medium hover:text-red-400"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card h-fit sticky top-24">
              <h2 className="font-display text-xl text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Items</span>
                  <span className="text-slate-900">{cart.reduce((s, i) => s + i.qty, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900 font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="text-slate-900 font-bold">Total</span>
                  <span className="text-emerald-600 font-bold text-xl">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 shadow-glow"
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              <p className="text-slate-400 text-xs text-center mt-3">Free shipping on all orders</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
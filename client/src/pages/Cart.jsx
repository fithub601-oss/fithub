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

    setCheckoutLoading(true);
    try {
      const items = cart.map(i => ({ productId: i._id, quantity: i.qty }));
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load');
        return;
      }

      const { data } = await api.post('/orders/create-order', { items });

      if (!data.key) {
        // Cash fallback
        await api.post('/orders/verify', {
          items,
          paymentMethod: 'cash',
          totalAmount: data.total
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
              totalAmount: data.total
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
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="bg-dark-800 rounded-2xl p-4 border border-white/5 flex items-center gap-4"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaShoppingBag className="text-3xl text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{item.name}</h3>
                    <p className="text-neon-green font-bold mt-1">₹{item.price}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-white/5 rounded-full">
                        <button
                          onClick={() => updateQty(item._id, item.qty - 1)}
                          className="w-8 h-8 text-white hover:bg-white/10 rounded-full"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-white font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item._id, item.qty + 1)}
                          className="w-8 h-8 text-white hover:bg-white/10 rounded-full"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-gray-500 text-xs">Stock: {item.stockQuantity}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                    <button
                      onClick={() => {
                        removeFromCart(item._id);
                        toast.success(`${item.name} removed`);
                      }}
                      className="mt-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      <FaTrash className="inline mr-1" /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 text-red-400 text-sm font-medium hover:text-red-300"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-dark-800 rounded-2xl p-6 border border-white/5 h-fit sticky top-24">
              <h2 className="text-white font-bold text-xl mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Items</span>
                  <span className="text-white">{cart.reduce((s, i) => s + i.qty, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-neon-green">Free</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-neon-green font-bold text-xl">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              <p className="text-gray-500 text-xs text-center mt-3">Free shipping on all orders</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
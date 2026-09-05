import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import { FaArrowLeft, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/me')
      .then((res) => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusPill = {
    placed: 'bg-sky-100 text-sky-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600'
  };

  const paymentPill = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-600'
  };

  return (
    <div className="min-h-screen pt-16 pb-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="kicker">FITHUB ORDERS</span>
            <h1 className="font-display text-4xl text-slate-900 mt-1">
              MY <span className="text-neon-pink">ORDERS</span>
            </h1>
            <p className="text-slate-500 mt-1">{orders.length ? `${orders.length} order(s) placed` : 'Your past purchases'}</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-full border border-slate-200 hover:border-primary-300 hover:text-primary-600 shadow-soft"
          >
            <FaArrowLeft /> Shop More
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-soft animate-pulse p-6">
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                <div className="h-16 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-14 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-5">
              <FaShoppingBag className="text-3xl text-slate-300" />
            </div>
            <h2 className="font-display text-2xl text-slate-900 mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-6">When you place an order from the store, it will show up here.</p>
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity shadow-glow"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div>
                    <p className="text-slate-900 font-bold">
                      ORDER <span className="text-primary-600">#{order._id.slice(-6).toUpperCase()}</span>
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">{fmtDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusPill[order.status] || 'bg-slate-100 text-slate-600'}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${paymentPill[order.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {order.paymentStatus === 'paid' ? 'PAID' : order.paymentStatus === 'pending' ? 'PENDING PAYMENT' : 'PAYMENT FAILED'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {(order.items || []).map((item) => (
                      <div key={item._id || `${order._id}-${item.name}`} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 aspect-square">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaShoppingBag className="text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-medium truncate">{item.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            ₹{item.price} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-slate-900 font-bold shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-end justify-between gap-4">
                    <div className="text-sm text-slate-500 max-w-xs">
                      <p className="flex items-start gap-2">
                        <FaMapMarkerAlt className="mt-0.5 text-primary-500 shrink-0" />
                        <span>
                          {order.shippingAddress ? (
                            <>
                              <span className="text-slate-800 font-medium">{order.shippingAddress.fullName}</span>
                              {' · '}{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}{order.shippingAddress.landmark ? ` (near ${order.shippingAddress.landmark})` : ''}
                            </>
                          ) : (
                            'No delivery address'
                          )}
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-slate-400 text-xs uppercase tracking-wide">Total · {order.paymentMethod || 'razorpay'}</p>
                      <p className="font-display text-2xl text-emerald-600 font-bold">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import { ORDER_STEPS, ORDER_STATUS_META, fmtStatusTime, currentStepIndex } from '../../utils/orderStatus';
import { FaBoxOpen, FaSearch, FaTruck, FaMapMarkerAlt, FaCheckCircle, FaUndo } from 'react-icons/fa';

const STATUS_ORDER = [...ORDER_STEPS, 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [note, setNote] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status, optionalNote) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status, note: optionalNote || undefined });
      toast.success(res.data?.message || 'Order status updated');
      setOrders(orders.map(o => (o._id === orderId ? res.data.order : o)));
      setNote((n) => ({ ...n, [orderId]: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const advance = (order) => {
    if (order.status === 'cancelled') return;
    const idx = currentStepIndex(order.status);
    const next = idx >= 0 && idx < ORDER_STEPS.length - 1 ? ORDER_STEPS[idx + 1] : null;
    if (next) updateStatus(order._id, next, note[order._id] || undefined);
  };

  const meta = (s) => ORDER_STATUS_META[s] || ORDER_STATUS_META.placed;

  const fmtShort = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (o.user?.name || '').toLowerCase().includes(q) ||
      (o.user?.email || '').toLowerCase().includes(q) ||
      (o.user?.phone || '').includes(q) ||
      (o._id || '').toLowerCase().includes(q) ||
      (o.items || []).some((i) => (i.name || '').toLowerCase().includes(q));
    const matchesFilter = filter === 'all' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, { all: orders.length });

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">ORDERS <span className="text-neon-yellow">STATUS</span></h1>
            <p className="text-gray-400 mt-1">Track and update live delivery status for store orders</p>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, member, product..."
              className="pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-400 w-64"
            />
          </div>
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                filter === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : s === 'cancelled'
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : `bg-white text-slate-600 border-slate-200 hover:border-primary-300`
              }`}
            >
              {s === 'all' ? 'All' : `${meta(s).emoji} ${meta(s).label}`}
              <span className="ml-1.5 opacity-60">({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="space-y-6">
          {loading ? (
            <p className="text-center text-gray-400 py-20">Loading orders...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <FaBoxOpen className="mx-auto text-4xl mb-3 opacity-40" />
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
            </div>
          ) : (
            filtered.map((o, idx) => {
              const m = meta(o.status);
              const isCancelled = o.status === 'cancelled';
              const step = currentStepIndex(o.status);
              const nextStep = !isCancelled && step >= 0 && step < ORDER_STEPS.length - 1 ? ORDER_STEPS[step + 1] : null;
              const lastUpdate = [...(o.statusHistory || [])].slice(-1)[0];
              return (
                <motion.div
                  key={o._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className={`bg-white rounded-2xl p-6 border ${isCancelled ? 'border-red-200' : 'border-white/5'} shadow-soft ${isCancelled ? 'opacity-80' : ''}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <FaTruck />
                      </div>
                      <div>
                        <p className="text-white font-bold">
                          ORDER <span className="text-primary-400">#{o._id.slice(-6).toUpperCase()}</span>
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {o.user ? `${o.user.name || 'Member'} · ${o.user.email || o.user.phone || 'no contact'}` : 'Unknown user'} · {fmtShort(o.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${m.pill}`}>
                        {m.emoji} {m.label.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700'
                          : o.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {o.paymentStatus === 'paid' ? 'PAID' : o.paymentStatus === 'pending' ? 'PAYMENT PENDING' : 'PAYMENT FAILED'}
                      </span>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  {!isCancelled && step >= 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        {ORDER_STEPS.map((s, i) => {
                          const sMeta = ORDER_STATUS_META[s];
                          const done = i <= step;
                          return (
                            <span key={s} className={`text-[10px] font-bold ${done ? 'text-slate-800' : 'text-slate-300'}`}>
                              {sMeta.emoji} {sMeta.label}
                            </span>
                          );
                        })}
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isCancelled ? 'bg-red-400' : 'bg-gradient-to-r from-primary-500 to-neon-pink'}`}
                          style={{ width: `${(step / (ORDER_STEPS.length - 1)) * 100}%` }}
                        />
                      </div>
                      {lastUpdate?.at && (
                        <p className="text-xs text-gray-400 mt-1.5">Last update: {fmtStatusTime(lastUpdate.at)}{lastUpdate.note ? ` — ${lastUpdate.note}` : ''}</p>
                      )}
                    </div>
                  )}

                  <div className="grid lg:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Items</p>
                      {(o.items || []).map((i) => (
                        <div key={i._id || i.name} className="flex justify-between text-sm py-0.5">
                          <span className="text-white truncate">
                            {i.name || 'Item'}{i.size ? ` (${i.size})` : ''} <span className="text-gray-400">× {i.quantity}</span>
                          </span>
                          <span className="text-white shrink-0 font-medium">₹{Number((i.price || 0) * (i.quantity || 1)).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-2 mt-1 border-t border-slate-200 font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-neon-green">₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <FaMapMarkerAlt /> Delivery Address
                      </p>
                      {o.shippingAddress ? (
                        <>
                          <p className="text-white font-semibold text-sm">{o.shippingAddress.fullName} · {o.shippingAddress.phone || ''}</p>
                          <p className="text-gray-400 text-sm mt-0.5">
                            {o.shippingAddress.address}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}
                            {o.shippingAddress.landmark ? ` (near ${o.shippingAddress.landmark})` : ''}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-400 text-sm">No delivery address recorded.</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">Payment: {o.paymentMethod || 'razorpay'} · {fmtShort(o.createdAt)}</p>
                    </div>
                  </div>

                  {/* Status updater */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value, note[o._id] || undefined)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-800 font-medium focus:outline-none focus:border-primary-400"
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>{meta(s).emoji} {meta(s).label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={note[o._id] || ''}
                      onChange={(e) => setNote((n) => ({ ...n, [o._id]: e.target.value }))}
                      placeholder="Optional note (e.g. courier name, ETA)"
                      className="flex-1 min-w-[180px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-400"
                    />
                    {nextStep && (
                      <button
                        onClick={() => advance(o)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-neon-pink text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
                      >
                        <FaCheckCircle /> Mark {ORDER_STATUS_META[nextStep].label}
                      </button>
                    )}
                    {!isCancelled && (
                      <button
                        onClick={() => updateStatus(o._id, 'cancelled', note[o._id] || 'Cancelled by admin')}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-full hover:bg-red-100 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    {isCancelled && (
                      <button
                        onClick={() => updateStatus(o._id, 'placed', note[o._id] || 'Restored')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-full hover:bg-slate-200 transition-colors"
                      >
                        <FaUndo /> Restore
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
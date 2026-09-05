import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaPlus, FaCalendarAlt } from 'react-icons/fa';

const todayStr = () => new Date().toISOString().split('T')[0];

const getValidity = (m) => {
  if (!m || !m.endDate) return null;
  const end = new Date(m.endDate);
  const now = new Date();
  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 0) return { status: 'expired', label: 'Expired', emoji: '🔴', daysRemaining };
  if (daysRemaining <= 30) return { status: 'expiring', label: 'Expiring Soon', emoji: '🟡', daysRemaining };
  return { status: 'active', label: 'Active', emoji: '🟢', daysRemaining };
};

const ALERT_THRESHOLDS = [30, 15, 7, 3, 1];

const WeightChart = ({ entries }) => {
  const points = entries
    .filter(e => e.weight)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (points.length < 2) return null;

  const W = 600, H = 200, P = 30;
  const weights = points.map(p => Number(p.weight));
  const min = Math.min(...weights) - 2;
  const max = Math.max(...weights) + 2;

  const coords = points.map((p, i) => ({
    x: P + (i / (points.length - 1)) * (W - P * 2),
    y: H - P - ((Number(p.weight) - min) / (max - min)) * (H - P * 2),
    p
  }));

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = `${line} L ${coords[coords.length - 1].x} ${H - P} L ${coords[0].x} ${H - P} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#wg)" />
      <path d={line} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="5" fill="#fff" stroke="#ef4444" strokeWidth="2.5" />
          {i === 0 && (
            <text x={c.x} y={c.y - 12} textAnchor="middle" className="fill-orange-600" fontSize="12" fontWeight="bold">
              {c.p.weight}kg · {new Date(c.p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </text>
          )}
          {i === coords.length - 1 && (
            <text x={c.x} y={c.y - 12} textAnchor="middle" className="fill-red-600" fontSize="12" fontWeight="bold">
              {c.p.weight}kg · {new Date(c.p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pform, setPform] = useState({ date: todayStr(), weight: '', chest: '', waist: '', biceps: '', thighs: '', note: '' });
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [rform, setRform] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    if (!user) return;
    api.get('/members/me')
      .then(res => {
        setMemberships(res.data.memberships || []);
      })
      .catch(() => {
        setMemberships([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    api.get('/progress')
      .then(res => setProgress(res.data))
      .catch(() => {})
      .finally(() => setProgressLoading(false));
  }, []);

  useEffect(() => {
    api.get('/reviews')
      .then(res => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, []);

  useEffect(() => {
    if (!loading || !activeMembership || !activeValidity) return;

    try {
      const key = `fithub_member_alert_${user?._id || 'guest'}`;
      const prev = localStorage.getItem(key);

      let cur = null;
      if (activeValidity.status === 'expired') cur = 'expired';
      else if (activeValidity.status === 'expiring') {
        const hit = ALERT_THRESHOLDS.find(t => activeValidity.daysRemaining <= t);
        cur = hit != null ? String(hit) : null;
      }

      if (cur && cur !== prev) {
        if (cur === 'expired') {
          toast.error('🔴 Your membership has expired — renew now to keep training!', { duration: 7000 });
        } else {
          toast(`⚠️ Your membership expires in ${activeValidity.daysRemaining === 0 ? 'less than a day' : `${activeValidity.daysRemaining} day${activeValidity.daysRemaining > 1 ? 's' : ''}`}.`, { duration: 7000 });
        }
        localStorage.setItem(key, cur);
      }
    } catch {}
  }, [loading]);

  const activeMembership = memberships.find(m => m.status === 'active');
  const pendingMembership = memberships.find(m => m.status === 'pending');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const activeValidity = activeMembership ? (activeMembership.validity || getValidity(activeMembership)) : null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rform.rating) {
      toast.error('Please select a star rating (1 to 5)');
      return;
    }
    if (!rform.comment.trim()) {
      toast.error('Please write about your experience');
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.post('/reviews', { rating: rform.rating, comment: rform.comment.trim() });
      toast.success('Thanks for sharing your experience! 💪');
      setRform({ rating: 0, comment: '' });
      const res = await api.get('/reviews');
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!pform.weight) {
      toast.error('Please add your weight');
      return;
    }
    setSaveLoading(true);
    try {
      await api.post('/progress', { ...pform, weight: Number(pform.weight) });
      toast.success('Progress entry added! 💪');
      setPform({ date: todayStr(), weight: '', chest: '', waist: '', biceps: '', thighs: '', note: '' });
      const res = await api.get('/progress');
      setProgress(res.data);
    } catch (err) {
      toast.error('Failed to save entry');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleProgressDelete = async (id) => {
    try {
      await api.delete(`/progress/${id}`);
      toast.success('Entry removed');
      setProgress(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  const sortedProgress = [...progress].sort((a, b) => new Date(a.date) - new Date(b.date));
  const startWeight = sortedProgress.length ? Number(sortedProgress[0].weight) : null;
  const currentWeight = sortedProgress.length ? Number(sortedProgress[sortedProgress.length - 1].weight) : null;
  const delta = currentWeight != null && startWeight != null ? currentWeight - startWeight : null;

  const pInputs = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none';
  const pLabel = 'block text-slate-500 text-xs mb-1';

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="kicker">DASHBOARD</span>
              <h1 className="font-display text-4xl text-slate-900 mt-1">Hey, <span className="text-orange-500">{user?.name?.split(' ')[0]}</span> 👋</h1>
              <p className="text-slate-500 mt-1">Welcome to your <span className="text-slate-700 font-medium">FitHub by Samarth Gym</span> dashboard</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/transactions"
                className="px-5 py-2 bg-white text-slate-600 font-semibold rounded-full border border-slate-200 hover:border-orange-300 hover:text-orange-600 shadow-soft whitespace-nowrap"
              >
                Transactions
              </Link>
              <Link
                to="/calendar"
                className="px-5 py-2 bg-white text-slate-600 font-semibold rounded-full border border-slate-200 hover:border-orange-300 hover:text-orange-600 shadow-soft whitespace-nowrap flex items-center gap-2"
              >
                <FaCalendarAlt className="text-xs" /> Calendar
              </Link>
              <Link
                to="/subscriptions"
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:opacity-90 whitespace-nowrap"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-slate-400 py-20">Loading...</div>
          ) : (
            <div>
              {/* Membership validity & expiry alert system */}
              {activeMembership && activeValidity && (activeValidity.status !== 'active') && (
                <div className={`mb-6 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${activeValidity.status === 'expired' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div>
                    <h3 className={`font-bold ${activeValidity.status === 'expired' ? 'text-red-700' : 'text-amber-700'}`}>
                      {activeValidity.status === 'expired'
                        ? '🔴 Your membership has expired.'
                        : `⚠️ Your membership expires in ${activeValidity.daysRemaining === 0 ? 'less than a day' : `${activeValidity.daysRemaining} day${activeValidity.daysRemaining > 1 ? 's' : ''}`}.`}
                    </h3>
                    <p className={`text-sm mt-1 ${activeValidity.status === 'expired' ? 'text-red-500' : 'text-amber-600'}`}>
                      {activeValidity.status === 'expired'
                        ? `Your ${activeMembership.subscription?.name || ''} plan expired on ${formatDate(activeMembership.endDate)}.`
                        : `Your ${activeMembership.subscription?.name || ''} plan expires on ${formatDate(activeMembership.endDate)}.`}
                      {' '}Renew now to continue your fitness journey.
                    </p>
                  </div>
                  <Link
                    to="/subscriptions"
                    className="shrink-0 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:opacity-90 shadow-glow"
                  >
                    Renew Membership
                  </Link>
                </div>
              )}

              {pendingMembership && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-amber-700 font-bold">⏳ Membership Awaiting Confirmation</h3>
                    <p className="text-amber-600 text-sm mt-1">
                      Your <span className="font-semibold">{pendingMembership.subscription?.name}</span> plan is pending.
                      Please pay <span className="font-semibold">₹{pendingMembership.amountRemaining}</span> at the gym to activate it.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid lg:grid-cols-3 gap-8">
              {/* Membership Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">
                  <h2 className="text-slate-900 font-bold text-xl mb-6">Your Membership</h2>

                  {activeMembership ? (
                    <div className={`on-dark rounded-2xl p-6 border border-white/15 ${activeValidity?.status === 'expired' ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500' : activeValidity?.status === 'expiring' ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-orange-500' : 'bg-gradient-to-br from-red-600 via-orange-600 to-orange-500'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/80 font-semibold text-sm uppercase tracking-wide">
                          Membership Status
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          activeValidity?.status === 'expired' ? 'bg-red-100 text-red-600' :
                          activeValidity?.status === 'expiring' ? 'bg-amber-100 text-amber-700' : 'bg-white text-orange-600'
                        }`}>
                          {activeValidity?.emoji} {activeValidity?.label || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Membership Type</p>
                          <h3 className="text-2xl text-white font-bold truncate">
                            {activeMembership.subscription?.name || 'Membership'}
                          </h3>
                          {activeMembership.subscription?.description && (
                            <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                              {activeMembership.subscription.description}
                            </p>
                          )}
                        </div>
                        <Link
                          to="/calendar"
                          className="shrink-0 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                          aria-label="View on calendar"
                        >
                          <FaCalendarAlt className="text-sm" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-gray-400">Start Date</p>
                          <p className="text-white font-medium">{formatDate(activeMembership.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Expiry Date</p>
                          <p className="text-white font-medium">{formatDate(activeMembership.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">
                            {activeValidity?.status === 'expired' ? 'Status' : 'Days Remaining'}
                          </p>
                          <p className={`font-bold text-lg ${activeValidity?.status === 'expired' ? 'text-red-200' : activeValidity?.status === 'expiring' ? 'text-amber-300' : 'text-white'}`}>
                            {activeValidity?.status === 'expired' ? 'Expired 🔴' : activeValidity?.daysRemaining}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Amount</p>
                          <p className="text-white font-medium">₹{activeMembership.totalAmount}</p>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="border-t border-white/15 pt-4">
                        <p className="text-xs text-gray-400 mb-2">Payment Status</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white/15 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-white to-amber-200 transition-all"
                              style={{ width: `${(activeMembership.amountPaid / activeMembership.totalAmount) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold ${
                            activeMembership.paymentStatus === 'paid' ? 'text-emerald-300' :
                            activeMembership.paymentStatus === 'partial' ? 'text-amber-300' : 'text-red-300'
                          }`}>
                            {activeMembership.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-gray-400">Paid: <span className="text-white">₹{activeMembership.amountPaid}</span></span>
                          <span className="text-gray-400">Remaining: <span className="text-white">₹{activeMembership.amountRemaining}</span></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🏋️</div>
                      <h3 className="text-slate-900 font-bold text-xl mb-2">No Active Membership</h3>
                      <p className="text-slate-400 mb-6">Get started with a plan that fits your goals</p>
                      <Link
                        to="/subscriptions"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:opacity-90"
                      >
                        Browse Plans
                      </Link>
                    </div>
                  )}

                  {/* Membership History */}
                  {memberships.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-slate-900 font-semibold mb-4">Membership History</h3>
                      <div className="space-y-2">
                        {memberships.slice(0, 5).map((m) => (
                          <div
                            key={m._id}
                            className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 text-sm"
                          >
                            <div>
                              <span className="text-slate-800 font-medium">{m.subscription?.name || 'Membership'}</span>
                              <span className="text-slate-400 ml-2">{formatDate(m.startDate)} - {formatDate(m.endDate)}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              m.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              m.status === 'expired' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {m.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Profile Info */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                  <h2 className="text-slate-900 font-bold mb-4">Profile</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold">{user?.name}</p>
                      <p className="text-slate-400 text-sm">{user?.email}</p>
                      <p className="text-slate-400 text-sm">{user?.phone}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Member Since</span>
                      <span className="text-slate-800">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role</span>
                      <span className="text-slate-800 capitalize">{user?.role}</span>
                    </div>
                  </div>
                </div>

                <div className="on-dark bg-gradient-to-br from-red-600 to-orange-500 rounded-3xl p-6 border border-white/15">
                  <h3 className="text-white font-bold mb-2">💪 Pro Tip</h3>
                  <p className="text-gray-200 text-sm">
                    Stay consistent! Even 30 minutes a day makes a huge difference in the long run.
                  </p>
                </div>
              </div>
            </div>

            {/* PROGRESS TRACKER */}
            <div className="mt-10">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                  <div>
                    <span className="kicker">PROGRESS TRACKER</span>
                    <h2 className="font-display text-3xl text-slate-900 mt-1">TRACK YOUR <span className="text-orange-500">GAINS</span></h2>
                    <p className="text-slate-500 text-sm mt-1">Log your weight and measurements, then watch the trend</p>
                  </div>
                  {delta != null && (
                    <div className={`px-4 py-2 rounded-2xl text-sm font-bold ${delta <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {delta <= 0 ? '▼' : '▲'} {Math.abs(delta)} kg since first entry
                    </div>
                  )}
                </div>

                {progressLoading ? (
                  <div className="text-center text-slate-400 py-10">Loading...</div>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Chart + summary */}
                    <div>
                      {sortedProgress.length >= 2 && startWeight != null ? (
                        <>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Weight Trend</p>
                            <WeightChart entries={sortedProgress} />
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-slate-50 rounded-2xl py-3 border border-slate-100">
                              <p className="text-xs text-slate-400">Start</p>
                              <p className="font-display text-xl text-slate-900 font-bold">{startWeight}kg</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl py-3 border border-slate-100">
                              <p className="text-xs text-slate-400">Now</p>
                              <p className="font-display text-xl text-orange-600 font-bold">{currentWeight}kg</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl py-3 border border-slate-100">
                              <p className="text-xs text-slate-400">Change</p>
                              <p className={`font-display text-xl font-bold ${delta <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{delta > 0 ? '+' : ''}{delta}kg</p>
                            </div>
                          </div>
                        </>
                      ) : sortedProgress.length === 1 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="text-5xl mb-3">📈</div>
                          <p className="text-slate-500 font-medium mb-1">Great start — {startWeight}kg logged!</p>
                          <p className="text-slate-400 text-sm">Add a few more entries to unlock your weight trend chart.</p>
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="text-5xl mb-3">📈</div>
                          <p className="text-slate-500 font-medium mb-1">No entries yet</p>
                          <p className="text-slate-400 text-sm">Log your first weight to start tracking your progress.</p>
                        </div>
                      )}
                    </div>

                    {/* Add entry form */}
                    <div>
                      <form onSubmit={handleProgressSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><FaPlus className="text-orange-500" /> Log an entry</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={pLabel}>Date</label>
                            <input type="date" required className={pInputs} value={pform.date} onChange={(e) => setPform({ ...pform, date: e.target.value })} />
                          </div>
                          <div>
                            <label className={pLabel}>Weight (kg) *</label>
                            <input type="number" step="0.1" required className={pInputs} value={pform.weight} onChange={(e) => setPform({ ...pform, weight: e.target.value })} placeholder="e.g. 72.5" />
                          </div>
                          <div>
                            <label className={pLabel}>Chest (cm)</label>
                            <input type="number" step="0.1" className={pInputs} value={pform.chest} onChange={(e) => setPform({ ...pform, chest: e.target.value })} placeholder="Optional" />
                          </div>
                          <div>
                            <label className={pLabel}>Waist (cm)</label>
                            <input type="number" step="0.1" className={pInputs} value={pform.waist} onChange={(e) => setPform({ ...pform, waist: e.target.value })} placeholder="Optional" />
                          </div>
                          <div>
                            <label className={pLabel}>Biceps (cm)</label>
                            <input type="number" step="0.1" className={pInputs} value={pform.biceps} onChange={(e) => setPform({ ...pform, biceps: e.target.value })} placeholder="Optional" />
                          </div>
                          <div>
                            <label className={pLabel}>Thighs (cm)</label>
                            <input type="number" step="0.1" className={pInputs} value={pform.thighs} onChange={(e) => setPform({ ...pform, thighs: e.target.value })} placeholder="Optional" />
                          </div>
                          <div className="col-span-2">
                            <label className={pLabel}>Note</label>
                            <input type="text" className={pInputs} value={pform.note} onChange={(e) => setPform({ ...pform, note: e.target.value })} placeholder="Feeling strong 💪 (optional)" />
                          </div>
                        </div>
                        <button type="submit" disabled={saveLoading} className="w-full mt-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50">
                          {saveLoading ? 'Saving...' : 'Save Entry'}
                        </button>
                      </form>

                      {/* Entries list */}
                      <div className="mt-4">
                        {sortedProgress.length > 0 && (
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                            {[...sortedProgress].reverse().slice(0, 10).map((entry) => (
                              <div key={entry._id} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                  {new Date(entry.date).getDate()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-slate-900 text-sm font-semibold">{formatDate(entry.date)}</p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {entry.weight}kg{entry.chest ? ` · Chest ${entry.chest}cm` : ''}{entry.waist ? ` · Waist ${entry.waist}cm` : ''}{entry.note ? ` · ${entry.note}` : ''}
                                  </p>
                                </div>
                                <button onClick={() => handleProgressDelete(entry._id)} className="text-red-400 hover:text-red-500 p-2" aria-label="Delete entry">
                                  <FaTrash />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          )}
        </div>

        {/* SHARE YOUR EXPERIENCE — real, MongoDB-backed reviews */}
        <section className="mt-14">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Submit form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 lg:sticky lg:top-24">
                <span className="kicker">SHARE YOUR EXPERIENCE</span>
                <h2 className="font-display text-2xl text-slate-900 mt-1 mb-2">
                  Feedback for <span className="text-orange-500">Samarth Gym</span>
                </h2>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                  Tell us how your fitness journey is going. Genuine member feedback helps us get better.
                </p>

                <form onSubmit={handleReviewSubmit}>
                  <label className={pLabel}>Your Rating</label>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRform({ ...rform, rating: r })}
                        className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                          rform.rating >= r ? 'bg-amber-100 text-amber-500 scale-105' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                        }`}
                        aria-label={`${r} star${r > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <label className={pLabel}>Your Experience</label>
                  <textarea
                    rows="4"
                    maxLength="500"
                    className={`${pInputs} resize-none`}
                    placeholder="Tell us about your experience…"
                    value={rform.comment}
                    onChange={(e) => setRform({ ...rform, comment: e.target.value })}
                  />
                  <p className="text-right text-xs text-slate-400 mt-1">{rform.comment.length}/500</p>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : '🖊️ Submit Review'}
                  </button>
                </form>
              </div>
            </div>

            {/* Reviews list */}
            <div className="lg:col-span-2">
              <div className="mb-6 text-center lg:text-left">
                <span className="kicker">REVIEWS</span>
                <h2 className="font-display text-3xl text-slate-900 mt-1">WHAT OUR <span className="text-orange-500">MEMBERS</span> SAY</h2>
                <p className="text-slate-500 mt-2">Verified feedback, straight from the FITHUB family</p>
              </div>

              {reviewsLoading ? (
                <div className="text-center text-slate-400 py-16 bg-white rounded-3xl border border-slate-100 shadow-soft">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-soft">
                  <div className="text-5xl mb-3">⭐</div>
                  <p className="text-slate-500 font-medium mb-1">No reviews yet</p>
                  <p className="text-slate-400 text-sm">Be the first to share your experience at the gym</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {reviews.map((r, i) => (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                      viewport={{ once: true }}
                      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col"
                    >
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, s) => (
                          <span key={s} className={`text-base ${s < r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed flex-1">"{r.comment}"</p>
                      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                          {(r.user?.name || r.name || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold text-sm">{r.user?.name || r.name}</p>
                          <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default Dashboard;
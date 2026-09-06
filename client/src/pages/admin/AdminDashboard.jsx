import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import {
  FaUsers, FaBoxOpen, FaTag, FaMoneyBillWave, FaUserPlus, FaImage, FaSignOutAlt, FaChartBar, FaHistory, FaStar
} from 'react-icons/fa';
import Stickers from '../../components/Stickers';

const getValidity = (m) => {
  if (!m || !m.endDate) return null;
  const end = new Date(m.endDate);
  const now = new Date();
  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 0) return { status: 'expired', label: 'Expired', emoji: '🔴', daysRemaining };
  if (daysRemaining <= 30) return { status: 'expiring', label: 'Expiring Soon', emoji: '🟡', daysRemaining };
  return { status: 'active', label: 'Active', emoji: '🟢', daysRemaining };
};

const toDateInput = (d) => {
  if (!d) return new Date().toISOString().split('T')[0];
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const APP_VERSION = 'v6.2 · dashboard';

  const [stats, setStats] = useState({ members: 0, products: 0, subscriptions: 0, banners: 0, revenue: 0 });
  const [recentMembers, setRecentMembers] = useState([]);
  const [validityCounts, setValidityCounts] = useState({ active: 0, expiring: 0, expired: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const safeGet = (path) => api.get(path).catch((err) => {
    setFetchError(true);
    setFetchErrorMessage(err.response?.data?.message || err.message || 'Request failed');
    return { data: [] };
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', password: '', address: '' });
  const [membershipForm, setMembershipForm] = useState({
    assignOnCreate: false,
    subscriptionId: '',
    startDate: new Date().toISOString().split('T')[0],
    amountPaid: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const fetchAll = async () => {
    try {
      const [membersRes, productsRes, subsRes, bannersRes, txsRes, subscriptionsRes] = await Promise.all([
        safeGet('/members'),
        safeGet('/products/all'),
        safeGet('/subscriptions/all'),
        safeGet('/banners/all'),
        safeGet('/members/all-transactions'),
        safeGet('/subscriptions/all')
      ]);

      const membersArr = Array.isArray(membersRes.data) ? membersRes.data : [];
      const productsArr = Array.isArray(productsRes.data) ? productsRes.data : [];
      const subsArr = Array.isArray(subsRes.data) ? subsRes.data : [];
      const bannersArr = Array.isArray(bannersRes.data) ? bannersRes.data : [];
      const txsArr = Array.isArray(txsRes.data) ? txsRes.data : [];
      const subsForForm = Array.isArray(subscriptionsRes.data) ? subscriptionsRes.data : [];

      const revenue = membersArr.reduce((sum, m) => sum + (Number(m.currentMembership?.amountPaid) || 0), 0);

      const counts = membersArr.reduce((acc, m) => {
        const v = m.membershipValidity || getValidity(m.currentMembership);
        if (v && acc[v.status] !== undefined) acc[v.status] += 1;
        return acc;
      }, { active: 0, expiring: 0, expired: 0 });

      setStats({ members: membersArr.length, products: productsArr.length, subscriptions: subsArr.length, banners: bannersArr.length, revenue });
      setValidityCounts(counts);
      setRecentMembers(membersArr.slice(0, 5));
      setRecentTransactions(txsArr.slice(0, 6));
      setSubscriptions(subsForForm);
      setFetchError(false);
    } catch (error) {
      console.error(error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password) {
      toast.error('Name, email and password are required');
      return;
    }
    setAddSaving(true);
    try {
      const res = await api.post('/auth/register', addForm);
      const newMember = res.data;

      if (membershipForm.assignOnCreate && membershipForm.subscriptionId) {
        await api.post(`/members/${newMember._id}/membership`, {
          subscriptionId: membershipForm.subscriptionId,
          startDate: membershipForm.startDate,
          amountPaid: Number(membershipForm.amountPaid) || 0,
          paymentMethod: membershipForm.paymentMethod,
          notes: membershipForm.notes
        });
        toast.success(`Member created & enrolled in a plan!`);
      } else {
        toast.success(`Member ${newMember.name} created!`);
      }

      setShowAddModal(false);
      setAddForm({ name: '', email: '', phone: '', password: '', address: '' });
      setMembershipForm({ assignOnCreate: false, subscriptionId: '', startDate: new Date().toISOString().split('T')[0], amountPaid: '', paymentMethod: 'cash', notes: '' });
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create member');
    } finally {
      setAddSaving(false);
    }
  };

  const navItems = [
    { to: '/admin', label: 'Overview', icon: FaChartBar, active: true },
    { to: '/admin/members', label: 'Members', icon: FaUsers },
    { to: '/admin/subscriptions', label: 'Subscriptions', icon: FaTag },
    { to: '/admin/products', label: 'Products', icon: FaBoxOpen },
    { to: '/admin/banners', label: 'Banners', icon: FaImage },
    { to: '/admin/reviews', label: 'Reviews', icon: FaStar },
    { to: '/admin/payments', label: 'Payments', icon: FaMoneyBillWave },
    { to: '/admin/transactions', label: 'Transactions', icon: FaHistory }
  ];

  const cards = [
    { label: 'Total Members', value: stats.members, icon: FaUsers, color: 'from-primary-500 to-primary-700' },
    { label: 'Products', value: stats.products, icon: FaBoxOpen, color: 'from-neon-pink to-pink-700' },
    { label: 'Subscriptions', value: stats.subscriptions, icon: FaTag, color: 'from-neon-green to-green-700' },
    { label: 'Revenue', value: `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`, icon: FaMoneyBillWave, color: 'from-neon-yellow to-yellow-700' }
  ];

  const fmtShort = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch { return '—'; }
  };

  const totalsCollected = recentTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const modalInputs = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400';
  const modalLabel = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">ADMIN <span className="text-primary-500">PANEL</span></h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className="px-3 py-1.5 bg-white/60 text-slate-500 text-xs font-semibold rounded-full border border-slate-200">
              Build {APP_VERSION}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-full hover:bg-red-500/20"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
            <p className="text-amber-800 text-sm">
              Some admin data failed to load. Showing what we have — try refreshing in a moment.
              {fetchErrorMessage ? <span className="block mt-1 text-amber-700 text-xs">Details: {fetchErrorMessage}</span> : null}
            </p>
            <button onClick={fetchAll} className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-full hover:bg-amber-600 transition-colors shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white`}
            >
              <card.icon className="text-3xl mb-3 opacity-80" />
              <p className="font-display text-3xl">{card.value}</p>
              <p className="text-sm opacity-80">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Navigation */}
          <div className="bg-white rounded-2xl p-4 border border-white/5">
            <h2 className="text-white font-bold px-4 py-3 mb-2">MANAGE</h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.to
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-white/5">
            <h2 className="text-white font-bold mb-4">QUICK ACTIONS</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl text-left"
              >
                <FaUserPlus className="text-neon-green" />
                <span className="text-white font-medium">Add New Member</span>
              </button>
              <Link to="/admin/subscriptions" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <FaTag className="text-primary-400" />
                <span className="text-white font-medium">Manage Subscription Plans</span>
              </Link>
              <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <FaBoxOpen className="text-neon-pink" />
                <span className="text-white font-medium">Update Product Stock</span>
              </Link>
              <Link to="/admin/banners" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <FaImage className="text-neon-yellow" />
                <span className="text-white font-medium">Create Marketing Banner</span>
              </Link>
            </div>
          </div>

          {/* Recent Members */}
          <div className="bg-white rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">RECENT MEMBERS</h2>
              <Link to="/admin/members" className="text-primary-400 text-sm hover:underline">View all →</Link>
            </div>
            <div className="flex flex-wrap gap-2 mb-4 text-[11px] font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-neon-green/15 text-neon-green">🟢 {validityCounts.active} Active</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600">🟡 {validityCounts.expiring} Expiring</span>
              <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-500">🔴 {validityCounts.expired} Expired</span>
            </div>
            <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
              {loading ? (
                <p className="text-gray-500 text-sm text-center py-8">Loading members...</p>
              ) : recentMembers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No members yet</p>
              ) : (
                recentMembers.map((member) => {
                  const mem = member.currentMembership;
                  const val = member.membershipValidity || getValidity(mem);
                  return (
                    <div key={member._id} className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center text-white font-bold shrink-0">
                          {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">{member.name || 'Unknown'}</p>
                          <p className="text-gray-500 text-xs truncate">{member.email || member.phone}</p>
                        </div>
                        {val && (
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            val.status === 'active' ? 'bg-neon-green/15 text-neon-green' :
                            val.status === 'expiring' ? 'bg-amber-500/15 text-amber-600' : 'bg-red-500/15 text-red-500'
                          }`}>
                            {val.emoji} {val.label}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>
                          <span className="text-gray-400">Plan:</span>{' '}
                          <span className="text-white">{mem?.subscription?.name || '—'}</span>
                        </span>
                        <span>
                          <span className="text-gray-400">Joined:</span>{' '}
                          {fmtShort(member.createdAt)}
                        </span>
                        {mem?.endDate && (
                          <span>
                            <span className="text-gray-400">Expires:</span>{' '}
                            {fmtShort(mem.endDate)}
                            {val && `${val.daysRemaining < 0 ? '' : ` (${val.daysRemaining}d left)`}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Payments & Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-white font-bold">PAYMENTS &amp; TRANSACTIONS</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Recent settlements · ₹{(Number(totalsCollected) || 0).toLocaleString('en-IN')} collected across latest {recentTransactions.length} record(s)
              </p>
            </div>
            <Link to="/admin/transactions" className="text-primary-400 text-sm hover:underline">View all →</Link>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No payments recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-green to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    <FaMoneyBillWave className="text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm truncate">{t.memberName || 'Member'}</p>
                    <p className="text-gray-500 text-xs truncate">
                      {t.plan || 'Plan'} · {t.method ? t.method.charAt(0).toUpperCase() + t.method.slice(1) : 'Other'} · {fmtShort(t.date)}
                    </p>
                  </div>
                  <span className="shrink-0 text-neon-green font-bold">₹{Number(t.amount || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="pb-8 flex justify-center">
        <Stickers count={4} />
      </div>

      {/* Add New Member Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Member"
        subtitle="Register a gym member directly from the dashboard"
        icon={<FaUserPlus />}
        iconBg="bg-gradient-to-br from-neon-green to-emerald-600"
        size="lg"
        footer={
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              disabled={addSaving}
              className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-member-form"
              disabled={addSaving}
              className="flex-1 py-2.5 bg-gradient-to-r from-neon-green to-emerald-600 text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {addSaving ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        }
      >
        <form id="add-member-form" onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={modalLabel}>Full Name *</label>
              <input required className={modalInputs} value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="e.g. Raj Sharma" />
            </div>
            <div>
              <label className={modalLabel}>Phone</label>
              <input className={modalInputs} value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="10-digit mobile" />
            </div>
            <div>
              <label className={modalLabel}>Email *</label>
              <input type="email" required className={modalInputs} value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="member@email.com" />
            </div>
            <div>
              <label className={modalLabel}>Password *</label>
              <input type="password" required className={modalInputs} value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
            <div className="sm:col-span-2">
              <label className={modalLabel}>Address</label>
              <input className={modalInputs} value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} placeholder="Area / address" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2.5 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={membershipForm.assignOnCreate}
                onChange={(e) => setMembershipForm({ ...membershipForm, assignOnCreate: e.target.checked })}
                className="w-4 h-4 accent-emerald-600"
              />
              <span className="text-sm font-semibold text-slate-700">Also enroll in a membership plan</span>
            </label>

            {membershipForm.assignOnCreate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={modalLabel}>Plan</label>
                  <select className={modalInputs} value={membershipForm.subscriptionId} onChange={(e) => setMembershipForm({ ...membershipForm, subscriptionId: e.target.value })}>
                    <option value="">Select a plan...</option>
                    {subscriptions.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} - ₹{s.price}/{s.duration}{s.durationUnit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={modalLabel}>Start Date</label>
                  <input type="date" className={modalInputs} value={toDateInput(membershipForm.startDate)} onChange={(e) => setMembershipForm({ ...membershipForm, startDate: e.target.value })} />
                </div>
                <div>
                  <label className={modalLabel}>Advance Paid (₹)</label>
                  <input type="number" min="0" className={modalInputs} value={membershipForm.amountPaid} onChange={(e) => setMembershipForm({ ...membershipForm, amountPaid: e.target.value })} placeholder="0 = pay at gym" />
                </div>
                <div className="sm:col-span-2">
                  <label className={modalLabel}>Payment Method</label>
                  <select className={modalInputs} value={membershipForm.paymentMethod} onChange={(e) => setMembershipForm({ ...membershipForm, paymentMethod: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
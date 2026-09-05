import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const activeMembership = memberships.find(m => m.status === 'active');
  const pendingMembership = memberships.find(m => m.status === 'pending');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen pt-16 bg-dark-900">
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl text-white">Hey, <span className="text-primary-500">{user?.name?.split(' ')[0]}</span> 👋</h1>
              <p className="text-gray-400 mt-1">Welcome to your FITHUB dashboard</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/transactions"
                className="px-6 py-2 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10"
              >
                Transactions
              </Link>
              <Link
                to="/subscriptions"
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-semibold rounded-full hover:opacity-90"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading...</div>
          ) : (
            <div>
              {pendingMembership && (
                <div className="mb-6 bg-neon-yellow/10 border border-neon-yellow/30 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-neon-yellow font-bold">⏳ Membership Awaiting Confirmation</h3>
                    <p className="text-gray-300 text-sm mt-1">
                      Your <span className="text-white font-semibold">{pendingMembership.subscription?.name}</span> plan is pending.
                      Please pay <span className="text-white font-semibold">₹{pendingMembership.amountRemaining}</span> at the gym to activate it.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid lg:grid-cols-3 gap-8">
              {/* Membership Card */}
              <div className="lg:col-span-2">
                <div className="bg-dark-800 rounded-2xl p-8 border border-white/5">
                  <h2 className="text-white font-bold text-xl mb-6">Your Membership</h2>

                  {activeMembership ? (
                    <div className="bg-gradient-to-br from-primary-700 to-indigo-800 rounded-xl p-6 border border-primary-500/40 on-dark">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-primary-400 font-semibold text-sm uppercase tracking-wide">
                          Active Membership
                        </span>
                        <span className="px-3 py-1 bg-neon-green/20 text-neon-green text-xs font-bold rounded-full">
                          ACTIVE
                        </span>
                      </div>
                      <h3 className="text-2xl text-white font-bold mb-2">
                        {activeMembership.subscription?.name || 'Membership'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {activeMembership.subscription?.description}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="text-white font-medium">{formatDate(activeMembership.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="text-white font-medium">{formatDate(activeMembership.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Days Left</p>
                          <p className="text-neon-green font-bold text-lg">{getDaysRemaining(activeMembership.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-white font-medium">₹{activeMembership.totalAmount}</p>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-xs text-gray-500 mb-2">Payment Status</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-neon-green to-yellow-400 transition-all"
                              style={{ width: `${(activeMembership.amountPaid / activeMembership.totalAmount) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold ${
                            activeMembership.paymentStatus === 'paid' ? 'text-neon-green' :
                            activeMembership.paymentStatus === 'partial' ? 'text-neon-yellow' : 'text-red-400'
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
                      <h3 className="text-white font-bold text-xl mb-2">No Active Membership</h3>
                      <p className="text-gray-400 mb-6">Get started with a plan that fits your goals</p>
                      <Link
                        to="/subscriptions"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90"
                      >
                        Browse Plans
                      </Link>
                    </div>
                  )}

                  {/* Membership History */}
                  {memberships.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-white font-semibold mb-4">Membership History</h3>
                      <div className="space-y-2">
                        {memberships.slice(0, 5).map((m, i) => (
                          <div
                            key={m._id}
                            className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 text-sm"
                          >
                            <div>
                              <span className="text-white font-medium">{m.subscription?.name || 'Membership'}</span>
                              <span className="text-gray-500 ml-2">{formatDate(m.startDate)} - {formatDate(m.endDate)}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              m.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
                              m.status === 'expired' ? 'bg-red-400/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
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
                <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                  <h2 className="text-white font-bold mb-4">Profile</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center text-2xl text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user?.name}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                      <p className="text-gray-400 text-sm">{user?.phone}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member Since</span>
                      <span className="text-white">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Role</span>
                      <span className="text-white capitalize">{user?.role}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-700 to-indigo-800 rounded-2xl p-6 border border-primary-500/40 on-dark">
                  <h3 className="text-white font-bold mb-2">💪 Pro Tip</h3>
                  <p className="text-gray-300 text-sm">
                    Stay consistent! Even 30 minutes a day makes a huge difference in the long run.
                  </p>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

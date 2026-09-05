import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  FaUsers, FaBoxOpen, FaTag, FaMoneyBillWave, FaUserPlus, FaImage, FaSignOutAlt, FaChartBar, FaHistory
} from 'react-icons/fa';
import Stickers from '../../components/Stickers';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    members: 0,
    products: 0,
    subscriptions: 0,
    banners: 0,
    revenue: 0
  });
  const [recentMembers, setRecentMembers] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [membersRes, productsRes, subsRes, bannersRes] = await Promise.all([
          api.get('/members'),
          api.get('/products/all'),
          api.get('/subscriptions/all'),
          api.get('/banners/all')
        ]);

        const revenue = membersRes.data.reduce((sum, m) => sum + (m.currentMembership?.amountPaid || 0), 0);

        setStats({
          members: membersRes.data.length,
          products: productsRes.data.length,
          subscriptions: subsRes.data.length,
          banners: bannersRes.data.length,
          revenue
        });
        setRecentMembers(membersRes.data.slice(0, 5));
      } catch (error) {
        console.error(error);
      }
    };
    fetchAll();
  }, []);

  const navItems = [
    { to: '/admin', label: 'Overview', icon: FaChartBar, active: true },
    { to: '/admin/members', label: 'Members', icon: FaUsers },
    { to: '/admin/subscriptions', label: 'Subscriptions', icon: FaTag },
    { to: '/admin/products', label: 'Products', icon: FaBoxOpen },
    { to: '/admin/banners', label: 'Banners', icon: FaImage },
    { to: '/admin/payments', label: 'Payments', icon: FaMoneyBillWave },
    { to: '/admin/transactions', label: 'Transactions', icon: FaHistory }
  ];

  const cards = [
    { label: 'Total Members', value: stats.members, icon: FaUsers, color: 'from-primary-500 to-primary-700' },
    { label: 'Products', value: stats.products, icon: FaBoxOpen, color: 'from-neon-pink to-pink-700' },
    { label: 'Subscriptions', value: stats.subscriptions, icon: FaTag, color: 'from-neon-green to-green-700' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: FaMoneyBillWave, color: 'from-neon-yellow to-yellow-700' }
  ];

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">ADMIN <span className="text-primary-500">PANEL</span></h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-full hover:bg-red-500/20"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

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

        <div className="grid lg:grid-cols-3 gap-8">
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
              <Link to="/admin/members" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <FaUserPlus className="text-neon-green" />
                <span className="text-white font-medium">Add New Member</span>
              </Link>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">RECENT MEMBERS</h2>
              <Link to="/admin/members" className="text-primary-400 text-sm hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentMembers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No members yet</p>
              ) : (
                recentMembers.map((member) => (
                  <div key={member._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center text-white font-bold shrink-0">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{member.name}</p>
                      <p className="text-gray-500 text-xs truncate">{member.email}</p>
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                      <span className={`text-xs font-semibold ${
                        member.currentMembership?.status === 'active' ? 'text-neon-green' : 'text-gray-500'
                      }`}>
                        {member.currentMembership?.status || 'No membership'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {member.currentMembership ? `₹${member.currentMembership.totalAmount}` : '-'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="pb-8 flex justify-center">
        <Stickers count={4} />
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FaHistory, FaMoneyBillAlt, FaArrowLeft } from 'react-icons/fa';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    api.get('/members/me')
      .then((res) => {
        const memberships = res.data.memberships || [];
        const txs = [];
        memberships.forEach((m) => {
          const planName = m.subscription?.name || 'Plan';
          (m.renewals || []).forEach((r) => {
            txs.push({
              _id: r._id,
              plan: planName,
              date: r.date,
              amount: r.amount,
              method: r.method || m.paymentMethod || 'other',
              membershipId: m._id,
              status: m.status
            });
          });
        });
        txs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(txs);
      })
      .catch(() => {
        toast.error('Failed to load transactions');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const totalPaid = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const methods = [...new Set(transactions.map(t => t.method))];
  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.method === filter);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const methodLabel = (m) => m ? m.charAt(0).toUpperCase() + m.slice(1) : 'Other';

  return (
    <div className="min-h-screen pt-16 pb-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">
              TRANSACTIONS <span className="text-primary-500">HISTORY</span>
            </h1>
            <p className="text-gray-400 mt-1">Every settlement recorded on your account</p>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 text-sm font-medium rounded-full hover:bg-white/10"
          >
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-neon-green to-green-700 rounded-2xl p-6 text-white">
            <FaMoneyBillAlt className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">₹{totalPaid.toLocaleString('en-IN')}</p>
            <p className="text-sm opacity-80">Total Settled</p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
            <FaHistory className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">{transactions.length}</p>
            <p className="text-sm opacity-80">Total Transactions</p>
          </div>
          <div className="bg-gradient-to-br from-neon-yellow to-yellow-600 rounded-2xl p-6 text-white">
            <FaMoneyBillAlt className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">{methods.length}</p>
            <p className="text-sm opacity-80">Payment Methods</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-primary-600 to-neon-pink text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === m
                  ? 'bg-gradient-to-r from-primary-600 to-neon-pink text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {methodLabel(m)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No transactions yet</td></tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(t.date)}</td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{t.plan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-white/10 text-gray-300 text-xs font-semibold rounded-full uppercase">
                          {methodLabel(t.method)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-white font-bold">₹{Number(t.amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
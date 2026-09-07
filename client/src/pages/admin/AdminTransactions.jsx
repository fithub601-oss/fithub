import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';
import { FaMoneyBillWave, FaUserFriends, FaHistory, FaReceipt } from 'react-icons/fa';
import ReceiptModal from '../../components/ReceiptModal';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [receiptTx, setReceiptTx] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/ledger');
      setTransactions(res.data || []);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      !search ||
      (t.memberName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.plan || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.memberPhone || '').includes(search);
    const matchesFilter = filter === 'all' || t.method === filter;
    return matchesSearch && matchesFilter;
  });

  const methods = [...new Set(transactions.map(t => t.method))];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const methodLabel = (m) => m ? m.charAt(0).toUpperCase() + m.slice(1) : 'Other';

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-white">
            TRANSACTIONS <span className="text-neon-green">LEDGER</span>
          </h1>
          <p className="text-gray-400">Every membership settlement and paid store order</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-neon-green to-green-700 rounded-2xl p-6 text-white">
            <FaMoneyBillWave className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">₹{totalCollected.toLocaleString('en-IN')}</p>
            <p className="text-sm opacity-80">Total Collected</p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
            <FaHistory className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">{transactions.length}</p>
            <p className="text-sm opacity-80">Total Records</p>
          </div>
          <div className="bg-gradient-to-br from-neon-yellow to-yellow-600 rounded-2xl p-6 text-white">
            <FaUserFriends className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">{new Set(transactions.map(t => t.memberId)).size}</p>
            <p className="text-sm opacity-80">Members with Settlements</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search member, phone or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-white/10 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
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
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No transactions found</td></tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(t.memberName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{t.memberName}</p>
                            <p className="text-gray-500 text-xs">{t.memberPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300 text-sm">
                          {t.kind === 'order' && (
                            <span className="mr-1.5 px-2 py-0.5 bg-neon-pink/15 text-pink-600 text-[10px] font-bold rounded-full uppercase align-middle">Store</span>
                          )}
                          {t.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-white/10 text-gray-300 text-xs font-semibold rounded-full uppercase">
                          {methodLabel(t.method)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(t.date)}</td>
                      <td className="px-6 py-4 text-right text-white font-bold">₹{Number(t.amount).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setReceiptTx(t)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-neon-pink text-white text-xs font-bold rounded-full hover:opacity-90 transition-opacity"
                        >
                          <FaReceipt /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ReceiptModal
        open={!!receiptTx}
        onClose={() => setReceiptTx(null)}
        type={receiptTx?.kind === 'order' ? 'order' : 'membership'}
        data={receiptTx?.kind === 'order' ? receiptTx.order : receiptTx}
        user={receiptTx ? { name: receiptTx.memberName, email: receiptTx.memberEmail, phone: receiptTx.memberPhone } : null}
      />
    </div>
  );
};

export default AdminTransactions;
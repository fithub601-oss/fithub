import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';
import { FaMoneyBillWave } from 'react-icons/fa';

const AdminPayments = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data);
    } catch (error) {
      toast.error('Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/members/${showPaymentModal.user._id}/payment`, {
        membershipId: showPaymentModal._id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method
      });
      toast.success('Payment recorded!');
      setShowPaymentModal(null);
      setPaymentForm({ amount: '', method: 'cash' });
      fetchData();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const membersWithPayments = members.filter(m => m.currentMembership);
  const filtered = filter === 'all'
    ? membersWithPayments
    : filter === 'paid'
      ? membersWithPayments.filter(m => m.currentMembership.paymentStatus === 'paid')
      : filter === 'partial'
        ? membersWithPayments.filter(m => m.currentMembership.paymentStatus === 'partial')
        : membersWithPayments.filter(m => m.currentMembership.paymentStatus === 'pending');

  const totalCollected = members.reduce((sum, m) => sum + (m.currentMembership?.amountPaid || 0), 0);
  const totalDue = members.reduce((sum, m) => sum + (m.currentMembership?.amountRemaining || 0), 0);

  const modalInputs = 'w-full px-3 py-2 bg-dark-900 border border-white/10 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none';
  const modalLabel = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="min-h-screen pt-16 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-white mb-2">PAYMENTS <span className="text-neon-green">TRACKING</span></h1>
          <p className="text-gray-400">Track membership fees paid and remaining</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-neon-green to-green-700 rounded-2xl p-6 text-white">
            <FaMoneyBillWave className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">₹{totalCollected.toLocaleString('en-IN')}</p>
            <p className="text-sm opacity-80">Total Collected</p>
          </div>
          <div className="bg-gradient-to-br from-neon-yellow to-yellow-600 rounded-2xl p-6 text-white">
            <FaMoneyBillWave className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">₹{totalDue.toLocaleString('en-IN')}</p>
            <p className="text-sm opacity-80">Total Due</p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
            <FaMoneyBillWave className="text-2xl mb-2 opacity-80" />
            <p className="font-display text-3xl">{membersWithPayments.length}</p>
            <p className="text-sm opacity-80">Members with Plans</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'paid', label: 'Fully Paid' },
            { key: 'partial', label: 'Partial' },
            { key: 'pending', label: 'No Payment' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-gradient-to-r from-primary-600 to-neon-pink text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-dark-800 rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Remaining</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400">No records found</td></tr>
                ) : (
                  filtered.map((member) => {
                    const m = member.currentMembership;
                    const pct = m.totalAmount > 0 ? (m.amountPaid / m.totalAmount) * 100 : 0;
                    return (
                      <tr key={m._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center text-white font-bold shrink-0">
                              {member.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{member.name}</p>
                              <p className="text-gray-500 text-xs">{member.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-300 text-sm">{m.subscription?.name}</p>
                        </td>
                        <td className="px-6 py-4 text-white font-medium">₹{m.totalAmount}</td>
                        <td className="px-6 py-4 text-neon-green font-medium">₹{m.amountPaid}</td>
                        <td className="px-6 py-4">
                          {m.amountRemaining > 0 ? (
                            <span className="text-neon-yellow font-medium">₹{m.amountRemaining}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full ${m.paymentStatus === 'paid' ? 'bg-neon-green' : m.paymentStatus === 'partial' ? 'bg-neon-yellow' : 'bg-red-400'}`} style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className={`text-xs font-bold ${
                              m.paymentStatus === 'paid' ? 'text-neon-green' : m.paymentStatus === 'partial' ? 'text-neon-yellow' : 'text-red-400'
                            }`}>
                              {m.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {m.amountRemaining > 0 && (
                            <button
                              onClick={() => setShowPaymentModal(m)}
                              className="px-4 py-2 bg-neon-green/20 text-neon-green text-sm font-semibold rounded-full hover:bg-neon-green/30"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-dark-800 rounded-2xl p-6 max-w-sm w-full border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm">Plan: <span className="text-white">{showPaymentModal.subscription?.name}</span></p>
              <p className="text-gray-400 text-sm">Total: <span className="text-white font-semibold">₹{showPaymentModal.totalAmount}</span></p>
              <p className="text-gray-400 text-sm">Paid: <span className="text-neon-green font-semibold">₹{showPaymentModal.amountPaid}</span></p>
              <p className="text-gray-400 text-sm">Remaining: <span className="text-neon-yellow font-semibold">₹{showPaymentModal.amountRemaining}</span></p>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className={modalLabel}>Amount to Record (₹)</label>
                <input
                  type="number"
                  required
                  max={showPaymentModal.amountRemaining}
                  className={modalInputs}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className={modalLabel}>Method</label>
                <select className={modalInputs} value={paymentForm.method} onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(null)} className="flex-1 py-2.5 bg-white/5 text-white rounded-full hover:bg-white/10">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-neon-green to-green-600 text-slate-900 font-semibold rounded-full">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;

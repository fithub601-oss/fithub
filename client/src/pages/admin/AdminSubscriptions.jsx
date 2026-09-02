import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import { FaEdit, FaTrash, FaPlus, FaStar } from 'react-icons/fa';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', duration: 1, durationUnit: 'month',
    price: '', features: '', isPopular: false, isActive: true
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions/all');
      setSubscriptions(res.data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const features = form.features.split(',').map(f => f.trim()).filter(Boolean);
    const data = { ...form, features, price: Number(form.price), duration: Number(form.duration) };

    try {
      if (editing) {
        await api.put(`/subscriptions/${editing._id}`, data);
        toast.success('Subscription updated!');
      } else {
        await api.post('/subscriptions', data);
        toast.success('Subscription created!');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subscription');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscription?')) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      toast.success('Subscription deleted');
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (sub) => {
    setEditing(sub);
    setForm({
      name: sub.name,
      description: sub.description || '',
      duration: sub.duration,
      durationUnit: sub.durationUnit,
      price: sub.price,
      features: sub.features.join(', '),
      isPopular: sub.isPopular,
      isActive: sub.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', duration: 1, durationUnit: 'month',
      price: '', features: '', isPopular: false, isActive: true
    });
  };

  const modalInputs = 'w-full px-3 py-2 bg-dark-900 border border-white/10 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none';
  const modalLabel = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="min-h-screen pt-16 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">SUBSCRIPTION <span className="text-primary-500">PLANS</span></h1>
            <p className="text-gray-400 mt-1">{subscriptions.length} plans available</p>
          </div>
          <button
            onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90"
          >
            <FaPlus /> New Plan
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-400 py-20">Loading...</div>
          ) : subscriptions.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20">No plans yet. Create your first one!</div>
          ) : (
            subscriptions.map((sub, i) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`relative rounded-2xl p-6 border ${
                  sub.isPopular
                    ? 'bg-gradient-to-b from-primary-900/60 to-dark-800 border-primary-500/40'
                    : 'bg-dark-800 border-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-xl">{sub.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      sub.isActive ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {sub.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  {sub.isPopular && <FaStar className="text-neon-yellow text-xl" />}
                </div>
                <p className="text-gray-400 text-sm mb-3">{sub.description}</p>
                <div className="mb-4">
                  <span className="font-display text-3xl text-white">₹{sub.price}</span>
                  <span className="text-gray-400 text-sm"> / {sub.duration} {sub.durationUnit}{sub.duration > 1 ? 's' : ''}</span>
                </div>
                <ul className="space-y-1.5 mb-6">
                  {sub.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-neon-green">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(sub)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-600/20 text-primary-400 rounded-full hover:bg-primary-600/30"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-dark-800 rounded-2xl p-6 max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">{editing ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={modalLabel}>Plan Name</label>
                  <input type="text" required className={modalInputs} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Gold Membership" />
                </div>
                <div>
                  <label className={modalLabel}>Price (₹)</label>
                  <input type="number" required className={modalInputs} value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="e.g. 1500" />
                </div>
              </div>
              <div>
                <label className={modalLabel}>Description</label>
                <textarea className={modalInputs} rows="2" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Short description of the plan" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={modalLabel}>Duration</label>
                  <input type="number" required className={modalInputs} value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} min="1" />
                </div>
                <div>
                  <label className={modalLabel}>Duration Unit</label>
                  <select className={modalInputs} value={form.durationUnit} onChange={(e) => setForm({...form, durationUnit: e.target.value})}>
                    <option value="day">Day(s)</option>
                    <option value="week">Week(s)</option>
                    <option value="month">Month(s)</option>
                    <option value="year">Year(s)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={modalLabel}>Features (comma separated)</label>
                <textarea className={modalInputs} rows="3" value={form.features} onChange={(e) => setForm({...form, features: e.target.value})} placeholder="Access to gym, Free trainer, Locker facility..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({...form, isPopular: e.target.checked})} className="accent-primary-500" />
                  Popular plan
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="accent-primary-500" />
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white/5 text-white rounded-full hover:bg-white/10">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-semibold rounded-full">
                  {editing ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;

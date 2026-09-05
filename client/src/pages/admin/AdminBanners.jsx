import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', image: '', buttonText: 'Learn More',
    buttonLink: '/subscriptions', position: 'hero', isActive: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners/all');
      setBanners(res.data);
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/banners/${editing._id}`, form);
        toast.success('Banner updated!');
      } else {
        await api.post('/banners', form);
        toast.success('Banner created!');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchBanners();
    } catch (error) {
      toast.error('Failed to save banner');
    }
  };

  const handleToggle = async (b) => {
    try {
      await api.put(`/banners/${b._id}`, { ...b, isActive: !b.isActive });
      fetchBanners();
    } catch (error) {
      toast.error('Failed to toggle banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title, description: b.description || '', image: b.image || '',
      buttonText: b.buttonText || 'Learn More', buttonLink: b.buttonLink || '/subscriptions',
      position: b.position, isActive: b.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      title: '', description: '', image: '', buttonText: 'Learn More',
      buttonLink: '/subscriptions', position: 'hero', isActive: true
    });
  };

  const modalInputs = 'w-full px-3 py-2 bg-dark-900 border border-white/10 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none';
  const modalLabel = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="min-h-screen pt-16 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">MARKETING <span className="text-neon-yellow">BANNERS</span></h1>
            <p className="text-gray-400 mt-1">{banners.length} banners</p>
          </div>
          <button
            onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-yellow to-yellow-500 text-slate-900 font-bold rounded-full hover:opacity-90"
          >
            <FaPlus /> Add Banner
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading...</div>
          ) : banners.length === 0 ? (
            <div className="text-center text-gray-400 py-20">No banners yet. Create your first marketing banner!</div>
          ) : (
            banners.map((b, i) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-dark-800 rounded-2xl overflow-hidden border border-white/5"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                    {b.image ? (
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <div className="text-5xl mb-2">📢</div>
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-neon-yellow bg-neon-yellow/10 px-2 py-1 rounded-full">{b.position.toUpperCase()}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          b.isActive ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {b.isActive ? 'ACTIVE' : 'HIDDEN'}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-xl mb-2">{b.title}</h3>
                      {b.description && <p className="text-gray-400 text-sm mb-3">{b.description}</p>}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Button: <span className="text-gray-300">{b.buttonText}</span></span>
                        <span>Link: <span className="text-gray-300">{b.buttonLink}</span></span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleToggle(b)} className="px-4 py-2 bg-white/5 text-white rounded-full text-sm hover:bg-white/10">
                        {b.isActive ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => openEdit(b)} className="px-4 py-2 bg-primary-600/20 text-primary-400 rounded-full text-sm hover:bg-primary-600/30">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDelete(b._id)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/30">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
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
              <h2 className="text-white font-bold text-xl">{editing ? 'Edit Banner' : 'Create Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={modalLabel}>Banner Title</label>
                <input type="text" required className={modalInputs} value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g. Summer Special Discount!" />
              </div>
              <div>
                <label className={modalLabel}>Description</label>
                <textarea className={modalInputs} rows="2" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Short promotional text" />
              </div>
              <div>
                <label className={modalLabel}>Image URL</label>
                <input type="text" className={modalInputs} value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={modalLabel}>Button Text</label>
                  <input type="text" className={modalInputs} value={form.buttonText} onChange={(e) => setForm({...form, buttonText: e.target.value})} placeholder="Learn More" />
                </div>
                <div>
                  <label className={modalLabel}>Button Link</label>
                  <input type="text" className={modalInputs} value={form.buttonLink} onChange={(e) => setForm({...form, buttonLink: e.target.value})} placeholder="/subscriptions" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={modalLabel}>Position</label>
                  <select className={modalInputs} value={form.position} onChange={(e) => setForm({...form, position: e.target.value})}>
                    <option value="hero">Hero Section</option>
                    <option value="midpage">Mid Page</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer pb-2">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="accent-primary-500" />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white/5 text-white rounded-full hover:bg-white/10">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-neon-yellow to-yellow-500 text-slate-900 font-semibold rounded-full">
                  {editing ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;

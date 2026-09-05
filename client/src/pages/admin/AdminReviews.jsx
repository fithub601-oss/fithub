import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import { FaTrash, FaEyeSlash, FaEye, FaSearch } from 'react-icons/fa';
import Stickers from '../../components/Stickers';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/all');
      setReviews(res.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleStatus = async (review) => {
    const next = review.status === 'approved' ? 'hidden' : 'approved';
    try {
      const res = await api.put(`/reviews/${review._id}`, { status: next });
      toast.success(next === 'approved' ? 'Review approved & visible to members' : 'Review hidden');
      setReviews(prev => prev.map(r => (r._id === review._id ? res.data : r)));
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const filtered = reviews.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (r.user?.name || r.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">REVIEW <span className="text-primary-500">MANAGEMENT</span></h1>
            <p className="text-gray-400 mt-1">{reviews.length} total reviews · {reviews.filter(r => r.status === 'approved').length} visible</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'approved', 'hidden'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                  filter === f ? 'bg-gradient-to-r from-primary-600 to-neon-pink text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member name..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="text-center text-gray-400 py-20 bg-white rounded-2xl">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-20 bg-white rounded-2xl">
            <div className="text-5xl mb-3">⭐</div>
            No reviews found. Reviews submitted by members will appear here.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className={`bg-white rounded-2xl p-5 border ${r.status === 'hidden' ? 'border-white/10 opacity-70' : 'border-white/5'} shadow-soft`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center text-white font-bold shrink-0">
                      {(r.user?.name || r.name || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{r.user?.name || r.name}</p>
                      <p className="text-gray-500 text-xs truncate">{r.user?.email || 'Member'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {[...Array(5)].map((_, s) => (
                      <span key={s} className={`text-sm ${s < r.rating ? 'text-neon-yellow' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">"{r.comment}"</p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      r.status === 'approved' ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatus(r)}
                      title={r.status === 'approved' ? 'Hide review' : 'Approve review'}
                      className={`p-2 rounded-lg transition-colors ${r.status === 'approved' ? 'hover:bg-amber-500/20 text-neon-yellow' : 'hover:bg-neon-green/20 text-neon-green'}`}
                    >
                      {r.status === 'approved' ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      title="Delete review"
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="pb-8 flex justify-center">
        <Stickers count={4} />
      </div>
    </div>
  );
};

export default AdminReviews;
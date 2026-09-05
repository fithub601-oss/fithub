import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import Modal from '../../components/Modal';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', stockQuantity: '',
    category: 'supplement', image: '', isAvailable: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/all');
      setProducts(res.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      sizes: typeof form.sizes === 'string'
        ? form.sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
        : (form.sizes || [])
    };
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, data);
        toast.success('Product updated!');
      } else {
        await api.post('/products', data);
        toast.success('Product created!');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stockQuantity: p.stockQuantity,
      category: p.category,
      image: p.image || '',
      sizes: (p.sizes || []).join(', '),
      isAvailable: p.isAvailable
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', price: '', stockQuantity: '',
category: 'supplement', image: '', sizes: '', isAvailable: true
    });
  };

  const updateStock = async (id, newQty) => {
    try {
      const p = products.find(x => x._id === id);
      await api.put(`/products/${id}`, { ...p, stockQuantity: newQty });
      setProducts(products.map(x => x._id === id ? { ...x, stockQuantity: newQty } : x));
      toast.success('Stock updated');
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const modalInputs = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400';
  const modalLabel = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';

  const catEmoji = { supplement: '💊', equipment: '🏋️', apparel: '👕', accessory: '🎒', other: '📦' };

  return (
    <div className="min-h-screen pt-16 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">PRODUCTS <span className="text-neon-pink">INVENTORY</span></h1>
            <p className="text-gray-400 mt-1">{products.length} products in store</p>
          </div>
          <button
            onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-pink to-pink-600 text-white font-bold rounded-full hover:opacity-90"
          >
            <FaPlus /> Add Product
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-400 py-20">Loading...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20">No products yet</div>
          ) : (
            products.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`bg-dark-800 rounded-2xl overflow-hidden border ${p.isAvailable ? 'border-white/5' : 'border-red-500/30'}`}
              >
                <div className="h-40 bg-slate-50 p-2 flex items-center justify-center">
                  {p.image ? (
                    <button onClick={() => setImageModal(p)} className="w-full h-full p-0 border-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                    </button>
                  ) : (
                    <span className="text-5xl opacity-30">{catEmoji[p.category]}</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-primary-400 uppercase">{p.category}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.isAvailable ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {p.isAvailable ? 'AVAILABLE' : 'HIDDEN'}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{p.name}</h3>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-xl text-white">₹{p.price}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateStock(p._id, Math.max(0, p.stockQuantity - 1))} className="w-6 h-6 bg-white/10 rounded hover:bg-white/20 text-white">-</button>
                      <span className={`text-sm font-semibold w-8 text-center ${p.stockQuantity <= 5 ? 'text-neon-yellow' : 'text-white'}`}>{p.stockQuantity}</span>
                      <button onClick={() => updateStock(p._id, p.stockQuantity + 1)} className="w-6 h-6 bg-white/10 rounded hover:bg-white/20 text-white">+</button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary-600/20 text-primary-400 rounded-full text-sm hover:bg-primary-600/30">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {imageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setImageModal(null)}>
          <div className="max-w-3xl w-full relative">
            <img src={imageModal.image} alt={imageModal.name} className="w-full rounded-3xl shadow-2xl" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-white rounded-full shadow-lift font-medium text-slate-900 whitespace-nowrap">
              {imageModal.name}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        subtitle={editing ? 'Update product details' : 'List a new store item'}
        icon={<FaPlus />}
        iconBg="bg-gradient-to-br from-neon-pink to-pink-600"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={modalLabel}>Product Name</label>
                  <input type="text" required className={modalInputs} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Whey Protein" />
                </div>
                <div>
                  <label className={modalLabel}>Price (₹)</label>
                  <input type="number" required className={modalInputs} value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <label className={modalLabel}>Stock Quantity</label>
                  <input type="number" required className={modalInputs} value={form.stockQuantity} onChange={(e) => setForm({...form, stockQuantity: e.target.value})} placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className={modalLabel}>Description</label>
                  <textarea className={modalInputs} rows="2" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Product description" />
                </div>
                <div>
                  <label className={modalLabel}>Category</label>
                  <select className={modalInputs} value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                    <option value="supplement">Supplement</option>
                    <option value="equipment">Equipment</option>
                    <option value="apparel">Apparel</option>
                    <option value="accessory">Accessory</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={modalLabel}>Image URL</label>
                  <input type="text" className={modalInputs} value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className={modalLabel}>Sizes (comma-separated, leave empty if none)</label>
                  <input type="text" className={modalInputs} value={form.sizes || ''} onChange={(e) => setForm({...form, sizes: e.target.value})} placeholder="S, M, L, XL" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({...form, isAvailable: e.target.checked})} className="accent-primary-500" />
                    Show on website
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-neon-pink to-pink-600 text-white font-semibold rounded-full">
                  {editing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;

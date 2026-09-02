import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', 'supplement', 'equipment', 'apparel', 'accessory', 'other'];
  const filtered = category === 'all' ? products : products.filter(p => p.category === category);

  return (
    <div className="min-h-screen pt-16 bg-dark-900">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl text-white mb-3">GYM <span className="text-neon-pink">STORE</span></h1>
            <p className="text-gray-400">Everything you need for your fitness journey</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-primary-600 to-neon-pink text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-20">No products found in this category</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-dark-800 rounded-2xl overflow-hidden border border-white/5 hover:border-primary-500/30 transition-colors group"
                >
                  <div className="h-48 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-6xl opacity-30">
                        {product.category === 'supplement' ? '💊' : product.category === 'equipment' ? '🏋️' : product.category === 'apparel' ? '👕' : '🎒'}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-primary-400 uppercase tracking-wide">{product.category}</span>
                      {product.stockQuantity <= 5 && (
                        <span className="text-xs text-neon-yellow">Only {product.stockQuantity} left!</span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl text-white">₹{product.price}</span>
                      {product.stockQuantity > 0 ? (
                        <span className="text-xs text-neon-green font-medium">In Stock</span>
                      ) : (
                        <span className="text-xs text-red-400 font-medium">Out of Stock</span>
                      )}
                    </div>
                    <button
                      disabled={product.stockQuantity <= 0}
                      className="w-full mt-4 py-2 bg-gradient-to-r from-primary-600 to-neon-pink text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {product.stockQuantity > 0 ? 'Add to Cart' : 'Unavailable'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;

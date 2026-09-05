import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import api from '../api';
import { useCart } from '../context/CartContext';
import Stickers from '../components/Stickers';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(null);
  const [selectedSize, setSelectedSize] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isTShirt = (product) =>
    (product.sizes && product.sizes.length > 0) ||
    product.category === 'apparel' ||
    /t-?shirt|tee/i.test(product.name || '');

  const handleAddToCart = (product, size) => {
    addToCart(product, 1, size);
    setJustAdded(product._id);
    toast.success(size ? `${product.name} (${size}) added to cart! 🛒` : `${product.name} added to cart! 🛒`);
    setTimeout(() => setJustAdded(null), 1200);
  };

  const categories = ['all', 'supplement', 'equipment', 'apparel', 'accessory', 'other'];
  const filtered = category === 'all' ? products : products.filter(p => p.category === category);

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="kicker">FITHUB STORE</span>
            <h1 className="font-display text-5xl text-slate-900 mb-3">GYM <span className="text-neon-pink">ESSENTIALS</span></h1>
            <p className="text-slate-500">Everything you need for your fitness journey — gear, supplements & more</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-primary-600 to-neon-pink text-white shadow-glow'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600'
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
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="relative aspect-square bg-slate-50 overflow-hidden p-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-30">
                          {product.category === 'supplement' ? '💊' : product.category === 'equipment' ? '🏋️' : product.category === 'apparel' ? '👕' : '🎒'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur text-primary-600 text-xs font-semibold capitalize shadow-soft">
                        {product.category}
                      </span>
                    </div>
                    {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                      <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-soft">
                        {product.stockQuantity} left
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-slate-900 font-semibold mb-1.5 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display text-2xl text-slate-900">₹{product.price}</span>
                      {product.stockQuantity > 0 ? (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">In Stock</span>
                      ) : (
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">Out of Stock</span>
                      )}
                    </div>
                    {isTShirt(product) && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Select Size {isTShirt(product) && !selectedSize[product._id] && <span className="text-red-500 normal-case tracking-normal">(required)</span>}
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {(product.sizes && product.sizes.length ? product.sizes : ['S', 'M', 'L', 'XL']).map((s) => (
                            <button
                              key={s}
                              onClick={() => setSelectedSize({ ...selectedSize, [product._id]: s })}
                              className={`py-2 rounded-xl border text-sm font-bold transition-all ${
                                selectedSize[product._id] === s
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-glow'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      disabled={product.stockQuantity <= 0 || (isTShirt(product) && !selectedSize[product._id])}
                      onClick={() => handleAddToCart(product, selectedSize[product._id])}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {product.stockQuantity <= 0 ? (
                        'Unavailable'
                      ) : isTShirt(product) && !selectedSize[product._id] ? (
                        'Select a Size'
                      ) : justAdded === product._id ? (
                        <><FaCheck /> Added!</>
                      ) : (
                        <><FaShoppingCart /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="pb-10 flex justify-center">
        <Stickers count={4} />
      </div>
    </div>
  );
};

export default Products;

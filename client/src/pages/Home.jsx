import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPen, FaTrash, FaPlus, FaCheck } from 'react-icons/fa';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Stickers from '../components/Stickers';

const DEFAULT_PLAN = {
  goal: 'GOAL: -5 kg',
  workouts: [
    { id: 1, name: 'Warm-up · Cardio', info: '10 min', done: true },
    { id: 2, name: 'Deadlift', info: '4 × 5 reps', done: false },
    { id: 3, name: 'Bench Press', info: '4 × 6 reps', done: false },
    { id: 4, name: 'Squat', info: '3 × 8 reps', done: false },
    { id: 5, name: 'Core & Stretch', info: '15 min', done: false }
  ]
};

const cloneDefaultPlan = () => ({
  goal: DEFAULT_PLAN.goal,
  workouts: DEFAULT_PLAN.workouts.map(w => ({ ...w }))
});

const Home = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [plan, setPlan] = useState(cloneDefaultPlan);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInfo, setNewInfo] = useState('');

  const planKey = user?._id ? `fithub_plan_${user._id}` : 'fithub_plan_guest';

  useEffect(() => {
    api.get('/banners').then(res => setBanners(res.data)).catch(() => {});
    api.get('/subscriptions').then(res => setSubscriptions(res.data.slice(0, 3))).catch(() => {});
    if (user) {
      api.get('/orders/me').then(res => setOrders(res.data.slice(0, 3))).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(planKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlan({
          goal: parsed.goal || DEFAULT_PLAN.goal,
          workouts: Array.isArray(parsed.workouts) ? parsed.workouts : DEFAULT_PLAN.workouts.slice()
        });
      } else {
        setPlan(cloneDefaultPlan());
      }
    } catch {
      setPlan(cloneDefaultPlan());
    }
    setEditMode(false);
  }, [planKey]);

  useEffect(() => {
    try { localStorage.setItem(planKey, JSON.stringify(plan)); } catch {}
  }, [plan, planKey]);

  const toggleDone = (id) =>
    setPlan(p => ({ ...p, workouts: p.workouts.map(w => w.id === id ? { ...w, done: !w.done } : w) }));

  const updateField = (id, field, value) =>
    setPlan(p => ({ ...p, workouts: p.workouts.map(w => w.id === id ? { ...w, [field]: value } : w) }));

  const removeWorkout = (id) =>
    setPlan(p => ({ ...p, workouts: p.workouts.filter(w => w.id !== id) }));

  const addWorkout = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setPlan(p => ({
      ...p,
      workouts: [...p.workouts, { id: Date.now(), name: newName.trim(), info: newInfo.trim() || '1 × 10 reps', done: false }]
    }));
    setNewName('');
    setNewInfo('');
  };

  const resetPlan = () => { setPlan(cloneDefaultPlan()); };

  const doneCount = plan.workouts.filter(w => w.done).length;
  const progressPct = plan.workouts.length ? Math.round((doneCount / plan.workouts.length) * 100) : 0;

  const heroBanners = banners.filter(b => b.position === 'hero');
  const midBanners = banners.filter(b => b.position === 'midpage');

  const features = [
    { emoji: '💪', title: 'Modern Equipment', desc: 'Top-tier machines and free weights for every workout', color: 'from-orange-500 to-amber-500' },
    { emoji: '🧑‍🏫', title: 'Expert Trainers', desc: 'Certified coaches who push you to the next level', color: 'from-red-500 to-orange-500' },
    { emoji: '📱', title: 'Easy Management', desc: 'Manage your membership and payments online', color: 'from-amber-500 to-yellow-500' },
    { emoji: '🛍️', title: 'Gym Store', desc: 'Supplements, apparel, and accessories at the gym', color: 'from-orange-500 to-red-500' },
    { emoji: '🎯', title: 'Custom Programs', desc: 'Personalized workout plans for your goals', color: 'from-red-600 to-amber-500' },
    { emoji: '🔥', title: 'Community Vibes', desc: 'Join a motivated community that never quits', color: 'from-amber-400 to-orange-600' }
  ];

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(249,115,22,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239,68,68,0.15) 0%, transparent 50%)'
        }}></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {heroBanners.length > 0 && (
                <div className="mb-5">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-orange-200 text-orange-600 text-sm font-semibold rounded-full shadow-soft">
                    🔥 {heroBanners[0].title}
                  </span>
                </div>
              )}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-slate-900 leading-[1.05] mb-6">
                TRAIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">BEAST</span><br />
                MODE <span className="text-amber-500">ON</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                Join the FITHUB fam where gym vibes meet today's energy. From memberships
                to merch — everything you need to level up, all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity text-lg shadow-glow"
                  >
                    My Dashboard 💪
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity text-lg shadow-glow"
                  >
                    Get Started 💪
                  </Link>
                )}
                <Link
                  to="/subscriptions"
                  className="px-8 py-3 bg-white text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors text-lg border border-slate-200 shadow-soft"
                >
                  View Plans
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-4 sm:gap-6 flex-wrap">
                <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-soft">
                  <p className="font-display text-3xl text-orange-500">500+</p>
                  <p className="text-xs text-slate-500 mt-0.5">Active Members</p>
                </div>
                <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-soft">
                  <p className="font-display text-3xl text-red-500">15+</p>
                  <p className="text-xs text-slate-500 mt-0.5">Expert Trainers</p>
                </div>
                <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-soft">
                  <p className="font-display text-3xl text-amber-500">6AM–10PM</p>
                  <p className="text-xs text-slate-500 mt-0.5">Open Mon–Sat</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md">
                <div className="w-72 h-72 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-15 blur-3xl absolute inset-0 m-auto"></div>
                <div className="relative bg-white backdrop-blur-xl border border-slate-100 rounded-3xl p-6 shadow-lift">
                  <div className="flex items-center justify-between mb-5">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                        Today's Plan {!editMode && <span className="text-slate-300 normal-case">· {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}</span>}
                      </p>
                      <p className="font-display text-xl text-slate-900 truncate">
                        BEAST SESSION 💥
                        {!editMode && plan.goal && (
                          <span className="ml-2 align-middle px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap">{plan.goal}</span>
                        )}
                      </p>
                    </div>
                    {editMode ? (
                      <button onClick={() => setEditMode(false)} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0">
                        <FaCheck className="text-[10px]" /> Done
                      </button>
                    ) : (
                      <button onClick={() => setEditMode(true)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0">
                        <FaPen className="text-[10px]" /> Edit
                      </button>
                    )}
                  </div>

                  {editMode && (
                    <div className="mb-4">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wide mb-1.5">Goal</label>
                      <input
                        value={plan.goal}
                        onChange={(e) => setPlan(p => ({ ...p, goal: e.target.value }))}
                        placeholder="e.g. GOAL: -5 kg"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-orange-400"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    {plan.workouts.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-6">No workouts yet — add one below 💪</p>
                    )}
                    {plan.workouts.map((w, i) => (
                      <div key={w.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                        <button
                          onClick={() => toggleDone(w.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${w.done ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                          aria-label={w.done ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {w.done ? '✓' : i + 1}
                        </button>
                        {editMode ? (
                          <>
                            <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
                              <input
                                value={w.name}
                                onChange={(e) => updateField(w.id, 'name', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-orange-400"
                                placeholder="Exercise"
                              />
                              <input
                                value={w.info}
                                onChange={(e) => updateField(w.id, 'info', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-orange-400"
                                placeholder="Sets × Reps"
                              />
                            </div>
                            <button onClick={() => removeWorkout(w.id)} className="text-red-400 hover:text-red-500 p-1.5 shrink-0" aria-label="Remove workout">
                              <FaTrash className="text-xs" />
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${w.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{w.name}</p>
                            <p className="text-xs text-slate-400">{w.info}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {editMode && (
                    <form onSubmit={addWorkout} className="mt-4">
                      <div className="flex gap-2">
                        <input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="New exercise"
                          className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-800 text-sm outline-none focus:border-orange-400"
                        />
                        <input
                          value={newInfo}
                          onChange={(e) => setNewInfo(e.target.value)}
                          placeholder="3 × 10"
                          className="w-24 px-3 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-800 text-sm outline-none focus:border-orange-400"
                        />
                        <button type="submit" className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shrink-0" aria-label="Add workout">
                          <FaPlus />
                        </button>
                      </div>
                      <button type="button" onClick={resetPlan} className="mt-3 w-full text-xs text-slate-400 hover:text-red-500 transition-colors">
                        ↺ Reset to default plan
                      </button>
                    </form>
                  )}

                  <div className="mt-5">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span className="text-amber-500 font-semibold">{progressPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stickers */}
          <div className="mt-14 flex justify-center gap-3">
            <Stickers count={6} />
          </div>
        </div>
      </section>

      {/* MID-PAGE BANNERS */}
      {midBanners.length > 0 && (
        <section className="bg-slate-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {midBanners.map((b, i) => (
              <div key={b._id} className="mb-4 last:mb-0">
                {b.title && (
                  <div className="on-dark bg-gradient-to-r from-red-700 to-orange-600 border border-red-500/40 rounded-2xl p-6 flex items-center justify-between gap-4 shadow-card">
                    <div>
                      <h3 className="text-white font-bold text-xl">{b.title}</h3>
                      {b.description && <p className="text-gray-300 mt-1">{b.description}</p>}
                    </div>
                    {b.buttonText && (
                      <Link to={b.buttonLink || '/subscriptions'} className="px-6 py-2.5 bg-white text-orange-600 font-bold rounded-full hover:opacity-90 whitespace-nowrap shadow-soft">
                        {b.buttonText}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="kicker">WHY FITHUB</span>
            <h2 className="font-display text-4xl sm:text-5xl text-slate-900 mb-3">EVERYTHING YOU <span className="text-orange-500">NEED</span></h2>
            <p className="text-slate-500 max-w-xl mx-auto">We've built the complete fitness experience — gear, plans, and a community that shows up.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group bg-slate-50 rounded-3xl p-7 border border-slate-100 hover:bg-white hover:shadow-card hover:-translate-y-1.5 hover:border-orange-100 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-2xl mb-5 shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  {feat.emoji}
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR PLANS */}
      {subscriptions.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="kicker">MEMBERSHIP</span>
              <h2 className="font-display text-4xl sm:text-5xl text-slate-900 mb-3">POPULAR <span className="text-red-500">PLANS</span></h2>
              <p className="text-slate-500">Start your journey today — upgrade anytime</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {subscriptions.map((plan, i) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative rounded-3xl p-7 border transition-all duration-300 ${
                    plan.isPopular
                      ? 'bg-gradient-to-b from-orange-50 to-white border-orange-200 shadow-lift lg:-translate-y-3'
                      : 'bg-white border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-1'
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-soft flex items-center gap-1">
                      ⭐ MOST POPULAR
                    </span>
                  )}
                  <h3 className="text-slate-900 font-bold text-2xl mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-5 min-h-[40px]">{plan.description}</p>
                  <div className="mb-6">
                    <span className="font-display text-5xl text-slate-900">₹{plan.price}</span>
                    <span className="text-slate-500 text-sm"> / {plan.duration} {plan.durationUnit}{plan.duration > 1 ? 's' : ''}</span>
                  </div>
                  <ul className="space-y-3 mb-7">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/subscriptions`}
                    className="block w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full text-center hover:opacity-90 transition-opacity"
                  >
                    Choose Plan
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/subscriptions" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline inline-flex items-center gap-1">
                View all plans →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* RECENT ORDERS */}
      {user && orders.length > 0 && (
        <section className="bg-slate-50 py-20 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="kicker">YOUR ACCOUNT</span>
                <h2 className="font-display text-4xl sm:text-5xl text-slate-900 mb-2 mt-1">
                  RECENT <span className="text-orange-500">ORDERS</span>
                </h2>
                <p className="text-slate-500">Hey {user.name?.split(' ')[0]} — here's what you ordered lately</p>
              </div>
              <Link to="/orders" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline inline-flex items-center gap-1 shrink-0">
                View all →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Link to="/orders" className="block bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all h-full p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-display text-slate-900 font-bold">
                        ORDER <span className="text-orange-500">#{order._id.slice(-6).toUpperCase()}</span>
                      </p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                        {order.paymentStatus === 'paid' ? 'PAID' : order.paymentStatus === 'pending' ? 'PENDING' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-4">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {(order.items || []).length} item(s)
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex -space-x-2">
                        {(order.items || []).slice(0, 3).map((item, j) => (
                          <div key={j} className="w-9 h-9 rounded-xl bg-slate-50 border-2 border-white overflow-hidden aspect-square p-0.5">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain object-center" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">🛍</div>
                            )}
                          </div>
                        ))}
                        {(order.items || []).length > 3 && (
                          <div className="w-9 h-9 rounded-xl bg-orange-50 border-2 border-white flex items-center justify-center text-orange-600 text-xs font-bold">
                            +{(order.items || []).length - 3}
                          </div>
                        )}
                      </div>
                      <p className="font-display text-xl text-slate-900 font-bold">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(255,237,213,0.5) 0%, transparent 45%), radial-gradient(circle at 10% 80%, rgba(239,68,68,0.5) 0%, transparent 45%)'
        }}></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl sm:text-6xl text-white mb-4 leading-tight"
          >
            READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">MAKE CHANGES</span>?
          </motion.h2>
          <p className="text-orange-50 mb-8 text-lg">
            {user ? 'Your transformation is already underway — keep going!' : 'Your first step to a stronger you is one click away.'}
          </p>
          {user ? (
            <Link
              to="/products"
              className="inline-block px-12 py-4 bg-white text-orange-600 font-bold text-lg rounded-full hover:opacity-90 transition-opacity shadow-glow"
            >
              Shop Gym Gear 🛒
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block px-12 py-4 bg-white text-orange-600 font-bold text-lg rounded-full hover:opacity-90 transition-opacity shadow-glow"
            >
              Join FITHUB Now 🔥
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
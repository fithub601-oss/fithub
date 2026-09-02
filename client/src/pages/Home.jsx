import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import FITHUBLogo from '../components/FITHUBLogo';

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    api.get('/banners').then(res => setBanners(res.data)).catch(() => {});
    api.get('/subscriptions').then(res => setSubscriptions(res.data.slice(0, 3))).catch(() => {});
  }, []);

  const heroBanners = banners.filter(b => b.position === 'hero');
  const midBanners = banners.filter(b => b.position === 'midpage');

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-16 overflow-hidden bg-dark-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-dark-900 to-neon-pink/20"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.3) 0%, transparent 50%)'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {heroBanners.length > 0 && (
                <div className="mb-4">
                  <span className="inline-block px-4 py-1.5 bg-neon-green/20 text-neon-green text-sm font-semibold rounded-full">
                    🔥 {heroBanners[0].title}
                  </span>
                </div>
              )}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
                TRAIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-neon-pink">BEAST</span><br />
                MODE <span className="text-neon-yellow">ON</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Join the FITHUB fam where gym vibes meet today's energy. From memberships
                to merch — everything you need to level up, all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity text-lg"
                >
                  Get Started 💪
                </Link>
                <Link
                  to="/subscriptions"
                  className="px-8 py-3 bg-white/10 backdrop-blur text-white font-bold rounded-full hover:bg-white/20 transition-colors text-lg border border-white/20"
                >
                  View Plans
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8">
                <div>
                  <p className="font-display text-3xl text-neon-green">500+</p>
                  <p className="text-sm text-gray-400">Active Members</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-neon-pink">15+</p>
                  <p className="text-sm text-gray-400">Expert Trainers</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-neon-yellow">24/7</p>
                  <p className="text-sm text-gray-400">Fitness Access</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-primary-600 to-neon-pink opacity-20 blur-3xl absolute inset-0"></div>
                <FITHUBLogo size={350} theme="dark" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MID-PAGE BANNERS */}
      {midBanners.length > 0 && (
        <section className="bg-dark-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {midBanners.map((b, i) => (
              <div key={b._id} className="mb-4 last:mb-0">
                {b.title && (
                  <div className="bg-gradient-to-r from-primary-900 to-dark-800 border border-primary-700/30 rounded-xl p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-white font-bold text-xl">{b.title}</h3>
                      {b.description && <p className="text-gray-300 mt-1">{b.description}</p>}
                    </div>
                    {b.buttonText && (
                      <Link to={b.buttonLink || '/subscriptions'} className="px-6 py-2 bg-neon-green text-dark-900 font-bold rounded-full hover:opacity-90 whitespace-nowrap">
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
      <section className="bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-white mb-2">WHY <span className="text-primary-500">FITHUB</span>?</h2>
            <p className="text-gray-400">Everything you need to crush your fitness goals</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '💪', title: 'Modern Equipment', desc: 'Top-tier machines and free weights for every workout' },
              { emoji: '🧑‍🏫', title: 'Expert Trainers', desc: 'Certified coaches who push you to the next level' },
              { emoji: '📱', title: 'Easy Management', desc: 'Manage your membership and payments online' },
              { emoji: '🛍️', title: 'Gym Store', desc: 'Supplements, apparel, and accessories at the gym' },
              { emoji: '🎯', title: 'Custom Programs', desc: 'Personalized workout plans for your goals' },
              { emoji: '🔥', title: 'Community Vibes', desc: 'Join a motivated community that never quits' }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-800 rounded-2xl p-6 border border-white/5 hover:border-primary-500/40 transition-colors group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feat.emoji}</div>
                <h3 className="text-white font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR PLANS */}
      {subscriptions.length > 0 && (
        <section className="bg-dark-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl text-white mb-2">POPULAR <span className="text-neon-pink">PLANS</span></h2>
              <p className="text-gray-400">Start your journey today</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {subscriptions.map((plan, i) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`rounded-2xl p-6 border ${
                    plan.isPopular
                      ? 'bg-gradient-to-b from-primary-900/60 to-dark-800 border-primary-500/40 relative'
                      : 'bg-dark-900 border-white/5'
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon-green text-dark-900 text-xs font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  )}
                  <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="font-display text-4xl text-white">₹{plan.price}</span>
                    <span className="text-gray-400 text-sm"> / {plan.duration} {plan.durationUnit}{plan.duration > 1 ? 's' : ''}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-neon-green mt-0.5">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/subscriptions`}
                    className="block w-full py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full text-center hover:opacity-90 transition-opacity"
                  >
                    Choose Plan
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/subscriptions" className="text-primary-400 hover:text-primary-300 hover:underline">
                View all plans →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-dark-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl sm:text-5xl text-white mb-4"
          >
            READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-yellow">MAKE CHANGES</span>?
          </motion.h2>
          <p className="text-gray-400 mb-8">
            Your first step to a stronger you is one click away.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-neon-green to-neon-yellow text-dark-900 font-bold text-lg rounded-full hover:opacity-90 transition-opacity"
          >
            Join FITHUB Now 🔥
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

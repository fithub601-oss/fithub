import React from 'react';
import { motion } from 'framer-motion';
import Stickers from '../components/Stickers';

const About = () => {
  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h1 className="font-display text-5xl text-white mb-2">
                ABOUT <span className="text-primary-500">FITHUB</span>
              </h1>
              <p className="inline-block px-4 py-1.5 bg-gradient-to-r from-primary-600 to-neon-pink text-white text-sm font-bold rounded-full uppercase tracking-wide mb-6 shadow-glow">
                by Samarth Gym
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                FitHub by Samarth Gym isn't just a gym — it's a movement. We believe fitness should be
                accessible, fun, and tailored to the modern lifestyle. Whether you're a
                beginner taking your first steps or a seasoned athlete chasing PRs,
                we've got the space, the tools, and the community to support you.
              </p>
              <p className="text-gray-300 leading-relaxed mb-8">
                Powered by Samarth Gym, Goregaon East, our state-of-the-art facility, certified trainers,
                and vibrant community culture make working out something you'll actually look forward to.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {['A', 'B', 'C', 'D'].map((letter, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center text-white font-bold border-2 border-slate-900"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white font-bold">Our Growing Team</p>
                  <p className="text-sm text-gray-400">Certified professionals</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative text-center">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-orange-500 to-red-500 opacity-20 blur-3xl absolute inset-0"></div>
                <div className="relative">
                  <p className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 text-amber-300 text-xs font-bold rounded-full uppercase tracking-widest mb-6">Est. 2024</p>
                  <p>
                    <span className="font-display text-8xl text-white tracking-wider block">FIT</span>
                    <span className="font-display text-8xl tracking-wider block bg-gradient-to-r from-orange-400 via-red-400 to-amber-300 bg-clip-text text-transparent">HUB</span>
                  </p>
                  <p className="text-sm mt-3">
                    <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-gray-200 uppercase tracking-[0.2em] text-[11px] font-bold">by SAMARTH GYM</span>
                  </p>
                  <p className="text-gray-400 text-sm mt-4">Train Beast Mode. On.</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              { num: '01', title: 'Our Mission', desc: 'Make high-quality fitness training accessible to everyone in our community.' },
              { num: '02', title: 'Our Vision', desc: 'Build the most vibrant fitness community where every member feels like family.' },
              { num: '03', title: 'Our Values', desc: 'Consistency, community, and results. We push each other to be better every day.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-primary-400/40 transition-colors"
              >
                <span className="font-display text-4xl text-primary-500/30">{item.num}</span>
                <h3 className="text-white font-bold text-xl mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { stat: '500+', label: 'Active Members', border: 'border-primary-500/40' },
              { stat: '15+', label: 'Expert Trainers', border: 'border-neon-green/40' },
              { stat: '50+', label: 'Equipment Types', border: 'border-neon-pink/40' },
              { stat: '5+', label: 'Years of Experience', border: 'border-neon-yellow/40' }
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-2xl p-6 text-center border ${s.border}`}
              >
                <p className="font-display text-4xl text-white mb-1">{s.stat}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <div className="pb-10 flex justify-center">
        <Stickers count={4} />
      </div>
    </div>
  );
};

export default About;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-16 bg-dark-900">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl text-white mb-3">GET IN <span className="text-neon-green">TOUCH</span></h1>
            <p className="text-gray-400">Have questions? We'd love to hear from you.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-8 border border-white/5 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="+91 12345 67890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select type</option>
                      <option value="membership">Membership</option>
                      <option value="products">Products</option>
                      <option value="training">Personal Training</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                <h3 className="text-white font-bold mb-4 text-lg">Contact Information</h3>
                <div className="space-y-4">
                  {[
                    { icon: '📍', title: 'Visit Us', desc: '123 Fitness Street, Your City, Your Country' },
                    { icon: '📞', title: 'Call Us', desc: '+91 12345 67890' },
                    { icon: '✉️', title: 'Email Us', desc: 'info@fithub.com' },
                    { icon: '🕐', title: 'Working Hours', desc: 'Mon - Sat: 6:00 AM - 10:00 PM\\nSun: Closed' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-neon-pink/50 flex items-center justify-center text-lg shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-900/40 to-dark-800 rounded-2xl p-6 border border-primary-500/30">
                <h3 className="text-white font-bold mb-2">💪 Free Trial Visit</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Come for a free day pass and see what we're about!
                </p>
                <a href="tel:+911234567890" className="inline-block px-6 py-2 bg-neon-green text-dark-900 font-bold rounded-full hover:opacity-90">
                  Book Now
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

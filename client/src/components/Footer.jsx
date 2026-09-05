import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="on-dark bg-slate-900 mt-auto relative">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-red-500 to-amber-400"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-baseline gap-0.5 mb-4">
              <span className="font-display text-2xl tracking-wider text-white">FIT</span>
              <span className="font-display text-2xl tracking-wider bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">HUB</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your transformation starts here. Train hard, stay consistent, become unstoppable.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              <span className="text-primary-400 mr-1.5">✦</span>Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/subscriptions" className="hover:text-primary-400 transition-colors">Subscriptions</Link></li>
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">Products</Link></li>
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              <span className="text-primary-400 mr-1.5">✉</span>Contact Us
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <a href="mailto:fithub601@gmail.com" className="hover:text-primary-400 transition-colors break-all">✉️ fithub601@gmail.com</a>
              </li>
              <li>🕐 Mon-Sat: 6AM - 10PM</li>
              <li>
                <a href="https://maps.app.goo.gl/fepBVnyZzEzjiQuk6" target="_blank" rel="noreferrer" className="hover:text-primary-400 transition-colors">📍 View Location on Google Maps</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FITHUB · All rights reserved · Made with <span className="text-neon-pink">♥</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
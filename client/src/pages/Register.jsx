import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import FITHUBLogo from '../components/FITHUBLogo';

const Register = () => {
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      // Backend generates + stores OTP and emails it via Brevo (works to any email)
      await api.post('/auth/send-otp', { email: form.email, phone: form.phone });

      setOtpSent(true);
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: form.email,
        phone: form.phone,
        otp: form.otp,
        purpose: 'register'
      });
      if (data.verified) {
        const result = await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        });
        if (result.success) {
          toast.success('Account created! Welcome to FITHUB 🎉');
          navigate('/dashboard');
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-dark-900 flex items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <div className="bg-dark-800 rounded-2xl p-8 border border-white/5">
          <div className="flex justify-center mb-6">
            <FITHUBLogo size={70} theme="dark" />
          </div>
          <h1 className="font-display text-3xl text-white text-center mb-1">JOIN FITHUB</h1>
          <p className="text-gray-400 text-center text-sm mb-8">Create your account and start your journey</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary-500' : 'bg-neon-green'}`}></div>
            <div className="w-12 h-0.5 bg-white/20"></div>
            <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary-500' : 'bg-white/20'}`}></div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="+91 12345 67890"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                    placeholder="Min 6 chars"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-gray-300 text-sm">We sent a 6-digit OTP to</p>
                <p className="text-white font-semibold">{form.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  required
                  value={form.otp}
                  onChange={handleChange}
                  maxLength="6"
                  className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors text-center text-2xl tracking-widest"
                  placeholder="••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Verify & Create Account'}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setOtpSent(false); }}
                className="w-full text-sm text-gray-400 hover:text-white"
              >
                ← Back to edit details
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

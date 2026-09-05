import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import FITHUBLogo from '../components/FITHUBLogo';

const Login = () => {
  const [method, setMethod] = useState('password');
  const [form, setForm] = useState({ email: '', phone: '', password: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (location.state?.email) {
      setForm(f => ({ ...f, email: location.state.email }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back! 👋');
      navigate(result.data.role === 'admin' ? '/admin' : from);
    } else {
      toast.error(result.message);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/login-phone', { phone: form.phone });
      setOtpSent(true);
      toast.success('OTP sent to your registered email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-phone-otp', { phone: form.phone, otp: form.otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Logged in successfully! 🎉');
      navigate(data.role === 'admin' ? '/admin' : from);
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
            <FITHUBLogo size={70} theme="light" />
          </div>
          <h1 className="font-display text-3xl text-white text-center mb-1">WELCOME BACK!</h1>
          <p className="text-gray-400 text-center text-sm mb-8">Login to your FITHUB account</p>

          <div className="flex bg-dark-900 rounded-full p-1 mb-8">
            <button
              onClick={() => { setMethod('password'); setOtpSent(false); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                method === 'password' ? 'bg-gradient-to-r from-primary-600 to-neon-pink text-white' : 'text-gray-400'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => { setMethod('phone'); setOtpSent(false); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                method === 'phone' ? 'bg-gradient-to-r from-primary-600 to-neon-pink text-white' : 'text-gray-400'
              }`}
            >
              Phone & OTP
            </button>
          </div>

          {method === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleOTPLogin : handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  disabled={otpSent}
                  className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors disabled:opacity-50"
                  placeholder="+91 12345 67890"
                />
              </div>
              {otpSent && (
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
                  <p className="text-xs text-gray-400 mt-2">Check your registered email for the OTP</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Please wait...' : otpSent ? 'Verify & Login' : 'Send OTP'}
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-sm text-gray-400 hover:text-white"
                >
                  Change phone number
                </button>
              )}
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Don't have an account? </span>
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

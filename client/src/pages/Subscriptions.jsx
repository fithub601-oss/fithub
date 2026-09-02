import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/subscriptions')
      .then(res => setSubscriptions(res.data))
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    if (!user) {
      toast.error('Please login to subscribe');
      navigate('/login', { state: { from: '/subscriptions' } });
      return;
    }

    setPaymentLoading(true);
    try {
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load');
        return;
      }

      const { data } = await api.post('/payment/create-order', {
        subscriptionId: plan._id,
        userId: user._id
      });

      if (!data.key) {
        toast.error('Payment not configured. Please pay at gym.');
        navigate(`/checkout/${plan._id}`);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'FITHUB',
        description: `${plan.name} - ${plan.duration} ${plan.durationUnit}`,
        image: '/logo192.png',
        order_id: data.id,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              subscriptionId: plan._id,
              userId: user._id
            });
            toast.success('Payment successful! Membership activated 🎉');
            setTimeout(() => navigate('/dashboard'), 1500);
          } catch (error) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#4F46E5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Payment initialization failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-dark-900">
        <div className="text-white">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-dark-900">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl text-white mb-3">MEMBERSHIP <span className="text-primary-500">PLANS</span></h1>
            <p className="text-gray-400">Choose your plan and start your journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((plan, i) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-primary-900/60 to-dark-800 border-primary-500/40'
                    : 'bg-dark-800 border-white/5'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon-green text-dark-900 text-xs font-bold rounded-full whitespace-nowrap">
                    ⭐ MOST POPULAR
                  </span>
                )}
                <h2 className="text-white font-bold text-2xl mb-1">{plan.name}</h2>
                <p className="text-gray-400 text-sm mb-4 min-h-[40px]">{plan.description}</p>

                <div className="mb-4">
                  <span className="font-display text-5xl text-white">₹{plan.price}</span>
                  <span className="text-gray-400 text-sm"> / {plan.duration} {plan.durationUnit}{plan.duration > 1 ? 's' : ''}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-neon-green mt-0.5">✓</span> {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePayment(plan)}
                  disabled={paymentLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {paymentLoading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Subscriptions;

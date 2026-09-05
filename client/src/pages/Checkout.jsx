import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subscriptions')
      .then(res => {
        const found = res.data.find(s => s._id === id);
        if (found) setPlan(found);
      })
      .catch(() => toast.error('Failed to load plan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCashPayment = async () => {
    try {
      const res = await api.post('/payment/verify', {
        subscriptionId: plan._id,
        userId: user._id,
        razorpay_order_id: 'CASH',
        razorpay_payment_id: `CASH_${Date.now()}`,
        razorpay_signature: 'CASH',
        paymentMethod: 'cash'
      });
      toast.success('Membership requested! Admin will confirm.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-dark-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-dark-900 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-dark-800 rounded-2xl p-8 border border-white/5">
          <h1 className="font-display text-4xl text-white mb-6 text-center">CHECKOUT</h1>
          {plan && user && (
            <>
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h2 className="text-white font-bold text-xl mb-2">{plan.name}</h2>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-gray-300">{plan.duration} {plan.durationUnit}(s)</span>
                  <span className="font-display text-3xl text-white">₹{plan.price}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white">{user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Phone</span>
                  <span className="text-white">{user.phone}</span>
                </div>
              </div>

              <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-xl p-4 mb-6 text-sm text-neon-yellow">
                <strong>Note:</strong> Online payment is not configured yet. You can pay at the gym and the admin will confirm your membership. Please contact us for payment options.
              </div>

              <button
                onClick={handleCashPayment}
                className="w-full py-3 bg-neon-green text-slate-900 font-bold rounded-full hover:opacity-90 mb-3"
              >
                Pay at Gym / Confirm Order
              </button>
              <button
                onClick={() => navigate('/subscriptions')}
                className="w-full py-3 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10 border border-white/10"
              >
                Go Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;

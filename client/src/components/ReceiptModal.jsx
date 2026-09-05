import React from 'react';
import Modal from './Modal';
import { FaReceipt, FaPrint } from 'react-icons/fa';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return '—'; }
};

const shortId = (id) => String(id || '').slice(-6).toUpperCase();

const ReceiptModal = ({ open, onClose, type = 'order', data, user }) => {
  if (!data) return null;

  const isOrder = type === 'order';

  const receiptNo = isOrder
    ? `ORD-${shortId(data._id)}${data.razorpayPaymentId ? '-' + shortId(data.razorpayPaymentId) : ''}`
    : `PAY-${shortId(data._id)}`;

  const methodLabel = (m) => m ? m.charAt(0).toUpperCase() + m.slice(1) : 'Other';

  const billTo = isOrder
    ? {
        name: data.shippingAddress?.fullName || user?.name || '—',
        email: user?.email || '—',
        phone: data.shippingAddress?.phone || user?.phone || '—'
      }
    : {
        name: user?.name || '—',
        email: user?.email || '—',
        phone: user?.phone || '—'
      };

  const paid = isOrder ? Number(data.totalAmount || 0) : Number(data.amount || 0);
  const remaining = isOrder ? 0 : Math.max(0, Number(data.amountRemaining) || 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Receipt"
      subtitle="View, print or download as PDF"
      icon={<FaReceipt />}
      iconBg="bg-gradient-to-br from-neon-green to-emerald-600"
      size="md"
      footer={
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity"
          >
            <FaPrint /> Download / Print PDF
          </button>
        </div>
      }
    >
      <div id="receipt-print-area" className="receipt-sheet">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
          <div>
            <p className="font-display text-2xl tracking-wider text-slate-900">
              FIT<span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">HUB</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">by Samarth Gym</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Payment Receipt</p>
            <p className="text-[11px] text-slate-500">Receipt No: {receiptNo}</p>
            <p className="text-[11px] text-slate-500">Date: {fmtDate(isOrder ? data.createdAt : data.date)}</p>
          </div>
        </div>

        {/* Bill to */}
        <div className="grid grid-cols-2 gap-4 py-4 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Billed To</p>
            <p className="text-slate-800 font-semibold">{billTo.name}</p>
            <p className="text-slate-500 text-xs">{billTo.email}</p>
            {billTo.phone !== '—' && <p className="text-slate-500 text-xs">{billTo.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Payment</p>
            <p className="text-slate-800 font-semibold capitalize">{methodLabel(isOrder ? data.paymentMethod : data.method)}</p>
            <p className={`text-xs font-bold ${data.paymentStatus === 'paid' || data.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {(data.paymentStatus === 'paid' || data.status === 'paid') ? 'Paid' : 'Pending'}
            </p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="bg-slate-100 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {isOrder ? (
                <>
                  <th className="px-3 py-2 rounded-l-lg">Item</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right rounded-r-lg">Amount</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-2 rounded-l-lg">Description</th>
                  <th className="px-3 py-2 text-right rounded-r-lg">Amount</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {isOrder ? (
              (data.items || []).map((item, i) => (
                <tr key={item._id || i} className="border-b border-slate-100">
                  <td className="px-3 py-2.5">
                    <p className="text-slate-800 font-medium">{item.name}</p>
                    <p className="text-slate-400 text-xs">{item.size ? `Size: ${item.size}` : ''}</p>
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{item.quantity}</td>
                  <td className="px-3 py-2.5 text-right text-slate-800 font-medium">{inr(item.price * item.quantity)}</td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-slate-100">
                <td className="px-3 py-2.5 text-slate-800 font-medium">{data.plan || 'Gym membership'}</td>
                <td className="px-3 py-2.5 text-right text-slate-800 font-medium">{inr(paid)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-64 space-y-1.5 text-sm">
            {isOrder ? (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{inr(paid)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600">FREE</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>Amount Paid</span>
                  <span>{inr(paid)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Balance Due</span>
                  <span className={remaining > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                    {remaining > 0 ? inr(remaining) : '—'}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-slate-200 font-bold text-slate-900">
              <span>{isOrder ? 'Total Paid' : 'Total Paid'}</span>
              <span>{inr(paid)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 text-center">
          <p className="text-sm text-slate-700 font-medium">Thank you! See you at the gym 💪</p>
          <p className="text-xs text-slate-400 mt-1">
            FitHub by Samarth Gym · Goregaon East, Mumbai · fithub601@gmail.com · Mon–Sat 6AM–10PM
          </p>
          <p className="text-[10px] text-slate-300 mt-2">This is a computer-generated receipt.</p>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
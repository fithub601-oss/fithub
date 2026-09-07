export const ORDER_STEPS = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

export const ORDER_STATUS_META = {
  placed: { label: 'Placed', emoji: '📦', pill: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  confirmed: { label: 'Confirmed', emoji: '✅', pill: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  shipped: { label: 'Shipped', emoji: '🚚', pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  out_for_delivery: { label: 'Out for Delivery', emoji: '🏍️', pill: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  delivered: { label: 'Delivered', emoji: '🏁', pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', emoji: '❌', pill: 'bg-red-100 text-red-600', dot: 'bg-red-500' }
};

export const fmtStatusTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return sameDay ? `Today, ${time}` : `${day}, ${time}`;
};

export const currentStepIndex = (status) => {
  if (status === 'cancelled') return -1;
  return ORDER_STEPS.indexOf(status);
};
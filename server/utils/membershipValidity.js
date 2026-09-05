// Shared membership validity calculation.
// Always computed dynamically against the actual current date — never hardcoded.
const getMembershipValidity = (membership) => {
  if (!membership || !membership.endDate) return null;

  const now = new Date();
  const end = new Date(membership.endDate);
  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: 'expired', label: 'Expired', emoji: '🔴', daysRemaining, expired: true, expiring: false };
  }
  if (daysRemaining <= 30) {
    return { status: 'expiring', label: 'Expiring Soon', emoji: '🟡', daysRemaining, expired: false, expiring: true };
  }
  return { status: 'active', label: 'Active', emoji: '🟢', daysRemaining, expired: false, expiring: false };
};

module.exports = { getMembershipValidity };
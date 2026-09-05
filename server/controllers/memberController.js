const User = require('../models/User');
const Membership = require('../models/Membership');
const Subscription = require('../models/Subscription');
const { getMembershipValidity } = require('../utils/membershipValidity');

// @desc    Get current user's memberships
// @route   GET /api/members/me
// @access  Private
const getMyMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ user: req.user._id })
      .populate('subscription')
      .sort('-createdAt');
    const attached = memberships.map(m => ({
      ...m.toObject(),
      validity: getMembershipValidity(m)
    }));
    const profile = await User.findById(req.user._id).select('-password');
    res.json({ ...profile.toObject(), memberships: attached });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin
const getMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password').sort('-createdAt');
    
    const membersWithMembership = await Promise.all(members.map(async (member) => {
      const membership = await Membership.findOne({ user: member._id })
        .sort('-createdAt')
        .populate('subscription');
      return {
        ...member.toObject(),
        currentMembership: membership,
        membershipValidity: getMembershipValidity(membership)
      };
    }));

    res.json(membersWithMembership);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private/Admin
const getMember = async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('-password');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    const memberships = await Membership.find({ user: member._id })
      .populate('subscription')
      .sort('-createdAt');
    const attached = memberships.map(m => ({
      ...m.toObject(),
      validity: getMembershipValidity(m)
    }));
    res.json({ ...member.toObject(), memberships: attached });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = async (req, res) => {
  try {
    const {
      name, phone, email, address, dateOfBirth, gender, emergencyContact, profileImage,
      membership: membershipEdit
    } = req.body;
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (typeof name === 'string' && name.trim()) member.name = name.trim();
    if (typeof phone === 'string' && phone.trim()) member.phone = phone.trim();
    if (typeof email === 'string' && email.trim()) member.email = email.trim();
    member.address = address || member.address;
    member.dateOfBirth = dateOfBirth || member.dateOfBirth;
    member.gender = gender || member.gender;
    member.emergencyContact = emergencyContact || member.emergencyContact;
    member.profileImage = profileImage || member.profileImage;

    await member.save();

    // Membership editing: plan change, start date, expiry date
    if (membershipEdit && typeof membershipEdit === 'object') {
      const { membershipId, subscriptionId, startDate, endDate, status } = membershipEdit;

      let target = membershipId ? await Membership.findById(membershipId) : null;
      if (!target) {
        target = await Membership.findOne({ user: member._id }).sort('-createdAt');
      }

      if (target) {
        const start = startDate ? new Date(startDate) : target.startDate;
        if (isNaN(start.getTime())) {
          return res.status(400).json({ message: 'Invalid membership start date' });
        }
        let end = endDate ? new Date(endDate) : null;
        if (endDate && isNaN(end.getTime())) {
          return res.status(400).json({ message: 'Invalid membership expiry date' });
        }

        if (subscriptionId) {
          const sub = await Subscription.findById(subscriptionId);
          if (!sub) {
            return res.status(404).json({ message: 'Selected plan not found' });
          }
          target.subscription = sub._id;
          target.totalAmount = sub.price;
          if (!end) {
            end = new Date(start);
            if (sub.durationUnit === 'day') end.setDate(end.getDate() + sub.duration);
            else if (sub.durationUnit === 'week') end.setDate(end.getDate() + sub.duration * 7);
            else if (sub.durationUnit === 'month') end.setMonth(end.getMonth() + sub.duration);
            else if (sub.durationUnit === 'year') end.setFullYear(end.getFullYear() + sub.duration);
          }
        }

        target.startDate = start;
        if (end) target.endDate = end;

        // Recalculate status from the actual dates
        if (new Date(target.endDate) < new Date()) {
          target.status = 'expired';
        } else if (status === 'pending') {
          target.status = 'pending';
        } else if (target.status === 'expired' || target.status === 'pending') {
          target.status = 'active';
        }

        await target.save();
      }
    }

    const memberships = await Membership.find({ user: member._id })
      .populate('subscription')
      .sort('-createdAt');
    const attached = memberships.map(m => ({
      ...m.toObject(),
      validity: getMembershipValidity(m)
    }));
    res.json({ ...member.toObject(), memberships: attached });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
  try {
    const member = await User.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    await Membership.deleteMany({ user: member._id });
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign membership to member
// @route   POST /api/members/:id/membership
// @access  Private/Admin
const assignMembership = async (req, res) => {
  try {
    const { subscriptionId, startDate, amountPaid, paymentMethod, notes } = req.body;
    
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    if (subscription.durationUnit === 'day') end.setDate(end.getDate() + subscription.duration);
    else if (subscription.durationUnit === 'week') end.setDate(end.getDate() + subscription.duration * 7);
    else if (subscription.durationUnit === 'month') end.setMonth(end.getMonth() + subscription.duration);
    else if (subscription.durationUnit === 'year') end.setFullYear(end.getFullYear() + subscription.duration);

    const paid = amountPaid || 0;
    const total = subscription.price;
    const remaining = total - paid;

    // Deactivate existing active memberships
    await Membership.updateMany(
      { user: req.params.id, status: 'active' },
      { $set: { status: 'expired' } }
    );

    const membership = await Membership.create({
      user: req.params.id,
      subscription: subscriptionId,
      startDate: start,
      endDate: end,
      status: 'active',
      totalAmount: total,
      amountPaid: paid,
      amountRemaining: remaining,
      paymentStatus: remaining === 0 ? 'paid' : remaining === total ? 'pending' : 'partial',
      paymentMethod,
      notes,
      renewals: paid > 0 ? [{ amount: paid, method: paymentMethod }] : []
    });

    res.status(201).json(membership);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Record payment for membership
// @route   POST /api/members/:id/payment
// @access  Private/Admin
const recordPayment = async (req, res) => {
  try {
    const { membershipId, amount, method } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    const newPaid = membership.amountPaid + (amount || 0);
    membership.amountPaid = newPaid;
    membership.amountRemaining = membership.totalAmount - newPaid;
    membership.paymentStatus = membership.amountRemaining <= 0 ? 'paid' : 'partial';
    membership.paymentMethod = method || membership.paymentMethod;
    membership.renewals.push({ amount: amount || 0, method: method || 'cash', date: new Date() });

    if (membership.status === 'pending' && membership.amountPaid > 0) {
      await Membership.updateMany(
        { user: membership.user, status: 'active' },
        { $set: { status: 'expired' } }
      );
      membership.status = 'active';
    }

    await membership.save();

    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all settlement/transaction records across all members
// @route   GET /api/members/all-transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
  try {
    const memberships = await Membership.find()
      .populate('user', 'name email phone')
      .populate('subscription', 'name')
      .sort('-createdAt');

    const transactions = [];

    memberships.forEach((m) => {
      const planName = m.subscription?.name || 'Plan';
      const memberName = m.user?.name || 'Unknown';
      const memberEmail = m.user?.email || '';
      const memberPhone = m.user?.phone || '';

      // Base purchase / initial seed transaction (if any paid up front)
      (m.renewals || []).forEach((r) => {
        transactions.push({
          _id: r._id,
          memberId: m.user?._id,
          memberName,
          memberEmail,
          memberPhone,
          plan: planName,
          date: r.date,
          amount: r.amount,
          method: r.method || m.paymentMethod,
          membershipId: m._id,
          status: m.status
        });
      });

      // If nothing was ever recorded but there's money accounted, still useful:
      if (!m.renewals || m.renewals.length === 0) {
        transactions.push({
          _id: m._id,
          memberId: m.user?._id,
          memberName,
          memberEmail,
          memberPhone,
          plan: planName,
          date: m.createdAt,
          amount: m.amountPaid || 0,
          method: m.paymentMethod,
          membershipId: m._id,
          status: m.status
        });
      }
    });

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyMemberships,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
  assignMembership,
  recordPayment,
  getAllTransactions
};

const User = require('../models/User');
const Membership = require('../models/Membership');
const Subscription = require('../models/Subscription');

// @desc    Get current user's memberships
// @route   GET /api/members/me
// @access  Private
const getMyMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ user: req.user._id })
      .populate('subscription')
      .sort('-createdAt');
    const profile = await User.findById(req.user._id).select('-password');
    res.json({ ...profile.toObject(), memberships });
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
        currentMembership: membership
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
    res.json({ ...member.toObject(), memberships });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = async (req, res) => {
  try {
    const { name, phone, email, address, dateOfBirth, gender, emergencyContact, profileImage } = req.body;
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.name = name || member.name;
    member.phone = phone || member.phone;
    member.email = email || member.email;
    member.address = address || member.address;
    member.dateOfBirth = dateOfBirth || member.dateOfBirth;
    member.gender = gender || member.gender;
    member.emergencyContact = emergencyContact || member.emergencyContact;
    member.profileImage = profileImage || member.profileImage;

    await member.save();
    res.json(member);
  } catch (error) {
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

module.exports = {
  getMyMemberships,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
  assignMembership,
  recordPayment
};

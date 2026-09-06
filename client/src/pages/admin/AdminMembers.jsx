import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import Modal from '../../components/Modal';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaUserPlus, FaMoneyBillWave } from 'react-icons/fa';

const getValidity = (m) => {
  if (!m || !m.endDate) return null;
  const end = new Date(m.endDate);
  const now = new Date();
  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 0) return { status: 'expired', label: 'Expired', emoji: '🔴', daysRemaining };
  if (daysRemaining <= 30) return { status: 'expiring', label: 'Expiring Soon', emoji: '🟡', daysRemaining };
  return { status: 'active', label: 'Active', emoji: '🟢', daysRemaining };
};

const toDateInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', address: '', emergencyContact: '' });
  const [membershipForm, setMembershipForm] = useState({
    subscriptionId: '',
    startDate: new Date().toISOString().split('T')[0],
    amountPaid: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    fetchMembers();
    api.get('/subscriptions/all').then(res => setSubscriptions(res.data)).catch(() => {});
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data);
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      toast.success(`Member ${res.data.name} created!`);
      setShowAddModal(false);
      setForm({ name: '', email: '', phone: '', password: '', address: '', emergencyContact: '' });
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create member');
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    try {
      const { editMembership, ...profile } = showEditModal;
      const payload = { ...profile };
      if (editMembership && (editMembership.subscriptionId || editMembership.startDate || editMembership.endDate)) {
        payload.membership = editMembership;
      }
      await api.put(`/members/${showEditModal._id}`, payload);
      toast.success('Member updated!');
      setShowEditModal(null);
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update member');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.delete(`/members/${id}`);
      toast.success('Member deleted');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  const handleAssignMembership = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/members/${showMembershipModal._id}/membership`, membershipForm);
      toast.success('Membership assigned!');
      setShowMembershipModal(null);
      setMembershipForm({ subscriptionId: '', startDate: new Date().toISOString().split('T')[0], amountPaid: '', paymentMethod: 'cash', notes: '' });
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign membership');
    }
  };

  const modalInputs = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400';
  const modalLabel = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">MEMBERS <span className="text-primary-500">MANAGEMENT</span></h1>
            <p className="text-gray-400 mt-1">{members.length} total members</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90"
          >
            <FaUserPlus /> Add Member
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Membership</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
                ) : filteredMembers.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400">No members found</td></tr>
                ) : (
                  filteredMembers.map((member) => {
                    const mem = member.currentMembership;
                    const val = member.membershipValidity || getValidity(mem);
                    return (
                      <motion.tr key={member._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center text-white font-bold shrink-0">
                              {member.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{member.name}</p>
                              <p className="text-gray-500 text-xs">Joined {new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="text-gray-300 text-sm">{member.email}</p>
                          <p className="text-gray-500 text-xs">{member.phone}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {mem ? (
                            <div>
                              <p className="text-white text-sm">{mem.subscription?.name || 'Membership'}</p>
                              <p className="text-gray-500 text-xs">
                                Start {new Date(mem.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                              <p className="text-gray-500 text-xs">
                                Expires {new Date(mem.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">No plan</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {mem ? (
                            <div className="text-sm">
                              <p className="text-white">₹{mem.amountPaid} / ₹{mem.totalAmount}</p>
                              <p className="text-gray-500 text-xs">
                                {mem.amountRemaining > 0 ? `₹${mem.amountRemaining} due` : 'Fully paid'}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            val?.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
                            val?.status === 'expiring' ? 'bg-amber-500/15 text-amber-600' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {val?.emoji} {val?.label || 'NO MEMBERSHIP'}
                          </span>
                          {val && val.daysRemaining < 0 && (
                            <p className="text-red-400 text-xs mt-1">Expired {Math.abs(val.daysRemaining)}d ago</p>
                          )}
                          {val && val.daysRemaining >= 0 && val.status !== 'active' && (
                            <p className="text-amber-600 text-xs mt-1">{val.daysRemaining} day{val.daysRemaining !== 1 ? 's' : ''} left</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowMembershipModal(member)}
                              title="Assign Membership"
                              className="p-2 rounded-lg hover:bg-neon-green/20 text-neon-green transition-colors"
                            >
                              <FaMoneyBillWave />
                            </button>
                            <button
                              onClick={() => setShowEditModal({
                                ...member,
                                editMembership: member.currentMembership
                                  ? {
                                      membershipId: member.currentMembership._id,
                                      subscriptionId: member.currentMembership.subscription?._id || '',
                                      startDate: toDateInput(member.currentMembership.startDate),
                                      endDate: toDateInput(member.currentMembership.endDate)
                                    }
                                  : { membershipId: '', subscriptionId: '', startDate: '', endDate: '' }
                              })}
                              title="Edit"
                              className="p-2 rounded-lg hover:bg-primary-600/20 text-primary-400 transition-colors"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member._id)}
                              title="Delete"
                              className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Member"
        subtitle="Create a member account in one step"
        icon={<FaUserPlus />}
      >
        <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className={modalLabel}>Full Name</label>
                <input type="text" required className={modalInputs} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Member name" />
              </div>
              <div>
                <label className={modalLabel}>Email</label>
                <input type="email" required className={modalInputs} value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={modalLabel}>Phone</label>
                  <input type="tel" required className={modalInputs} value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+91..." />
                </div>
                <div>
                  <label className={modalLabel}>Password</label>
                  <input type="password" required className={modalInputs} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Min 6 chars" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-semibold rounded-full">Create Member</button>
              </div>
            </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        open={!!showEditModal}
        onClose={() => setShowEditModal(null)}
        title="Edit Member"
        subtitle="Update account details"
        icon={<FaEdit />}
      >
        <form onSubmit={handleEditMember} className="space-y-4">
              <div>
                <label className={modalLabel}>Full Name</label>
                <input type="text" className={modalInputs} value={showEditModal?.name || ''} onChange={(e) => setShowEditModal({...showEditModal, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={modalLabel}>Email</label>
                  <input type="email" className={modalInputs} value={showEditModal?.email || ''} onChange={(e) => setShowEditModal({...showEditModal, email: e.target.value})} />
                </div>
                <div>
                  <label className={modalLabel}>Phone</label>
                  <input type="tel" className={modalInputs} value={showEditModal?.phone || ''} onChange={(e) => setShowEditModal({...showEditModal, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className={modalLabel}>Address</label>
                <input type="text" className={modalInputs} value={showEditModal?.address || ''} onChange={(e) => setShowEditModal({...showEditModal, address: e.target.value})} />
              </div>
              <div className="border-t border-slate-100 pt-4 mt-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Membership Details {showEditModal?.editMembership?.membershipId ? '' : '(no plan assigned yet)'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={modalLabel}>Membership Type (Plan)</label>
                    <select
                      className={modalInputs}
                      value={showEditModal?.editMembership?.subscriptionId || ''}
                      onChange={(e) => setShowEditModal({
                        ...showEditModal,
                        editMembership: { ...showEditModal.editMembership, subscriptionId: e.target.value }
                      })}
                    >
                      <option value="">Keep current plan...</option>
                      {subscriptions.map(s => (
                        <option key={s._id} value={s._id}>{s.name} - ₹{s.price}/{s.duration}{s.durationUnit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={modalLabel}>Start Date</label>
                    <input
                      type="date"
                      className={modalInputs}
                      value={showEditModal?.editMembership?.startDate || ''}
                      onChange={(e) => setShowEditModal({
                        ...showEditModal,
                        editMembership: { ...showEditModal.editMembership, startDate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className={modalLabel}>Expiry Date</label>
                    <input
                      type="date"
                      className={modalInputs}
                      value={showEditModal?.editMembership?.endDate || ''}
                      onChange={(e) => setShowEditModal({
                        ...showEditModal,
                        editMembership: { ...showEditModal.editMembership, endDate: e.target.value }
                      })}
                    />
                  </div>
                  <p className="col-span-2 text-xs text-slate-400">
                    Changing the plan but leaving expiry empty recalculates it from the start date.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(null)} className="py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors font-medium">Cancel</button>
                <button type="submit" className="py-2.5 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-semibold rounded-full">Save Changes</button>
              </div>
            </form>
      </Modal>

      {/* Assign Membership Modal */}
      <Modal
        open={!!showMembershipModal}
        onClose={() => setShowMembershipModal(null)}
        title="Assign Membership"
        subtitle={`Assign a plan to ${showMembershipModal?.name || 'member'}`}
        icon={<FaMoneyBillWave />}
        iconBg="bg-gradient-to-br from-neon-green to-emerald-600"
      >
        <form onSubmit={handleAssignMembership} className="space-y-4">
              <div>
                <label className={modalLabel}>Subscription Plan</label>
                <select required className={modalInputs} value={membershipForm.subscriptionId} onChange={(e) => setMembershipForm({...membershipForm, subscriptionId: e.target.value})}>
                  <option value="">Select plan...</option>
                  {subscriptions.map(s => (
                    <option key={s._id} value={s._id}>{s.name} - ₹{s.price}/{s.duration}{s.durationUnit}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={modalLabel}>Start Date</label>
                  <input type="date" required className={modalInputs} value={membershipForm.startDate} onChange={(e) => setMembershipForm({...membershipForm, startDate: e.target.value})} />
                </div>
                <div>
                  <label className={modalLabel}>Amount Paid (₹)</label>
                  <input type="number" className={modalInputs} value={membershipForm.amountPaid} onChange={(e) => setMembershipForm({...membershipForm, amountPaid: e.target.value})} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={modalLabel}>Payment Method</label>
                  <select className={modalInputs} value={membershipForm.paymentMethod} onChange={(e) => setMembershipForm({...membershipForm, paymentMethod: e.target.value})}>
                    <option value="cash">Cash</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={modalLabel}>Notes</label>
                <input type="text" className={modalInputs} value={membershipForm.notes} onChange={(e) => setMembershipForm({...membershipForm, notes: e.target.value})} placeholder="Optional notes" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMembershipModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-neon-green to-emerald-600 text-white font-semibold rounded-full">Assign Plan</button>
              </div>
            </form>
      </Modal>
    </div>
  );
};

export default AdminMembers;

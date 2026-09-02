const router = require('express').Router();
const {
  getMyMemberships,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
  assignMembership,
  recordPayment
} = require('../controllers/memberController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getMembers);
router.get('/me', protect, getMyMemberships);
router.get('/:id', protect, admin, getMember);
router.put('/:id', protect, admin, updateMember);
router.delete('/:id', protect, admin, deleteMember);
router.post('/:id/membership', protect, admin, assignMembership);
router.post('/:id/payment', protect, admin, recordPayment);

module.exports = router;

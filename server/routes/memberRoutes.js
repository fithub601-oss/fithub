const router = require('express').Router();
const {
  getMyMemberships,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
  assignMembership,
  recordPayment,
  getAllTransactions
} = require('../controllers/memberController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/security');

router.get('/', protect, admin, getMembers);
router.get('/me', protect, getMyMemberships);
router.get('/all-transactions', protect, admin, getAllTransactions);
router.get('/:id', protect, admin, validateObjectId, getMember);
router.put('/:id', protect, admin, validateObjectId, updateMember);
router.delete('/:id', protect, admin, validateObjectId, deleteMember);
router.post('/:id/membership', protect, admin, validateObjectId, assignMembership);
router.post('/:id/payment', protect, admin, validateObjectId, recordPayment);

module.exports = router;

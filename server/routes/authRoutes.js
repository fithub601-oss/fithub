const router = require('express').Router();
const {
  register,
  login,
  loginWithPhone,
  sendOTP,
  verifyOTP,
  verifyPhoneOTP,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/login-phone', loginWithPhone);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/verify-phone-otp', verifyPhoneOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;

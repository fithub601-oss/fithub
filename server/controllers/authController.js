const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const sgMail = require('@sendgrid/mail');

const sendViaBrevo = async (email, subject, html) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return false;
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'FITHUB',
          email: process.env.BREVO_FROM || 'fithub601@gmail.com'
        },
        to: [{ email }],
        subject,
        htmlContent: html
      })
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Brevo error response:', res.status, text.slice(0, 500));
      return false;
    }
    console.log('OTP email sent via Brevo');
    return true;
  } catch (error) {
    console.error('Brevo send error:', error.message);
    return false;
  }
};

const sendViaGmailOAuth = async (email, subject, html) => {
  try {
    const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
    const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return false;

    // Get access token from refresh token (plain HTTPS, no heavy SDK)
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('Gmail token error:', tokenRes.status, text.slice(0, 300));
      return false;
    }
    const { access_token } = await tokenRes.json();
    if (!access_token) return false;

    // Build raw MIME message and send via Gmail API
    const raw = Buffer.from(
      `To: ${email}\r\n` +
      `From: FITHUB <fithub601@gmail.com>\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
      html
    ).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    });
    if (!sendRes.ok) {
      const text = await sendRes.text();
      console.error('Gmail send error:', sendRes.status, text.slice(0, 300));
      return false;
    }
    const data = await sendRes.json();
    console.log('OTP email sent via Gmail OAuth:', data.id);
    return true;
  } catch (error) {
    console.error('Gmail OAuth send error:', error.message);
    return false;
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailOTP = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="color: #4F46E5; text-align: center;">FITHUB</h2>
      <h3 style="text-align: center;">Your Verification Code</h3>
      <p style="text-align: center; font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 10px; background: #EEF2FF; padding: 15px; border-radius: 8px;">${otp}</p>
      <p style="text-align: center; color: #6B7280;">This code is valid for 10 minutes.</p>
      <p style="text-align: center; color: #6B7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  // 1st choice: Gmail OAuth (sends to ANY email over HTTPS - reliable on Render)
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    const ok = await sendViaGmailOAuth(email, 'FITHUB - Your OTP Code', html);
    if (ok) return true;
  }

  // 2nd choice: Brevo (HTTPS API, sends to ANY email, no domain needed, works on Render)
  if (process.env.BREVO_API_KEY) {
    const ok = await sendViaBrevo(email, 'FITHUB - Your OTP Code', html);
    if (ok) return true;
  }

  // 3rd choice: SendGrid (HTTPS API, works on Render, sends to any verified recipient)
  if (process.env.SENDGRID_API_KEY && (process.env.SENDGRID_FROM || process.env.EMAIL_FROM)) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM || process.env.EMAIL_FROM,
        subject: 'FITHUB - Your OTP Code',
        html
      });
      console.log('OTP email sent via SendGrid');
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error.message);
      if (error.response) console.error('SendGrid response body:', error.response.body);
      return false;
    }
  }

  // 4th choice: Resend (HTTPS API - works on Render)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM || 'FITHUB <onboarding@resend.dev>';
      await resend.emails.send({
        from,
        to: email,
        subject: 'FITHUB - Your OTP Code',
        html
      });
      console.log('OTP email sent via Resend');
      return true;
    } catch (error) {
      console.error('Resend email error:', error.message);
      return false;
    }
  }

  // Fallback: Gmail SMTP (for local dev)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('No email provider configured (SENDGRID_API_KEY or RESEND_API_KEY or EMAIL_USER/EMAIL_PASS)');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });

  try {
    await transporter.sendMail({
      from: `"FITHUB" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'FITHUB - Your OTP Code',
      html
    });
    return true;
  } catch (error) {
    console.error('Email send error (from):', process.env.EMAIL_USER);
    console.error('Email send error details:', error.message, error.code || '');
    if (error.response) console.error('SMTP response:', error.response);
    return false;
  }
};

// @desc    Register user with OTP
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email or phone' });
  }

  try {
    const user = await User.create({
      name,
      email,
      phone,
      password
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    token: generateToken(user._id)
  });
};

// @desc    Login with phone
// @route   POST /api/auth/login-phone
// @access  Public
const loginWithPhone = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(404).json({ message: 'No user found with this phone number' });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.create({
    email: user.email,
    phone,
    otp,
    purpose: 'login',
    expiresAt
  });

  const emailSent = await sendEmailOTP(user.email, otp);
  if (!emailSent) {
    return res.status(500).json({ message: 'Failed to send OTP' });
  }

  res.json({ message: 'OTP sent to your email', userId: user._id });
};

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const query = { email };
    if (phone) query.phone = phone;
    const userExists = await User.findOne({ $or: [{ email }, phone ? { phone } : {}] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      email,
      phone: phone || '',
      otp,
      purpose: 'register',
      expiresAt
    });

    // Send the OTP via Gmail OAuth (works to any email from Render)
    const emailSent = await sendEmailOTP(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email. Try again.' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('sendOTP error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, phone, otp, purpose } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const otpRecord = await OTP.findOne({
    email,
    otp,
    purpose: purpose || 'register',
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  await OTP.deleteOne({ _id: otpRecord._id });

  res.json({ message: 'OTP verified successfully', verified: true });
};

// @desc    Verify phone OTP and login
// @route   POST /api/auth/verify-phone-otp
// @access  Public
const verifyPhoneOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  const otpRecord = await OTP.findOne({
    phone,
    otp,
    purpose: 'login',
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await OTP.deleteOne({ _id: otpRecord._id });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id)
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'No user found with this email' });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.create({
    email,
    phone: user.phone,
    otp,
    purpose: 'reset',
    expiresAt
  });

  await sendEmailOTP(email, otp);

  res.json({ message: 'Reset OTP sent to your email' });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const otpRecord = await OTP.findOne({
    email,
    otp,
    purpose: 'reset',
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await require('bcryptjs').hash(newPassword, salt);
  await user.save();

  await OTP.deleteOne({ _id: otpRecord._id });

  res.json({ message: 'Password reset successfully' });
};

module.exports = {
  register,
  login,
  loginWithPhone,
  sendOTP,
  verifyOTP,
  verifyPhoneOTP,
  getMe,
  forgotPassword,
  resetPassword
};

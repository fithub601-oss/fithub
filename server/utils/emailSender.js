const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const sgMail = require('@sendgrid/mail');

const sendViaGmailOAuth = async (email, subject, html) => {
  try {
    const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
    const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return false;

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
      console.error('Gmail token error:', tokenRes.status);
      return false;
    }
    const { access_token } = await tokenRes.json();
    if (!access_token) return false;

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
    console.log('Reminder email sent via Gmail OAuth');
    return true;
  } catch (error) {
    console.error('Gmail OAuth send error:', error.message);
    return false;
  }
};

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
          name: 'FitHub by Samarth Gym',
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
    console.log('Reminder email sent via Brevo');
    return true;
  } catch (error) {
    console.error('Brevo send error:', error.message);
    return false;
  }
};

const sendViaSendGrid = async (email, subject, html) => {
  try {
    if (!process.env.SENDGRID_API_KEY && !(process.env.SENDGRID_FROM || process.env.EMAIL_FROM)) return false;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM || process.env.EMAIL_FROM,
      subject,
      html
    });
    console.log('Reminder email sent via SendGrid');
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error.message);
    return false;
  }
};

const sendViaResend = async (email, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) return false;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || 'FitHub by Samarth Gym <onboarding@resend.dev>';
    await resend.emails.send({ from, to: email, subject, html });
    console.log('Reminder email sent via Resend');
    return true;
  } catch (error) {
    console.error('Resend email error:', error.message);
    return false;
  }
};

const sendViaGmailSmtp = async (email, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('No email provider configured for reminders (set GMAIL_CLIENT_ID/GMAIL_REFRESH_TOKEN or BREVO_API_KEY or SENDGRID_API_KEY or RESEND_API_KEY)');
      return false;
    }
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT || 587),
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
    await transporter.sendMail({
      from: `"FitHub by Samarth Gym" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html
    });
    console.log('Reminder email sent via Gmail SMTP');
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

const sendEmail = async (to, subject, html) => {
  if (await sendViaGmailOAuth(to, subject, html)) return true;
  if (await sendViaBrevo(to, subject, html)) return true;
  if (await sendViaSendGrid(to, subject, html)) return true;
  if (await sendViaResend(to, subject, html)) return true;
  if (await sendViaGmailSmtp(to, subject, html)) return true;
  return false;
};

module.exports = { sendEmail };
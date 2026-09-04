require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
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
    const info = await transporter.sendMail({
      from: `"FITHUB" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'FITHUB SMTP Test',
      text: 'This is a test email from the FITHUB server local machine.'
    });
    console.log('EMAIL SENT OK:', info.messageId);
  } catch (err) {
    console.error('SMTP ERROR:', err.message);
    if (err.response) console.error('RESPONSE:', err.response);
    console.error('CODE:', err.code);
  }
})();
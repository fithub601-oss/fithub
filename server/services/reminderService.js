const Membership = require('../models/Membership');
require('../models/User');
require('../models/Subscription');
const { sendEmail } = require('../utils/emailSender');

const THRESHOLDS = [1, 3, 7, 15, 30];
const DAY_MS = 24 * 60 * 60 * 1000;
const SITE_URL = process.env.SITE_URL || 'https://fithub-api-3wjz.onrender.com';

const bucketFor = (daysRemaining) => {
  if (daysRemaining < 0) return 'expired';
  return String(THRESHOLDS.find((t) => daysRemaining <= t));
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const reminderEmail = ({ name, planName, daysRemaining, endDate, expired }) => {
  const heading = expired
    ? 'Your membership has expired'
    : daysRemaining <= 0
      ? 'Your membership expires today!'
      : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left on your membership`;

  const message = expired
    ? `Your ${planName} membership at FitHub by Samarth Gym ended on ${formatDate(endDate)}. Renew it to jump right back into training.`
    : daysRemaining <= 0
      ? `Your ${planName} membership at FitHub by Samarth Gym expires today (${formatDate(endDate)}). Renew to avoid losing training days.`
      : `Your ${planName} membership at FitHub by Samarth Gym expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} (${formatDate(endDate)}). Time to renew — don't let your streak break!`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #f97316, #dc2626); padding: 20px 28px;">
        <div style="color: #fff; font-size: 24px; font-weight: 800; letter-spacing: 2px;">FIT<span style="opacity: 0.85;">HUB</span></div>
        <div style="color: #fff7ed; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 2px;">by Samarth Gym</div>
      </div>
      <div style="padding: 28px;">
        <h2 style="color: #111827; margin: 0 0 6px;">Hi ${name || 'there'},</h2>
        <p style="color: #374151; line-height: 1.6; margin: 0 0 18px;">${message}</p>
        <table style="width: 100%; background: #fff7ed; border-radius: 10px; padding: 14px 18px; margin: 18px 0;">
          <tr>
            <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Plan</td>
            <td style="color: #111827; font-weight: 600; text-align: right; padding: 4px 0;">${planName || 'Membership'}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Expires</td>
            <td style="color: #dc2626; font-weight: 700; text-align: right; padding: 4px 0;">${formatDate(endDate)}</td>
          </tr>
        </table>
        <a href="${SITE_URL}/dashboard" style="display: block; text-align: center; background: linear-gradient(90deg, #f97316, #dc2626); color: #fff; text-decoration: none; padding: 14px 0; border-radius: 999px; font-weight: 700; margin: 18px 0 8px;">${expired ? 'Renew Now' : 'View Membership'}</a>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">Prefer to renew at the gym? Just walk in and we'll sort you out 💪</p>
      </div>
      <div style="background: #f9fafb; padding: 14px 28px; text-align: center; color: #9ca3af; font-size: 12px;">
        FitHub by Samarth Gym · Goregaon East, Mumbai · fithub601@gmail.com
      </div>
    </div>
  `;
};

const runReminders = async ({ dryRun = false } = {}) => {
  const now = new Date();

  const memberships = await Membership.find({})
    .populate('user', 'email name')
    .populate('subscription', 'name');

  const liveByUser = new Map();
  memberships.forEach((m) => {
    if (!m.user || m.status !== 'active' || !m.endDate || m.endDate.getTime() <= now.getTime()) return;
    const list = liveByUser.get(String(m.user._id)) || [];
    list.push(m);
    liveByUser.set(String(m.user._id), list);
  });
  const hasLive = (userId) => (liveByUser.get(String(userId)) || []).length > 0;

  let planned = 0;
  let sent = 0;
  let skipped = 0;

  for (const m of memberships) {
    if (!m.user || !m.user.email || !m.endDate) continue;
    if (m.status === 'cancelled') continue;

    const daysRemaining = Math.ceil((m.endDate.getTime() - now.getTime()) / DAY_MS);
    const expired = daysRemaining < 0;

    if (!expired && m.status !== 'active') continue;
    if (expired && hasLive(String(m.user._id))) continue;

    const bucket = bucketFor(daysRemaining);
    const alreadySent = Array.isArray(m.emailRemindersSent) && m.emailRemindersSent.includes(bucket);
    if (alreadySent) {
      skipped += 1;
      continue;
    }

    const planName = m.subscription && m.subscription.name ? m.subscription.name : 'Gym';
    planned += 1;

    if (dryRun) {
      console.log(`[reminders:dry] would email ${m.user.email} (${m.user.name || 'member'}) — bucket ${bucket} · ${expired ? 'EXPIRED' : daysRemaining + ' days left'} · plan ${planName} · expires ${formatDate(m.endDate)}`);
      continue;
    }

    const ok = await sendEmail(
      m.user.email,
      `FitHub by Samarth Gym — ${expired ? 'Your membership has expired' : daysRemaining === 0 ? 'Your membership expires today' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`}`,
      reminderEmail({ name: m.user.name, planName, daysRemaining, endDate: m.endDate, expired })
    );

    if (ok) {
      m.emailRemindersSent = Array.isArray(m.emailRemindersSent) ? [...m.emailRemindersSent, bucket] : [bucket];
      await m.save();
      sent += 1;
    }
  }

  console.log(`[reminders] done — planned ${planned}, sent ${sent}, already sent ${skipped}`);
  return { planned, sent, skipped };
};

const startScheduler = () => {
  const run = async () => {
    try {
      const enabled = process.env.EMAIL_REMINDERS_ENABLED !== 'false';
      if (!enabled) {
        console.log('[reminders] disabled via EMAIL_REMINDERS_ENABLED=false');
        return;
      }
      await runReminders();
    } catch (error) {
      console.error('[reminders] run failed:', error.message);
    }
  };

  run();
  setInterval(run, 6 * 60 * 60 * 1000);
  console.log('[reminders] scheduler started (runs on boot + every 6 hours)');
};

module.exports = { runReminders, startScheduler };
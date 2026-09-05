const { sendEmail } = require('./emailSender');

const SITE_URL = process.env.SITE_URL || 'https://fithub-api-3wjz.onrender.com';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const fmtDate = (d) => {
  try {
    return new Date(d || Date.now()).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return new Date().toLocaleString('en-IN');
  }
};

const esc = (s) => String(s === undefined ? '' : s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const buildReceiptHTML = ({
  heading = 'Payment Receipt',
  customerName = '',
  receiptNo = '',
  date = new Date(),
  items = [],
  amountPaid = 0,
  balanceDue = 0,
  method = 'other',
  paid = true,
  note = ''
}) => {
  const status = paid ? 'PAID' : 'PENDING';
  const statusColor = paid ? '#059669' : '#d97706';

  const rows = (items || []).map((it, i) => `
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;">
        ${esc(it.label)}
        ${it.qty > 1 ? `<div style="color:#94a3b8;font-size:12px;">qty ${Number(it.qty) || 1}</div>` : ''}
      </td>
      <td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;text-align:right;font-weight:600;">
        ${inr(it.amount)}
      </td>
    </tr>
  `).join('') || `
    <tr>
      <td colspan="2" style="padding:8px 14px;color:#94a3b8;font-size:13px;">—</td>
    </tr>
  `;

  return `
  <div style="margin:0;padding:20px;background:#f8fafc;">
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#ffffff;">
      <div style="background:linear-gradient(90deg,#f97316,#dc2626);padding:22px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:2px;">FIT<span style="opacity:.85;">HUB</span></div>
              <div style="color:#fff7ed;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-top:2px;">by Samarth Gym</div>
            </td>
            <td align="right" style="vertical-align:middle;">
              <span style="display:inline-block;background:rgba(255,255,255,0.18);color:#ffffff;font-size:12px;font-weight:800;letter-spacing:1px;padding:6px 14px;border-radius:999px;text-transform:uppercase;">${status}</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding:28px;">
        <h2 style="margin:0 0 4px;color:#0f172a;font-size:20px;">${esc(heading)}</h2>
        <p style="margin:0 0 18px;color:#64748b;font-size:13px;">
          Hi ${esc(customerName || 'there')} — details of your transaction with FitHub by Samarth Gym.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
          <tr>
            <td style="padding:6px 0;color:#94a3b8;font-size:12px;">Receipt No.</td>
            <td align="right" style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:700;">${esc(receiptNo)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#94a3b8;font-size:12px;">Date</td>
            <td align="right" style="padding:6px 0;color:#0f172a;font-size:13px;">${esc(fmtDate(date))}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#94a3b8;font-size:12px;">Payment Method</td>
            <td align="right" style="padding:6px 0;color:#0f172a;font-size:13px;text-transform:capitalize;">${esc(method)}</td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #eef2f7;">
          <tr>
            <td colspan="2" style="background:#f8fafc;color:#64748b;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:8px 14px;">Item</td>
          </tr>
          ${rows}
          <tr>
            <td style="padding:10px 14px;color:#64748b;font-size:13px;">Amount Paid</td>
            <td align="right" style="padding:10px 14px;color:#059669;font-size:15px;font-weight:800;">${inr(amountPaid)}</td>
          </tr>
          ${
            Number(balanceDue) > 0
              ? `<tr>
                  <td style="padding:4px 14px 10px;color:#64748b;font-size:13px;">Balance Due</td>
                  <td align="right" style="padding:4px 14px 10px;color:#d97706;font-size:15px;font-weight:800;">${inr(balanceDue)}</td>
                </tr>`
              : ''
          }
        </table>

        ${note ? `<p style="margin:14px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">${esc(note)}</p>` : ''}

        <a href="${SITE_URL}/dashboard" style="display:block;text-align:center;background:linear-gradient(90deg,#f97316,#dc2626);color:#ffffff;text-decoration:none;padding:14px 0;border-radius:999px;font-weight:700;margin:20px 0 6px;font-size:15px;">View on Dashboard</a>

        <p style="color:#94a3b8;font-size:11px;line-height:1.6;margin:0;">
          Need help? Reach us at fithub601@gmail.com or visit the gym — Mon–Sat, 6AM–10PM.
        </p>
      </div>

      <div style="background:#f8fafc;padding:14px 28px;text-align:center;color:#cbd5e1;font-size:11px;">
        FitHub by Samarth Gym · Goregaon East, Mumbai<br/>This is a computer-generated receipt.
      </div>
    </div>
  </div>`;
};

const sendReceiptEmail = async ({
  email, name = '', heading, receiptNo = '', date, items = [], amountPaid = 0,
  balanceDue = 0, method = 'other', paid = true, note = ''
}) => {
  if (!email) return false;
  const subject = paid
    ? `Payment Receipt from FitHub — ${inr(amountPaid)}`
    : `Order Received — FitHub by Samarth Gym`;
  const html = buildReceiptHTML({
    heading: heading || (paid ? 'Payment Receipt' : 'Order Received'),
    customerName: name,
    receiptNo, date, items, amountPaid, balanceDue, method, paid, note
  });
  const ok = await sendEmail(email, subject, html);
  if (ok) console.log(`Receipt email sent to ${email} (${receiptNo})`);
  return ok;
};

module.exports = { sendReceiptEmail };
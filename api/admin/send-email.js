const { requireAdmin } = require('../_admin');
const { supabase } = require('../_supabase-admin');

const templates = {
  received: {
    subject: 'We received your Destilería Coquí order',
    title: 'Your order has been received.',
    body: 'Thank you for your order. Our team is reviewing the details and will contact you when there is an update.'
  },
  ready: {
    subject: 'Your Destilería Coquí pickup order is ready',
    title: 'Your order is ready for pickup.',
    body: 'Your order is ready for pickup. Please bring a valid photo ID when you arrive.'
  },
  picked_up: {
    subject: 'Your Destilería Coquí pickup is complete',
    title: 'Your pickup is complete.',
    body: 'Thank you for visiting Destilería Coquí. We hope you enjoy your order.'
  },
  cancelled: {
    subject: 'Update about your Destilería Coquí order',
    title: 'Your order has been cancelled.',
    body: 'Your order has been cancelled. Please contact us if you have any questions or would like assistance placing another order.'
  }
};

function escape(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
}

function renderEmail(order, template) {
  const items = (order.order_items || []).map(item => (
    `<li>${escape(item.name)} &times; ${Number(item.quantity) || 1}</li>`
  )).join('');
  return `<!doctype html>
    <html><body style="margin:0;background:#f7f2e8;color:#1a1207;font-family:Arial,sans-serif">
      <div style="max-width:620px;margin:0 auto;padding:40px 24px">
        <p style="letter-spacing:4px;text-transform:uppercase;color:#8c3f16;font-size:12px">Destilería Coquí</p>
        <h1 style="font-family:Georgia,serif;font-weight:400;font-size:36px">${escape(template.title)}</h1>
        <p>Hello ${escape(order.customer_name)},</p>
        <p>${escape(template.body)}</p>
        <div style="margin-top:28px;padding:20px;background:#fff;border:1px solid #e6dcc8">
          <p style="margin-top:0"><strong>Order ${escape(order.id.slice(0, 8).toUpperCase())}</strong></p>
          <ul>${items}</ul>
          <p style="margin-bottom:0"><strong>Total: ${escape(money(order.total))}</strong></p>
        </div>
        <p style="margin-top:28px;color:#7d6654">Destilería Coquí<br>Mayagüez, Puerto Rico<br>787-805-1000</p>
      </div>
    </body></html>`;
}

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { order_id: orderId, template: templateName } = req.body || {};
    const template = templates[templateName];
    if (!orderId || !template) return res.status(400).json({ error: 'Choose an email template.' });
    if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL_FROM) {
      throw new Error('Customer email is not configured yet.');
    }
    const orders = await supabase(`orders?id=eq.${encodeURIComponent(orderId)}&select=*,order_items(*)`);
    const order = orders[0];
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.ADMIN_EMAIL_FROM,
        to: [order.email],
        subject: template.subject,
        html: renderEmail(order, template)
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'The email could not be sent.');
    res.status(200).json({ sent: true, id: payload.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

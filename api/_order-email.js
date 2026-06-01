const { supabase } = require('./_supabase-admin');

const staffRecipients = ['orders@prsugar.com', 'destileriacoqui07@gmail.com', 'maria@prsugar.com'];

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

function paymentLabel(order) {
  if (order.payment_method === 'pay_in_store') return 'Pay in person at pickup';
  return order.payment_status === 'paid' ? 'Paid online' : 'Pay online now';
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
          <p><strong>Payment:</strong> ${escape(paymentLabel(order))}</p>
          <p><strong>Subtotal:</strong> ${escape(money(order.subtotal))}</p>
          ${order.express_pickup ? `<p><strong>Express Pickup:</strong> Yes (${escape(money(order.express_pickup_fee))}, non-taxable)</p>` : ''}
          <p><strong>Puerto Rico IVU (11.5%):</strong> ${escape(money(order.tax_total))}</p>
          ${Number(order.shipping_total) ? `<p><strong>Shipping:</strong> ${escape(money(order.shipping_total))}</p>` : ''}
          <p style="margin-bottom:0"><strong>Total:</strong> ${escape(money(order.total))}</p>
        </div>
        <p style="margin-top:28px;color:#7d6654">Destilería Coquí<br>Mayagüez, Puerto Rico<br>787-805-1000</p>
      </div>
    </body></html>`;
}

function staffEmail(order) {
  return `<!doctype html>
    <html><body style="font-family:Arial,sans-serif;color:#1a1207">
      <h1>New ${escape(order.fulfillment_type)} bottle order</h1>
      <p><strong>Order:</strong> ${escape(order.id.slice(0, 8).toUpperCase())}</p>
      <p><strong>Name:</strong> ${escape(order.customer_name)}</p>
      <p><strong>Email:</strong> ${escape(order.email)}</p>
      <p><strong>Phone:</strong> ${escape(order.phone || 'Not provided')}</p>
      <p><strong>Payment:</strong> ${escape(paymentLabel(order))}</p>
      <p><strong>Items:</strong></p>
      <ul>${(order.order_items || []).map(item => `<li>${escape(item.name)} &times; ${Number(item.quantity) || 1}</li>`).join('')}</ul>
      <p><strong>Express Pickup:</strong> ${order.express_pickup ? `Yes (${escape(money(order.express_pickup_fee))}, non-taxable)` : 'No'}</p>
      <p><strong>Puerto Rico IVU:</strong> ${escape(money(order.tax_total))}</p>
      <p><strong>Total:</strong> ${escape(money(order.total))}</p>
    </body></html>`;
}

async function sendResend(payload) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL_FROM) {
    throw new Error('Customer email is not configured yet.');
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...payload,
      ...(process.env.ADMIN_EMAIL_REPLY_TO ? { reply_to: process.env.ADMIN_EMAIL_REPLY_TO } : {})
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'The email could not be sent.');
  return result;
}

async function orderWithItems(orderId) {
  const orders = await supabase(`orders?id=eq.${encodeURIComponent(orderId)}&select=*,order_items(*)`);
  return orders[0] || null;
}

async function sendOrderEmail(order, templateName) {
  const template = templates[templateName];
  if (!template) throw new Error('Choose an email template.');
  const result = await sendResend({
    from: process.env.ADMIN_EMAIL_FROM,
    to: [order.email],
    subject: template.subject,
    html: renderEmail(order, template)
  });
  await supabase(`orders?id=eq.${encodeURIComponent(order.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ last_customer_email_template: templateName, last_customer_email_sent_at: new Date().toISOString() })
  });
  return result;
}

async function sendOrderConfirmation(orderId) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL_FROM) {
    return { sent: false, reason: 'Email delivery is not configured yet.' };
  }
  const claimed = await supabase(`orders?id=eq.${encodeURIComponent(orderId)}&confirmation_email_status=eq.pending&select=id`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ confirmation_email_status: 'sending' })
  });
  if (!claimed.length) return { sent: false, reason: 'Order confirmation was already handled.' };
  try {
    const order = await orderWithItems(orderId);
    if (!order) throw new Error('Order not found.');
    await Promise.all([
      sendOrderEmail(order, 'received'),
      sendResend({
        from: process.env.ADMIN_EMAIL_FROM,
        to: staffRecipients,
        subject: `New ${order.fulfillment_type} bottle order: ${order.customer_name}`,
        html: staffEmail(order)
      })
    ]);
    await supabase(`orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ confirmation_email_status: 'sent', confirmation_email_sent_at: new Date().toISOString() })
    });
    return { sent: true };
  } catch (error) {
    await supabase(`orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ confirmation_email_status: 'pending' })
    });
    throw error;
  }
}

module.exports = { orderWithItems, sendOrderEmail, sendOrderConfirmation };

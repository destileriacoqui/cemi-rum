const { requireAdmin } = require('../_admin');
const { orderWithItems, sendOrderEmail } = require('../_order-email');

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { order_id: orderId, template: templateName } = req.body || {};
    if (!orderId || !templateName) return res.status(400).json({ error: 'Choose an email template.' });
    const order = await orderWithItems(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const payload = await sendOrderEmail(order, templateName);
    res.status(200).json({ sent: true, id: payload.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

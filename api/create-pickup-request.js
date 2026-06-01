const catalog = require('../js/catalog');

async function authenticatedUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://autkqbfgniopxldszdur.supabase.co';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anon) throw new Error('Supabase public environment variables are not configured.');
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Your account session has expired. Please log in again.');
  return response.json();
}

async function supabase(path, options = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://autkqbfgniopxldszdur.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Pickup submission is not configured yet.');
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...options.headers }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Supabase request failed.');
  return payload;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const customer = req.body.customer || {};
    const requested = Array.isArray(req.body.items) ? req.body.items : [];
    if (!customer.full_name || !customer.email) throw new Error('Name and email are required.');
    const items = requested.map(item => {
      const product = catalog[item.slug || item.product_id];
      if (!product) throw new Error('One of the cart items is not available.');
      return { ...product, slug: item.slug || item.product_id, quantity: Math.max(1, Math.min(24, Number(item.quantity) || 1)) };
    });
    if (!items.length) throw new Error('Your cart is empty.');
    const user = await authenticatedUser(req);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [order] = await supabase('orders?select=id', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: user?.id || null, customer_name: customer.full_name, email: customer.email,
        phone: customer.phone || null, fulfillment_type: 'pickup', status: 'pending',
        payment_status: 'unpaid', subtotal, shipping_total: 0, total: subtotal
      })
    });
    await supabase('order_items', {
      method: 'POST',
      body: JSON.stringify(items.map(item => ({
        order_id: order.id, product_id: item.slug, name: item.name, price: item.price,
        quantity: item.quantity, image: item.image, stripe_price_id: null
      })))
    });
    const [pickup] = await supabase('pickup_requests?select=id', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        order_id: order.id, user_id: user?.id || null, customer_name: customer.full_name,
        email: customer.email, phone: customer.phone || null, order_items: items, status: 'pending'
      })
    });
    res.status(200).json({
      pickup_request_id: pickup.id, order_id: order.id, status: 'pending',
      customer, items, subtotal
    });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

const Stripe = require('stripe');
const catalog = require('../js/catalog');
const { ivuFor } = require('./_ivu');
const { identityPurpose, identitySession, requireVerifiedIdentity } = require('./_identity');
const { siteUrl } = require('./_site-url');

async function supabase(path, options = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://autkqbfgniopxldszdur.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Supabase server environment variables are not configured.');
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...options.headers }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Supabase request failed.');
  return payload;
}

async function authenticatedUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://autkqbfgniopxldszdur.supabase.co';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anon) throw new Error('Supabase public environment variables are not configured.');
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Your account session has expired. Please log in again.');
  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe server environment variables are not configured.');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    if (req.body.action === 'create_identity') {
      const purpose = identityPurpose(req.body.purpose);
      const email = String(req.body.customer?.email || '').trim();
      if (!email || !email.includes('@')) throw new Error('Enter a valid email address before verifying your ID.');
      const origin = siteUrl();
      const verificationSession = await stripe.identity.verificationSessions.create({
        type: 'document',
        provided_details: { email },
        metadata: { purpose },
        return_url: `${origin}/identity-return?purpose=${purpose}`
      });
      return res.status(200).json({ url: verificationSession.url, verification_session_id: verificationSession.id });
    }
    if (req.body.action === 'identity_status') {
      const verificationSession = await identitySession(req.body.verification_session_id, req.body.purpose);
      return res.status(200).json({ status: verificationSession.status, error: verificationSession.last_error?.reason || null });
    }
    const requested = Array.isArray(req.body.items) ? req.body.items : [];
    const customer = req.body.customer || {};
    const items = requested.map(item => {
      const product = catalog[item.slug || item.product_id];
      if (!product) throw new Error('One of the cart items is not available.');
      return { ...product, slug: item.slug || item.product_id, quantity: Math.max(1, Math.min(24, Number(item.quantity) || 1)) };
    });
    if (!items.length) throw new Error('Your cart is empty.');
    if (!customer.full_name || !customer.email) throw new Error('Name and email are required.');
    const user = await authenticatedUser(req);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingTotal = 20;
    // Default: treat the shipping fee as taxable when the shipped products are
    // taxable (IVU applies to the shipping fee too). Do not treat shipping as
    // exempt unless an accountant confirms an exemption under Puerto Rico law.
    const taxTotal = ivuFor(subtotal + shippingTotal);
    const verificationSession = await requireVerifiedIdentity(req.body.stripe_identity_verification_session_id, 'shipping');
    const [order] = await supabase('orders?select=id', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: user?.id || null, customer_name: customer.full_name, email: customer.email,
        phone: customer.phone || null, fulfillment_type: 'shipping', subtotal,
        tax_total: taxTotal, shipping_total: shippingTotal, total: subtotal + taxTotal + shippingTotal,
        identity_verification_method: 'stripe_identity', identity_verification_status: verificationSession.status,
        stripe_identity_verification_session_id: verificationSession.id
      })
    });
    await supabase('order_items', {
      method: 'POST',
      body: JSON.stringify(items.map(item => ({
        order_id: order.id, product_id: item.slug, name: item.name, price: item.price,
        quantity: item.quantity, image: item.image, stripe_price_id: null
      })))
    });
    const origin = siteUrl();
    const params = {
      mode: 'payment',
      customer_email: customer.email,
      // We ship alcohol ONLY within Puerto Rico. Stripe treats 'PR' as a
      // distinct country code, so this locks the shipping address to Puerto Rico
      // and prevents mainland US (or any other) shipping addresses at checkout.
      shipping_address_collection: { allowed_countries: ['PR'] },
      line_items: items.map(item => ({
        quantity: item.quantity,
        price_data: { currency: 'usd', unit_amount: Math.round(item.price * 100), product_data: { name: item.name } }
      })).concat([{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(taxTotal * 100),
          product_data: { name: 'Puerto Rico IVU (11.5%)' }
        }
      }]),
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: shippingTotal * 100, currency: 'usd' },
          display_name: 'Flat-rate shipping'
        }
      }],
      metadata: { order_id: order.id, fulfillment_type: 'shipping' },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}&type=shipping`,
      cancel_url: `${origin}/cancel`
    };
    const session = await stripe.checkout.sessions.create(params);
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await supabase(`orders?id=eq.${order.id}`, { method: 'PATCH', body: JSON.stringify({ stripe_session_id: session.id }) });
    }
    res.status(200).json({ url: session.url });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

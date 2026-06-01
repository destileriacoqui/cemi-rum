const Stripe = require('stripe');
const catalog = require('../js/catalog');
const { ivuFor } = require('./_ivu');
const { requireVerifiedIdentity } = require('./_identity');
const { sendOrderConfirmation } = require('./_order-email');
const { siteUrl } = require('./_site-url');

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

function pickupReceipt({ pickup, order, items }) {
  return {
    pickup_request_id: pickup.id, order_id: order.id, status: pickup.status || order.status || 'pending',
    customer: { full_name: order.customer_name, email: order.email, phone: order.phone },
    items, subtotal: Number(order.subtotal), express_pickup: Boolean(order.express_pickup),
    express_pickup_fee: Number(order.express_pickup_fee) || 0,
    identity_verification_method: order.identity_verification_method,
    identity_verification_status: order.identity_verification_status,
    payment_method: order.payment_method, payment_status: order.payment_status,
    tax_total: Number(order.tax_total), total: Number(order.total)
  };
}

async function paidPickupReceipt(req) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe server environment variables are not configured.');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sessionId = String(req.query.session_id || '');
  const pickupRequestId = String(req.query.pickup_request_id || '');
  if (!sessionId || !pickupRequestId) throw new Error('Pickup payment confirmation is incomplete.');
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== 'paid' || session.metadata?.pickup_request_id !== pickupRequestId) {
    throw new Error('Pickup payment has not been confirmed.');
  }
  const pickups = await supabase(`pickup_requests?id=eq.${encodeURIComponent(pickupRequestId)}&select=*`);
  const pickup = pickups[0];
  if (!pickup) throw new Error('Pickup request not found.');
  const orders = await supabase(`orders?id=eq.${encodeURIComponent(pickup.order_id)}&select=*`);
  const order = orders[0];
  if (!order || order.id !== session.metadata?.order_id) throw new Error('Pickup order not found.');
  if (order.payment_status !== 'paid') {
    const updatedAt = new Date().toISOString();
    Object.assign(order, { status: 'submitted', payment_status: 'paid', stripe_session_id: session.id, total: (session.amount_total || 0) / 100 });
    await supabase(`orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: order.status, payment_status: order.payment_status, stripe_session_id: session.id, total: order.total, updated_at: updatedAt })
    });
    await supabase(`pickup_requests?id=eq.${encodeURIComponent(pickup.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status: 'paid', stripe_session_id: session.id, updated_at: updatedAt })
    });
  }
  const items = await supabase(`order_items?order_id=eq.${encodeURIComponent(order.id)}&select=product_id,name,price,quantity,image`);
  try { await sendOrderConfirmation(order.id); } catch (_) {}
  return pickupReceipt({
    pickup, order,
    items: items.map(item => ({ ...item, slug: item.product_id, price: Number(item.price), quantity: Number(item.quantity) }))
  });
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') return res.status(200).json(await paidPickupReceipt(req));
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
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
    const expressPickup = Boolean(req.body.express_pickup);
    const expressPickupFee = expressPickup ? items.reduce((sum, item) => sum + item.quantity, 0) * 5 : 0;
    const taxTotal = ivuFor(subtotal);
    const total = subtotal + expressPickupFee + taxTotal;
    const paymentMethod = req.body.payment_method === 'pay_now' ? 'pay_now' : 'pay_in_store';
    const identityVerificationMethod = req.body.identity_verification_method === 'stripe_identity' ? 'stripe_identity' : 'in_person';
    const verificationSession = identityVerificationMethod === 'stripe_identity'
      ? await requireVerifiedIdentity(req.body.stripe_identity_verification_session_id, 'pickup')
      : null;
    const identityVerificationStatus = verificationSession ? verificationSession.status : 'pending';
    const [order] = await supabase('orders?select=id', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: user?.id || null, customer_name: customer.full_name, email: customer.email,
        phone: customer.phone || null, fulfillment_type: 'pickup', status: 'pending',
        payment_status: 'unpaid', subtotal, tax_total: taxTotal, shipping_total: 0,
        payment_method: paymentMethod,
        express_pickup: expressPickup, express_pickup_fee: expressPickupFee,
        identity_verification_method: identityVerificationMethod, identity_verification_status: identityVerificationStatus,
        stripe_identity_verification_session_id: verificationSession?.id || null,
        total
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
        email: customer.email, phone: customer.phone || null, order_items: items, status: 'pending',
        payment_method: paymentMethod, payment_status: 'unpaid',
        express_pickup: expressPickup, express_pickup_fee: expressPickupFee,
        identity_verification_method: identityVerificationMethod, identity_verification_status: identityVerificationStatus,
        stripe_identity_verification_session_id: verificationSession?.id || null
      })
    });
    const receipt = pickupReceipt({
      pickup: { ...pickup, status: 'pending' },
      order: {
        ...order, customer_name: customer.full_name, email: customer.email, phone: customer.phone || null,
        subtotal, express_pickup: expressPickup, express_pickup_fee: expressPickupFee,
        identity_verification_method: identityVerificationMethod, identity_verification_status: identityVerificationStatus,
        payment_method: paymentMethod, payment_status: 'unpaid', tax_total: taxTotal, total
      },
      items
    });
    if (paymentMethod === 'pay_in_store') {
      try { await sendOrderConfirmation(order.id); } catch (_) {}
      return res.status(200).json(receipt);
    }
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe server environment variables are not configured.');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = siteUrl();
    const lineItems = items.map(item => ({
      quantity: item.quantity,
      price_data: { currency: 'usd', unit_amount: Math.round(item.price * 100), product_data: { name: item.name } }
    }));
    if (expressPickupFee) {
      lineItems.push({
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        price_data: { currency: 'usd', unit_amount: 500, product_data: { name: 'Express Pickup' } }
      });
    }
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'usd', unit_amount: Math.round(taxTotal * 100),
        product_data: { name: 'Puerto Rico IVU (11.5%)' }
      }
    });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', customer_email: customer.email, line_items: lineItems,
      metadata: { order_id: order.id, pickup_request_id: pickup.id, fulfillment_type: 'pickup' },
      success_url: `${origin}/pickup-confirmation?session_id={CHECKOUT_SESSION_ID}&pickup_request_id=${pickup.id}&paid=1`,
      cancel_url: `${origin}/pickup-checkout?payment=cancelled`
    });
    await supabase(`orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: 'PATCH', body: JSON.stringify({ stripe_session_id: session.id })
    });
    await supabase(`pickup_requests?id=eq.${encodeURIComponent(pickup.id)}`, {
      method: 'PATCH', body: JSON.stringify({ stripe_session_id: session.id })
    });
    res.status(200).json({ ...receipt, checkout_url: session.url });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

const Stripe = require('stripe');
const { requireAdmin } = require('../_admin');
const { supabase } = require('../_supabase-admin');
const { orderWithItems, sendOrderEmail } = require('../_order-email');
const { siteUrl } = require('../_site-url');

const allowedStatuses = new Set(['pending', 'ready', 'completed', 'cancelled']);
const allowedTourStatuses = new Set(['pending', 'confirmed', 'completed', 'cancelled']);

function pickupStatus(status) {
  return allowedStatuses.has(status) ? status : 'pending';
}

async function createPickupPaymentCheckout(req, orderId) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe server environment variables are not configured.');
  const orders = await supabase(`orders?id=eq.${encodeURIComponent(orderId)}&select=*,order_items(*),pickup_requests(*)`);
  const order = orders[0];
  const pickup = order?.pickup_requests?.[0];
  if (!order || order.fulfillment_type !== 'pickup' || !pickup) throw new Error('Pickup order not found.');
  if (order.status === 'cancelled') throw new Error('Cancelled orders cannot be paid online.');
  if (order.payment_status === 'paid') throw new Error('This order has already been paid.');
  const items = order.order_items || [];
  if (!items.length) throw new Error('This order does not have any saved products.');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  if (order.stripe_session_id) {
    const existingSession = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    if (existingSession.status === 'open' && existingSession.url) {
      return { checkout_url: existingSession.url };
    }
  }
  const lineItems = items.map(item => ({
    quantity: Number(item.quantity) || 1,
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(Number(item.price) * 100),
      product_data: { name: item.name }
    }
  }));
  if (Number(order.express_pickup_fee) > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(Number(order.express_pickup_fee) * 100),
        product_data: { name: 'Express Pickup' }
      }
    });
  }
  if (Number(order.tax_total) > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(Number(order.tax_total) * 100),
        product_data: { name: 'Puerto Rico IVU (11.5%)' }
      }
    });
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: order.email,
    line_items: lineItems,
    metadata: { order_id: order.id, pickup_request_id: pickup.id, fulfillment_type: 'pickup' },
    success_url: `${siteUrl()}/pickup-confirmation?session_id={CHECKOUT_SESSION_ID}&pickup_request_id=${pickup.id}&paid=1`,
    cancel_url: `${siteUrl()}/admin/orders?payment=cancelled`
  });
  const updatedAt = new Date().toISOString();
  await supabase(`orders?id=eq.${encodeURIComponent(order.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ payment_method: 'pay_now', stripe_session_id: session.id, updated_at: updatedAt })
  });
  await supabase(`pickup_requests?id=eq.${encodeURIComponent(pickup.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ payment_method: 'pay_now', stripe_session_id: session.id, updated_at: updatedAt })
  });
  return { checkout_url: session.url };
}

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const orders = await supabase('orders?deleted_at=is.null&select=*,order_items(*),pickup_requests(*)&order=created_at.desc');
      const tour_bookings = await supabase('tour_bookings?deleted_at=is.null&select=*&order=created_at.desc');
      return res.status(200).json({ orders, tour_bookings });
    }
    if (req.method === 'POST') {
      const { action, order_id: orderId } = req.body || {};
      if (action !== 'create_pickup_payment_checkout' || !orderId) {
        return res.status(400).json({ error: 'Choose a valid admin action.' });
      }
      return res.status(200).json(await createPickupPaymentCheckout(req, orderId));
    }
    if (req.method === 'PATCH') {
      const { order_id: orderId, tour_booking_id: tourBookingId, status, identity_verified: identityVerified } = req.body || {};
      if (tourBookingId) {
        if (!allowedTourStatuses.has(status)) return res.status(400).json({ error: 'Choose a valid tour status.' });
        await supabase(`tour_bookings?id=eq.${encodeURIComponent(tourBookingId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ status, updated_at: new Date().toISOString() })
        });
        return res.status(200).json({ tour_booking_id: tourBookingId, status });
      }
      if (orderId && identityVerified === true) {
        const updatedAt = new Date().toISOString();
        await supabase(`orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ identity_verification_status: 'verified', updated_at: updatedAt })
        });
        await supabase(`pickup_requests?order_id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ age_verified: true, identity_verification_status: 'verified', updated_at: updatedAt })
        });
        return res.status(200).json({ order_id: orderId, identity_verification_status: 'verified' });
      }
      if (!orderId || !allowedStatuses.has(status)) {
        return res.status(400).json({ error: 'Choose a valid order status.' });
      }
      const updatedAt = new Date().toISOString();
      await supabase(`orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, updated_at: updatedAt })
      });
      await supabase(`pickup_requests?order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: pickupStatus(status), updated_at: updatedAt })
      });
      let email = { sent: false };
      const template = status === 'ready' ? 'ready' : status === 'completed' ? 'picked_up' : status === 'cancelled' ? 'cancelled' : null;
      if (template) {
        try {
          const order = await orderWithItems(orderId);
          if (order) {
            const result = await sendOrderEmail(order, template);
            email = { sent: true, id: result.id };
          }
        } catch (error) {
          email = { sent: false, reason: error.message };
        }
      }
      return res.status(200).json({ order_id: orderId, status, email });
    }
    if (req.method === 'DELETE') {
      const { order_id: orderId, tour_booking_id: tourBookingId } = req.body || {};
      const deletedAt = new Date().toISOString();
      if (tourBookingId) {
        await supabase(`tour_bookings?id=eq.${encodeURIComponent(tourBookingId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ deleted_at: deletedAt, updated_at: deletedAt })
        });
        return res.status(200).json({ removed: true, tour_booking_id: tourBookingId });
      }
      if (!orderId) return res.status(400).json({ error: 'Choose an order to remove.' });
      await supabase(`pickup_requests?order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ deleted_at: deletedAt, updated_at: deletedAt })
      });
      await supabase(`orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ deleted_at: deletedAt, updated_at: deletedAt })
      });
      return res.status(200).json({ removed: true, order_id: orderId });
    }
    res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

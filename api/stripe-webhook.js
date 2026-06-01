const Stripe = require('stripe');

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function updateOrder(id, values) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://autkqbfgniopxldszdur.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  const response = await fetch(`${url}/rest/v1/orders?id=eq.${id}`, {
    method: 'PATCH',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  });
  if (!response.ok) throw new Error('Order update failed.');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed.');
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await readBody(req);
    const event = stripe.webhooks.constructEvent(body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await updateOrder(orderId, {
          status: 'submitted',
          payment_status: session.payment_status === 'paid' ? 'paid' : session.payment_status,
          stripe_session_id: session.id,
          shipping_total: (session.total_details?.amount_shipping || 0) / 100,
          total: (session.amount_total || 0) / 100
        });
      }
    }
    res.status(200).json({ received: true });
  } catch (error) { res.status(400).send(`Webhook error: ${error.message}`); }
};

module.exports.config = { api: { bodyParser: false } };

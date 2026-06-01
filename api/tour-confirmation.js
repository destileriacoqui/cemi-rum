const Stripe = require('stripe');
const { supabase } = require('./_supabase-admin');
const { sendTourConfirmation } = require('./_tour-email');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { session_id: sessionId, booking_id: bookingId } = req.query || {};
    if (!sessionId || !bookingId) throw new Error('Tour confirmation details are missing.');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.tour_booking_id !== bookingId || session.payment_status !== 'paid') {
      throw new Error('Tour payment has not been confirmed.');
    }
    await supabase(`tour_bookings?id=eq.${encodeURIComponent(bookingId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        stripe_session_id: session.id,
        payment_status: 'paid',
        status: 'confirmed',
        total: (session.amount_total || 0) / 100,
        updated_at: new Date().toISOString()
      })
    });
    const bookings = await supabase(`tour_bookings?id=eq.${encodeURIComponent(bookingId)}&select=*`);
    const booking = bookings[0];
    if (!booking) throw new Error('Tour booking could not be found.');
    let email = { sent: false };
    try { email = await sendTourConfirmation(booking); } catch (_) {}
    res.status(200).json({ booking, email_sent: email.sent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

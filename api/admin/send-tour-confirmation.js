const { requireAdmin } = require('../_admin');
const { supabase } = require('../_supabase-admin');
const { sendTourConfirmation } = require('../_tour-email');

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { tour_booking_id: bookingId } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: 'Choose a tour booking.' });
    const bookings = await supabase(`tour_bookings?id=eq.${encodeURIComponent(bookingId)}&select=*`);
    const booking = bookings[0];
    if (!booking) return res.status(404).json({ error: 'Tour booking not found.' });
    if (booking.payment_status !== 'paid') return res.status(400).json({ error: 'The tour payment is not confirmed yet.' });
    if (booking.confirmation_email_status === 'sent') {
      await supabase(`tour_bookings?id=eq.${encodeURIComponent(bookingId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ confirmation_email_status: 'pending' })
      });
      booking.confirmation_email_status = 'pending';
    }
    const result = await sendTourConfirmation(booking);
    if (!result.sent) throw new Error(result.reason || 'Tour confirmation email could not be sent.');
    res.status(200).json({ sent: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

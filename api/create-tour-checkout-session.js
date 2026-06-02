const Stripe = require('stripe');
const { supabase } = require('./_supabase-admin');
const { ivuFor } = require('./_ivu');
const { siteUrl } = require('./_site-url');

const weekdayTimes = new Set(['9:30 AM', '11:00 AM', '1:30 PM', '3:00 PM', '4:30 PM']);
const saturdayTimes = new Set(['9:30 AM', '11:00 AM', '1:30 PM', '3:00 PM', '4:00 PM']);

function dateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? value : null;
}

module.exports = async function handler(req, res) {
  /* ---- GET = availability check ---- */
  if (req.method === 'GET') {
    try {
      const tourDate = req.query.date;
      const tourTime = req.query.time;
      if (!tourDate || !tourTime) return res.status(400).json({ error: 'Date and time are required.' });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(tourDate)) return res.status(400).json({ error: 'Invalid date format.' });
      const bookings = await supabase(
        `tour_bookings?tour_date=eq.${encodeURIComponent(tourDate)}&tour_time=eq.${encodeURIComponent(tourTime)}&status=neq.cancelled&deleted_at=is.null&select=guests,adult_guests,child_guests`
      );
      const totalGuests = bookings.reduce((sum, b) => sum + (Number(b.guests) || 0), 0);
      return res.status(200).json({ date: tourDate, time: tourTime, groups: bookings.length, total_guests: totalGuests });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
  /* ---- POST = create checkout session ---- */
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe server environment variables are not configured.');
    const customer = req.body.customer || {};
    const tourDate = dateOnly(req.body.tour_date);
    const tourTime = req.body.tour_time;
    const adults = Math.max(0, Math.min(50, Math.floor(Number(req.body.adult_guests) || 0)));
    const children = Math.max(0, Math.min(50, Math.floor(Number(req.body.child_guests) || 0)));
    const guests = adults + children;
    if (!customer.full_name || !customer.email || !customer.phone) throw new Error('Name, email, and phone are required.');
    if (!tourDate) throw new Error('Choose a tour date.');
    const parsedDate = new Date(`${tourDate}T12:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate < today || parsedDate.getDay() === 0) {
      throw new Error('Choose an available Monday through Saturday.');
    }
    const isSaturday = parsedDate.getDay() === 6;
    const validTimes = isSaturday ? saturdayTimes : weekdayTimes;
    if (!validTimes.has(tourTime)) throw new Error(isSaturday ? 'Saturday tours are available until 4:00 PM.' : 'Choose an available tour time.');
    if (adults < 1) throw new Error('Each booking needs at least one paying adult.');
    if (guests > 50) throw new Error('For groups larger than 50, please call 787-805-1000.');
    const subtotal = adults * 45;
    const taxTotal = ivuFor(subtotal);
    const total = subtotal + taxTotal;
    const [booking] = await supabase('tour_bookings?select=*', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        customer_name: customer.full_name, email: customer.email, phone: customer.phone,
        tour_date: tourDate, tour_time: tourTime, guests, adult_guests: adults,
        child_guests: children, notes: req.body.notes || null,
        status: 'pending', payment_status: 'unpaid', subtotal, tax_total: taxTotal, total
      })
    });
    const origin = siteUrl();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customer.email,
      line_items: [{
        quantity: adults,
        price_data: {
          currency: 'usd',
          unit_amount: 4500,
          product_data: { name: 'Destilería Coquí Distillery Tour', description: `${tourDate} at ${tourTime}` }
        }
      }, {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(taxTotal * 100),
          product_data: { name: 'Puerto Rico IVU (11.5%)' }
        }
      }],
      metadata: { tour_booking_id: booking.id, fulfillment_type: 'tour' },
      success_url: `${origin}/tour-confirmation?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${origin}/tours?booking=cancelled`
    });
    await supabase(`tour_bookings?id=eq.${booking.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ stripe_session_id: session.id })
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

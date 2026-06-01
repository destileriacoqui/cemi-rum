const { requireAdmin } = require('../_admin');
const { supabase } = require('../_supabase-admin');

const allowedStatuses = new Set(['pending', 'ready', 'completed', 'cancelled']);
const allowedTourStatuses = new Set(['pending', 'confirmed', 'completed', 'cancelled']);

function pickupStatus(status) {
  return allowedStatuses.has(status) ? status : 'pending';
}

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const orders = await supabase('orders?select=*,order_items(*),pickup_requests(*)&order=created_at.desc');
      const tour_bookings = await supabase('tour_bookings?select=*&order=created_at.desc');
      return res.status(200).json({ orders, tour_bookings });
    }
    if (req.method === 'PATCH') {
      const { order_id: orderId, tour_booking_id: tourBookingId, status } = req.body || {};
      if (tourBookingId) {
        if (!allowedTourStatuses.has(status)) return res.status(400).json({ error: 'Choose a valid tour status.' });
        await supabase(`tour_bookings?id=eq.${encodeURIComponent(tourBookingId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ status, updated_at: new Date().toISOString() })
        });
        return res.status(200).json({ tour_booking_id: tourBookingId, status });
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
      return res.status(200).json({ order_id: orderId, status });
    }
    res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { supabase } = require('./_supabase-admin');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const tourDate = req.query.date;
    const tourTime = req.query.time;
    if (!tourDate || !tourTime) return res.status(400).json({ error: 'Date and time are required.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tourDate)) return res.status(400).json({ error: 'Invalid date format.' });

    const bookings = await supabase(
      `tour_bookings?tour_date=eq.${encodeURIComponent(tourDate)}&tour_time=eq.${encodeURIComponent(tourTime)}&status=neq.cancelled&select=guests,adult_guests,child_guests`
    );

    const totalGuests = bookings.reduce((sum, b) => sum + (Number(b.guests) || 0), 0);
    const groupCount = bookings.length;

    res.status(200).json({ date: tourDate, time: tourTime, groups: groupCount, total_guests: totalGuests });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

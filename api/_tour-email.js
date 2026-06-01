const { supabase } = require('./_supabase-admin');

const staffRecipients = ['destileriacoqui07@gmail.com', 'maria@prsugar.com'];

function escape(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
}

function friendlyDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function customerEmail(booking) {
  return `<!doctype html>
    <html><body style="margin:0;background:#f7f2e8;color:#1a1207;font-family:Arial,sans-serif">
      <div style="max-width:620px;margin:0 auto;padding:40px 24px">
        <p style="letter-spacing:4px;text-transform:uppercase;color:#8c3f16;font-size:12px">Destilería Coquí</p>
        <h1 style="font-family:Georgia,serif;font-weight:400;font-size:36px">Your distillery tour is confirmed.</h1>
        <p>Hello ${escape(booking.customer_name)},</p>
        <p>Thank you for booking a visit to Destilería Coquí. Your payment has been received.</p>
        <div style="margin-top:28px;padding:20px;background:#fff;border:1px solid #e6dcc8">
          <p><strong>Date:</strong> ${escape(friendlyDate(booking.tour_date))}</p>
          <p><strong>Time:</strong> ${escape(booking.tour_time)}</p>
          <p><strong>Adults:</strong> ${escape(booking.adult_guests)}</p>
          <p><strong>Children under 18:</strong> ${escape(booking.child_guests)}</p>
          <p><strong>Subtotal:</strong> ${escape(money(booking.subtotal))}</p>
          <p><strong>Puerto Rico IVU (11.5%):</strong> ${escape(money(booking.tax_total))}</p>
          <p style="margin-bottom:0"><strong>Total paid:</strong> ${escape(money(booking.total))}</p>
        </div>
        <p style="margin-top:28px;color:#7d6654">Destilería Coquí<br>Mayagüez, Puerto Rico<br>787-805-1000</p>
      </div>
    </body></html>`;
}

function staffEmail(booking) {
  return `<!doctype html>
    <html><body style="font-family:Arial,sans-serif;color:#1a1207">
      <h1>New paid distillery tour booking</h1>
      <p><strong>Confirmation:</strong> ${escape(booking.id.slice(0, 8).toUpperCase())}</p>
      <p><strong>Name:</strong> ${escape(booking.customer_name)}</p>
      <p><strong>Email:</strong> ${escape(booking.email)}</p>
      <p><strong>Phone:</strong> ${escape(booking.phone || 'Not provided')}</p>
      <p><strong>Date:</strong> ${escape(friendlyDate(booking.tour_date))}</p>
      <p><strong>Time:</strong> ${escape(booking.tour_time)}</p>
      <p><strong>Adults:</strong> ${escape(booking.adult_guests)}</p>
      <p><strong>Children under 18:</strong> ${escape(booking.child_guests)}</p>
      <p><strong>Total guests:</strong> ${escape(booking.guests)}</p>
      <p><strong>Subtotal:</strong> ${escape(money(booking.subtotal))}</p>
      <p><strong>Puerto Rico IVU (11.5%):</strong> ${escape(money(booking.tax_total))}</p>
      <p><strong>Total paid:</strong> ${escape(money(booking.total))}</p>
    </body></html>`;
}

async function sendResend(payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'Tour confirmation email could not be sent.');
  return result;
}

async function sendTourConfirmation(booking) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL_FROM) {
    return { sent: false, reason: 'Email delivery is not configured yet.' };
  }
  const claimed = await supabase(`tour_bookings?id=eq.${booking.id}&confirmation_email_status=eq.pending&select=*`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ confirmation_email_status: 'sending' })
  });
  if (!claimed.length) return { sent: booking.confirmation_email_status === 'sent' };
  try {
    await Promise.all([
      sendResend({
        from: process.env.ADMIN_EMAIL_FROM,
        to: [booking.email],
        subject: 'Your Destilería Coquí tour is confirmed',
        html: customerEmail(booking)
      }),
      sendResend({
        from: process.env.ADMIN_EMAIL_FROM,
        to: staffRecipients,
        subject: `New tour booking: ${booking.customer_name} on ${booking.tour_date}`,
        html: staffEmail(booking)
      })
    ]);
    await supabase(`tour_bookings?id=eq.${booking.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ confirmation_email_status: 'sent', confirmation_email_sent_at: new Date().toISOString() })
    });
    return { sent: true };
  } catch (error) {
    await supabase(`tour_bookings?id=eq.${booking.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ confirmation_email_status: 'pending' })
    });
    throw error;
  }
}

module.exports = { sendTourConfirmation };

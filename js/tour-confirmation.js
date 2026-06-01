(async function () {
  const root = document.querySelector('[data-tour-confirmation]');
  const message = document.querySelector('[data-tour-confirmation-message]');
  const params = new URLSearchParams(location.search);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const date = value => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
  try {
    const query = new URLSearchParams({ session_id: params.get('session_id') || '', booking_id: params.get('booking_id') || '' });
    const response = await fetch(`/api/tour-confirmation?${query}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Your tour confirmation could not be loaded.');
    const booking = payload.booking;
    root.innerHTML = `
      <p><span>Confirmation</span>${escape(booking.id.slice(0, 8).toUpperCase())}</p>
      <p><span>Date</span>${escape(date(booking.tour_date))}</p>
      <p><span>Time</span>${escape(booking.tour_time)}</p>
      <p><span>Adults</span>${escape(booking.adult_guests)}</p>
      <p><span>Children under 18</span>${escape(booking.child_guests)}</p>
      <p><span>Subtotal</span>${escape(money(booking.subtotal))}</p>
      <p><span>Puerto Rico IVU (11.5%)</span>${escape(money(booking.tax_total))}</p>
      <p><span>Total paid</span>${escape(money(booking.total))}</p>
      <p><span>Contact</span>${escape(booking.email)} · ${escape(booking.phone)}</p>`;
    message.textContent = payload.email_sent
      ? 'Your payment is confirmed. A confirmation email has been sent.'
      : 'Your payment is confirmed. Save the reservation details below.';
  } catch (error) {
    message.textContent = error.message;
    message.classList.add('is-error');
    root.innerHTML = '<p>Please call 787-805-1000 if you need help with your reservation.</p>';
  }
})();

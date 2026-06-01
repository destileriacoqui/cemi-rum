(function () {
  const form = document.getElementById('tourBookingForm');
  if (!form) return;
  const total = document.getElementById('tourTotal');
  const message = document.getElementById('tourBookingMessage');
  const submit = form.querySelector('[type=submit]');

  function adults() {
    return Math.max(1, Number(form.elements.adult_guests.value) || 1);
  }

  function updateTotal() {
    const subtotal = adults() * 45;
    const tax = Math.round(subtotal * 0.115 * 100) / 100;
    total.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal + tax);
  }

  async function responseJson(response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) : {}; }
    catch (_) { throw new Error('Tour booking is available after the website is deployed.'); }
  }

  form.elements.adult_guests.addEventListener('input', updateTotal);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!form.elements.tour_date.value) {
      message.textContent = 'Choose an available tour date first.';
      message.classList.add('error');
      return;
    }
    submit.disabled = true;
    message.textContent = 'Opening secure payment...';
    message.classList.remove('error');
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/create-tour-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_date: values.tour_date,
          tour_time: values.tour_time,
          adult_guests: values.adult_guests,
          child_guests: values.child_guests,
          notes: values.notes,
          customer: { full_name: values.full_name, email: values.email, phone: values.phone }
        })
      });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error || 'Tour checkout could not be started.');
      location.href = result.url;
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('error');
      submit.disabled = false;
    }
  });
  updateTotal();
})();

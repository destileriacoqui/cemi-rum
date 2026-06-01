(function () {
  const cart = window.CoquiCart;
  const itemsRoot = document.querySelector('[data-pickup-items]');
  const customerRoot = document.querySelector('[data-pickup-customer]');
  const subtotalRoot = document.querySelector('[data-pickup-subtotal]');
  const taxRoot = document.querySelector('[data-pickup-tax]');
  const totalRoot = document.querySelector('[data-pickup-total]');
  const message = document.querySelector('[data-pickup-message]');
  const submit = document.querySelector('[data-submit-pickup]');
  const escape = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const customer = (() => {
    try { return JSON.parse(sessionStorage.getItem('coqui_pickup_customer')) || {}; }
    catch (_) { return {}; }
  })();
  const items = cart.read();
  if (!items.length) location.href = '/cart';

  itemsRoot.innerHTML = items.map(item => `
    <article class="pickup-item">
      <img src="/${item.image}" alt="">
      <div><h2>${escape(item.name)}</h2><p>Quantity: ${item.quantity}</p></div>
      <strong>${cart.money(item.price * item.quantity)}</strong>
    </article>`).join('');
  customerRoot.innerHTML = `
    <p><span>Name</span>${escape(customer.full_name)}</p>
    <p><span>Email</span>${escape(customer.email)}</p>
    <p><span>Phone</span>${escape(customer.phone || 'Not provided')}</p>`;
  const subtotal = cart.subtotal();
  const taxTotal = Math.round(subtotal * 0.115 * 100) / 100;
  subtotalRoot.textContent = cart.money(subtotal);
  taxRoot.textContent = cart.money(taxTotal);
  totalRoot.textContent = cart.money(subtotal + taxTotal);

  async function responseJson(response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) : {}; }
    catch (_) { throw new Error('Pickup submission is not available in this preview yet. Please try again after the website is deployed.'); }
  }
  submit.addEventListener('click', async () => {
    submit.disabled = true;
    message.textContent = 'Submitting your pickup request...';
    try {
      const token = window.CoquiSupabase.getSession()?.access_token;
      const response = await fetch('/api/create-pickup-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ items, customer })
      });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error || 'Your pickup request could not be submitted.');
      sessionStorage.setItem('coqui_pickup_receipt', JSON.stringify(result));
      cart.clear();
      location.href = '/pickup-confirmation';
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('is-error');
      submit.disabled = false;
    }
  });
})();

(function () {
  const cart = window.CoquiCart;
  const itemsRoot = document.querySelector('[data-pickup-items]');
  const customerRoot = document.querySelector('[data-pickup-customer]');
  const subtotalRoot = document.querySelector('[data-pickup-subtotal]');
  const taxRoot = document.querySelector('[data-pickup-tax]');
  const totalRoot = document.querySelector('[data-pickup-total]');
  const express = document.querySelector('[data-express-pickup]');
  const expressRoot = document.querySelector('[data-pickup-express]');
  const expressRow = document.querySelector('[data-express-row]');
  const identityStatus = document.querySelector('[data-pickup-identity-status]');
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
  const expressFee = () => express.checked ? items.reduce((sum, item) => sum + item.quantity, 0) * 5 : 0;
  function renderTotals() {
    const fee = expressFee();
    const taxTotal = Math.round((subtotal + fee) * 0.115 * 100) / 100;
    subtotalRoot.textContent = cart.money(subtotal);
    expressRoot.textContent = cart.money(fee);
    expressRow.hidden = !fee;
    taxRoot.textContent = cart.money(taxTotal);
    totalRoot.textContent = cart.money(subtotal + fee + taxTotal);
    sessionStorage.setItem('coqui_pickup_express', express.checked ? 'yes' : 'no');
  }
  express.checked = sessionStorage.getItem('coqui_pickup_express') === 'yes';
  express.addEventListener('change', renderTotals);
  renderTotals();

  const verifiedSessionId = () => sessionStorage.getItem('coqui_identity_verified_purpose') === 'pickup'
    ? sessionStorage.getItem('coqui_identity_verified_session_id')
    : null;
  if (verifiedSessionId()) {
    document.querySelector('[name=identity_method][value=stripe_identity]').checked = true;
    identityStatus.textContent = 'ID verified securely online.';
  }

  async function responseJson(response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) : {}; }
    catch (_) { throw new Error('Pickup submission is not available in this preview yet. Please try again after the website is deployed.'); }
  }
  document.querySelector('[data-start-pickup-identity]').addEventListener('click', async () => {
    message.classList.remove('is-error');
    message.textContent = 'Opening secure ID verification...';
    try {
      const response = await fetch('/api/create-identity-verification-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'pickup', items, customer })
      });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error || 'ID verification could not be started.');
      sessionStorage.setItem('coqui_identity_session_id', result.verification_session_id);
      sessionStorage.setItem('coqui_identity_purpose', 'pickup');
      location.href = result.url;
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('is-error');
    }
  });
  submit.addEventListener('click', async () => {
    submit.disabled = true;
    message.textContent = 'Submitting your pickup request...';
    try {
      const token = window.CoquiSupabase.getSession()?.access_token;
      const identityVerificationMethod = document.querySelector('[name=identity_method]:checked').value;
      if (identityVerificationMethod === 'stripe_identity' && !verifiedSessionId()) throw new Error('Verify your ID securely online before submitting, or choose to show your ID at pickup.');
      const response = await fetch('/api/create-pickup-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          items, customer, express_pickup: express.checked,
          identity_verification_method: identityVerificationMethod,
          stripe_identity_verification_session_id: verifiedSessionId()
        })
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

(function () {
  const message = document.querySelector('[data-identity-message]');
  const retry = document.querySelector('[data-check-identity]');
  const back = document.querySelector('[data-identity-back]');
  const purpose = new URLSearchParams(location.search).get('purpose') || sessionStorage.getItem('coqui_identity_purpose');
  const verificationSessionId = sessionStorage.getItem('coqui_identity_session_id');

  if (purpose === 'pickup') {
    back.href = '/pickup-checkout';
    back.textContent = 'Back to Pickup';
  }

  async function responseJson(response) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'ID verification could not be checked.');
    return payload;
  }

  async function openShippingCheckout() {
    const items = JSON.parse(sessionStorage.getItem('coqui_identity_cart') || '[]');
    const customer = JSON.parse(sessionStorage.getItem('coqui_identity_customer') || '{}');
    const token = window.CoquiSupabase.getSession()?.access_token;
    message.textContent = 'ID confirmed. Opening secure checkout...';
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ items, customer, stripe_identity_verification_session_id: verificationSessionId })
    });
    const result = await responseJson(response);
    location.href = result.url;
  }

  async function check() {
    retry.hidden = true;
    message.classList.remove('is-error');
    message.textContent = 'Checking your secure ID verification...';
    try {
      const response = await fetch('/api/identity-verification-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, verification_session_id: verificationSessionId })
      });
      const result = await responseJson(response);
      if (result.status === 'verified') {
        sessionStorage.setItem('coqui_identity_verified_session_id', verificationSessionId);
        sessionStorage.setItem('coqui_identity_verified_purpose', purpose);
        if (purpose === 'shipping') return openShippingCheckout();
        message.textContent = 'ID confirmed. Returning to your pickup order...';
        return setTimeout(() => { location.href = '/pickup-checkout?identity=verified'; }, 650);
      }
      if (result.status === 'processing') {
        message.textContent = 'Your ID is still being checked. Please wait a moment, then check again.';
      } else {
        message.textContent = result.error || 'Your ID check needs another step. Please return and start the secure verification again.';
        message.classList.add('is-error');
      }
      retry.hidden = false;
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('is-error');
      retry.hidden = false;
    }
  }

  retry.addEventListener('click', check);
  check();
})();

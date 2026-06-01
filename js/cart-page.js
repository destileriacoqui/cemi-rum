(function () {
  const root = document.querySelector('[data-cart-items]');
  const subtotal = document.querySelector('[data-cart-subtotal]');
  const form = document.querySelector('[data-checkout-form]');
  const message = document.querySelector('[data-cart-message]');
  const cart = window.CoquiCart;
  const createAccount = document.querySelector('[data-create-account]');
  const accountChoice = document.querySelector('[data-account-choice]');
  const accountPassword = document.querySelector('[data-account-password]');
  const signedInNote = document.querySelector('[data-account-signed-in]');
  async function responseJson(response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) : {}; }
    catch (_) { throw new Error('Checkout returned an unexpected response. Please try again or call 787-805-1000 for assistance.'); }
  }
  function render() {
    const items = cart.read();
    subtotal.textContent = cart.money(cart.subtotal());
    if (!items.length) {
      root.innerHTML = '<p class="empty-state">Your cart is empty. Explore our rums and add a bottle when you are ready.</p>';
      document.querySelector('.checkout-panel').hidden = true;
      return;
    }
    root.innerHTML = items.map(item => `
      <article class="cart-item">
        <img src="/${item.image}" alt="">
        <div><h2>${item.name}</h2><button data-remove="${item.slug}">Remove</button></div>
        <div class="qty"><button data-change="${item.slug}" data-delta="-1">−</button><span>${item.quantity}</span><button data-change="${item.slug}" data-delta="1">+</button></div>
        <strong>${cart.money(item.price * item.quantity)}</strong>
      </article>`).join('');
  }
  root.addEventListener('click', event => {
    const remove = event.target.dataset.remove;
    const slug = event.target.dataset.change;
    if (remove) cart.remove(remove);
    if (slug) {
      const item = cart.read().find(x => x.slug === slug);
      cart.update(slug, item.quantity + Number(event.target.dataset.delta));
    }
    render();
  });
  function contact() {
    const details = Object.fromEntries(new FormData(form));
    delete details.account_password;
    return details;
  }
  async function prepareOptionalAccount() {
    if (window.CoquiSupabase.getSession()?.user || !createAccount?.checked) return true;
    const password = form.elements.account_password;
    password.required = true;
    if (!form.reportValidity()) return false;
    const details = contact();
    const email = String(details.email || '').trim().toLowerCase();
    if (sessionStorage.getItem('coqui_optional_account_email') === email) return true;
    message.classList.remove('is-error');
    message.textContent = 'Creating your optional account...';
    const result = await window.CoquiSupabase.signup({
      email, password: password.value, fullName: details.full_name, phone: details.phone
    });
    sessionStorage.setItem('coqui_optional_account_email', email);
    message.textContent = result.access_token
      ? 'Your account is ready. Continuing checkout...'
      : 'Your order can continue as a guest. Check your email after checkout to confirm your optional account.';
    return true;
  }
  async function startIdentityVerification(purpose) {
    if (!form.reportValidity()) return;
    message.classList.remove('is-error');
    message.textContent = 'Opening secure ID verification...';
    try {
      if (!await prepareOptionalAccount()) return;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_identity', purpose, items: cart.read(), customer: contact() })
      });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error || 'ID verification could not be started.');
      sessionStorage.setItem('coqui_identity_session_id', result.verification_session_id);
      sessionStorage.setItem('coqui_identity_purpose', purpose);
      sessionStorage.setItem('coqui_identity_cart', JSON.stringify(cart.read()));
      sessionStorage.setItem('coqui_identity_customer', JSON.stringify(contact()));
      location.href = result.url;
    } catch (error) { message.textContent = error.message; message.classList.add('is-error'); }
  }
  document.querySelector('[data-shipping]')?.addEventListener('click', async () => {
    await startIdentityVerification('shipping');
  });
  document.querySelector('[data-pickup]')?.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    try {
      if (!await prepareOptionalAccount()) return;
      if (typeof window.sessionStorage !== 'undefined') window.sessionStorage.setItem('coqui_pickup_customer', JSON.stringify(contact()));
      location.href = '/pickup-checkout';
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('is-error');
    }
  });
  async function prefill() {
    try {
      const profile = await window.CoquiSupabase.profile();
      if (!profile) return;
      accountChoice.hidden = true;
      signedInNote.hidden = false;
      ['full_name', 'email', 'phone'].forEach(key => { if (profile[key] && form.elements[key]) form.elements[key].value = profile[key]; });
    } catch (_) {}
  }
  window.addEventListener('coqui:cart', render);
  createAccount?.addEventListener('change', () => {
    accountPassword.hidden = !createAccount.checked;
    form.elements.account_password.required = createAccount.checked;
  });
  prefill();
  render();
})();

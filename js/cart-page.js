(function () {
  const root = document.querySelector('[data-cart-items]');
  const subtotal = document.querySelector('[data-cart-subtotal]');
  const form = document.querySelector('[data-checkout-form]');
  const message = document.querySelector('[data-cart-message]');
  const cart = window.CoquiCart;
  async function responseJson(response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) : {}; }
    catch (_) { throw new Error('Checkout is not available in this preview yet. Please try again after the website is deployed.'); }
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
  function contact() { return Object.fromEntries(new FormData(form)); }
  document.querySelector('[data-shipping]')?.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    message.textContent = 'Opening secure checkout...';
    try {
      const token = window.CoquiSupabase.getSession()?.access_token;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ items: cart.read(), customer: contact() })
      });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error || 'Checkout could not be started.');
      location.href = result.url;
    } catch (error) { message.textContent = error.message; message.classList.add('is-error'); }
  });
  document.querySelector('[data-pickup]')?.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    if (typeof window.sessionStorage !== 'undefined') window.sessionStorage.setItem('coqui_pickup_customer', JSON.stringify(contact()));
    location.href = '/pickup-checkout';
  });
  async function prefill() {
    try {
      const profile = await window.CoquiSupabase.profile();
      if (!profile) return;
      ['full_name', 'email', 'phone'].forEach(key => { if (profile[key] && form.elements[key]) form.elements[key].value = profile[key]; });
    } catch (_) {}
  }
  window.addEventListener('coqui:cart', render);
  prefill();
  render();
})();

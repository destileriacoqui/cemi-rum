(function () {
  const api = window.CoquiSupabase;
  const form = document.querySelector('[data-auth-form]');
  const message = document.querySelector('[data-message]');
  const setMessage = (text, error) => {
    if (!message) return;
    message.textContent = text || '';
    message.classList.toggle('is-error', !!error);
  };
  if (form) form.addEventListener('submit', async event => {
    event.preventDefault();
    setMessage('Working...');
    const data = Object.fromEntries(new FormData(form));
    try {
      if (form.dataset.authForm === 'signup') {
        const result = await api.signup({ email: data.email, password: data.password, fullName: data.full_name, phone: data.phone });
        if (!result.access_token) {
          setMessage('Account created. Check your email to confirm your address, then log in.');
          form.reset();
          return;
        }
      } else await api.login(data);
      location.href = '/account';
    } catch (error) { setMessage(error.message, true); }
  });
  async function renderAccount() {
    const root = document.querySelector('[data-account-root]');
    if (!root) return;
    if (!api.getSession()?.user) return location.href = '/login';
    try {
      const profile = await api.profile();
      root.querySelector('[name=full_name]').value = profile?.full_name || '';
      root.querySelector('[name=email]').value = profile?.email || api.getSession().user.email || '';
      root.querySelector('[name=phone]').value = profile?.phone || '';
    } catch (error) { setMessage(error.message, true); }
    root.addEventListener('submit', async event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(root));
      delete values.email;
      try { await api.updateProfile(values); setMessage('Your account details have been saved.'); }
      catch (error) { setMessage(error.message, true); }
    });
  }
  async function renderOrders() {
    const root = document.querySelector('[data-orders-root]');
    if (!root) return;
    if (!api.getSession()?.user) return location.href = '/login';
    try {
      const orders = await api.orders();
      if (!orders.length) return root.innerHTML = '<p class="empty-state">You do not have any saved orders yet.</p>';
      root.innerHTML = orders.map(order => `
        <article class="order-card">
          <div><span class="eyebrow-small">${new Date(order.created_at).toLocaleDateString()}</span><h2>Order ${order.id.slice(0, 8)}</h2></div>
          <p>${order.fulfillment_type} · ${order.payment_status}</p>
          <strong>${window.CoquiCart.money(order.total)}</strong>
        </article>`).join('');
    } catch (error) { root.innerHTML = `<p class="empty-state is-error">${error.message}</p>`; }
  }
  document.querySelector('[data-logout]')?.addEventListener('click', async () => { await api.logout(); location.href = '/'; });
  renderAccount();
  renderOrders();
})();

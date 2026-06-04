(function () {
  const api = window.CoquiSupabase;
  const form = document.querySelector('[data-auth-form]');
  const message = document.querySelector('[data-message]');
  const resend = document.querySelector('[data-resend-confirmation]');
  let confirmationEmail = '';
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
        const mm = parseInt(data.dob_mm, 10);
        const dd = parseInt(data.dob_dd, 10);
        const yyyy = parseInt(data.dob_yyyy, 10);
        if (!mm || !dd || !yyyy || yyyy < 1900 || yyyy > new Date().getFullYear()) {
          setMessage('Please enter a valid date of birth.', true);
          return;
        }
        const AC = window.AlcoholCompliance;
        const age = AC ? AC.calculateAge({ year: yyyy, month: mm, day: dd }) : null;
        if (age === null) {
          setMessage('Please enter a valid date of birth.', true);
          return;
        }
        if (age < 18) {
          setMessage('You must be at least 18 years old to create an account.', true);
          return;
        }
        const result = await api.signup({ email: data.email, password: data.password, fullName: data.full_name, phone: data.phone });
        if (!result.access_token) {
          confirmationEmail = data.email;
          setMessage('Check your email to confirm your address, then log in. If you already have an account, try logging in instead.');
          if (resend) resend.hidden = false;
          form.reset();
          return;
        }
      } else await api.login(data);
      location.href = '/account';
    } catch (error) { setMessage(error.message, true); }
  });
  resend?.addEventListener('click', async () => {
    const email = confirmationEmail || form?.elements.email?.value;
    if (!email) return setMessage('Enter your email address first.', true);
    resend.disabled = true;
    setMessage('Sending a fresh confirmation email...');
    try {
      await api.resendSignupConfirmation(email);
      setMessage('A fresh confirmation email has been requested. Check your inbox and spam folder.');
    } catch (error) {
      setMessage(error.message, true);
    } finally {
      resend.disabled = false;
    }
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
  function statusLabel(order) {
    const s = (order.status || 'pending').toLowerCase();
    const labels = { pending: 'Pending', submitted: 'Submitted', confirmed: 'Confirmed', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' };
    return labels[s] || s.charAt(0).toUpperCase() + s.slice(1);
  }
  function statusClass(order) {
    const s = (order.status || 'pending').toLowerCase();
    if (s === 'completed' || s === 'ready') return 'status-success';
    if (s === 'cancelled') return 'status-cancelled';
    if (s === 'confirmed' || s === 'submitted') return 'status-active';
    return 'status-pending';
  }
  function paymentLabel(order) {
    const p = (order.payment_status || 'unpaid').toLowerCase();
    return p === 'paid' ? 'Paid' : 'Unpaid';
  }
  function fulfillmentLabel(order) {
    const f = (order.fulfillment_type || '').toLowerCase();
    if (f === 'shipping') return 'Shipping';
    if (f === 'pickup') return 'Pickup';
    if (f === 'tour') return 'Tour';
    return f.charAt(0).toUpperCase() + f.slice(1);
  }
  async function renderOrders() {
    const root = document.querySelector('[data-orders-root]');
    if (!root) return;
    if (!api.getSession()?.user) return location.href = '/login';
    try {
      const orders = await api.orders();
      if (!orders.length) return root.innerHTML = '<p class="empty-state">You do not have any saved orders yet.</p>';
      root.innerHTML = orders.map(order => {
        const items = order.order_items || [];
        const date = new Date(order.created_at);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const thumbs = items.slice(0, 4).map(item => {
          const src = item.image ? (item.image.startsWith('/') || item.image.startsWith('http') ? item.image : '/' + item.image) : '/img/placeholder.png';
          return `<img src="${src}" alt="${item.name || 'Product'}" class="order-thumb">`;
        }).join('');
        const extraCount = items.length > 4 ? `<span class="order-thumb-more">+${items.length - 4}</span>` : '';
        const itemSummary = items.map(item =>
          `<span class="order-item-line">${item.name}${item.quantity > 1 ? ' x' + item.quantity : ''}</span>`
        ).join('');
        return `
        <article class="order-card-detail">
          <div class="order-thumbs">${thumbs}${extraCount}</div>
          <div class="order-info">
            <span class="eyebrow-small">${dateStr} · ${fulfillmentLabel(order)}</span>
            <h2>Order ${order.id.slice(0, 8)}</h2>
            <div class="order-items-list">${itemSummary}</div>
          </div>
          <div class="order-meta">
            <strong class="order-total">${window.CoquiCart.money(order.total)}</strong>
            <span class="order-status ${statusClass(order)}">${statusLabel(order)}</span>
            <span class="order-payment">${paymentLabel(order)}</span>
          </div>
        </article>`;
      }).join('');
    } catch (error) { root.innerHTML = `<p class="empty-state is-error">${error.message}</p>`; }
  }
  document.querySelector('[data-logout]')?.addEventListener('click', async () => { await api.logout(); location.href = '/'; });
  renderAccount();
  renderOrders();
})();

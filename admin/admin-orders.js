(function () {
  const root = document.querySelector('[data-admin-orders]');
  const message = document.querySelector('[data-admin-message]');
  const search = document.querySelector('[data-order-search]');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let orders = [];
  let tours = [];
  let activeFilter = 'all';

  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
  const date = value => value ? new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not provided';
  const label = value => ({
    pending: 'Pending',
    submitted: 'Pending',
    confirmed: 'Tour Confirmed',
    ready: 'Ready for Pickup',
    completed: 'Picked Up',
    cancelled: 'Cancelled'
  })[value] || String(value || 'Pending').replaceAll('_', ' ');

  function statusOf(order) {
    return order.status === 'submitted' ? 'pending' : (order.status || 'pending');
  }

  function setMessage(text, isError) {
    message.textContent = text || '';
    message.classList.toggle('is-error', !!isError);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      location.href = '/admin/login';
      throw new Error('Please log in to view orders.');
    }
    if (!response.ok) throw new Error(payload.error || 'The request could not be completed.');
    return payload;
  }

  function pickupFor(order) {
    return Array.isArray(order.pickup_requests) ? order.pickup_requests[0] : null;
  }

  function itemList(order) {
    const items = order.order_items || pickupFor(order)?.order_items || [];
    if (!items.length) return '<li>No items saved</li>';
    return items.map(item => `<li><strong>${Number(item.quantity) || 1} &times;</strong> ${escape(item.name)}</li>`).join('');
  }

  function actionButton(order, status, text, tone = '') {
    if (statusOf(order) === status) return '';
    return `<button class="admin-button ${tone}" type="button" data-status="${status}" data-order-id="${escape(order.id)}">${escape(text)}</button>`;
  }

  function renderOrder(order) {
    const pickup = pickupFor(order);
    const status = statusOf(order);
    const emailTemplate = status === 'ready' ? 'ready' : status === 'completed' ? 'picked_up' : status === 'cancelled' ? 'cancelled' : 'received';
    return `
      <article class="admin-order" data-order-card="${escape(order.id)}">
        <header class="admin-order-header">
          <div>
            <span class="admin-status admin-status-${escape(status)}">${escape(label(status))}</span>
            <h2>Order ${escape(order.id.slice(0, 8).toUpperCase())}</h2>
            <p>Created ${escape(date(order.created_at))}</p>
          </div>
          <strong class="admin-total">${escape(money(order.total))}</strong>
        </header>
        <div class="admin-order-grid">
          <section>
            <h3>Customer</h3>
            <p><strong>${escape(order.customer_name)}</strong></p>
            <p><a href="mailto:${escape(order.email)}">${escape(order.email)}</a></p>
            <p><a href="tel:${escape(order.phone)}">${escape(order.phone || 'No phone number')}</a></p>
          </section>
          <section>
            <h3>Order details</h3>
            <ul class="admin-items">${itemList(order)}</ul>
            <p><strong>Method:</strong> ${escape(order.fulfillment_type === 'pickup' ? 'Pickup' : 'Shipping')}</p>
            <p><strong>Payment:</strong> ${escape(label(order.payment_status))}</p>
          </section>
          <section>
            <h3>Pickup details</h3>
            <p><strong>Date:</strong> ${escape(pickup?.pickup_date || 'Not selected')}</p>
            <p><strong>Time:</strong> ${escape(pickup?.pickup_time || 'Not selected')}</p>
            <p><strong>Notes:</strong> ${escape(pickup?.notes || 'No customer notes')}</p>
          </section>
        </div>
        <footer class="admin-order-actions">
          ${actionButton(order, 'ready', 'Mark as Ready for Pickup', 'admin-button-primary')}
          ${actionButton(order, 'completed', 'Mark as Picked Up')}
          ${actionButton(order, 'cancelled', 'Cancel Order', 'admin-button-danger')}
          <button class="admin-button admin-button-quiet" type="button" data-copy-email="${escape(order.email)}">Copy Customer Email</button>
          <label class="admin-email-template">Email template
            <select data-email-template>
              <option value="received" ${emailTemplate === 'received' ? 'selected' : ''}>Order received</option>
              <option value="ready" ${emailTemplate === 'ready' ? 'selected' : ''}>Ready for pickup</option>
              <option value="picked_up" ${emailTemplate === 'picked_up' ? 'selected' : ''}>Picked up confirmation</option>
              <option value="cancelled" ${emailTemplate === 'cancelled' ? 'selected' : ''}>Cancelled order</option>
            </select>
          </label>
          <button class="admin-button admin-button-email" type="button" data-send-email="${escape(order.id)}">Send Email to Customer</button>
        </footer>
      </article>`;
  }

  function renderTour(booking) {
    const status = booking.status || 'pending';
    return `
      <article class="admin-order" data-tour-card="${escape(booking.id)}">
        <header class="admin-order-header">
          <div>
            <span class="admin-status admin-status-${escape(status)}">${escape(label(status))}</span>
            <h2>Tour ${escape(booking.id.slice(0, 8).toUpperCase())}</h2>
            <p>Created ${escape(date(booking.created_at))}</p>
          </div>
          <strong class="admin-total">${escape(money(booking.total))}</strong>
        </header>
        <div class="admin-order-grid">
          <section>
            <h3>Customer</h3>
            <p><strong>${escape(booking.customer_name)}</strong></p>
            <p><a href="mailto:${escape(booking.email)}">${escape(booking.email)}</a></p>
            <p><a href="tel:${escape(booking.phone)}">${escape(booking.phone || 'No phone number')}</a></p>
          </section>
          <section>
            <h3>Tour details</h3>
            <p><strong>Date:</strong> ${escape(booking.tour_date)}</p>
            <p><strong>Time:</strong> ${escape(booking.tour_time)}</p>
            <p><strong>Adults:</strong> ${escape(booking.adult_guests)}</p>
            <p><strong>Children under 18:</strong> ${escape(booking.child_guests)}</p>
            <p><strong>Total guests:</strong> ${escape(booking.guests)}</p>
          </section>
          <section>
            <h3>Payment & notes</h3>
            <p><strong>Payment:</strong> ${escape(label(booking.payment_status))}</p>
            <p><strong>Email confirmation:</strong> ${escape(label(booking.confirmation_email_status))}</p>
            <p><strong>Notes:</strong> ${escape(booking.notes || 'No customer notes')}</p>
          </section>
        </div>
        <footer class="admin-order-actions">
          ${booking.status !== 'completed' ? `<button class="admin-button admin-button-primary" type="button" data-tour-status="completed" data-tour-id="${escape(booking.id)}">Mark Tour Complete</button>` : ''}
          ${booking.status !== 'cancelled' ? `<button class="admin-button admin-button-danger" type="button" data-tour-status="cancelled" data-tour-id="${escape(booking.id)}">Cancel Tour</button>` : ''}
          <button class="admin-button admin-button-quiet" type="button" data-copy-email="${escape(booking.email)}">Copy Customer Email</button>
          <button class="admin-button admin-button-email" type="button" data-send-tour-email="${escape(booking.id)}">Send Tour Confirmation</button>
        </footer>
      </article>`;
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const visible = orders.filter(order => {
      const searchable = [order.id, order.customer_name, order.email, order.phone].join(' ').toLowerCase();
      return (activeFilter === 'all' || statusOf(order) === activeFilter) && searchable.includes(query);
    });
    const visibleTours = tours.filter(booking => {
      const searchable = [booking.id, booking.customer_name, booking.email, booking.phone].join(' ').toLowerCase();
      return (activeFilter === 'all' || booking.status === activeFilter) && searchable.includes(query);
    });
    root.innerHTML = `
      <h2 class="admin-list-heading">Bottle orders</h2>
      ${visible.length ? visible.map(renderOrder).join('') : '<div class="admin-empty"><p>No matching bottle orders.</p></div>'}
      <h2 class="admin-list-heading">Tour reservations</h2>
      ${visibleTours.length ? visibleTours.map(renderTour).join('') : '<div class="admin-empty"><p>No matching tour reservations.</p></div>'}`;
  }

  async function loadOrders() {
    root.innerHTML = '<div class="admin-loading">Loading orders...</div>';
    setMessage('');
    try {
      const payload = await api('/api/admin/orders');
      orders = payload.orders || [];
      tours = payload.tour_bookings || [];
      render();
    } catch (error) {
      setMessage(error.message, true);
    }
  }

  root.addEventListener('click', async event => {
    const statusButton = event.target.closest('[data-status]');
    const copyButton = event.target.closest('[data-copy-email]');
    const emailButton = event.target.closest('[data-send-email]');
    const tourStatusButton = event.target.closest('[data-tour-status]');
    const tourEmailButton = event.target.closest('[data-send-tour-email]');
    if (copyButton) {
      await navigator.clipboard.writeText(copyButton.dataset.copyEmail);
      setMessage('Customer email copied.');
    }
    if (statusButton) {
      statusButton.disabled = true;
      setMessage('Updating order...');
      try {
        await api('/api/admin/orders', {
          method: 'PATCH',
          body: JSON.stringify({ order_id: statusButton.dataset.orderId, status: statusButton.dataset.status })
        });
        setMessage('Order status updated.');
        await loadOrders();
      } catch (error) {
        setMessage(error.message, true);
        statusButton.disabled = false;
      }
    }
    if (emailButton) {
      emailButton.disabled = true;
      setMessage('Sending email...');
      try {
        const card = emailButton.closest('[data-order-card]');
        const template = card.querySelector('[data-email-template]').value;
        await api('/api/admin/send-email', {
          method: 'POST',
          body: JSON.stringify({ order_id: emailButton.dataset.sendEmail, template })
        });
        setMessage('Customer email sent.');
      } catch (error) {
        setMessage(error.message, true);
      } finally {
        emailButton.disabled = false;
      }
    }
    if (tourStatusButton) {
      tourStatusButton.disabled = true;
      setMessage('Updating tour...');
      try {
        await api('/api/admin/orders', {
          method: 'PATCH',
          body: JSON.stringify({ tour_booking_id: tourStatusButton.dataset.tourId, status: tourStatusButton.dataset.tourStatus })
        });
        setMessage('Tour status updated.');
        await loadOrders();
      } catch (error) {
        setMessage(error.message, true);
        tourStatusButton.disabled = false;
      }
    }
    if (tourEmailButton) {
      tourEmailButton.disabled = true;
      setMessage('Sending tour confirmation...');
      try {
        await api('/api/admin/send-tour-confirmation', {
          method: 'POST',
          body: JSON.stringify({ tour_booking_id: tourEmailButton.dataset.sendTourEmail })
        });
        setMessage('Tour confirmation sent.');
        await loadOrders();
      } catch (error) {
        setMessage(error.message, true);
      } finally {
        tourEmailButton.disabled = false;
      }
    }
  });

  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => filter.classList.toggle('is-active', filter === button));
    activeFilter = button.dataset.filter;
    render();
  }));
  search.addEventListener('input', render);
  document.querySelector('[data-refresh-orders]').addEventListener('click', loadOrders);
  document.querySelector('[data-admin-logout]').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' });
    location.href = '/admin/login';
  });

  api('/api/admin/session').then(loadOrders).catch(() => {});
})();

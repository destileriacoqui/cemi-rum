(async function () {
  let receipt;
  const escape = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const params = new URLSearchParams(location.search);
  try { receipt = JSON.parse(sessionStorage.getItem('coqui_pickup_receipt')); }
  catch (_) {}
  if (params.get('session_id') && params.get('pickup_request_id')) {
    try {
      const response = await fetch(`/api/create-pickup-request?session_id=${encodeURIComponent(params.get('session_id'))}&pickup_request_id=${encodeURIComponent(params.get('pickup_request_id'))}`);
      const paidReceipt = await response.json();
      if (!response.ok) throw new Error(paidReceipt.error || 'Payment confirmation could not be loaded.');
      receipt = paidReceipt;
      sessionStorage.setItem('coqui_pickup_receipt', JSON.stringify(receipt));
      CoquiCart.clear();
    } catch (_) {}
  }
  if (!receipt) return location.href = '/';
  document.querySelector('[data-confirmation-id]').textContent = receipt.pickup_request_id.slice(0, 8).toUpperCase();
  document.querySelector('[data-confirmation-customer]').innerHTML = `
    <p><span>Name</span>${escape(receipt.customer.full_name)}</p>
    <p><span>Email</span>${escape(receipt.customer.email)}</p>
    <p><span>Phone</span>${escape(receipt.customer.phone || 'Not provided')}</p>`;
  document.querySelector('[data-confirmation-items]').innerHTML = receipt.items.map(item => `
    <article class="pickup-item">
      <img src="/${item.image}" alt="">
      <div><h2>${escape(item.name)}</h2><p>Quantity: ${item.quantity}</p></div>
      <strong>${CoquiCart.money(item.price * item.quantity)}</strong>
    </article>`).join('');
  document.querySelector('[data-confirmation-subtotal]').textContent = CoquiCart.money(receipt.subtotal);
  if (receipt.express_pickup) {
    document.querySelector('[data-confirmation-express-row]').hidden = false;
    document.querySelector('[data-confirmation-express]').textContent = CoquiCart.money(receipt.express_pickup_fee);
    document.querySelector('[data-confirmation-express-note]').textContent = 'Express Pickup: requested for pickup in 1 day, subject to product availability.';
  }
  document.querySelector('[data-confirmation-identity]').textContent = receipt.identity_verification_method === 'stripe_identity'
    ? 'ID verification: completed securely online.'
    : 'ID verification: bring a valid photo ID when picking up your order.';
  document.querySelector('[data-confirmation-payment]').textContent = receipt.payment_method === 'pay_now'
    ? 'Payment: paid securely online with Stripe. Your Stripe receipt has been sent by email.'
    : 'Payment: pay in store when picking up your order.';
  if (receipt.payment_method === 'pay_now') {
    document.querySelector('[data-confirmation-lede]').textContent = 'Your payment is confirmed and your pickup order has been submitted. You will receive an email or text message when your order is ready for pickup.';
  }
  document.querySelector('[data-confirmation-tax]').textContent = CoquiCart.money(receipt.tax_total);
  document.querySelector('[data-confirmation-total]').textContent = CoquiCart.money(receipt.total);
})();

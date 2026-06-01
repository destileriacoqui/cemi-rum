(function () {
  let receipt;
  const escape = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  try { receipt = JSON.parse(sessionStorage.getItem('coqui_pickup_receipt')); }
  catch (_) {}
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
  document.querySelector('[data-confirmation-tax]').textContent = CoquiCart.money(receipt.tax_total);
  document.querySelector('[data-confirmation-total]').textContent = CoquiCart.money(receipt.total);
})();

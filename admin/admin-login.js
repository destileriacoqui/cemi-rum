(function () {
  const form = document.querySelector('[data-admin-login]');
  const message = document.querySelector('[data-admin-message]');
  const button = form.querySelector('button');

  function setMessage(text, isError) {
    message.textContent = text || '';
    message.classList.toggle('is-error', !!isError);
  }

  async function json(response) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Login is not available right now.');
    return payload;
  }

  fetch('/api/admin/session').then(response => {
    if (response.ok) location.href = '/admin/orders';
  }).catch(() => {});

  form.addEventListener('submit', async event => {
    event.preventDefault();
    button.disabled = true;
    setMessage('Signing in...');
    try {
      const values = Object.fromEntries(new FormData(form));
      await json(await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      }));
      location.href = '/admin/orders';
    } catch (error) {
      setMessage(error.message, true);
      button.disabled = false;
    }
  });
})();

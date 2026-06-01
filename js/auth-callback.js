(async function () {
  const message = document.querySelector('[data-auth-callback-message]');
  const login = document.querySelector('[data-auth-callback-login]');
  try {
    await window.CoquiSupabase.completeEmailConfirmation();
    message.textContent = 'Your email has been confirmed. Opening your account...';
    setTimeout(() => { location.href = '/account'; }, 650);
  } catch (error) {
    message.textContent = error.message || 'The confirmation link is invalid or has expired. Please create your account again or log in.';
    message.classList.add('is-error');
    login.hidden = false;
  }
})();

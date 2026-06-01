(async function () {
  const message = document.querySelector('[data-auth-callback-message]');
  const login = document.querySelector('[data-auth-callback-login]');
  const resend = document.querySelector('[data-auth-callback-resend]');
  try {
    await window.CoquiSupabase.completeEmailConfirmation();
    message.textContent = 'Your email has been confirmed. Opening your account...';
    setTimeout(() => { location.href = '/account'; }, 650);
  } catch (error) {
    message.textContent = error.message || 'The confirmation link is invalid or has expired. Please request a new confirmation email from the signup page.';
    message.classList.add('is-error');
    login.hidden = false;
    if (resend) resend.hidden = false;
  }
})();

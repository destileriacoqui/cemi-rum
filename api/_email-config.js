const DEFAULT_FROM = 'Destilería Coquí <orders@prsugar.com>';
const DEFAULT_REPLY_TO = 'orders@prsugar.com';

function clean(value) {
  return String(value || '').trim();
}

function resendApiKey() {
  const raw = clean(process.env.RESEND_API_KEY).replace(/^RESEND_API_KEY=/, '');
  const marker = raw.indexOf('ADMIN_EMAIL_FROM=');
  const value = clean(marker === -1 ? raw : raw.slice(0, marker));
  if (!value.startsWith('re_')) throw new Error('Customer email is not configured yet.');
  return value;
}

function validSender(value) {
  return /^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$/.test(value)
    || /^.{1,80}<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/.test(value);
}

function emailConfig() {
  const configuredFrom = clean(process.env.ADMIN_EMAIL_FROM).replace(/^ADMIN_EMAIL_FROM=/, '');
  const configuredReplyTo = clean(process.env.ADMIN_EMAIL_REPLY_TO).replace(/^ADMIN_EMAIL_REPLY_TO=/, '');
  return {
    apiKey: resendApiKey(),
    from: validSender(configuredFrom) ? configuredFrom : DEFAULT_FROM,
    replyTo: validSender(configuredReplyTo) ? configuredReplyTo : DEFAULT_REPLY_TO
  };
}

module.exports = { emailConfig };

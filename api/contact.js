const { emailConfig } = require('./_email-config');

const CONTACT_RECIPIENTS = ['jessica@prsugar.com', 'orders@prsugar.com'];

function escape(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function contactEmail({ firstName, lastName, email, category, subject, message }) {
  return `<!doctype html>
    <html><body style="font-family:Arial,sans-serif;color:#1a1207;margin:0;padding:0">
      <div style="max-width:620px;margin:0 auto;padding:40px 24px">
        <p style="letter-spacing:4px;text-transform:uppercase;color:#8c3f16;font-size:12px;margin-bottom:8px">New Contact Message</p>
        <h1 style="font-family:Georgia,serif;font-weight:400;font-size:28px;margin:0 0 24px">${escape(subject || 'No subject')}</h1>
        <div style="padding:20px;background:#fff;border:1px solid #e6dcc8;margin-bottom:24px">
          <p style="margin:0 0 8px"><strong>Name:</strong> ${escape(firstName)} ${escape(lastName)}</p>
          <p style="margin:0 0 8px"><strong>Email:</strong> <a href="mailto:${escape(email)}">${escape(email)}</a></p>
          <p style="margin:0 0 8px"><strong>Reason:</strong> ${escape(category || 'Not provided')}</p>
          <p style="margin:0 0 8px"><strong>Subject:</strong> ${escape(subject || 'Not provided')}</p>
        </div>
        <div style="padding:20px;background:#faf8f4;border:1px solid #e6dcc8">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8c3f16">Message</p>
          <p style="margin:0;white-space:pre-wrap;line-height:1.7">${escape(message)}</p>
        </div>
        <p style="margin-top:24px;color:#7d6654;font-size:13px">Sent from destileriacoqui.com contact form</p>
      </div>
    </body></html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, category, subject, message } = req.body || {};

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email delivery is not configured yet.' });
  }

  try {
    const config = emailConfig();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: config.from,
        reply_to: email,
        to: CONTACT_RECIPIENTS,
        subject: `Contact${category ? ` [${category}]` : ''}: ${(subject || 'New message').slice(0, 100)} — ${firstName} ${lastName}`,
        html: contactEmail({ firstName, lastName, email, category, subject, message })
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Email could not be sent.');

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error('Contact email error:', error.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again or call us at 787-805-1000.' });
  }
};

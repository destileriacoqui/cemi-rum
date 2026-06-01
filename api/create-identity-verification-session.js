const { identityPurpose, stripeClient } = require('./_identity');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const purpose = identityPurpose(req.body?.purpose);
    const email = String(req.body?.customer?.email || '').trim();
    if (!email || !email.includes('@')) throw new Error('Enter a valid email address before verifying your ID.');
    const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    const session = await stripeClient().identity.verificationSessions.create({
      type: 'document',
      provided_details: { email },
      metadata: { purpose },
      return_url: `${origin}/identity-return?purpose=${purpose}`
    });
    res.status(200).json({ url: session.url, verification_session_id: session.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

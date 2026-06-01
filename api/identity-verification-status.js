const { identitySession } = require('./_identity');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const session = await identitySession(req.body?.verification_session_id, req.body?.purpose);
    res.status(200).json({ status: session.status, error: session.last_error?.reason || null });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const { clearSessionCookie } = require('../_admin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  clearSessionCookie(res);
  res.status(200).json({ authenticated: false });
};

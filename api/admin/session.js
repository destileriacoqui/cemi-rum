const { verifySession } = require('../_admin');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  const session = verifySession(req);
  if (!session) return res.status(401).json({ authenticated: false });
  res.status(200).json({ authenticated: true, name: session.username });
};

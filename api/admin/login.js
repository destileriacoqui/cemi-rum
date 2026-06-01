const { credentialsMatch, setSessionCookie } = require('../_admin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { name, password } = req.body || {};
    if (!credentialsMatch(name, password)) {
      return res.status(401).json({ error: 'Incorrect name or password.' });
    }
    setSessionCookie(res, process.env.ADMIN_USERNAME);
    res.status(200).json({ authenticated: true, name: process.env.ADMIN_USERNAME });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

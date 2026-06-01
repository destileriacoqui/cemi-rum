const { credentialsMatch, setSessionCookie } = require('../_admin');
const { isThrottled, recordFailure, clearFailures } = require('../_admin-login-rate-limit');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    if (isThrottled(req)) {
      return res.status(429).json({ error: 'Too many login attempts. Please try again in a few minutes.' });
    }
    const { name, password } = req.body || {};
    const username = credentialsMatch(name, password);
    if (!username) {
      recordFailure(req);
      return res.status(401).json({ error: 'Incorrect name or password.' });
    }
    clearFailures(req);
    setSessionCookie(res, username);
    res.status(200).json({ authenticated: true, name: username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

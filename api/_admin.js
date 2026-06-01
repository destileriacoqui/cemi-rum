const crypto = require('crypto');

const COOKIE_NAME = 'coqui_admin_session';
const SESSION_SECONDS = 60 * 60 * 12;

function secureEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 64) {
    throw new Error('ADMIN_SESSION_SECRET must be configured with at least 64 characters.');
  }
  return value;
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

function createSession(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expires: Date.now() + SESSION_SECONDS * 1000
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function parseCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((cookies, item) => {
    const split = item.indexOf('=');
    if (split === -1) return cookies;
    cookies[item.slice(0, split).trim()] = decodeURIComponent(item.slice(split + 1).trim());
    return cookies;
  }, {});
}

function verifySession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !secureEqual(sign(payload), signature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.username || !session.expires || session.expires < Date.now()) return null;
    return session;
  } catch (_) {
    return null;
  }
}

function adminAccounts() {
  return [
    { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD },
    { username: process.env.ADMIN_USERNAME_2, password: process.env.ADMIN_PASSWORD_2 }
  ].filter(account => account.username && account.password);
}

function credentialsMatch(username, password) {
  const accounts = adminAccounts();
  if (!accounts.length) {
    throw new Error('Admin login is not configured yet.');
  }
  return accounts.find(account => secureEqual(username, account.username) && secureEqual(password, account.password))?.username || null;
}

function setSessionCookie(res, username) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(createSession(username))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_SECONDS}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

function requireAdmin(req, res) {
  const session = verifySession(req);
  if (!session) {
    res.status(401).json({ error: 'Please log in to view orders.' });
    return null;
  }
  return session;
}

module.exports = {
  clearSessionCookie,
  credentialsMatch,
  requireAdmin,
  setSessionCookie,
  verifySession
};

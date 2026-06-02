const crypto = require('crypto');

const COOKIE_NAME = 'coqui_maintenance_owner';
const COOKIE_SECONDS = 60 * 60 * 24 * 7;

function secureEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function secret() {
  const value = process.env.MAINTENANCE_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 64) {
    throw new Error('MAINTENANCE_SESSION_SECRET must be configured with at least 64 characters.');
  }
  return value;
}

function ownerToken() {
  return crypto.createHmac('sha256', secret()).update('owner-access').digest('base64url');
}

function passwordMatches(password) {
  const expected = process.env.MAINTENANCE_OWNER_PASSWORD;
  if (!expected) {
    throw new Error('MAINTENANCE_OWNER_PASSWORD is not configured.');
  }
  return secureEqual(password, expected);
}

function setOwnerCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(ownerToken())}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_SECONDS}`);
}

module.exports = {
  passwordMatches,
  setOwnerCookie
};

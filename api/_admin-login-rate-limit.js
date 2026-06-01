const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

const attempts = new Map();

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function recordFailure(req) {
  const ip = clientIp(req);
  const now = Date.now();
  let record = attempts.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { windowStart: now, count: 0 };
    attempts.set(ip, record);
  }
  record.count += 1;
}

function isThrottled(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record) return false;
  if (now - record.windowStart > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function clearFailures(req) {
  attempts.delete(clientIp(req));
}

module.exports = { recordFailure, isThrottled, clearFailures };

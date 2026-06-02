function normalizeSiteUrl(value) {
  const url = new URL(String(value || '').trim());
  const isLocal = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) {
    throw new Error('SITE_URL must use HTTPS.');
  }
  return url.origin;
}

function siteUrl() {
  if (!process.env.SITE_URL) throw new Error('SITE_URL is not configured.');
  return normalizeSiteUrl(process.env.SITE_URL);
}

module.exports = { normalizeSiteUrl, siteUrl };

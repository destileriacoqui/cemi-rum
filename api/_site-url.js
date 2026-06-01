function siteUrl() {
  const url = process.env.SITE_URL;
  if (!url) throw new Error('SITE_URL is not configured.');
  return url.replace(/\/+$/, '');
}

module.exports = { siteUrl };

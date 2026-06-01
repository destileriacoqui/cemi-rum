(function () {
  const SESSION_KEY = 'coqui_supabase_session';
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  function assertUuid(value) {
    if (!UUID_RE.test(value)) throw new Error('Invalid account identifier.');
  }
  const memory = {};
  const storage = typeof window.localStorage !== 'undefined' ? window.localStorage : {
    getItem: key => memory[key] || null,
    setItem: (key, value) => { memory[key] = String(value); },
    removeItem: key => { delete memory[key]; }
  };
  let configPromise;
  const getConfig = () => configPromise || (configPromise = fetch('/api/config').then(r => {
    if (!r.ok) throw new Error('Account service is not configured yet.');
    return r.json();
  }));
  const getSession = () => {
    try { return JSON.parse(storage.getItem(SESSION_KEY)); }
    catch (_) { return null; }
  };
  const saveSession = value => {
    if (value) storage.setItem(SESSION_KEY, JSON.stringify(value));
    else storage.removeItem(SESSION_KEY);
    window.CoquiAuth?.setSession(value);
  };
  async function request(path, options = {}) {
    const cfg = await getConfig();
    const current = getSession();
    const headers = {
      apikey: cfg.supabaseAnonKey,
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (current?.access_token) headers.Authorization = `Bearer ${current.access_token}`;
    const response = await fetch(`${cfg.supabaseUrl}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.msg || payload.message || payload.error_description || 'Something went wrong.');
    return payload;
  }
  async function signup({ email, password, fullName, phone }) {
    const cfg = await getConfig();
    const base = cfg.siteUrl || location.origin;
    const redirect = encodeURIComponent(`${base}/auth/callback`);
    const payload = await request(`/auth/v1/signup?redirect_to=${redirect}`, {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { full_name: fullName, phone } })
    });
    if (payload.access_token) {
      saveSession(payload);
      await claimGuestOrders();
    }
    return payload;
  }
  async function resendSignupConfirmation(email) {
    const cfg = await getConfig();
    const base = cfg.siteUrl || location.origin;
    const redirect = encodeURIComponent(`${base}/auth/callback`);
    return request(`/auth/v1/resend?redirect_to=${redirect}`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'signup',
        email: String(email || '').trim().toLowerCase()
      })
    });
  }
  async function completeEmailConfirmation() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(location.search);
    const error = params.get('error_description') || params.get('error') || query.get('error_description') || query.get('error');
    if (error) throw new Error(error);
    const cfg = await getConfig();
    const tokenHash = query.get('token_hash');
    const type = query.get('type') || 'signup';
    if (tokenHash) {
      const response = await fetch(`${cfg.supabaseUrl}/auth/v1/verify`, {
        method: 'POST',
        headers: { apikey: cfg.supabaseAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_hash: tokenHash, type })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.msg || payload.message || 'The confirmation link is invalid or has expired. Please request a new confirmation email from the signup page.');
      if (payload.access_token) {
        saveSession(payload);
        history.replaceState({}, document.title, location.pathname);
        await claimGuestOrders();
        return payload;
      }
    }
    const accessToken = params.get('access_token');
    if (!accessToken) throw new Error('The confirmation link is invalid or has expired. Please request a new confirmation email from the signup page.');
    const response = await fetch(`${cfg.supabaseUrl}/auth/v1/user`, {
      headers: { apikey: cfg.supabaseAnonKey, Authorization: `Bearer ${accessToken}` }
    });
    const user = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(user.message || 'Your confirmed account could not be opened.');
    const expiresIn = Number(params.get('expires_in')) || 3600;
    const session = {
      access_token: accessToken,
      refresh_token: params.get('refresh_token'),
      token_type: params.get('token_type') || 'bearer',
      expires_in: expiresIn,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
      user
    };
    saveSession(session);
    history.replaceState({}, document.title, location.pathname);
    await claimGuestOrders();
    return session;
  }
  async function login({ email, password }) {
    const payload = await request('/auth/v1/token?grant_type=password', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    saveSession(payload);
    await claimGuestOrders();
    return payload;
  }
  async function logout() {
    try { await request('/auth/v1/logout', { method: 'POST' }); } catch (_) {}
    saveSession(null);
  }
  async function profile() {
    const current = getSession();
    if (!current?.user?.id) return null;
    assertUuid(current.user.id);
    const rows = await request(`/rest/v1/profiles?id=eq.${current.user.id}&select=*`);
    return rows[0] || null;
  }
  async function updateProfile(values) {
    const current = getSession();
    assertUuid(current.user.id);
    return request(`/rest/v1/profiles?id=eq.${current.user.id}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(values)
    });
  }
  async function orders() {
    const current = getSession();
    if (!current?.user?.id) return [];
    assertUuid(current.user.id);
    return request(`/rest/v1/orders?user_id=eq.${current.user.id}&select=*,order_items(*)&order=created_at.desc`);
  }
  async function claimGuestOrders() {
    if (!getSession()?.access_token) return;
    await request('/rest/v1/rpc/claim_my_guest_orders', { method: 'POST', body: '{}' });
  }
  window.CoquiSupabase = { getConfig, getSession, saveSession, signup, resendSignupConfirmation, completeEmailConfirmation, login, logout, profile, updateProfile, orders, claimGuestOrders };
})();

(function () {
  const SESSION_KEY = 'coqui_supabase_session';
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
    const payload = await request('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { full_name: fullName, phone } })
    });
    if (payload.access_token) saveSession(payload);
    return payload;
  }
  async function login({ email, password }) {
    const payload = await request('/auth/v1/token?grant_type=password', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    saveSession(payload);
    return payload;
  }
  async function logout() {
    try { await request('/auth/v1/logout', { method: 'POST' }); } catch (_) {}
    saveSession(null);
  }
  async function profile() {
    const current = getSession();
    if (!current?.user?.id) return null;
    const rows = await request(`/rest/v1/profiles?id=eq.${current.user.id}&select=*`);
    return rows[0] || null;
  }
  async function updateProfile(values) {
    const current = getSession();
    return request(`/rest/v1/profiles?id=eq.${current.user.id}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(values)
    });
  }
  async function orders() {
    const current = getSession();
    if (!current?.user?.id) return [];
    return request(`/rest/v1/orders?user_id=eq.${current.user.id}&select=*,order_items(*)&order=created_at.desc`);
  }
  window.CoquiSupabase = { getConfig, getSession, saveSession, signup, login, logout, profile, updateProfile, orders };
})();

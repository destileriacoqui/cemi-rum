(function () {
  const CART_KEY = 'coqui_cart_v1';
  const SESSION_KEY = 'coqui_supabase_session';
  const rootPath = '/';
  const memory = {};
  const storage = typeof window.localStorage !== 'undefined' ? window.localStorage : {
    getItem: key => memory[key] || null,
    setItem: (key, value) => { memory[key] = String(value); },
    removeItem: key => { delete memory[key]; }
  };
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  function readCart() {
    try { return JSON.parse(storage.getItem(CART_KEY)) || []; }
    catch (_) { return []; }
  }
  function writeCart(items) {
    storage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('coqui:cart', { detail: items }));
    updateHeader();
  }
  function normalize(item) {
    return {
      product_id: item.product_id || item.slug,
      slug: item.slug || item.product_id,
      name: item.name,
      price: Number(item.price),
      quantity: Math.max(1, Number(item.quantity) || 1),
      image: item.image,
      stripe_price_id: item.stripe_price_id || null
    };
  }
  function add(item) {
    const next = readCart();
    const normalized = normalize(item);
    const existing = next.find(x => x.slug === normalized.slug);
    if (existing) existing.quantity += normalized.quantity;
    else next.push(normalized);
    writeCart(next);
  }
  function update(slug, quantity) {
    const next = readCart();
    const item = next.find(x => x.slug === slug);
    if (!item) return;
    if (quantity <= 0) return remove(slug);
    item.quantity = quantity;
    writeCart(next);
  }
  function remove(slug) { writeCart(readCart().filter(item => item.slug !== slug)); }
  function clear() { writeCart([]); }
  function count() { return readCart().reduce((sum, item) => sum + item.quantity, 0); }
  function subtotal() { return readCart().reduce((sum, item) => sum + item.price * item.quantity, 0); }
  function session() {
    try { return JSON.parse(storage.getItem(SESSION_KEY)); }
    catch (_) { return null; }
  }
  function setSession(value) {
    if (value) storage.setItem(SESSION_KEY, JSON.stringify(value));
    else storage.removeItem(SESSION_KEY);
    updateHeader();
  }
  function updateHeader() {
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count(); });
    document.querySelectorAll('[data-account-label]').forEach(el => {
      el.textContent = session()?.user ? 'Account' : 'Login';
    });
  }
  function injectHeaderControls() {
    const nav = document.querySelector('nav');
    if (!nav || nav.querySelector('.commerce-nav')) return;
    const controls = document.createElement('div');
    controls.className = 'commerce-nav';
    controls.innerHTML = `
      <a class="commerce-account" href="${session()?.user ? rootPath + 'account' : rootPath + 'login'}" data-account-label>${session()?.user ? 'Account' : 'Login'}</a>
      <a class="commerce-cart" href="${rootPath}cart" aria-label="Shopping cart">
        <span>Cart</span><b data-cart-count>${count()}</b>
      </a>`;
    nav.appendChild(controls);
  }
  function injectStyles() {
    if (document.getElementById('coqui-commerce-styles')) return;
    const style = document.createElement('style');
    style.id = 'coqui-commerce-styles';
    style.textContent = `
      .commerce-nav{display:flex;align-items:center;gap:1rem;margin-left:1.35rem}
      .commerce-nav a{font:400 .58rem/1 'DM Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;color:var(--muted,#7D6654);transition:color .3s ease}
      .commerce-nav a:hover{color:var(--amber,#8C3F16)}
      .commerce-cart{display:flex;align-items:center;gap:.45rem}
      .commerce-cart b{display:grid;place-items:center;width:1.35rem;height:1.35rem;border-radius:50%;background:var(--amber,#8C3F16);color:#F7F2E8;font-size:.55rem;letter-spacing:0}
      @media(max-width:900px){.commerce-nav{margin-left:auto;margin-right:3.2rem}.commerce-account{display:none}.commerce-nav a{font-size:.52rem}}
      @media(max-width:520px){nav .nav-logo img{width:8rem}.nav-toggle{margin-left:auto}.commerce-nav{margin-left:.65rem;margin-right:0}.commerce-cart span{display:none}}
    `;
    document.head.appendChild(style);
  }
  window.CoquiCart = { read: readCart, add, update, remove, clear, count, subtotal, money };
  window.CoquiAuth = { session, setSession };
  injectStyles();
  injectHeaderControls();
  updateHeader();
})();

/* =============================================================================
 * Destilería Coquí — Alcohol compliance: single source of truth (runtime).
 *
 * This file centralizes BOTH the configurable compliance flags AND the exact
 * copy shown to users, plus the pure decision functions. It is the runtime
 * source consumed by the static front-end (loaded with <script> as
 * window.AlcoholCompliance) AND by the Node serverless layer (require/import).
 * lib/alcoholCompliance.ts is a typed wrapper around this file.
 *
 * IMPORTANT (read before editing):
 *  - Nothing in here is legal advice. These are owner-configurable defaults.
 *    The owner must confirm every flag with Hacienda, an attorney, the payment
 *    processor, and any carrier/delivery provider before relying on it.
 *  - Online alcohol checkout, shipping, and delivery are DISABLED by default.
 *    Do not flip them on in code. They are gated behind explicit flags so the
 *    owner can enable them only after the reviews above.
 * ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // node / serverless
  if (root) root.AlcoholCompliance = api;                                  // browser
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* --- Environment override helper (serverless reads process.env; the browser
     just uses the defaults below, which the owner edits or the admin overrides
     at runtime via AlcoholCompliance.configure()). ------------------------- */
  function envBool(name, fallback) {
    try {
      if (typeof process !== 'undefined' && process.env && name in process.env) {
        return String(process.env[name]).toLowerCase() === 'true';
      }
    } catch (e) {}
    return fallback;
  }
  function envInt(name, fallback) {
    try {
      if (typeof process !== 'undefined' && process.env && process.env[name]) {
        var n = parseInt(process.env[name], 10);
        if (!Number.isNaN(n)) return n;
      }
    } catch (e) {}
    return fallback;
  }

  /* ----------------------------- CONFIG FLAGS ------------------------------ */
  /* Puerto Rico default is 18+. If STRICT_ALCOHOL_MODE is true, 21+ is used
     everywhere via getRequiredAlcoholAge(). */
  var config = {
    LEGAL_DRINKING_AGE: envInt('LEGAL_DRINKING_AGE', 18),
    STRICT_ALCOHOL_MODE: envBool('STRICT_ALCOHOL_MODE', false),
    STRICT_ALCOHOL_AGE: envInt('STRICT_ALCOHOL_AGE', 21),

    // Online checkout is ENABLED per owner instruction, but every checkout is
    // gated by a mandatory age + government-issued-ID confirmation (no matter
    // what). Shipping/delivery stay DISABLED until legally confirmed.
    // NOTE: enabling online alcohol sale still requires Hacienda licensing,
    // payment-processor approval, and attorney review before going live.
    ALLOW_ALCOHOL_ONLINE_CHECKOUT: envBool('ALLOW_ALCOHOL_ONLINE_CHECKOUT', true),
    ALLOW_ALCOHOL_SHIPPING:        envBool('ALLOW_ALCOHOL_SHIPPING', false),
    ALLOW_ALCOHOL_DELIVERY:        envBool('ALLOW_ALCOHOL_DELIVERY', false),
    ALLOW_PICKUP_REQUESTS:         envBool('ALLOW_PICKUP_REQUESTS', true),

    // ID / verification requirements.
    REQUIRE_ID_AT_CHECKOUT:   envBool('REQUIRE_ID_AT_CHECKOUT', true),
    REQUIRE_ID_AT_PICKUP:     envBool('REQUIRE_ID_AT_PICKUP', true),
    REQUIRE_ID_FOR_SHIPPING:  envBool('REQUIRE_ID_FOR_SHIPPING', true),
    REQUIRE_ID_FOR_TASTINGS:  envBool('REQUIRE_ID_FOR_TASTINGS', true),

    // Notices.
    REQUIRE_PREGNANCY_WARNING:            envBool('REQUIRE_PREGNANCY_WARNING', true),
    REQUIRE_RESPONSIBLE_DRINKING_NOTICE:  envBool('REQUIRE_RESPONSIBLE_DRINKING_NOTICE', true),
    SHOW_ALCOHOL_POLICY_LINKS:            envBool('SHOW_ALCOHOL_POLICY_LINKS', true)
  };

  /* Runtime override hook (admin settings can call this with stored values). */
  function configure(overrides) {
    if (overrides && typeof overrides === 'object') {
      Object.keys(overrides).forEach(function (k) {
        if (k in config) config[k] = overrides[k];
      });
    }
    return config;
  }
  function getConfig() { return Object.assign({}, config); }

  /* ------------------------------- COPY ------------------------------------ */
  /* All user-facing compliance strings live here so they can be reviewed in one
     place. Owner/attorney may revise wording; do not scatter copies elsewhere. */
  var copy = {
    // Federal Alcoholic Beverage Labeling Act government warning (verbatim).
    GOVERNMENT_WARNING:
      'GOVERNMENT WARNING: According to the Surgeon General, alcoholic beverages ' +
      'should not be consumed during pregnancy because of the risk of birth ' +
      'defects. Consumption of alcoholic beverages impairs your ability to drive ' +
      'a car or operate machinery, and may cause health problems.',

    PREGNANCY_WARNING_PR:
      'Alcohol consumption during pregnancy may cause serious harm, including ' +
      'fetal alcohol syndrome.',

    RESPONSIBLE_DRINKING:
      'Please enjoy responsibly. Made for responsible enjoyment by adults of ' +
      'legal drinking age. Do not drink and drive.',

    // Product detail compliance block (verbatim per owner spec).
    PRODUCT_DISCLAIMER:
      'Alcohol product. Must be of legal drinking age to purchase. Valid ' +
      'government-issued photo ID required at pickup or delivery. Orders may be ' +
      'refused or refunded if ID cannot be verified. Availability, pricing, and ' +
      'pickup/shipping options may change without notice.',

    CARD_LABEL: 'Alcohol product. Legal drinking age required.',

    // Cart / checkout.
    CHECKOUT_AGE_ID_CONFIRM:
      'I confirm that I am of legal drinking age and that the person receiving ' +
      'this order will present valid government-issued photo ID if required.',
    CHECKOUT_REFUSAL_NOTICE:
      'Orders may be refused or refunded if valid government-issued photo ID ' +
      'cannot be verified.',

    // Pickup.
    PICKUP_ID_REQUIRED:
      'Alcohol will not be released without valid government-issued photo ID. ' +
      'The person picking up must be of legal drinking age.',
    PICKUP_CONFIRMATION:
      'Valid government-issued photo ID is required at pickup. The name on the ' +
      'order should match the person picking up the order.',
    PICKUP_ADMIN_WARNING:
      'Do not release alcohol unless valid government-issued photo ID confirms ' +
      'the receiver is of legal drinking age.',

    // Shipping / delivery (only shown if explicitly enabled).
    SHIPPING_ID_REQUIRED:
      'Adult recipient and valid government-issued photo ID required upon ' +
      'delivery. Alcohol orders cannot be delivered to anyone under the legal ' +
      'drinking age.',
    SHIPPING_ADMIN_WARNING:
      'Do not enable alcohol shipping or delivery until Puerto Rico law, ' +
      'Hacienda rules, carrier rules, payment processor requirements, and ' +
      'attorney review are confirmed.',

    // Tours / tastings.
    TASTING_CHECKBOX:
      'I understand that tastings are only available to guests of legal drinking ' +
      'age with valid government-issued photo ID.',
    TASTING_RESTRICTION:
      'Guests under the legal drinking age may not participate in tastings.',
    GENERAL_TOUR_NOTE:
      'General tour only. No alcohol tasting for guests under legal drinking age.',
    TOUR_EMAIL_NOTICE:
      'Please bring valid government-issued photo ID. Tastings are restricted to ' +
      'guests of legal drinking age.',

    // Age gate.
    AGE_GATE_QUESTION: 'Are you of legal drinking age in your location?',
    AGE_GATE_YES: 'Yes, enter',
    AGE_GATE_NO: 'No, exit',
    AGE_RESTRICTED_MESSAGE:
      'You must be of legal drinking age to access this website.',

    // Newsletter.
    NEWSLETTER_OPTIN:
      'I agree to receive emails from Destilería Coquí. I can unsubscribe at any time.',

    // Admin warnings.
    ADMIN_LICENSING_WARNING:
      'Alcohol sales require proper Puerto Rico Hacienda licensing.',
    ADMIN_ENABLE_WARNING:
      'Do not enable online alcohol checkout, shipping, or delivery until ' +
      'reviewed by Hacienda, an attorney, payment processor, and ' +
      'delivery/shipping provider.',
    ADMIN_CLAIMS_WARNING:
      'Do not publish claims that imply health benefits or misleading product effects.'
  };

  /* --------------------------- CORE FUNCTIONS ------------------------------ */

  // Whole-years age from a Date or {year,month,day} (month is 1-12). Returns
  // null when the input is incomplete/invalid (never throws).
  function calculateAge(dateOfBirth, now) {
    var dob = toDate(dateOfBirth);
    if (!dob) return null;
    var ref = now ? toDate(now) : new Date();
    if (!ref) ref = new Date();
    var age = ref.getFullYear() - dob.getFullYear();
    var m = ref.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age--;
    return age;
  }

  function toDate(value) {
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (value && typeof value === 'object' &&
        value.year != null && value.month != null && value.day != null) {
      var y = parseInt(value.year, 10), mo = parseInt(value.month, 10), d = parseInt(value.day, 10);
      if ([y, mo, d].some(Number.isNaN)) return null;
      if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
      var dt = new Date(y, mo - 1, d);
      // reject overflow (e.g. Feb 30 -> Mar 2)
      if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
      return dt;
    }
    if (typeof value === 'string' && value) {
      var parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  // The effective minimum age (21 in strict mode, otherwise the configured age).
  function getRequiredAlcoholAge() {
    return config.STRICT_ALCOHOL_MODE ? config.STRICT_ALCOHOL_AGE : config.LEGAL_DRINKING_AGE;
  }

  function isOfLegalDrinkingAge(dateOfBirth, now) {
    var age = calculateAge(dateOfBirth, now);
    if (age == null) return false;
    return age >= getRequiredAlcoholAge();
  }

  // Has this browser session/visitor already passed the age gate?
  function isAgeVerified() {
    try {
      return readStore('local').ageVerified === true || readStore('session').ageVerified === true;
    } catch (e) { return false; }
  }

  function canViewAlcoholContent() { return isAgeVerified(); }
  function canRequestAlcoholPickup() { return config.ALLOW_PICKUP_REQUESTS && isAgeVerified(); }
  function canCheckoutAlcohol() { return config.ALLOW_ALCOHOL_ONLINE_CHECKOUT && isAgeVerified(); }
  function canShipAlcohol() { return (config.ALLOW_ALCOHOL_SHIPPING || config.ALLOW_ALCOHOL_DELIVERY) && isAgeVerified(); }
  function canBookTasting() { return isAgeVerified(); }

  /* ------------------------- VERIFICATION STORAGE -------------------------- */
  var STORE_KEY = 'coqui_age_verified';
  function readStore(kind) {
    if (typeof window === 'undefined') return {};
    try {
      var s = kind === 'session' ? window.sessionStorage : window.localStorage;
      return JSON.parse(s.getItem(STORE_KEY) || '{}') || {};
    } catch (e) { return {}; }
  }
  // Store ONLY ageVerified + verifiedAt. Never the full DOB.
  function setVerified() {
    if (typeof window === 'undefined') return;
    var payload = JSON.stringify({ ageVerified: true, verifiedAt: new Date().toISOString() });
    try { window.localStorage.setItem(STORE_KEY, payload); } catch (e) {}
    try { window.sessionStorage.setItem(STORE_KEY, payload); } catch (e) {}
  }
  function clearVerified() {
    if (typeof window === 'undefined') return;
    try { window.localStorage.removeItem(STORE_KEY); } catch (e) {}
    try { window.sessionStorage.removeItem(STORE_KEY); } catch (e) {}
  }

  var api = {
    config: config,
    copy: copy,
    configure: configure,
    getConfig: getConfig,
    calculateAge: calculateAge,
    getRequiredAlcoholAge: getRequiredAlcoholAge,
    isOfLegalDrinkingAge: isOfLegalDrinkingAge,
    isAgeVerified: isAgeVerified,
    canViewAlcoholContent: canViewAlcoholContent,
    canRequestAlcoholPickup: canRequestAlcoholPickup,
    canCheckoutAlcohol: canCheckoutAlcohol,
    canShipAlcohol: canShipAlcohol,
    canBookTasting: canBookTasting,
    setVerified: setVerified,
    clearVerified: clearVerified
  };

  /* ----------------------- BROWSER-ONLY: AGE GATE + UI ---------------------- */
  if (typeof document !== 'undefined') {
    var stylesInjected = false;
    function injectStyles() {
      if (stylesInjected || document.getElementById('coqui-compliance-styles')) return;
      stylesInjected = true;
      var css =
        '#coqui-age-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;' +
        'justify-content:center;padding:1.5rem;background:rgba(26,18,7,.62);backdrop-filter:blur(6px);' +
        '-webkit-backdrop-filter:blur(6px);font-family:"DM Sans",system-ui,sans-serif;}' +
        '#coqui-age-gate .age-gate-card{background:#F7F2E8;border:1px solid rgba(140,63,22,.25);' +
        'max-width:32rem;width:100%;padding:clamp(2.25rem,5vw,3.25rem);text-align:center;color:#1A1207;' +
        'box-shadow:0 40px 90px rgba(26,18,7,.45);}' +
        '#coqui-age-gate .age-gate-brand{font-family:"Cormorant Garamond",Georgia,serif;font-size:1.05rem;' +
        'letter-spacing:.18em;text-transform:uppercase;color:#8C3F16;margin-bottom:1.5rem;}' +
        '#coqui-age-gate .age-gate-q{font-family:"Cormorant Garamond",Georgia,serif;font-weight:300;' +
        'font-size:clamp(1.9rem,4vw,2.6rem);line-height:1.08;letter-spacing:-.02em;color:#1A1207;margin-bottom:.9rem;}' +
        '#coqui-age-gate .age-gate-sub{font-size:.8rem;line-height:1.6;color:#7D6654;margin-bottom:1.75rem;}' +
        '#coqui-age-gate .age-gate-dob-fields{display:flex;gap:.6rem;justify-content:center;margin-bottom:1.1rem;}' +
        '#coqui-age-gate .age-gate-dob input{width:4.6rem;text-align:center;padding:.85rem .5rem;background:#fff;' +
        'border:1px solid rgba(96,66,46,.35);color:#1A1207;font-family:inherit;font-size:1rem;border-radius:0;-moz-appearance:textfield;}' +
        '#coqui-age-gate .age-gate-dob input::-webkit-outer-spin-button,' +
        '#coqui-age-gate .age-gate-dob input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}' +
        '#coqui-age-gate .age-gate-dob input::placeholder{color:#a8917c;letter-spacing:.05em;}' +
        '#coqui-age-gate .age-gate-dob input:focus{outline:none;border-color:#8C3F16;}' +
        '#coqui-age-gate .age-gate-dob input[name=year]{width:6rem;}' +
        '#coqui-age-gate .age-gate-btn{cursor:pointer;font-family:inherit;font-size:.66rem;letter-spacing:.22em;' +
        'text-transform:uppercase;padding:1rem 2.5rem;border:1px solid #8C3F16;background:#8C3F16;color:#F7F2E8;' +
        'transition:background .25s,border-color .25s;}' +
        '#coqui-age-gate .age-gate-verify{width:100%;max-width:18rem;}' +
        '#coqui-age-gate .age-gate-verify:hover{background:#712F0F;border-color:#712F0F;}' +
        '#coqui-age-gate .age-gate-error{color:#a3331a;font-size:.74rem;margin:0 0 1rem;}' +
        '#coqui-age-gate .age-gate-exit{display:inline-block;margin-top:1.5rem;background:none;border:none;' +
        'cursor:pointer;color:#7D6654;font-family:inherit;font-size:.62rem;letter-spacing:.14em;' +
        'text-transform:uppercase;text-decoration:underline;text-underline-offset:3px;}' +
        '#coqui-age-gate .age-gate-exit:hover{color:#1A1207;}' +
        '#coqui-age-gate .age-gate-fine{margin-top:1.75rem;font-size:.6rem;line-height:1.6;' +
        'color:#9b8772;letter-spacing:.02em;}' +
        '.compliance-notice{margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid rgba(26,18,7,.12);}' +
        '.compliance-notice p{font-size:.58rem;line-height:1.65;letter-spacing:.02em;' +
        'color:rgba(26,18,7,.55);max-width:70ch;margin:0 auto .4rem;}' +
        '.compliance-notice .compliance-gov-warning{text-transform:uppercase;letter-spacing:.07em;' +
        'color:rgba(26,18,7,.72);}' +
        '.compliance-notice .compliance-policy-links{margin-top:.55rem;}' +
        '.compliance-notice .compliance-policy-links a{color:rgba(140,63,22,.85);' +
        'text-decoration:underline;text-underline-offset:2px;}' +
        '.compliance-notice .compliance-policy-links a:hover{color:#8C3F16;}' +
        '.compliance-product-block{margin:1.25rem 0;padding:1rem 1.1rem;border:1px solid rgba(140,63,22,.3);' +
        'background:rgba(140,63,22,.04);font-size:.72rem;line-height:1.6;color:rgba(26,18,7,.72);}' +
        '.compliance-card-label{display:block;margin:1.25rem 0 .25rem;font-size:.54rem;letter-spacing:.12em;' +
        'text-transform:uppercase;color:#8C3F16;}';
      var style = document.createElement('style');
      style.id = 'coqui-compliance-styles';
      style.textContent = css;
      document.head.appendChild(style);
    }
    // Inject the government warning + responsible-drinking notice into a footer
    // element with [data-compliance-footer], or append to <footer> if present.
    api.renderFooterWarning = function () {
      injectStyles();
      var host = document.querySelector('[data-compliance-footer]') || document.querySelector('footer');
      if (!host || host.querySelector('.compliance-gov-warning')) return;
      var wrap = document.createElement('div');
      wrap.className = 'compliance-notice';
      var parts = [];
      if (config.REQUIRE_PREGNANCY_WARNING) {
        parts.push('<p class="compliance-gov-warning">' + escapeHtml(copy.GOVERNMENT_WARNING) + '</p>');
        parts.push('<p class="compliance-preg-warning">' + escapeHtml(copy.PREGNANCY_WARNING_PR) + '</p>');
      }
      if (config.REQUIRE_RESPONSIBLE_DRINKING_NOTICE) {
        parts.push('<p class="compliance-responsible">' + escapeHtml(copy.RESPONSIBLE_DRINKING) + '</p>');
      }
      if (config.SHOW_ALCOHOL_POLICY_LINKS) {
        parts.push('<p class="compliance-policy-links">' +
          '<a href="/terms">Terms of Service</a><span aria-hidden="true"> &middot; </span>' +
          '<a href="/privacy">Privacy Policy</a><span aria-hidden="true"> &middot; </span>' +
          '<a href="/shipping-policy">Shipping &amp; Returns</a></p>');
      }
      wrap.innerHTML = parts.join('');
      host.appendChild(wrap);
    };

    // Show the age gate modal. Resolves only when verified; redirects to
    // /age-restricted on failure. Options: { force, requireDob }.
    api.requireAgeGate = function (options) {
      options = options || {};
      if (!options.force && isAgeVerified()) return;
      if (document.getElementById('coqui-age-gate')) return;
      injectStyles();

      var required = getRequiredAlcoholAge();
      var overlay = document.createElement('div');
      overlay.id = 'coqui-age-gate';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Age verification');
      overlay.innerHTML =
        '<div class="age-gate-card">' +
          '<div class="age-gate-brand">Destilería Coquí</div>' +
          '<h2 class="age-gate-q">' + escapeHtml(copy.AGE_GATE_QUESTION) + '</h2>' +
          '<p class="age-gate-sub">Please enter your date of birth to continue.</p>' +
          '<form class="age-gate-dob" novalidate>' +
            '<div class="age-gate-dob-fields">' +
              '<input type="number" inputmode="numeric" name="month" placeholder="MM" min="1" max="12" aria-label="Month" required />' +
              '<input type="number" inputmode="numeric" name="day" placeholder="DD" min="1" max="31" aria-label="Day" required />' +
              '<input type="number" inputmode="numeric" name="year" placeholder="YYYY" min="1900" aria-label="Year" required />' +
            '</div>' +
            '<p class="age-gate-error" role="alert" hidden></p>' +
            '<button type="submit" class="age-gate-btn age-gate-verify">Enter</button>' +
          '</form>' +
          '<button type="button" class="age-gate-exit">I am not of legal drinking age</button>' +
          '<p class="age-gate-fine">' + escapeHtml(copy.RESPONSIBLE_DRINKING) + '</p>' +
        '</div>';

      document.body.appendChild(overlay);
      document.documentElement.style.overflow = 'hidden';

      function pass() { setVerified(); cleanup(); if (typeof options.onPass === 'function') options.onPass(); }
      function fail() { window.location.href = '/age-restricted'; }
      function cleanup() { overlay.remove(); document.documentElement.style.overflow = ''; }

      overlay.querySelector('.age-gate-exit').addEventListener('click', fail);
      overlay.querySelector('.age-gate-dob').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target;
        var err = overlay.querySelector('.age-gate-error');
        if (!f.month.value || !f.day.value || !f.year.value) {
          err.textContent = 'Please enter your full date of birth.'; err.hidden = false; return;
        }
        var dob = { month: f.month.value, day: f.day.value, year: f.year.value };
        var age = calculateAge(dob);
        if (age == null) { err.textContent = 'Please enter a valid date of birth.'; err.hidden = false; return; }
        if (age >= required) { pass(); } else { fail(); }
      });
      setTimeout(function () { var m = overlay.querySelector('input[name=month]'); if (m) m.focus(); }, 50);
    };

    api.initFooterWarning = function () {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', api.renderFooterWarning);
      } else { api.renderFooterWarning(); }
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  return api;
});

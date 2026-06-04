/* Site-wide compliance bootstrap. Include AFTER js/alcohol-compliance.js on
 * every page. Shows the age gate once per visitor (remembered) and injects the
 * government / responsible-drinking warning into the page footer.
 * The /age-restricted page intentionally does NOT include this (it manages its
 * own footer and must not re-trigger the gate). */
(function () {
  var AC = window.AlcoholCompliance;
  if (!AC) return;
  // Don't gate the age-restricted page itself.
  var path = (location.pathname || '').replace(/\/+$/, '');
  if (path !== '/age-restricted') {
    AC.requireAgeGate();
  }
  AC.initFooterWarning();
})();

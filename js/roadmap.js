/* ══════════════════════════════════════
   ROADMAP.JS — Timeline + objectif liberté financière
   ══════════════════════════════════════ */

(function () {

  var fiDebounceTimer = null;

  function renderRoadmap() {
    var tl = document.getElementById('roadmap-tl');
    if (!tl) return;

    var html = '';
    for (var i = 0; i < ROADMAP_DATA.length; i++) {
      var r = ROADMAP_DATA[i];
      html += '<div class="tl-item ' + r.status + '">' +
        '<div class="tl-year">' + r.year + '</div>' +
        '<div class="tl-title">' + r.title + '</div>' +
        '<div class="tl-desc">' + r.desc + '</div>' +
      '</div>';
    }
    tl.innerHTML = html;
    updateFI();
  }

  function updateFI() {
    var spendEl = document.getElementById('fi-spend');
    var spreadEl = document.getElementById('fi-spread');
    var spend = spendEl ? (parseFloat(spendEl.value) || 3000) : 3000;
    var spread = spreadEl ? (parseFloat(spreadEl.value) || 8.5) : 8.5;

    var target = (spend * 12) / (spread / 100);
    var current = getTotals().total;
    var pct = target > 0 ? Math.min(100, current / target * 100) : 0;

    var amountEl = document.getElementById('fi-amount');
    var subEl = document.getElementById('fi-sub');
    var progressEl = document.getElementById('fi-progress');
    var currentValEl = document.getElementById('fi-current-val');
    var targetValEl = document.getElementById('fi-target-val');
    var pctEl = document.getElementById('fi-pct');

    if (amountEl) amountEl.textContent = fmt(target);
    if (subEl) subEl.textContent = 'à ' + fmt(spend) + '/mois';
    if (progressEl) progressEl.style.width = pct.toFixed(1) + '%';
    if (currentValEl) currentValEl.textContent = fmt(current);
    if (targetValEl) targetValEl.textContent = fmt(target);
    if (pctEl) pctEl.textContent = pct.toFixed(1) + '%';
  }

  // Debounced FI update
  function debouncedUpdateFI() {
    clearTimeout(fiDebounceTimer);
    fiDebounceTimer = setTimeout(updateFI, 200);
  }

  // Expose globally
  window.renderRoadmap = renderRoadmap;
  window.updateFI = updateFI;
  window.debouncedUpdateFI = debouncedUpdateFI;
})();

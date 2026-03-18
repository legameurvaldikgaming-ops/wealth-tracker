/* ══════════════════════════════════════
   ROADMAP.JS — Timeline + FI calculator
   ══════════════════════════════════════ */

(function () {

  window.renderRoadmap = function () {
    var ROADMAP = window.ROADMAP_DATA || [];
    var timeline = document.getElementById('roadmap-timeline');
    if (timeline) {
      timeline.innerHTML = ROADMAP.map(function (item) {
        return '<div class="tl-item reveal">' +
          '<div class="tl-dot ' + item.status + '"></div>' +
          '<div class="tl-year">' + item.year + '</div>' +
          '<div class="tl-title">' + item.title + ' ' +
            '<span class="badge badge-' + item.status + '" style="font-size:10px;vertical-align:middle">' +
              (item.status === 'done' ? '✓ Accompli' : item.status === 'progress' ? '⟳ En cours' : '○ Prévu') +
            '</span>' +
          '</div>' +
          '<div class="tl-desc">' + item.desc + '</div>' +
        '</div>';
      }).join('');
    }
    updateFI();
    if (typeof initScrollReveal === 'function') {
      setTimeout(initScrollReveal, 50);
    }
  };

  /* ── FI CALCULATOR ───────────────────── */
  window.updateFI = function () {
    var spendEl  = document.getElementById('fi-spend');
    var spreadEl = document.getElementById('fi-spread');
    if (!spendEl) return;

    var spend  = parseFloat(spendEl.value)  || 3000;
    var spread = parseFloat(spreadEl ? spreadEl.value : 4) || 4;
    var target = (spend * 12) / (spread / 100);

    var totals  = typeof getTotals === 'function' ? getTotals() : { total: 0 };
    var current = totals.total || 0;
    var pct     = target > 0 ? Math.min(current / target * 100, 100) : 0;

    // FI phrase
    var fiPhrase = document.getElementById('fi-phrase');
    if (fiPhrase) {
      var yearsLeft = '';
      if (current < target) {
        // Estimate years at 8% annual return, no DCA
        var dcaItems = (window.STATE && window.STATE.dca) ? window.STATE.dca : [];
        var monthlyDca = dcaItems.reduce(function (a, b) { return a + (parseFloat(b.amount) || 0); }, 0);
        var mr = 0.08 / 12;
        var remaining = target - current;
        // Solve: remaining = current*(1+mr)^n - current + monthlyDca*((1+mr)^n-1)/mr
        // Approximate numerically
        var years = 0;
        var v = current;
        while (v < target && years < 50) {
          years++;
          for (var m = 0; m < 12; m++) { v = v * (1 + mr) + monthlyDca; }
        }
        yearsLeft = years < 50 ? years : '50+';
        fiPhrase.innerHTML = 'Objectif : <strong>' + Math.round(target).toLocaleString('fr-FR') + '\u00a0€</strong> — ' +
          'Atteint dans <strong>' + yearsLeft + '\u00a0ans</strong> à 8%/an';
      } else {
        fiPhrase.innerHTML = '🎉 Tu as atteint la <strong>Liberté Financière</strong> ! Patrimoine > objectif.';
      }
    }

    // Bar
    var bar = document.getElementById('fi-bar');
    if (bar) bar.style.width = pct.toFixed(1) + '%';

    // Pct label
    var pctEl = document.getElementById('fi-pct');
    if (pctEl) pctEl.textContent = pct.toFixed(1) + '%';

    // Current label
    var curEl = document.getElementById('fi-current');
    if (curEl && typeof fmt === 'function') curEl.textContent = fmt(current);
    var tgtEl = document.getElementById('fi-target');
    if (tgtEl && typeof fmt === 'function') tgtEl.textContent = fmt(target);
  };

  var debFI;
  window.debouncedUpdateFI = function () {
    clearTimeout(debFI);
    debFI = setTimeout(updateFI, 200);
  };

  document.addEventListener('DOMContentLoaded', function () {
    ['fi-spend', 'fi-spread'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', window.debouncedUpdateFI);
    });
  });
})();

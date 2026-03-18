/* ══════════════════════════════════════
   SIMULATOR.JS — FV calculator + Lombard
   ══════════════════════════════════════ */

(function () {

  /* ── COMPOUND FV ─────────────────────── */
  window.computeFV = function (pmt, annualRate, months, pv) {
    pv = pv || 0;
    var mr = annualRate / 12;
    if (mr === 0) return pv + pmt * months;
    return pv * Math.pow(1 + mr, months) + pmt * (Math.pow(1 + mr, months) - 1) / mr;
  };

  function getSliderEl(id) { return document.getElementById(id); }
  function getVal(id) { var el = getSliderEl(id); return el ? parseFloat(el.value) || 0 : 0; }
  function setLabel(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }

  window.updateSimulator = function () {
    var dca     = getVal('sim-dca');
    var rate    = getVal('sim-rate') / 100;
    var years   = getVal('sim-years');
    var initial = getVal('sim-initial');
    var months  = years * 12;

    setLabel('sim-dca-val',     dca.toLocaleString('fr-FR') + '\u00a0€/mois');
    setLabel('sim-rate-val',    (rate * 100).toFixed(1) + '%/an');
    setLabel('sim-years-val',   years + '\u00a0ans');
    setLabel('sim-initial-val', initial.toLocaleString('fr-FR') + '\u00a0€');

    var fv      = computeFV(dca, rate, months, initial);
    var inv     = initial + dca * months;
    var gain    = fv - inv;
    var mult    = inv > 0 ? fv / inv : 1;

    setLabel('sim-result-fv',   Math.round(fv).toLocaleString('fr-FR') + '\u00a0€');
    setLabel('sim-result-inv',  Math.round(inv).toLocaleString('fr-FR') + '\u00a0€');
    setLabel('sim-result-gain', (gain >= 0 ? '+' : '') + Math.round(gain).toLocaleString('fr-FR') + '\u00a0€');
    setLabel('sim-result-mult', mult.toFixed(2) + 'x');

    if (typeof drawSimulator === 'function') {
      drawSimulator('sim-chart', dca, rate, months, initial);
    }

    buildScenarios(dca, years, initial);
    updateLombard();
  };

  function buildScenarios(dca, years, initial) {
    var container = document.getElementById('scenarios-grid');
    if (!container) return;
    var rates = [0.04, 0.07, 0.10, 0.12, 0.15];
    var colors = ['var(--text-secondary)', 'var(--accent)', 'var(--green)', 'var(--purple)', 'var(--amber)'];
    var months = years * 12;
    container.innerHTML = rates.map(function (r, i) {
      var fv  = computeFV(dca, r, months, initial);
      var inv = initial + dca * months;
      var mult = inv > 0 ? fv / inv : 1;
      return '<div class="scenario-card">' +
        '<div class="scenario-rate">' + (r * 100).toFixed(0) + '%/an</div>' +
        '<div class="scenario-val" style="color:' + colors[i] + '">' + Math.round(fv).toLocaleString('fr-FR') + '\u00a0€</div>' +
        '<div class="scenario-mult">' + mult.toFixed(1) + 'x le capital</div>' +
      '</div>';
    }).join('');
  }

  /* ── LOMBARD CALCULATOR ──────────────── */
  function updateLombard() {
    var portfolio = parseFloat((document.getElementById('lomb-portfolio') || {}).value) || 0;
    var ltv       = parseFloat((document.getElementById('lomb-ltv')       || {}).value) || 70;
    var loanRate  = parseFloat((document.getElementById('lomb-rate')      || {}).value) || 3;
    var investRate= parseFloat((document.getElementById('lomb-inv-rate')  || {}).value) || 8;
    var loanYears = parseFloat((document.getElementById('lomb-years')     || {}).value) || 5;

    var loan     = portfolio * ltv / 100;
    var annualCost = loan * loanRate / 100;
    var annualReturn = loan * investRate / 100;
    var netReturn = annualReturn - annualCost;
    var fvLoan = computeFV(0, investRate / 100, loanYears * 12, loan);
    var totalCost = annualCost * loanYears;
    var profit = fvLoan - loan - totalCost;

    setLabel('lomb-result-loan',    Math.round(loan).toLocaleString('fr-FR') + '\u00a0€');
    setLabel('lomb-result-cost',    Math.round(annualCost).toLocaleString('fr-FR') + '\u00a0€/an');
    setLabel('lomb-result-net',     (netReturn >= 0 ? '+' : '') + Math.round(netReturn).toLocaleString('fr-FR') + '\u00a0€/an');
    setLabel('lomb-result-profit',  (profit >= 0 ? '+' : '') + Math.round(profit).toLocaleString('fr-FR') + '\u00a0€');

    var ltv_el = document.getElementById('lomb-ltv-val');
    if (ltv_el) ltv_el.textContent = ltv + '%';
  }

  window.updateLombard = updateLombard;

  /* ── INIT ────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    ['sim-dca', 'sim-rate', 'sim-years', 'sim-initial'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateSimulator);
    });
    ['lomb-portfolio', 'lomb-ltv', 'lomb-rate', 'lomb-inv-rate', 'lomb-years'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateLombard);
    });
    updateSimulator();
  });
})();

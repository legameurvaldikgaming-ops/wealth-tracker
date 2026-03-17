/* ══════════════════════════════════════
   SIMULATOR.JS — Calculs + rendu simulateur
   ══════════════════════════════════════ */

(function () {

  function computeFV(pmt, annualRate, months, pv) {
    var mr = annualRate / 12;
    if (mr === 0) return pv + pmt * months;
    return pv * Math.pow(1 + mr, months) + pmt * ((Math.pow(1 + mr, months) - 1) / mr);
  }

  function updateSimulator() {
    var dcaEl = document.getElementById('sim-dca');
    var yearsEl = document.getElementById('sim-years');
    var rateEl = document.getElementById('sim-rate');
    var initEl = document.getElementById('sim-initial');
    if (!dcaEl) return;

    var dca = parseFloat(dcaEl.value) || 600;
    var years = parseInt(yearsEl.value) || 10;
    var rate = (parseFloat(rateEl.value) || 10) / 100;
    var initial = parseFloat(initEl.value) || 0;
    var n = years * 12;

    var final_ = computeFV(dca, rate, n, initial);
    var invested = dca * n + initial;
    var gains = final_ - invested;
    var mult = invested > 0 ? final_ / invested : 1;

    document.getElementById('sim-final').textContent = fmt(final_);
    document.getElementById('sim-inv').textContent = fmt(invested);
    document.getElementById('sim-gains').textContent = fmt(gains);
    document.getElementById('sim-mult').textContent = fmtMult(mult);

    // Update slider display values
    var dcaValEl = document.getElementById('sim-dca-val');
    var yearsValEl = document.getElementById('sim-years-val');
    var rateValEl = document.getElementById('sim-rate-val');
    if (dcaValEl) dcaValEl.textContent = dca + '€';
    if (yearsValEl) yearsValEl.textContent = years + ' ans';
    if (rateValEl) rateValEl.textContent = (rate * 100).toFixed(1).replace('.0', '') + '%';

    // Draw chart
    drawSimulator('simCanvas', dca, rate, years, initial);

    // Build scenarios table
    buildScenarios();
  }

  function buildScenarios() {
    var tbody = document.getElementById('scenarios-tbody');
    if (!tbody) return;

    var scenarios = [
      { label: 'Conservateur', dca: 300, rate: 0.07, initial: 0 },
      { label: 'Base (toi)', dca: 600, rate: 0.10, initial: 0 },
      { label: 'Optimiste', dca: 1000, rate: 0.12, initial: 0 },
      { label: 'Freelance', dca: 3000, rate: 0.12, initial: 0 },
      { label: 'Post-crypto 250k', dca: 1500, rate: 0.12, initial: 175000 }
    ];

    var html = '';
    for (var i = 0; i < scenarios.length; i++) {
      var s = scenarios[i];
      html += '<tr>' +
        '<td style="font-weight:500">' + s.label + '</td>' +
        '<td>' + fmt(s.dca) + '</td>' +
        '<td>' + (s.rate * 100).toFixed(0) + '%</td>' +
        '<td>' + fmt(computeFV(s.dca, s.rate, 5 * 12, s.initial)) + '</td>' +
        '<td style="font-weight:500">' + fmt(computeFV(s.dca, s.rate, 10 * 12, s.initial)) + '</td>' +
        '<td class="price-up">' + fmt(computeFV(s.dca, s.rate, 20 * 12, s.initial)) + '</td>' +
        '<td class="delta-up" style="font-weight:500">' + fmt(computeFV(s.dca, s.rate, 30 * 12, s.initial)) + '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
  }

  // Expose globally
  window.computeFV = computeFV;
  window.updateSimulator = updateSimulator;
  window.buildScenarios = buildScenarios;
})();

/* ══════════════════════════════════════
   V4-INCOME.JS — Active vs Passive Income + Financial Freedom
   ══════════════════════════════════════ */

(function () {

  function getPassiveIncome() {
    var s    = window.STATE    || {};
    var sv4  = window.STATE_V4 || {};

    // 1. Loyers nets (immo)
    var loyers = (s.immo || []).reduce(function(a,p) {
      var loyer   = parseFloat(p.loyer)   || 0;
      var charges = parseFloat(p.charges) || 0;
      return a + Math.max(0, loyer - charges);
    }, 0);

    // 2. DeFi yields mensuel
    var defiYield = (sv4.defi || []).reduce(function(a,p) {
      var capital = (parseFloat(p.amount1)||0)*(parseFloat(p.entryPrice1)||1) +
                    (parseFloat(p.amount2)||0)*(parseFloat(p.entryPrice2)||1);
      var apy = parseFloat(p.apy) || 0;
      return a + (capital * apy / 100 / 12);
    }, 0);

    // 3. Dividendes ETF (0.5%/an sur PEA+CTO)
    var peaCTO = (s.pea || []).reduce(function(a,p){ return a + (typeof getETFCurrentValue==='function' ? getETFCurrentValue(p) : parseFloat(p.current)||0); }, 0) +
                 (s.cto || []).reduce(function(a,p){ return a + (typeof getETFCurrentValue==='function' ? getETFCurrentValue(p) : parseFloat(p.current)||0); }, 0);
    var etfDiv = peaCTO * 0.005 / 12;

    return {
      loyers:    loyers,
      defi:      defiYield,
      dividends: etfDiv,
      total:     loyers + defiYield + etfDiv
    };
  }

  window.renderIncome = function () {
    var sv4    = window.STATE_V4 || {};
    var salary = parseFloat(sv4.salary) || 0;
    var passive= getPassiveIncome();

    var actEl    = document.getElementById('income-active-val');
    var passEl   = document.getElementById('income-passive-val');
    var pctEl    = document.getElementById('income-freedom-pct');
    var msgEl    = document.getElementById('income-freedom-msg');
    var barActEl = document.getElementById('income-bar-active');
    var barPasEl = document.getElementById('income-bar-passive');
    var detailEl = document.getElementById('income-passive-detail');
    var fiTimeEl = document.getElementById('income-fi-time');

    if (actEl)  actEl.textContent  = fmt(salary);
    if (passEl) passEl.textContent = fmt(passive.total);

    var pct = salary > 0 ? Math.min(100, passive.total / salary * 100) : (passive.total > 0 ? 100 : 0);
    if (pctEl) pctEl.textContent = pct.toFixed(1) + '%';

    if (msgEl) {
      if (pct >= 100) {
        msgEl.textContent = '🎉 Tu as atteint la liberté financière !';
        msgEl.style.color = 'var(--green)';
      } else {
        msgEl.textContent = 'Tes revenus passifs couvrent ' + pct.toFixed(1) + '% de tes revenus actifs';
        msgEl.style.color = 'var(--text-secondary)';
      }
    }

    // Progress bars
    var maxBar = Math.max(salary, passive.total, 1);
    if (barActEl) barActEl.style.width = (salary / maxBar * 100).toFixed(1) + '%';
    if (barPasEl) {
      barPasEl.style.width = (passive.total / maxBar * 100).toFixed(1) + '%';
      // Animate if just updated
      barPasEl.style.transition = 'width 1s ease';
    }

    if (detailEl) {
      detailEl.innerHTML =
        '<div class="income-breakdown-row"><span>🏠 Loyers nets</span><span>' + fmt(passive.loyers) + '/mois</span></div>' +
        '<div class="income-breakdown-row"><span>⛓️ DeFi yields</span><span>' + fmt(passive.defi) + '/mois</span></div>' +
        '<div class="income-breakdown-row"><span>📈 Dividendes ETF</span><span>' + fmt(passive.dividends) + '/mois</span></div>';
    }

    // Time to 100% financial freedom
    if (fiTimeEl && salary > 0 && passive.total < salary) {
      var dcaTotal = (window.STATE && window.STATE.dca ? window.STATE.dca.reduce(function(a,d){ return a+(parseFloat(d.amount)||0);},0) : 0);
      var yearlyPassive = passive.total * 12;
      var yearlyActive  = salary * 12;
      // Rough estimate: each € of DCA invested at 7% generates ~0.07€ annually
      var annualPassiveGrowth = dcaTotal * 12 * 0.07;
      var gap = yearlyActive - yearlyPassive;
      if (annualPassiveGrowth > 0) {
        var years = Math.ceil(gap / annualPassiveGrowth);
        var months = Math.round((gap / annualPassiveGrowth % 1) * 12);
        fiTimeEl.textContent = 'À ce rythme tu atteins 100% dans ' + years + ' ans et ' + months + ' mois';
      } else {
        fiTimeEl.textContent = 'Augmente ton DCA pour accélérer ta liberté financière';
      }
    } else if (fiTimeEl && passive.total >= salary && salary > 0) {
      fiTimeEl.textContent = '🎉 Liberté financière atteinte !';
      fiTimeEl.style.color = 'var(--green)';
    }
  };

  // Salary input
  window.updateSalary = function () {
    var el = document.getElementById('salary-input');
    if (!el || !window.STATE_V4) return;
    window.STATE_V4.salary = parseFloat(el.value) || 0;
    saveV4State();
    renderIncome();
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Restore salary input
    var salaryEl = document.getElementById('salary-input');
    if (salaryEl && window.STATE_V4) {
      salaryEl.value = window.STATE_V4.salary || '';
      salaryEl.addEventListener('input', window.updateSalary);
    }
    renderIncome();
  });

})();

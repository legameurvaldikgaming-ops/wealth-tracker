/* ══════════════════════════════════════
   V4-DEFI.JS — DeFi tracker: positions, IL, yields, gas fees
   ══════════════════════════════════════ */

(function () {

  var PROTOCOLS = ['Aave', 'Uniswap', 'Curve', 'Compound', 'Lido', 'PancakeSwap', 'Balancer', 'Autre'];

  // ── RENDER DEFI POSITIONS ─────────────
  window.renderDefi = function () {
    var items = window.STATE_V4 ? window.STATE_V4.defi : [];
    var tbody = document.getElementById('defi-tbody');
    var sumEl = document.getElementById('defi-total-value');
    var yieldEl= document.getElementById('defi-total-yield');

    if (!tbody) return;
    if (!items || !items.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-tertiary)">Aucune position DeFi. Ajoutez votre première position.</td></tr>';
      updateTabBadge('defi', 0);
      if (sumEl) sumEl.textContent = '0 €';
      if (yieldEl) yieldEl.textContent = '0 €';
      return;
    }

    var totalValue = 0;
    var totalYield = 0;

    tbody.innerHTML = items.map(function (p) {
      var days = p.startDate ? Math.max(0, (Date.now() - new Date(p.startDate).getTime()) / (1000*3600*24)) : 0;
      var capital = (parseFloat(p.amount1)||0) * (parseFloat(p.entryPrice1)||1) +
                    (parseFloat(p.amount2)||0) * (parseFloat(p.entryPrice2)||1);
      var apy  = parseFloat(p.apy) || 0;
      var accumulatedYield = capital > 0 ? capital * (apy / 100) * (days / 365) : 0;
      totalValue += capital;
      totalYield += accumulatedYield;

      // Impermanent loss if 2 assets
      var ilPct = 0;
      if (p.entryPrice1 && p.entryPrice2 && p.amount2 > 0) {
        var currentP1 = typeof getCurrentPrice==='function' ? getCurrentPrice((p.asset1||'').toUpperCase()) : parseFloat(p.entryPrice1);
        var currentP2 = typeof getCurrentPrice==='function' ? getCurrentPrice((p.asset2||'').toUpperCase()) : parseFloat(p.entryPrice2);
        if (currentP1 > 0 && currentP2 > 0) {
          var priceRatio = (currentP1 / parseFloat(p.entryPrice1)) / (currentP2 / parseFloat(p.entryPrice2));
          ilPct = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;
        }
      }

      var ilAlert = ilPct < -(apy * days / 365 + 0.5) ? '🚨' : ilPct < -2 ? '⚠️' : '';

      return '<tr>' +
        '<td><strong>' + (p.protocol||'?') + '</strong></td>' +
        '<td>' + (p.asset1||'?') + (p.asset2 ? '/' + p.asset2 : '') + '</td>' +
        '<td class="td-mono">' + fmtRaw(capital) + '</td>' +
        '<td class="td-mono" style="color:var(--green)">' + (apy > 0 ? apy.toFixed(1) + '%' : '—') + '</td>' +
        '<td class="td-mono" style="color:var(--green)">+' + fmtRaw(accumulatedYield) + '</td>' +
        '<td class="td-mono ' + (ilPct < -1 ? 'td-red' : '') + '">' +
          ilAlert + (ilPct !== 0 ? ilPct.toFixed(2) + '%' : '—') +
        '</td>' +
        '<td class="td-mono">' + (p.startDate || '—') + '</td>' +
        '<td><button class="btn btn-ghost btn-sm" onclick="removeDefi(\'' + p.id + '\')">Supprimer</button></td>' +
      '</tr>';
    }).join('');

    updateTabBadge('defi', items.length);
    if (sumEl)  sumEl.textContent  = fmtRaw(totalValue);
    if (yieldEl) yieldEl.textContent = fmtRaw(totalYield);
    renderGasFees();
  };

  window.removeDefi = function (id) {
    if (typeof removeV4Item === 'function') removeV4Item('defi', id);
    renderDefi();
    if (typeof renderIncome === 'function') renderIncome();
  };

  // ── ADD DEFI POSITION ─────────────────
  window.addDefi = function () {
    var protocol    = document.getElementById('defi-protocol');
    var asset1      = document.getElementById('defi-asset1');
    var asset2      = document.getElementById('defi-asset2');
    var amount1     = document.getElementById('defi-amount1');
    var amount2     = document.getElementById('defi-amount2');
    var entryPrice1 = document.getElementById('defi-ep1');
    var entryPrice2 = document.getElementById('defi-ep2');
    var apy         = document.getElementById('defi-apy');
    var startDate   = document.getElementById('defi-startdate');

    if (!protocol || !asset1 || !amount1) return;
    var ok = true;
    [protocol, asset1, amount1].forEach(function(el){ if(!el.value.trim()){ el.classList.add('error'); ok=false; } else el.classList.remove('error'); });
    if (!ok) return;

    addV4Item('defi', {
      protocol:    protocol.value.trim(),
      asset1:      asset1.value.trim().toUpperCase(),
      asset2:      asset2 ? asset2.value.trim().toUpperCase() : '',
      amount1:     parseFloat(amount1.value)||0,
      amount2:     parseFloat(amount2 ? amount2.value : 0)||0,
      entryPrice1: parseFloat(entryPrice1 ? entryPrice1.value : 0)||0,
      entryPrice2: parseFloat(entryPrice2 ? entryPrice2.value : 0)||0,
      apy:         parseFloat(apy ? apy.value : 0)||0,
      startDate:   startDate ? startDate.value : new Date().toISOString().slice(0,10)
    });

    [protocol, asset1, asset2, amount1, amount2, entryPrice1, entryPrice2, apy, startDate].forEach(function(el){
      if(el){ el.value=''; el.classList.remove('error'); }
    });
    renderDefi();
    if (typeof renderIncome === 'function') renderIncome();
    if (typeof showToast === 'function') showToast('Position DeFi ajoutée !', 'success');
  };

  // ── IMPERMANENT LOSS CALCULATOR ───────
  window.calcIL = function () {
    var ep1 = parseFloat((document.getElementById('il-ep1')||{}).value)||0;
    var ep2 = parseFloat((document.getElementById('il-ep2')||{}).value)||1;
    var cp1 = parseFloat((document.getElementById('il-cp1')||{}).value)||ep1;
    var cp2 = parseFloat((document.getElementById('il-cp2')||{}).value)||ep2;
    var capital = parseFloat((document.getElementById('il-capital')||{}).value)||1000;
    var apy     = parseFloat((document.getElementById('il-apy')||{}).value)||0;
    var days    = parseFloat((document.getElementById('il-days')||{}).value)||30;
    var out     = document.getElementById('il-output');
    if (!out || !ep1 || !ep2) return;

    var r1 = cp1 / ep1; // price change ratio asset1
    var r2 = cp2 / ep2; // price change ratio asset2
    var priceRatio = r1 / r2;

    // IL = 2*sqrt(priceRatio)/(1+priceRatio) - 1
    var ilPct = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;
    var ilEur = capital * (ilPct / 100);

    // Simply hold value
    var holdValue = capital * (r1 * 0.5 + r2 * 0.5);
    var lpValue   = capital * (1 + ilPct/100) * ((r1*r2) > 0 ? Math.sqrt(r1*r2) : 1);

    // APY gains accumulated
    var yieldGain = capital * (apy/100) * (days/365);
    var netResult = ilEur + yieldGain;
    var netPct    = capital > 0 ? (netResult / capital * 100) : 0;

    var alertMsg = '';
    if (ilEur + yieldGain < 0) {
      alertMsg = '<div class="il-alert">⚠️ Les frais de liquidité ne compensent pas l\'impermanent loss. Consider simply holding.</div>';
    } else {
      alertMsg = '<div class="il-ok">✅ Les APY compensent l\'impermanent loss. Position profitable.</div>';
    }

    out.innerHTML =
      alertMsg +
      '<div class="il-grid">' +
        '<div class="il-card">' +
          '<div class="il-val td-red">' + ilPct.toFixed(2) + '%</div>' +
          '<div class="il-lbl">Impermanent Loss</div>' +
        '</div>' +
        '<div class="il-card">' +
          '<div class="il-val td-red">' + fmtRaw(ilEur) + '</div>' +
          '<div class="il-lbl">Perte en €</div>' +
        '</div>' +
        '<div class="il-card">' +
          '<div class="il-val td-green">+' + fmtRaw(yieldGain) + '</div>' +
          '<div class="il-lbl">Gains APY sur ' + days + ' jours</div>' +
        '</div>' +
        '<div class="il-card ' + (netResult >= 0 ? '' : 'il-card-neg') + '">' +
          '<div class="il-val ' + (netResult >= 0 ? 'td-green' : 'td-red') + '">' +
            (netResult >= 0 ? '+' : '') + fmtRaw(netResult) + ' (' + (netPct >= 0 ? '+' : '') + netPct.toFixed(2) + '%)' +
          '</div>' +
          '<div class="il-lbl">Résultat net LP vs Hold</div>' +
        '</div>' +
      '</div>';
  };

  // ── GAS FEES TRACKER ──────────────────
  window.addGasFee = function () {
    var dateEl   = document.getElementById('gas-date');
    var amountEl = document.getElementById('gas-amount');
    var actionEl = document.getElementById('gas-action');
    if (!amountEl || !amountEl.value) return;
    addV4Item('gasFees', {
      date:   dateEl   ? dateEl.value   : new Date().toISOString().slice(0,10),
      amount: parseFloat(amountEl.value)||0,
      action: actionEl ? actionEl.value.trim() : 'Transaction'
    });
    [dateEl, amountEl, actionEl].forEach(function(el){ if(el){ el.value=''; } });
    if (dateEl) dateEl.value = new Date().toISOString().slice(0,10);
    renderGasFees();
    if (typeof showToast === 'function') showToast('Gas fee ajouté !', 'success');
  };

  function renderGasFees() {
    var fees   = window.STATE_V4 ? window.STATE_V4.gasFees : [];
    var list   = document.getElementById('gas-list');
    var totalEl= document.getElementById('gas-total');
    var impactEl=document.getElementById('gas-impact');
    if (!list) return;

    var total = fees.reduce(function(a,f){ return a + (parseFloat(f.amount)||0); }, 0);
    var defiTotal = 0;
    var defi = window.STATE_V4 ? window.STATE_V4.defi : [];
    defi.forEach(function(p) {
      var capital = (parseFloat(p.amount1)||0)*(parseFloat(p.entryPrice1)||1) +
                    (parseFloat(p.amount2)||0)*(parseFloat(p.entryPrice2)||1);
      var days = p.startDate ? Math.max(0, (Date.now()-new Date(p.startDate).getTime())/(1000*3600*24)) : 0;
      defiTotal += capital * (parseFloat(p.apy)||0) / 100 * days / 365;
    });

    if (totalEl) totalEl.textContent = fmtRaw(total);
    if (impactEl && defiTotal > 0) {
      var impact = total / (defiTotal + total) * 100;
      impactEl.textContent = impact.toFixed(1) + '% de tes yields DeFi';
      impactEl.style.color = impact > 20 ? 'var(--red)' : 'var(--amber)';
    }

    if (!fees.length) {
      list.innerHTML = '<div style="color:var(--text-tertiary);font-size:13px;text-align:center;padding:12px">Aucun gas fee enregistré.</div>';
      return;
    }
    list.innerHTML = fees.slice().reverse().map(function(f) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<div><div style="font-size:13px;font-weight:500">' + (f.action||'Transaction') + '</div>' +
        '<div style="font-size:11px;color:var(--text-tertiary)">' + (f.date||'') + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="color:var(--red);font-family:monospace;font-size:13px">-' + fmtRaw(parseFloat(f.amount)||0) + '</span>' +
          '<button class="btn btn-ghost btn-sm" onclick="removeGasFee(\'' + f.id + '\')">×</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window.removeGasFee = function (id) {
    if (typeof removeV4Item === 'function') removeV4Item('gasFees', id);
    renderGasFees();
  };

  function updateTabBadge(cat, count) {
    var badge = document.querySelector('.inner-tab[data-tab="' + cat + '"] .tab-badge');
    if (badge) badge.textContent = count;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Init date inputs to today
    ['defi-startdate','gas-date'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el.value) el.value = new Date().toISOString().slice(0,10);
    });
    // IL calc button
    var ilBtn = document.getElementById('il-calc-btn');
    if (ilBtn) ilBtn.addEventListener('click', calcIL);
  });

})();

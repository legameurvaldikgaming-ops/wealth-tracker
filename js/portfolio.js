/* ══════════════════════════════════════
   PORTFOLIO.JS — Full CRUD + V4 quantity system
   ══════════════════════════════════════ */

(function () {
  var pendingDelete = {};

  function pnlClass(v) { return v >= 0 ? 'td-green' : 'td-red'; }
  function pnlSign(v)  { return v >= 0 ? '+' : ''; }

  function actionsCell(cat, id) {
    return '<td><button class="btn btn-ghost btn-sm" onclick="requestDelete(\'' + cat + '\',\'' + id + '\',this)">Supprimer</button></td>';
  }

  window.requestDelete = function (cat, id, btn) {
    var key = cat + ':' + id;
    if (pendingDelete[key]) {
      clearTimeout(pendingDelete[key]);
      delete pendingDelete[key];
      removePosition(cat, id);
      renderAllPortfolioTabs();
      if (typeof renderDashboard === 'function') renderDashboard();
      return;
    }
    var original = btn.textContent;
    btn.textContent = 'Confirmer ?';
    btn.classList.add('btn-danger');
    btn.classList.remove('btn-ghost');
    pendingDelete[key] = setTimeout(function () {
      delete pendingDelete[key];
      if (btn.parentNode) {
        btn.textContent = original;
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-ghost');
      }
    }, 3000);
  };

  // ── BIAS DETECTION ────────────────────
  function checkBiasWarnings() {
    var items = STATE.crypto || [];
    var now = Date.now();
    var week = 7 * 24 * 3600 * 1000;
    var counts = {};
    items.forEach(function(p) {
      var t = (p.ticker || p.name || '').toUpperCase();
      var d = p.buyDate ? new Date(p.buyDate).getTime() : 0;
      if (now - d < week) counts[t] = (counts[t] || 0) + 1;
    });
    var msgs = [];
    Object.keys(counts).forEach(function(t) {
      if (counts[t] >= 3) msgs.push('"Sur-pondération émotionnelle détectée sur ' + t + '"');
    });
    var totals = getTotals();
    items.forEach(function(p) {
      var cur = getCryptoCurrentValue(p);
      var ticker = (p.ticker || p.name || '').toUpperCase().split(' ')[0];
      if (totals.total > 0 && cur / totals.total > 0.60) {
        msgs.push(ticker + ' représente ' + Math.round(cur/totals.total*100) + '% du portfolio — diversification insuffisante');
      }
    });
    var bannerEl = document.getElementById('bias-warning-banner');
    if (bannerEl) {
      if (msgs.length) {
        bannerEl.innerHTML = '⚠️ <strong>Détecteur de biais :</strong> ' + msgs.join(' · ');
        bannerEl.style.display = 'flex';
      } else {
        bannerEl.style.display = 'none';
      }
    }
  }

  // ── PEA / CTO (V4: ETF with shares) ──
  function renderStockTable(cat) {
    var items = STATE[cat] || [];
    var tbody = document.getElementById(cat + '-tbody');
    if (!tbody) return;
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-tertiary)">Aucune position. Ajoutez votre première ligne ci-dessus.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(function (p) {
      var shares = parseFloat(p.shares) || 0;
      var pps    = parseFloat(p.pricePerShare) || 0;
      var inv    = shares > 0 && pps > 0 ? shares * pps : parseFloat(p.invested) || 0;
      var cur    = typeof getETFCurrentValue === 'function' ? getETFCurrentValue(p) : (parseFloat(p.current) || 0);
      var pnl    = cur - inv;
      var pct    = inv > 0 ? (pnl / inv * 100) : 0;
      var ticker = p.ticker ? ' <small style="color:var(--text-tertiary)">(' + p.ticker + ')</small>' : '';
      return '<tr>' +
        '<td><strong>' + (p.name || p.asset || '—') + '</strong>' + ticker + '</td>' +
        '<td class="td-mono">' + (shares > 0 ? shares.toFixed(4) + ' parts' : '—') + '</td>' +
        '<td class="td-mono">' + fmt(inv) + '</td>' +
        '<td class="td-mono">' + fmt(cur) + '</td>' +
        '<td class="td-mono ' + pnlClass(pnl) + '">' + pnlSign(pnl) + fmt(pnl) + '</td>' +
        '<td class="td-mono ' + pnlClass(pct) + '">' + pnlSign(pct) + pct.toFixed(2) + '%</td>' +
        actionsCell(cat, p.id) +
        '</tr>';
    }).join('');
    updateTabBadge(cat, items.length);
  }

  // ── CRYPTO (V4: quantity × livePrice) ──
  function renderCrypto() {
    var items = STATE.crypto || [];
    var tbody = document.getElementById('crypto-tbody');
    if (!tbody) return;

    var totalInv = items.reduce(function (a, p) {
      var qty=parseFloat(p.quantity)||0, bp=parseFloat(p.buyPrice)||0;
      return a + (qty>0&&bp>0 ? qty*bp : parseFloat(p.invested)||0);
    }, 0);
    var totalCur = items.reduce(function (a, p) { return a + getCryptoCurrentValue(p); }, 0);
    var totalGain = totalCur - totalInv;

    var banner = document.getElementById('crypto-tax-banner');
    if (banner) {
      if (totalGain > 0) {
        var tax = totalGain * 0.30;
        banner.innerHTML = '⚠️ Plus-value latente : <strong>' + fmt(totalGain) + '</strong> — Provision fiscale 30% : <strong>' + fmt(tax) + '</strong>';
        banner.style.display = 'flex';
      } else {
        banner.style.display = 'none';
      }
    }

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-tertiary)">Aucune crypto. Ajoutez votre première position.</td></tr>';
      updateTabBadge('crypto', 0);
      return;
    }

    tbody.innerHTML = items.map(function (p) {
      var qty    = parseFloat(p.quantity) || 0;
      var bp     = parseFloat(p.buyPrice) || 0;
      var ticker = (p.ticker || p.name || '').toUpperCase().split(' ')[0];
      var live   = typeof getCurrentPrice==='function' ? getCurrentPrice(ticker) : 0;
      var inv    = qty>0&&bp>0 ? qty*bp : parseFloat(p.invested)||0;
      var cur    = qty>0&&live>0 ? qty*live : parseFloat(p.current)||0;
      var pnl    = cur - inv;
      var pct    = inv > 0 ? (pnl / inv * 100) : 0;
      var mult   = inv > 0 ? cur / inv : 1;
      var liveStr= live>1000 ? Math.round(live).toLocaleString('fr-FR')+'$' : live>0 ? live.toFixed(2)+'$' : '—';
      return '<tr>' +
        '<td><strong>' + (p.name||p.ticker||'—') + '</strong>' +
          (ticker ? '<br><small style="color:var(--amber)">' + ticker + '</small>' : '') +
        '</td>' +
        '<td class="td-mono">' + (qty>0 ? qty.toFixed(6) : '—') + '</td>' +
        '<td class="td-mono" style="color:var(--amber)">' + liveStr + '</td>' +
        '<td class="td-mono">' + fmt(inv) + '</td>' +
        '<td class="td-mono">' + fmt(cur) + '</td>' +
        '<td class="td-mono ' + pnlClass(pnl) + '">' + pnlSign(pnl) + fmt(pnl) + '</td>' +
        '<td class="td-mono ' + pnlClass(pct) + '">' + pnlSign(pct) + pct.toFixed(2) + '%</td>' +
        '<td class="td-mono">' + fmtMult(mult) + '</td>' +
        actionsCell('crypto', p.id) +
        '</tr>';
    }).join('');
    updateTabBadge('crypto', items.length);
    checkBiasWarnings();
  }

  // ── IMMO CARDS ────────────────────────
  function renderImmo() {
    var items = STATE.immo || [];
    var grid = document.getElementById('immo-grid');
    if (!grid) return;
    if (!items.length) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏠</div><div class="empty-state-text">Aucun bien. Ajoutez votre premier actif immobilier.</div></div>';
      updateTabBadge('immo', 0);
      return;
    }
    grid.innerHTML = items.map(function (p) {
      var price    = parseFloat(p.price)    || 0;
      var invested = parseFloat(p.invested) || price;
      var loyer    = parseFloat(p.loyer)    || 0;
      var charges  = parseFloat(p.charges)  || 0;
      var cf = loyer - charges;
      var yld = price > 0 ? (loyer * 12 / price * 100) : 0;
      var gain = price - invested;
      return '<div class="immo-card">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
          '<div><div style="font-weight:600;font-size:15px">' + (p.name || 'Bien immobilier') + '</div>' +
          '<div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">' + (p.address || '') + '</div></div>' +
          '<button class="btn btn-ghost btn-sm" onclick="requestDelete(\'immo\',\'' + p.id + '\',this)">Supprimer</button>' +
        '</div>' +
        '<div class="immo-metrics">' +
          '<div class="immo-metric"><div class="immo-metric-val ' + pnlClass(cf) + '">' + fmt(cf) + '</div><div class="immo-metric-lbl">Cash-flow/mois</div></div>' +
          '<div class="immo-metric"><div class="immo-metric-val">' + yld.toFixed(2) + '%</div><div class="immo-metric-lbl">Rendement brut</div></div>' +
          '<div class="immo-metric"><div class="immo-metric-val ' + pnlClass(gain) + '">' + pnlSign(gain) + fmt(gain) + '</div><div class="immo-metric-lbl">Plus-value</div></div>' +
        '</div>' +
      '</div>';
    }).join('');
    updateTabBadge('immo', items.length);
  }

  // ── DCA ───────────────────────────────
  function renderDCA() {
    var items = STATE.dca || [];
    var list = document.getElementById('dca-list');
    var cal  = document.getElementById('dca-calendar');
    if (list) {
      if (!items.length) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">Aucun DCA programmé.</div></div>';
      } else {
        var total = items.reduce(function (a, b) { return a + (parseFloat(b.amount) || 0); }, 0);
        list.innerHTML = '<div style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">Total mensuel : <strong style="color:var(--green)">' + fmt(total) + '</strong></div>' +
          items.map(function (p) {
            return '<div class="dca-item">' +
              '<div class="dca-item-left">' +
                '<div class="dca-day">' + (p.day || 1) + '</div>' +
                '<div class="dca-info"><div class="dca-asset">' + (p.asset || '—') + '</div>' +
                '<div class="dca-meta"><span class="badge badge-' + (p.cat || 'pea').toLowerCase() + '">' + (p.cat || 'PEA') + '</span></div></div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:12px">' +
                '<div class="dca-amount">' + fmt(parseFloat(p.amount) || 0) + '</div>' +
                '<button class="btn btn-ghost btn-sm" onclick="requestDelete(\'dca\',\'' + p.id + '\',this)">×</button>' +
              '</div>' +
            '</div>';
          }).join('');
      }
    }
    if (cal) {
      var dcaDays = {};
      items.forEach(function (p) { dcaDays[p.day] = (dcaDays[p.day] || 0) + (parseFloat(p.amount) || 0); });
      var html = '';
      for (var d = 1; d <= 31; d++) {
        var hasDca = !!dcaDays[d];
        html += '<div class="cal-day' + (hasDca ? ' has-dca' : '') + '" title="' + (hasDca ? fmt(dcaDays[d]) : '') + '">' +
          '<div class="cal-day-num">' + d + '</div>' +
          (hasDca ? '<div class="cal-day-dot"></div>' : '') + '</div>';
      }
      cal.innerHTML = html;
    }
    updateTabBadge('dca', items.length);
  }

  function updateTabBadge(cat, count) {
    var badge = document.querySelector('.inner-tab[data-tab="' + cat + '"] .tab-badge');
    if (badge) badge.textContent = count;
  }

  // ── ADD FORMS ─────────────────────────

  // V4: PEA/CTO with ticker + shares + pricePerShare + buyDate
  window.addPos = function (cat) {
    var tickerEl  = document.getElementById(cat + '-ticker');
    var nameEl    = document.getElementById(cat + '-n');
    var sharesEl  = document.getElementById(cat + '-shares');
    var ppsEl     = document.getElementById(cat + '-pps');
    var invEl     = document.getElementById(cat + '-inv');
    var curEl     = document.getElementById(cat + '-cur');
    var dateEl    = document.getElementById(cat + '-buydate');

    var obj = {};

    if (tickerEl && sharesEl) {
      // V4 quantity mode
      var tickerVal = tickerEl.value.trim().toUpperCase();
      var sharesVal = parseFloat(sharesEl.value) || 0;
      var ppsVal    = parseFloat(ppsEl ? ppsEl.value : 0) || 0;
      if (!tickerVal || !sharesVal) {
        if (tickerEl) tickerEl.classList.add('error');
        if (sharesEl) sharesEl.classList.add('error');
        return;
      }
      [tickerEl, sharesEl, ppsEl].forEach(function(el){ if(el) el.classList.remove('error'); });
      var liveP = typeof getCurrentPrice==='function' ? getCurrentPrice(tickerVal) : ppsVal;
      obj = {
        ticker:        tickerVal,
        name:          tickerVal,
        shares:        sharesVal,
        pricePerShare: ppsVal,
        invested:      sharesVal * ppsVal,
        current:       sharesVal * (liveP || ppsVal),
        buyDate:       dateEl ? dateEl.value : new Date().toISOString().slice(0,10)
      };
    } else {
      if (!nameEl || !nameEl.value.trim()) { if(nameEl) nameEl.classList.add('error'); return; }
      nameEl.classList.remove('error');
      obj = {
        name:     nameEl.value.trim(),
        invested: parseFloat(invEl ? invEl.value : 0) || 0,
        current:  parseFloat(curEl ? curEl.value : 0) || 0
      };
    }

    addPosition(cat, obj);
    [tickerEl, nameEl, sharesEl, ppsEl, invEl, curEl, dateEl].forEach(function(el){
      if (el) { el.value = ''; el.classList.remove('error'); }
    });
    renderAllPortfolioTabs();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderIncome === 'function') renderIncome();
    if (typeof showToast === 'function') showToast('Position ajoutée !', 'success');
  };

  // V4 Crypto: ticker + quantity + buyPrice + buyDate
  window.addCrypto = function () {
    var tickerEl = document.getElementById('crypto-ticker');
    var qtyEl    = document.getElementById('crypto-qty');
    var bpEl     = document.getElementById('crypto-bp');
    var dateEl   = document.getElementById('crypto-buydate');

    var tickerVal = tickerEl ? tickerEl.value.trim().toUpperCase() : '';
    var qtyVal    = parseFloat(qtyEl ? qtyEl.value : 0) || 0;
    var bpVal     = parseFloat(bpEl  ? bpEl.value  : 0) || 0;

    if (!tickerVal || !qtyVal) {
      if (tickerEl) tickerEl.classList.add('error');
      if (qtyEl)    qtyEl.classList.add('error');
      return;
    }
    [tickerEl, qtyEl, bpEl, dateEl].forEach(function(el){ if(el) el.classList.remove('error'); });

    var livePrice = typeof getCurrentPrice==='function' ? getCurrentPrice(tickerVal) : 0;
    addPosition('crypto', {
      ticker:   tickerVal,
      name:     tickerVal,
      quantity: qtyVal,
      buyPrice: bpVal,
      buyDate:  dateEl ? dateEl.value : new Date().toISOString().slice(0,10),
      invested: qtyVal * bpVal,
      current:  qtyVal * (livePrice || bpVal)
    });
    [tickerEl, qtyEl, bpEl, dateEl].forEach(function(el){ if(el){ el.value=''; el.classList.remove('error'); } });
    renderAllPortfolioTabs();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof showToast === 'function') showToast('Crypto ajoutée !', 'success');
  };

  window.addImmo = function () {
    var fields = { name: 'immo-name', price: 'immo-price', invested: 'immo-inv', loyer: 'immo-loyer', charges: 'immo-charges', address: 'immo-addr' };
    var vals = {};
    var ok = true;
    Object.keys(fields).forEach(function (k) {
      var el = document.getElementById(fields[k]);
      if (el) {
        vals[k] = el.value.trim();
        if ((fields[k]==='immo-name'||fields[k]==='immo-price') && !vals[k]) { el.classList.add('error'); ok = false; }
        else if (el) el.classList.remove('error');
      }
    });
    if (!ok) return;
    addPosition('immo', {
      name: vals.name, address: vals.address || '',
      price: parseFloat(vals.price) || 0,
      invested: parseFloat(vals.invested) || parseFloat(vals.price) || 0,
      loyer: parseFloat(vals.loyer) || 0,
      charges: parseFloat(vals.charges) || 0
    });
    Object.values(fields).forEach(function (id) {
      var el = document.getElementById(id); if (el) { el.value = ''; el.classList.remove('error'); }
    });
    renderAllPortfolioTabs();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderIncome === 'function') renderIncome();
    if (typeof showToast === 'function') showToast('Bien ajouté !', 'success');
  };

  window.addDCA = function () {
    var asset  = document.getElementById('dca-asset');
    var amount = document.getElementById('dca-amount');
    var cat    = document.getElementById('dca-cat');
    var day    = document.getElementById('dca-day');
    var ok = true;
    [asset, amount].forEach(function (el) {
      if (!el || !el.value.trim()) { if (el) el.classList.add('error'); ok = false; }
      else el.classList.remove('error');
    });
    if (!ok) return;
    addPosition('dca', {
      asset:  asset.value.trim(),
      amount: parseFloat(amount.value) || 0,
      cat:    cat ? cat.value : 'PEA',
      day:    parseInt(day ? day.value : 1) || 1
    });
    [asset, amount].forEach(function (el) { if (el) { el.value = ''; el.classList.remove('error'); } });
    renderAllPortfolioTabs();
    if (typeof showToast === 'function') showToast('DCA ajouté !', 'success');
  };

  window.renderPEA    = function () { renderStockTable('pea'); };
  window.renderCTO    = function () { renderStockTable('cto'); };
  window.renderCrypto = renderCrypto;
  window.renderImmo   = renderImmo;
  window.renderDCA    = renderDCA;

  window.renderAllPortfolioTabs = function () {
    renderStockTable('pea');
    renderStockTable('cto');
    renderCrypto();
    renderImmo();
    renderDCA();
    if (typeof renderDefi === 'function') renderDefi();
    if (typeof renderJournal === 'function') renderJournal();
  };

  // Refresh live prices every 60s
  setInterval(function () {
    if (document.getElementById('page-portfolio') &&
        document.getElementById('page-portfolio').classList.contains('active')) {
      renderCrypto();
      renderStockTable('pea');
      renderStockTable('cto');
    }
    if (typeof renderDashboard === 'function') renderDashboard();
  }, 60000);

  document.addEventListener('DOMContentLoaded', function () {
    var headers = document.querySelectorAll('#all-table thead th[data-sort]');
    if (!headers.length) return;
    headers.forEach(function (th) {
      th.addEventListener('click', function () {
        // handled by dashboard.js
      });
    });
  });
})();

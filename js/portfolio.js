/* ══════════════════════════════════════
   PORTFOLIO.JS — Full CRUD all categories
   ══════════════════════════════════════ */

(function () {
  var pendingDelete = {}; // { 'cat:id': timerRef }

  /* ── HELPERS ─────────────────────────── */
  function pnlClass(v) { return v >= 0 ? 'td-green' : 'td-red'; }
  function pnlSign(v)  { return v >= 0 ? '+' : ''; }

  function actionsCell(cat, id) {
    return '<td>' +
      '<button class="btn btn-ghost btn-sm" onclick="requestDelete(\'' + cat + '\',\'' + id + '\',this)">Supprimer</button>' +
      '</td>';
  }

  /* ── REQUEST DELETE ──────────────────── */
  window.requestDelete = function (cat, id, btn) {
    var key = cat + ':' + id;
    if (pendingDelete[key]) {
      // Already pending — confirm immediately
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

  /* ── PEA / CTO TABLE ─────────────────── */
  function renderStockTable(cat) {
    var items = STATE[cat] || [];
    var tbody = document.getElementById(cat + '-tbody');
    if (!tbody) return;
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-tertiary)">Aucune position. Ajoutez votre première ligne ci-dessus.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(function (p) {
      var inv = parseFloat(p.invested) || 0;
      var cur = parseFloat(p.current)  || 0;
      var pnl = cur - inv;
      var pct = inv > 0 ? (pnl / inv * 100) : 0;
      return '<tr>' +
        '<td><strong>' + (p.name || p.asset || '—') + '</strong></td>' +
        '<td class="td-mono">' + fmt(inv) + '</td>' +
        '<td class="td-mono">' + fmt(cur) + '</td>' +
        '<td class="td-mono ' + pnlClass(pnl) + '">' + pnlSign(pnl) + fmt(pnl) + '</td>' +
        '<td class="td-mono ' + pnlClass(pct) + '">' + pnlSign(pct) + pct.toFixed(2) + '%</td>' +
        actionsCell(cat, p.id) +
        '</tr>';
    }).join('');
    updateTabBadge(cat, items.length);
  }

  /* ── CRYPTO TABLE ────────────────────── */
  function renderCrypto() {
    var items = STATE.crypto || [];
    var tbody = document.getElementById('crypto-tbody');
    if (!tbody) return;

    var totalCur = items.reduce(function (a, b) { return a + (parseFloat(b.current) || 0); }, 0);
    var totalInv = items.reduce(function (a, b) { return a + (parseFloat(b.invested) || 0); }, 0);
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
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-tertiary)">Aucune crypto. Ajoutez votre première position.</td></tr>';
      updateTabBadge('crypto', 0);
      return;
    }
    tbody.innerHTML = items.map(function (p) {
      var inv = parseFloat(p.invested) || 0;
      var cur = parseFloat(p.current)  || 0;
      var pnl = cur - inv;
      var pct = inv > 0 ? (pnl / inv * 100) : 0;
      var mult = inv > 0 ? cur / inv : 1;
      return '<tr>' +
        '<td><strong>' + (p.name || '—') + '</strong></td>' +
        '<td class="td-mono">' + fmt(inv) + '</td>' +
        '<td class="td-mono">' + fmt(cur) + '</td>' +
        '<td class="td-mono ' + pnlClass(pnl) + '">' + pnlSign(pnl) + fmt(pnl) + '</td>' +
        '<td class="td-mono ' + pnlClass(pct) + '">' + pnlSign(pct) + pct.toFixed(2) + '%</td>' +
        '<td class="td-mono">' + fmtMult(mult) + '</td>' +
        actionsCell('crypto', p.id) +
        '</tr>';
    }).join('');
    updateTabBadge('crypto', items.length);
  }

  /* ── IMMO CARDS ──────────────────────── */
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
          '<div>' +
            '<div style="font-weight:600;font-size:15px">' + (p.name || 'Bien immobilier') + '</div>' +
            '<div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">' + (p.address || '') + '</div>' +
          '</div>' +
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

  /* ── DCA LIST + CALENDAR ─────────────── */
  function renderDCA() {
    var items = STATE.dca || [];
    var list = document.getElementById('dca-list');
    var cal  = document.getElementById('dca-calendar');
    if (list) {
      if (!items.length) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">Aucun DCA programmé.</div></div>';
      } else {
        var total = items.reduce(function (a, b) { return a + (parseFloat(b.amount) || 0); }, 0);
        list.innerHTML = '<div style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">Total mensuel : <strong style="color:var(--green);font-family:\'JetBrains Mono\',monospace">' + fmt(total) + '</strong></div>' +
          items.map(function (p) {
            return '<div class="dca-item">' +
              '<div class="dca-item-left">' +
                '<div class="dca-day">' + (p.day || 1) + '</div>' +
                '<div class="dca-info">' +
                  '<div class="dca-asset">' + (p.asset || '—') + '</div>' +
                  '<div class="dca-meta"><span class="badge badge-' + (p.cat || 'pea').toLowerCase() + '">' + (p.cat || 'PEA') + '</span></div>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:12px">' +
                '<div class="dca-amount">' + fmt(parseFloat(p.amount) || 0) + '</div>' +
                '<button class="btn btn-ghost btn-sm" onclick="requestDelete(\'dca\',\'' + p.id + '\',this)">×</button>' +
              '</div>' +
            '</div>';
          }).join('');
      }
    }
    // Calendar view
    if (cal) {
      var dcaDays = {};
      items.forEach(function (p) { dcaDays[p.day] = (dcaDays[p.day] || 0) + (parseFloat(p.amount) || 0); });
      var html = '';
      for (var d = 1; d <= 31; d++) {
        var hasDca = !!dcaDays[d];
        html += '<div class="cal-day' + (hasDca ? ' has-dca' : '') + '" title="' + (hasDca ? fmt(dcaDays[d]) : '') + '">' +
          '<div class="cal-day-num">' + d + '</div>' +
          (hasDca ? '<div class="cal-day-dot"></div>' : '') +
          '</div>';
      }
      cal.innerHTML = html;
    }
    updateTabBadge('dca', items.length);
  }

  function updateTabBadge(cat, count) {
    var badge = document.querySelector('.inner-tab[data-tab="' + cat + '"] .tab-badge');
    if (badge) badge.textContent = count;
  }

  /* ── ADD FORMS ───────────────────────── */
  window.addPos = function (cat) {
    var n    = document.getElementById(cat + '-n');
    var inv  = document.getElementById(cat + '-inv');
    var cur  = document.getElementById(cat + '-cur');
    if (!n) return;
    var ok = true;
    [n, inv, cur].forEach(function (el) {
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
      else if (el) el.classList.remove('error');
    });
    if (!ok) return;
    addPosition(cat, {
      name:     n.value.trim(),
      invested: parseFloat(inv ? inv.value : 0) || 0,
      current:  parseFloat(cur ? cur.value : 0) || 0
    });
    [n, inv, cur].forEach(function (el) { if (el) { el.value = ''; el.classList.remove('error'); } });
    renderAllPortfolioTabs();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof showToast === 'function') showToast('Position ajoutée !', 'success');
  };

  window.addImmo = function () {
    var fields = { name: 'immo-name', price: 'immo-price', invested: 'immo-inv', loyer: 'immo-loyer', charges: 'immo-charges', address: 'immo-addr' };
    var vals = {};
    var required = ['immo-name', 'immo-price'];
    var ok = true;
    Object.keys(fields).forEach(function (k) {
      var el = document.getElementById(fields[k]);
      if (el) {
        vals[k] = el.value.trim();
        if (required.indexOf(fields[k]) !== -1 && !vals[k]) { el.classList.add('error'); ok = false; }
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
    Object.values(fields).forEach(function (id) { var el = document.getElementById(id); if (el) { el.value = ''; el.classList.remove('error'); } });
    renderAllPortfolioTabs();
    if (typeof renderDashboard === 'function') renderDashboard();
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

  /* ── RENDER ALL ──────────────────────── */
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
  };
})();

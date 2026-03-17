/* ══════════════════════════════════════
   PORTFOLIO.JS — CRUD complet toutes catégories
   ══════════════════════════════════════ */

(function () {

  var deleteTimers = {};

  function emptyStateSVG(type) {
    var icons = {
      pea: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="16" x2="36" y2="16" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="12" r="1.5" fill="currentColor"/></svg>',
      crypto: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="1.5"/><path d="M16 16h4c2.2 0 4 1.3 4 3s-1.8 3-4 3h-4m0-6v12m0-6h5c2.2 0 4 1.3 4 3s-1.8 3-4 3h-5m2-14v2m0 12v2" stroke="currentColor" stroke-width="1.5"/></svg>',
      immo: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M6 20l14-12 14 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="10" y="20" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="16" y="26" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>',
      dca: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="6" y="6" width="28" height="28" rx="6" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="14" x2="34" y2="14" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="16" cy="10" r="1" fill="currentColor"/><line x1="12" y1="20" x2="24" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="26" x2="20" y2="26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
      default: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="4" width="32" height="32" rx="6" stroke="currentColor" stroke-width="1.5"/><line x1="14" y1="28" x2="14" y2="18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="28" x2="20" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="26" y1="28" x2="26" y2="22" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
    };
    return icons[type] || icons['default'];
  }

  function renderEmptyState(cat, message, sub) {
    return '<div class="empty-state">' +
      '<div class="empty-icon" style="color:var(--text3)">' + emptyStateSVG(cat) + '</div>' +
      '<div class="empty-text">' + (message || 'Aucune position') + '</div>' +
      '<div class="empty-sub">' + (sub || 'Ajoute ta première position ci-dessus') + '</div>' +
      '</div>';
  }

  /* ── DELETE with inline confirm ─── */
  function requestDelete(cat, id, btnEl) {
    var key = cat + '-' + id;
    if (deleteTimers[key]) {
      // Second click = confirm
      clearTimeout(deleteTimers[key]);
      delete deleteTimers[key];
      removePosition(cat, id);
      renderAllPortfolioTabs();
      if (typeof renderDashboard === 'function') renderDashboard();
      showToast('Position supprimée', 'success');
      return;
    }
    // First click: show confirm state
    btnEl.textContent = 'Confirmer ?';
    btnEl.classList.add('btn-danger-active');
    deleteTimers[key] = setTimeout(function () {
      btnEl.textContent = 'Supprimer';
      btnEl.classList.remove('btn-danger-active');
      delete deleteTimers[key];
    }, 3000);
  }

  /* ── PEA & CTO ─────────────────── */
  function renderTable(cat) {
    var tbody = document.getElementById(cat + '-tbody');
    if (!tbody) return;
    var items = window.STATE[cat];
    if (!items || !items.length) {
      tbody.innerHTML = '<tr><td colspan="6">' + renderEmptyState(cat, 'Aucune position ' + cat.toUpperCase()) + '</td></tr>';
      return;
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var p = items[i];
      var pnl = p.current - p.invested;
      var pct = p.invested > 0 ? (pnl / p.invested * 100) : 0;
      var cls = pnl >= 0 ? 'price-up' : 'price-down';
      html += '<tr class="tr-transition">' +
        '<td style="font-weight:500">' + p.name + '</td>' +
        '<td>' + fmt(p.invested) + '</td>' +
        '<td style="font-weight:500">' + fmt(p.current) + '</td>' +
        '<td class="' + cls + '">' + (pnl >= 0 ? '+' : '') + fmt(pnl) + '</td>' +
        '<td class="' + cls + '">' + fmtPct(pct) + '</td>' +
        '<td><button class="btn-sm btn-danger" data-cat="' + cat + '" data-id="' + p.id + '">Supprimer</button></td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
  }

  function renderPEA() { renderTable('pea'); }
  function renderCTO() { renderTable('cto'); }

  /* ── CRYPTO ────────────────────── */
  function renderCrypto() {
    var tbody = document.getElementById('crypto-tbody');
    if (!tbody) return;
    var items = window.STATE.crypto;

    // Tax provision
    var totalPnl = 0;
    for (var t = 0; t < items.length; t++) {
      totalPnl += (items[t].current - items[t].invested);
    }
    var tax = Math.max(0, totalPnl * 0.3);
    var taxEl = document.getElementById('crypto-tax-provision');
    if (taxEl) {
      taxEl.textContent = fmt(tax);
      var banner = taxEl.closest('.card-title');
      if (banner) {
        banner.style.display = (items.length > 0) ? '' : 'none';
      }
    }

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6">' + renderEmptyState('crypto', 'Aucune position Crypto') + '</td></tr>';
      return;
    }

    var html = '';
    for (var i = 0; i < items.length; i++) {
      var p = items[i];
      var pnl = p.current - p.invested;
      var mult = p.invested > 0 ? (p.current / p.invested) : 1;
      var cls = pnl >= 0 ? 'price-up' : 'price-down';
      html += '<tr class="tr-transition">' +
        '<td style="font-weight:500">' + p.name + '</td>' +
        '<td>' + fmt(p.invested) + '</td>' +
        '<td style="font-weight:500">' + fmt(p.current) + '</td>' +
        '<td class="' + cls + '">' + (pnl >= 0 ? '+' : '') + fmt(pnl) + '</td>' +
        '<td class="' + cls + '">' + fmtMult(mult) + '</td>' +
        '<td><button class="btn-sm btn-danger" data-cat="crypto" data-id="' + p.id + '">Supprimer</button></td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
  }

  /* ── IMMO ──────────────────────── */
  function renderImmo() {
    var wrap = document.getElementById('immo-cards-wrap');
    if (!wrap) return;
    var items = window.STATE.immo;
    if (!items.length) {
      wrap.innerHTML = renderEmptyState('immo', 'Aucun bien', 'Ajoute ton premier investissement immobilier');
      return;
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var b = items[i];
      var cf = b.loyer - b.mensualite;
      var rend = b.valeur > 0 ? (b.loyer * 12 / b.valeur * 100) : 0;
      var pv = b.valeur - b.prix;
      html += '<div class="card" style="margin-bottom:16px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">' +
          '<div style="font-size:18px;font-weight:500">' + b.name + '</div>' +
          '<button class="btn-sm btn-danger" data-cat="immo" data-id="' + b.id + '">Supprimer</button>' +
        '</div>' +
        '<div class="metric-grid">' +
          '<div class="metric-card"><div class="metric-label">Valeur estimée</div><div class="metric-value" style="font-size:22px">' + fmt(b.valeur) + '</div></div>' +
          '<div class="metric-card"><div class="metric-label">Cash-flow mensuel</div><div class="metric-value ' + (cf >= 0 ? 'delta-up' : 'delta-down') + '" style="font-size:22px">' + (cf >= 0 ? '+' : '') + fmt(cf) + '</div></div>' +
          '<div class="metric-card"><div class="metric-label">Rendement brut</div><div class="metric-value" style="font-size:22px">' + rend.toFixed(1) + '%</div></div>' +
          '<div class="metric-card"><div class="metric-label">Plus-value latente</div><div class="metric-value ' + (pv >= 0 ? 'delta-up' : 'delta-down') + '" style="font-size:22px">' + (pv >= 0 ? '+' : '') + fmt(pv) + '</div></div>' +
        '</div>' +
      '</div>';
    }
    wrap.innerHTML = html;
  }

  /* ── DCA ────────────────────────── */
  function renderDCA() {
    var list = document.getElementById('dca-list');
    var totalWrap = document.getElementById('dca-total-wrap');
    if (!list) return;
    var items = window.STATE.dca;
    if (!items.length) {
      list.innerHTML = renderEmptyState('dca', 'Aucun DCA configuré');
      if (totalWrap) totalWrap.style.display = 'none';
      return;
    }
    var catBadge = { PEA: 'badge-blue', CTO: 'badge-green', Crypto: 'badge-amber', 'Livret A': 'badge-gray' };
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var d = items[i];
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<span class="badge ' + (catBadge[d.cat] || 'badge-gray') + '">' + d.cat + '</span>' +
          '<span style="font-weight:500">' + d.asset + '</span>' +
          '<span style="font-size:12px;color:var(--text3)">le ' + d.day + ' du mois</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<span style="font-size:18px;font-weight:300">' + fmt(d.amount) + '</span>' +
          '<button class="btn-sm btn-danger" data-cat="dca" data-id="' + d.id + '">×</button>' +
        '</div>' +
      '</div>';
    }
    list.innerHTML = html;
    var total = 0;
    for (var j = 0; j < items.length; j++) total += items[j].amount;
    if (totalWrap) {
      totalWrap.style.display = 'flex';
      document.getElementById('dca-total').textContent = fmt(total);
    }
  }

  /* ── ADD handlers ──────────────── */
  function addPos(cat) {
    var nameEl = document.getElementById(cat + '-n');
    var invEl = document.getElementById(cat + '-i');
    var curEl = document.getElementById(cat + '-c');
    var name = nameEl.value.trim();
    var invested = parseFloat(invEl.value) || 0;
    var current = parseFloat(curEl.value) || 0;

    var valid = true;
    if (!name) { nameEl.style.borderColor = 'var(--red)'; valid = false; } else { nameEl.style.borderColor = ''; }
    if (!current) { curEl.style.borderColor = 'var(--red)'; valid = false; } else { curEl.style.borderColor = ''; }
    if (!valid) return;

    addPosition(cat, { name: name, invested: invested, current: current });
    nameEl.value = '';
    invEl.value = '';
    curEl.value = '';
    nameEl.focus();
    renderAllPortfolioTabs();
    if (typeof renderDashboard === 'function') renderDashboard();
    showToast(name + ' ajouté au ' + cat.toUpperCase(), 'success');
  }

  function addImmo() {
    var nEl = document.getElementById('immo-n');
    var pEl = document.getElementById('immo-p');
    var vEl = document.getElementById('immo-v');
    var lEl = document.getElementById('immo-l');
    var mEl = document.getElementById('immo-m');
    var name = nEl.value.trim();
    var prix = parseFloat(pEl.value) || 0;
    var valeur = parseFloat(vEl.value) || 0;
    var loyer = parseFloat(lEl.value) || 0;
    var mensualite = parseFloat(mEl.value) || 0;

    var valid = true;
    if (!name) { nEl.style.borderColor = 'var(--red)'; valid = false; } else { nEl.style.borderColor = ''; }
    if (!valeur) { vEl.style.borderColor = 'var(--red)'; valid = false; } else { vEl.style.borderColor = ''; }
    if (!valid) return;

    addPosition('immo', { name: name, prix: prix, valeur: valeur, loyer: loyer, mensualite: mensualite });
    nEl.value = ''; pEl.value = ''; vEl.value = ''; lEl.value = ''; mEl.value = '';
    nEl.focus();
    renderAllPortfolioTabs();
    if (typeof renderDashboard === 'function') renderDashboard();
    showToast(name + ' ajouté', 'success');
  }

  function addDCA() {
    var catEl = document.getElementById('dca-cat');
    var assetEl = document.getElementById('dca-asset');
    var amtEl = document.getElementById('dca-amt');
    var dayEl = document.getElementById('dca-day');
    var asset = assetEl.value.trim();
    var amount = parseFloat(amtEl.value) || 0;
    var day = parseInt(dayEl.value) || 1;

    var valid = true;
    if (!asset) { assetEl.style.borderColor = 'var(--red)'; valid = false; } else { assetEl.style.borderColor = ''; }
    if (!amount) { amtEl.style.borderColor = 'var(--red)'; valid = false; } else { amtEl.style.borderColor = ''; }
    if (!valid) return;

    addPosition('dca', { cat: catEl.value, asset: asset, amount: amount, day: day });
    assetEl.value = '';
    amtEl.value = '';
    assetEl.focus();
    renderDCA();
    showToast('DCA ' + asset + ' configuré', 'success');
  }

  /* ── RENDER ALL ────────────────── */
  function renderAllPortfolioTabs() {
    renderPEA();
    renderCTO();
    renderCrypto();
    renderImmo();
    renderDCA();
  }

  /* ── Event delegation for delete buttons ── */
  document.addEventListener('click', function (e) {
    var btn = e.target;
    if (btn.classList.contains('btn-danger') && btn.dataset.cat && btn.dataset.id) {
      requestDelete(btn.dataset.cat, btn.dataset.id, btn);
    }
  });

  // Expose globally
  window.renderPEA = renderPEA;
  window.renderCTO = renderCTO;
  window.renderCrypto = renderCrypto;
  window.renderImmo = renderImmo;
  window.renderDCA = renderDCA;
  window.renderAllPortfolioTabs = renderAllPortfolioTabs;
  window.addPos = addPos;
  window.addImmo = addImmo;
  window.addDCA = addDCA;
})();

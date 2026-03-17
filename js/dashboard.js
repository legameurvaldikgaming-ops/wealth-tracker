/* ══════════════════════════════════════
   DASHBOARD.JS — Assemblage dashboard principal
   ══════════════════════════════════════ */

(function () {

  function getDailyQuote() {
    return QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];
  }

  function renderDashboard() {
    var t = getTotals();

    // Metric cards
    var totalEl = document.getElementById('d-total');
    var totalPctEl = document.getElementById('d-total-pct');
    var peaEl = document.getElementById('d-pea');
    var peaDEl = document.getElementById('d-pea-d');
    var cryptoEl = document.getElementById('d-crypto');
    var cryptoDEl = document.getElementById('d-crypto-d');
    var immoEl = document.getElementById('d-immo');
    var immoDEl = document.getElementById('d-immo-d');

    if (totalEl) totalEl.textContent = fmt(t.total);
    if (totalPctEl) {
      totalPctEl.textContent = fmtPct(t.pnlPct);
      totalPctEl.className = t.pnlPct >= 0 ? 'delta-up' : 'delta-down';
    }
    if (peaEl) peaEl.textContent = fmt(t.pea);
    if (peaDEl) peaDEl.textContent = STATE.pea.length + ' position' + (STATE.pea.length !== 1 ? 's' : '');
    if (cryptoEl) cryptoEl.textContent = fmt(t.crypto);
    if (cryptoDEl) cryptoDEl.textContent = STATE.crypto.length + ' position' + (STATE.crypto.length !== 1 ? 's' : '');
    if (immoEl) immoEl.textContent = fmt(t.immo);
    if (immoDEl) immoDEl.textContent = STATE.immo.length + ' bien' + (STATE.immo.length !== 1 ? 's' : '');

    // Donut chart
    var donutData = [];
    if (t.pea > 0) donutData.push({ value: t.pea, color: '#0071e3', label: 'PEA' });
    if (t.cto > 0) donutData.push({ value: t.cto, color: '#34c759', label: 'CTO' });
    if (t.crypto > 0) donutData.push({ value: t.crypto, color: '#ff9f0a', label: 'Crypto' });
    if (t.immo > 0) donutData.push({ value: t.immo, color: '#af52de', label: 'Immo' });
    drawDonut('donutChart', donutData);

    // Legend
    var legend = document.getElementById('donut-legend');
    if (legend) {
      if (donutData.length) {
        var lhtml = '';
        for (var i = 0; i < donutData.length; i++) {
          var d = donutData[i];
          var pct = t.total > 0 ? (d.value / t.total * 100).toFixed(0) : 0;
          lhtml += '<div class="legend-item"><span class="legend-dot" style="background:' + d.color + '"></span><span>' + d.label + ' — ' + pct + '%</span></div>';
        }
        legend.innerHTML = lhtml;
      } else {
        legend.innerHTML = '<div style="font-size:13px;color:var(--text3)">Ajoute des positions</div>';
      }
    }

    // Projection
    drawProjection('projCanvas', t.total);

    // All positions table
    renderAllTable();

    // Quote
    var q = getDailyQuote();
    var quoteTextEl = document.getElementById('dash-quote-text');
    var quoteAuthorEl = document.getElementById('dash-quote-author');
    if (quoteTextEl) quoteTextEl.textContent = q.text;
    if (quoteAuthorEl) quoteAuthorEl.textContent = '— ' + q.author;

    // FI progress
    if (typeof updateFI === 'function') updateFI();
  }

  function renderAllTable() {
    var tbody = document.getElementById('all-tbody');
    if (!tbody) return;

    var all = [];
    var cats = ['pea', 'cto', 'crypto'];
    for (var c = 0; c < cats.length; c++) {
      var items = STATE[cats[c]];
      for (var i = 0; i < items.length; i++) {
        all.push({ name: items[i].name, invested: items[i].invested, current: items[i].current, cat: cats[c].toUpperCase() === 'CRYPTO' ? 'Crypto' : cats[c].toUpperCase() });
      }
    }
    for (var j = 0; j < STATE.immo.length; j++) {
      var b = STATE.immo[j];
      all.push({ name: b.name, invested: b.prix, current: b.valeur, cat: 'Immo' });
    }

    if (!all.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">' +
        '<div class="empty-icon" style="color:var(--text3)"><svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="4" width="32" height="32" rx="6" stroke="currentColor" stroke-width="1.5"/><line x1="14" y1="28" x2="14" y2="18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="28" x2="20" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="26" y1="28" x2="26" y2="22" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div>' +
        '<div class="empty-text">Aucune position</div>' +
        '<div class="empty-sub">Ajoute tes actifs dans l\'onglet Portfolio</div>' +
        '</div></td></tr>';
      return;
    }

    var catBadge = { PEA: 'badge-blue', CTO: 'badge-green', Crypto: 'badge-amber', Immo: 'badge-purple' };
    var html = '';
    for (var k = 0; k < all.length; k++) {
      var p = all[k];
      var pnl = p.current - (p.invested || 0);
      var pct = p.invested > 0 ? (pnl / p.invested * 100) : 0;
      var cls = pnl >= 0 ? 'price-up' : 'price-down';
      html += '<tr class="tr-transition">' +
        '<td style="font-weight:500">' + p.name + '</td>' +
        '<td><span class="badge ' + (catBadge[p.cat] || 'badge-gray') + '">' + p.cat + '</span></td>' +
        '<td style="font-weight:500">' + fmt(p.current) + '</td>' +
        '<td>' + (p.invested ? fmt(p.invested) : '—') + '</td>' +
        '<td class="' + cls + '">' + (p.invested ? (pnl >= 0 ? '+' : '') + fmt(pnl) : '') + '</td>' +
        '<td class="' + cls + '">' + (p.invested ? fmtPct(pct) : '') + '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
  }

  // Expose globally
  window.getDailyQuote = getDailyQuote;
  window.renderDashboard = renderDashboard;
  window.renderAllTable = renderAllTable;
})();

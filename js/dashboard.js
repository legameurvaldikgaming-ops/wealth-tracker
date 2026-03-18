/* ══════════════════════════════════════
   DASHBOARD.JS — Main dashboard
   ══════════════════════════════════════ */

(function () {
  var sortCol = 'pnl';
  var sortDir = -1; // -1 = desc

  function getDailyQuote() {
    var QUOTES = window.QUOTES || [];
    return QUOTES[Math.floor(Date.now() / 86400000) % (QUOTES.length || 1)] || {};
  }

  /* ── RENDER DASHBOARD ────────────────── */
  window.renderDashboard = function () {
    var totals = typeof getTotals === 'function' ? getTotals() : { pea: 0, cto: 0, crypto: 0, immo: 0, total: 0, invested: 0, pnl: 0, pnlPct: 0 };

    // Metric cards via animateCounter
    function updateMetric(id, val, prev) {
      var el = document.getElementById(id);
      if (!el) return;
      if (typeof animateCounter === 'function' && typeof fmt === 'function') {
        animateCounter(el, prev || 0, val, 800, fmt);
      } else if (typeof fmt === 'function') {
        el.textContent = fmt(val);
      }
      if (typeof pulseElement === 'function') pulseElement(el);
    }

    updateMetric('metric-total',    totals.total);
    updateMetric('metric-invested', totals.invested);
    updateMetric('metric-pnl',      totals.pnl);
    updateMetric('metric-pea',      totals.pea);
    updateMetric('metric-cto',      totals.cto);
    updateMetric('metric-crypto',   totals.crypto);
    updateMetric('metric-immo',     totals.immo);

    var pnlEl = document.getElementById('metric-pnl-pct');
    if (pnlEl && typeof fmtPct === 'function') {
      pnlEl.textContent = fmtPct(totals.pnlPct);
      pnlEl.className = totals.pnlPct >= 0 ? 'up' : 'down';
    }

    // Nav total
    var navTotal = document.getElementById('nav-total');
    if (navTotal && typeof fmtCompact === 'function') {
      navTotal.textContent = fmtCompact(totals.total);
    }

    // Sparklines on metric cards
    if (typeof generateSparkData === 'function' && typeof drawSparkline === 'function') {
      var sparkDefs = [
        { canvas: 'spark-total',    base: totals.total    || 50000, color: '#3b82f6' },
        { canvas: 'spark-pea',      base: totals.pea      || 20000, color: '#3b82f6' },
        { canvas: 'spark-cto',      base: totals.cto      || 10000, color: '#a855f7' },
        { canvas: 'spark-crypto',   base: totals.crypto   || 5000,  color: '#f59e0b' },
        { canvas: 'spark-immo',     base: totals.immo     || 0,     color: '#22c55e' },
        { canvas: 'spark-invested', base: totals.invested || 30000, color: '#22c55e' }
      ];
      sparkDefs.forEach(function (def) {
        var canvas = document.getElementById(def.canvas);
        if (canvas && def.base > 0) {
          drawSparkline(canvas, generateSparkData(def.base, 12, 0.03), def.color);
        }
      });
    }

    // Donut
    if (typeof drawDonut === 'function') {
      var donutData = [
        { value: totals.pea,    color: '#3b82f6', label: 'PEA' },
        { value: totals.cto,    color: '#a855f7', label: 'CTO' },
        { value: totals.crypto, color: '#f59e0b', label: 'Crypto' },
        { value: totals.immo,   color: '#22c55e', label: 'Immo' }
      ].filter(function (d) { return d.value > 0; });
      if (!donutData.length) donutData = [{ value: 1, color: '#333', label: '' }];
      drawDonut('donut-chart', donutData);

      // Legend
      var legend = document.getElementById('donut-legend');
      if (legend) {
        var total = donutData.reduce(function (a, b) { return a + b.value; }, 0);
        legend.innerHTML = donutData.map(function (d) {
          var pct = total > 0 ? (d.value / total * 100).toFixed(1) : '0.0';
          return '<div class="legend-item">' +
            '<div class="legend-dot" style="background:' + d.color + '"></div>' +
            '<span class="legend-lbl">' + d.label + '</span>' +
            '<span class="legend-val">' + (typeof fmt === 'function' ? fmt(d.value) : d.value) + '</span>' +
            '<span class="legend-pct">' + pct + '%</span>' +
          '</div>';
        }).join('');
      }

      // Donut center
      var donutTot = document.getElementById('donut-total');
      if (donutTot && typeof fmt === 'function') donutTot.textContent = fmt(totals.total);
    }

    // Projection
    if (typeof drawProjection === 'function') {
      drawProjection('proj-chart', totals.total);
    }

    // Daily quote
    var q = getDailyQuote();
    var qEl = document.getElementById('dash-quote-text');
    if (qEl && q.text) {
      qEl.textContent = q.text;
      if (typeof revealWords === 'function') revealWords(qEl);
    }
    var qAuth = document.getElementById('dash-quote-author');
    if (qAuth) qAuth.textContent = q.author ? '— ' + q.author : '';

    // All positions table
    renderAllTable();

    // FI update
    if (typeof updateFI === 'function') updateFI();

    // Stagger reveal
    if (typeof staggerReveal === 'function') {
      staggerReveal('.metric-card', 60);
    }
  };

  /* ── ALL POSITIONS TABLE ─────────────── */
  function renderAllTable() {
    var tbody = document.getElementById('all-tbody');
    if (!tbody) return;
    var s = window.STATE || {};
    var rows = [];

    ['pea', 'cto', 'crypto'].forEach(function (cat) {
      (s[cat] || []).forEach(function (p) {
        var inv = parseFloat(p.invested) || 0;
        var cur = parseFloat(p.current)  || 0;
        var pnl = cur - inv;
        var pct = inv > 0 ? pnl / inv * 100 : 0;
        rows.push({ cat: cat.toUpperCase(), name: p.name || p.asset || '—', invested: inv, current: cur, pnl: pnl, pct: pct });
      });
    });
    (s.immo || []).forEach(function (p) {
      var inv = parseFloat(p.invested) || 0;
      var cur = parseFloat(p.price)    || 0;
      var pnl = cur - inv;
      var pct = inv > 0 ? pnl / inv * 100 : 0;
      rows.push({ cat: 'IMMO', name: p.name || 'Immobilier', invested: inv, current: cur, pnl: pnl, pct: pct });
    });

    // Sort
    rows.sort(function (a, b) { return (a[sortCol] - b[sortCol]) * sortDir; });

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-tertiary)">Aucune position. Commencez par ajouter des actifs dans Portfolio.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function (r) {
      var pnlClass = r.pnl >= 0 ? 'td-green' : 'td-red';
      return '<tr>' +
        '<td><span class="badge badge-' + r.cat.toLowerCase() + '">' + r.cat + '</span> ' + r.name + '</td>' +
        '<td class="td-mono">' + (typeof fmt === 'function' ? fmt(r.invested) : r.invested) + '</td>' +
        '<td class="td-mono">' + (typeof fmt === 'function' ? fmt(r.current)  : r.current)  + '</td>' +
        '<td class="td-mono ' + pnlClass + '">' + (r.pnl >= 0 ? '+' : '') + (typeof fmt === 'function' ? fmt(r.pnl) : r.pnl) + '</td>' +
        '<td class="td-mono ' + pnlClass + '">' + (r.pct >= 0 ? '+' : '') + r.pct.toFixed(2) + '%</td>' +
      '</tr>';
    }).join('');
  }

  /* ── SORTABLE TABLE ──────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var headers = document.querySelectorAll('#all-table thead th[data-sort]');
    headers.forEach(function (th) {
      th.addEventListener('click', function () {
        var col = th.dataset.sort;
        if (sortCol === col) { sortDir *= -1; }
        else { sortCol = col; sortDir = -1; }
        headers.forEach(function (h) {
          var ind = h.querySelector('.sort-indicator');
          if (ind) { ind.textContent = ''; ind.classList.remove('active'); }
        });
        var ind = th.querySelector('.sort-indicator');
        if (ind) {
          ind.textContent = sortDir === -1 ? ' ↓' : ' ↑';
          ind.classList.add('active');
        }
        renderAllTable();
      });
    });
  });
})();

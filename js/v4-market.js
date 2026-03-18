/* ══════════════════════════════════════
   V4-MARKET.JS — Fear & Greed, BTC Dominance, Halving, Macro Calendar
   ══════════════════════════════════════ */

(function () {

  // ── FEAR & GREED INDEX ────────────────
  var fngCache = null;
  var fngLastFetch = 0;

  var BUFFETT_QUOTES = {
    extreme_fear:  '"Soyez avides quand les autres ont peur." — Warren Buffett',
    fear:          '"Achetez quand tout le monde vend." — Warren Buffett',
    neutral:       '"Le marché est là pour vous servir, pas pour vous guider." — Benjamin Graham',
    greed:         '"Les marchés peuvent rester irrationnels plus longtemps que vous ne pouvez rester solvable." — J. Keynes',
    extreme_greed: '"Soyez prudents quand les autres sont avides." — Warren Buffett'
  };

  function getFngQuote(value) {
    if (value <= 25) return BUFFETT_QUOTES.extreme_fear;
    if (value <= 45) return BUFFETT_QUOTES.fear;
    if (value <= 55) return BUFFETT_QUOTES.neutral;
    if (value <= 75) return BUFFETT_QUOTES.greed;
    return BUFFETT_QUOTES.extreme_greed;
  }

  function getFngLabel(value) {
    if (value <= 25) return 'Peur Extrême';
    if (value <= 45) return 'Peur';
    if (value <= 55) return 'Neutre';
    if (value <= 75) return 'Cupidité';
    return 'Cupidité Extrême';
  }

  function getFngColor(value) {
    if (value <= 25) return '#ff3b30';
    if (value <= 45) return '#ff9f0a';
    if (value <= 55) return '#aeaeb2';
    if (value <= 75) return '#34c759';
    return '#00c7be';
  }

  function drawFngGauge(canvas, value) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.offsetWidth || 200;
    var h = 110;
    canvas.width = w; canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    var cx = w / 2, cy = h - 10, r = Math.min(cx, cy) - 8;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'var(--bg-elevated, #2c2c2e)';
    ctx.stroke();

    // Colored arc
    var gradient = ctx.createLinearGradient(cx-r, cy, cx+r, cy);
    gradient.addColorStop(0,    '#ff3b30');
    gradient.addColorStop(0.25, '#ff9f0a');
    gradient.addColorStop(0.5,  '#aeaeb2');
    gradient.addColorStop(0.75, '#34c759');
    gradient.addColorStop(1,    '#00c7be');

    var endAngle = Math.PI + (value / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, endAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Needle
    var angle = Math.PI + (value / 100) * Math.PI;
    var nx = cx + (r - 4) * Math.cos(angle);
    var ny = cy + (r - 4) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = getFngColor(value);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = getFngColor(value);
    ctx.fill();

    // Labels
    ctx.font = '10px var(--font, sans-serif)';
    ctx.fillStyle = 'var(--text-secondary, #aeaeb2)';
    ctx.textAlign = 'left'; ctx.fillText('0', 4, cy-2);
    ctx.textAlign = 'right'; ctx.fillText('100', w-4, cy-2);
    ctx.textAlign = 'center'; ctx.fillText('50', cx, 12);
  }

  function renderFng(data) {
    var value = parseInt(data.value) || 50;
    var canvas = document.getElementById('fng-gauge');
    var valueEl = document.getElementById('fng-value');
    var labelEl = document.getElementById('fng-label');
    var quoteEl = document.getElementById('fng-quote');
    var updEl   = document.getElementById('fng-updated');

    if (canvas) drawFngGauge(canvas, value);
    if (valueEl) {
      valueEl.textContent = value;
      valueEl.style.color = getFngColor(value);
    }
    if (labelEl) {
      labelEl.textContent = getFngLabel(value);
      labelEl.style.color = getFngColor(value);
    }
    if (quoteEl) quoteEl.textContent = getFngQuote(value);
    if (updEl)   updEl.textContent   = 'Mis à jour : ' + (data.value_classification || getFngLabel(value));

    // Expose for coach
    window.FEAR_GREED_VALUE = value;
    if (typeof renderCoach === 'function') renderCoach();
  }

  function fetchFng() {
    var now = Date.now();
    if (now - fngLastFetch < 3600000 && fngCache) { renderFng(fngCache); return; }
    fetch('https://api.alternative.me/fng/?limit=1')
      .then(function(r){ return r.json(); })
      .then(function(d) {
        var item = d.data && d.data[0];
        if (item) {
          fngCache = item;
          fngLastFetch = Date.now();
          renderFng(item);
        }
      })
      .catch(function() {
        // Fallback: render with neutral value
        renderFng({ value: 50, value_classification: 'Neutral (offline)' });
      });
  }

  // ── BTC DOMINANCE ─────────────────────
  function fetchBtcDominance() {
    fetch('https://api.coingecko.com/api/v3/global')
      .then(function(r){ return r.json(); })
      .then(function(d) {
        var dom = d.data && d.data.market_cap_percentage && d.data.market_cap_percentage.btc;
        if (dom !== undefined) {
          var domPct = dom.toFixed(1);
          var el = document.getElementById('btc-dominance-value');
          if (el) el.textContent = domPct + '%';
          var msgEl = document.getElementById('btc-dominance-msg');
          if (msgEl) {
            if (dom < 40) {
              msgEl.textContent = 'Dominance BTC < 40% — Alt season probable 🚀';
              msgEl.style.color = 'var(--green)';
            } else if (dom > 60) {
              msgEl.textContent = 'Dominance BTC > 60% — Bitcoin leads, alts sous-performent';
              msgEl.style.color = 'var(--amber)';
            } else {
              msgEl.textContent = 'Dominance BTC : ' + domPct + '% — Marché équilibré';
              msgEl.style.color = 'var(--text-secondary)';
            }
          }
          window.BTC_DOMINANCE = dom;
        }
      })
      .catch(function(){});
  }

  // ── HALVING COUNTDOWN ─────────────────
  var NEXT_HALVING = new Date('2028-04-15T00:00:00Z');
  var HALVING_HISTORY = [
    { date: '2012-11-28', priceBefore: 12,   priceAfter: 260,   year: '2012/2013' },
    { date: '2016-07-09', priceBefore: 650,  priceAfter: 20000, year: '2016/2017' },
    { date: '2020-05-11', priceBefore: 8000, priceAfter: 69000, year: '2020/2021' }
  ];

  function renderHalvingCountdown() {
    var now   = Date.now();
    var diff  = NEXT_HALVING.getTime() - now;
    var days  = Math.floor(diff / (1000*3600*24));
    var hours = Math.floor((diff % (1000*3600*24)) / (1000*3600));
    var mins  = Math.floor((diff % (1000*3600)) / 60000);

    var daysEl  = document.getElementById('halving-days');
    var hoursEl = document.getElementById('halving-hours');
    var minsEl  = document.getElementById('halving-mins');
    var histEl  = document.getElementById('halving-history');

    if (daysEl)  daysEl.textContent  = days;
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2,'0');
    if (minsEl)  minsEl.textContent  = String(mins).padStart(2,'0');

    if (histEl) {
      histEl.innerHTML = HALVING_HISTORY.map(function(h) {
        var mult = h.priceAfter / h.priceBefore;
        return '<div class="halving-item">' +
          '<div class="halving-year">' + h.year + '</div>' +
          '<div class="halving-prices">' +
            '<span style="color:var(--text-tertiary)">' + h.priceBefore.toLocaleString() + '$</span>' +
            '<span style="color:var(--text-tertiary)"> → </span>' +
            '<span style="color:var(--green)">' + h.priceAfter.toLocaleString() + '$</span>' +
          '</div>' +
          '<div class="halving-mult" style="color:var(--amber)">×' + Math.round(mult) + '</div>' +
        '</div>';
      }).join('');
    }
  }

  // ── MACRO CALENDAR ────────────────────
  // Fixed recurring dates (approximate)
  function getNextFedDate() {
    var FED_MEETINGS_2025_26 = [
      '2025-03-19','2025-05-07','2025-06-18','2025-07-30','2025-09-17',
      '2025-10-29','2025-12-17','2026-01-28','2026-03-18','2026-04-29',
      '2026-06-17','2026-07-29','2026-09-16','2026-10-28','2026-12-16'
    ];
    var now = new Date();
    for (var i = 0; i < FED_MEETINGS_2025_26.length; i++) {
      var d = new Date(FED_MEETINGS_2025_26[i]);
      if (d >= now) return d;
    }
    return null;
  }

  function getNextBceDate() {
    var BCE_MEETINGS = [
      '2025-03-06','2025-04-17','2025-06-05','2025-07-24','2025-09-11',
      '2025-10-30','2025-12-18','2026-01-22','2026-03-12','2026-04-30',
      '2026-06-11','2026-07-23','2026-09-10','2026-10-29','2026-12-17'
    ];
    var now = new Date();
    for (var i = 0; i < BCE_MEETINGS.length; i++) {
      var d = new Date(BCE_MEETINGS[i]);
      if (d >= now) return d;
    }
    return null;
  }

  function renderMacroCalendar() {
    var el = document.getElementById('macro-calendar');
    if (!el) return;
    var now = new Date();
    var fed = getNextFedDate();
    var bce = getNextBceDate();
    var halvingDays = Math.floor((NEXT_HALVING.getTime() - now.getTime()) / (1000*3600*24));

    function daysDiff(d) {
      if (!d) return '?';
      var diff = Math.floor((d.getTime() - now.getTime()) / (1000*3600*24));
      return diff >= 0 ? 'J-' + diff : 'Passé';
    }

    var events = [
      { label: '🏛️ Fed (FOMC)', date: fed, days: daysDiff(fed), color: 'var(--accent)' },
      { label: '🇪🇺 BCE',       date: bce, days: daysDiff(bce), color: 'var(--purple, #a855f7)' },
      { label: '₿ Halving BTC', date: NEXT_HALVING, days: 'J-' + halvingDays, color: 'var(--amber)' }
    ];

    el.innerHTML = events.map(function(e) {
      var dateStr = e.date ? e.date.toLocaleDateString('fr-FR', {day:'numeric',month:'short',year:'numeric'}) : '—';
      return '<div class="macro-event">' +
        '<div class="macro-event-label">' + e.label + '</div>' +
        '<div class="macro-event-date">' + dateStr + '</div>' +
        '<div class="macro-event-days" style="color:' + e.color + '">' + e.days + '</div>' +
      '</div>';
    }).join('');
  }

  // ── PUBLIC API ────────────────────────
  window.fetchFng       = fetchFng;
  window.fetchBtcDominance = fetchBtcDominance;
  window.renderHalvingCountdown = renderHalvingCountdown;
  window.renderMacroCalendar    = renderMacroCalendar;
  window.FEAR_GREED_VALUE = 50; // default until loaded

  document.addEventListener('DOMContentLoaded', function () {
    // Fetch market data
    setTimeout(fetchFng, 2000);
    setTimeout(fetchBtcDominance, 3000);
    renderHalvingCountdown();
    renderMacroCalendar();

    // Update halving countdown every minute
    setInterval(renderHalvingCountdown, 60000);

    // Refresh F&G every hour
    setInterval(function() { fetchFng(); fetchBtcDominance(); }, 3600000);
  });

})();

/* ══════════════════════════════════════
   CHARTS.JS — Canvas charts
   ══════════════════════════════════════ */

(function () {

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* ── DONUT ────────────────────────────── */
  function drawDonut(canvasId, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var size = canvas.clientWidth || 180;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    var cx = size / 2, cy = size / 2;
    var r  = size / 2 - 14;
    var inner = r * 0.62;
    var total = data.reduce(function (a, b) { return a + (b.value || 0); }, 0);
    if (total <= 0) {
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = cssVar('--border');
      ctx.lineWidth = r - inner;
      ctx.stroke();
      return;
    }
    var angle = -Math.PI / 2;
    var gap = 0.03;
    data.forEach(function (seg) {
      if (!seg.value) return;
      var sweep = (seg.value / total) * Math.PI * 2 - gap;
      ctx.beginPath();
      ctx.arc(cx, cy, (r + inner) / 2, angle + gap / 2, angle + gap / 2 + sweep);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = r - inner;
      ctx.lineCap = 'round';
      ctx.stroke();
      angle += sweep + gap;
    });
  }

  /* ── PROJECTION ──────────────────────── */
  function drawProjection(canvasId, currentTotal) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 400;
    var h = canvas.clientHeight || 180;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    var years = 20;
    var rates = [0.07, 0.12];
    var colors = [cssVar('--accent'), cssVar('--purple')];
    var pad = { t: 16, r: 16, b: 32, l: 16 };
    var chartW = w - pad.l - pad.r;
    var chartH = h - pad.t - pad.b;

    // Compute all points
    var allSeries = rates.map(function (rate) {
      var pts = [];
      for (var i = 0; i <= years; i++) {
        pts.push((currentTotal || 0) * Math.pow(1 + rate, i));
      }
      return pts;
    });

    var maxVal = Math.max.apply(null, allSeries[1]);
    if (maxVal <= 0) maxVal = 100000;

    function px(i) { return pad.l + (i / years) * chartW; }
    function py(v) { return pad.t + chartH - (v / maxVal) * chartH; }

    // Grid lines
    ctx.strokeStyle = cssVar('--border');
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var y = pad.t + chartH * (1 - f);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + chartW, y);
      ctx.stroke();
    });

    // Draw curves
    allSeries.forEach(function (pts, idx) {
      ctx.beginPath();
      pts.forEach(function (v, i) {
        if (i === 0) ctx.moveTo(px(i), py(v));
        else ctx.lineTo(px(i), py(v));
      });
      ctx.strokeStyle = colors[idx];
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Fill area
      ctx.lineTo(px(pts.length - 1), pad.t + chartH);
      ctx.lineTo(px(0), pad.t + chartH);
      ctx.closePath();
      var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + chartH);
      grad.addColorStop(0, colors[idx] + '30');
      grad.addColorStop(1, colors[idx] + '05');
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // X labels
    ctx.fillStyle = cssVar('--text-tertiary');
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    [0, 5, 10, 15, 20].forEach(function (i) {
      ctx.fillText(i + 'a', px(i), h - 6);
    });
  }

  /* ── SIMULATOR ────────────────────────── */
  function drawSimulator(canvasId, dca, rate, months, initial) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 400;
    var h = canvas.clientHeight || 200;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    var pad = { t: 16, r: 16, b: 32, l: 16 };
    var chartW = w - pad.l - pad.r;
    var chartH = h - pad.t - pad.b;

    var mr = rate / 12;
    var totalPts = [], investPts = [];
    for (var i = 0; i <= months; i++) {
      var fv = (initial || 0) * Math.pow(1 + mr, i);
      if (mr > 0) fv += dca * (Math.pow(1 + mr, i) - 1) / mr;
      else fv += dca * i;
      totalPts.push(fv);
      investPts.push((initial || 0) + dca * i);
    }

    var maxVal = Math.max.apply(null, totalPts);
    if (maxVal <= 0) maxVal = 1;

    function px(i) { return pad.l + (i / months) * chartW; }
    function py(v) { return pad.t + chartH - (v / maxVal) * chartH; }

    // Grid
    ctx.strokeStyle = cssVar('--border');
    ctx.lineWidth = 1;
    [0.5, 1].forEach(function (f) {
      var y = pad.t + chartH * (1 - f);
      ctx.beginPath();
      ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + chartW, y);
      ctx.stroke();
    });

    // Invested line (dashed)
    ctx.beginPath();
    investPts.forEach(function (v, i) {
      if (i === 0) ctx.moveTo(px(i), py(v));
      else ctx.lineTo(px(i), py(v));
    });
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = cssVar('--text-tertiary');
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Total curve (solid)
    ctx.beginPath();
    totalPts.forEach(function (v, i) {
      if (i === 0) ctx.moveTo(px(i), py(v));
      else ctx.lineTo(px(i), py(v));
    });
    ctx.strokeStyle = cssVar('--accent');
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Fill
    ctx.lineTo(px(months), pad.t + chartH);
    ctx.lineTo(px(0), pad.t + chartH);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + chartH);
    grad.addColorStop(0, cssVar('--accent') + '25');
    grad.addColorStop(1, cssVar('--accent') + '02');
    ctx.fillStyle = grad;
    ctx.fill();

    // X labels
    ctx.fillStyle = cssVar('--text-tertiary');
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    var years = months / 12;
    var step = years <= 10 ? 1 : years <= 20 ? 5 : 10;
    for (var y = 0; y <= years; y += step) {
      ctx.fillText(y + 'a', px(y * 12), h - 6);
    }
  }

  window.drawDonut = drawDonut;
  window.drawProjection = drawProjection;
  window.drawSimulator = drawSimulator;

  // Redraw on resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (typeof renderDashboard === 'function')   renderDashboard();
      if (typeof updateSimulator === 'function')   updateSimulator();
    }, 150);
  });
})();

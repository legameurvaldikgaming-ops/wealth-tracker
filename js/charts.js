/* ══════════════════════════════════════
   CHARTS.JS — Canvas charts (donut, projection, simulator)
   ══════════════════════════════════════ */

(function () {

  function getThemeColors() {
    var cs = getComputedStyle(document.body);
    return {
      bg2: cs.getPropertyValue('--bg2').trim() || '#ffffff',
      text: cs.getPropertyValue('--text').trim() || '#1d1d1f',
      text2: cs.getPropertyValue('--text2').trim() || '#6e6e73',
      text3: cs.getPropertyValue('--text3').trim() || '#aeaeb2',
      bg3: cs.getPropertyValue('--bg3').trim() || '#e8e8ed'
    };
  }

  /* ── DONUT ─────────────────────────── */
  function drawDonut(canvasId, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var size = Math.min(canvas.width, canvas.height);
    var cx = canvas.width / 2, cy = canvas.height / 2;
    var outerR = size / 2 - 4;
    var innerR = outerR * 0.6;
    var colors = getThemeColors();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var total = 0;
    for (var i = 0; i < data.length; i++) total += data[i].value;

    if (!total || data.length === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = colors.bg3;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fillStyle = colors.bg2;
      ctx.fill();
      ctx.fillStyle = colors.text3;
      ctx.font = '13px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Aucune donnée', cx, cy);
      return;
    }

    var start = -Math.PI / 2;
    for (var j = 0; j < data.length; j++) {
      var slice = (data[j].value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = data[j].color;
      ctx.fill();
      start += slice;
    }

    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = colors.bg2;
    ctx.fill();

    // Center text
    ctx.fillStyle = colors.text;
    ctx.font = '500 13px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fmt(total), cx, cy - 6);
    ctx.fillStyle = colors.text2;
    ctx.font = '400 10px DM Sans, sans-serif';
    ctx.fillText('total', cx, cy + 10);
  }

  /* ── PROJECTION 10 ANS ────────────── */
  function drawProjection(canvasId, currentTotal) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.offsetWidth || 500;
    var h = canvas.height || 160;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    var years = 11;
    var vals = [];
    for (var i = 0; i < years; i++) {
      vals.push(currentTotal * Math.pow(1.07, i));
    }
    var maxV = vals[vals.length - 1] || 1;
    var pad = { t: 10, r: 20, b: 30, l: 60 };
    var iw = w - pad.l - pad.r;
    var ih = h - pad.t - pad.b;
    var colors = getThemeColors();
    var accent = '#0071e3';

    // Curve
    ctx.beginPath();
    for (var j = 0; j < vals.length; j++) {
      var x = pad.l + (j / (years - 1)) * iw;
      var y = pad.t + ih - (vals[j] / maxV) * ih;
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area
    ctx.lineTo(pad.l + iw, pad.t + ih);
    ctx.lineTo(pad.l, pad.t + ih);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,113,227,0.08)';
    ctx.fill();

    // X axis labels
    ctx.fillStyle = colors.text2;
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    var thisYear = new Date().getFullYear();
    var labelYears = [0, 2, 4, 6, 8, 10];
    for (var k = 0; k < labelYears.length; k++) {
      var lx = pad.l + (labelYears[k] / (years - 1)) * iw;
      ctx.fillText(thisYear + labelYears[k], lx, h - 8);
    }

    // Y axis labels
    ctx.textAlign = 'right';
    var fracs = [0, 0.5, 1];
    for (var f = 0; f < fracs.length; f++) {
      var yy = pad.t + ih - fracs[f] * ih;
      var val = maxV * fracs[f];
      ctx.fillText(Math.round(val / 1000) + 'k', pad.l - 6, yy + 4);
    }
  }

  /* ── SIMULATOR CHART ───────────────── */
  function drawSimulator(canvasId, dca, rate, years, initial) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.offsetWidth || 500;
    var h = 180;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    var pts = years * 12 + 1;
    var investedArr = [];
    var totalArr = [];
    var mr = rate / 12;

    for (var i = 0; i < pts; i++) {
      investedArr.push(dca * i + initial);
      if (mr > 0) {
        totalArr.push(initial * Math.pow(1 + mr, i) + dca * ((Math.pow(1 + mr, i) - 1) / mr));
      } else {
        totalArr.push(dca * i + initial);
      }
    }

    var maxV = totalArr[totalArr.length - 1] || 1;
    var pad = { t: 10, r: 20, b: 30, l: 60 };
    var iw = w - pad.l - pad.r;
    var ih = h - pad.t - pad.b;
    var colors = getThemeColors();

    // Draw invested line
    var datasets = [
      { data: investedArr, color: 'rgba(174,174,178,0.5)', width: 1.5 },
      { data: totalArr, color: '#0071e3', width: 2 }
    ];

    // Fill area between
    ctx.beginPath();
    for (var a = 0; a < pts; a++) {
      var xa = pad.l + (a / (pts - 1)) * iw;
      var ya = pad.t + ih - (totalArr[a] / maxV) * ih;
      if (a === 0) ctx.moveTo(xa, ya); else ctx.lineTo(xa, ya);
    }
    for (var b = pts - 1; b >= 0; b--) {
      var xb = pad.l + (b / (pts - 1)) * iw;
      var yb = pad.t + ih - (investedArr[b] / maxV) * ih;
      ctx.lineTo(xb, yb);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,113,227,0.06)';
    ctx.fill();

    // Draw lines
    for (var d = 0; d < datasets.length; d++) {
      ctx.beginPath();
      for (var p = 0; p < pts; p++) {
        var xp = pad.l + (p / (pts - 1)) * iw;
        var yp = pad.t + ih - (datasets[d].data[p] / maxV) * ih;
        if (p === 0) ctx.moveTo(xp, yp); else ctx.lineTo(xp, yp);
      }
      ctx.strokeStyle = datasets[d].color;
      ctx.lineWidth = datasets[d].width;
      ctx.stroke();
    }

    // X axis
    ctx.fillStyle = colors.text2;
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    var thisYear = new Date().getFullYear();
    var step = Math.ceil(years / 5);
    for (var yr = 0; yr <= years; yr += step) {
      var xx = pad.l + (yr / years) * iw;
      ctx.fillText(thisYear + yr, xx, h - 8);
    }

    // Y axis
    ctx.textAlign = 'right';
    var yFracs = [0, 0.5, 1];
    for (var yf = 0; yf < yFracs.length; yf++) {
      var yyy = pad.t + ih - yFracs[yf] * ih;
      var vv = maxV * yFracs[yf];
      ctx.fillText(Math.round(vv / 1000) + 'k', pad.l - 6, yyy + 4);
    }
  }

  // ResizeObserver for auto-redraw
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof updateSimulator === 'function') updateSimulator();
    }, 200);
  });

  // Expose globally
  window.drawDonut = drawDonut;
  window.drawProjection = drawProjection;
  window.drawSimulator = drawSimulator;
})();

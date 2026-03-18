/* ══════════════════════════════════════
   ANIMATIONS.JS — Counter, Tilt, Sparkline, Reveal
   ══════════════════════════════════════ */
(function () {

  /* ── ANIMATED COUNTER ─────────────────────────── */
  function animateCounter(element, from, to, duration, formatFn) {
    var start = null;
    var range = to - from;
    formatFn = formatFn || window.fmt;
    function step(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;
      var progress = Math.min(elapsed / (duration || 800), 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = from + range * eased;
      element.textContent = typeof formatFn === 'function' ? formatFn(current) : Math.round(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── 3D CARD TILT ──────────────────────────────── */
  function initTilt(selector) {
    var cards = document.querySelectorAll(selector || '.metric-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        var rotX = -dy * 6;
        var rotY = dx * 6;
        card.style.transform = 'perspective(800px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-4px) scale(1.01)';
        card.style.transition = 'transform 0.05s ease';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
        card.style.transform = '';
      });
    });
  }

  /* ── SPARKLINE (mini canvas chart) ────────────── */
  function drawSparkline(canvas, data, color) {
    if (!canvas || !data || data.length < 2) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = max - min || 1;
    var pad = 2;

    function px(i) { return pad + (i / (data.length - 1)) * (w - pad * 2); }
    function py(v) { return h - pad - ((v - min) / range) * (h - pad * 2); }

    color = color || '#3b82f6';

    ctx.beginPath();
    data.forEach(function (v, i) {
      if (i === 0) ctx.moveTo(px(i), py(v));
      else ctx.lineTo(px(i), py(v));
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Fill area
    ctx.lineTo(px(data.length - 1), h);
    ctx.lineTo(px(0), h);
    ctx.closePath();
    var r, g, b;
    var m = color.match(/^#([0-9a-f]{6})$/i);
    if (m) {
      r = parseInt(m[1].slice(0, 2), 16);
      g = parseInt(m[1].slice(2, 4), 16);
      b = parseInt(m[1].slice(4, 6), 16);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.10)';
    } else {
      ctx.fillStyle = 'rgba(59,130,246,0.10)';
    }
    ctx.fill();
  }

  /* ── STAGGER REVEAL ────────────────────────────── */
  function staggerReveal(items, baseDelay) {
    var els = typeof items === 'string' ? document.querySelectorAll(items) : items;
    baseDelay = baseDelay || 80;
    var arr = Array.prototype.slice.call(els);
    arr.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      setTimeout(function () {
        el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, baseDelay * i);
    });
  }

  /* ── TYPEWRITER ────────────────────────────────── */
  function typewriter(element, text, speed, onDone) {
    element.textContent = '';
    var i = 0;
    speed = speed || 28;
    function type() {
      if (i <= text.length) {
        element.textContent = text.slice(0, i);
        i++;
        setTimeout(type, speed);
      } else if (typeof onDone === 'function') {
        onDone();
      }
    }
    type();
  }

  /* ── INTERSECTION OBSERVER REVEAL ─────────────── */
  function initScrollReveal() {
    if (!window.IntersectionObserver) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── SIMULATE SPARKLINE DATA ───────────────────── */
  function generateSparkData(base, points, volatility) {
    points = points || 7;
    volatility = volatility || 0.04;
    var data = [];
    var v = base;
    for (var i = 0; i < points; i++) {
      v = v * (1 + (Math.random() - 0.48) * volatility);
      data.push(Math.max(base * 0.7, v));
    }
    return data;
  }

  /* ── NUMBER PULSE (flash on update) ───────────── */
  function pulseElement(el) {
    if (!el) return;
    el.classList.remove('value-pulse');
    el.offsetHeight; // reflow
    el.classList.add('value-pulse');
  }

  /* ── WORD-BY-WORD QUOTE REVEAL ─────────────────── */
  function revealWords(element, onDone) {
    var text = element.textContent;
    var words = text.split(' ');
    element.innerHTML = words.map(function (w) {
      return '<span class="word-reveal" style="display:inline-block;opacity:0;transform:translateY(8px)">' + w + ' </span>';
    }).join('');
    var spans = element.querySelectorAll('.word-reveal');
    spans.forEach(function (span, i) {
      setTimeout(function () {
        span.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
        if (i === spans.length - 1 && typeof onDone === 'function') setTimeout(onDone, 400);
      }, i * 60);
    });
  }

  window.animateCounter = animateCounter;
  window.initTilt = initTilt;
  window.drawSparkline = drawSparkline;
  window.staggerReveal = staggerReveal;
  window.typewriter = typewriter;
  window.initScrollReveal = initScrollReveal;
  window.generateSparkData = generateSparkData;
  window.pulseElement = pulseElement;
  window.revealWords = revealWords;
})();

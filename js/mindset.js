/* ══════════════════════════════════════
   MINDSET.JS — Quotes + principles + reading list
   ══════════════════════════════════════ */

(function () {
  var currentIdx = 0;
  var particlesCtx = null;
  var particles = [];

  /* ── DAILY QUOTE INDEX ───────────────── */
  function getDailyIdx() {
    var QUOTES = window.QUOTES || [];
    return Math.floor(Date.now() / 86400000) % (QUOTES.length || 1);
  }

  /* ── PARTICLES ───────────────────────── */
  function initParticles() {
    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    particlesCtx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    particles = [];
    for (var i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.4 + 0.1
      });
    }
    animParticles(canvas);
  }

  function animParticles(canvas) {
    if (!particlesCtx) return;
    particlesCtx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) {
      p.x = (p.x + p.dx + canvas.width)  % canvas.width;
      p.y = (p.y + p.dy + canvas.height) % canvas.height;
      particlesCtx.beginPath();
      particlesCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      particlesCtx.fillStyle = 'rgba(59,130,246,' + p.a + ')';
      particlesCtx.fill();
    });
    requestAnimationFrame(function () { animParticles(canvas); });
  }

  /* ── SHOW QUOTE ──────────────────────── */
  window.showQuote = function (idx) {
    var QUOTES = window.QUOTES || [];
    if (!QUOTES.length) return;
    currentIdx = ((idx % QUOTES.length) + QUOTES.length) % QUOTES.length;
    var q = QUOTES[currentIdx];

    var textEl   = document.getElementById('quote-text');
    var authorEl = document.getElementById('quote-author');
    var roleEl   = document.getElementById('quote-role');
    var dots     = document.querySelectorAll('.quote-dot');

    function fade(el, fn) {
      if (!el) return fn && fn();
      el.style.opacity = '0';
      setTimeout(function () {
        fn();
        el.style.opacity = '1';
      }, 250);
    }

    fade(textEl, function () {
      if (textEl) {
        textEl.textContent = q.text;
        if (typeof revealWords === 'function') revealWords(textEl);
      }
    });
    if (authorEl) authorEl.textContent = '— ' + q.author;
    if (roleEl)   roleEl.textContent   = q.role;
    dots.forEach(function (d, i) { d.classList.toggle('active', i === currentIdx); });
  };

  /* ── RENDER MINDSET ──────────────────── */
  window.renderMindset = function () {
    // Date
    var dateEl = document.getElementById('quote-date');
    if (dateEl) {
      var now = new Date();
      dateEl.textContent = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Quote
    var QUOTES = window.QUOTES || [];
    currentIdx = getDailyIdx();
    showQuote(currentIdx);

    // Dots
    var dotsEl = document.getElementById('quote-dots');
    if (dotsEl) {
      dotsEl.innerHTML = QUOTES.map(function (_, i) {
        return '<div class="quote-dot' + (i === currentIdx ? ' active' : '') + '" onclick="showQuote(' + i + ')"></div>';
      }).join('');
    }

    // Principles
    var PRINCIPLES = window.PRINCIPLES || [];
    var grid = document.getElementById('principles-grid');
    if (grid) {
      grid.innerHTML = PRINCIPLES.map(function (p) {
        return '<div class="principle-card reveal">' +
          '<div class="principle-num">' + p.num + '</div>' +
          '<div class="principle-title">' + p.title + '</div>' +
          '<div class="principle-text">'  + p.text  + '</div>' +
        '</div>';
      }).join('');
    }

    // Reading list
    var READING_LIST = window.READING_LIST || [];
    var listEl = document.getElementById('reading-list');
    if (listEl) {
      listEl.innerHTML = READING_LIST.map(function (book) {
        return '<div class="reading-item">' +
          '<div class="reading-cover">' + book.emoji + '</div>' +
          '<div class="reading-info">' +
            '<div class="reading-title">' + book.title + '</div>' +
            '<div class="reading-author">' + book.author + '</div>' +
            '<div class="reading-desc">' + book.desc + '</div>' +
          '</div>' +
          '<div class="reading-badge"><span class="badge badge-pea" style="background:rgba(168,85,247,0.12);color:var(--purple);border-color:rgba(168,85,247,0.2)">' + book.badge + '</span></div>' +
        '</div>';
      }).join('');
    }

    // Init particles
    setTimeout(initParticles, 100);

    // Scroll reveal
    if (typeof initScrollReveal === 'function') {
      setTimeout(initScrollReveal, 50);
    }
  };

  /* ── KEYBOARD + TOUCH ────────────────── */
  var touchStartX = 0;
  document.addEventListener('keydown', function (e) {
    var page = document.getElementById('page-mindset');
    if (!page || !page.classList.contains('active')) return;
    if (e.target.closest('input,textarea,select')) return;
    if (e.key === 'ArrowLeft')  showQuote(currentIdx - 1);
    if (e.key === 'ArrowRight') showQuote(currentIdx + 1);
  });
  document.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var page = document.getElementById('page-mindset');
    if (!page || !page.classList.contains('active')) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) showQuote(currentIdx + 1);
      else         showQuote(currentIdx - 1);
    }
  });
})();

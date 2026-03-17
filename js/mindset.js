/* ══════════════════════════════════════
   MINDSET.JS — Quotes + principes
   ══════════════════════════════════════ */

(function () {

  var currentQuoteIndex = Math.floor(Date.now() / 86400000) % QUOTES.length;
  var touchStartX = 0;

  function renderMindset() {
    var d = new Date();
    var dateEl = document.getElementById('q-date');
    if (dateEl) {
      dateEl.textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    currentQuoteIndex = Math.floor(Date.now() / 86400000) % QUOTES.length;
    showQuote(currentQuoteIndex);

    // Build dots
    var dots = document.getElementById('q-dots');
    if (dots) {
      var html = '';
      for (var i = 0; i < QUOTES.length; i++) {
        html += '<div class="quote-dot' + (i === currentQuoteIndex ? ' active' : '') + '" data-quote-idx="' + i + '"></div>';
      }
      dots.innerHTML = html;
    }

    // Build principles
    var grid = document.getElementById('principles-grid');
    if (grid) {
      var pHtml = '';
      for (var j = 0; j < PRINCIPLES.length; j++) {
        var p = PRINCIPLES[j];
        pHtml += '<div class="principle">' +
          '<div class="principle-num">' + p.num + '</div>' +
          '<div class="principle-title">' + p.title + '</div>' +
          '<div class="principle-text">' + p.text + '</div>' +
          '</div>';
      }
      grid.innerHTML = pHtml;
    }
  }

  function showQuote(index) {
    if (index < 0) index = QUOTES.length - 1;
    if (index >= QUOTES.length) index = 0;
    currentQuoteIndex = index;

    var textEl = document.getElementById('q-text');
    var authorEl = document.getElementById('q-author');
    var roleEl = document.getElementById('q-role');
    if (!textEl) return;

    // Fade out
    textEl.style.opacity = '0';
    authorEl.style.opacity = '0';
    roleEl.style.opacity = '0';

    setTimeout(function () {
      var q = QUOTES[currentQuoteIndex];
      textEl.textContent = q.text;
      authorEl.textContent = q.author;
      roleEl.textContent = q.role;

      textEl.style.opacity = '1';
      authorEl.style.opacity = '1';
      roleEl.style.opacity = '1';
    }, 200);

    // Update dots
    var dots = document.querySelectorAll('.quote-dot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === currentQuoteIndex);
    }
  }

  // Dot click delegation
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('quote-dot') && e.target.dataset.quoteIdx !== undefined) {
      showQuote(parseInt(e.target.dataset.quoteIdx));
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    var mindsetPage = document.getElementById('page-mindset');
    if (!mindsetPage || !mindsetPage.classList.contains('active')) return;
    if (e.key === 'ArrowRight') showQuote(currentQuoteIndex + 1);
    if (e.key === 'ArrowLeft') showQuote(currentQuoteIndex - 1);
  });

  // Touch swipe
  document.addEventListener('touchstart', function (e) {
    var mindsetPage = document.getElementById('page-mindset');
    if (!mindsetPage || !mindsetPage.classList.contains('active')) return;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    var mindsetPage = document.getElementById('page-mindset');
    if (!mindsetPage || !mindsetPage.classList.contains('active')) return;
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) showQuote(currentQuoteIndex + 1);
      else showQuote(currentQuoteIndex - 1);
    }
  }, { passive: true });

  // Expose globally
  window.renderMindset = renderMindset;
  window.showQuote = showQuote;
})();

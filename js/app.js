/* ══════════════════════════════════════
   APP.JS — SPA navigation + global init
   ══════════════════════════════════════ */

(function () {

  /* ── PAGE NAVIGATION ─────────────────── */
  window.showPage = function (name) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + name);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(function (l) {
      l.classList.toggle('active', l.dataset.page === name);
    });
    document.querySelectorAll('.drawer-link').forEach(function (l) {
      l.classList.toggle('active', l.dataset.page === name);
    });
    updateNavPill();

    // Render page
    if (name === 'dashboard'  && typeof renderDashboard       === 'function') renderDashboard();
    if (name === 'portfolio')  renderAllPortfolioTabsIfExists();
    if (name === 'simulator'  && typeof updateSimulator        === 'function') setTimeout(updateSimulator, 50);
    if (name === 'catalog'    && typeof filterAndRender        === 'function') filterAndRender();
    if (name === 'mindset'    && typeof renderMindset          === 'function') renderMindset();
    if (name === 'roadmap'    && typeof renderRoadmap          === 'function') renderRoadmap();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeDrawer();
  };

  function renderAllPortfolioTabsIfExists() {
    if (typeof renderAllPortfolioTabs === 'function') renderAllPortfolioTabs();
  }

  /* ── NAV PILL ────────────────────────── */
  function updateNavPill() {
    var pill = document.getElementById('nav-pill');
    if (!pill) return;
    var active = document.querySelector('.nav-link.active');
    if (!active) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.left  = active.offsetLeft + 'px';
    pill.style.width = active.offsetWidth + 'px';
  }

  /* ── INNER TAB SWITCHING ─────────────── */
  window.showInner = function (name, el) {
    document.querySelectorAll('.inner-pane').forEach(function (p) { p.classList.remove('active'); });
    var target = document.getElementById('pane-' + name);
    if (target) target.classList.add('active');

    document.querySelectorAll('.inner-tab').forEach(function (t) { t.classList.remove('active'); });
    if (el) el.classList.add('active');
    else {
      var t = document.querySelector('.inner-tab[data-tab="' + name + '"]');
      if (t) t.classList.add('active');
    }
  };

  /* ── CLOCK ───────────────────────────── */
  function updateClock() {
    var el = document.getElementById('nav-clock');
    if (!el) return;
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    el.textContent = hh + ':' + mm + ':' + ss;
  }
  setInterval(updateClock, 1000);
  updateClock();

  /* ── TOAST ───────────────────────────── */
  window.showToast = function (message, type) {
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(function () { toast.remove(); }, 350);
    }, 3200);
  };

  /* ── EXPORT / IMPORT ─────────────────── */
  window.exportData = function () {
    var data = JSON.stringify(window.STATE, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    var date = new Date().toISOString().slice(0, 10);
    a.href = url; a.download = 'wealth_backup_' + date + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export réussi !', 'success');
  };

  window.importData = function (input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.pea && !data.crypto && !data.immo) throw new Error('Format invalide');
        window.STATE = {
          pea:    data.pea    || [],
          cto:    data.cto    || [],
          crypto: data.crypto || [],
          immo:   data.immo   || [],
          dca:    data.dca    || []
        };
        if (typeof saveState === 'function') saveState();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderAllPortfolioTabs === 'function') renderAllPortfolioTabs();
        showToast('Import réussi !', 'success');
      } catch (err) {
        showToast('Erreur : fichier invalide', 'error');
      }
    };
    reader.readAsText(file);
    input.value = '';
  };

  /* ── SCROLL HANDLER ──────────────────── */
  window.addEventListener('scroll', function () {
    var nav = document.getElementById('main-nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
    var btn = document.getElementById('scroll-top');
    if (btn) btn.classList.toggle('visible', window.scrollY > 300);
  });

  /* ── MOBILE DRAWER ───────────────────── */
  function openDrawer() {
    var drawer  = document.getElementById('nav-drawer');
    var overlay = document.getElementById('nav-overlay');
    if (drawer)  drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }
  function closeDrawer() {
    var drawer  = document.getElementById('nav-drawer');
    var overlay = document.getElementById('nav-overlay');
    if (drawer)  drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }
  window.closeDrawer = closeDrawer;

  document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.getElementById('hamburger');
    if (hamburger) hamburger.addEventListener('click', openDrawer);
    var navOverlay = document.getElementById('nav-overlay');
    if (navOverlay) navOverlay.addEventListener('click', closeDrawer);

    // Scroll to top
    var scrollBtn = document.getElementById('scroll-top');
    if (scrollBtn) scrollBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    // Init tilt
    if (typeof initTilt === 'function') initTilt('.metric-card');

    // Service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    }

    // Boot page
    showPage('dashboard');

    // Onboarding
    if (typeof startOnboarding === 'function') {
      setTimeout(startOnboarding, 600);
    }
  });

  /* ── THEME PANEL ─────────────────────── */
  window.toggleThemePanel = function () {
    var panel = document.getElementById('theme-panel');
    if (!panel) return;
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && typeof renderThemePanel === 'function') renderThemePanel();
  };

})();

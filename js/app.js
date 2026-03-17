/* ══════════════════════════════════════
   APP.JS — Navigation SPA + initialisation globale
   ══════════════════════════════════════ */

(function () {

  /* ── NAVIGATION ────────────────── */
  function showPage(name) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');

    var links = document.querySelectorAll('.nav-link');
    for (var j = 0; j < links.length; j++) links[j].classList.remove('active');

    var target = document.getElementById('page-' + name);
    if (target) {
      target.classList.add('active');
      // Re-trigger animation
      target.style.animation = 'none';
      target.offsetHeight; // force reflow
      target.style.animation = '';
    }

    // Activate matching nav link
    for (var k = 0; k < links.length; k++) {
      if (links[k].dataset.page === name) {
        links[k].classList.add('active');
        break;
      }
    }

    // Render page content
    switch (name) {
      case 'dashboard': renderDashboard(); break;
      case 'portfolio': renderAllPortfolioTabs(); break;
      case 'catalog': filterAndRender(); break;
      case 'simulator': setTimeout(function () { updateSimulator(); }, 50); break;
      case 'roadmap': renderRoadmap(); updateFI(); break;
      case 'mindset': renderMindset(); break;
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Close mobile menu if open
    var navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('mobile-open');
  }

  /* ── CLOCK ─────────────────────── */
  function updateClock() {
    var el = document.getElementById('live-time');
    if (el) {
      var now = new Date();
      el.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }

  /* ── THEME ─────────────────────── */
  function toggleTheme() {
    var isDark = document.body.dataset.theme === 'dark';
    document.body.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem('wealth_theme', document.body.dataset.theme);

    var btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = isDark ? '\uD83C\uDF19' : '\u2600\uFE0F';

    // Redraw charts with new theme colors
    if (typeof renderDashboard === 'function') renderDashboard();
    if (document.getElementById('page-simulator') && document.getElementById('page-simulator').classList.contains('active')) {
      if (typeof updateSimulator === 'function') updateSimulator();
    }
  }

  function loadTheme() {
    var saved = localStorage.getItem('wealth_theme');
    if (saved) {
      document.body.dataset.theme = saved;
    }
    var btn = document.getElementById('theme-btn');
    if (btn) {
      btn.textContent = document.body.dataset.theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    }
  }

  /* ── EXPORT / IMPORT ───────────── */
  function exportData() {
    var date = new Date().toISOString().slice(0, 10);
    var blob = new Blob([JSON.stringify(STATE, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wealth_backup_' + date + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Backup exporté', 'success');
  }

  function importData(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        // Validate structure
        var keys = ['pea', 'cto', 'crypto', 'immo', 'dca'];
        for (var i = 0; i < keys.length; i++) {
          if (data[keys[i]] && Array.isArray(data[keys[i]])) {
            STATE[keys[i]] = data[keys[i]];
          }
        }
        saveState();
        renderDashboard();
        renderAllPortfolioTabs();
        showToast('Données importées avec succès', 'success');
      } catch (err) {
        showToast('Fichier invalide', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-imported
    input.value = '';
  }

  /* ── TOAST NOTIFICATIONS ───────── */
  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);

    // Trigger animation
    toast.offsetHeight;
    toast.classList.add('toast-visible');

    setTimeout(function () {
      toast.classList.remove('toast-visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  /* ── INNER TABS (Portfolio) ────── */
  function showInner(name, el) {
    var panels = ['pea', 'cto', 'crypto', 'immo', 'dca'];
    for (var i = 0; i < panels.length; i++) {
      var panel = document.getElementById('inner-' + panels[i]);
      if (panel) panel.style.display = 'none';
    }
    var tabs = document.querySelectorAll('.inner-tab');
    for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');

    var target = document.getElementById('inner-' + name);
    if (target) target.style.display = 'block';
    if (el) el.classList.add('active');
  }

  /* ── HAMBURGER MENU ────────────── */
  function toggleMobileMenu() {
    var navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.toggle('mobile-open');
  }

  /* ── INIT ──────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Load theme
    loadTheme();

    // 2. Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // 3. STATE already loaded by state.js

    // 4. Show dashboard
    showPage('dashboard');

    // 5. Nav links
    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', (function (link) {
        return function () {
          showPage(link.dataset.page);
        };
      })(navLinks[i]));
    }

    // 6. Portfolio form buttons
    var addPeaBtn = document.getElementById('btn-add-pea');
    if (addPeaBtn) addPeaBtn.addEventListener('click', function () { addPos('pea'); });
    var addCtoBtn = document.getElementById('btn-add-cto');
    if (addCtoBtn) addCtoBtn.addEventListener('click', function () { addPos('cto'); });
    var addCryptoBtn = document.getElementById('btn-add-crypto');
    if (addCryptoBtn) addCryptoBtn.addEventListener('click', function () { addPos('crypto'); });
    var addImmoBtn = document.getElementById('btn-add-immo');
    if (addImmoBtn) addImmoBtn.addEventListener('click', function () { addImmo(); });
    var addDcaBtn = document.getElementById('btn-add-dca');
    if (addDcaBtn) addDcaBtn.addEventListener('click', function () { addDCA(); });

    // Inner tabs
    var innerTabs = document.querySelectorAll('.inner-tab');
    for (var t = 0; t < innerTabs.length; t++) {
      innerTabs[t].addEventListener('click', (function (tab) {
        return function () { showInner(tab.dataset.tab, tab); };
      })(innerTabs[t]));
    }

    // 7. Catalog search + filters
    var catalogSearch = document.getElementById('catalog-search');
    if (catalogSearch) {
      catalogSearch.addEventListener('input', function () { filterCatalog(); });
    }
    var filterPills = document.querySelectorAll('#cat-filters .pill');
    for (var f = 0; f < filterPills.length; f++) {
      filterPills[f].addEventListener('click', (function (pill) {
        return function () { filterCat(pill.dataset.cat, pill); };
      })(filterPills[f]));
    }

    // 8. Simulator sliders
    var simInputs = ['sim-dca', 'sim-years', 'sim-rate', 'sim-initial'];
    for (var s = 0; s < simInputs.length; s++) {
      var el = document.getElementById(simInputs[s]);
      if (el) el.addEventListener('input', function () { updateSimulator(); });
    }

    // 9. Roadmap FI inputs
    var fiSpend = document.getElementById('fi-spend');
    var fiSpread = document.getElementById('fi-spread');
    if (fiSpend) fiSpend.addEventListener('input', debouncedUpdateFI);
    if (fiSpread) fiSpread.addEventListener('input', debouncedUpdateFI);

    // Export/Import
    var exportBtn = document.getElementById('btn-export');
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    var importFile = document.getElementById('import-file');
    if (importFile) importFile.addEventListener('change', function () { importData(this); });
    var importBtn = document.getElementById('btn-import');
    if (importBtn) importBtn.addEventListener('click', function () { document.getElementById('import-file').click(); });

    // Theme button
    var themeBtn = document.getElementById('theme-btn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Hamburger
    var hamburger = document.getElementById('hamburger-btn');
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);

    // Dashboard manage button
    var manageBtn = document.getElementById('btn-manage-portfolio');
    if (manageBtn) {
      manageBtn.addEventListener('click', function () { showPage('portfolio'); });
    }

    // Render all portfolio tabs on init
    renderAllPortfolioTabs();
  });

  // Expose globals
  window.showPage = showPage;
  window.toggleTheme = toggleTheme;
  window.showInner = showInner;
  window.exportData = exportData;
  window.importData = importData;
  window.showToast = showToast;
})();

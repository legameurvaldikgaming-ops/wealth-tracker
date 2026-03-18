/* ══════════════════════════════════════
   THEMES.JS — 4 thèmes premium
   ══════════════════════════════════════ */
(function () {

  var THEME_VARS = {
    dark: {
      '--bg-base': '#0a0a0a', '--bg-surface': '#111111',
      '--bg-elevated': '#1a1a1a', '--bg-overlay': '#222222',
      '--text-primary': '#fafafa', '--text-secondary': '#a1a1aa',
      '--text-tertiary': '#52525b', '--accent': '#3b82f6',
      '--accent-hover': '#2563eb', '--accent-glow': 'rgba(59,130,246,0.15)',
      '--green': '#22c55e', '--green-glow': 'rgba(34,197,94,0.15)',
      '--red': '#ef4444', '--amber': '#f59e0b', '--purple': '#a855f7',
      '--border': 'rgba(255,255,255,0.06)', '--border-hover': 'rgba(255,255,255,0.12)',
      '--shadow': '0 4px 30px rgba(0,0,0,0.5)', '--shadow-lg': '0 20px 80px rgba(0,0,0,0.7)'
    },
    light: {
      '--bg-base': '#fafaf9', '--bg-surface': '#ffffff',
      '--bg-elevated': '#f5f5f4', '--bg-overlay': '#e7e5e4',
      '--text-primary': '#1c1917', '--text-secondary': '#57534e',
      '--text-tertiary': '#a8a29e', '--accent': '#2563eb',
      '--accent-hover': '#1d4ed8', '--accent-glow': 'rgba(37,99,235,0.10)',
      '--green': '#16a34a', '--green-glow': 'rgba(22,163,74,0.10)',
      '--red': '#dc2626', '--amber': '#d97706', '--purple': '#9333ea',
      '--border': 'rgba(0,0,0,0.07)', '--border-hover': 'rgba(0,0,0,0.14)',
      '--shadow': '0 2px 16px rgba(0,0,0,0.07)', '--shadow-lg': '0 12px 40px rgba(0,0,0,0.12)'
    },
    midnight: {
      '--bg-base': '#050510', '--bg-surface': '#0a0a1e',
      '--bg-elevated': '#0f0f2a', '--bg-overlay': '#141434',
      '--text-primary': '#f0f0ff', '--text-secondary': '#9ca3dc',
      '--text-tertiary': '#4a4a6a', '--accent': '#818cf8',
      '--accent-hover': '#6366f1', '--accent-glow': 'rgba(129,140,248,0.20)',
      '--green': '#34d399', '--green-glow': 'rgba(52,211,153,0.15)',
      '--red': '#f87171', '--amber': '#fbbf24', '--purple': '#c084fc',
      '--border': 'rgba(129,140,248,0.08)', '--border-hover': 'rgba(129,140,248,0.15)',
      '--shadow': '0 4px 40px rgba(5,5,16,0.8)', '--shadow-lg': '0 20px 80px rgba(5,5,16,0.9)'
    },
    forest: {
      '--bg-base': '#050f07', '--bg-surface': '#0a1f0c',
      '--bg-elevated': '#0f2e12', '--bg-overlay': '#143d17',
      '--text-primary': '#f0fff4', '--text-secondary': '#86efac',
      '--text-tertiary': '#4ade80', '--accent': '#4ade80',
      '--accent-hover': '#22c55e', '--accent-glow': 'rgba(74,222,128,0.20)',
      '--green': '#86efac', '--green-glow': 'rgba(134,239,172,0.15)',
      '--red': '#fca5a5', '--amber': '#fde68a', '--purple': '#d8b4fe',
      '--border': 'rgba(74,222,128,0.08)', '--border-hover': 'rgba(74,222,128,0.15)',
      '--shadow': '0 4px 40px rgba(5,15,7,0.8)', '--shadow-lg': '0 20px 80px rgba(5,15,7,0.9)'
    }
  };

  var THEME_ICONS = { dark: '🌙', light: '☀️', midnight: '✦', forest: '🌿' };
  var THEME_LABELS = { dark: 'Dark', light: 'Light', midnight: 'Midnight', forest: 'Forest' };
  var THEME_SWATCHES = { dark: '#111111', light: '#ffffff', midnight: '#0a0a1e', forest: '#0a1f0c' };

  function applyTheme(name) {
    var vars = THEME_VARS[name] || THEME_VARS.dark;
    var root = document.documentElement;
    for (var prop in vars) {
      if (vars.hasOwnProperty(prop)) root.style.setProperty(prop, vars[prop]);
    }
    document.body.dataset.theme = name;
    localStorage.setItem('wealth_theme', name);

    var btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = THEME_ICONS[name] || '🌙';

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', vars['--bg-base'] || '#0a0a0a');

    // Update theme panel active state
    document.querySelectorAll('.theme-option').forEach(function(opt) {
      opt.classList.toggle('active', opt.dataset.theme === name);
    });

    // Redraw charts
    setTimeout(function () {
      var active = document.querySelector('.page.active');
      if (!active) return;
      var id = active.id.replace('page-', '');
      if (id === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
      if (id === 'simulator' && typeof updateSimulator === 'function') updateSimulator();
    }, 80);
  }

  function initTheme() {
    var saved = localStorage.getItem('wealth_theme') || 'dark';
    applyTheme(saved);
  }

  function cycleTheme() {
    var keys = Object.keys(THEME_VARS);
    var cur = document.body.dataset.theme || 'dark';
    var idx = keys.indexOf(cur);
    applyTheme(keys[(idx + 1) % keys.length]);
  }

  function renderThemePanel() {
    var panel = document.getElementById('theme-panel');
    if (!panel) return;
    var cur = document.body.dataset.theme || 'dark';
    var keys = Object.keys(THEME_VARS);
    panel.innerHTML = keys.map(function(k) {
      return '<button class="theme-option' + (k === cur ? ' active' : '') + '" data-theme="' + k + '">' +
        '<span class="theme-swatch" style="background:' + THEME_SWATCHES[k] + '"></span>' +
        '<span>' + THEME_ICONS[k] + ' ' + THEME_LABELS[k] + '</span>' +
        '</button>';
    }).join('');
    panel.querySelectorAll('.theme-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        applyTheme(this.dataset.theme);
        panel.classList.remove('open');
      });
    });
  }

  function toggleThemePanel() {
    var panel = document.getElementById('theme-panel');
    if (!panel) return;
    if (!panel.innerHTML) renderThemePanel();
    panel.classList.toggle('open');
  }

  // Compat alias
  window.toggleTheme = cycleTheme;

  window.THEME_VARS = THEME_VARS;
  window.applyTheme = applyTheme;
  window.initTheme = initTheme;
  window.cycleTheme = cycleTheme;
  window.toggleThemePanel = toggleThemePanel;
  window.renderThemePanel = renderThemePanel;
})();

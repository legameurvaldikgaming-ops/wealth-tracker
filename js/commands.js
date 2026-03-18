/* ══════════════════════════════════════
   COMMANDS.JS — Command Palette Cmd+K
   ══════════════════════════════════════ */
(function () {
  var isOpen = false;
  var selectedIdx = 0;
  var filteredCmds = [];

  var BASE_CMDS = [
    { type: 'nav', icon: '◎', label: 'Dashboard', shortcut: 'G D', page: 'dashboard' },
    { type: 'nav', icon: '◎', label: 'Portfolio', shortcut: 'G P', page: 'portfolio' },
    { type: 'nav', icon: '◎', label: 'Catalogue', shortcut: 'G C', page: 'catalog' },
    { type: 'nav', icon: '◎', label: 'Simulateur', shortcut: 'G S', page: 'simulator' },
    { type: 'nav', icon: '◎', label: 'Roadmap', shortcut: 'G R', page: 'roadmap' },
    { type: 'nav', icon: '◎', label: 'Mindset', shortcut: 'G M', page: 'mindset' },
    { type: 'action', icon: '⚡', label: 'Ajouter position PEA', shortcut: '',
      action: function () { showPage('portfolio'); setTimeout(function () { showInner('pea', null); document.getElementById('pea-n') && document.getElementById('pea-n').focus(); }, 350); } },
    { type: 'action', icon: '⚡', label: 'Ajouter position Crypto', shortcut: '',
      action: function () { showPage('portfolio'); setTimeout(function () { showInner('crypto', null); document.getElementById('crypto-n') && document.getElementById('crypto-n').focus(); }, 350); } },
    { type: 'action', icon: '⚡', label: 'Ajouter un DCA', shortcut: '',
      action: function () { showPage('portfolio'); setTimeout(function () { showInner('dca', null); }, 350); } },
    { type: 'action', icon: '📤', label: 'Exporter les données JSON', shortcut: '',
      action: function () { if (typeof exportData === 'function') exportData(); } },
    { type: 'action', icon: '🎨', label: 'Changer de thème', shortcut: '',
      action: function () { if (typeof cycleTheme === 'function') cycleTheme(); } }
  ];

  function getAllCmds() {
    var cmds = BASE_CMDS.slice();
    if (window.CATALOG_DATA) {
      CATALOG_DATA.forEach(function (item) {
        cmds.push({
          type: 'catalog', icon: '◈',
          label: item.ticker + ' — ' + item.name, desc: item.cat,
          action: function () {
            showPage('catalog');
            setTimeout(function () {
              var el = document.getElementById('catalog-search');
              if (el) { el.value = item.ticker; if (typeof filterCatalog === 'function') filterCatalog(); }
            }, 300);
          }
        });
      });
    }
    return cmds;
  }

  function createDOM() {
    var wrap = document.createElement('div');
    wrap.id = 'cmd-overlay';
    wrap.className = 'cmd-overlay';
    wrap.innerHTML =
      '<div class="cmd-modal">' +
        '<div class="cmd-search-wrap">' +
          '<svg class="cmd-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<input id="cmd-input" class="cmd-input" placeholder="Rechercher commande, actif..." autocomplete="off" spellcheck="false">' +
          '<kbd class="cmd-kbd">ESC</kbd>' +
        '</div>' +
        '<div class="cmd-results" id="cmd-results"></div>' +
        '<div class="cmd-footer">' +
          '<span><kbd>↑↓</kbd> naviguer</span><span><kbd>↵</kbd> sélectionner</span><span><kbd>ESC</kbd> fermer</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
    document.getElementById('cmd-input').addEventListener('input', function () {
      selectedIdx = 0;
      renderResults(this.value);
    });
    document.getElementById('cmd-input').addEventListener('keydown', function (e) {
      var items = document.querySelectorAll('.cmd-item');
      if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx + 1, items.length - 1); highlightSelected(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = Math.max(selectedIdx - 1, 0); highlightSelected(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (filteredCmds[selectedIdx]) { close(); setTimeout(function () { execute(filteredCmds[selectedIdx]); }, 100); } }
      else if (e.key === 'Escape') { close(); }
    });
  }

  function renderResults(query) {
    var all = getAllCmds();
    var q = (query || '').toLowerCase().trim();
    filteredCmds = q
      ? all.filter(function (c) { return (c.label + ' ' + (c.desc || '')).toLowerCase().indexOf(q) !== -1; }).slice(0, 8)
      : all.slice(0, 7);
    var container = document.getElementById('cmd-results');
    if (!container) return;
    if (!filteredCmds.length) {
      container.innerHTML = '<div class="cmd-empty">Aucun résultat pour "' + query + '"</div>';
      return;
    }
    container.innerHTML = filteredCmds.map(function (cmd, i) {
      return '<div class="cmd-item' + (i === selectedIdx ? ' selected' : '') + '" data-i="' + i + '">' +
        '<span class="cmd-item-icon">' + (cmd.icon || '·') + '</span>' +
        '<span class="cmd-item-label">' + cmd.label + '</span>' +
        (cmd.desc ? '<span class="cmd-item-desc">' + cmd.desc + '</span>' : '') +
        (cmd.shortcut ? '<kbd class="cmd-item-kbd">' + cmd.shortcut + '</kbd>' : '') +
        '</div>';
    }).join('');
    container.querySelectorAll('.cmd-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var i = parseInt(this.dataset.i);
        close();
        setTimeout(function () { execute(filteredCmds[i]); }, 100);
      });
    });
  }

  function highlightSelected() {
    document.querySelectorAll('.cmd-item').forEach(function (el, i) {
      el.classList.toggle('selected', i === selectedIdx);
    });
  }

  function execute(cmd) {
    if (cmd.page) showPage(cmd.page);
    else if (typeof cmd.action === 'function') cmd.action();
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    if (!document.getElementById('cmd-overlay')) createDOM();
    document.getElementById('cmd-overlay').classList.add('open');
    selectedIdx = 0;
    renderResults('');
    setTimeout(function () { document.getElementById('cmd-input').focus(); }, 30);
  }

  function close() {
    isOpen = false;
    var el = document.getElementById('cmd-overlay');
    if (el) el.classList.remove('open');
  }

  // G+letter sequential shortcut
  var gDown = false, gTimer = null;
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); isOpen ? close() : open(); return; }
    if (e.key === 'Escape' && isOpen) { close(); return; }
    if (e.key === '?' && !e.target.closest('input,textarea,select')) { open(); return; }
    if (e.target.closest('input,textarea,select')) return;
    if (e.key.toLowerCase() === 'g') {
      gDown = true;
      clearTimeout(gTimer);
      gTimer = setTimeout(function () { gDown = false; }, 900);
      return;
    }
    if (gDown) {
      gDown = false; clearTimeout(gTimer);
      var map = { d: 'dashboard', p: 'portfolio', c: 'catalog', s: 'simulator', r: 'roadmap', m: 'mindset' };
      var page = map[e.key.toLowerCase()];
      if (page && typeof showPage === 'function') showPage(page);
    }
  });

  window.openCommandPalette = open;
  window.closeCommandPalette = close;
})();

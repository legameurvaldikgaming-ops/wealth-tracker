/* ══════════════════════════════════════
   CATALOG.JS — Asset catalogue + filters
   ══════════════════════════════════════ */

(function () {
  var currentFilter = 'Tous';
  var searchQuery   = '';
  var watchlist     = JSON.parse(localStorage.getItem('wealth_watchlist') || '[]');

  function saveWatchlist() { localStorage.setItem('wealth_watchlist', JSON.stringify(watchlist)); }

  window.filterCat = function (cat, el) {
    currentFilter = cat;
    document.querySelectorAll('.pill-filter').forEach(function (p) { p.classList.remove('active'); });
    if (el) el.classList.add('active');
    filterAndRender();
  };

  window.filterCatalog = function () {
    var el = document.getElementById('catalog-search');
    searchQuery = el ? el.value.toLowerCase().trim() : '';
    filterAndRender();
  };

  window.filterAndRender = function () {
    var data = window.CATALOG_DATA || [];
    var filtered = data.filter(function (item) {
      var matchCat = currentFilter === 'Tous' || item.cat === currentFilter ||
                     (currentFilter === 'PEA' && item.pea) ||
                     (currentFilter === 'Favoris' && watchlist.indexOf(item.ticker) !== -1);
      var matchQ   = !searchQuery || (item.ticker + ' ' + item.name + ' ' + item.desc).toLowerCase().indexOf(searchQuery) !== -1;
      return matchCat && matchQ;
    });

    var grid = document.getElementById('catalog-grid');
    if (!grid) return;
    if (!filtered.length) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Aucun résultat.</div></div>';
      return;
    }

    grid.innerHTML = filtered.map(function (item) {
      var price = (window.LIVE_PRICES && window.LIVE_PRICES[item.ticker]) ? window.LIVE_PRICES[item.ticker] : item.price;
      var chg   = item.change;
      var chgClass = chg >= 0 ? 'price-up' : 'price-down';
      var chgSign  = chg >= 0 ? '+' : '';
      var priceStr = price >= 1000 ? Math.round(price).toLocaleString('fr-FR') : price.toFixed(2);
      var inWatch  = watchlist.indexOf(item.ticker) !== -1;
      return '<div class="catalog-item" data-ticker="' + item.ticker + '">' +
        '<div class="catalog-item-header">' +
          '<div>' +
            '<div class="catalog-ticker">' + item.ticker + '</div>' +
            '<div class="catalog-name">' + item.name + '</div>' +
          '</div>' +
          '<div class="catalog-price">' +
            '<div class="catalog-price-val">' + priceStr + (item.cat === 'Crypto' ? '$' : '€') + '</div>' +
            '<div class="catalog-chg ' + chgClass + '">' + chgSign + chg.toFixed(2) + '%</div>' +
          '</div>' +
        '</div>' +
        '<div class="catalog-desc">' + item.desc + '</div>' +
        '<div class="catalog-footer">' +
          '<div style="display:flex;gap:6px;align-items:center">' +
            '<span class="badge badge-' + item.cat.toLowerCase() + '">' + item.cat + '</span>' +
            (item.pea ? '<span class="badge badge-pea">PEA</span>' : '') +
          '</div>' +
          '<button class="watchlist-btn' + (inWatch ? ' active' : '') + '" data-ticker="' + item.ticker + '" onclick="toggleWatch(event,\'' + item.ticker + '\')">' +
            (inWatch ? '★ Watchlist' : '☆ Suivre') +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');

    // Click to open modal
    document.querySelectorAll('.catalog-item').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('.watchlist-btn')) return;
        var ticker = el.dataset.ticker;
        var item = (window.CATALOG_DATA || []).find(function (d) { return d.ticker === ticker; });
        if (item) openCatalogModal(item);
      });
    });
  };

  window.toggleWatch = function (e, ticker) {
    e.stopPropagation();
    var idx = watchlist.indexOf(ticker);
    if (idx === -1) watchlist.push(ticker);
    else watchlist.splice(idx, 1);
    saveWatchlist();
    filterAndRender();
    if (typeof showToast === 'function') {
      showToast(idx === -1 ? ticker + ' ajouté à la watchlist' : ticker + ' retiré de la watchlist', 'info');
    }
  };

  window.openCatalogModal = function (item) {
    var existing = document.getElementById('catalog-modal-overlay');
    if (existing) existing.remove();

    var price = (window.LIVE_PRICES && window.LIVE_PRICES[item.ticker]) ? window.LIVE_PRICES[item.ticker] : item.price;
    var priceStr = price >= 1000 ? Math.round(price).toLocaleString('fr-FR') : price.toFixed(2);
    var chgSign  = item.change >= 0 ? '+' : '';
    var chgClass = item.change >= 0 ? 'price-up' : 'price-down';
    var inWatch  = watchlist.indexOf(item.ticker) !== -1;

    var overlay = document.createElement('div');
    overlay.id = 'catalog-modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal">' +
        '<div class="modal-header">' +
          '<div class="modal-title">' + item.ticker + ' — Ajouter au portfolio</div>' +
          '<button class="modal-close" id="cat-modal-close">✕</button>' +
        '</div>' +
        '<div class="catalog-modal-body">' +
          '<div class="catalog-modal-price-row">' +
            '<div>' +
              '<div class="catalog-modal-ticker-big">' + item.ticker + '</div>' +
              '<div style="font-size:13px;color:var(--text-secondary)">' + item.name + '</div>' +
            '</div>' +
            '<div style="text-align:right">' +
              '<div style="font-family:\'JetBrains Mono\',monospace;font-size:20px;font-weight:700">' + priceStr + (item.cat === 'Crypto' ? '$' : '€') + '</div>' +
              '<div class="' + chgClass + '" style="font-size:13px">' + chgSign + item.change.toFixed(2) + '%</div>' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label>Catégorie</label>' +
            '<select id="cat-modal-cat" class="ob-input">' +
              '<option value="pea"' + (item.pea ? '' : ' disabled') + '>PEA' + (item.pea ? '' : ' (non éligible)') + '</option>' +
              '<option value="cto">CTO</option>' +
              '<option value="crypto"' + (item.cat === 'Crypto' ? ' selected' : '') + '>Crypto</option>' +
            '</select>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
            '<div class="form-group">' +
              '<label>Montant investi (€)</label>' +
              '<input id="cat-modal-inv" type="number" class="ob-input" placeholder="0" min="0">' +
            '</div>' +
            '<div class="form-group">' +
              '<label>Valeur actuelle (€)</label>' +
              '<input id="cat-modal-cur" type="number" class="ob-input" placeholder="0" min="0">' +
            '</div>' +
          '</div>' +
          '<button class="watchlist-btn' + (inWatch ? ' active' : '') + '" id="cat-modal-watch" style="width:100%;justify-content:center">' +
            (inWatch ? '★ Dans ma watchlist' : '☆ Ajouter à la watchlist') +
          '</button>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" id="cat-modal-cancel">Annuler</button>' +
          '<button class="btn btn-primary" id="cat-modal-add">Ajouter au portfolio</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    setTimeout(function () { overlay.classList.add('open'); }, 10);

    function close() { overlay.classList.remove('open'); setTimeout(function () { overlay.remove(); }, 200); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.getElementById('cat-modal-close').addEventListener('click', close);
    document.getElementById('cat-modal-cancel').addEventListener('click', close);

    document.getElementById('cat-modal-watch').addEventListener('click', function () {
      toggleWatch({ stopPropagation: function () {} }, item.ticker);
      var inW = watchlist.indexOf(item.ticker) !== -1;
      this.textContent = inW ? '★ Dans ma watchlist' : '☆ Ajouter à la watchlist';
      this.classList.toggle('active', inW);
    });

    document.getElementById('cat-modal-add').addEventListener('click', function () {
      var cat = document.getElementById('cat-modal-cat').value;
      var inv = parseFloat(document.getElementById('cat-modal-inv').value) || 0;
      var cur = parseFloat(document.getElementById('cat-modal-cur').value) || 0;
      if (!inv && !cur) { if (typeof showToast === 'function') showToast('Entrez un montant', 'error'); return; }
      addPosition(cat, { name: item.name + ' (' + item.ticker + ')', invested: inv, current: cur || inv });
      if (typeof renderAllPortfolioTabs === 'function') renderAllPortfolioTabs();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof showToast === 'function') showToast(item.ticker + ' ajouté en ' + cat.toUpperCase() + ' !', 'success');
      close();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    var searchEl = document.getElementById('catalog-search');
    if (searchEl) {
      var debounce;
      searchEl.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(filterAndRender, 300);
      });
    }
  });
})();

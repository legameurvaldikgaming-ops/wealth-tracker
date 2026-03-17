/* ══════════════════════════════════════
   CATALOG.JS — Catalogue actifs + filtres + recherche
   ══════════════════════════════════════ */

(function () {

  var currentFilter = 'Tous';
  var searchQuery = '';

  function filterAndRender() {
    var q = searchQuery.toLowerCase();
    var grid = document.getElementById('catalog-grid');
    if (!grid) return;

    var items = [];
    for (var i = 0; i < CATALOG_DATA.length; i++) {
      var item = CATALOG_DATA[i];
      var matchCat = currentFilter === 'Tous' || item.cat === currentFilter;
      var matchQ = !q || item.name.toLowerCase().indexOf(q) !== -1 ||
                   item.ticker.toLowerCase().indexOf(q) !== -1 ||
                   item.desc.toLowerCase().indexOf(q) !== -1;
      if (matchCat && matchQ) items.push(item);
    }

    if (!items.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">' +
        '<div class="empty-icon" style="color:var(--text3)"><svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="18" cy="18" r="12" stroke="currentColor" stroke-width="1.5"/><line x1="26" y1="26" x2="34" y2="34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>' +
        '<div class="empty-text">Aucun résultat</div>' +
        '<div class="empty-sub">Essaie un autre terme de recherche</div>' +
        '</div>';
      return;
    }

    var html = '';
    for (var j = 0; j < items.length; j++) {
      var it = items[j];
      var cls = it.change >= 0 ? 'price-up' : 'price-down';
      var badge = it.cat === 'ETF' ? 'badge-blue' : it.cat === 'Crypto' ? 'badge-amber' : 'badge-green';
      var priceStr = it.price < 10 ? it.price.toFixed(2) : Math.round(it.price).toLocaleString('fr-FR');
      var currency = it.cat === 'Crypto' ? '$' : '€';
      html += '<div class="catalog-item" data-ticker="' + it.ticker + '" data-cat="' + it.cat + '" data-price="' + it.price + '">' +
        '<div class="catalog-ticker">' + it.ticker + ' <span class="badge ' + badge + '" style="margin-left:6px">' + it.cat + '</span></div>' +
        '<div class="catalog-name">' + it.name + '</div>' +
        '<div class="catalog-desc">' + it.desc + '</div>' +
        '<div class="catalog-footer">' +
          '<span class="catalog-price">' + priceStr + ' ' + currency + '</span>' +
          '<span class="catalog-change ' + cls + '">' + (it.change >= 0 ? '+' : '') + it.change.toFixed(2) + '%</span>' +
        '</div>' +
      '</div>';
    }
    grid.innerHTML = html;
  }

  /* ── Modal for adding from catalog ── */
  function openCatalogModal(ticker, cat, price) {
    // Remove existing modal if any
    var existing = document.getElementById('catalog-modal');
    if (existing) existing.remove();

    var pCat = cat === 'ETF' ? 'pea' : cat === 'Crypto' ? 'crypto' : 'cto';

    var overlay = document.createElement('div');
    overlay.id = 'catalog-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal-card">' +
        '<div class="card-title">Ajouter ' + ticker + ' au portfolio <span class="badge ' + (cat === 'ETF' ? 'badge-blue' : cat === 'Crypto' ? 'badge-amber' : 'badge-green') + '">' + pCat.toUpperCase() + '</span></div>' +
        '<div class="form-grid" style="grid-template-columns:1fr 1fr">' +
          '<div class="field"><label>Montant investi (€)</label><input type="number" id="modal-invested" placeholder="0" autofocus></div>' +
          '<div class="field"><label>Valeur actuelle (€)</label><input type="number" id="modal-current" placeholder="0"></div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px">' +
          '<button class="btn-sm" id="modal-cancel">Annuler</button>' +
          '<button class="btn btn-primary" id="modal-confirm">Confirmer</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Force reflow for animation
    overlay.offsetHeight;
    overlay.classList.add('modal-visible');

    var cancel = document.getElementById('modal-cancel');
    var confirm = document.getElementById('modal-confirm');
    var investedInput = document.getElementById('modal-invested');
    var currentInput = document.getElementById('modal-current');

    function closeModal() {
      overlay.classList.remove('modal-visible');
      setTimeout(function () { overlay.remove(); }, 200);
    }

    cancel.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    confirm.addEventListener('click', function () {
      var invested = parseFloat(investedInput.value) || 0;
      var current = parseFloat(currentInput.value) || 0;
      if (!invested && !current) {
        investedInput.style.borderColor = 'var(--red)';
        currentInput.style.borderColor = 'var(--red)';
        return;
      }
      addPosition(pCat, { name: ticker, invested: invested, current: current || invested });
      renderAllPortfolioTabs();
      if (typeof renderDashboard === 'function') renderDashboard();
      showToast(ticker + ' ajouté au ' + pCat.toUpperCase(), 'success');
      closeModal();
    });

    // Focus first input
    setTimeout(function () { investedInput.focus(); }, 100);
  }

  /* ── Event delegation ── */
  document.addEventListener('click', function (e) {
    var item = e.target.closest('.catalog-item');
    if (item) {
      openCatalogModal(item.dataset.ticker, item.dataset.cat, parseFloat(item.dataset.price));
    }
  });

  /* ── Filter pills ── */
  function setCatalogFilter(cat, el) {
    currentFilter = cat;
    var pills = document.querySelectorAll('#cat-filters .pill');
    for (var i = 0; i < pills.length; i++) pills[i].classList.remove('active');
    if (el) el.classList.add('active');
    filterAndRender();
  }

  function setCatalogSearch(q) {
    searchQuery = q;
    filterAndRender();
  }

  // Expose globally
  window.filterAndRender = filterAndRender;
  window.filterCat = setCatalogFilter;
  window.filterCatalog = function () {
    var el = document.getElementById('catalog-search');
    searchQuery = el ? el.value : '';
    filterAndRender();
  };
  window.addFromCatalog = openCatalogModal;
})();

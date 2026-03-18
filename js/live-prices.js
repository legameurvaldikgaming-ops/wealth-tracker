/* ══════════════════════════════════════
   LIVE-PRICES.JS — CoinGecko + simulation
   ══════════════════════════════════════ */
(function () {
  var BASE_PRICES = {
    BTC: 85200, ETH: 3420, SOL: 185, BNB: 610, AVAX: 38,
    CW8: 420.50, PE500: 62.30, PUST: 45.20, AEEM: 5.80, EWLD: 75.40,
    AAPL: 178, NVDA: 875, MSFT: 415, AMZN: 185, NOVO: 108
  };

  var priceCache = {};
  var lastFetch = 0;
  var FETCH_INTERVAL = 60000;

  // Init cache with base prices + small random variation
  Object.keys(BASE_PRICES).forEach(function (t) {
    priceCache[t] = BASE_PRICES[t];
  });

  function simulateMove() {
    Object.keys(priceCache).forEach(function (t) {
      var drift = (Math.random() - 0.492) * 0.006;
      priceCache[t] = Math.max(BASE_PRICES[t] * 0.5, priceCache[t] * (1 + drift));
    });
    updateTickerBar();
  }

  function updateTickerBar() {
    var bar = document.getElementById('ticker-bar');
    if (!bar) return;
    var tickers = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX'];
    var html = tickers.map(function (t) {
      var price = priceCache[t] || BASE_PRICES[t];
      var base = BASE_PRICES[t];
      var chg = ((price - base) / base * 100);
      var cls = chg >= 0 ? 'price-up' : 'price-down';
      var priceStr = price >= 1000 ? Math.round(price).toLocaleString('fr-FR') : price.toFixed(2);
      return '<span class="ticker-item">' +
        '<span class="ticker-sym">' + t + '</span>' +
        '<span class="ticker-price">' + priceStr + '$</span>' +
        '<span class="ticker-change ' + cls + '">' + (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%</span>' +
        '</span>';
    }).join('');
    // Duplicate for seamless loop
    bar.innerHTML = html + html;
  }

  function updateLastLabel() {
    var el = document.getElementById('prices-updated');
    if (el) el.textContent = 'Mis à jour il y a ' + Math.round((Date.now() - lastFetch) / 1000) + 's';
  }

  function fetchLive() {
    var now = Date.now();
    if (now - lastFetch < FETCH_INTERVAL) return;
    lastFetch = now;
    var ids = 'bitcoin,ethereum,solana,binancecoin,avalanche-2';
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var map = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', binancecoin: 'BNB', 'avalanche-2': 'AVAX' };
        Object.keys(map).forEach(function (id) {
          if (data[id] && data[id].usd) priceCache[map[id]] = data[id].usd;
        });
        updateTickerBar();
        updateLastLabel();
        // Refresh catalog if active
        if (document.getElementById('page-catalog') &&
            document.getElementById('page-catalog').classList.contains('active') &&
            typeof filterAndRender === 'function') {
          filterAndRender();
        }
      })
      .catch(function () { /* silent fallback — simulated prices still running */ });
  }

  // Simulate price movement every 8s
  setInterval(simulateMove, 8000);
  // Try real fetch every 60s
  setTimeout(fetchLive, 1500);
  setInterval(fetchLive, FETCH_INTERVAL);
  setInterval(updateLastLabel, 5000);

  function getCurrentPrice(ticker) {
    return priceCache[ticker] || BASE_PRICES[ticker] || 0;
  }

  window.getCurrentPrice = getCurrentPrice;
  window.LIVE_PRICES = priceCache;
  window.BASE_PRICES = BASE_PRICES;

  // After live fetch, refresh portfolio quantity values
  var origFetchLive = fetchLive;
  fetchLive = function () {
    origFetchLive();
    setTimeout(function () {
      if (typeof renderCrypto === 'function') renderCrypto();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderIncome === 'function') renderIncome();
      if (typeof renderCoach === 'function') renderCoach();
    }, 2000);
  };

  // Init ticker on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    updateTickerBar();
  });
})();

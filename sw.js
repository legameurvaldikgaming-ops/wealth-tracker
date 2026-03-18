/* ── WEALTH Service Worker v2 ── */
var CACHE = 'wealth-v2';
var ASSETS = [
  './', './index.html', './css/style.css',
  './js/data.js', './js/state.js', './js/themes.js',
  './js/animations.js', './js/cursor.js', './js/live-prices.js',
  './js/charts.js', './js/portfolio.js', './js/simulator.js',
  './js/catalog.js', './js/mindset.js', './js/roadmap.js',
  './js/dashboard.js', './js/commands.js', './js/onboarding.js',
  './js/app.js', './assets/favicon.svg'
];

self.addEventListener('install', function(evt) {
  evt.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS);
    }).catch(function() { /* ignore cache errors */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(evt) {
  evt.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) {
        return k !== CACHE;
      }).map(function(k) {
        return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(evt) {
  if (evt.request.method !== 'GET') return;
  evt.respondWith(
    caches.match(evt.request).then(function(cached) {
      if (cached) return cached;
      return fetch(evt.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(evt.request, clone); });
        return res;
      });
    }).catch(function() {
      return caches.match('./index.html');
    })
  );
});

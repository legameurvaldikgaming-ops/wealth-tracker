/* ══════════════════════════════════════
   STATE.JS — Global state + localStorage
   ══════════════════════════════════════ */

(function () {
  var KEY = 'wealth_v1';

  var DEFAULT = { pea: [], cto: [], crypto: [], immo: [], dca: [] };

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) { window.STATE = JSON.parse(JSON.stringify(DEFAULT)); return; }
      var data = JSON.parse(raw);
      // Ensure all categories exist
      window.STATE = {
        pea:    (data.pea    || []).map(ensureId),
        cto:    (data.cto    || []).map(ensureId),
        crypto: (data.crypto || []).map(ensureId),
        immo:   (data.immo   || []).map(ensureId),
        dca:    (data.dca    || []).map(ensureId)
      };
    } catch (e) {
      window.STATE = JSON.parse(JSON.stringify(DEFAULT));
    }
  }

  function ensureId(item) {
    if (!item.id) item.id = genId();
    return item;
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(window.STATE)); } catch (e) {}
  }

  function addPosition(cat, obj) {
    if (!window.STATE[cat]) return null;
    obj.id = genId();
    window.STATE[cat].push(obj);
    saveState();
    return obj.id;
  }

  function updatePosition(cat, id, updates) {
    if (!window.STATE[cat]) return;
    window.STATE[cat] = window.STATE[cat].map(function (p) {
      return p.id === id ? Object.assign({}, p, updates) : p;
    });
    saveState();
  }

  function removePosition(cat, id) {
    if (!window.STATE[cat]) return;
    window.STATE[cat] = window.STATE[cat].filter(function (p) { return p.id !== id; });
    saveState();
  }

  function getTotals() {
    var s = window.STATE;
    var sumCur = function (arr, key) { return arr.reduce(function (a, b) { return a + (parseFloat(b[key]) || 0); }, 0); };
    var sumInv = function (arr, key) { return arr.reduce(function (a, b) { return a + (parseFloat(b[key]) || 0); }, 0); };

    var pea    = sumCur(s.pea,    'current');
    var cto    = sumCur(s.cto,    'current');
    var crypto = sumCur(s.crypto, 'current');
    var immoVal= s.immo.reduce(function (a, b) { return a + (parseFloat(b.price) || 0); }, 0);

    var peaInv    = sumInv(s.pea,    'invested');
    var ctoInv    = sumInv(s.cto,    'invested');
    var cryptoInv = sumInv(s.crypto, 'invested');
    var immoInv   = s.immo.reduce(function (a, b) { return a + (parseFloat(b.invested) || 0); }, 0);

    var total    = pea + cto + crypto + immoVal;
    var invested = peaInv + ctoInv + cryptoInv + immoInv;
    var pnl      = total - invested;
    var pnlPct   = invested > 0 ? (pnl / invested * 100) : 0;

    return { pea: pea, cto: cto, crypto: crypto, immo: immoVal, total: total, invested: invested, pnl: pnl, pnlPct: pnlPct };
  }

  function getInvestedTotal() {
    return getTotals().invested;
  }

  // Format helpers
  window.fmt = function (n) {
    return Math.round(n).toLocaleString('fr-FR') + '\u00a0€';
  };
  window.fmtPct = function (n) {
    return (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%';
  };
  window.fmtMult = function (n) {
    return Number(n).toFixed(2) + 'x';
  };
  window.fmtCompact = function (n) {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M\u00a0€';
    if (Math.abs(n) >= 1000)    return (n / 1000).toFixed(0) + 'K\u00a0€';
    return Math.round(n).toLocaleString('fr-FR') + '\u00a0€';
  };

  window.loadState = loadState;
  window.saveState = saveState;
  window.addPosition = addPosition;
  window.updatePosition = updatePosition;
  window.removePosition = removePosition;
  window.getTotals = getTotals;
  window.getInvestedTotal = getInvestedTotal;

  loadState();
})();

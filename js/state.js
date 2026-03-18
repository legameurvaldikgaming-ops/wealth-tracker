/* ══════════════════════════════════════
   STATE.JS — Global state + localStorage (V4)
   ══════════════════════════════════════ */

(function () {
  var KEY    = 'wealth_v1';
  var KEY_V4 = 'wealth_v4';

  var DEFAULT = { pea: [], cto: [], crypto: [], immo: [], dca: [] };

  var DEFAULT_V4 = {
    defi:        [],
    gasFees:     [],
    journal:     [],
    vault:       {},
    coachDone:   [],
    coachWeek:   null,
    salary:      0,
    stealthMode: false
  };

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) { window.STATE = JSON.parse(JSON.stringify(DEFAULT)); }
      else {
        var data = JSON.parse(raw);
        window.STATE = {
          pea:    (data.pea    || []).map(ensureId),
          cto:    (data.cto    || []).map(ensureId),
          crypto: (data.crypto || []).map(ensureId),
          immo:   (data.immo   || []).map(ensureId),
          dca:    (data.dca    || []).map(ensureId)
        };
      }
    } catch (e) {
      window.STATE = JSON.parse(JSON.stringify(DEFAULT));
    }
  }

  function loadV4State() {
    try {
      var raw = localStorage.getItem(KEY_V4);
      if (!raw) { window.STATE_V4 = JSON.parse(JSON.stringify(DEFAULT_V4)); return; }
      var data = JSON.parse(raw);
      window.STATE_V4 = {
        defi:        (data.defi        || []).map(ensureId),
        gasFees:     (data.gasFees     || []).map(ensureId),
        journal:     (data.journal     || []).map(ensureId),
        vault:       data.vault        || {},
        coachDone:   data.coachDone    || [],
        coachWeek:   data.coachWeek    || null,
        salary:      data.salary       || 0,
        stealthMode: data.stealthMode  || false
      };
    } catch (e) {
      window.STATE_V4 = JSON.parse(JSON.stringify(DEFAULT_V4));
    }
  }

  function ensureId(item) {
    if (!item.id) item.id = genId();
    return item;
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(window.STATE)); } catch (e) {}
  }

  function saveV4State() {
    try { localStorage.setItem(KEY_V4, JSON.stringify(window.STATE_V4)); } catch (e) {}
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

  function addV4Item(cat, obj) {
    if (!window.STATE_V4 || !Array.isArray(window.STATE_V4[cat])) return null;
    obj.id = genId();
    window.STATE_V4[cat].push(obj);
    saveV4State();
    return obj.id;
  }

  function removeV4Item(cat, id) {
    if (!window.STATE_V4 || !Array.isArray(window.STATE_V4[cat])) return;
    window.STATE_V4[cat] = window.STATE_V4[cat].filter(function (p) { return p.id !== id; });
    saveV4State();
  }

  function getCryptoCurrentValue(p) {
    var qty = parseFloat(p.quantity) || 0;
    var ticker = (p.ticker || p.name || '').toUpperCase().split(' ')[0];
    if (qty > 0 && ticker && typeof window.getCurrentPrice === 'function') {
      var live = window.getCurrentPrice(ticker);
      if (live > 0) return qty * live;
    }
    return parseFloat(p.current) || 0;
  }

  function getETFCurrentValue(p) {
    var shares = parseFloat(p.shares) || 0;
    var ticker = (p.ticker || '').toUpperCase();
    if (shares > 0 && ticker && typeof window.getCurrentPrice === 'function') {
      var live = window.getCurrentPrice(ticker);
      if (live > 0) return shares * live;
    }
    return parseFloat(p.current) || 0;
  }

  function getTotals() {
    var s = window.STATE;

    var pea    = s.pea.reduce(function(a,p){ return a + getETFCurrentValue(p); }, 0);
    var cto    = s.cto.reduce(function(a,p){ return a + getETFCurrentValue(p); }, 0);
    var crypto = s.crypto.reduce(function(a,p){ return a + getCryptoCurrentValue(p); }, 0);
    var immoVal= s.immo.reduce(function (a, b) { return a + (parseFloat(b.price) || 0); }, 0);

    var peaInv = s.pea.reduce(function(a,p){
      var sh = parseFloat(p.shares)||0, bp = parseFloat(p.pricePerShare)||0;
      return a + (sh>0&&bp>0 ? sh*bp : parseFloat(p.invested)||0);
    }, 0);
    var ctoInv = s.cto.reduce(function(a,p){
      var sh = parseFloat(p.shares)||0, bp = parseFloat(p.pricePerShare)||0;
      return a + (sh>0&&bp>0 ? sh*bp : parseFloat(p.invested)||0);
    }, 0);
    var cryptoInv = s.crypto.reduce(function(a,p){
      var qty = parseFloat(p.quantity)||0, bp = parseFloat(p.buyPrice)||0;
      return a + (qty>0&&bp>0 ? qty*bp : parseFloat(p.invested)||0);
    }, 0);
    var immoInv = s.immo.reduce(function (a, b) { return a + (parseFloat(b.invested) || 0); }, 0);

    var total    = pea + cto + crypto + immoVal;
    var invested = peaInv + ctoInv + cryptoInv + immoInv;
    var pnl      = total - invested;
    var pnlPct   = invested > 0 ? (pnl / invested * 100) : 0;

    return { pea: pea, cto: cto, crypto: crypto, immo: immoVal, total: total,
             invested: invested, pnl: pnl, pnlPct: pnlPct };
  }

  function getInvestedTotal() { return getTotals().invested; }

  // ── Format helpers ────────────────────
  window.fmt = function (n) {
    if (window.STATE_V4 && window.STATE_V4.stealthMode) return '•••••';
    return Math.round(n).toLocaleString('fr-FR') + '\u00a0€';
  };
  window.fmtRaw = function (n) {
    return Math.round(n).toLocaleString('fr-FR') + '\u00a0€';
  };
  window.fmtPct = function (n) {
    return (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%';
  };
  window.fmtMult = function (n) {
    return Number(n).toFixed(2) + 'x';
  };
  window.fmtCompact = function (n) {
    if (window.STATE_V4 && window.STATE_V4.stealthMode) return '•••••';
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M\u00a0€';
    if (Math.abs(n) >= 1000)    return (n / 1000).toFixed(0) + 'K\u00a0€';
    return Math.round(n).toLocaleString('fr-FR') + '\u00a0€';
  };

  window.genId             = genId;
  window.getCryptoCurrentValue = getCryptoCurrentValue;
  window.getETFCurrentValue    = getETFCurrentValue;
  window.loadState         = loadState;
  window.saveState         = saveState;
  window.saveV4State       = saveV4State;
  window.addPosition       = addPosition;
  window.updatePosition    = updatePosition;
  window.removePosition    = removePosition;
  window.addV4Item         = addV4Item;
  window.removeV4Item      = removeV4Item;
  window.getTotals         = getTotals;
  window.getInvestedTotal  = getInvestedTotal;

  loadState();
  loadV4State();
})();

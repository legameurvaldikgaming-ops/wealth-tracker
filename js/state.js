/* ══════════════════════════════════════
   STATE.JS — Gestion état global + localStorage
   ══════════════════════════════════════ */

(function () {
  var DEFAULT_STATE = { pea: [], cto: [], crypto: [], immo: [], dca: [] };

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function loadState() {
    try {
      var raw = localStorage.getItem('wealth_v1');
      if (raw) {
        var parsed = JSON.parse(raw);
        // Ensure all keys exist
        var state = {};
        var keys = ['pea', 'cto', 'crypto', 'immo', 'dca'];
        for (var i = 0; i < keys.length; i++) {
          state[keys[i]] = Array.isArray(parsed[keys[i]]) ? parsed[keys[i]] : [];
        }
        return state;
      }
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState() {
    localStorage.setItem('wealth_v1', JSON.stringify(window.STATE));
  }

  function addPosition(cat, obj) {
    obj.id = generateId();
    obj.date = obj.date || new Date().toISOString().slice(0, 10);
    window.STATE[cat].push(obj);
    saveState();
    return obj.id;
  }

  function updatePosition(cat, id, updates) {
    var arr = window.STATE[cat];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        for (var key in updates) {
          if (updates.hasOwnProperty(key)) {
            arr[i][key] = updates[key];
          }
        }
        break;
      }
    }
    saveState();
  }

  function removePosition(cat, id) {
    window.STATE[cat] = window.STATE[cat].filter(function (p) { return p.id !== id; });
    saveState();
  }

  function getTotals() {
    var s = window.STATE;
    var pea = s.pea.reduce(function (sum, p) { return sum + (p.current || 0); }, 0);
    var cto = s.cto.reduce(function (sum, p) { return sum + (p.current || 0); }, 0);
    var crypto = s.crypto.reduce(function (sum, p) { return sum + (p.current || 0); }, 0);
    var immo = s.immo.reduce(function (sum, b) { return sum + (b.valeur || 0); }, 0);
    var invested = s.pea.reduce(function (sum, p) { return sum + (p.invested || 0); }, 0)
      + s.cto.reduce(function (sum, p) { return sum + (p.invested || 0); }, 0)
      + s.crypto.reduce(function (sum, p) { return sum + (p.invested || 0); }, 0)
      + s.immo.reduce(function (sum, b) { return sum + (b.prix || 0); }, 0);
    var total = pea + cto + crypto + immo;
    var pnl = total - invested;
    var pnlPct = invested > 0 ? (pnl / invested * 100) : 0;
    return { pea: pea, cto: cto, crypto: crypto, immo: immo, total: total, invested: invested, pnl: pnl, pnlPct: pnlPct };
  }

  function getInvestedTotal() {
    var t = getTotals();
    return t.invested;
  }

  // Formatting helpers (global)
  window.fmt = function (n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; };
  window.fmtPct = function (n) { return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'; };
  window.fmtMult = function (n) { return n.toFixed(2) + 'x'; };

  // Initialize STATE
  window.STATE = loadState();

  // Expose functions globally
  window.loadState = loadState;
  window.saveState = saveState;
  window.addPosition = addPosition;
  window.updatePosition = updatePosition;
  window.removePosition = removePosition;
  window.getTotals = getTotals;
  window.getInvestedTotal = getInvestedTotal;
})();

/* ══════════════════════════════════════
   V4-INTELLIGENCE.JS — Stress test, Impatience cost, Correlation matrix
   ══════════════════════════════════════ */

(function () {

  // ── STRESS TEST ───────────────────────
  window.runStressTest = function () {
    var slider = document.getElementById('stress-slider');
    var drop = slider ? (parseFloat(slider.value) || 40) / 100 : 0.40;
    var s = window.STATE || {};
    var totals = getTotals();
    var rows = [];

    // Crypto positions
    (s.crypto || []).forEach(function(p) {
      var cur = getCryptoCurrentValue(p);
      var ticker = p.ticker || p.name || '?';
      var loss = cur * drop;
      rows.push({ name: ticker, cat: 'Crypto', cur: cur, loss: loss, pct: drop * 100 });
    });

    // PEA/CTO positions (correlated ~0.7 to crash scenario for stocks)
    var stockDrop = drop * 0.7;
    ['pea','cto'].forEach(function(cat) {
      (s[cat] || []).forEach(function(p) {
        var cur = getETFCurrentValue(p);
        var loss = cur * stockDrop;
        rows.push({ name: (p.name||p.ticker||'?'), cat: cat.toUpperCase(), cur: cur, loss: loss, pct: stockDrop * 100 });
      });
    });

    var totalLoss = rows.reduce(function(a,r){ return a + r.loss; }, 0);
    var residual  = totals.total - totalLoss;

    // Lombard margin call check
    var lombPortfolio = parseFloat((document.getElementById('lomb-portfolio')||{}).value) || 0;
    var lombLTV       = parseFloat((document.getElementById('lomb-ltv')||{}).value) || 70;
    var lombMsg = '';
    if (lombPortfolio > 0) {
      var portfolioAfter = lombPortfolio * (1 - drop);
      var loanAmt = lombPortfolio * lombLTV / 100;
      var newLTV  = portfolioAfter > 0 ? loanAmt / portfolioAfter * 100 : 999;
      if (newLTV > 85) {
        lombMsg = '<div class="stress-alert">🚨 <strong>MARGIN CALL PROBABLE</strong> — LTV passerait à ' +
          newLTV.toFixed(0) + '% (seuil ≈ 85%). Réduction du crédit Lombard recommandée.</div>';
      } else {
        lombMsg = '<div class="stress-ok">✅ Pas de margin call estimé (LTV: ' + newLTV.toFixed(0) + '%)</div>';
      }
    }

    var pctLabel = document.getElementById('stress-pct-label');
    if (pctLabel) pctLabel.textContent = '-' + Math.round(drop*100) + '%';

    var out = document.getElementById('stress-output');
    if (!out) return;

    if (!rows.length) {
      out.innerHTML = '<div style="color:var(--text-tertiary);text-align:center;padding:24px">Ajoutez des positions dans Portfolio pour simuler.</div>';
      return;
    }

    out.innerHTML =
      '<div class="stress-summary">' +
        '<div class="stress-metric">' +
          '<div class="stress-metric-val td-red">-' + fmtRaw(totalLoss) + '</div>' +
          '<div class="stress-metric-lbl">Perte totale estimée</div>' +
        '</div>' +
        '<div class="stress-metric">' +
          '<div class="stress-metric-val">' + fmtRaw(residual) + '</div>' +
          '<div class="stress-metric-lbl">Patrimoine résiduel</div>' +
        '</div>' +
        '<div class="stress-metric">' +
          '<div class="stress-metric-val" style="color:var(--amber)">-' + Math.round(drop*100) + '%</div>' +
          '<div class="stress-metric-lbl">Scénario de baisse</div>' +
        '</div>' +
      '</div>' +
      lombMsg +
      '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-top:12px">' +
        '<thead><tr><th style="text-align:left;padding:8px 4px;color:var(--text-tertiary)">Actif</th>' +
          '<th style="text-align:left;padding:8px 4px;color:var(--text-tertiary)">Cat.</th>' +
          '<th style="text-align:right;padding:8px 4px;color:var(--text-tertiary)">Valeur</th>' +
          '<th style="text-align:right;padding:8px 4px;color:var(--text-tertiary)">Perte</th></tr></thead><tbody>' +
        rows.map(function(r) {
          return '<tr style="border-bottom:1px solid var(--border)">' +
            '<td style="padding:8px 4px;font-weight:500">' + r.name + '</td>' +
            '<td style="padding:8px 4px"><span class="badge badge-' + r.cat.toLowerCase() + '">' + r.cat + '</span></td>' +
            '<td style="padding:8px 4px;text-align:right;font-family:monospace">' + fmtRaw(r.cur) + '</td>' +
            '<td style="padding:8px 4px;text-align:right;font-family:monospace;color:var(--red)">-' + fmtRaw(r.loss) + '</td>' +
          '</tr>';
        }).join('') +
      '</tbody></table>';
  };

  // ── IMPATIENCE COST (PEA early withdrawal) ──
  window.calcImpatience = function () {
    var amountEl = document.getElementById('imp-amount');
    var yearsEl  = document.getElementById('imp-years-left');
    var rateEl   = document.getElementById('imp-rate');
    var amount   = parseFloat(amountEl ? amountEl.value : 0) || 0;
    var yearsLeft= parseFloat(yearsEl  ? yearsEl.value  : 0) || 0;
    var rate     = parseFloat(rateEl   ? rateEl.value   : 7) / 100 || 0.07;
    var out      = document.getElementById('imp-output');
    if (!out || !amount) return;

    // Tax on early withdrawal (flat tax 30% on gains)
    // Assume 50% of withdrawal is gain
    var estimatedGain = amount * 0.5;
    var taxCost       = estimatedGain * 0.30;
    var netWithdrawal = amount - taxCost;

    // Compound interest lost: what this amount would have become in 20 years
    var horizon = 20;
    var futureWithFull     = amount * Math.pow(1 + rate, horizon);
    var futureWithNet      = netWithdrawal * Math.pow(1 + rate, yearsLeft > 0 ? yearsLeft : horizon);
    var opportunityCost    = futureWithFull - futureWithNet;

    out.innerHTML =
      '<div class="imp-grid">' +
        '<div class="imp-card">' +
          '<div class="imp-val td-red">-' + fmtRaw(taxCost) + '</div>' +
          '<div class="imp-lbl">Impôts immédiats (30% flat tax estimé)</div>' +
        '</div>' +
        '<div class="imp-card">' +
          '<div class="imp-val td-red">-' + fmtRaw(opportunityCost) + '</div>' +
          '<div class="imp-lbl">Manque à gagner sur ' + horizon + ' ans (intérêts composés perdus)</div>' +
        '</div>' +
        '<div class="imp-card imp-card-total">' +
          '<div class="imp-val td-red">-' + fmtRaw(opportunityCost + taxCost) + '</div>' +
          '<div class="imp-lbl">⚡ Cette décision te coûte au total dans ' + horizon + ' ans</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-tertiary);margin-top:12px">Calcul basé sur ' + (rate*100).toFixed(0) + '%/an, horizon ' + horizon + ' ans, estimation fiscale simplifiée.</div>';
  };

  // ── CORRELATION MATRIX ────────────────
  // Simulated correlations between common asset classes
  var CORRELATIONS = {
    'BTC-ETH':   0.92, 'BTC-SOL':  0.85, 'BTC-BNB':  0.78, 'BTC-AVAX': 0.80,
    'BTC-SP500': 0.45, 'BTC-CW8':  0.42, 'BTC-MSFT': 0.38, 'BTC-NVDA': 0.48,
    'ETH-SOL':   0.87, 'ETH-BNB':  0.76, 'ETH-SP500':0.40,
    'SP500-CW8': 0.92, 'SP500-MSFT':0.75,'SP500-AAPL':0.72,
    'CW8-PE500': 0.96, 'CW8-EWLD': 0.98,
    'IMMO-SP500':0.15, 'IMMO-BTC': 0.08,
    'OR-BTC':    0.15, 'OR-SP500':-0.02
  };

  function getCorrelation(a, b) {
    var key1 = a + '-' + b;
    var key2 = b + '-' + a;
    if (CORRELATIONS[key1] !== undefined) return CORRELATIONS[key1];
    if (CORRELATIONS[key2] !== undefined) return CORRELATIONS[key2];
    // Same category → high correlation
    if (a === b) return 1.0;
    // Default: moderate positive correlation
    return 0.35;
  }

  function classifyAsset(ticker) {
    var t = (ticker||'').toUpperCase();
    var cryptos = ['BTC','ETH','SOL','BNB','AVAX','ADA','DOT','MATIC','LINK'];
    var sp500   = ['SP500','PE500','PUST'];
    var world   = ['CW8','EWLD','AEEM'];
    var stocks  = ['AAPL','NVDA','MSFT','AMZN','NOVO'];
    if (cryptos.indexOf(t) !== -1) return 'crypto';
    if (sp500.indexOf(t)   !== -1) return 'sp500';
    if (world.indexOf(t)   !== -1) return 'world';
    if (stocks.indexOf(t)  !== -1) return 'action';
    return 'other';
  }

  window.renderCorrelationMatrix = function () {
    var out = document.getElementById('correlation-output');
    if (!out) return;

    var s = window.STATE || {};
    var assets = [];
    var totals = getTotals();

    // Collect all assets with their weights
    (s.crypto || []).forEach(function(p) {
      var cur = getCryptoCurrentValue(p);
      var ticker = (p.ticker || p.name || '?').toUpperCase().split(' ')[0];
      if (cur > 0) assets.push({ ticker: ticker, value: cur, cat: 'crypto' });
    });
    ['pea','cto'].forEach(function(cat) {
      (s[cat] || []).forEach(function(p) {
        var cur = typeof getETFCurrentValue==='function' ? getETFCurrentValue(p) : parseFloat(p.current)||0;
        var ticker = (p.ticker || p.name || cat.toUpperCase()).toUpperCase().split(' ')[0];
        if (cur > 0) assets.push({ ticker: ticker, value: cur, cat: cat });
      });
    });
    (s.immo || []).forEach(function(p) {
      var cur = parseFloat(p.price) || 0;
      if (cur > 0) assets.push({ ticker: 'IMMO', value: cur, cat: 'immo' });
    });

    if (assets.length < 2) {
      out.innerHTML = '<div style="color:var(--text-tertiary);text-align:center;padding:24px">Ajoutez au moins 2 actifs pour voir la matrice de corrélation.</div>';
      return;
    }

    // Deduplicate
    var seen = {};
    assets = assets.filter(function(a) {
      if (seen[a.ticker]) return false;
      seen[a.ticker] = true;
      return true;
    });

    // Compute weighted average correlation score
    var totalVal = assets.reduce(function(a,b){ return a + b.value; }, 0);
    var weightedCorr = 0;
    var count = 0;
    for (var i = 0; i < assets.length; i++) {
      for (var j = i+1; j < assets.length; j++) {
        var c = getCorrelation(assets[i].ticker, assets[j].ticker);
        var w = (assets[i].value + assets[j].value) / (2 * totalVal);
        weightedCorr += c * w;
        count++;
      }
    }
    var avgCorr = count > 0 ? Math.min(1, weightedCorr / (count/assets.length)) : 0;
    var diversScore = Math.round((1 - avgCorr * 0.8) * 100);

    // Asset class diversity
    var catCounts = {};
    assets.forEach(function(a) { catCounts[a.cat] = (catCounts[a.cat]||0)+1; });
    var numCats = Object.keys(catCounts).length;

    var scoreColor = diversScore > 70 ? 'var(--green)' : diversScore > 40 ? 'var(--amber)' : 'var(--red)';
    var corrMsg = avgCorr > 0.75 ? '— risque concentré' : avgCorr > 0.50 ? '— corrélation modérée' : '— bonne diversification';

    var html = '<div class="corr-summary">' +
      '<div class="corr-score" style="color:' + scoreColor + '">' + diversScore + '<span>/100</span></div>' +
      '<div class="corr-msg">Score de vraie diversification</div>' +
      '<div style="font-size:13px;color:var(--text-secondary);margin-top:8px">Ton portfolio est corrélé à ' + Math.round(avgCorr*100) + '% ' + corrMsg + '</div>' +
      '<div style="font-size:12px;color:var(--text-tertiary);margin-top:4px">' + numCats + ' classes d\'actifs · ' + assets.length + ' positions</div>' +
    '</div>';

    // Matrix table
    if (assets.length <= 8) {
      html += '<div style="overflow-x:auto;margin-top:16px"><table class="corr-table"><thead><tr><th></th>';
      assets.forEach(function(a) { html += '<th>' + a.ticker + '</th>'; });
      html += '</tr></thead><tbody>';
      assets.forEach(function(a) {
        html += '<tr><td><strong>' + a.ticker + '</strong></td>';
        assets.forEach(function(b) {
          var c = getCorrelation(a.ticker, b.ticker);
          var bg = a.ticker === b.ticker ? 'var(--accent)' :
                   c > 0.8 ? 'rgba(255,59,48,0.25)' :
                   c > 0.6 ? 'rgba(255,159,10,0.25)' :
                   c < 0.2 ? 'rgba(52,199,89,0.25)' : 'var(--bg-elevated)';
          html += '<td style="background:' + bg + ';text-align:center;font-size:12px;font-family:monospace">' +
            (a.ticker === b.ticker ? '1.00' : c.toFixed(2)) + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
    }

    out.innerHTML = html;
  };

  // Init event listeners
  document.addEventListener('DOMContentLoaded', function () {
    var stressSlider = document.getElementById('stress-slider');
    if (stressSlider) {
      stressSlider.addEventListener('input', function () {
        var pctLabel = document.getElementById('stress-pct-label');
        if (pctLabel) pctLabel.textContent = '-' + this.value + '%';
      });
    }
    var impBtn = document.getElementById('imp-calc-btn');
    if (impBtn) impBtn.addEventListener('click', calcImpatience);

    // Auto-render correlation when section is visible
    var corrBtn = document.getElementById('corr-render-btn');
    if (corrBtn) corrBtn.addEventListener('click', renderCorrelationMatrix);
  });

})();

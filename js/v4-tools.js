/* ══════════════════════════════════════
   V4-TOOLS.JS — Health Score, Monthly Report, Expat Simulator,
                  Retirement Calculator, Stealth Mode, Journal, Vault
   ══════════════════════════════════════ */

(function () {

  // ════════════════════════════════════
  // HEALTH SCORE (0-100)
  // ════════════════════════════════════
  window.computeHealthScore = function () {
    var s   = window.STATE    || {};
    var sv4 = window.STATE_V4 || {};
    var score = 0;
    var details = [];

    var totals = getTotals();

    // +20: diversification > 3 classes d'actifs
    var classes = 0;
    if ((s.pea||[]).length+(s.cto||[]).length > 0) classes++;
    if ((s.crypto||[]).length > 0) classes++;
    if ((s.immo||[]).length > 0) classes++;
    if ((sv4.defi||[]).length > 0) classes++;
    if (classes >= 3) { score += 20; details.push({ label: 'Diversification ('+classes+' classes)', pts: 20, ok: true }); }
    else              { details.push({ label: 'Diversification ('+classes+'/3 classes requises)', pts: 0, maxPts: 20, ok: false }); }

    // +20: provision fiscale crypto >= 30% des gains
    var cryptoInv = (s.crypto||[]).reduce(function(a,p){
      var qty=parseFloat(p.quantity)||0, bp=parseFloat(p.buyPrice)||0;
      return a+(qty>0&&bp>0?qty*bp:parseFloat(p.invested)||0);
    }, 0);
    var cryptoCur = (s.crypto||[]).reduce(function(a,p){ return a+getCryptoCurrentValue(p); }, 0);
    var cryptoGains = Math.max(0, cryptoCur - cryptoInv);
    var taxProvision = sv4.taxProvision || 0;
    var taxOk = cryptoGains === 0 || taxProvision >= cryptoGains * 0.30;
    if (taxOk) { score += 20; details.push({ label: 'Provision fiscale crypto', pts: 20, ok: true }); }
    else        { details.push({ label: 'Provision fiscale insuffisante (besoin: '+fmtRaw(cryptoGains*0.30)+')', pts: 0, maxPts: 20, ok: false }); }

    // +15: DCA fait ce mois
    var dcaTotal = (s.dca||[]).reduce(function(a,d){ return a+(parseFloat(d.amount)||0);},0);
    var dcaDone = dcaTotal > 0; // Simplified: if DCA is configured, assume done
    if (dcaDone) { score += 15; details.push({ label: 'DCA configuré (' + fmtRaw(dcaTotal) + '/mois)', pts: 15, ok: true }); }
    else          { details.push({ label: 'Aucun DCA configuré', pts: 0, maxPts: 15, ok: false }); }

    // +15: progression liberté financière > 0%
    var sv4income = typeof getPassiveIncomeTotal === 'function' ? getPassiveIncomeTotal() : 0;
    var salary    = parseFloat(sv4.salary) || 0;
    var fiProgress = salary > 0 && sv4income > 0;
    if (fiProgress) { score += 15; details.push({ label: 'Revenus passifs en cours (' + fmtRaw(sv4income) + '/mois)', pts: 15, ok: true }); }
    else             { details.push({ label: 'Revenus passifs = 0', pts: 0, maxPts: 15, ok: false }); }

    // +15: pas de sur-pondération (aucun actif > 60%)
    var maxConc = 0;
    if (totals.total > 0) {
      maxConc = Math.max(
        totals.pea   / totals.total,
        totals.cto   / totals.total,
        totals.crypto/ totals.total,
        totals.immo  / totals.total
      ) * 100;
    }
    if (maxConc <= 60 || totals.total === 0) { score += 15; details.push({ label: 'Aucune sur-concentration (max: '+maxConc.toFixed(0)+'%)', pts: 15, ok: true }); }
    else { details.push({ label: 'Sur-concentration détectée ('+maxConc.toFixed(0)+'% sur une classe)', pts: 0, maxPts: 15, ok: false }); }

    // +15: ratio dette/actifs < 40%
    var lombPortfolio = parseFloat((document.getElementById('lomb-portfolio')||{}).value) || 0;
    var lombLTV       = parseFloat((document.getElementById('lomb-ltv')||{}).value) || 0;
    var debt          = lombPortfolio * lombLTV / 100;
    var debtRatio     = totals.total > 0 ? debt / totals.total : 0;
    if (debtRatio <= 0.40) { score += 15; details.push({ label: 'Ratio dette/actifs sain ('+Math.round(debtRatio*100)+'%)', pts: 15, ok: true }); }
    else { details.push({ label: 'Ratio dette/actifs élevé ('+Math.round(debtRatio*100)+'%)', pts: 0, maxPts: 15, ok: false }); }

    return { score: score, details: details };
  };

  // Expose for income module
  window.getPassiveIncomeTotal = function () {
    var s   = window.STATE    || {};
    var sv4 = window.STATE_V4 || {};
    var loyers = (s.immo||[]).reduce(function(a,p){ return a+Math.max(0,(parseFloat(p.loyer)||0)-(parseFloat(p.charges)||0));},0);
    var defiY  = (sv4.defi||[]).reduce(function(a,p){
      var cap=(parseFloat(p.amount1)||0)*(parseFloat(p.entryPrice1)||1)+(parseFloat(p.amount2)||0)*(parseFloat(p.entryPrice2)||1);
      return a+(cap*(parseFloat(p.apy)||0)/100/12);
    },0);
    var pCTO = (s.pea||[]).reduce(function(a,p){return a+(typeof getETFCurrentValue==='function'?getETFCurrentValue(p):parseFloat(p.current)||0);},0)+
               (s.cto||[]).reduce(function(a,p){return a+(typeof getETFCurrentValue==='function'?getETFCurrentValue(p):parseFloat(p.current)||0);},0);
    return loyers + defiY + pCTO * 0.005 / 12;
  };

  window.renderHealthScore = function () {
    var result = computeHealthScore();
    var score  = result.score;

    var gaugeEl  = document.getElementById('health-gauge-value');
    var gaugeBar = document.getElementById('health-gauge-bar');
    var detailEl = document.getElementById('health-details');
    var labelEl  = document.getElementById('health-label');

    var color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)';
    var label = score >= 70 ? 'Excellent' : score >= 40 ? 'Correct' : 'À améliorer';

    if (gaugeEl)  { gaugeEl.textContent = score; gaugeEl.style.color = color; }
    if (gaugeBar) { gaugeBar.style.width = score + '%'; gaugeBar.style.background = color; }
    if (labelEl)  { labelEl.textContent = label; labelEl.style.color = color; }

    if (detailEl) {
      detailEl.innerHTML = result.details.map(function(d) {
        return '<div class="health-detail ' + (d.ok ? 'health-ok' : 'health-fail') + '">' +
          '<span>' + (d.ok ? '✅' : '❌') + ' ' + d.label + '</span>' +
          '<span style="font-weight:600;color:' + (d.ok ? 'var(--green)' : 'var(--text-tertiary)') + '">' +
            '+' + (d.ok ? d.pts : 0) + 'pts' +
          '</span>' +
        '</div>';
      }).join('');
    }

    return score;
  };

  // ════════════════════════════════════
  // MONTHLY REPORT GENERATOR
  // ════════════════════════════════════
  window.generateMonthlyReport = function () {
    var totals  = getTotals();
    var health  = computeHealthScore();
    var now     = new Date();
    var monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    var quote   = window.QUOTES ? window.QUOTES[Math.floor(Date.now()/86400000) % window.QUOTES.length] : {};

    var s   = window.STATE    || {};
    var sv4 = window.STATE_V4 || {};
    var dcaTotal = (s.dca||[]).reduce(function(a,d){ return a+(parseFloat(d.amount)||0);},0);

    // Best/worst crypto positions
    var allPos = [];
    (s.crypto||[]).forEach(function(p){
      var cur=getCryptoCurrentValue(p), inv=parseFloat(p.invested)||0;
      allPos.push({name:p.ticker||p.name||'?', pnl:cur-inv, pct:inv>0?(cur-inv)/inv*100:0});
    });
    ['pea','cto'].forEach(function(cat){
      (s[cat]||[]).forEach(function(p){
        var cur=typeof getETFCurrentValue==='function'?getETFCurrentValue(p):parseFloat(p.current)||0;
        var inv=parseFloat(p.invested)||0;
        allPos.push({name:p.ticker||p.name||'?', pnl:cur-inv, pct:inv>0?(cur-inv)/inv*100:0});
      });
    });
    allPos.sort(function(a,b){ return b.pct-a.pct; });
    var best  = allPos.slice(0,3);
    var worst = allPos.slice(-3).reverse();

    var scoreColor = health.score >= 70 ? '#34c759' : health.score >= 40 ? '#ff9f0a' : '#ff3b30';

    var html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">' +
      '<title>Rapport Wealth — ' + monthLabel + '</title>' +
      '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Segoe UI",sans-serif;background:#f5f5f7;color:#1d1d1f;padding:40px;max-width:900px;margin:0 auto}' +
      'h1{font-size:32px;margin-bottom:8px}h2{font-size:20px;margin:32px 0 16px;border-bottom:2px solid #e5e5e7;padding-bottom:8px}' +
      '.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}' +
      '.card{background:#fff;border-radius:12px;padding:20px;border:1px solid #e5e5e7}' +
      '.label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:#6e6e73;margin-bottom:8px}' +
      '.value{font-size:24px;font-weight:300;letter-spacing:-0.5px}' +
      '.green{color:#34c759}.red{color:#ff3b30}.amber{color:#ff9f0a}' +
      'table{width:100%;border-collapse:collapse;font-size:14px;margin-top:12px}' +
      'td,th{padding:10px 12px;border-bottom:1px solid #e5e5e7;text-align:left}' +
      'th{font-size:11px;font-weight:500;text-transform:uppercase;color:#6e6e73}' +
      '.health-score{font-size:64px;font-weight:300;letter-spacing:-2px;color:' + scoreColor + '}' +
      '.quote-block{background:#fff;border-left:4px solid #0071e3;padding:20px 24px;border-radius:0 12px 12px 0;margin:24px 0;font-style:italic;font-size:16px}' +
      '.objective-block{background:#fff;border-radius:12px;padding:24px;border:1px solid #e5e5e7;margin-top:24px}' +
      'textarea{width:100%;border:1px solid #e5e5e7;border-radius:8px;padding:12px;font-size:14px;min-height:100px;font-family:inherit;margin-top:8px}' +
      '.print-btn{background:#0071e3;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;cursor:pointer;margin:20px 0}' +
      '@media print{.print-btn{display:none}}' +
      '</style></head><body>' +
      '<button class="print-btn" onclick="window.print()">🖨️ Imprimer / Sauvegarder PDF</button>' +
      '<h1>📊 Rapport Patrimonial — ' + monthLabel + '</h1>' +
      '<p style="color:#6e6e73;margin-bottom:24px">Généré le ' + now.toLocaleDateString('fr-FR', {weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</p>' +

      '<h2>Patrimoine</h2>' +
      '<div class="grid">' +
        '<div class="card"><div class="label">Total</div><div class="value">' + fmtRaw(totals.total) + '</div></div>' +
        '<div class="card"><div class="label">Investi</div><div class="value">' + fmtRaw(totals.invested) + '</div></div>' +
        '<div class="card"><div class="label">Plus-value</div><div class="value ' + (totals.pnl>=0?'green':'red') + '">' + (totals.pnl>=0?'+':'') + fmtRaw(totals.pnl) + '</div></div>' +
        '<div class="card"><div class="label">PEA</div><div class="value">' + fmtRaw(totals.pea) + '</div></div>' +
        '<div class="card"><div class="label">CTO</div><div class="value">' + fmtRaw(totals.cto) + '</div></div>' +
        '<div class="card"><div class="label">Crypto</div><div class="value amber">' + fmtRaw(totals.crypto) + '</div></div>' +
      '</div>' +

      '<h2>DCA</h2>' +
      '<p>DCA mensuel configuré : <strong>' + fmtRaw(dcaTotal) + '/mois</strong></p>' +

      '<h2>Meilleures positions</h2>' +
      '<table><thead><tr><th>Actif</th><th>+/- Valeur</th><th>Performance</th></tr></thead><tbody>' +
        best.map(function(p){ return '<tr><td>'+p.name+'</td><td class="'+(p.pnl>=0?'green':'red')+'">'+(p.pnl>=0?'+':'')+fmtRaw(p.pnl)+'</td><td class="'+(p.pct>=0?'green':'red')+'">'+(p.pct>=0?'+':'')+p.pct.toFixed(2)+'%</td></tr>'; }).join('') +
      '</tbody></table>' +

      '<h2>Positions à surveiller</h2>' +
      '<table><thead><tr><th>Actif</th><th>+/- Valeur</th><th>Performance</th></tr></thead><tbody>' +
        worst.map(function(p){ return '<tr><td>'+p.name+'</td><td class="'+(p.pnl>=0?'green':'red')+'">'+(p.pnl>=0?'+':'')+fmtRaw(p.pnl)+'</td><td class="'+(p.pct>=0?'green':'red')+'">'+(p.pct>=0?'+':'')+p.pct.toFixed(2)+'%</td></tr>'; }).join('') +
      '</tbody></table>' +

      '<h2>Score Santé Patrimoniale</h2>' +
      '<div class="card" style="text-align:center">' +
        '<div class="health-score">' + health.score + '</div>' +
        '<div style="font-size:14px;color:#6e6e73;margin-top:8px">/100 — ' + (health.score>=70?'Excellent':health.score>=40?'Correct':'À améliorer') + '</div>' +
      '</div>' +

      '<h2>Quote du mois</h2>' +
      (quote.text ? '<div class="quote-block">❝ ' + quote.text + '<br><br><strong>— ' + (quote.author||'') + '</strong></div>' : '') +

      '<h2>Objectif du mois suivant</h2>' +
      '<div class="objective-block"><label for="objective-text" style="font-size:13px;color:#6e6e73">Saisir votre objectif pour le mois prochain :</label>' +
      '<textarea id="objective-text" placeholder="Ex: Augmenter mon DCA de 100€, ouvrir un compte CTO, rééquilibrer crypto à 20%..."></textarea></div>' +

      '</body></html>';

    var win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  // ════════════════════════════════════
  // EXPAT SIMULATOR
  // ════════════════════════════════════
  window.renderExpatSimulator = function () {
    var dcaPct  = parseFloat((document.getElementById('expat-dca-pct')||{}).value) || 50;
    var years   = parseInt((document.getElementById('expat-years')||{}).value) || 10;
    var rate    = parseFloat((document.getElementById('expat-rate')||{}).value) || 8;
    var canvas  = document.getElementById('expat-chart');
    var tableEl = document.getElementById('expat-table-body');

    var scenarios = [
      { label: 'CDI France',               salary: 2200, taxRate: 0.40, color: '#6e6e73' },
      { label: 'Freelance France',          salary: 5000, taxRate: 0.45, color: '#0071e3' },
      { label: 'Expatriation Suisse/Lux',   salary: 7000, taxRate: 0.20, color: '#34c759' }
    ];

    function computeScenario(sc) {
      var netSalary = sc.salary * (1 - sc.taxRate);
      var dca       = netSalary * dcaPct / 100;
      var months    = years * 12;
      var r         = rate / 100;
      var fv        = dca * (Math.pow(1+r/12, months) - 1) / (r/12);
      var invested  = dca * months;
      var totalTax  = sc.salary * sc.taxRate * months;
      var fiAge     = 25; // assumption
      var targetCapital = netSalary * 12 / (r);
      var monthsToFI = Math.log(1 + targetCapital * r/12 / dca) / Math.log(1 + r/12);
      return {
        label: sc.label, color: sc.color,
        dca: dca, fv: fv, invested: invested, totalTax: totalTax,
        ageAtFI: Math.round(25 + monthsToFI / 12)
      };
    }

    var results = scenarios.map(computeScenario);

    if (tableEl) {
      tableEl.innerHTML = results.map(function(r) {
        return '<tr>' +
          '<td style="font-weight:500;color:' + r.color + '">' + r.label + '</td>' +
          '<td class="td-mono">' + fmtRaw(r.dca) + '/mois</td>' +
          '<td class="td-mono td-green">+' + fmtRaw(r.fv) + '</td>' +
          '<td class="td-mono td-red">-' + fmtRaw(r.totalTax) + '</td>' +
          '<td class="td-mono">' + r.ageAtFI + ' ans</td>' +
        '</tr>';
      }).join('');
    }

    // Draw comparison chart
    if (canvas) {
      var ctx = canvas.getContext('2d');
      var w = canvas.offsetWidth || 600;
      var h = 220;
      canvas.width = w; canvas.height = h;
      ctx.clearRect(0,0,w,h);

      var pts = years * 12 + 1;
      var allSeries = results.map(function(r) {
        return { color: r.color, data: [] };
      });

      for (var m = 0; m < pts; m++) {
        results.forEach(function(r, i) {
          var val = r.dca * (Math.pow(1+(rate/100)/12, m) - 1) / ((rate/100)/12);
          allSeries[i].data.push(val);
        });
      }

      var maxVal = Math.max.apply(null, allSeries[allSeries.length-1].data);
      var pad = { t: 10, r: 20, b: 30, l: 70 };
      var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;

      allSeries.forEach(function(s) {
        ctx.beginPath();
        s.data.forEach(function(v, i) {
          var x = pad.l + i/(pts-1)*iw;
          var y = pad.t + ih - (v/maxVal)*ih;
          i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        });
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Axes labels
      ctx.fillStyle = 'var(--text-secondary, #aeaeb2)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      for (var y2 = 0; y2 <= years; y2 += Math.ceil(years/5)) {
        var x2 = pad.l + y2/years*iw;
        ctx.fillText(new Date().getFullYear()+y2, x2, h-8);
      }
      ctx.textAlign = 'right';
      [0, 0.5, 1].forEach(function(f) {
        var yy = pad.t + ih - f*ih;
        ctx.fillText(Math.round(maxVal*f/1000)+'k', pad.l-6, yy+4);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    ['expat-dca-pct','expat-years','expat-rate'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', window.renderExpatSimulator);
    });
    renderExpatSimulator();
  });

  // ════════════════════════════════════
  // RETIREMENT CALCULATOR
  // ════════════════════════════════════
  window.calcRetirement = function () {
    var spendEl   = document.getElementById('retire-spend');
    var rateEl    = document.getElementById('retire-rate');
    var ageEl     = document.getElementById('retire-age');
    var dcaDeltaEl= document.getElementById('retire-dca-delta');
    var out       = document.getElementById('retire-output');

    var spend     = parseFloat(spendEl ? spendEl.value : 3000) || 3000;
    var rate      = parseFloat(rateEl  ? rateEl.value  : 7)   / 100 || 0.07;
    var currentAge= parseInt(ageEl     ? ageEl.value   : 25)        || 25;
    var dcaDelta  = parseFloat(dcaDeltaEl ? dcaDeltaEl.value : 0) || 0;
    if (!out) return;

    var totals   = getTotals();
    var dcaTotal = (window.STATE && window.STATE.dca ? window.STATE.dca.reduce(function(a,d){return a+(parseFloat(d.amount)||0);},0) : 0) + dcaDelta;
    var target   = spend * 12 / rate; // classic 4% rule equivalent

    // Months to reach target with current DCA + compound
    var mr = rate / 12;
    var pv = totals.total;
    var fv = target;
    var months;
    if (dcaTotal <= 0) {
      months = pv >= fv ? 0 : Math.log(fv/pv) / Math.log(1+mr);
    } else {
      // Binary search for months
      var lo = 0, hi = 600;
      while (hi - lo > 1) {
        var mid = Math.floor((lo+hi)/2);
        var val = pv * Math.pow(1+mr,mid) + dcaTotal * (Math.pow(1+mr,mid)-1)/mr;
        if (val >= fv) hi = mid; else lo = mid;
      }
      months = hi;
    }

    var ageAtRetire = currentAge + months/12;
    var yearsLeft   = months/12;
    var totalInvested= dcaTotal * months + totals.invested;
    var gain = target - totalInvested;

    // Impact of +100€/month
    var lo2 = 0, hi2 = 600;
    while (hi2 - lo2 > 1) {
      var mid2 = Math.floor((lo2+hi2)/2);
      var val2 = pv*Math.pow(1+mr,mid2) + (dcaTotal+100)*(Math.pow(1+mr,mid2)-1)/mr;
      if (val2 >= fv) hi2 = mid2; else lo2 = mid2;
    }
    var savedMonths = months - hi2;

    if (dcaDeltaEl) {
      var deltaLabel = document.getElementById('retire-dca-delta-val');
      if (deltaLabel) deltaLabel.textContent = (dcaDelta >= 0 ? '+' : '') + dcaDelta + '€/mois';
    }

    out.innerHTML =
      '<div class="retire-result">' +
        '<div class="retire-age">' + Math.round(ageAtRetire) + ' ans</div>' +
        '<div style="font-size:14px;color:var(--text-secondary);margin-top:4px">"Tu peux arrêter de travailler à ' + Math.round(ageAtRetire) + ' ans"</div>' +
      '</div>' +
      '<div class="retire-grid">' +
        '<div class="retire-metric"><div class="retire-metric-val">' + fmtRaw(target) + '</div><div class="retire-metric-lbl">Capital requis</div></div>' +
        '<div class="retire-metric"><div class="retire-metric-val">' + Math.round(yearsLeft) + ' ans</div><div class="retire-metric-lbl">Temps restant</div></div>' +
        '<div class="retire-metric"><div class="retire-metric-val td-green">' + (savedMonths > 0 ? '-' + savedMonths + ' mois' : 'Déjà atteint') + '</div><div class="retire-metric-lbl">Gain si +100€ DCA/mois</div></div>' +
      '</div>';
  };

  document.addEventListener('DOMContentLoaded', function () {
    ['retire-spend','retire-rate','retire-age','retire-dca-delta'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcRetirement);
    });
    calcRetirement();
  });

  // ════════════════════════════════════
  // STEALTH MODE
  // ════════════════════════════════════
  window.toggleStealth = function () {
    if (!window.STATE_V4) return;
    window.STATE_V4.stealthMode = !window.STATE_V4.stealthMode;
    saveV4State();
    var btn = document.getElementById('stealth-btn');
    if (btn) {
      btn.textContent = window.STATE_V4.stealthMode ? '🙈' : '👁';
      btn.title = window.STATE_V4.stealthMode ? 'Mode Stealth actif — Cliquer pour révéler' : 'Mode Stealth';
      btn.classList.toggle('stealth-active', window.STATE_V4.stealthMode);
    }
    // Re-render all monetary displays
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderAllPortfolioTabs === 'function') renderAllPortfolioTabs();
    if (typeof renderIncome === 'function') renderIncome();
    if (typeof showToast === 'function') {
      showToast(window.STATE_V4.stealthMode ? '🙈 Mode stealth activé' : '👁 Mode stealth désactivé', 'info');
    }
  };

  // Keyboard shortcut Cmd+Shift+H / Ctrl+Shift+H
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      toggleStealth();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Apply stealth mode on load
    if (window.STATE_V4 && window.STATE_V4.stealthMode) {
      var btn = document.getElementById('stealth-btn');
      if (btn) { btn.textContent = '🙈'; btn.classList.add('stealth-active'); }
    }
  });

  // ════════════════════════════════════
  // DECISION JOURNAL
  // ════════════════════════════════════
  window.addJournalEntry = function () {
    var dateEl   = document.getElementById('journal-date');
    var assetEl  = document.getElementById('journal-asset');
    var actionEl = document.getElementById('journal-action');
    var amountEl = document.getElementById('journal-amount');
    var theseEl  = document.getElementById('journal-these');
    var humeurEl = document.getElementById('journal-humeur');

    if (!assetEl || !assetEl.value.trim()) { if (assetEl) assetEl.classList.add('error'); return; }
    assetEl.classList.remove('error');

    var ticker = (assetEl.value.trim().toUpperCase().split(' ')[0]);
    var liveNow = typeof getCurrentPrice==='function' ? getCurrentPrice(ticker) : 0;

    addV4Item('journal', {
      date:   dateEl   ? dateEl.value   : new Date().toISOString().slice(0,10),
      asset:  assetEl.value.trim(),
      ticker: ticker,
      action: actionEl ? actionEl.value : 'achat',
      amount: parseFloat(amountEl ? amountEl.value : 0) || 0,
      these:  theseEl  ? theseEl.value.trim() : '',
      humeur: humeurEl ? humeurEl.value : '😐',
      priceAtEntry: liveNow
    });

    [dateEl, assetEl, amountEl, theseEl].forEach(function(el){ if(el) el.value=''; });
    if (dateEl) dateEl.value = new Date().toISOString().slice(0,10);
    renderJournal();
    if (typeof showToast === 'function') showToast('Décision enregistrée !', 'success');
  };

  window.renderJournal = function () {
    var items  = window.STATE_V4 ? window.STATE_V4.journal : [];
    var listEl = document.getElementById('journal-list');
    if (!listEl) return;

    if (!items || !items.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📔</div><div class="empty-state-text">Aucune décision enregistrée.</div></div>';
      return;
    }

    var sorted = items.slice().sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
    listEl.innerHTML = sorted.map(function(j) {
      var liveNow = typeof getCurrentPrice==='function' ? getCurrentPrice(j.ticker||'') : 0;
      var perf = '';
      if (j.priceAtEntry > 0 && liveNow > 0) {
        var pct = (liveNow - j.priceAtEntry) / j.priceAtEntry * 100;
        perf = '<span style="font-size:12px;color:' + (pct>=0?'var(--green)':'var(--red)') + ';margin-left:8px">' +
          (pct>=0?'+':'') + pct.toFixed(1) + '% depuis cette décision</span>';
      }
      return '<div class="journal-entry">' +
        '<div class="journal-header">' +
          '<div>' +
            '<span class="journal-humeur">' + (j.humeur||'😐') + '</span>' +
            '<span class="journal-asset">' + j.asset + '</span>' +
            '<span class="badge badge-' + (j.action==='achat'?'green':j.action==='vente'?'red':'gray') + '" style="margin-left:8px">' + j.action + '</span>' +
            perf +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<span style="font-size:12px;color:var(--text-tertiary)">' + j.date + '</span>' +
            '<span style="font-size:13px;font-weight:500">' + (j.amount ? fmtRaw(j.amount) : '') + '</span>' +
            '<button class="btn btn-ghost btn-sm" onclick="reviewJournal(\'' + j.id + '\')">Revoir</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="removeJournal(\'' + j.id + '\')">×</button>' +
          '</div>' +
        '</div>' +
        (j.these ? '<div class="journal-these">' + j.these + '</div>' : '') +
      '</div>';
    }).join('');
  };

  window.reviewJournal = function (id) {
    var items = window.STATE_V4 ? window.STATE_V4.journal : [];
    var j = items.find(function(x){ return x.id === id; });
    if (!j) return;
    var liveNow = typeof getCurrentPrice==='function' ? getCurrentPrice(j.ticker||'') : 0;
    var perfMsg = '';
    if (j.priceAtEntry > 0 && liveNow > 0) {
      var pct = (liveNow - j.priceAtEntry) / j.priceAtEntry * 100;
      perfMsg = '\n\nPerformance depuis : ' + (pct>=0?'+':'') + pct.toFixed(2) + '%';
    }
    alert('📔 Thèse originale (' + j.date + '):\n\n' + (j.these || '(Aucune thèse renseignée)') + perfMsg);
  };

  window.removeJournal = function (id) {
    removeV4Item('journal', id);
    renderJournal();
  };

  document.addEventListener('DOMContentLoaded', function () {
    var dateEl = document.getElementById('journal-date');
    if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().slice(0,10);
    renderJournal();
  });

  // ════════════════════════════════════
  // VAULT (Important info)
  // ════════════════════════════════════
  var VAULT_FIELDS = ['vault-pea-date','vault-livreta-date','vault-contract-num','vault-accountant-email','vault-notes'];

  window.saveVault = function () {
    if (!window.STATE_V4) return;
    VAULT_FIELDS.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) window.STATE_V4.vault[id] = el.value;
    });
    saveV4State();
    if (typeof showToast === 'function') showToast('Vault sauvegardé !', 'success');
  };

  window.exportVault = function () {
    if (!window.STATE_V4) return;
    var data = JSON.stringify(window.STATE_V4.vault, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url; a.download = 'wealth_vault_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Vault exporté !', 'success');
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.STATE_V4 || !window.STATE_V4.vault) return;
    VAULT_FIELDS.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && window.STATE_V4.vault[id]) el.value = window.STATE_V4.vault[id];
    });
  });

})();

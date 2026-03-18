/* ══════════════════════════════════════
   V4-COACH.JS — Weekly Coach: 3 automated actions
   ══════════════════════════════════════ */

(function () {

  function getISOWeek(d) {
    var date = new Date(d.getTime());
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return date.getFullYear() + '-W' + (1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7));
  }

  function checkWeekReset() {
    var sv4 = window.STATE_V4;
    if (!sv4) return;
    var currentWeek = getISOWeek(new Date());
    if (sv4.coachWeek !== currentWeek) {
      sv4.coachDone  = [];
      sv4.coachWeek  = currentWeek;
      saveV4State();
    }
  }

  function generateActions() {
    var s   = window.STATE    || {};
    var sv4 = window.STATE_V4 || {};
    var totals = getTotals();
    var actions = [];

    // 1. DCA not done this month
    var dcaTotal = (s.dca||[]).reduce(function(a,d){ return a+(parseFloat(d.amount)||0); }, 0);
    var now = new Date();
    var dayOfMonth = now.getDate();
    if (dcaTotal > 0 && dayOfMonth < 28) {
      actions.push({
        id: 'dca-reminder',
        icon: '💰',
        title: 'Investis ton DCA mensuel',
        desc: 'Tu as programmé ' + fmtRaw(dcaTotal) + '/mois. N\'oublie pas de valider avant le 31.',
        priority: 2
      });
    }

    // 2. BTC concentration > 60%
    var btcPos = (s.crypto||[]).filter(function(p){ return (p.ticker||p.name||'').toUpperCase().includes('BTC'); });
    var btcVal = btcPos.reduce(function(a,p){ return a+getCryptoCurrentValue(p); }, 0);
    if (totals.total > 0 && btcVal / totals.total > 0.60) {
      var btcPct = Math.round(btcVal/totals.total*100);
      actions.push({
        id: 'btc-concentration',
        icon: '⚖️',
        title: 'Rééquilibre : BTC surpondéré',
        desc: 'BTC représente ' + btcPct + '% de ton portfolio. Objectif ≤ 60%.',
        priority: 1
      });
    }

    // 3. Tax provision < 30% of gains
    var cryptoInv = (s.crypto||[]).reduce(function(a,p){
      var qty=parseFloat(p.quantity)||0, bp=parseFloat(p.buyPrice)||0;
      return a+(qty>0&&bp>0?qty*bp:parseFloat(p.invested)||0);
    }, 0);
    var cryptoCur = (s.crypto||[]).reduce(function(a,p){ return a+getCryptoCurrentValue(p); }, 0);
    var cryptoGains = Math.max(0, cryptoCur - cryptoInv);
    var requiredProv = cryptoGains * 0.30;
    var actualProv   = parseFloat(sv4.taxProvision)||0;
    if (cryptoGains > 500 && actualProv < requiredProv) {
      var missing = requiredProv - actualProv;
      actions.push({
        id: 'tax-provision',
        icon: '⚠️',
        title: 'Provisionne pour les impôts',
        desc: 'Mets de côté ' + fmtRaw(missing) + ' pour la fiscalité crypto (30% des plus-values).',
        priority: 1
      });
    }

    // 4. No update since 7 days
    var lastUpdate = parseInt(localStorage.getItem('wealth_last_update')||'0');
    if (Date.now() - lastUpdate > 7 * 24 * 3600 * 1000) {
      actions.push({
        id: 'update-positions',
        icon: '📊',
        title: 'Mets à jour tes positions',
        desc: 'Ton portfolio n\'a pas été mis à jour depuis plus de 7 jours. Vérifie tes valeurs.',
        priority: 3
      });
    }

    // 5. Fear & Greed signals
    var fng = window.FEAR_GREED_VALUE || 50;
    if (fng <= 25) {
      actions.push({
        id: 'fng-extreme-fear',
        icon: '🟢',
        title: 'Marché en peur extrême — opportunité DCA',
        desc: 'Fear & Greed = ' + fng + '. "Soyez avides quand les autres ont peur." — Buffett',
        priority: 1
      });
    } else if (fng >= 75) {
      actions.push({
        id: 'fng-extreme-greed',
        icon: '🔴',
        title: 'Euphorie détectée — prudence sur les achats',
        desc: 'Fear & Greed = ' + fng + '. "Soyez prudents quand les autres sont avides." — Buffett',
        priority: 2
      });
    }

    // 6. Health score < 60
    var healthScore = typeof computeHealthScore === 'function' ? computeHealthScore().score : 100;
    if (healthScore < 60) {
      actions.push({
        id: 'health-score',
        icon: '🏥',
        title: 'Score santé faible (' + healthScore + '/100)',
        desc: 'Ton score patrimonial est en dessous de 60. Consulte les détails sur le dashboard.',
        priority: 2
      });
    }

    // Sort by priority and take top 3
    actions.sort(function(a,b){ return a.priority - b.priority; });
    return actions.slice(0,3);
  }

  window.renderCoach = function () {
    var coachEl = document.getElementById('coach-cards');
    if (!coachEl) return;

    checkWeekReset();
    var sv4 = window.STATE_V4 || {};
    var done = sv4.coachDone || [];
    var actions = generateActions();

    // Fill with defaults if < 3
    var defaults = [
      { id: 'default-review', icon: '📈', title: 'Révise ta stratégie', desc: 'Prends 5 minutes pour vérifier que ton allocation correspond à tes objectifs.' },
      { id: 'default-learn',  icon: '📚', title: 'Continue à apprendre', desc: 'Lis un article sur l\'investissement. La connaissance est ton meilleur actif.' },
      { id: 'default-dca',    icon: '🎯', title: 'Reste focus sur le long terme', desc: 'Les marchés fluctuent. Ton DCA régulier est plus fort que tout market timing.' }
    ];
    while (actions.length < 3) {
      actions.push(defaults[actions.length % defaults.length]);
    }

    coachEl.innerHTML = actions.map(function(a) {
      var isDone = done.indexOf(a.id) !== -1;
      return '<div class="coach-card ' + (isDone ? 'coach-card-done' : '') + '">' +
        '<div class="coach-card-icon">' + a.icon + '</div>' +
        '<div class="coach-card-content">' +
          '<div class="coach-card-title">' + a.title + '</div>' +
          '<div class="coach-card-desc">' + a.desc + '</div>' +
        '</div>' +
        '<button class="btn ' + (isDone ? 'btn-ghost' : 'btn-primary') + ' btn-sm coach-done-btn" ' +
          'onclick="markCoachDone(\'' + a.id + '\')">' +
          (isDone ? '✅ Fait' : 'Marquer comme fait') +
        '</button>' +
      '</div>';
    }).join('');
  };

  window.markCoachDone = function (id) {
    var sv4 = window.STATE_V4;
    if (!sv4) return;
    if (sv4.coachDone.indexOf(id) === -1) {
      sv4.coachDone.push(id);
    } else {
      sv4.coachDone = sv4.coachDone.filter(function(x){ return x !== id; });
    }
    saveV4State();
    renderCoach();
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Track last update time
    localStorage.setItem('wealth_last_update', Date.now().toString());
    checkWeekReset();
    // Render coach after a short delay to let other modules initialize
    setTimeout(renderCoach, 1000);
    // Refresh every 5 minutes
    setInterval(renderCoach, 300000);
  });

})();

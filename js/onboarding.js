/* ══════════════════════════════════════
   ONBOARDING.JS — 3 étapes premier lancement
   ══════════════════════════════════════ */
(function () {
  var OB_KEY = 'wealth_onboarded_v2';
  var step = 0;

  function shouldShow() { return !localStorage.getItem(OB_KEY); }
  function markDone() { localStorage.setItem(OB_KEY, '1'); }

  var STEPS = [
    {
      title: 'Bienvenue sur <em>WEALTH</em>',
      subtitle: 'Ton tableau de bord patrimonial premium',
      body: function () {
        return '<div class="ob-welcome">' +
          '<div class="ob-logo-big">W</div>' +
          '<p class="ob-desc">Track ton patrimoine en temps réel. PEA, CTO, Crypto, Immobilier — tout au même endroit. Prêt à construire ta richesse&nbsp;?</p>' +
          '<div class="ob-goals">' +
            ['💰 Investir intelligemment', '🎯 Liberté financière', '📊 Suivre ma progression', '🏆 Construire ma richesse'].map(function (g) {
              return '<div class="ob-goal-chip">' + g + '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      },
      onShow: function () {
        document.querySelectorAll('.ob-goal-chip').forEach(function (el) {
          el.addEventListener('click', function () {
            document.querySelectorAll('.ob-goal-chip').forEach(function (c) { c.classList.remove('selected'); });
            this.classList.add('selected');
          });
        });
      }
    },
    {
      title: 'Ton DCA <em>mensuel</em>',
      subtitle: 'Le montant que tu investis chaque mois automatiquement',
      body: function () {
        return '<div class="ob-dca">' +
          '<div class="ob-dca-amount" id="ob-dca-display">600 €</div>' +
          '<input type="range" id="ob-dca-range" min="50" max="3000" step="50" value="600" style="width:100%;margin:20px 0">' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-tertiary);margin-top:-12px"><span>50€</span><span>3 000€</span></div>' +
          '<div class="ob-proj-box">' +
            '<div class="ob-proj-label">Dans 10 ans à 10%/an</div>' +
            '<div class="ob-proj-big" id="ob-proj-val">124 000 €</div>' +
            '<div class="ob-proj-sub" id="ob-proj-sub">soit 2,4x ton capital investi</div>' +
          '</div>' +
        '</div>';
      },
      onShow: function () {
        var range = document.getElementById('ob-dca-range');
        var display = document.getElementById('ob-dca-display');
        var projVal = document.getElementById('ob-proj-val');
        var projSub = document.getElementById('ob-proj-sub');
        function update() {
          var v = parseInt(range.value);
          display.textContent = v.toLocaleString('fr-FR') + ' €';
          var fv = typeof computeFV === 'function' ? computeFV(v, 0.10, 120, 0) : v * 120 * 2;
          var inv = v * 120;
          projVal.textContent = Math.round(fv).toLocaleString('fr-FR') + ' €';
          projSub.textContent = 'soit ' + (fv / inv).toFixed(1) + 'x ton capital investi';
        }
        range.addEventListener('input', update);
        update();
      }
    },
    {
      title: 'Ajoute ta <em>première position</em>',
      subtitle: 'ETF, action ou crypto — commence par ce que tu as déjà',
      body: function () {
        return '<div class="ob-form">' +
          '<div class="ob-field"><label>Actif</label><input id="ob-name" class="ob-input" placeholder="ex: CW8 MSCI World, BTC..."></div>' +
          '<div class="ob-2col">' +
            '<div class="ob-field"><label>Investi (€)</label><input id="ob-inv" type="number" class="ob-input" placeholder="0"></div>' +
            '<div class="ob-field"><label>Valeur actuelle (€)</label><input id="ob-cur" type="number" class="ob-input" placeholder="0"></div>' +
          '</div>' +
          '<div class="ob-field"><label>Catégorie</label>' +
            '<select id="ob-cat" class="ob-input">' +
              '<option value="pea">PEA</option><option value="cto">CTO</option>' +
              '<option value="crypto">Crypto</option>' +
            '</select>' +
          '</div>' +
          '<p class="ob-hint">Tu peux ignorer cette étape et ajouter tes positions plus tard depuis Portfolio.</p>' +
        '</div>';
      },
      onShow: function () { setTimeout(function () { var el = document.getElementById('ob-name'); if (el) el.focus(); }, 80); }
    }
  ];

  function pct() { return Math.round((step + 1) / STEPS.length * 100); }

  function render() {
    var body = document.getElementById('ob-body');
    var progress = document.getElementById('ob-progress');
    var stepLabel = document.getElementById('ob-step-lbl');
    var nextBtn = document.getElementById('ob-next');
    var prevBtn = document.getElementById('ob-prev');
    var title = document.getElementById('ob-title');
    var sub = document.getElementById('ob-sub');
    if (!body) return;

    if (progress) progress.style.width = pct() + '%';
    if (stepLabel) stepLabel.textContent = 'Étape ' + (step + 1) + ' / ' + STEPS.length;
    if (nextBtn) nextBtn.textContent = step === STEPS.length - 1 ? 'Commencer ✓' : 'Suivant →';
    if (prevBtn) prevBtn.style.visibility = step > 0 ? 'visible' : 'hidden';
    if (title) title.innerHTML = STEPS[step].title;
    if (sub) sub.textContent = STEPS[step].subtitle;

    body.style.opacity = '0';
    body.style.transform = 'translateX(16px)';
    body.innerHTML = STEPS[step].body();
    setTimeout(function () {
      body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      body.style.opacity = '1';
      body.style.transform = 'translateX(0)';
    }, 20);

    if (STEPS[step].onShow) STEPS[step].onShow();
  }

  function saveCurrentStep() {
    if (step === 1) {
      var range = document.getElementById('ob-dca-range');
      if (range && window.STATE && STATE.dca.length === 0 && typeof addPosition === 'function') {
        var v = parseInt(range.value);
        addPosition('dca', { cat: 'PEA', asset: 'CW8 MSCI World', amount: Math.round(v * 0.7), day: 1 });
        addPosition('dca', { cat: 'Crypto', asset: 'BTC', amount: Math.round(v * 0.2), day: 5 });
      }
    }
    if (step === 2) {
      var name = document.getElementById('ob-name');
      var inv = document.getElementById('ob-inv');
      var cur = document.getElementById('ob-cur');
      var cat = document.getElementById('ob-cat');
      if (name && name.value.trim() && cur && parseFloat(cur.value) > 0 && typeof addPosition === 'function') {
        addPosition(cat.value, { name: name.value.trim(), invested: parseFloat(inv.value) || 0, current: parseFloat(cur.value) });
      }
    }
  }

  function next() {
    saveCurrentStep();
    if (step < STEPS.length - 1) { step++; render(); }
    else finish();
  }

  function prev() { if (step > 0) { step--; render(); } }

  function finish() {
    saveCurrentStep();
    markDone();
    var overlay = document.getElementById('ob-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s';
      setTimeout(function () { overlay.remove(); }, 420);
    }
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderAllPortfolioTabs === 'function') renderAllPortfolioTabs();
    if (typeof showToast === 'function') showToast('Bienvenue sur WEALTH ! 🎉', 'success');
  }

  function start() {
    if (!shouldShow()) return;
    var overlay = document.createElement('div');
    overlay.id = 'ob-overlay';
    overlay.className = 'ob-overlay';
    overlay.innerHTML =
      '<div class="ob-modal">' +
        '<div class="ob-header">' +
          '<div class="ob-progress-track"><div class="ob-progress-fill" id="ob-progress" style="width:33%"></div></div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">' +
            '<span class="ob-step-lbl" id="ob-step-lbl">Étape 1 / 3</span>' +
            '<button class="ob-skip" id="ob-skip">Ignorer</button>' +
          '</div>' +
        '</div>' +
        '<div class="ob-top">' +
          '<h2 class="ob-title" id="ob-title"></h2>' +
          '<p class="ob-sub" id="ob-sub"></p>' +
        '</div>' +
        '<div class="ob-body" id="ob-body"></div>' +
        '<div class="ob-footer">' +
          '<button class="btn-sm" id="ob-prev" style="visibility:hidden">← Précédent</button>' +
          '<button class="btn btn-primary" id="ob-next">Suivant →</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById('ob-skip').addEventListener('click', finish);
    document.getElementById('ob-next').addEventListener('click', next);
    document.getElementById('ob-prev').addEventListener('click', prev);
    step = 0;
    render();
    setTimeout(function () {
      overlay.style.opacity = '1';
      overlay.style.transition = 'opacity 0.35s ease';
    }, 10);
  }

  window.startOnboarding = start;
  window.finishOnboarding = finish;
})();

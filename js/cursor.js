/* ══════════════════════════════════════
   CURSOR.JS — Curseur personnalisé avec lag
   ══════════════════════════════════════ */
(function () {
  // Touch devices: skip
  if ('ontouchstart' in window || navigator.maxTouchPoints > 1) return;

  var dot = document.createElement('div');
  var ring = document.createElement('div');
  dot.id = 'cursor-dot';
  ring.id = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  var mx = -200, my = -200;
  var rx = -200, ry = -200;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.transform = 'translate(' + (rx - 20) + 'px,' + (ry - 20) + 'px)';
    requestAnimationFrame(animateRing);
  })();

  // Grow on interactive elements
  var INTERACTIVE = 'button,a,input,select,textarea,.catalog-item,.metric-card,.nav-link,.btn,.pill,.inner-tab,.quote-dot,.theme-option,.cmd-item,.card-hover';
  document.addEventListener('mouseover', function (e) {
    ring.classList.toggle('cursor-hover', !!e.target.closest(INTERACTIVE));
  });
  document.addEventListener('mousedown', function () { ring.classList.add('cursor-click'); });
  document.addEventListener('mouseup', function () { ring.classList.remove('cursor-click'); });
  document.addEventListener('mouseleave', function () {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity = '1';
    ring.style.opacity = '0.5';
  });
})();

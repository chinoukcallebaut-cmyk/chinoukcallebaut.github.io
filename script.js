/* ============================================================
   Creative Automation — V2
   Eén geregisseerd moment bij het laden, daarna beweegt er
   alleen iets als de bezoeker iets doet.
   ============================================================ */

(function () {
  'use strict';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = motionQuery.matches;

  // pas als JS draait mag de hero verborgen beginnen
  document.documentElement.classList.add('js');

  var hero = document.querySelector('.hero');

  function startHero() {
    if (hero) hero.classList.add('is-on');
  }

  // meteen na de eerste frame, zodat een traag lettertype de titel
  // nooit onzichtbaar houdt; de timer is het vangnet
  requestAnimationFrame(function () { requestAnimationFrame(startHero); });
  setTimeout(startHero, 1200);

  /* ---------- parallax: de stapel loopt uit elkaar ---------- */
  /* De zwarte regel vooraan schuift het verst mee, de bleekste
     achteraan nauwelijks — zo krijgt de stapel diepte.          */

  var runs = Array.prototype.slice.call(document.querySelectorAll('.hero .run'));
  var depths = [0, 34, 60, 82, 100];   // pixels verschuiving over de hele hero

  function parallax() {
    if (reduceMotion || !hero || !runs.length) return;

    var box = hero.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) return;  // buiten beeld

    // 0 bovenaan de pagina, 1 wanneer de hero net uit beeld is
    var p = Math.min(Math.max(-box.top / (box.height || 1), 0), 1);

    // op smalle schermen is er minder lucht onder de stapel
    var scale = window.innerWidth < 640 ? 0.5 : 1;

    runs.forEach(function (run, i) {
      run.style.transform =
        'translate3d(0,' + (p * depths[i] * scale).toFixed(2) + 'px,0)';
    });
  }

  /* ---------- welk hoofdstuk is in beeld? ------------------ */

  var links = Array.prototype.slice.call(
    document.querySelectorAll('.dots a[href^="#"]')
  );

  var here = document.getElementById('here');

  var targets = links
    .map(function (link) {
      var el = document.querySelector(link.getAttribute('href'));
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  function mark(link) {
    links.forEach(function (other) {
      if (other === link) other.setAttribute('aria-current', 'true');
      else other.removeAttribute('aria-current');
    });

    if (here) {
      var label = link && link.querySelector('.dots__label');
      here.textContent = label ? label.textContent : '';
    }
  }

  function update() {
    if (!targets.length) return;

    var offset = (parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--bar-h')) || 3.5) * 16 + 8;

    var current = null;

    targets.forEach(function (t) {
      if (t.el.getBoundingClientRect().top - offset <= 0) current = t.link;
    });

    if (window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2) {
      current = targets[targets.length - 1].link;
    }

    if (current) mark(current);
    else {
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
      if (here) here.textContent = '';
    }
  }

  var queued = false;

  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      parallax();
      update();
    });
  }

  // wie onderweg beweging uitzet, ziet de stapel meteen stilvallen
  motionQuery.addEventListener('change', function (e) {
    reduceMotion = e.matches;
    if (reduceMotion) runs.forEach(function (run) { run.style.transform = ''; });
    else parallax();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// Motion: exploded-burger scroll scene, scroll reveals and number count-ups.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  if (reduce) { root.classList.add('reduce'); }

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* ---------- Exploded burger ---------- */
  var split = document.querySelector('.split');
  if (split) {
    var stage = split.querySelector('.split-burger');
    var layers = [].slice.call(split.querySelectorAll('.layer'));
    var whole = split.querySelector('.whole');
    var tags = [].slice.call(split.querySelectorAll('.tag'));
    var count = document.getElementById('split-count');
    var hint = split.querySelector('.split-hint');

    var drawSplit = function () {
      var rect = split.getBoundingClientRect();
      var travel = split.offsetHeight - window.innerHeight;
      var raw = reduce ? 1 : clamp(-rect.top / Math.max(travel, 1), 0, 1);
      var p = ease(clamp(raw / 0.8, 0, 1));            // finish splitting before the end
      var h = stage.offsetHeight;
      var gap = h * 0.11;
      layers.forEach(function (el, i) {
        el.style.transform = 'translate3d(0,' + ((i - 2) * gap * p).toFixed(1) + 'px,0)';
      });
      whole.style.opacity = p > 0.004 ? 0 : 1;
      tags.forEach(function (el, i) {
        var y = parseFloat(el.getAttribute('data-y')) / 100 * h + (i - 2) * gap * p;
        var show = clamp((p - 0.25 - i * 0.1) * 5, 0, 1);
        el.style.top = y.toFixed(1) + 'px';
        el.style.opacity = show;
        el.style.setProperty('--slide', ((1 - show) * 16).toFixed(1) + 'px');
      });
      count.textContent = Math.round(39 * clamp(p * 1.15, 0, 1));
      if (hint) hint.style.opacity = 1 - clamp(p * 3, 0, 1);
    };
    var ticking = false;
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; drawSplit(); }); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    drawSplit();
  }

  /* ---------- Scroll reveals ---------- */
  var groups = document.querySelectorAll('.grid-3, .grid-5, .beast-options, .promise ul, .yd, .order dl, .cats-inner');
  groups.forEach(function (g) {
    [].forEach.call(g.children, function (el, i) {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', (i * 80) + 'ms');
    });
  });
  document.querySelectorAll('.sec-head, .promo, .beast-copy > h2, .beast-img, .build-head, .promise h2, .order h2').forEach(function (el) {
    el.setAttribute('data-reveal', '');
  });

  /* ---------- Count-ups ---------- */
  function countUp(el) {
    var target = parseInt(el.textContent, 10);
    if (isNaN(target) || reduce) return;
    var suffix = el.textContent.replace(/^[\d,]+/, '');
    var t0 = null, dur = 900;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = clamp((ts - t0) / dur, 0, 1);
      el.textContent = Math.round(target * ease(k)) + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window) || reduce) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('.pro b, .opt-pro b').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
})();

/* Home C runtime (progressive enhancement; the page works without it). Three things:
   1. the header ghost: adds .wave to the logo link on mouseenter, focus or touchstart; CSS keyframes play once and
      the class is removed on animationend, so it cannot stick;
   2. the 3D cassette: tilts toward the cursor (rAF + lerp, about ±18°), drag spins it further (±40°, pointer events,
      touch drags only), eases back to its resting angle on release;
   3. a slim tape-coloured reading-progress line under the top edge.
   Reduced motion: no ghost animation and no tracking; the cassette keeps its fixed resting angle from the CSS. */
(function () {
  var d = document.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // ---- 1. header ghost ----
  var brand = document.getElementById('brand');
  if (brand) {
    var box = brand.querySelector('.strip-box'), lastTouch = 0, timer = 0;
    var stop = function () { brand.classList.remove('wave'); clearTimeout(timer); timer = 0; };
    var go = function (e) {
      if (reduce.matches) return;
      if (e.type === 'touchstart') lastTouch = Date.now();
      else if (e.type === 'mouseenter' && Date.now() - lastTouch < 700) return; // the emulated mouseenter after a tap
      stop(); void box.offsetWidth; brand.classList.add('wave');
      timer = setTimeout(stop, 1600); // safety net if animationend never fires
    };
    brand.addEventListener('mouseenter', go);
    brand.addEventListener('focus', go);
    brand.addEventListener('touchstart', go, { passive: true });
    brand.addEventListener('animationend', function (e) { if (e.target.classList.contains('sl-ghost')) stop(); });
  }

  // ---- 2. the 3D cassette ----
  var cas = document.querySelector('[data-cassette]');
  if (cas && !reduce.matches && 'PointerEvent' in window) {
    var REST = { x: 4, y: -8 }, MAXT = 18, MAXD = 40, K = 0.11;
    var cur = { x: REST.x, y: REST.y }, tgt = { x: REST.x, y: REST.y }, raf = 0, drag = null, hover = false;
    var hero = cas.closest('.hero') || cas;
    var clamp = function (v, m) { return v > m ? m : v < -m ? -m : v; };
    var paint = function () {
      var st = cas.style;
      st.setProperty('--rx', cur.x.toFixed(2) + 'deg'); st.setProperty('--ry', cur.y.toFixed(2) + 'deg');
      // the sheen slides toward the side that turns to face the viewer; the floor shadow slides the other way
      st.setProperty('--sx', (50 + cur.y / MAXT * 28).toFixed(1) + '%'); st.setProperty('--sy', (36 - cur.x / MAXT * 26).toFixed(1) + '%');
      st.setProperty('--shx', (-cur.y * 0.45).toFixed(1) + '%'); st.setProperty('--shy', (cur.x * 0.3).toFixed(1) + '%');
    };
    var tick = function () {
      cur.x += (tgt.x - cur.x) * K; cur.y += (tgt.y - cur.y) * K; paint();
      if (drag || Math.abs(tgt.x - cur.x) > 0.02 || Math.abs(tgt.y - cur.y) > 0.02) raf = requestAnimationFrame(tick);
      else { cur.x = tgt.x; cur.y = tgt.y; paint(); raf = 0; }
    };
    var kick = function () { if (!raf) raf = requestAnimationFrame(tick); };
    var rest = function () { tgt.x = REST.x; tgt.y = REST.y; kick(); };
    var aim = function (e) {
      if (drag) return;
      var r = cas.getBoundingClientRect();
      var dx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), 1.25), dy = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), 1.25);
      tgt.y = REST.y + dx * MAXT; tgt.x = REST.x - dy * MAXT; kick();
    };
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; hover = true; aim(e); });
    hero.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'mouse') return; hover = false; if (!drag) rest(); });
    cas.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, bx: cur.x, by: cur.y };
      try { cas.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
      cas.classList.add('is-drag'); if (e.pointerType === 'mouse') e.preventDefault(); kick();
    });
    cas.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      tgt.y = clamp(drag.by + (e.clientX - drag.x) * 0.28, MAXD); tgt.x = clamp(drag.bx - (e.clientY - drag.y) * 0.28, MAXD); kick();
    });
    var end = function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null; cas.classList.remove('is-drag');
      if (hover && e.pointerType === 'mouse') aim(e); else rest();
    };
    cas.addEventListener('pointerup', end); cas.addEventListener('pointercancel', end);
    cas.addEventListener('dragstart', function (e) { e.preventDefault(); });
    cas.classList.add('is-live'); paint();
  }

  // ---- 3. reading progress ----
  var prog = document.querySelector('.hc-prog i');
  if (prog) {
    var pr = 0;
    var pp = function () { pr = 0; var max = d.scrollHeight - innerHeight; prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0).toFixed(4) + ')'; };
    addEventListener('scroll', function () { if (!pr) pr = requestAnimationFrame(pp); }, { passive: true });
    addEventListener('resize', pp); pp();
  }
})();

/* Spectre Brands page runtime: reading progress, reveal, grouped section nav, story stage,
   archive tabs, timeline filters, what-if tabs, cause-of-death bars and homepage filters. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const once = (el, f, th = 0.2) => { if (!el) return; const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { f(); io.disconnect(); } }, { threshold: th }); io.observe(el); };
  window.BO = Object.assign(window.BO || {}, { $, $$, once, data: (() => { const n = $('#bo-data'); return n ? JSON.parse(n.textContent) : {}; })() });

  const pr = $('#prog');
  addEventListener('scroll', () => { const h = document.documentElement; if (pr) pr.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%'; }, { passive: true });
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } }), { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });
  $$('.rv').forEach(el => rv.observe(el));

  // grouped section nav: dropdowns + scroll spy
  const nav = $('#pagenav');
  if (nav) {
    const close = except => $$('.pn-g').forEach(g => { if (g !== except) { g.classList.remove('open'); const b = g.querySelector('button.pn-btn'); b && b.setAttribute('aria-expanded', 'false'); } });
    $$('.pn-g:not(.single) > .pn-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const g = b.parentNode, open = !g.classList.contains('open'); close(g); g.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open)); }));
    $$('.pn-menu a, .pn-g.single a').forEach(a => a.addEventListener('click', () => close()));
    document.addEventListener('click', () => close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    const label = {}; $$('#pagenav a[data-sec]').forEach(a => label[a.dataset.sec] = a.textContent);
    label.overview = 'Overview';
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const id = e.target.id;
      $('#pnNow').textContent = label[id] || '';
      $$('#pagenav a[data-sec]').forEach(a => a.classList.toggle('on', a.dataset.sec === id));
      const grp = ($(`#pagenav a[data-sec="${id}"]`) || {}).closest?.('.pn-g');
      $$('.pn-g').forEach(g => g.classList.toggle('cur', g === grp));
    }), { rootMargin: '-40% 0px -55% 0px' });
    $$('main > section[id], main > header[id]').forEach(s => spy.observe(s));
  }

  // story stage
  const ch = $$('.chap'), tot = ch.length;
  if (tot) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const d = e.target.dataset;
      $('#stN').textContent = `Chapter ${d.n} of ${tot}`; $('#stBig').textContent = d.big; $('#stBig').style.color = d.color || ''; $('#stCap').innerHTML = d.cap; $('#stBar').style.width = d.bar + '%';
      const art = $('#stArt'); if (art) art.style.transform = `translateY(${(d.n - 1) * 6}px) rotate(${(d.n - Math.ceil(tot / 2)) * 2}deg)`;
      ch.forEach(c => c.classList.toggle('active', c === e.target));
    }), { rootMargin: '-40% 0px -50% 0px' });
    ch.forEach(c => io.observe(c));
  }

  // archive tabs
  $$('#wbStrip button').forEach(b => b.addEventListener('click', () => {
    $$('#wbStrip button').forEach(x => x.classList.toggle('on', x === b));
    $$('.wb-view').forEach(v => v.hidden = v.dataset.i !== b.dataset.i);
  }));

  // timeline filter
  $$('#tlf .chip').forEach(c => c.addEventListener('click', () => {
    $$('#tlf .chip').forEach(x => x.classList.toggle('on', x === c));
    const f = c.dataset.f; $$('#tlv .ev').forEach(e => e.classList.toggle('hide', f !== 'all' && e.dataset.cat !== f));
  }));

  // what-if tabs
  $$('#forkTabs button').forEach(b => b.addEventListener('click', () => {
    $$('#forkTabs button').forEach(x => x.classList.toggle('on', x === b));
    $$('.fork-panel').forEach((p, i) => p.classList.toggle('on', i === +b.dataset.i));
  }));

  // cause of death
  $$('.cod-top').forEach(b => b.addEventListener('click', () => { const r = b.parentNode, o = !r.classList.contains('open'); r.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); }));
  once($('#cod'), () => $$('.cod-bar span').forEach((s, i) => setTimeout(() => s.style.width = s.dataset.w + '%', i * 160)));

  // homepage filters
  const idx = $('#idx');
  if (idx) {
    const st = { tier: 'all', cat: 'all' };
    const apply = () => {
      let shown = 0;
      $$('#idx .entry').forEach(e => {
        const soon = e.dataset.tier === 'soon';
        const ok = (st.cat === 'all' || e.dataset.cat === st.cat) && (soon ? st.tier === 'all' : (st.tier === 'all' || e.dataset.tier === st.tier));
        e.classList.toggle('hide', !ok); if (ok) shown++;
      });
      $('#empty').classList.toggle('on', !shown);
    };
    $$('.filters .chip').forEach(c => c.addEventListener('click', () => {
      $$(`.filters .chip[data-g="${c.dataset.g}"]`).forEach(x => x.classList.toggle('on', x === c));
      st[c.dataset.g] = c.dataset.v; apply();
    }));
  }
})();

/* Spectre Brands runtime. One small deferred file for every page: reveal-on-scroll, counters, menus,
   search, section nav, tabs, video facades, the compare slider, tooltips and the homepage filters.
   Chart.js and the map libraries are loaded only on pages that need them, when they scroll near. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V = '__V__';
  const loaded = {};
  const load = src => loaded[src] || (loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src + V; s.onload = res; s.onerror = rej; document.head.appendChild(s); }));
  const near = (el, f, margin = '500px 0px') => { if (!el) return; const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); f(); } }, { rootMargin: margin }); io.observe(el); };
  const dataEl = $('#bo-data');
  window.BO = { $, $$, reduce, load, data: dataEl ? JSON.parse(dataEl.textContent) : {} };

  // ---- reveal on scroll (content is visible without JS; see .js .rv in base.css) ----
  const targets = $$('.rv, .info, .cod');
  if ('IntersectionObserver' in window && !reduce) {
    const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } }), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => rv.observe(el));
  } else targets.forEach(el => el.classList.add('in'));

  // ---- counters: tick up to the printed figure the first time it is seen ----
  if (!reduce) {
    const tick = el => {
      const full = el.dataset.count, m = full.match(/\d[\d,]*\.?\d*/);
      if (!m) return;
      const raw = m[0], target = parseFloat(raw.replace(/,/g, '')), dec = (raw.split('.')[1] || '').length, commas = raw.includes(',');
      if (!isFinite(target) || target === 0 || /^(19|20)\d\d$/.test(raw)) return; // leave years alone
      const pre = full.slice(0, m.index), post = full.slice(m.index + raw.length), t0 = performance.now(), dur = 1100;
      el.style.minWidth = el.offsetWidth + 'px';
      const frame = now => {
        const p = Math.min(1, (now - t0) / dur), v = target * (1 - Math.pow(1 - p, 3));
        el.textContent = pre + (commas ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec)) + post;
        if (p < 1) requestAnimationFrame(frame); else { el.textContent = full; el.style.minWidth = ''; }
      };
      requestAnimationFrame(frame);
    };
    const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cio.unobserve(e.target); tick(e.target); } }), { threshold: 0.6 });
    $$('[data-count]').forEach(el => cio.observe(el));
  }

  // ---- menus: site dropdown, mobile menu, grouped section nav ----
  const closeAll = except => $$('.dd.open, .pn-g.open').forEach(g => { if (g !== except) { g.classList.remove('open'); $('button', g)?.setAttribute('aria-expanded', 'false'); } });
  $$('.dd-btn, .pn-g:not(.single) > .pn-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const g = b.parentNode, open = !g.classList.contains('open'); closeAll(g); g.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open)); }));
  document.addEventListener('click', () => closeAll());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const o = $('.dd.open, .pn-g.open'); if (o) { closeAll(); $('button', o)?.focus(); } } });
  $$('.pn-menu a, .pn-g.single a').forEach(a => a.addEventListener('click', () => closeAll()));
  const menuBtn = $('#menuBtn'), mnav = $('#mnav');
  if (menuBtn) menuBtn.addEventListener('click', () => { const open = mnav.hidden; mnav.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); });

  // ---- search (command palette). "/" or Ctrl/Cmd+K opens it. ----
  const dlg = $('#cmdk');
  if (dlg && dlg.showModal) {
    const q = $('#cmdkQ'), list = $('#cmdkList'), empty = $('#cmdkEmpty');
    let items = null, sel = 0, shown = [];
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const render = () => {
      const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
      shown = (items || []).map(x => { const hay = [x.n, x.t, x.c, x.y, x.d, x.k, x.b, x.p].join(' ').toLowerCase(); const name = x.n.toLowerCase(); if (!terms.every(t => hay.includes(t))) return null; return [terms.reduce((a, t) => a + (name.startsWith(t) ? 3 : name.includes(t) ? 2 : 0), 0), x]; }).filter(Boolean).sort((a, b) => b[0] - a[0]).map(x => x[1]).slice(0, 30);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = shown.map((x, i) => `<li role="option" id="cmdk-${i}" aria-selected="${i === sel}"><a href="${x.u}" tabindex="-1"><b>${esc(x.n)}</b><span>${esc([x.c, x.y, x.k].filter(Boolean).join(' · ') || x.b)}</span><em>${esc(x.t)}</em></a></li>`).join('');
      empty.hidden = shown.length > 0 || !items;
      q.setAttribute('aria-activedescendant', shown.length ? 'cmdk-' + sel : '');
    };
    const open = () => { if (dlg.open) return; dlg.showModal(); q.value = ''; sel = 0; q.focus(); if (!items) fetch('/search.json' + V).then(r => r.json()).then(d => { items = d; render(); }).catch(() => { items = []; render(); }); else render(); };
    $$('[data-search]').forEach(b => b.addEventListener('click', open));
    $('[data-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    q.addEventListener('input', () => { sel = 0; render(); });
    q.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % (shown.length || 1); render(); $('#cmdk-' + sel)?.scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter' && shown[sel]) location.href = shown[sel].u;
    });
    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); open(); }
    });
  }

  // ---- reading progress, one segment per act, + section spy ----
  const segs = $$('#prog i');
  if (segs.length) {
    const starts = segs.map(s => document.getElementById(s.dataset.at));
    let raf = 0;
    const paint = () => {
      raf = 0;
      const y = scrollY + innerHeight * .4, tops = starts.map(e => e ? e.getBoundingClientRect().top + scrollY : Infinity), end = document.documentElement.scrollHeight - innerHeight * .6;
      segs.forEach((s, i) => { s.firstChild.style.transform = `scaleX(${Math.max(0, Math.min(1, (y - tops[i]) / ((tops[i + 1] ?? end) - tops[i])))})`; });
      $('#pnAct').textContent = `Part ${Math.max(1, tops.filter(t => y >= t).length)} of ${segs.length}`;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    paint();
  }
  // people, press and data notes fold away on a phone; they stay open on larger screens and without JS
  if (matchMedia('(max-width:700px)').matches) $$('details.fold').forEach(d => { d.open = false; });
  if ($('#pagenav')) {
    const label = { overview: 'Overview' }; $$('#pagenav a[data-sec]').forEach(a => label[a.dataset.sec] = a.textContent);
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const id = e.target.id;
      $('#pnNow').textContent = label[id] || '';
      $$('#pagenav a[data-sec]').forEach(a => { const on = a.dataset.sec === id; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
      const grp = $(`#pagenav a[data-sec="${id}"]`)?.closest('.pn-g');
      $$('.pn-g').forEach(g => g.classList.toggle('cur', g === grp));
    }), { rootMargin: '-40% 0px -55% 0px' });
    $$('main > section[id], main > header[id]').forEach(s => spy.observe(s));
  }

  // ---- tabs (archived captures, what-if): click, arrow keys, Home/End ----
  const tabs = (root, show) => {
    const btns = $$('[role="tab"]', root);
    const pick = (b, focus) => { btns.forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; }); show(+b.dataset.i); if (focus) b.focus(); };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => pick(b));
      b.addEventListener('keydown', e => { const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: btns.length - 1 }[e.key]; if (k == null) return; e.preventDefault(); pick(btns[(k + btns.length) % btns.length], true); });
    });
  };
  if ($('#wbStrip')) tabs($('#wbStrip'), i => $$('.wb-view').forEach(v => v.hidden = +v.dataset.i !== i));
  if ($('#forkTabs')) tabs($('#forkTabs'), i => $$('.fork-panel').forEach((p, k) => p.classList.toggle('on', k === i)));

  // ---- chip filters (timeline threads, footage types) ----
  const chips = (root, items, key) => $$('.chip', root).forEach(c => c.addEventListener('click', () => {
    $$('.chip', root).forEach(x => { x.classList.toggle('on', x === c); x.setAttribute('aria-pressed', String(x === c)); });
    items().forEach(e => e.classList.toggle('hide', c.dataset.f !== 'all' && e.dataset[key] !== c.dataset.f));
  }));
  if ($('#tlf')) chips($('#tlf'), () => $$('#tlv .ev'), 'cat');
  if ($('#vidf')) chips($('#vidf'), () => $$('#vidGrid .vid-cell'), 'type');

  // ---- cause of death accordion ----
  $$('.cod-top').forEach(b => b.addEventListener('click', () => { const r = b.closest('.cod-row'), o = !r.classList.contains('open'); r.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); }));

  // ---- video facades: build the player only when asked ----
  const EMBED = {
    youtube: (id, s) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${s ? '&start=' + s : ''}`,
    archive: id => `https://archive.org/embed/${id}?autoplay=1`,
    vimeo: id => `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`
  };
  $$('.vid-frame').forEach(f => $('.vid-btn', f).addEventListener('click', () => {
    const make = EMBED[f.dataset.provider]; if (!make) return;
    const title = $('.vid-btn', f).getAttribute('aria-label').replace(/^Play video: /, '');
    f.innerHTML = `<iframe src="${make(f.dataset.embed, f.dataset.start)}" title="${title.replace(/"/g, '&quot;')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    $('iframe', f).focus();
  }));

  // ---- image viewer: archive images open enlarged, with their label; arrows step through the page's images ----
  const zooms = $$('a.zoom');
  if (zooms.length && window.HTMLDialogElement) {
    const lb = Object.assign(document.createElement('dialog'), { className: 'lb', innerHTML: '<figure><div class="lb-img"></div><figcaption></figcaption></figure><button type="button" class="lb-x">Close</button><button type="button" class="lb-n" data-d="-1" aria-label="Previous image">‹</button><button type="button" class="lb-n" data-d="1" aria-label="Next image">›</button>' });
    lb.setAttribute('aria-label', 'Image viewer');
    document.body.appendChild(lb);
    let at = 0;
    const show = i => {
      at = (i + zooms.length) % zooms.length;
      const pic = zooms[at].firstElementChild.cloneNode(true);
      (pic.matches('img') ? pic : $('img', pic)).loading = 'eager';
      $('.lb-img', lb).replaceChildren(pic);
      $('figcaption', lb).innerHTML = zooms[at].closest('figure')?.querySelector('figcaption')?.innerHTML || '';
    };
    zooms.forEach((a, i) => a.addEventListener('click', e => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); show(i); lb.showModal(); }));
    lb.addEventListener('click', e => { const n = e.target.closest('.lb-n'); if (n) show(at + +n.dataset.d); else if (e.target === lb || e.target.closest('.lb-x')) lb.close(); });
    lb.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) show(at + d); });
  }

  // ---- then-vs-now slider ----
  $$('.cmpr').forEach(c => { const i = $('input', c); const set = () => c.style.setProperty('--pos', i.value + '%'); i.addEventListener('input', set); set(); });

  // ---- tooltips for infographic marks ----
  const tip = $('#tip');
  if (tip) {
    const show = (el, x, y) => { tip.textContent = el.dataset.tip; tip.hidden = false; const w = tip.offsetWidth, h = tip.offsetHeight; tip.style.left = Math.max(8, Math.min(x - w / 2, innerWidth - w - 8)) + 'px'; tip.style.top = (y - h - 14 < 8 ? y + 18 : y - h - 14) + 'px'; };
    document.addEventListener('pointermove', e => { const el = e.target.closest?.('[data-tip]'); if (el) show(el, e.clientX, e.clientY); else tip.hidden = true; }, { passive: true });
    document.addEventListener('pointerdown', e => { const el = e.target.closest?.('[data-tip]'); if (el) show(el, e.clientX, e.clientY); else tip.hidden = true; }, { passive: true });
    addEventListener('scroll', () => { tip.hidden = true; }, { passive: true });
  }

  // ---- lazy modules ----
  const D = BO.data, vend = '/assets/vendor/';
  near($('#tlx'), () => load('/assets/js/timeline.js'), '900px 0px');
  if (D.needs?.charts) near($('canvas'), () => load(vend + 'chart.umd.min.js').then(() => load(vend + 'rough.js')).then(() => load('/assets/js/charts.js')), '700px 0px');
  if (D.needs?.map) near($('#mapOv'), () => Promise.all([load(vend + 'd3-array.min.js').then(() => load(vend + 'd3-geo.min.js')), load(vend + 'topojson-client.min.js'), load(vend + 'rough.js')]).then(() => load('/assets/js/map.js')), '700px 0px');

  // ---- homepage: filters and "on this day" ----
  const idx = $('#idx');
  if (idx) {
    const st = { tier: 'all', cat: 'all', decade: 'all', cause: 'all' };
    const apply = () => {
      let n = 0;
      $$('.entry', idx).forEach(e => { const ok = Object.keys(st).every(k => st[k] === 'all' || e.dataset[k] === st[k]); e.classList.toggle('hide', !ok); if (ok) n++; });
      $$('.cat-row', idx).forEach(r => r.classList.toggle('hide', !$('.entry:not(.hide)', r)));
      $('#empty').hidden = n > 0;
      $('#idxCount').textContent = `${n} post-mortem${n === 1 ? '' : 's'}`;
    };
    $$('#filters .chip').forEach(c => c.addEventListener('click', () => {
      $$(`#filters .chip[data-g="${c.dataset.g}"]`).forEach(x => { x.classList.toggle('on', x === c); x.setAttribute('aria-pressed', String(x === c)); });
      st[c.dataset.g] = c.dataset.v; apply();
    }));
    $('#clearFilters')?.addEventListener('click', () => $$('#filters .chip[data-v="all"]').forEach(c => c.click()));
  }
  const otd = $('#otd-data');
  if (otd) {
    const ev = JSON.parse(otd.textContent), now = new Date(), md = d => d.slice(5);
    const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const nice = d => `${MON[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}`;
    const hits = ev.filter(e => md(e.d) === today);
    const item = e => `<p class="otd-t"><a href="${e.s}/">${e.n}</a>: ${e.t}<span class="otd-y">${nice(e.d)}, ${e.d.slice(0, 4)} · ${now.getFullYear() - +e.d.slice(0, 4)} years ago</span></p>`;
    ev.forEach(e => { e.s = '/' + e.s; });
    if (hits.length) $('#otdBody').innerHTML = `<p class="otd-date">${nice('0000-' + today)}</p>` + hits.map(item).join('');
    else if (ev.length) {
      const up = ev.map(e => { let t = new Date(now.getFullYear(), +e.d.slice(5, 7) - 1, +e.d.slice(8, 10)); if (t < now) t = new Date(now.getFullYear() + 1, t.getMonth(), t.getDate()); return [t - now, e]; }).sort((a, b) => a[0] - b[0]);
      const [ms, e] = up[0], days = Math.ceil(ms / 864e5);
      $('#otd-h').textContent = 'Next anniversary';
      $('#otdBody').innerHTML = `<p class="otd-date">${nice(e.d)}</p><p class="otd-t"><a href="${e.s}/">${e.n}</a>: ${e.t}<span class="otd-y">${e.d.slice(0, 4)} · in ${days} day${days === 1 ? '' : 's'}</span></p><ul>${up.slice(1, 4).map(([, x]) => `<li>${nice(x.d)}: <a href="${x.s}/">${x.n}</a></li>`).join('')}</ul>`;
    }
  }
})();

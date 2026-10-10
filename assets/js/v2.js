const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('v2-ready');
let returnFocus;
const dialog = $('#source-dialog');
export function openSources(link) {
  const list = document.getElementById(`sources-for-${link.dataset.cite}`);
  if (!dialog || !list || !dialog.showModal) { location.hash = 'sources'; return; }
  returnFocus = link;
  $('#source-dialog-list').innerHTML = list.innerHTML;
  dialog.showModal();
  $('[data-source-close]', dialog).focus();
}
function revealAnchor(hash) {
  const target = document.getElementById(hash.slice(1));
  for (let el = target?.parentElement; el; el = el.parentElement) if (el.tagName === 'DETAILS') el.open = true;
  if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  target?.scrollIntoView({ block: 'center', behavior: 'instant' });
}
if (dialog) {
  dialog.addEventListener('close', () => {
    const target = returnFocus?.isConnected ? returnFocus : $(`.srcs[data-cite="${returnFocus?.dataset.cite}"]`);
    target?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target.closest('[data-source-close]')) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
    if (event.key !== 'Tab') return;
    const stops = $$('button, a[href], input, [tabindex="0"]', dialog), first = stops[0], last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}
const toggle = $('#citation-numbers');
if (toggle) {
  toggle.parentElement.hidden = false;
  try { toggle.checked = localStorage.getItem('sb-citation-numbers') === 'true'; } catch {}
  const apply = () => {
    document.documentElement.classList.toggle('citation-numbers', toggle.checked);
    try { localStorage.setItem('sb-citation-numbers', String(toggle.checked)); } catch {}
  };
  toggle.addEventListener('change', apply); apply();
}
let glossaryButton;
function closeGlossary() {
  if (!glossaryButton) return;
  glossaryButton.setAttribute('aria-expanded', 'false');
  document.getElementById(glossaryButton.getAttribute('aria-controls')).hidden = true;
  glossaryButton = null;
}
document.addEventListener('click', event => {
  const source = event.target.closest('.srcs');
  if (source && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey) { event.preventDefault(); openSources(source); return; }
  const jump = event.target.closest('.source-jump, .source-backs a');
  if (jump) {
    if (dialog?.open) dialog.close();
    requestAnimationFrame(() => revealAnchor(jump.hash));
  }
  const button = event.target.closest('.glossary-button');
  if (button) {
    const open = button.getAttribute('aria-expanded') !== 'true';
    closeGlossary();
    if (open) { glossaryButton = button; button.setAttribute('aria-expanded', 'true'); document.getElementById(button.getAttribute('aria-controls')).hidden = false; }
  } else if (!event.target.closest('.glossary-pop')) closeGlossary();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && glossaryButton) { const button = glossaryButton; closeGlossary(); button.focus(); }
});
document.addEventListener('focusin', event => { if (glossaryButton && !event.target.closest('.glossary-term')) closeGlossary(); });

$$('[data-scrolly]').forEach(root => {
  const chapters = $$('.chap', root), dots = $$('.v2-point', root), controls = $('.scrolly-controls', root), play = $('[data-story-play]', root);
  let current = 0, timer = null;
  const stop = () => { clearInterval(timer); timer = null; play.textContent = 'Play'; play.setAttribute('aria-pressed', 'false'); };
  const select = i => {
    current = Math.max(0, Math.min(i, chapters.length - 1));
    chapters.forEach((c, j) => c.classList.toggle('stage-current', j === current));
    dots.forEach(dot => dot.classList.toggle('stage-active', dot.dataset.point === `0-${chapters[current].dataset.stagePoint}`));
    $('[data-stage-status]', root).textContent = `Chapter ${current + 1}: ${$('h3', chapters[current]).textContent}`;
  };
  const step = direction => { stop(); select(current + direction); chapters[current].scrollIntoView({ block: 'start', behavior: 'instant' }); };
  $('[data-story-prev]', root).addEventListener('click', () => step(-1));
  $('[data-story-next]', root).addEventListener('click', () => step(1));
  play.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (reduced.matches) return;
    if (current === chapters.length - 1) select(0);
    play.textContent = 'Pause'; play.setAttribute('aria-pressed', 'true');
    chapters[current].scrollIntoView({ block: 'start', behavior: 'instant' });
    timer = setInterval(() => {
      if (document.hidden || current === chapters.length - 1) { stop(); return; }
      select(current + 1); chapters[current].scrollIntoView({ block: 'start', behavior: 'instant' });
    }, 4000);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (reduced.matches) return;
      const entry = entries.filter(e => e.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
      if (entry) select(chapters.indexOf(entry.target));
    }, { rootMargin: '-15% 0px -55% 0px' });
    chapters.forEach(c => io.observe(c));
  }
  const mode = () => { stop(); controls.hidden = reduced.matches; root.classList.toggle('scrolly-static', reduced.matches); if (reduced.matches) { chapters.forEach(c => c.classList.remove('stage-current')); dots.forEach(d => d.classList.remove('stage-active')); } else select(current); };
  reduced.addEventListener('change', mode); mode();
});

$$('[data-animated-timeline]').forEach(root => {
  const input = $('.timeline-scrub input', root), progress = $('progress', root), controls = $('.timeline-scrub', root);
  const set = (n, activate = false) => {
    const dots = $$('.tlx-dot', root);
    if (!dots.length || reduced.matches) return;
    n = Math.min(dots.length - 1, Math.max(0, n));
    input.value = n; progress.value = n + 1;
    dots.forEach((dot, i) => dot.classList.toggle('timeline-reached', i <= n));
    if (activate) dots[n].click();
  };
  input.addEventListener('input', () => set(+input.value, true));
  root.addEventListener('click', event => { const dot = event.target.closest('.tlx-dot'); if (dot) set($$('.tlx-dot', root).indexOf(dot)); });
  root.addEventListener('keydown', event => { if (event.target.matches('.tlx-dot')) requestAnimationFrame(() => set($$('.tlx-dot', root).indexOf(document.activeElement))); });
  let queued = false;
  const update = () => {
    queued = false;
    if (reduced.matches || root.contains(document.activeElement)) return;
    const rect = root.getBoundingClientRect(), fraction = Math.max(0, Math.min(1, (innerHeight * .75 - rect.top) / Math.max(1, rect.height)));
    set(Math.floor(fraction * +input.max), rect.bottom > 0 && rect.top < innerHeight);
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  const mode = () => { controls.hidden = reduced.matches; root.classList.toggle('timeline-animated', !reduced.matches); if (reduced.matches) $$('.tlx-dot', root).forEach(d => d.classList.remove('timeline-reached')); };
  reduced.addEventListener('change', mode); mode();
  const observer = new MutationObserver(() => { if ($('.tlx-dot', root)) { observer.disconnect(); update(); } });
  observer.observe($('.tlx-stage', root), { childList: true, subtree: true });
});

// ---- v2 hero: tabbed fact panel (shadcn Tabs pattern: roving tabindex, arrow keys, sliding indicator) ----
$$('[data-hx-tabs]').forEach(root => {
  const list = $('[role="tablist"]', root), tabs = $$('[role="tab"]', root), panels = $$('[role="tabpanel"]', root), ind = $('.hx-ind', root);
  if (!list || !tabs.length) return;
  list.hidden = false; root.classList.add('hx-ready');
  const place = tab => { ind.style.width = tab.offsetWidth + 'px'; ind.style.transform = `translateX(${tab.offsetLeft}px)`; };
  const select = (i, focus) => {
    tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on; });
    place(tabs[i]); if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  list.addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement), n = tabs.length;
    const j = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (i < 0 || j == null) return; e.preventDefault(); select(j, true);
  });
  select(0);
  addEventListener('resize', () => place(tabs.find(t => t.getAttribute('aria-selected') === 'true')), { passive: true });
  document.fonts?.ready.then(() => place(tabs.find(t => t.getAttribute('aria-selected') === 'true')));
});

// ---- v2 charts: draw-in on scroll, pointer/tap tooltip with a crosshair, a keyboard scrubber, series toggles ----
// Every value shown comes from the chart's own marks (data-* attributes written by the build), so the tooltip
// can never disagree with the data table underneath.
const NS = 'http://www.w3.org/2000/svg';
const drawIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('drawn'); drawIO.unobserve(e.target); } }), { threshold: .25 }) : null;
$$('.v2-stock, .v2-rivalchart').forEach(fig => {
  const svg = $('.v2-svg', fig); if (!svg) return;
  const stock = fig.classList.contains('v2-stock');
  const legend = $('.v2-legend', fig), names = legend ? $$('li', legend).map(li => li.textContent.replace(/^\s*\d+\s*/, '').trim()) : [];
  // x stops: one per quarter (stock) or per year (rival)
  let stops;
  if (stock) stops = $$('.v2-range', svg).map(g => ({ x: +g.dataset.x, label: g.dataset.q, rows: [['Low', g.dataset.lo], ['High', g.dataset.hi]], ev: g.dataset.ev, els: [g] }));
  else {
    const by = new Map();
    $$('.v2-point', svg).forEach(c => { const k = c.dataset.year; if (!by.has(k)) by.set(k, { x: +c.getAttribute('cx'), label: k, pts: [] }); by.get(k).pts.push(c); });
    stops = [...by.values()].sort((a, b) => a.x - b.x);
  }
  if (!stops.length) return;
  const cross = document.createElementNS(NS, 'path'); cross.setAttribute('class', 'v2-cross'); cross.setAttribute('d', 'M0 42V260'); svg.appendChild(cross);
  const tip = document.createElement('div'); tip.className = 'v2-tip'; tip.setAttribute('aria-hidden', 'true'); fig.style.position = 'relative'; fig.appendChild(tip);
  const status = document.createElement('p'); status.className = 'v2-sr'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); fig.appendChild(status);
  const hidden = new Set();
  let cur = -1;
  const rowsFor = s => stock ? s.rows : s.pts.filter(c => !hidden.has(c.dataset.s)).map(c => [names[+c.dataset.s] || `Series ${+c.dataset.s + 1}`, c.dataset.v, +c.dataset.s]);
  const show = (i, fromKey) => {
    i = Math.max(0, Math.min(stops.length - 1, i)); cur = i; const s = stops[i];
    $$('.is-hot', svg).forEach(e => e.classList.remove('is-hot'));
    (stock ? s.els : s.pts).forEach(e => e.classList.add('is-hot'));
    cross.setAttribute('transform', `translate(${s.x} 0)`); fig.classList.add('v2-hover');
    const rows = rowsFor(s);
    tip.innerHTML = `<b>${s.label}</b>` + rows.map(r => `<span class="v2-tr">${r[2] != null ? `<i style="--series:var(${['--brand', '--c-blue', '--c-green', '--c-gold', '--c-plum', '--c-teal'][r[2] % 6]})"></i>` : ''}${r[0]}<em>${r[1]}</em></span>`).join('') + (s.ev ? `<span class="v2-tev">${s.ev}</span>` : '');
    const box = svg.getBoundingClientRect(), fb = fig.getBoundingClientRect(), px = box.left - fb.left + s.x / 760 * box.width, py = box.top - fb.top + 30 / 320 * box.height;
    const w = tip.offsetWidth, left = Math.max(8, Math.min(fb.width - w - 8, px + (px + w + 16 > fb.width ? -w - 12 : 12)));
    tip.style.transform = `translate(${left}px,${py}px)`;
    status.textContent = `${s.label}: ${rows.map(r => `${r[0]} ${r[1]}`).join(', ')}${s.ev ? `. ${s.ev}` : ''}`;
    if (scrub && !fromKey) scrub.value = i;
  };
  const hide = () => { fig.classList.remove('v2-hover'); $$('.is-hot', svg).forEach(e => e.classList.remove('is-hot')); cur = -1; };
  const nearest = ev => {
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const x = pt.matrixTransform(svg.getScreenCTM().inverse()).x;
    let bi = 0, bd = Infinity; stops.forEach((s, i) => { const d = Math.abs(s.x - x); if (d < bd) { bd = d; bi = i; } }); return bi;
  };
  svg.addEventListener('pointermove', e => show(nearest(e)));
  svg.addEventListener('pointerdown', e => show(nearest(e)));
  svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hide(); });
  // controls row: scrubber (and series toggles on line charts)
  const bar = document.createElement('div'); bar.className = 'v2-ctl';
  const scrub = document.createElement('input');
  Object.assign(scrub, { type: 'range', min: 0, max: stops.length - 1, value: stops.length - 1 });
  scrub.setAttribute('aria-label', `Scrub through ${stock ? 'quarters' : 'years'}`);
  scrub.addEventListener('input', () => show(+scrub.value, true));
  scrub.addEventListener('blur', hide);
  const lab = document.createElement('span'); lab.className = 'v2-ctl-l'; lab.textContent = stock ? 'Scrub quarters' : 'Scrub years';
  bar.append(lab, scrub);
  if (legend && names.length > 1) {
    const tg = document.createElement('div'); tg.className = 'v2-toggles'; tg.setAttribute('role', 'group'); tg.setAttribute('aria-label', 'Show or hide a series');
    names.forEach((n, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'v2-tg'; b.setAttribute('aria-pressed', 'true');
      b.style.setProperty('--series', `var(${['--brand', '--c-blue', '--c-green', '--c-gold', '--c-plum', '--c-teal'][i % 6]})`);
      b.innerHTML = `<i aria-hidden="true"></i>${n}`;
      b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on));
        on ? hidden.delete(String(i)) : hidden.add(String(i));
        $$(`[data-s="${i}"]`, svg).forEach(e => e.classList.toggle('is-off', !on));
        if (cur >= 0) show(cur);
      });
      tg.appendChild(b);
    });
    legend.hidden = true; bar.prepend(tg);
  }
  svg.after(bar);
  if (!reduced.matches && drawIO) {
    // mark each point with its position so they pop in left to right
    $$('.v2-point', svg).forEach(c => c.style.setProperty('--x', (+c.getAttribute('cx') - 72) / 652));
    fig.classList.add('v2-anim'); drawIO.observe(fig);
  }
});
$$('.ig-bars .hb').forEach(row => row.tabIndex = 0);

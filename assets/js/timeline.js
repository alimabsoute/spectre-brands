/* Compact timeline. Built from the #tlv list, which stays in the page (folded) as the no-JS fallback.
   Top: the whole life at true scale, with era bands and a draggable year range. Middle: one lane per
   thread for the years in range. Bottom: a fixed panel for the selected event, so the page never grows.
   Selecting an event also moves the map (if the page has one) to that date, and the other way round. */
(function () {
  const root = document.getElementById('tlx'), stage = document.getElementById('tlxStage');
  if (!root || !stage || !window.BO) return;
  const { $, $$ } = BO;
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const cats = $$('#tlf .chip').filter(c => c.dataset.f !== 'all').map(c => ({ k: c.dataset.f, label: c.textContent, color: $('.cdot', c).style.background }));
  const ev = $$('#tlv .ev').map((li, i) => ({ i, t: +li.dataset.t, cat: li.dataset.cat, date: li.dataset.d, plain: $('h3', li).textContent, title: $('h3', li).innerHTML, text: $('p', li).innerHTML, label: $('.c', li).textContent, color: li.style.getPropertyValue('--c') }));
  if (!ev.length) return;

  const T0 = Math.floor(ev[0].t), T1 = Math.floor(ev.at(-1).t) + 1, SPAN = T1 - T0, MINW = Math.max(SPAN * .02, .2);
  const y0 = +root.dataset.y0, died = +root.dataset.died;
  // Era bands come straight from company.json: the years in "years" and the year in "died".
  const eras = [[T0, Math.min(y0, T1), 'Origins', 'o'], [Math.max(y0, T0), Math.min(died + 1, T1), `Life ${y0}–${died}`, 'b'], [Math.max(died + 1, T0), T1, 'Afterlife', 'a']].filter(e => e[1] > e[0]);
  // The busiest stretch: the shortest run of years that holds 60% of the events.
  const k = Math.ceil(ev.length * .6);
  let bi = 0;
  for (let i = 0; i + k <= ev.length; i++) if (ev[i + k - 1].t - ev[i].t < ev[bi + k - 1].t - ev[bi].t) bi = i;
  const pad = Math.max((ev[bi + k - 1].t - ev[bi].t) * .08, .15);
  const busy = [Math.max(T0, ev[bi].t - pad), Math.min(T1, ev[bi + k - 1].t + pad)];
  const hasBusy = busy[1] - busy[0] < SPAN * .7;
  const pct = t => ((t - T0) / SPAN * 100).toFixed(2);
  const fmt = (t, yearOnly) => yearOnly ? String(Math.floor(t)) : `${MON[Math.min(11, Math.floor((t % 1) * 12))]} ${Math.floor(t)}`;
  const ticks = (a, b, px, min) => {
    const step = [1 / 12, .25, .5, 1, 2, 5, 10, 20, 50].find(s => s / (b - a) * px >= min) || 50, out = [];
    if (step >= 1) for (let y = Math.ceil(a / step) * step; y <= b; y += step) out.push([y, y, 1]);
    else { const m = Math.round(step * 12); for (let n = Math.ceil(a * 12 / m) * m; n <= b * 12; n += m) out.push([n / 12, n % 12 ? MON[n % 12] : n / 12, n % 12 ? 0 : 1]); }
    return out;
  };

  $('.tlx-bar', root).insertAdjacentHTML('beforeend', `<div class="tlx-range"><span id="tlxWin"></span><div class="seg" role="group" aria-label="Years shown">${hasBusy ? '<button type="button" data-r="busy" aria-pressed="false">Busiest stretch</button>' : ''}<button type="button" data-r="all" aria-pressed="false">All years</button></div></div>`);
  stage.innerHTML = `<div class="tlx-over">
<div class="tlx-eras">${eras.map(e => `<button type="button" class="tlx-era ${e[3]}" style="left:${pct(e[0])}%;width:${((e[1] - e[0]) / SPAN * 100).toFixed(2)}%" data-a="${e[0]}" data-b="${e[1]}" title="Show these years"><span>${e[2]}</span></button>`).join('')}</div>
<div class="tlx-strip" id="tlxStrip"><div class="tlx-ticks" aria-hidden="true">${ev.map(e => `<i style="left:${pct(e.t)}%;background:${e.color}"></i>`).join('')}</div>
<div class="tlx-brush" id="tlxBrush"><span class="tlx-h" data-h="0" role="slider" tabindex="0" aria-label="First year shown"></span><span class="tlx-h" data-h="1" role="slider" tabindex="0" aria-label="Last year shown"></span></div></div>
<div class="tlx-oy" aria-hidden="true" id="tlxOy"></div>
</div>
<div class="tlx-plot">
<div class="tlx-labels" aria-hidden="true">${cats.map(c => `<span data-cat="${c.k}">${esc(c.label)}</span>`).join('')}</div>
<div class="tlx-area" id="tlxArea" role="group" aria-label="Events on a time axis. Left and right arrow keys move between events; Home and End jump to the first and last.">
<div class="tlx-bg" aria-hidden="true">${eras.map(e => `<i class="${e[3]}"></i>`).join('')}</div>
${cats.map(c => `<div class="tlx-lane" data-cat="${c.k}"><i class="tlx-span" style="background:${c.color}"></i></div>`).join('')}
<div class="tlx-axis" id="tlxAxis" aria-hidden="true"></div>
</div></div>
<div class="tlx-detail" id="tlxDetail">
<div class="tlx-panel" id="tlxPanel" aria-live="polite" aria-atomic="true"></div>
<div class="tlx-nav"><button type="button" class="tl-step" id="tlxPrev" aria-label="Previous event">‹</button><span id="tlxN"></span><button type="button" class="tl-step" id="tlxNext" aria-label="Next event">›</button>${BO.data.map ? '<a class="tlx-map" href="#map">See this date on the map</a>' : ''}</div>
</div>`;

  const area = $('#tlxArea'), strip = $('#tlxStrip'), brush = $('#tlxBrush'), panel = $('#tlxPanel'), bg = $$('.tlx-bg i', stage), tk = $$('.tlx-ticks i', stage);
  const lanes = cats.map(c => ({ el: $(`.tlx-lane[data-cat="${c.k}"]`, stage), evs: ev.filter(e => e.cat === c.k) }));
  ev.forEach(e => {
    const lane = lanes.find(l => l.evs.includes(e)); if (!lane) return;
    e.tick = tk[e.i];
    e.dot = Object.assign(document.createElement('button'), { type: 'button', className: 'tlx-dot', tabIndex: -1 });
    e.dot.style.setProperty('--c', e.color);
    e.dot.setAttribute('aria-label', `${e.date}, ${e.label}: ${e.plain}`);
    e.dot.addEventListener('click', () => select(e.i));
    e.dot.addEventListener('focus', () => { if (sel !== e.i) select(e.i); });
    e.dot.addEventListener('pointerenter', p => { if (p.pointerType === 'mouse') show(e.i); });
    e.dot.addEventListener('pointerleave', () => show(sel));
    lane.el.appendChild(e.dot);
  });
  const all = ev.filter(e => e.dot);
  let w0 = T0, w1 = T1, sel = all[0].i, filter = 'all';
  const visible = () => all.filter(e => filter === 'all' || e.cat === filter);

  function layout(anim) {
    const W = area.clientWidth, w = w1 - w0, x = t => (t - w0) / w * W;
    stage.classList.toggle('still', !anim);
    lanes.forEach(l => {
      const last = [-99, -99, -99];
      l.evs.forEach(e => { const px = x(e.t); let lv = last.findIndex(v => px - v >= 13); if (lv < 0) lv = last.indexOf(Math.min(...last)); last[lv] = px; e.dot.style.left = px.toFixed(1) + 'px'; e.dot.dataset.l = lv; });
      const s = $('.tlx-span', l.el);
      if (l.evs.length) { const a = Math.max(0, x(l.evs[0].t)), b = Math.min(W, x(l.evs.at(-1).t)); s.style.left = a + 'px'; s.style.width = Math.max(0, b - a) + 'px'; }
    });
    eras.forEach((e, i) => { const a = Math.max(0, x(e[0])), b = Math.min(W, x(e[1])); bg[i].style.left = a + 'px'; bg[i].style.width = Math.max(0, b - a) + 'px'; });
    $('#tlxAxis').innerHTML = ticks(w0, w1, W, 62).map(([t, l, yr]) => `<span${yr ? ' class="yr"' : ''} style="left:${x(t).toFixed(1)}px">${l}</span>`).join('');
    brush.style.left = pct(w0) + '%'; brush.style.width = (w / SPAN * 100).toFixed(2) + '%';
    $$('.tlx-h', brush).forEach((h, i) => { const t = i ? w1 : w0; h.setAttribute('aria-valuemin', T0); h.setAttribute('aria-valuemax', T1); h.setAttribute('aria-valuenow', t.toFixed(1)); h.setAttribute('aria-valuetext', fmt(t)); });
    const yo = w > 12;
    $('#tlxWin').textContent = `${fmt(w0, yo)} – ${fmt(w1 - .001, yo)}`;
    $$('.tlx-range button', root).forEach(b => { const r = b.dataset.r === 'all' ? [T0, T1] : busy, on = Math.abs(w0 - r[0]) < .01 && Math.abs(w1 - r[1]) < .01; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  }
  function setWin(a, b, anim) {
    const w = Math.min(SPAN, Math.max(MINW, b - a));
    w0 = Math.min(Math.max(T0, a), T1 - w); w1 = w0 + w; layout(anim);
  }
  function show(i) {
    const e = ev[i], v = visible();
    all.forEach(x => x.dot.classList.toggle('hov', x.i === i && i !== sel));
    panel.innerHTML = `<div><p class="tlx-date">${esc(e.date)}</p><p class="tlx-cat"><i class="cdot" style="background:${e.color}"></i>${esc(e.label)}</p></div><div><h3>${e.title}</h3><p class="tlx-text">${e.text}</p></div>`;
    $('#tlxN').textContent = `${v.indexOf(e) + 1} of ${v.length}`;
  }
  function select(i, { focus, silent, pan = true } = {}) {
    sel = i; const e = ev[i], w = w1 - w0;
    all.forEach(x => { const on = x.i === i; x.dot.classList.toggle('on', on); x.dot.tabIndex = on ? 0 : -1; on ? x.dot.setAttribute('aria-current', 'true') : x.dot.removeAttribute('aria-current'); x.tick.classList.toggle('on', on); });
    if (pan && (e.t < w0 + w * .03 || e.t > w1 - w * .03)) setWin(e.t - w / 2, e.t + w / 2, true);
    show(i);
    if (focus) e.dot.focus({ preventScroll: true });
    BO.t = e.t;
    if (!silent) document.dispatchEvent(new CustomEvent('bo:time', { detail: { t: e.t, from: 'timeline' } }));
  }
  const step = (d, focus) => { const v = visible(), n = v.findIndex(e => e.i === sel) + d; if (v[n]) select(v[n].i, { focus }); };

  // keyboard: arrows, Home, End
  area.addEventListener('keydown', e => {
    const v = visible(), n = v.findIndex(x => x.i === sel), to = { ArrowRight: n + 1, ArrowLeft: n - 1, Home: 0, End: v.length - 1 }[e.key];
    if (to == null) return; e.preventDefault(); if (v[to]) select(v[to].i, { focus: true });
  });
  $('#tlxPrev').addEventListener('click', () => step(-1)); $('#tlxNext').addEventListener('click', () => step(1));
  // swipe the panel on touch screens
  let down = null;
  const detail = $('#tlxDetail');
  detail.addEventListener('pointerdown', e => { down = e.pointerType === 'mouse' ? null : [e.clientX, e.clientY]; });
  detail.addEventListener('pointerup', e => { if (!down) return; const dx = e.clientX - down[0], dy = e.clientY - down[1]; down = null; if (Math.abs(dx) > 40 && Math.abs(dx) > 2 * Math.abs(dy)) step(dx < 0 ? 1 : -1); });

  // year range: drag the window or its edges, click the strip to move it, click an era, or use the presets
  strip.addEventListener('pointerdown', e => {
    const r = strip.getBoundingClientRect(), at = x => T0 + (x - r.left) / r.width * SPAN, h = e.target.dataset.h, t = at(e.clientX);
    if (!e.target.closest('.tlx-brush')) { const w = w1 - w0; setWin(t - w / 2, t + w / 2); }
    const a = w0, b = w1;
    strip.setPointerCapture(e.pointerId); stage.classList.add('drag');
    const move = m => { const d = at(m.clientX) - t; h === '0' ? setWin(Math.max(T0, Math.min(a + d, b - MINW)), b) : h === '1' ? setWin(a, Math.min(T1, Math.max(b + d, a + MINW))) : setWin(a + d, b + d); };
    const up = () => { strip.removeEventListener('pointermove', move); stage.classList.remove('drag'); };
    strip.addEventListener('pointermove', move);
    strip.addEventListener('pointerup', up, { once: true }); strip.addEventListener('pointercancel', up, { once: true });
  });
  $$('.tlx-h', brush).forEach((h, i) => h.addEventListener('keydown', e => {
    const d = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }[e.key] * Math.max(SPAN / 50, 1 / 12);
    if (e.key === 'Home') i ? setWin(w0, w0 + MINW) : setWin(T0, w1);
    else if (e.key === 'End') i ? setWin(w0, T1) : setWin(w1 - MINW, w1);
    else if (d) i ? setWin(w0, Math.min(T1, Math.max(w1 + d, w0 + MINW))) : setWin(Math.max(T0, Math.min(w0 + d, w1 - MINW)), w1);
    else return;
    e.preventDefault();
  }));
  $$('.tlx-era', stage).forEach(b => b.addEventListener('click', () => setWin(+b.dataset.a, +b.dataset.b, true)));
  $$('.tlx-range button', root).forEach(b => b.addEventListener('click', () => b.dataset.r === 'all' ? setWin(T0, T1, true) : setWin(busy[0], busy[1], true)));

  // thread filter (runtime.js already hides the list items)
  $('#tlf').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    filter = c.dataset.f;
    all.forEach(x => { const off = filter !== 'all' && x.cat !== filter; x.dot.classList.toggle('off', off); x.tick.classList.toggle('off', off); });
    $$('.tlx-lane, .tlx-labels span', stage).forEach(l => l.classList.toggle('off', filter !== 'all' && l.dataset.cat !== filter));
    const v = visible(); if (!v.length) return;
    v.some(x => x.i === sel) ? show(sel) : select(v[0].i);
  });

  // the map tells the timeline which date it is showing
  document.addEventListener('bo:time', e => {
    if (e.detail.from === 'timeline') return;
    const v = visible(); if (!v.length) return;
    select(v.reduce((a, b) => Math.abs(b.t - e.detail.t) < Math.abs(a.t - e.detail.t) ? b : a).i, { silent: true });
  });

  $('#tlxOy').innerHTML = ticks(T0, T1, strip.clientWidth, 84).filter(([t]) => (t - T0) / SPAN < .95).map(([t, l]) => `<span style="left:${pct(t)}%">${l}</span>`).join('');
  hasBusy ? setWin(busy[0], busy[1]) : setWin(T0, T1);
  select((all.find(e => e.t >= w0) || all[0]).i, { silent: true, pan: false });
  new ResizeObserver(() => layout()).observe(area);
})();

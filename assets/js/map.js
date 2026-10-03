/* Optional "map" module: a US map (d3 Albers USA, Census state shapes from us-atlas) whose pins,
   notes and choropleth layers are driven by a horizontal timeline. Data: #bo-data.map (see SCHEMA.md). */
(function () {
  const M = window.BO && BO.data && BO.data.map;
  const svg = document.getElementById('mapOv'), base = document.getElementById('mapBase');
  if (!M || !svg) return;
  const NS = 'http://www.w3.org/2000/svg', HAND = '#1f2a44';
  const PAL = { a: ['#F6B8A8', '#C4644D'], b: ['#CDBCEA', '#7B62A8'], c: ['#AECDEC', '#43709F'], d: ['#BFE0B5', '#4F8A45'], e: ['#F7DC9C', '#B08A2E'] };
  const LAND = '#ECEBE7', EDGE = '#FFFFFF';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const inl = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const fnl = ids => (ids || []).map(n => `<sup class="fn"><a href="#src-${n}">${n}</a></sup>`).join('');
  const steps = M.steps || [], pins = M.pins || [];
  let P = null, cur = 0, timer = null, states = null, names = {};

  // --- timeline track ---
  const track = $('tlTrack');
  steps.forEach((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tl-dot'; b.dataset.i = i;
    b.style.left = (steps.length > 1 ? i / (steps.length - 1) * 100 : 50) + '%';
    b.setAttribute('aria-label', s.label + ': ' + s.title);
    b.innerHTML = `<span class="tl-d">${esc(s.label)}</span>`;
    b.addEventListener('click', () => { stop(); go(i); });
    track.appendChild(b);
  });
  const stop = () => { clearInterval(timer); timer = null; $('tlPlay').textContent = 'Play'; $('tlPlay').classList.remove('on'); };
  $('tlPlay').addEventListener('click', () => {
    if (timer) return stop();
    $('tlPlay').textContent = 'Pause'; $('tlPlay').classList.add('on');
    if (cur >= steps.length - 1) go(0);
    timer = setInterval(() => { if (cur >= steps.length - 1) return stop(); go(cur + 1); }, 3400);
  });
  $('tlPrev').addEventListener('click', () => { stop(); go(Math.max(0, cur - 1)); });
  $('tlNext').addEventListener('click', () => { stop(); go(Math.min(steps.length - 1, cur + 1)); });
  $('tlbar').addEventListener('keydown', e => { if (e.key === 'ArrowRight') { stop(); go(Math.min(steps.length - 1, cur + 1)); } if (e.key === 'ArrowLeft') { stop(); go(Math.max(0, cur - 1)); } });

  // --- pin state for a date ---
  const stateOf = (p, d) => (p.from && p.from > d) ? 'hidden' : (p.to && p.to <= d) ? 'closed' : 'active';

  function go(i) {
    cur = i; const s = steps[i]; if (!s) return;
    track.querySelectorAll('.tl-dot').forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('past', k < i); });
    $('tlFill').style.width = (steps.length > 1 ? i / (steps.length - 1) * 100 : 0) + '%';
    const hl = new Set(s.pins || []);
    svg.querySelectorAll('.pin').forEach(g => {
      const p = pins[+g.dataset.i], st = stateOf(p, s.date);
      g.setAttribute('class', `pin ${st}${hl.has(p.id) ? ' hl' : ''}`);
    });
    svg.querySelectorAll('.lead').forEach(l => l.setAttribute('class', 'lead ' + stateOf(pins[+l.dataset.i], s.date)));
    $('mapKey').querySelectorAll('li').forEach(li => { const p = pins[+li.dataset.i]; li.className = stateOf(p, s.date) + (hl.has(p.id) ? ' hl' : ''); });
    $('stepCard').innerHTML = `<div class="sc-k">Step ${i + 1} of ${steps.length} · <b>${esc(s.label)}</b></div><h4>${inl(s.title)}</h4><p>${inl(s.text)}${fnl(s.src)}</p>${s.note ? `<p class="sc-note">${esc(s.note.text.join(' '))}</p>` : ''}${s.estimate ? `<p class="sc-est">${inl(s.estimate)}</p>` : ''}`;
    const st = $('mapStat');
    if (s.stat) { st.innerHTML = `<b>${esc(s.stat.value)}</b><span>${inl(s.stat.label)}</span>`; st.classList.add('on'); } else st.classList.remove('on');
    if (states) paintLayer(s.layer);
    drawNote(s);
  }

  // --- choropleth ---
  function paintLayer(k) {
    const L = k && M.choropleth && M.choropleth.layers[k], leg = $('choroLegend');
    base.querySelectorAll('.st').forEach(p => {
      const n = p.dataset.n, v = L ? L.values[n] : null;
      let c = LAND;
      if (L && v != null) { let j = 0; while (j < L.scale.length && v >= L.scale[j]) j++; c = L.colors[j]; }
      p.style.fill = c;
    });
    if (leg) leg.innerHTML = L ? `<span class="t">${esc(L.title)}</span>` + L.colors.map((c, i) => `<span class="k" style="background:${c}"></span><span class="lb">${esc(L.labels[i])}</span>`).join('') : '';
    if (leg) leg.classList.toggle('on', !!L);
  }
  const tipEl = $('mapTip');
  function tipFor(n) {
    const k = steps[cur] && steps[cur].layer, L = k && M.choropleth.layers[k]; if (!L || L.values[n] == null) return '';
    const fill = (t, lay) => t.replace('{name}', n).replace('{v}', (M.choropleth.layers[lay] || L).values[n]);
    return `<b>${esc(n)}</b><br>${esc(fill(L.tip, k))}` + (L.also || []).map(a => '<br>' + esc(fill(a.tip, a.layer))).join('');
  }

  // --- notes ---
  function drawNote(s) {
    const g = svg.querySelector('.anno'); if (!g) return; g.innerHTML = '';
    if (!s.note || typeof rough === 'undefined' || !P || innerWidth < 700) return;
    const rc = rough.svg(svg), n = s.note, fs = 20;
    const t = el('text', { x: n.box[0] + 12, y: n.box[1] + fs + 5, 'font-size': fs, 'font-weight': 600 }, g);
    n.text.forEach((ln, j) => { const ts = el('tspan', { x: n.box[0] + 12, dy: j ? fs * 1.1 : 0 }, t); ts.textContent = ln; });
    let bb = t.getBBox(); if (!bb.width) bb = { width: Math.max(...n.text.map(l => l.length)) * fs * .42, height: n.text.length * fs * 1.1 };
    const [x, y] = n.box, w = bb.width + 24, h = bb.height + 16;
    g.insertBefore(rc.rectangle(x, y, w, h, { roughness: 1.2, stroke: HAND, strokeWidth: 1.4, fill: '#FFFFFF', fillStyle: 'solid', seed: 11 + cur * 7 }), t);
    let tg = null;
    if (n.at) { const p = pins.find(q => q.id === n.at); tg = p ? pinXY(p) : null; }
    else if (n.ll) tg = P(n.ll);
    if (!tg) return;
    const cx = Math.max(x, Math.min(tg[0], x + w)), cy = Math.max(y, Math.min(tg[1], y + h));
    let sx = cx, sy = cy; if (cx > x && cx < x + w && cy > y && cy < y + h) { sx = x + w / 2; sy = y + h; }
    const mx = (sx + tg[0]) / 2 + (tg[1] - sy) * .18, my = (sy + tg[1]) / 2 - (tg[0] - sx) * .18;
    const ex = tg[0] - Math.cos(Math.atan2(tg[1] - my, tg[0] - mx)) * 16, ey = tg[1] - Math.sin(Math.atan2(tg[1] - my, tg[0] - mx)) * 16;
    g.appendChild(rc.curve([[sx, sy], [mx, my], [ex, ey]], { roughness: 1, stroke: HAND, strokeWidth: 1.6, seed: 12 + cur * 7 }));
    const an = Math.atan2(ey - my, ex - mx);
    [.45, -.45].forEach((d, q) => g.appendChild(rc.line(ex, ey, ex - 11 * Math.cos(an + d), ey - 11 * Math.sin(an + d), { roughness: .7, stroke: HAND, strokeWidth: 1.6, seed: 13 + cur * 7 + q })));
  }

  const pinXY = p => { const q = P(p.ll); if (!q) return null; return p.offset ? [q[0] + p.offset[0], q[1] + p.offset[1]] : q; };

  function drawPins() {
    const defs = el('defs', {}, svg), f = el('filter', { id: 'pinShadow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feDropShadow', { dx: 0, dy: 1, stdDeviation: 1.2, 'flood-color': '#000', 'flood-opacity': .22 }, f);
    (M.rings || []).forEach(r => { const c = P(r.ll); if (!c) return; const rad = r.miles * 1300 / 3959; el('circle', { cx: c[0], cy: c[1], r: rad, fill: 'none', stroke: (PAL[r.cat] || PAL.a)[1], 'stroke-width': 1.3, 'stroke-dasharray': '5 5', opacity: .55 }, svg); });
    el('g', { class: 'anno' }, svg);
    const g = el('g', { class: 'pins' }, svg);
    pins.forEach((p, i) => {
      const t = P(p.ll); if (!t) return; const q = pinXY(p), c = PAL[p.cat] || PAL.a;
      if (p.offset) { const l = el('g', { class: 'lead', 'data-i': i }, g); el('line', { x1: t[0], y1: t[1], x2: q[0], y2: q[1], stroke: c[1], 'stroke-width': 1.2 }, l); el('circle', { cx: t[0], cy: t[1], r: 2.6, fill: c[1] }, l); }
      const pg = el('g', { class: 'pin', 'data-i': i, tabindex: 0, role: 'button', 'aria-label': p.label + ': ' + p.title }, g);
      el('circle', { class: 'pulse', cx: q[0], cy: q[1], r: 13, fill: 'none', stroke: c[1] }, pg);
      el('circle', { class: 'pd', cx: q[0], cy: q[1], r: 13, fill: c[0], stroke: c[1], 'stroke-width': 1, filter: 'url(#pinShadow)' }, pg);
      const tx = el('text', { class: 'pn', x: q[0], y: q[1] + 5, 'text-anchor': 'middle', 'font-size': 14 }, pg); tx.textContent = p.label;
      const show = () => { const k = $('mapKey').children[i]; $('mapKey').querySelectorAll('li').forEach(x => x.classList.toggle('sel', x === k)); };
      pg.addEventListener('click', () => { show(); const k = $('mapKey').children[i]; if (innerWidth < 700 && k) k.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
      pg.addEventListener('keydown', e => { if (e.key === 'Enter') pg.dispatchEvent(new Event('click')); });
    });
    $('mapKey').innerHTML = pins.map((p, i) => `<li data-i="${i}"><span class="kn" style="background:${(PAL[p.cat] || PAL.a)[0]};border-color:${(PAL[p.cat] || PAL.a)[1]}">${esc(p.label)}</span><div><b>${inl(p.title)}</b>${p.when ? ` <span class="kw">${esc(p.when)}</span>` : ''}<br>${inl(p.text)}${fnl(p.src)}</div></li>`).join('');
  }

  function init(us) {
    P = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
    const path = d3.geoPath(P);
    if (us) {
      const gb = el('g', {}, base);
      topojson.feature(us, us.objects.states).features.forEach(f => {
        const p = el('path', { class: 'st', d: path(f) || '', 'data-n': f.properties.name, fill: LAND, stroke: EDGE, 'stroke-width': 1.1 }, gb);
        p.dataset.n = f.properties.name;
      });
      states = true;
      if (M.choropleth) {
        base.style.pointerEvents = 'auto';
        base.querySelectorAll('.st').forEach(p => {
          p.addEventListener('mousemove', e => { const h = tipFor(p.dataset.n); if (!h) { tipEl.classList.remove('on'); return; } tipEl.innerHTML = h; const r = $('mapbox').getBoundingClientRect(); tipEl.style.left = (e.clientX - r.left + 12) + 'px'; tipEl.style.top = (e.clientY - r.top + 12) + 'px'; tipEl.classList.add('on'); });
          p.addEventListener('mouseleave', () => tipEl.classList.remove('on'));
        });
      }
    }
    drawPins();
    go(0);
  }
  const start = () => {
    if (typeof d3 === 'undefined' || !d3.geoAlbersUsa) return;
    fetch('/assets/vendor/states-10m.json').then(r => r.json()).then(init, () => init(null));
  };
  (document.fonts && document.fonts.load ? document.fonts.load('600 20px Caveat').catch(() => 0) : Promise.resolve()).then(start, start);
  let rw; addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(() => P && drawNote(steps[cur]), 200); });
})();

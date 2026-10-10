/* Optional "map" module: a US map (d3 Albers USA, Census state shapes from us-atlas) whose pins, labels,
   notes and choropleth layers are driven by a horizontal timeline. Every place is labelled on the map itself,
   with a leader line where the label has to sit away from its pin. Data: #bo-data.map (see SCHEMA.md). */
(function () {
  const M = window.BO && BO.data && BO.data.map;
  const svg = document.getElementById('mapOv'), base = document.getElementById('mapBase');
  if (!M || !svg) return;
  const NS = 'http://www.w3.org/2000/svg', VW = 975, VH = 610;
  const PAL = { a: '#C4644D', b: '#7B62A8', c: '#43709F', d: '#4F8A45', e: '#B08A2E' };
  const LAND = '#E2E0D9', EDGE = '#FCFBF8';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const inl = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const fnl = ids => (ids || []).map(n => `<sup class="fn"><a href="#src-${n}">${n}</a></sup>`).join('');
  const steps = M.steps || [], pins = M.pins || [];
  let P = null, cur = 0, timer = null, states = null, sel = -1, nodes = [], annoG = null;

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

  // Step dates are "YYYY-MM-DD" or "YYYY"; the timeline uses fractional years (a bare year sits mid-year).
  const frac = d => { const [y, m, dd] = String(d).split('-').map(Number); return m ? y + (m - 1) / 12 + ((dd || 1) - 1) / 372 : y + .5; };
  const stepAt = t => Math.max(0, steps.findLastIndex(s => frac(s.date) <= t + .005));

  function go(i, silent) {
    cur = i; const s = steps[i]; if (!s) return;
    track.querySelectorAll('.tl-dot').forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('past', k < i); });
    $('tlFill').style.width = (steps.length > 1 ? i / (steps.length - 1) * 100 : 0) + '%';
    const hl = new Set(s.pins || []);
    nodes.forEach(n => { n.state = stateOf(n.p, s.date); n.hl = hl.has(n.p.id); });
    $('stepCard').innerHTML = `<div class="sc-k">Step ${i + 1} of ${steps.length} · <b>${esc(s.label)}</b></div><h4>${inl(s.title)}</h4><p>${document.querySelector(`[data-map-step="${i}"]`)?.innerHTML || inl(s.text) + fnl(s.src)}</p>${s.note ? `<p class="sc-note">${esc(s.note.text.join(' '))}</p>` : ''}${s.estimate ? `<p class="sc-est">${inl(s.estimate)}</p>` : ''}<p class="sc-tl"><a href="#timeline">Find this date in the timeline</a></p>`;
    const st = $('mapStat');
    if (s.stat) { st.innerHTML = `<b>${esc(s.stat.value)}</b><span>${inl(s.stat.label)}</span>`; st.classList.add('on'); } else st.classList.remove('on');
    if (states) paintLayer(s.layer);
    // the place panel follows the step: its first highlighted place, else whatever was picked, if still on the map
    const first = nodes.find(n => n.hl && n.state !== 'hidden');
    place(first ? first.i : nodes[sel] && nodes[sel].state !== 'hidden' ? sel : -1);
    if (!silent) document.dispatchEvent(new CustomEvent('bo:time', { detail: { t: frac(s.date), from: 'map' } }));
  }
  // the timeline tells the map which date it is showing
  document.addEventListener('bo:time', e => { if (e.detail.from !== 'map' && P) { stop(); go(stepAt(e.detail.t), true); } });

  // --- the place panel: what a pin is, in words ---
  function place(i) {
    sel = i; const n = nodes[i], p = n && n.p;
    $('placeCard').innerHTML = p ? `<div class="sc-k">${n.state === 'closed' ? 'Closed by this date' : 'On the map'}${p.when ? ` · <b>${esc(p.when)}</b>` : ''}</div><h4>${inl(p.title)}</h4><p>${document.querySelector(`[data-map-pin="${p.id}"] p`)?.innerHTML || inl(p.text) + fnl(p.src)}</p>` : '<div class="sc-k">Places</div><p>Pick a pin to read about that place.</p>';
    layout();
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

  // --- pins, labels and the step's note. Sizes are set in screen pixels, so a phone gets the same dot and
  // type size as a desktop; on a phone only the highlighted and the picked places are labelled. ---
  function layout() {
    if (!P || !nodes.length && !annoG) return;
    const wpx = svg.clientWidth || VW, k = VW / wpx, small = wpx < 560, fs = (small ? 11 : 12.5) * k, gap = 9 * k, boxes = [];
    const free = b => b[0] > 2 && b[2] < VW - 2 && b[1] > 2 && b[3] < VH - 2 && !boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
    const s = steps[cur];
    // the note: a short bold caption with a leader to what it is about
    annoG.innerHTML = '';
    if (s && s.note && !small) {
      const n = s.note, x = n.box[0], y = n.box[1], t = el('text', { class: 'anno-t', x, y: y + fs * 1.1, 'font-size': fs * 1.08, 'stroke-width': 3.5 * k }, annoG);
      n.text.forEach((ln, j) => { el('tspan', { x, dy: j ? fs * 1.38 : 0 }, t).textContent = ln; });
      const w = Math.max(...[...t.children].map(c => c.getComputedTextLength())), h = n.text.length * fs * 1.38, bx = [x - 4 * k, y - 2 * k, x + w + 4 * k, y + h + 2 * k];
      boxes.push(bx);
      const tg = n.at ? (nodes.find(q => q.p.id === n.at) || {}).xy : n.ll ? P(n.ll) : null;
      if (tg) { const cx = Math.max(bx[0], Math.min(tg[0], bx[2])), cy = Math.max(bx[1], Math.min(tg[1], bx[3])); annoG.insertBefore(el('line', { class: 'anno-l', x1: cx, y1: cy, x2: tg[0], y2: tg[1], 'stroke-width': 1.2 * k }), t); if (!n.at) el('circle', { cx: tg[0], cy: tg[1], r: 2.5 * k, fill: '#16161A' }, annoG); }
    }
    nodes.forEach(n => {
      const on = n.state !== 'hidden', r = (n.hl || n.i === sel ? 8 : 6) * k;
      n.g.setAttribute('class', `pin ${n.state}${n.hl ? ' hl' : ''}${n.i === sel ? ' sel' : ''}`);
      n.dot.setAttribute('r', r); n.dot.setAttribute('stroke-width', 1.6 * k); n.pulse.setAttribute('r', r); n.pulse.setAttribute('stroke-width', 2 * k); n.hit.setAttribute('r', 18 * k);
      if (on) boxes.push([n.xy[0] - r, n.xy[1] - r, n.xy[0] + r, n.xy[1] + r]);
    });
    // labels: highlighted places first, so they get the positions next to their pins
    [...nodes].sort((a, b) => (b.hl + (b.i === sel)) - (a.hl + (a.i === sel)) || a.i - b.i).forEach(n => {
      const show = n.state !== 'hidden' && (!small || n.hl || n.i === sel);
      n.t.style.display = n.lead.style.display = show ? '' : 'none';
      if (!show) return;
      n.t.setAttribute('class', `plab ${n.state}${n.hl || n.i === sel ? ' hl' : ''}`);
      n.t.setAttribute('font-size', fs); n.t.setAttribute('stroke-width', 3.2 * k);
      const w = n.t.getComputedTextLength(), h = fs * 1.15, [x, y] = n.xy, d = .72;
      let best = null;
      for (const m of [1, 2.4, 4, 6, 8.5]) {
        const g = gap * m + 6 * k;
        const cands = [[x + g, y - h / 2], [x - g - w, y - h / 2], [x + g * d, y - g * d - h], [x + g * d, y + g * d], [x - g * d - w, y - g * d - h], [x - g * d - w, y + g * d], [x - w / 2, y - g - h], [x - w / 2, y + g]];
        best = cands.map(c => [c[0], c[1], c[0] + w, c[1] + h]).find(free);
        if (best) { n.far = m > 1; break; }
      }
      if (!best) { best = [x + gap + 6 * k, y - h / 2, x + gap + 6 * k + w, y + h / 2]; n.far = false; }
      boxes.push(best);
      n.t.setAttribute('x', best[0]); n.t.setAttribute('y', best[3] - h * .22);
      const lx = Math.max(best[0], Math.min(x, best[2])), ly = Math.max(best[1], Math.min(y, best[3]));
      n.lead.setAttribute('x1', x); n.lead.setAttribute('y1', y); n.lead.setAttribute('x2', lx); n.lead.setAttribute('y2', ly);
      n.lead.setAttribute('stroke-width', 1 * k); n.lead.style.display = n.far ? '' : 'none';
    });
  }

  function drawPins() {
    (M.rings || []).forEach(r => { const c = P(r.ll); if (!c) return; el('circle', { cx: c[0], cy: c[1], r: r.miles * 1300 / 3959, fill: 'none', stroke: PAL[r.cat] || PAL.a, 'stroke-width': 1.3, 'stroke-dasharray': '5 5', opacity: .6 }, svg); });
    const leads = el('g', { class: 'leads' }, svg);
    annoG = el('g', { class: 'anno' }, svg);
    const g = el('g', { class: 'pins' }, svg), labels = el('g', { class: 'labels', 'aria-hidden': 'true' }, svg);
    nodes = pins.map(p => {
      const xy = P(p.ll); if (!xy) return null;
      const c = PAL[p.cat] || PAL.a, name = String(p.title).split(':')[0].replace(/\*\*/g, '').trim();
      const pg = el('g', { class: 'pin', tabindex: 0, role: 'button', 'aria-label': p.title + (p.when ? ', ' + p.when : '') }, g);
      const hit = el('circle', { cx: xy[0], cy: xy[1], r: 18, fill: 'transparent' }, pg);
      const pulse = el('circle', { class: 'pulse', cx: xy[0], cy: xy[1], r: 8, fill: 'none', stroke: c }, pg);
      const dot = el('circle', { class: 'pd', cx: xy[0], cy: xy[1], r: 6, fill: c, stroke: '#FCFBF8' }, pg);
      const t = el('text', { class: 'plab' }, labels); t.textContent = name;
      const lead = el('line', { class: 'plead', stroke: c }, leads);
      const n = { i: 0, p, xy, g: pg, hit, pulse, dot, t, lead, state: 'active', hl: false };
      pg.addEventListener('click', () => place(n.i));
      pg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(n.i); } });
      return n;
    }).filter(Boolean);
    nodes.forEach((n, k) => { n.i = k; });
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
    go(BO.t == null ? 0 : stepAt(BO.t), true);
  }
  const start = () => {
    if (typeof d3 === 'undefined' || !d3.geoAlbersUsa) return;
    fetch('/assets/vendor/states-10m.json').then(r => r.json()).then(init, () => init(null));
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start, start);
  // labels are laid out again whenever the map changes size (including the first time it is actually drawn)
  new ResizeObserver(() => layout()).observe(svg);
})();

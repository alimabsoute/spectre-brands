/* Generic Chart.js renderer. Every chart on a page is a JSON spec in #bo-data (charts[id].views[]),
   produced by a {"kind":"chart"} block. See SCHEMA.md "Chart spec" for every option. */
(function () {
  const D = (window.BO && BO.data) || {}, specs = D.charts || {};
  if (typeof Chart === 'undefined' || !Object.keys(specs).length) return;
  const C = { ink: '#1d1b18', red: '#a8321f', gold: '#93743a', green: '#4f7a4a', blue: '#3d5f86', plum: '#8a5a9a', tan: '#c9b48a', sand: '#ddd3c2', grid: '#e6dfcf', mute: '#6b6457', paper: '#fffdf8', hand: '#1f2a44' };
  const col = v => (v && C[v]) || v || C.ink;
  const mob = () => innerWidth < 640;
  Chart.defaults.font.family = 'Inter, system-ui, sans-serif'; Chart.defaults.font.size = 12; Chart.defaults.color = C.mute;
  Chart.defaults.plugins.legend.labels.boxWidth = 12; Chart.defaults.plugins.legend.labels.boxHeight = 12;
  Chart.defaults.maintainAspectRatio = false; Chart.defaults.animation.duration = 800;
  const tip = { backgroundColor: '#fff', titleColor: C.ink, bodyColor: C.ink, footerColor: C.mute, borderColor: C.ink, borderWidth: 1, padding: 10, cornerRadius: 0, titleFont: { weight: '600' }, footerFont: { weight: '400' } };

  const FMT = {
    usd: v => '$' + (+v).toLocaleString(), usd2: v => '$' + (+v).toFixed(2), usdK: v => '$' + v + 'K', usdM: v => '$' + v + 'M', usdB: v => '$' + v + 'B',
    pct: v => v + '%', num: v => (+v).toLocaleString(), x: v => v + '×',
    usdAuto: v => { const a = Math.abs(v); return a >= 1e9 ? '$' + (v / 1e9).toFixed(a >= 1e10 ? 0 : 1) + 'B' : a >= 1e6 ? '$' + (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M' : '$' + (+v).toLocaleString(); }
  };
  const fmt = (f, v) => v == null ? '' : Array.isArray(v) ? v.map(x => fmt(f, x)).join(' – ') : typeof f === 'object' && f ? (f.pre || '') + (f.dec != null ? (+v).toFixed(f.dec) : (+v).toLocaleString()) + (f.suf || '') : (FMT[f] || (x => x))(v);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Nasdaq reference series (data/nasdaq.json): labels become dates; events snap to the nearest week.
  function nasdaq(s) {
    const all = (D.nasdaq && D.nasdaq.data) || [];
    return all.filter(p => (!s.from || p[0] >= s.from) && (!s.to || p[0] <= s.to));
  }
  const nearest = (labels, d) => { let bi = 0, bd = Infinity; labels.forEach((l, i) => { const x = Math.abs(Date.parse(l) - Date.parse(d)); if (x < bd) { bd = x; bi = i; } }); return bi; };

  function build(spec) {
    const sp = JSON.parse(JSON.stringify(spec));
    let labels = sp.labels || [];
    const ref = sp.series.find(s => s.ref === 'nasdaq');
    let NQ = null;
    if (ref) { NQ = nasdaq(sp); labels = NQ.map(p => p[0]); }
    const base = ref && ref.indexTo ? NQ[nearest(labels, ref.indexTo)][1] : null;
    const evNames = {};
    const refData = NQ ? NQ.map(p => base ? +(p[1] / base * 100).toFixed(1) : p[1]) : null;
    const datasets = sp.series.map((s, k) => {
      let data = s.data;
      if (s.ref === 'nasdaq') data = refData;
      if (s.events) { data = labels.map(() => null); evNames[k] = {}; s.events.forEach(e => { const i = nearest(labels, e[0]); data[i] = e[1] ?? (refData ? refData[i] : null); evNames[k][i] = e[2] + ' (' + e[0] + ')'; }); }
      const t = s.type || (sp.type === 'doughnut' ? 'doughnut' : sp.type || 'bar');
      const c = s.colors ? s.colors.map(col) : col(s.color);
      const ds = { type: t, label: s.label, data, yAxisID: s.axis || 'y', backgroundColor: c, borderColor: t === 'line' ? c : (t === 'doughnut' ? C.paper : c), order: s.order ?? (t === 'line' ? 0 : 1) };
      if (sp.horizontal && t !== 'line') { ds.xAxisID = s.axis === 'y1' ? 'x1' : 'x'; delete ds.yAxisID; }
      if (s.stack) ds.stack = s.stack;
      if (t === 'bar') { ds.borderRadius = 2; if (s.barPercentage) ds.barPercentage = s.barPercentage; }
      if (t === 'doughnut') { ds.borderWidth = 3; ds.hoverOffset = 10; }
      if (t === 'line') {
        Object.assign(ds, { borderWidth: s.width || 2.2, tension: s.tension ?? .25, pointRadius: s.points ?? (s.events ? 7 : (labels.length > 40 ? 0 : 3.5)), spanGaps: !!s.spanGaps });
        if (s.dashed) ds.borderDash = [5, 4];
        if (s.fill) { ds.fill = 'origin'; ds.backgroundColor = s.fillColor || 'rgba(29,27,24,.05)'; }
        if (s.events) Object.assign(ds, { showLine: false, pointBackgroundColor: C.paper, pointBorderColor: c, pointBorderWidth: 2.5, pointHoverRadius: 9 });
        if (s.pointColors) ds.pointBackgroundColor = s.pointColors.map(col);
        if (s.showLine === false) ds.showLine = false;
      }
      return ds;
    });
    const axis = (a, pos, isIdx) => {
      a = a || {};
      const o = { position: pos, grid: { color: isIdx ? 'transparent' : C.grid, display: !isIdx && !a.noGrid }, stacked: !!sp.stacked };
      if (a.log) o.type = 'logarithmic';
      if (a.min != null) o.min = a.min; if (a.max != null) o.max = a.max;
      if (a.title && !mob()) o.title = { display: true, text: a.title };
      o.ticks = {};
      if (a.format) o.ticks.callback = v => (a.ticks && !a.ticks.includes(+v)) ? '' : fmt(a.format, v);
      return o;
    };
    const scales = {};
    if (sp.type !== 'doughnut') {
      const v = sp.horizontal ? 'x' : 'y', ix = sp.horizontal ? 'y' : 'x';
      scales[v] = axis(sp.y, sp.horizontal ? 'bottom' : 'left');
      if (sp.y1) { scales[v + '1'] = axis(sp.y1, sp.horizontal ? 'top' : 'right'); scales[v + '1'].grid = { display: false }; }
      scales[ix] = axis(sp.x, sp.horizontal ? 'left' : 'bottom', true);
      scales[ix].ticks = { maxRotation: 0, autoSkip: !ref, font: { size: mob() ? 10 : 12 } };
      if (ref) scales[ix].ticks.callback = (v, i) => { const d = labels[i], p = i ? labels[i - 1] : ''; const m = d.slice(5, 7); return (i === 0 || (m !== p.slice(5, 7) && (mob() ? m === '01' : ['01', '07'].includes(m)))) ? MON[+m - 1] + " '" + d.slice(2, 4) : ''; };
      else if (mob() && labels.length > 8) scales[ix].ticks.callback = (v, i) => i % 2 ? '' : labels[i];
    }
    const tf = sp.tooltip || {};
    const plugins = {
      legend: sp.legend === false ? { display: false } : { position: 'bottom', labels: { filter: l => !(sp.series[l.datasetIndex] || {}).hideLegend } },
      tooltip: { ...tip, filter: c => c.raw != null, callbacks: {
        label: c => {
          const s = sp.series[c.datasetIndex] || {};
          if (evNames[c.datasetIndex]) return ' ' + evNames[c.datasetIndex][c.dataIndex] + ': ' + fmt(tf.format || (sp.y || {}).format, c.raw);
          const f = s.format || tf.format || (s.axis === 'y1' ? (sp.y1 || {}).format : (sp.y || {}).format);
          if (sp.type === 'doughnut') { const tot = c.dataset.data.reduce((a, b) => a + b, 0); return ` ${c.label}: ${fmt(f, c.raw)} (${Math.round(c.raw / tot * 100)}%)`; }
          return ` ${c.dataset.label}: ${fmt(f, c.raw)}`;
        },
        footer: c => tf.footers ? (tf.footers[c[0].dataIndex] || '') : ''
      } }
    };
    const extra = [];
    (sp.refLines || []).forEach(r => extra.push(refLine(r, sp.horizontal)));
    if (sp.notes && sp.notes.length) extra.push(notes(sp.notes, sp.horizontal));
    return { type: sp.type === 'doughnut' ? 'doughnut' : 'bar', data: { labels: labels.map(l => Array.isArray(l) || !String(l).includes('|') ? l : String(l).split('|')), datasets },
      options: { indexAxis: sp.horizontal ? 'y' : 'x', cutout: sp.type === 'doughnut' ? (sp.cutout || '60%') : undefined, interaction: sp.type === 'doughnut' ? undefined : { mode: ref ? 'nearest' : 'index', intersect: false }, plugins, scales }, plugins: extra };
  }

  function refLine(r, hz) {
    return { id: 'ref' + r.value, afterDatasetsDraw(c) {
      const vert = (r.axis || (hz ? 'x' : 'y')) === 'x'; const s = c.scales[vert ? 'x' : 'y'], a = c.chartArea, x = c.ctx; if (!s) return;
      const p = s.getPixelForValue(r.value); x.save(); x.strokeStyle = C.ink; x.setLineDash([5, 4]); x.lineWidth = 1.5; x.beginPath();
      if (vert) { x.moveTo(p, a.top); x.lineTo(p, a.bottom); } else { x.moveTo(a.left, p); x.lineTo(a.right, p); }
      x.stroke(); x.setLineDash([]); x.fillStyle = C.ink; x.font = '600 11px Inter';
      if (r.label) vert ? x.fillText(r.label, p + 5, a.top + 11) : x.fillText(r.label, a.left + 6, p - 5); x.restore();
    } };
  }

  // Hand-drawn annotation: a rough box with Caveat text and a curved arrow to a data point.
  function notes(list, hz) {
    return { id: 'roughNotes', afterDraw(c) {
      if (typeof rough === 'undefined' || c.width < 560) return;
      const rc = rough.canvas(c.canvas), ctx = c.ctx, A = c.chartArea;
      list.forEach((n, k) => {
        let tx, ty;
        if (n.s != null) { const ix = typeof n.i === 'string' ? nearest(c.data.labels, n.i.replace(/^ev:/, '')) : n.i; const el = c.getDatasetMeta(n.s).data[ix]; if (!el) return; tx = el.x; ty = n.top ? el.y : el.y; if (el.width && !hz) ty = el.y; }
        else { tx = c.scales[hz ? 'x' : 'x'].getPixelForValue(n.x); ty = c.scales.y.getPixelForValue(n.y); }
        ctx.save(); ctx.font = '600 17px Caveat, cursive';
        const w = Math.max(...n.text.map(l => ctx.measureText(l).width)) + 22, h = n.text.length * 19 + 14;
        let bx = tx + (n.dx || 20), by = ty + (n.dy || -h - 20);
        bx = Math.max(A.left + 2, Math.min(bx, A.right - w - 2)); by = Math.max(A.top + 2, Math.min(by, A.bottom - h - 2));
        rc.rectangle(bx, by, w, h, { roughness: 1.2, stroke: C.hand, strokeWidth: 1.3, fill: C.paper, fillStyle: 'solid', seed: 7 + k * 5 });
        ctx.fillStyle = C.hand; n.text.forEach((l, j) => ctx.fillText(l, bx + 11, by + 22 + j * 19));
        const sx = Math.max(bx, Math.min(tx, bx + w)), sy = ty > by + h ? by + h : (ty < by ? by : by + h / 2);
        const mx = (sx + tx) / 2 + (ty - sy) * .15, my = (sy + ty) / 2 - (tx - sx) * .15;
        rc.curve([[sx, sy], [mx, my], [tx, ty]], { roughness: 1, stroke: C.hand, strokeWidth: 1.5, seed: 9 + k * 5 });
        const an = Math.atan2(ty - my, tx - mx);
        [.45, -.45].forEach((d, q) => rc.line(tx, ty, tx - 10 * Math.cos(an + d), ty - 10 * Math.sin(an + d), { roughness: .7, stroke: C.hand, strokeWidth: 1.5, seed: 11 + k * 5 + q }));
        ctx.restore();
      });
    } };
  }

  const live = {};
  function draw(id, v) {
    const cv = document.getElementById(id); if (!cv) return;
    live[id] && live[id].destroy();
    try { live[id] = new Chart(cv, build(specs[id].views[v || 0])); } catch (e) { console.warn('chart ' + id, e); }
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { draw(e.target.id, 0); io.unobserve(e.target); } }), { rootMargin: '250px 0px' });
  const go = () => {
    Object.keys(specs).forEach(id => { const cv = document.getElementById(id); cv && io.observe(cv); });
    document.querySelectorAll('.seg[data-chart]').forEach(seg => seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); draw(seg.dataset.chart, +b.dataset.v);
    })));
  };
  (document.fonts && document.fonts.load ? Promise.all([document.fonts.load('600 17px Caveat')]).catch(() => 0) : Promise.resolve()).then(go, go);
})();

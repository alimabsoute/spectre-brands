// Infographic blocks, rendered to HTML/SVG at build time (no chart library needed in the browser).
// Every block carries its numbers as a real table (<details class="data">) and never relies on colour
// alone: values are printed, series are labelled, and turning points are numbered.
// Kinds: arc, waffle, flow, multiples, counters, scale, chain, compare, bars. See SCHEMA.md section 7.
import { esc, inline, md } from './md.mjs';
import { picture } from './media.mjs';

// ---- shared helpers ----
const FMT = {
  usd: v => '$' + (+v).toLocaleString('en-US'), usd2: v => '$' + (+v).toFixed(2), usdK: v => '$' + v + 'K', usdM: v => '$' + v + 'M', usdB: v => '$' + v + 'B',
  pct: v => v + '%', num: v => (+v).toLocaleString('en-US'), x: v => v + '×'
};
export const fmt = (f, v) => v == null ? '' : typeof f === 'object' && f ? (f.pre || '') + (f.dec != null ? (+v).toFixed(f.dec) : (+v).toLocaleString('en-US')) + (f.suf || '') : (FMT[f] || (x => typeof x === 'number' ? x.toLocaleString('en-US') : x))(v);

const NAMED = { brand: 'var(--brand)', ink: 'var(--ink)', red: 'var(--c-red)', blue: 'var(--c-blue)', green: 'var(--c-green)', gold: 'var(--c-gold)', plum: 'var(--c-plum)', teal: 'var(--c-teal)', grey: 'var(--c-grey)', gray: 'var(--c-grey)', light: 'var(--c-light)' };
const CYCLE = ['brand', 'blue', 'gold', 'green', 'plum', 'teal', 'grey'];
export const color = (c, i = 0) => NAMED[c] || c || NAMED[CYCLE[i % CYCLE.length]];
const plain = s => String(s ?? '').replace(/\[\^\d+\]/g, '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

function head(b, label) {
  if (!b.title && !b.subtitle) return '';
  return `<div class="card-head"><div><h3 class="fig-t" data-fig="${esc(label || 'Figure')}">${inline(b.title || '')}</h3>${b.subtitle ? `<p>${inline(b.subtitle)}</p>` : ''}</div></div>`;
}
const src = b => b.source ? `<div class="src">${inline(String(b.source).replace(/^Sources?:\s*/i, ''))}</div>` : '';
export function dataTable(cols, rows, caption) {
  return `<details class="data"><summary>Data table</summary><div class="tbl-scroll"><table class="cmp">${caption ? `<caption>${esc(plain(caption))}</caption>` : ''}<thead><tr>${cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c ?? '')}</td>` : `<th scope="row">${esc(c ?? '')}</th>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
}
const fig = (b, cls, inner, table) => `<figure class="card fig info ig-${cls} rv">${head(b)}${inner}${b.note ? `<p class="fig-note">${inline(b.note)}</p>` : ''}${table || ''}${src(b)}</figure>`;

function niceTicks(min, max, n = 4) {
  if (min === max) max = min + 1;
  const raw = (max - min) / n, mag = 10 ** Math.floor(Math.log10(raw)), norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2.5 ? 5 : norm >= 2 ? 2.5 : norm >= 1 ? 2 : 1) * mag;
  const lo = Math.floor(min / step) * step, out = [];
  for (let v = lo; v < max + step * 0.999; v += step) out.push(+v.toFixed(10));
  return out;
}
function wrap(text, max) {
  const out = []; let line = '';
  for (const w of String(text).split(/\s+/)) { if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }
  if (line) out.push(line);
  return out;
}

// ---- arc: a rise-and-fall line with numbered turning points ----
function arcSvg(b, W, H, cls) {
  const m = { l: 52, r: 14, t: 14, b: 30 }, n = b.labels.length;
  const all = b.series.flatMap(s => s.data).filter(v => v != null);
  const ticks = niceTicks(Math.min(0, ...all), Math.max(...all), W < 500 ? 3 : 4);
  const y0 = ticks[0], y1 = ticks.at(-1);
  const X = i => m.l + (n > 1 ? i / (n - 1) : .5) * (W - m.l - m.r), Y = v => m.t + (1 - (v - y0) / (y1 - y0)) * (H - m.t - m.b);
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((W - m.l) / 62))));
  let g = ticks.map(t => `<line class="ig-grid${t === 0 ? ' zero' : ''}" x1="${m.l}" x2="${W - m.r}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}"/><text class="ig-tick" x="${m.l - 8}" y="${(Y(t) + 4).toFixed(1)}" text-anchor="end">${esc(fmt(b.format, t))}</text>`).join('');
  const shownX = b.labels.map((_, i) => i).filter(i => i % every === 0 && (n - 1 - i) >= every * 0.75);
  if (!shownX.includes(n - 1)) shownX.push(n - 1);
  g += shownX.map(i => `<text class="ig-tick" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${esc(b.labels[i])}</text>`).join('');
  b.series.forEach((s, k) => {
    const pts = s.data.map((v, i) => v == null ? null : [X(i), Y(v)]);
    const segs = []; let cur = [];
    pts.forEach(p => { if (p) cur.push(p); else if (cur.length) { segs.push(cur); cur = []; } }); if (cur.length) segs.push(cur);
    const c = color(s.color, k);
    segs.forEach(sg => {
      const d = sg.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
      if (k === 0 && b.area !== false) g += `<path class="ig-area" d="${d}L${sg.at(-1)[0].toFixed(1)} ${Y(Math.max(0, y0)).toFixed(1)}L${sg[0][0].toFixed(1)} ${Y(Math.max(0, y0)).toFixed(1)}Z" fill="${c}"/>`;
      g += `<path class="ig-line${k ? ' second' : ''}" d="${d}" stroke="${c}" pathLength="1"/>`;
    });
    pts.forEach((p, i) => { if (p) g += `<circle class="ig-hit" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="9" data-tip="${esc(`${b.labels[i]} · ${s.label}: ${fmt(s.format || b.format, s.data[i])}`)}"/>`; });
  });
  (b.points || []).forEach((p, j) => {
    const s = b.series[p.s || 0], v = s.data[p.i]; if (v == null) return;
    g += `<g class="ig-mark" style="--d:${j}"><circle cx="${X(p.i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="10"/><text x="${X(p.i).toFixed(1)}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="middle">${j + 1}</text></g>`;
  });
  return `<svg class="ig-svg ${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(plain(b.title))}. ${esc(b.series.map(s => `${s.label}: from ${fmt(s.format || b.format, s.data.find(v => v != null))} to ${fmt(s.format || b.format, s.data.filter(v => v != null).at(-1))}`).join('; '))}.">${g}</svg>`;
}
function arc(b) {
  const legend = b.series.length > 1 ? `<div class="ig-legend">${b.series.map((s, k) => `<span><i class="${k ? 'dash' : 'solid'}" style="--c:${color(s.color, k)}"></i>${esc(s.label)}</span>`).join('')}</div>` : '';
  const notes = (b.points || []).length ? `<ol class="arc-notes">${b.points.map(p => `<li><b>${esc(b.labels[p.i])}${p.title ? ` · ${inline(p.title)}` : ''}</b> ${inline(p.text || '')}</li>`).join('')}</ol>` : '';
  const table = dataTable([b.xLabel || 'Period', ...b.series.map(s => s.label)], b.labels.map((l, i) => [l, ...b.series.map(s => fmt(s.format || b.format, s.data[i]))]), b.title);
  return fig(b, 'arc', `${legend}<div class="ig-box">${arcSvg(b, 760, 330, 'wide')}${arcSvg(b, 380, 250, 'narrow')}</div>${notes}`, table);
}

// ---- waffle: 100 squares split by share ----
function shares(items) {
  const tot = items.reduce((a, x) => a + x.value, 0), raw = items.map(x => x.value / tot * 100), fl = raw.map(Math.floor);
  let left = 100 - fl.reduce((a, x) => a + x, 0);
  raw.map((r, i) => [r - fl[i], i]).sort((a, c) => c[0] - a[0]).forEach(([, i]) => { if (left-- > 0) fl[i]++; });
  return fl;
}
export function waffle(b) {
  const n = shares(b.items), cells = [];
  b.items.forEach((x, i) => { for (let k = 0; k < n[i]; k++) cells.push(`<i class="p${i % 6}" style="--c:${color(x.color, i)}" data-tip="${esc(`${plain(x.label)}: ${fmt(b.format || 'pct', x.value)}`)}"></i>`); });
  const legend = `<ol class="wf-legend">${b.items.map((x, i) => `<li><i class="p${i % 6}" style="--c:${color(x.color, i)}"></i><b>${esc(fmt(b.format || 'pct', x.value))}</b><span>${inline(x.label)}${x.note ? `<small>${inline(x.note)}</small>` : ''}</span></li>`).join('')}</ol>`;
  const table = dataTable([b.itemLabel || 'Item', b.valueLabel || 'Share'], b.items.map(x => [plain(x.label), fmt(b.format || 'pct', x.value)]), b.title);
  return fig(b, 'waffle', `<div class="wf"><div class="wf-grid" role="img" aria-label="${esc(plain(b.title))}: ${esc(b.items.map(x => `${plain(x.label)} ${fmt(b.format || 'pct', x.value)}`).join(', '))}">${cells.join('')}</div>${legend}</div>`, table);
}

// ---- flow: where the money went (one source, several destinations) ----
function flowSvg(b, W, cls) {
  const n = b.to.length, slot = W < 500 ? 62 : 58, H = Math.max(n * slot, 240), total = b.from.value;
  const bw = 16, x0 = 0, x1 = W < 500 ? 96 : Math.round(W * 0.36), tx = x1 + bw + 12, chars = Math.floor((W - tx) / 6.6);
  let g = '', acc = 0;
  const unit = (H - 8) / total;
  b.to.forEach((t, i) => {
    const c = color(t.color, i), h = Math.max(3, t.value * unit), ys = acc * unit + 4; acc += t.value;
    const cy = (i + .5) * (H / n), th = Math.min(Math.max(4, h), H / n - 10), yt = cy - th / 2;
    g += `<path class="ig-ribbon" d="M${x0 + bw} ${ys.toFixed(1)}C${(x0 + bw + x1) / 2} ${ys.toFixed(1)} ${(x0 + bw + x1) / 2} ${yt.toFixed(1)} ${x1} ${yt.toFixed(1)}L${x1} ${(yt + th).toFixed(1)}C${(x0 + bw + x1) / 2} ${(yt + th).toFixed(1)} ${(x0 + bw + x1) / 2} ${(ys + h).toFixed(1)} ${x0 + bw} ${(ys + h).toFixed(1)}Z" fill="${c}" style="--d:${i}" data-tip="${esc(`${plain(t.label)}: ${fmt(b.format, t.value)} (${Math.round(t.value / total * 100)}% of ${fmt(b.format, total)})`)}"/>`;
    g += `<rect x="${x0}" y="${ys.toFixed(1)}" width="${bw}" height="${Math.max(1, h - 1.5).toFixed(1)}" fill="${c}"/><rect x="${x1}" y="${yt.toFixed(1)}" width="${bw}" height="${th.toFixed(1)}" fill="${c}"/>`;
    const lines = wrap(plain(t.label), chars).slice(0, 2);
    g += `<text class="ig-val" x="${tx}" y="${(cy - (lines.length > 1 ? 10 : 3)).toFixed(1)}">${esc(fmt(b.format, t.value))}<tspan class="ig-pct"> ${Math.round(t.value / total * 100)}%</tspan></text>`;
    lines.forEach((ln, j) => { g += `<text class="ig-lab" x="${tx}" y="${(cy - (lines.length > 1 ? 10 : 3) + 16 + j * 15).toFixed(1)}">${esc(ln)}</text>`; });
  });
  return `<svg class="ig-svg ${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(plain(b.title))}: ${esc(fmt(b.format, total))} ${esc(plain(b.from.label))}, split into ${esc(b.to.map(t => `${plain(t.label)} ${fmt(b.format, t.value)}`).join('; '))}">${g}</svg>`;
}
function flow(b) {
  const sum = b.to.reduce((a, t) => a + t.value, 0);
  if (Math.abs(sum - b.from.value) / b.from.value > 0.011) throw new Error(`flow "${b.title}": destinations sum to ${sum}, source is ${b.from.value}; add a remainder item so they match`);
  const table = dataTable(['Where it went', 'Amount', 'Share', 'Note'], b.to.map(t => [plain(t.label), fmt(b.format, t.value), Math.round(t.value / b.from.value * 100) + '%', plain(t.note || '')]), b.title);
  const notes = b.to.some(t => t.note) ? `<ul class="flow-notes">${b.to.filter(t => t.note).map(t => `<li><b>${inline(t.label)}.</b> ${inline(t.note)}</li>`).join('')}</ul>` : '';
  return fig(b, 'flow', `<div class="flow-from"><b>${esc(fmt(b.format, b.from.value))}</b> ${inline(b.from.label)}</div><div class="ig-box">${flowSvg(b, 760, 'wide')}${flowSvg(b, 360, 'narrow')}</div>${notes}`, table);
}

// ---- multiples: one small line per competitor, with who survived ----
function sparkline(data, c) {
  const W = 200, H = 56, p = 5, v = data.filter(x => x != null), mx = Math.max(...v), mn = Math.min(0, ...v);
  const pts = data.map((x, i) => x == null ? null : [p + i * (W - 2 * p) / (data.length - 1 || 1), H - p - (x - mn) / (mx - mn || 1) * (H - 2 * p)]).filter(Boolean);
  const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" preserveAspectRatio="none"><path d="M${p} ${H - p}H${W - p}" class="ig-grid"/><path class="ig-area" d="${d}L${pts.at(-1)[0].toFixed(1)} ${H - p}L${pts[0][0].toFixed(1)} ${H - p}Z" fill="${c}"/><path class="ig-line" d="${d}" stroke="${c}" pathLength="1" vector-effect="non-scaling-stroke"/><circle cx="${pts.at(-1)[0].toFixed(1)}" cy="${pts.at(-1)[1].toFixed(1)}" r="3.5" fill="${c}"/></svg>`;
}
const STATUS = { alive: 'Survived', dead: 'Dead', acquired: 'Acquired', ghost: 'Ghost', merged: 'Merged' };
function multiples(b) {
  const cards = b.items.map(x => {
    const c = x.self ? 'var(--brand)' : x.status === 'alive' ? 'var(--c-green)' : 'var(--c-grey)';
    return `<div class="mult${x.self ? ' self' : ''}"><div class="mult-top"><h4>${esc(x.name)}</h4><span class="tag ${esc(x.status)}">${esc(x.statusLabel || STATUS[x.status] || x.status)}</span></div>${x.data && x.data.length > 1 ? `<div class="mult-spark">${sparkline(x.data, c)}${x.range ? `<div class="mult-range"><span>${esc(x.range[0])}</span><span>${esc(x.range[1])}</span></div>` : ''}</div>` : ''}<div class="mult-val">${x.value ? `<b>${esc(x.value)}</b> ` : ''}${inline(x.text || '')}</div></div>`;
  }).join('');
  const table = dataTable(['Company', 'Outcome', b.metric || 'Figure', 'Notes', ...(b.items[0].data ? ['Series'] : [])], b.items.map(x => [x.name, x.statusLabel || STATUS[x.status] || x.status, x.value || '', plain(x.text || ''), ...(x.data ? [x.data.map(v => v ?? 'n/a').join(', ')] : [])]), b.title);
  return fig(b, 'multiples', `<div class="mult-grid">${cards}</div>`, table);
}

// ---- counters: large figures that tick up, each with a context sentence ----
export function counters(b) {
  const rows = b.items.map(x => `<div class="ctr"><div class="ctr-v" data-count="${esc(x.value)}">${esc(x.value)}</div><div class="ctr-t">${inline(x.text)}</div></div>`).join('');
  return `<div class="counters rv${b.compact ? ' compact' : ''}">${b.title ? `<h3 class="ctr-h">${inline(b.title)}</h3>` : ''}<div class="ctr-rows">${rows}</div>${src(b)}</div>`;
}

// ---- scale: "A = N × B", drawn as N small icons ----
const ICONS = ['tv', 'box', 'store', 'coin', 'person', 'van', 'bottle', 'disc', 'cart', 'dot', 'ticket', 'burger', 'phone', 'gamepad'];
function scale(b) {
  if (!ICONS.includes(b.icon || 'dot')) throw new Error(`scale "${b.title}": unknown icon "${b.icon}" (use one of ${ICONS.join(', ')})`);
  const count = Math.round(b.count), shown = Math.min(count, 300);
  const icons = Array.from({ length: shown }, (_, i) => `<i class="ico ico-${b.icon || 'dot'}" style="--d:${i}"></i>`).join('');
  const table = dataTable(['', 'Value'], [[plain(b.left.label), b.left.value], [plain(b.unit.label), b.unit.value], ['Ratio', `${b.count} (derived)`]], b.title);
  return fig(b, 'scale', `<div class="scale-eq"><div><b>${esc(b.left.value)}</b><span>${inline(b.left.label)}</span></div><div class="scale-op">=</div><div><b>${esc(String(b.countLabel || count.toLocaleString('en-US')))} ×</b><span>${inline(b.unit.label)} (${esc(b.unit.value)}${b.per ? `; each icon is ${esc(b.per)}` : ''})</span></div></div><div class="scale-icons" role="img" aria-label="${esc(count)} icons, one per ${esc(plain(b.unit.label))}">${icons}</div>${b.equation ? `<p class="fig-note"><span class="lbl-derived">Derived</span> ${inline(b.equation)}</p>` : ''}`, table);
}

// ---- chain: who has owned the name ----
function chain(b) {
  const nodes = b.nodes.map((x, i) => `<li class="chain-n ${esc(x.status || '')}" style="--d:${i}"><div class="chain-when">${esc(x.when)}</div><div class="chain-box"><h4>${inline(x.owner)}</h4><p>${inline(x.what || '')}</p>${x.price ? `<div class="chain-price">${inline(x.price)}</div>` : ''}</div></li>`).join('');
  const table = dataTable(['When', 'Owner', 'What happened', 'Price'], b.nodes.map(x => [x.when, plain(x.owner), plain(x.what || ''), plain(x.price || '')]), b.title);
  return fig(b, 'chain', `<ol class="chain">${nodes}</ol>`, table);
}

// ---- compare: then vs now slider ----
function compare(b, ctx) {
  const layer = (s, k) => `<div class="cmpr-layer cmpr-${k}">${s.image ? picture(ctx, s.image, { alt: s.alt || `${plain(s.label)}: ${plain(s.caption || '')}` }) : s.art ? `<div class="cmpr-art">${ctx.art(s.art)}</div>` : ''}<span class="cmpr-tag">${esc(s.label)}</span></div>`;
  return `<figure class="card fig info compare rv">${head(b)}<div class="cmpr" style="--pos:50%;aspect-ratio:${esc(b.ratio || '16/10')}">${layer(b.before, 'a')}${layer(b.after, 'b')}<span class="cmpr-handle" aria-hidden="true"></span><input type="range" min="0" max="100" value="50" aria-label="Drag to compare ${esc(plain(b.before.label))} with ${esc(plain(b.after.label))}"></div><div class="cmpr-caps"><p><b>${esc(b.before.label)}.</b> ${inline(b.before.caption || '')}</p><p><b>${esc(b.after.label)}.</b> ${inline(b.after.caption || '')}</p></div>${src(b)}</figure>`;
}

// ---- bars: ranked horizontal bars with printed values ----
function bars(b) {
  const mx = Math.max(...b.items.map(x => Math.abs(x.value)));
  const rows = b.items.map((x, i) => `<div class="hb${x.self ? ' self' : ''}"><div class="hb-l">${inline(x.label)}</div><div class="hb-t"><span style="--w:${(Math.abs(x.value) / mx * 100).toFixed(1)}%;--c:${color(x.color || (x.self ? 'brand' : 'grey'))};--d:${i}"></span></div><div class="hb-v">${esc(x.display || fmt(b.format, x.value))}</div>${x.note ? `<div class="hb-n">${inline(x.note)}</div>` : ''}</div>`).join('');
  const table = dataTable([b.itemLabel || 'Item', b.valueLabel || 'Value', 'Note'], b.items.map(x => [plain(x.label), x.display || fmt(b.format, x.value), plain(x.note || '')]), b.title);
  return fig(b, 'bars', `<div class="hbars">${rows}</div>`, table);
}

export const INFOGRAPHICS = { arc, waffle, flow, multiples, counters, scale, chain, compare, bars };
export const INFOGRAPHIC_KINDS = Object.keys(INFOGRAPHICS);

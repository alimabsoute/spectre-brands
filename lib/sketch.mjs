// Redraws a brand drawing by hand at build time. The source SVGs are clean vector shapes; here every shape
// is traced again with the vendored rough.js generator (it needs no DOM), so lines wobble like a pen, and
// colour is reduced to ink on paper: a near-black line, the brand accent as hatching or a solid spot, and
// paper white. Geometry, wording and class names are kept; nothing is added to a drawing.
import fs from 'node:fs';

const rough = new Function(`${fs.readFileSync(new URL('../assets/vendor/rough.js', import.meta.url), 'utf8')};return rough;`)();
const INK = '#1d1b18', PAPER = '#fcfbf8', LABEL = '#3b3b42', HAND = '#1f2a44'; // HAND: the navy the source drawings letter in

const attrsOf = s => Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const num = (v, d = 0) => v == null ? d : parseFloat(v);
function tone(c) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || '');
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map(x => x + x).join('') : m[1];
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b);
  return { l: .2126 * r + .7152 * g + .0722 * b, s: mx ? (mx - Math.min(r, g, b)) / mx : 0 };
}
// What a source colour becomes: nothing, paper, ink, the brand accent, or light pencil shading.
function role(c) {
  if (!c || c === 'none') return 'none';
  if (c.toLowerCase() === HAND) return 'ink';
  const t = tone(c);
  if (!t) return 'ink';
  if (t.l > .86) return 'paper';
  if (t.l < .16 && t.s < .5) return 'ink';
  return t.s > .3 ? 'accent' : t.l > .55 ? 'paper' : 'shade';
}
const hash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 100000; };
const roundRect = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;

const cache = new Map();
export function sketch(svg, accent, key = '') {
  const id = `${key}|${accent}`;
  if (cache.has(id)) return cache.get(id);
  const gen = rough.generator(), seed0 = hash(key || svg.slice(0, 200));
  // where the drawing's words sit: a shape under a word is a sign or a label and must stay readable
  const words = [...svg.matchAll(/<text\b([^>]*)>/g)].map(m => { const a = attrsOf(m[1]); return [num(a.x), num(a.y) - num(a['font-size'], 14) * .35]; });
  const grounds = [], stack = [{ fill: '#000', stroke: 'none', 'stroke-width': '1' }];
  let n = 0;
  const colour = r => r === 'paper' ? PAPER : r === 'accent' ? accent : INK;

  let out = svg.replace(/<(\/?)([a-zA-Z]+)\b([^>]*?)(\/?)>/g, (tag, close, name, raw, selfClose) => {
    if (name === 'g' || name === 'svg') {
      if (close) stack.pop(); else if (!selfClose) stack.push({ ...stack.at(-1), ...attrsOf(raw) });
      return tag;
    }
    if (close || !['path', 'rect', 'circle', 'ellipse'].includes(name)) return tag;
    const a = { ...stack.at(-1), ...attrsOf(raw) }, own = attrsOf(raw), sw = num(a['stroke-width'], 1);
    // geometry and its box
    let box, draw;
    if (name === 'rect') { const [x, y, w, h, r] = [num(a.x), num(a.y), num(a.width), num(a.height), Math.min(num(a.rx, num(a.ry)), num(a.width) / 2, num(a.height) / 2)]; box = [x, y, x + w, y + h]; draw = o => r ? gen.path(roundRect(x, y, w, h, r), o) : gen.rectangle(x, y, w, h, o); }
    else if (name === 'circle') { const [cx, cy, r] = [num(a.cx), num(a.cy), num(a.r)]; box = [cx - r, cy - r, cx + r, cy + r]; draw = o => gen.circle(cx, cy, 2 * r, o); }
    else if (name === 'ellipse') { const [cx, cy, rx, ry] = [num(a.cx), num(a.cy), num(a.rx), num(a.ry)]; box = [cx - rx, cy - ry, cx + rx, cy + ry]; draw = o => gen.ellipse(cx, cy, 2 * rx, 2 * ry, o); }
    else {
      if (!a.d) return tag;
      const pts = gen.path(a.d, { roughness: 0, disableMultiStroke: true, seed: 1 }).sets.flatMap(s => s.ops.flatMap(op => { const p = []; for (let i = 0; i + 1 < op.data.length; i += 2) p.push([op.data[i], op.data[i + 1]]); return p; }));
      if (!pts.length) return tag;
      box = [Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])), Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1]))];
      draw = o => gen.path(a.d, o);
    }
    const w = box[2] - box[0], h = box[3] - box[1], small = Math.min(w, h) < 7 && Math.max(w, h) < 16;
    const fr = role(a.fill), sr = role(a.stroke), ft = tone(a.fill), st = tone(a.stroke);
    const label = fr !== 'none' && words.some(p => p[0] >= box[0] && p[0] <= box[2] && p[1] >= box[1] && p[1] <= box[3]);
    // fill: paper and ink are solid; the accent is hatched unless the shape is small or carries words;
    // mid greys become light pencil hatching
    let fill = 'none', hatch = null;
    if (fr === 'paper' || fr === 'ink') fill = colour(fr);
    else if (fr === 'accent') { if (label && ft.l > .6) fill = PAPER; else if (label || w * h < 900) fill = accent; else hatch = { c: accent, gap: (3.6 + ft.l * 6) * (w * h > 9000 ? 1.5 : 1), weight: 1.5 }; }
    else if (fr === 'shade') { if (label) fill = PAPER; else hatch = { c: INK, gap: w * h > 9000 ? 10 : 7, weight: .7 }; }
    if (fill !== 'none' && label) grounds.push({ box, dark: fill !== PAPER });
    const stroke = sr === 'none' ? 'none' : sr === 'paper' ? PAPER : sr === 'accent' ? accent : INK;
    const faint = sr === 'shade' || (sr === 'ink' && st && st.l > .25) ? ' stroke-opacity=".5"' : '';
    const keep = ['class', 'transform', 'opacity'].filter(k => own[k]).map(k => ` ${k}="${own[k]}"`).join('');
    n++;
    if (small) return `<${name}${Object.entries(own).filter(([k]) => !['fill', 'stroke'].includes(k)).map(([k, v]) => ` ${k}="${v}"`).join('')} fill="${hatch ? hatch.c : fill}" stroke="${stroke}"/>`;
    const d = draw({
      seed: seed0 + n, roughness: Math.max(.45, Math.min(1.15, Math.min(w, h) / 46 + .45)), bowing: 1.1, preserveVertices: true, disableMultiStroke: true, disableMultiStrokeFill: true,
      stroke, strokeWidth: sw, fill: hatch ? hatch.c : fill === 'none' ? undefined : fill, fillStyle: hatch ? 'hachure' : 'solid',
      hachureGap: hatch?.gap, fillWeight: hatch?.weight, hachureAngle: n % 2 ? -41 : -52
    });
    const paths = gen.toPaths(d).filter(p => !(p.stroke === 'none' && (!p.fill || p.fill === 'none'))).map(p => {
      const outline = p.fill === 'none' || !p.fill;
      const dd = p.d.replace(/-?\d+\.\d+/g, v => (+v).toFixed(1));
      return outline ? `<path d="${dd}" fill="none" stroke="${p.stroke}" stroke-width="${+(+p.strokeWidth).toFixed(2)}"${p.stroke === stroke ? faint : ''}/>` : `<path d="${dd}" fill="${p.fill}" stroke="none"/>`;
    }).join('');
    return keep ? `<g${keep}>${paths}</g>` : paths;
  });

  // words: handwriting stays only in drawn speech bubbles (the bold lettering); other notes are set as plain
  // small labels. A word on a dark ground is paper white; otherwise it is ink, or the accent if it was coloured.
  out = out.replace(/<text\b([^>]*)>/g, (tag, raw) => {
    const a = attrsOf(raw), p = [num(a.x), num(a.y) - num(a['font-size'], 14) * .35];
    const g = grounds.findLast(q => p[0] >= q.box[0] && p[0] <= q.box[2] && p[1] >= q.box[1] && p[1] <= q.box[3]);
    const r = role(a.fill || '#000');
    let t = tag.replace(/\sfill="[^"]*"/, '').replace(/>$/, ` fill="${g?.dark ? PAPER : r === 'accent' ? accent : r === 'paper' && !g ? PAPER : INK}">`);
    if (/Caveat/.test(a['font-family'] || '') && a['font-weight'] !== '700')
      t = t.replace(/font-family="[^"]*"/, 'font-family="Inter, sans-serif" font-weight="500"').replace(/font-size="([\d.]+)"/, (_, s) => `font-size="${(s * .62).toFixed(1)}"`).replace(/fill="[^"]*">$/, `fill="${LABEL}">`);
    return t;
  });
  cache.set(id, out);
  return out;
}

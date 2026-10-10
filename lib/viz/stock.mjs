import { esc, inline, fn } from '../md.mjs';
import { value, chartID, axes, figure, nice } from './shared.mjs';
const quarter = q => { const m = String(q).match(/^(\d{4})Q([1-4])$/); if (!m) throw new Error(`Invalid stock quarter ${q}`); return +m[1] * 4 + +m[2] - 1; };
export function stock(b, ctx) {
  const series = [...(b.series || [])].sort((a, b) => quarter(a.q) - quarter(b.q));
  if (!series.length) throw new Error('stock requires quarterly ranges');
  const seen = new Set();
  for (const p of series) {
    if (seen.has(p.q) || !Number.isFinite(p.hi) || !Number.isFinite(p.lo) || p.lo > p.hi) throw new Error(`Invalid stock range ${p.q}`);
    seen.add(p.q);
  }
  const quarters = [...series, ...(b.events || [])].map(p => quarter(p.q));
  const first = Math.min(...quarters), last = Math.max(...quarters), span = last - first + 1;
  const [min, max] = nice(Math.min(0, ...series.map(p => p.lo)), Math.max(...series.map(p => p.hi)));
  const x = q => 72 + (quarter(q) - first + .5) * 652 / span, y = v => 260 - (v - min) / (max - min || 1) * 216;
  let marks = axes(min, max, b.unit);
  const labelEvery = Math.max(1, Math.ceil(span / 8));
  for (let q = first; q <= last; q++) {
    const label = `${Math.floor(q / 4)}Q${q % 4 + 1}`, p = series.find(p => p.q === label);
    const xx = x(label), w = Math.max(1, Math.min(24, 400 / span));
    if (p) marks += `<g class="v2-range"><title>${esc(label)}: ${value(p.lo)} to ${value(p.hi)} ${esc(b.unit)}</title><path d="M${xx} ${y(p.hi)}V${y(p.lo)}M${xx - w / 2} ${y(p.hi)}h${w}M${xx - w / 2} ${y(p.lo)}h${w}"/></g>`;
    if ((q - first) % labelEvery === 0 || (q === last && (q - first) % labelEvery >= labelEvery / 2)) marks += `<text x="${xx}" y="286" text-anchor="middle">${label}</text>`;
  }
  for (const [i, e] of (b.events || []).entries()) {
    const xx = x(e.q);
    if (quarter(e.q) < first || quarter(e.q) > last) continue;
    marks += `<path class="v2-event" d="M${xx} 42V260"/><text x="${xx}" y="${38 + i % 2 * 15}" text-anchor="${xx > 590 ? 'end' : 'start'}">${esc(e.label)}</text>`;
  }
  const rows = [];
  for (let q = first; q <= last; q++) {
    const label = `${Math.floor(q / 4)}Q${q % 4 + 1}`, p = series.find(p => p.q === label);
    rows.push([label, p ? value(p.lo) : 'No data', p ? value(p.hi) : 'No data', (b.events || []).filter(e => e.q === label).map(e => inline(e.label)).join('; ') + fn(p?.src)]);
  }
  return figure(b, chartID(ctx, 'stock'), marks, rows, ['Quarter', `Low (${b.unit || ''})`, `High (${b.unit || ''})`, 'Event / sources'], `Quarterly high and low prices for ${b.ticker || ''} ${b.exchange || ''}. Missing quarters have no bar; there is no price after the last recorded quarter.`);
}

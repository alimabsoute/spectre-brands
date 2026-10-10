import { esc, fn } from '../md.mjs';
import { chartID, axes, figure, value , nice } from './shared.mjs';
const COLORS = ['--brand', '--c-blue', '--c-green', '--c-gold', '--c-plum', '--c-teal'];
export function rivalchart(b, ctx) {
  const all = (b.series || []).flatMap(s => s.points || []), numeric = all.filter(p => p.value != null);
  if (!numeric.length) throw new Error('rivalchart requires numeric points');
  if (all.some(p => !Number.isFinite(+p.year) || (p.value != null && !Number.isFinite(p.value)))) throw new Error('Invalid rivalchart point');
  const [min, max] = nice(Math.min(0, ...numeric.map(p => p.value)), Math.max(...numeric.map(p => p.value)));
  const years = all.map(p => +p.year), first = Math.min(...years), last = Math.max(...years);
  const x = year => 72 + (+year - first) / (last - first || 1) * 652, y = v => 260 - (v - min) / (max - min || 1) * 216;
  let marks = axes(min, max, b.unit), rows = [];
  for (const [i, s] of b.series.entries()) {
    const points = [...s.points].sort((a, b) => +a.year - +b.year);
    let d = '', previous = null;
    for (const p of points) {
      rows.push([esc(s.name), esc(p.year), p.value == null ? 'No data' : value(p.value), fn(p.src)]);
      if (p.value == null) { previous = null; continue; }
      d += `${previous != null && +p.year - previous <= 1 ? 'L' : 'M'}${x(p.year)} ${y(p.value)} `;
      previous = +p.year;
      marks += `<circle class="v2-point" data-point="${i}-${points.indexOf(p)}" data-s="${i}" data-year="${esc(p.year)}" data-v="${esc(value(p.value))}" cx="${x(p.year)}" cy="${y(p.value)}" r="4" style="--series:var(${COLORS[i % COLORS.length]})"><title>${esc(s.name)} ${esc(p.year)}: ${value(p.value)} ${esc(b.unit)}</title></circle>`;
    }
    marks += `<path class="v2-series" d="${d}" data-s="${i}" style="--series:var(${COLORS[i % COLORS.length]})" stroke-dasharray="${i ? `${i + 3} 3` : 'none'}"/>`;
  }
  const ticks = [...new Set(years)].sort((a, b) => a - b), step = Math.max(1, Math.ceil(ticks.length / 8));
  for (const [i, year] of ticks.entries()) if (i % step === 0 || i === ticks.length - 1) marks += `<text x="${x(year)}" y="286" text-anchor="middle">${year}</text>`;
  const legend = `<ul class="v2-legend">${b.series.map((s, i) => `<li style="--series:var(${COLORS[i % COLORS.length]})"><span aria-hidden="true">${i + 1}</span> ${esc(s.name)}</li>`).join('')}</ul>`;
  return figure(b, chartID(ctx, 'rival'), marks, rows, ['Series', 'Year', b.unit || b.metric || 'Value', 'Sources'], `${b.metric || b.title}. ${b.series.map(s => s.name).join(', ')}. Lines break at missing years.`, legend);
}

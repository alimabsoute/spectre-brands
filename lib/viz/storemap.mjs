import { esc } from '../md.mjs';
import { chartID, svg, table, value } from './shared.mjs';
import { inline, fn } from '../md.mjs';
export const TILES = [
  ['AK',0,0],['ME',11,0],['VT',10,1],['NH',11,1],['WA',1,2],['ID',2,2],['MT',3,2],['ND',4,2],['MN',5,2],['IL',6,2],['WI',7,2],['MI',8,2],['NY',9,2],['MA',10,2],['RI',11,2],
  ['OR',1,3],['NV',2,3],['WY',3,3],['SD',4,3],['IA',5,3],['IN',6,3],['OH',7,3],['PA',8,3],['NJ',9,3],['CT',10,3],['CA',1,4],['UT',2,4],['CO',3,4],['NE',4,4],['MO',5,4],['KY',6,4],['WV',7,4],['VA',8,4],['MD',9,4],['DE',10,4],
  ['AZ',2,5],['NM',3,5],['KS',4,5],['AR',5,5],['TN',6,5],['NC',7,5],['SC',8,5],['DC',9,5],['OK',4,6],['LA',5,6],['MS',6,6],['AL',7,6],['GA',8,6],['HI',0,7],['TX',4,7],['FL',9,7]
];
export function storemap(b, ctx) {
  if (!b.dates?.length || b.dates.length !== 2) throw new Error('storemap requires peak and end dates');
  for (const [state, counts] of Object.entries(b.states || {})) if (!TILES.some(t => t[0] === state) || !Array.isArray(counts) || counts.length !== 2 || counts.some(n => n != null && (!Number.isFinite(n) || n < 0))) throw new Error(`Invalid state counts ${state}`);
  const unknown = b.unknown || [null, null], sums = [0, 1].map(i => Object.values(b.states || {}).reduce((sum, ns) => sum + (ns[i] || 0), 0) + (unknown[i] || 0));
  for (let i = 0; i < 2; i++) if (b.totals?.[i] != null && (unknown[i] == null || sums[i] !== b.totals[i])) ctx.warn?.(`storemap "${b.title}" ${b.dates[i]}: states + unknown = ${sums[i]}, total = ${b.totals[i]}${unknown[i] == null ? '; unknown count not supplied' : ''}`);
  const max = Math.max(1, ...Object.values(b.states || {}).flat().filter(n => n != null)), id = chartID(ctx, 'storemap');
  const maps = b.dates.map((date, i) => {
    const marks = TILES.map(([state, x, y]) => {
      const n = b.states?.[state]?.[i], percent = n == null ? 0 : Math.round(Math.sqrt(n / max) * 85 + 10);
      return `<g class="v2-tile${n == null ? ' unknown' : ''}" transform="translate(${x * 50 + 8},${y * 50 + 8})"><title>${state}, ${esc(date)}: ${n == null ? 'Unknown' : `${value(n)} stores`}</title><rect width="46" height="46" rx="3" style="fill:color-mix(in srgb,var(--brand) ${percent}%,var(--card))"/><text x="23" y="20" text-anchor="middle">${state}</text><text x="23" y="36" text-anchor="middle">${n == null ? '?' : value(n)}</text></g>`;
    }).join('');
    return `<div><h4>${esc(date)}</h4>${svg(`${id}-${i}`, `${b.title}: ${date}`, 'All fifty states and DC. Question marks mean unknown; zero means a reported zero.', marks, '0 0 610 410')}<p>Unknown bucket: ${value(unknown[i])} · Total: ${value(b.totals?.[i])}</p></div>`;
  }).join('');
  const rows = TILES.map(([state]) => [state, value(b.states?.[state]?.[0]), value(b.states?.[state]?.[1])]);
  rows.push(['Unknown bucket', ...unknown.map(value)], ['Total', ...[0,1].map(i => value(b.totals?.[i]))]);
  return `<figure class="card v2-viz v2-storemap" id="${id}"><h3>${inline(b.title)}</h3><div class="v2-map-pair">${maps}</div><p class="v2-map-scale">Tint increases with store count. Both maps use the same scale, 0 to ${value(max)}. ? = unknown.</p><figcaption>${inline(b.note || b.title)}${fn(b.src)}</figcaption>${table(['State / bucket', ...b.dates], rows, b.title)}</figure>`;
}

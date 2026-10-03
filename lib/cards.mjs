// The brand card used on the homepage, category pages and "more post-mortems".
import { esc, inline } from './md.mjs';
import { TIERS } from './registry.mjs';

export function spark(vals, peakIndex) {
  if (!vals || vals.length < 2) return '';
  const mx = Math.max(...vals), mn = Math.min(...vals, 0), W = 210, H = 56, p = 5;
  const pts = vals.map((v, i) => [p + i * (W - 2 * p) / (vals.length - 1), H - p - (v - mn) / (mx - mn || 1) * (H - 2 * p)]);
  const pk = peakIndex ?? vals.indexOf(mx);
  const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M${p} ${H - p}H${W - p}" class="sp-base"/><path d="${d}" class="sp-line" pathLength="1"/><circle cx="${pts[pk][0].toFixed(1)}" cy="${pts[pk][1].toFixed(1)}" r="3.4" class="sp-peak"/><circle cx="${pts.at(-1)[0].toFixed(1)}" cy="${pts.at(-1)[1].toFixed(1)}" r="3.4" class="sp-end"/></svg>`;
}

export const decadeOf = y => `${Math.floor(+y / 10) * 10}s`;

export function card(c, site, artOf, { h = 'h3', compact = false } = {}) {
  const cat = site.categories.find(k => k.id === c.category), cause = site.causes.find(k => k.id === c.cause);
  return `<a class="entry ${c.tier}${compact ? ' compact' : ''}" href="/${c.slug}/" data-tier="${c.tier}" data-cat="${c.category}" data-decade="${decadeOf(c.died)}" data-cause="${esc(c.cause)}" style="--brand:${esc(c.theme.accent)};--brand-soft:${esc(c.theme.soft)}">
<div class="e-art" style="view-transition-name:art-${esc(c.slug)}">${artOf(c, c.hero.art)}</div>
<div class="e-body"><p class="e-top"><span class="tag ${c.tier}">${esc(TIERS[c.tier].label)}</span><span class="cat">${esc(cat.label)}</span></p>
<${h} class="e-name">${esc(c.name)}</${h}><p class="yrs">${esc(c.years)}</p><p class="e-blurb">${inline(c.card.blurb)}</p>
${compact ? '' : `<div class="e-fig">${spark(c.card.spark, c.card.peak)}<p><b>${esc(c.card.stat.value)}</b><span>${inline(c.card.stat.label)}</span></p></div>`}
<p class="e-foot"><span class="e-cause">${esc(cause.label)}</span><span class="e-read">Read<span aria-hidden="true"> →</span></span></p></div></a>`;
}

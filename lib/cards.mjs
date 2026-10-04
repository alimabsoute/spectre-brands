// The index ledger, used on the homepage, category pages and "more post-mortems": one row per brand
// (logo or real image, name, years, tier, main cause, key figure, sparkline), and a larger feature entry
// with a real image that leads each category. `img` is the image helper built in build.mjs.
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

// data-* attributes drive the homepage filters (runtime.js)
const attrs = (c, cls) => `class="entry ${cls} ${c.tier}" href="/${c.slug}/" data-tier="${c.tier}" data-cat="${c.category}" data-decade="${decadeOf(c.died)}" data-cause="${esc(c.cause)}" style="--brand:${esc(c.theme.accent)}"`;
const causeOf = (c, site) => site.causes.find(k => k.id === c.cause).label;

export const ledgerHead = '<div class="lhead" aria-hidden="true"><span></span><span>Brand</span><span>Status</span><span>Main cause</span><span>Key figure</span><span>Trajectory</span></div>';

export function row(c, site, img, { h = 'h3', blurb = false } = {}) {
  return `<a ${attrs(c, `lrow${blurb ? ' full' : ''}`)}>
<div class="l-logo">${img.logo(c)}</div>
<div class="l-name"><${h} class="e-name">${esc(c.name)}</${h}><p class="yrs">${esc(c.years)}</p></div>
<div class="l-tier"><span class="tag ${c.tier}">${esc(TIERS[c.tier].label)}</span></div>
<div class="l-cause">${esc(causeOf(c, site))}</div>
<div class="l-fig"><b>${esc(c.card.stat.value)}</b> ${inline(c.card.stat.label)}</div>
<div class="l-spark">${spark(c.card.spark, c.card.peak)}</div>${blurb ? `
<p class="l-blurb e-blurb">${inline(c.card.blurb)}</p>` : ''}
</a>`;
}

export function feature(c, site, img, { h = 'h3' } = {}) {
  return `<a ${attrs(c, 'feat-row')}>
<div class="f-img" style="view-transition-name:art-${esc(c.slug)}">${img.lead(c, { alt: '' })}</div>
<div class="f-body"><p class="e-top"><span class="tag ${c.tier}">${esc(TIERS[c.tier].label)}</span><span>${esc(c.years)}</span><span>${esc(causeOf(c, site))}</span></p>
<${h} class="e-name">${esc(c.name)}</${h}><p class="e-blurb">${inline(c.card.blurb)}</p>
<div class="e-fig">${spark(c.card.spark, c.card.peak)}<p><b>${esc(c.card.stat.value)}</b> ${inline(c.card.stat.label)}</p></div></div>
</a>`;
}

// The brand that leads a group: the one with the strongest real image (ties go to the earlier number).
export const leader = (list, img) => list.reduce((a, b) => img.score(b) > img.score(a) ? b : a);

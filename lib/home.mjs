import { esc, inline, md } from './md.mjs';
import { TIERS } from './registry.mjs';

function spark(vals, peakIndex) {
  if (!vals || vals.length < 2) return '';
  const mx = Math.max(...vals), mn = Math.min(...vals, 0), W = 210, H = 64, p = 4;
  const pts = vals.map((v, i) => [p + i * (W - 2 * p) / (vals.length - 1), H - p - (v - mn) / (mx - mn || 1) * (H - 2 * p)]);
  const pk = peakIndex ?? vals.indexOf(mx);
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M${p},${H - p}H${W - p}" stroke="#ddd5c4" stroke-width="1"/><path d="${pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ')}" fill="none" stroke="#1d1b18" stroke-width="1.8" stroke-linejoin="round"/><circle cx="${pts.at(-1)[0].toFixed(1)}" cy="${pts.at(-1)[1].toFixed(1)}" r="3.2" fill="#a8321f"/><circle cx="${pts[pk][0].toFixed(1)}" cy="${pts[pk][1].toFixed(1)}" r="3.2" fill="none" stroke="#1d1b18" stroke-width="1.4"/></svg>`;
}

export function home(site, companies, artOf) {
  const cats = site.categories;
  const catLabel = Object.fromEntries(cats.map(c => [c.id, c.label]));
  const cards = companies.map(c => `<a class="entry rv" href="/${c.slug}/" data-tier="${c.tier}" data-cat="${c.category}" style="--brand:${esc(c.theme.accent)};--brand-soft:${esc(c.theme.soft)}">
<div class="e-art">${artOf(c, c.hero.art)}${c.card.logo ? `<img class="e-logo" src="/${c.slug}/${esc(c.card.logo)}" alt="${esc(c.name)} logo as it appeared in ${esc(c.card.logoYear || 'its archived website')}" loading="lazy">` : ''}</div>
<div class="e-body"><div class="e-top"><span class="no">No. ${esc(c.number)}</span><span class="tag ${c.tier}">${esc(TIERS[c.tier].label)}</span><span class="cat">${esc(catLabel[c.category])}</span></div>
<h3>${esc(c.name)}</h3><div class="yrs">${esc(c.years)}</div><p>${inline(c.card.blurb)}</p>
<div class="e-fig">${spark(c.card.spark, c.card.peak)}<div><b>${esc(c.card.stat.value)}</b><span>${inline(c.card.stat.label)}</span></div></div>
<span class="e-read">Read the post-mortem</span></div></a>`).join('\n');
  const soon = cats.filter(k => !companies.some(c => c.category === k.id)).map(k => `<div class="entry soon" data-tier="soon" data-cat="${k.id}"><div class="e-art soon-art"><span>${esc(k.label)}</span></div><div class="e-body"><div class="e-top"><span class="tag soon">Coming soon</span><span class="cat">${esc(k.label)}</span></div><h3>${esc(k.label)}</h3><p>${inline(k.blurb)}</p><span class="e-read muted">In research</span></div></div>`).join('\n');
  const chip = (g, v, l, on) => `<button type="button" class="chip${on ? ' on' : ''}" data-g="${g}" data-v="${v}">${esc(l)}</button>`;
  const counts = Object.fromEntries(['dead', 'ghost'].map(t => [t, companies.filter(c => c.tier === t).length]));
  return `<header class="l-hero"><div class="wrap"><div class="l-grid">
<div><p class="kicker">Spectre Brands · ${companies.length} post-mortems</p>
<h1>${inline(site.headline)}</h1>
${md(site.intro, 'intro')}
<div class="l-links"><a class="btn" href="#index">Browse the index</a><a class="btn ghost" href="#method">How we work</a></div></div>
<div class="l-collage">${companies.map(c => `<a href="/${c.slug}/" class="lc-item" style="--brand-soft:${esc(c.theme.soft)}" aria-label="${esc(c.name)}">${artOf(c, c.hero.art)}<span>${esc(c.name)}</span></a>`).join('')}</div>
</div></div></header>
<section class="tiers-sec"><div class="wrap"><div class="tiers">
${Object.entries(TIERS).map(([k, t]) => `<div class="tier"><span class="tag ${k}">${t.label}</span><h3>${k === 'dead' ? 'Dead' : 'Ghost'} <small>${counts[k]} so far</small></h3><p>${esc(t.text)}</p></div>`).join('')}
<div class="tier"><span class="tag soon">Coming soon</span><h3>More categories</h3><p>${inline(site.soon)}</p></div>
</div></div></section>
<section id="index" class="index-sec"><div class="wrap">
<div class="sec-k">The index</div>
<div class="filters"><div class="grp" id="fTier"><span>Status</span>${chip('tier', 'all', 'All', 1)}${chip('tier', 'dead', 'Dead')}${chip('tier', 'ghost', 'Ghost')}</div>
<div class="grp" id="fCat"><span>Category</span>${chip('cat', 'all', 'All', 1)}${cats.map(k => chip('cat', k.id, k.label)).join('')}</div></div>
<div class="index" id="idx">${cards}\n${soon}</div>
<p class="empty" id="empty">Nothing matches that combination yet.</p>
</div></section>
<section id="method" class="method-sec"><div class="wrap"><div class="l-foot">
<div><div class="sec-k">How we work</div><ol class="method">${site.method.map(m => `<li>${inline(m)}</li>`).join('')}</ol></div>
<div><div class="sec-k">What every post-mortem contains</div><ul class="method">${site.schema.map(m => `<li>${inline(m)}</li>`).join('')}</ul></div>
</div></div></section>
`;
}

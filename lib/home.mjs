import { esc, inline, md, json } from './md.mjs';
import { TIERS } from './registry.mjs';
import { row, feature, leader, ledgerHead, decadeOf } from './cards.mjs';

export function home(site, companies, img, preview = null) {
  const cats = site.categories.filter(k => companies.some(c => c.category === k.id));
  const count = t => companies.filter(c => c.tier === t).length;
  const decades = [...new Set(companies.map(c => decadeOf(c.died)))].sort();
  const causes = site.causes.filter(k => companies.some(c => c.cause === k.id));
  const feat = companies.find(c => c.slug === site.featured) || companies[0];
  const featCat = site.categories.find(k => k.id === feat.category);
  const chip = (g, v, l, on) => `<button type="button" class="chip${on ? ' on' : ''}" data-g="${g}" data-v="${v}" aria-pressed="${on ? 'true' : 'false'}">${esc(l)}</button>`;
  // The wall: the strongest real image of every brand, cropped as a headstone. The featured one is four times the size.
  const stones = [feat, ...companies.filter(c => c !== feat)].map((c, i) => `<a class="stone ${c.tier}${i ? '' : ' big'}" href="/${c.slug}/" style="--brand:${esc(c.theme.accent)}"><span class="stone-img">${img.lead(c, { alt: '', eager: i < 6 })}</span><span class="stone-cap"><b>${esc(c.name)}</b><span>${esc(c.years)} · ${esc(TIERS[c.tier].label)}</span></span></a>`).join('');
  const updated = companies.map(c => c.updated || c.published).filter(Boolean).sort().at(-1);
  const longDate = d => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const days = companies.flatMap(c => (c.dates || []).map(d => ({ d: d.date, t: d.text, n: c.name, s: c.slug })));
  const groups = cats.map(k => {
    // each category leads with the brand that has the strongest real image; the rest are ledger rows
    const list = companies.filter(c => c.category === k.id), top = leader(list, img);
    return `<section class="cat-row" data-cat="${k.id}" aria-labelledby="cat-${k.id}"><div class="cat-head"><h3 id="cat-${k.id}"><a href="/category/${k.id}/">${esc(k.label)}</a></h3><p>${inline(k.blurb)}</p><a class="cat-all" href="/category/${k.id}/">All ${list.length}<span aria-hidden="true"> →</span></a></div>${feature(top, site, img, { h: 'h4' })}<div class="ledger">${list.filter(c => c !== top).map(c => row(c, site, img, { h: 'h4' })).join('\n')}</div></section>`;
  }).join('\n');
  return `<header class="l-hero" id="front"><div class="wrap">
<p class="dateline"><span>${companies.length} post-mortems · ${count('dead')} dead · ${count('ghost')} ghosts</span>${updated ? `<span>Updated ${longDate(updated)}</span>` : ''}</p>
<div class="l-top"><h1>${preview?.headline || inline(site.headline)}</h1>
<div class="l-intro">${preview?.intro || md(site.intro, 'intro')}<p class="l-more"><a href="#index">Browse the index<span aria-hidden="true"> ↓</span></a></p>${preview?.heroInIntro ? preview.hero : ''}</div></div>
${preview?.hero && !preview.heroInIntro ? preview.hero + '\n' : ''}${preview?.wall || `<nav class="yard" aria-label="Every brand in the index">${stones}</nav>`}
${preview?.categoryNav ? preview.categoryNav + '\n' : ''}</div></header>
<section class="tiers-sec" aria-labelledby="tiers-h"><div class="wrap"><h2 id="tiers-h" class="sec-k">Two ways a brand ends</h2><div class="tiers">
<div class="tier"><div class="tier-ic" aria-hidden="true"><svg viewBox="0 0 48 56"><path d="M8 52V22a16 16 0 0 1 32 0v30z" fill="#fff" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M2 52h44" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M18 26h12M24 20v16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></div><div><h3><span class="tag dead">Dead</span> ${count('dead')} brands</h3><p>${esc(TIERS.dead.text)}</p><p class="tier-eg">${companies.filter(c => c.tier === 'dead').slice(0, 5).map(c => `<a href="/${c.slug}/">${esc(c.name)}</a>`).join(', ')}</p></div></div>
<div class="tier"><div class="tier-ic ghosty" aria-hidden="true"><svg viewBox="0 0 48 56"><path d="M8 52V24a16 16 0 0 1 32 0v28l-5.300-4.600-5.300 4.600-5.400-4.600-5.300 4.600-5.300-4.600z" fill="#fff" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="19" cy="24" rx="2.300" ry="3.600" fill="currentColor"/><ellipse cx="29" cy="24" rx="2.300" ry="3.600" fill="currentColor"/></svg></div><div><h3><span class="tag ghost">Ghost</span> ${count('ghost')} brands</h3><p>${esc(TIERS.ghost.text)}</p><p class="tier-eg">${companies.filter(c => c.tier === 'ghost').slice(0, 5).map(c => `<a href="/${c.slug}/">${esc(c.name)}</a>`).join(', ')}</p></div></div>
</div></div></section>
<section class="feat-sec" aria-label="Featured"><div class="wrap"><div class="feat-grid">
<a class="feat" href="/${feat.slug}/" style="--brand:${esc(feat.theme.accent)};--brand-soft:${esc(feat.theme.soft)}"><div class="feat-art">${img.lead(feat, { alt: '' })}</div><div class="feat-body"><p class="sec-k">Featured post-mortem</p><h2>${esc(feat.name)}</h2><p class="yrs"><span class="tag ${feat.tier}">${esc(TIERS[feat.tier].label)}</span> ${esc(featCat.label)} · ${esc(feat.years)}</p><p class="feat-sf">${inline(feat.hero.standfirst)}</p><p class="feat-stat"><b>${esc(feat.card.stat.value)}</b> ${inline(feat.card.stat.label)}</p><span class="e-read">Read the post-mortem<span aria-hidden="true"> →</span></span></div></a>
<aside class="otd" id="otd" aria-labelledby="otd-h"><p class="sec-k" id="otd-h">On this day</p><div id="otdBody"><p class="otd-t">The calendar of endings: filings, last days of trading and final closings from the index.</p></div><script type="application/json" id="otd-data">${json(days)}</script></aside>
</div></div></section>
<section id="index" class="index-sec" aria-labelledby="index-h"><div class="wrap">
<div class="index-head"><h2 id="index-h">The index</h2><p class="index-n" id="idxCount" aria-live="polite">${companies.length} post-mortems</p></div>
<div class="filters" id="filters">
<div class="grp" role="group" aria-label="Status"><span>Status</span>${chip('tier', 'all', 'All', 1)}${chip('tier', 'dead', 'Dead')}${chip('tier', 'ghost', 'Ghost')}</div>
<div class="grp" role="group" aria-label="Category"><span>Category</span>${chip('cat', 'all', 'All', 1)}${cats.map(k => chip('cat', k.id, k.label)).join('')}</div>
<div class="grp" role="group" aria-label="Decade it ended"><span>Ended in</span>${chip('decade', 'all', 'Any decade', 1)}${decades.map(d => chip('decade', d, d)).join('')}</div>
<div class="grp" role="group" aria-label="Main cause of death"><span>Cause</span>${chip('cause', 'all', 'Any cause', 1)}${causes.map(k => chip('cause', k.id, k.label)).join('')}</div>
</div>
<div id="idx">${ledgerHead}${groups}</div>
<p class="empty" id="empty" hidden>Nothing matches that combination. <button type="button" class="link" id="clearFilters">Clear the filters</button></p>
</div></section>
<section class="method-sec" aria-labelledby="method-h"><div class="wrap"><div class="l-foot">
<div><h2 id="method-h">How the post-mortems are made</h2><p class="lede">${inline(site.methodLede)}</p><p><a class="btn ghost" href="/about/">Read the methodology</a></p></div>
<ol class="method">${site.method.map(m => `<li>${inline(m)}</li>`).join('')}</ol>
</div></div></section>
`;
}

// Mix 3 (C): "Front Counter". A dark VHS-shelf hero band, then a light editorial body set like a
// rental store's index-card ledger. Markup is semantic; every look lives in assets/homemix/mix3.css.
import { head, heroLogo, smallLogo, switcher, ordered, byCategory, brandPic, illoTag, ILLUSTRATION_CREDIT, footerNote, esc } from './shared.mjs';

export const meta = {
  n: 3,
  name: 'Front Counter',
  idea: 'A dark tape-shelf hero band with the painted logo in front of a row of spines, then a light index-card body: standfirst, featured post-mortem, the archive as a ruled ledger by category, and a full-colour photo strip.'
};

// Tokens. Every hue is warm-neutral, blue, teal, red, amber or olive: nothing between 250° and 320°.
export const palette = {
  paper: '#F6EFE0',        // aged index-card stock: page background
  'paper-deep': '#EBE0C6', // darker card stock: standfirst card, key, photo mounts
  'paper-white': '#FCFBF8',// the white inside the original drawings
  ink: '#1B1815',          // body text on paper
  'ink-soft': '#5A5146',   // secondary text on paper (AA 7.0:1)
  'rule-blue': '#8FA7BE',  // index-card ruled lines (decorative)
  'rule-red': '#D5634D',   // the single red head rule on an index card (decorative)
  charcoal: '#221E1B',     // warm charcoal: hero band, photo band, footer
  'charcoal-2': '#2E2925', // raised plastic / second surface on charcoal
  shelf: '#3B3430',        // shelf edge
  cream: '#F3EBDC',        // text on charcoal
  'cream-soft': '#CDC3B4', // secondary text on charcoal (AA 9.3:1)
  amber: '#F2A33C',        // the rental strip's orange, used as the hero accent on charcoal
  mint: '#7FD8C5',         // the one cool accent on charcoal (from B)
  cobalt: '#2A4DB8',       // links on paper (from A)
  vermilion: '#BE371E',    // hover / emphasis on paper (from A)
  dead: '#A5301E',         // Dead mark on paper
  ghost: '#0E6A60',        // Ghost mark on paper
  // Category colours (tape spines and category rules). Muted, printed-label colours.
  'cat-dotcom': '#3E5FA6',
  'cat-electronics': '#2C7F75',
  'cat-retail': '#C8513B',
  'cat-consumer': '#D9962C',
  'cat-games': '#6B7F2F',
  'cat-film': '#4F7CA2',
  'cat-restaurants': '#9A6428'
};

export const fonts = { display: 'Fraunces', text: 'DM Sans', accent: 'Caveat' };

// [fg, bg, label] for every text/background pair in the page.
export const contrastPairs = [
  [palette.ink, palette.paper, 'body text on paper'],
  [palette.ink, palette['paper-deep'], 'text on deep paper (standfirst, key, mounts)'],
  [palette['ink-soft'], palette.paper, 'secondary text on paper'],
  [palette['ink-soft'], palette['paper-deep'], 'secondary text on deep paper'],
  [palette.cobalt, palette.paper, 'links on paper'],
  [palette.cobalt, palette['paper-deep'], 'links on deep paper'],
  [palette.vermilion, palette.paper, 'link hover / emphasis on paper'],
  [palette.dead, palette.paper, 'Dead mark on paper'],
  [palette.ghost, palette.paper, 'Ghost mark on paper'],
  [palette.dead, palette['paper-deep'], 'Dead mark on deep paper'],
  [palette.ghost, palette['paper-deep'], 'Ghost mark on deep paper'],
  [palette.cream, palette.charcoal, 'text on charcoal'],
  [palette['cream-soft'], palette.charcoal, 'secondary text on charcoal'],
  [palette.amber, palette.charcoal, 'amber accent text on charcoal'],
  [palette.mint, palette.charcoal, 'mint accent text on charcoal'],
  [palette.cream, palette['charcoal-2'], 'text on raised charcoal (switcher, photo captions)'],
  [palette['cream-soft'], palette['charcoal-2'], 'secondary text on raised charcoal'],
  [palette.charcoal, palette.amber, 'ink on the amber sticker'],
  [palette.cream, palette.dead, 'Dead stamp, reversed (photo strip)'],
  [palette.cream, palette.ghost, 'Ghost stamp, reversed (photo strip)']
];

const catColor = id => palette[`cat-${id}`] || palette['cat-dotcom'];

// Deterministic pseudo-random for the decorative spines (so renders are stable).
const rnd = i => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

function shelf(data) {
  const all = ordered(data);
  const spines = all.map((b, i) => {
    const w = 24 + Math.round(rnd(i) * 10);            // 24–34 px
    const h = 128 + Math.round(rnd(i + 50) * 42);      // 128–170 px
    const lean = i === 9 ? ' spine-lean' : (i === 27 ? ' spine-lean-r' : '');
    const gap = (i === 10 || i === 28) ? ' spine-gap' : '';
    return `<span class="spine${lean}${gap}" style="--c:${catColor(b.category)};--w:${w}px;--h:${h}px"><span class="spine-label">${esc(b.name)}</span></span>`;
  }).join('');
  return `<div class="shelf" aria-hidden="true"><div class="spines">${spines}</div><div class="shelf-edge"></div></div>`;
}

const tier = b => `<span class="tier tier-${b.tier}">${esc(b.tierLabel)}</span>`;

function featured(b) {
  return `<section class="featured" id="featured" aria-labelledby="featured-h">
<div class="featured-pic"><a href="/${b.slug}/" tabindex="-1" aria-hidden="true">${brandPic(b, { eager: true })}</a>${b.illustration ? `<p class="pic-credit">${ILLUSTRATION_CREDIT}</p>` : (b.caption ? `<p class="pic-credit">${esc(b.caption)}</p>` : '')}</div>
<div class="featured-text">
<p class="kicker"><span>Featured post-mortem</span><span class="kicker-no">No. ${esc(b.number)}</span></p>
<h2 id="featured-h"><a href="/${b.slug}/">${esc(b.name)}</a></h2>
<p class="meta-line"><span class="years">${esc(b.years)}</span><span class="sep" aria-hidden="true">·</span><a class="cat-link" href="/category/${b.category}/">${esc(b.categoryLabel)}</a><span class="sep" aria-hidden="true">·</span>${tier(b)}</p>
<p class="blurb">${esc(b.blurb)}</p>
${b.stat ? `<p class="stat"><strong class="stat-value">${esc(b.stat.value)}</strong><span class="stat-label">${esc(b.stat.label)}</span></p>` : ''}
<p class="read"><a class="btn" href="/${b.slug}/">Read the post-mortem<span aria-hidden="true"> →</span></a></p>
</div></section>`;
}

function ledger(data) {
  const cats = byCategory(data);
  return `<section class="index" id="index" aria-labelledby="index-h">
<header class="index-head">
<h2 id="index-h"><span class="index-tab">Index</span> All 38 post-mortems, by shelf</h2>
<p class="index-sub">Seven categories. Each entry lists the brand, its years, and whether the company is <span class="tier tier-dead">Dead</span> or a <span class="tier tier-ghost">Ghost</span>. The definitions are in the key above.</p>
</header>
<div class="ledger">
${cats.map(k => `<section class="cat" id="cat-${k.id}" style="--c:${catColor(k.id)}" aria-labelledby="cat-h-${k.id}">
<h3 id="cat-h-${k.id}" class="cat-h"><a href="/category/${k.id}/">${esc(k.label)}</a><span class="cat-count" aria-label="${k.n} brands">${k.n} ${k.n === 1 ? 'title' : 'titles'}</span></h3>
<p class="cat-blurb">${esc(k.blurb)}</p>
<ol class="rows">
${k.brands.map(b => `<li class="row"><a href="/${b.slug}/" class="row-link"><span class="no">${esc(b.number)}</span><span class="nm">${esc(b.name)}</span><span class="ld" aria-hidden="true"></span><span class="yr">${esc(b.years)}</span>${tier(b)}</a></li>`).join('\n')}
</ol>
</section>`).join('\n')}
</div></section>`;
}

function strip(brands) {
  const hasIllo = brands.some(b => b.illustration);
  return `<section class="strip" id="archive" aria-labelledby="strip-h">
<div class="wrap">
<header class="strip-head"><h2 id="strip-h">From the shelves</h2><p class="strip-sub">Ten of the archive’s pictures, in their source colours. Every post-mortem opens with one.</p></header>
<ul class="prints">
${brands.map(b => `<li class="print"><a href="/${b.slug}/" class="print-link"><span class="print-pic">${brandPic(b, { eager: true }).replace(/decoding="async"/g, 'decoding="sync"')}${illoTag(b)}</span><span class="print-cap"><span class="print-name">${esc(b.name)}</span><span class="print-meta"><span class="yr">${esc(b.years)}</span> · ${esc(b.categoryLabel)}</span>${tier(b)}</span></a></li>`).join('\n')}
</ul>
${hasIllo ? `<p class="strip-credit">${ILLUSTRATION_CREDIT}</p>` : ''}
</div></section>`;
}

export function render(data) {
  const all = ordered(data);
  const lead = all[0];
  const picks = all.slice(1, 11);
  const nCats = data.categories.length;
  return head(meta, { themeColor: palette.charcoal }) + `
<a class="skip" href="#main">Skip to content</a>
<header class="mast"><div class="wrap mast-in">
<a class="brand" href="/" aria-label="Spectre Brands, home">${smallLogo({ width: 150 })}</a>
<nav class="nav" aria-label="Site"><a href="#index">Archive</a><a href="#index">Categories</a><a href="/about/">About</a><a href="/">Search</a></nav>
</div></header>
<main id="main">
<section class="hero" aria-labelledby="hero-h">
${shelf(data)}
<div class="wrap hero-in">
<div class="hero-logo-slot">${heroLogo({ sizes: '(max-width: 860px) 100vw, 640px' })}</div>
<div class="hero-text">
<p class="eyebrow"><span>Sourced post-mortems<span class="eyebrow-dot" aria-hidden="true"></span></span> <span>${data.brands.length} brands<span class="eyebrow-dot" aria-hidden="true"></span></span> <span>${nCats} shelves</span></p>
<h1 id="hero-h">${data.site.headlineHtml}</h1>
<p class="hero-links"><a class="btn btn-amber" href="#index">Browse the index<span aria-hidden="true"> ↓</span></a><a class="hero-about" href="/about/">How the post-mortems are built</a></p>
</div>
<p class="sticker" aria-hidden="true"><span class="sticker-top">Please rewind</span><span class="sticker-big">38</span><span class="sticker-bot">titles on file</span></p>
</div>
</section>

<div class="body wrap">
<section class="standfirst" aria-label="About the archive">
<p class="standfirst-text">${data.site.introHtml}</p>
<dl class="key" aria-label="Key to the Dead and Ghost marks">
<div class="key-row"><dt>${tier({ tier: 'dead', tierLabel: 'Dead' })}</dt><dd>${esc(data.site.tiers.dead)}</dd></div>
<div class="key-row"><dt>${tier({ tier: 'ghost', tierLabel: 'Ghost' })}</dt><dd>${esc(data.site.tiers.ghost)}</dd></div>
</dl>
</section>
${featured(lead)}
${ledger(data)}
</div>
${strip(picks)}
</main>
<footer class="foot"><div class="wrap foot-in">
<p class="foot-brand">${smallLogo({ width: 120, cls: 'small-logo foot-logo' })}</p>
<nav class="foot-nav" aria-label="Footer"><a href="/about/">About the archive</a><a href="#index">Index</a><a href="/">Search</a></nav>
${footerNote()}
</div></footer>
${switcher(3)}
</body></html>`;
}

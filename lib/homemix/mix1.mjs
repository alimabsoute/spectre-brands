// Mix 1 (A): "Shelf Talker". A sunny video-rental store: the painted cassette sits on a laminate shelf with a
// hand-lettered shelf-talker clipped to the price channel; categories hang as aisle signs; brands are rental
// boxes on ledges with orange paper name strips and Dead/Ghost stickers. Palette = Direction A's cream base,
// no violet anywhere (Ghost is a deep teal), with B's amber/rose/mint demoted to small inventory dots.
import { head, heroLogo, smallLogo, switcher, ordered, brandPic, illoTag, footerNote, esc } from './shared.mjs';

export const meta = { n: 1, name: 'Shelf Talker', idea: 'A sunlit rental store: the painted cassette on a laminate shelf with a hand-written shelf-talker, aisle signs for the categories and rental boxes with orange name strips.' };

export const palette = {
  bg: '#FFF7E8', surface: '#FFFDF7', paper: '#F6ECD6', 'surface-2': '#FFE5B5',
  ink: '#241C14', muted: '#5E5043', line: '#DFC9B4',
  strip: '#F08A2E', vermilion: '#E34B32', cobalt: '#2F55C4', sunflower: '#F4C84A',
  dead: '#9E3328', ghost: '#0E6B66', 'dead-text': '#FFFFFF', 'ghost-text': '#FFFFFF',
  wood: '#CF9A5C', 'wood-dark': '#A96F35', channel: '#E6DECE', 'hand-ink': '#2B3650', 'rule-red': '#C9453A',
  dark: '#1E1B19', 'cream-on-dark': '#F6ECD6', 'dark-muted': '#D9CBB6',
  amber: '#FFAD66', rose: '#F584BA', mint: '#70DECC', sky: '#80C8FF',
  'cat-dotcom': '#2F55C4', 'cat-electronics': '#007466', 'cat-retail': '#C2335A', 'cat-consumer': '#BD4218',
  'cat-games': '#2E7A3C', 'cat-film': '#1B6DA6', 'cat-restaurants': '#9A5A10'
};
export const fonts = { display: 'Fraunces', text: 'DM Sans', accent: 'Caveat' };
export const contrastPairs = [
  ['#241C14', '#FFF7E8', 'body text on cream wall'], ['#5E5043', '#FFF7E8', 'muted text on cream'],
  ['#241C14', '#FFFDF7', 'text on box sleeve'], ['#5E5043', '#FFFDF7', 'muted on box sleeve'],
  ['#241C14', '#F6ECD6', 'text on index card'], ['#2B3650', '#F6ECD6', 'handwriting on index card'],
  ['#5E5043', '#F6ECD6', 'muted on index card'], ['#241C14', '#F08A2E', 'name on orange strip'],
  ['#FFFFFF', '#9E3328', 'Dead sticker'], ['#FFFFFF', '#0E6B66', 'Ghost sticker'],
  ['#241C14', '#F4C84A', 'text on sunflower sticker'], ['#241C14', '#FFAD66', 'text on amber sticker'],
  ['#241C14', '#E6DECE', 'price-channel tag text'], ['#2F55C4', '#FFF7E8', 'links on cream'],
  ['#F6ECD6', '#1E1B19', 'cream text on black plastic'], ['#D9CBB6', '#1E1B19', 'muted text on black plastic'],
  ['#F08A2E', '#1E1B19', 'orange sign-off on dark'], ['#FFFFFF', '#2F55C4', 'aisle band dotcom'],
  ['#FFFFFF', '#007466', 'aisle band electronics'], ['#FFFFFF', '#C2335A', 'aisle band toy stores'],
  ['#FFFFFF', '#BD4218', 'aisle band food & drink'], ['#FFFFFF', '#2E7A3C', 'aisle band games'],
  ['#FFFFFF', '#1B6DA6', 'aisle band film'], ['#FFFFFF', '#9A5A10', 'aisle band restaurants'],
  ['#2F55C4', '#FFFDF7', 'category name dotcom on sleeve'], ['#007466', '#FFFDF7', 'category electronics on sleeve'],
  ['#C2335A', '#FFFDF7', 'category toy stores on sleeve'], ['#BD4218', '#FFFDF7', 'category food on sleeve'],
  ['#2E7A3C', '#FFFDF7', 'category games on sleeve'], ['#1B6DA6', '#FFFDF7', 'category film on sleeve'],
  ['#9A5A10', '#FFFDF7', 'category restaurants on sleeve'],
  ['#241C14', '#FFFFFF', 'price tags and channel label on white'], ['#9E3328', '#FFFFFF', 'No late fees on white'],
  ['#241C14', '#FFFDF7', 'spine index label on white'], ['#FFFFFF', '#241C14', 'policy card header']
];

const decade = y => y < 1990 ? ['rose', 'before 1990'] : y < 2000 ? ['mint', '1990s'] : y < 2010 ? ['amber', '2000s'] : ['sky', '2010s and later'];
const dot = b => { const [c, t] = decade(b.died); return `<span class="dot dot-${c}" title="Died ${esc(String(b.died))} (${t})"></span>`; };
const sticker = b => `<span class="sticker sticker-${b.tier}">${esc(b.tierLabel)}</span>`;
const catLink = b => `<a class="cat cat-${esc(b.category)}" href="/category/${esc(b.category)}/">${esc(b.categoryLabel)}</a>`;

// A rental box on a ledge: sleeve with the archive image, orange name strip, sticker, years tag in the price channel.
function box(b, i, { lead = false } = {}) {
  const eager = i < 11;
  return `<li class="box${lead ? ' box-lead' : ''}${b.illustration ? ' box-illo' : ''}">
<article class="sleeve">
<a class="sleeve-pic" href="/${esc(b.slug)}/" tabindex="-1" aria-hidden="true">${eager ? brandPic(b, { eager }).replace(/decoding="async"/g, 'decoding="sync"') : brandPic(b)}${illoTag(b)}</a>
${sticker(b)}
<div class="sleeve-body">
<h3 class="strip"><a href="/${esc(b.slug)}/">${esc(b.name)}</a></h3>
<p class="sleeve-meta"><span class="no">No. ${esc(b.number)}</span> ${catLink(b)}</p>
${lead ? `<p class="sleeve-blurb">${esc(b.blurb)}</p>` : ''}
${b.stat ? `<p class="sleeve-stat"><b>${esc(b.stat.value)}</b> <span>${esc(b.stat.label)}</span></p>` : ''}
</div>
</article>
<span class="ledge" aria-hidden="true"></span>
<p class="tag">${esc(b.years)}</p>
</li>`;
}

// A compact spine on the back wall: black plastic sleeve, orange strip, index label with years and category.
const spine = b => `<li class="spine">
<article class="spine-in">
${sticker(b)}
<h3 class="strip strip-sm"><a href="/${esc(b.slug)}/">${esc(b.name)}</a></h3>
<p class="spine-label">${dot(b)}<span class="years">${esc(b.years)}</span>${catLink(b)}</p>
</article>
<span class="ledge ledge-sm" aria-hidden="true"></span>
</li>`;

export function render(data) {
  const all = ordered(data);
  const front = all.slice(0, 11), back = all.slice(11); // lead box spans 2 slots: 12 slots = 3 full rows of 4
  const dead = data.brands.filter(b => b.tier === 'dead').length, ghost = data.brands.length - dead;
  const featured = data.brands.find(b => b.slug === data.site.featured) || front[0];
  const intro = data.site.introHtml;

  return head(meta, { themeColor: '#FFF7E8' }) + `
<a class="skip" href="#main">Skip to content</a>
<header class="mast"><div class="wrap mast-in">
<a class="mast-logo" href="/" aria-label="Spectre Brands home">${smallLogo({ width: 156 })}</a>
<nav class="mast-nav" aria-label="Site"><a href="#archive">Archive</a><a href="#aisles">Categories</a><a href="/about/">About</a><a href="/" class="mast-search"><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12.8 12.8 17.5 17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Search</a></nav>
</div></header>

<main id="main">
<section class="hero" aria-labelledby="headline">
<div class="wrap hero-grid">
<div class="stage">
${heroLogo({ sizes: '(max-width: 760px) calc(100vw - 32px), (max-width: 1200px) 56vw, 680px' })}
<span class="stage-shadow" aria-hidden="true"></span>
</div>
<div class="hero-copy">
<p class="kicker"><span>Post-mortems of ${data.brands.length} dead and ghost brands</span></p>
<h1 id="headline">${data.site.headlineHtml}</h1>
<div class="intro intro-wide"><p>${intro}</p></div>
<details class="intro intro-narrow"><summary>What this archive is</summary><p>${intro}</p></details>
</div>
<div class="board" role="presentation">
<p class="channel-label"><span>${data.brands.length} titles</span><span>${dead} dead</span><span>${ghost} ghost</span><span>${data.categories.length} aisles</span><span>No late fees</span></p>
</div>
<aside class="talker" aria-label="Staff pick">
<span class="clip" aria-hidden="true"></span>
<span class="round-sticker" aria-hidden="true">2-day<br>rental</span>
<p class="talker-hand">Staff pick: start with <a href="/${esc(featured.slug)}/">${esc(featured.name)}</a>, title no. ${esc(featured.number)}. Then work along the aisle. Please rewind.</p>
<p class="talker-sign">— the counter</p>
</aside>
<p class="hero-cta"><a class="btn btn-strip" href="#archive">Browse all ${data.brands.length} titles</a><a class="btn btn-plain" href="/about/">How a post-mortem is written</a></p>
</div>
</section>

<section class="aisles" id="aisles" aria-labelledby="aisles-h">
<div class="wrap">
<div class="sec-head"><p class="sec-k">Aisle signs</p><h2 id="aisles-h">Seven aisles, ${data.brands.length} titles.</h2></div>
<ul class="sign-rail">
${data.categories.map((k, i) => `<li class="sign sign-${esc(k.id)}"><a href="/category/${esc(k.id)}/"><span class="sign-band">Aisle ${i + 1}</span><span class="sign-body"><span class="sign-name">${esc(k.label)}</span><span class="sign-n">${k.n} title${k.n === 1 ? '' : 's'}</span><span class="sign-blurb">${esc(k.blurb)}</span></span></a></li>`).join('\n')}
</ul>
</div>
</section>

<section class="archive" id="archive" aria-labelledby="archive-h">
<div class="wrap">
<div class="archive-head">
<div class="sec-head"><p class="sec-k">Front shelf</p><h2 id="archive-h">Staff picks, in opening-inventory order.</h2><p class="sec-lede">Eleven titles with their archive photo or original drawing on the box. The rest of the catalogue is on the back wall below, every one with a full post-mortem.</p></div>
<aside class="policy" aria-labelledby="policy-h">
<h2 id="policy-h" class="policy-h">Rental policy</h2>
<dl class="policy-rows">
<div class="policy-row"><dt><span class="sticker sticker-dead">Dead</span></dt><dd>${esc(data.site.tiers.dead)}</dd></div>
<div class="policy-row"><dt><span class="sticker sticker-ghost">Ghost</span></dt><dd>${esc(data.site.tiers.ghost)}</dd></div>
<div class="policy-row policy-dots"><dt><span class="dot dot-rose"></span><span class="dot dot-mint"></span><span class="dot dot-amber"></span><span class="dot dot-sky"></span></dt><dd>Inventory dot: decade it died. Rose before 1990, mint 1990s, amber 2000s, blue 2010s and later.</dd></div>
</dl>
</aside>
</div>
<ul class="shelf shelf-front">
${front.map((b, i) => box(b, i, { lead: i === 0 })).join('\n')}
</ul>

<div class="sec-head sec-head-back"><p class="sec-k">Back wall</p><h2 id="back-h">The other ${back.length}.</h2></div>
<ul class="shelf shelf-back" aria-labelledby="back-h">
${back.map(spine).join('\n')}
</ul>
</div>
</section>
</main>

<footer class="counter">
<div class="wrap counter-in">
<p class="counter-sign">Be kind, rewind.</p>
<nav class="counter-nav" aria-label="Footer"><a href="#archive">Archive</a><a href="#aisles">Categories</a><a href="/about/">About</a><a href="/">Search</a></nav>
${footerNote()}
</div>
</footer>
${switcher(1)}
</body></html>`;
}

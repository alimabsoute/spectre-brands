// Home C ("Front Counter", next version of mix 3). Light and dark themes, a theme toggle in the header, and an
// object shelf in the hero: one small illustrated object per brand, grouped on wooden shelves by category.
// Markup is semantic; every look lives in assets/homemix/mixc.css. Preview: /preview/home-c/.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { head, heroLogo, ordered, byCategory, brandPic, illoTag, ILLUSTRATION_CREDIT, footerNote, esc } from './shared.mjs';

export const meta = {
  n: 'c',
  name: 'Front Counter',
  idea: 'The painted cassette stands in 3D on top of a wooden wall unit whose seven shelves hold one small illustrated object per brand, each with a paper price tag; it tilts toward the cursor and its rental strip floats above the shell. The header carries the strip-and-ghost logo, whose ghost pops up and waves. Light theme: paper wall and oak boards; dark theme: warm charcoal and walnut. Below, five numbered sections on a VHS counter: standfirst, featured post-mortem, the ruled ledger of all 38 brands, a full-colour photo strip and the end of the tape.'
};

// Tokens for both themes. Every hue is warm-neutral, blue, teal, red, amber, olive or wood-brown: nothing between 250° and 320°.
export const palette = {
  light: {
    paper: '#F6EFE0',         // page background, masthead
    'paper-deep': '#EBE0C6',  // standfirst card
    'paper-white': '#FCFBF8', // print mounts, price tags (both themes)
    'hero-wall': '#EFE4CC',   // hero band: a warm paper wall
    'unit-wall': '#E6D8B8',   // the back panel of the shelf unit
    ink: '#1B1815',           // text
    'ink-soft': '#5A5146',    // secondary text (7.0:1 on paper)
    'rule-blue': '#8FA7BE',   // index-card rules (decorative)
    'rule-red': '#D5634D',    // the red head rule and margin line (decorative)
    oak: '#D1AD78',           // shelf boards (light): oak laminate, gradient #E3C697 → #B48A55
    cobalt: '#2A4DB8',        // links, focus ring
    vermilion: '#BE371E',     // link hover, kicker
    dead: '#A5301E',          // Dead mark
    ghost: '#0E6A60',         // Ghost mark; eyebrow on the hero wall
    amber: '#F2A33C',         // the rental strip's orange: hero button, sticker
    charcoal: '#221E1B',      // photo strip, footer, switcher, index tab
    'charcoal-2': '#2E2925',  // raised surface on charcoal
    cream: '#F3EBDC',         // text on charcoal
    'cream-soft': '#CDC3B4'   // secondary text on charcoal
  },
  dark: {
    charcoal: '#221E1B',      // page background and hero wall: the warm charcoal shelf band, page-wide
    'card': '#2E2925',        // dark index cards: standfirst, key, cat blurbs
    'card-deep': '#262220',   // key rows
    band: '#1A1714',          // photo strip and footer (a step darker than the page)
    'band-2': '#2A2522',      // switcher, raised surfaces on the band
    'unit-wall': '#2B2623',   // the back panel of the shelf unit
    walnut: '#553C2A',        // shelf boards (dark): walnut, gradient #6F5139 → #3A291C
    cream: '#F3EBDC',         // paper-coloured text
    'cream-soft': '#CDC3B4',  // secondary text (9.3:1 on charcoal)
    'paper-white': '#FCFBF8', // print mounts and price tags (unchanged)
    amber: '#F2A33C',         // links, focus ring, hero button
    'amber-light': '#FFC46B', // link hover
    mint: '#7FD8C5',          // eyebrow on charcoal
    'dead-dark': '#EF8468',   // Dead mark on charcoal and cards
    'ghost-dark': '#6CCFBA',  // Ghost mark on charcoal and cards
    'rule-red': '#D5634D',    // decorative red rules (unchanged)
    'rule-blue': '#8FA7BE'    // decorative blue rules at 28% (unchanged hue)
  }
};

export const fonts = { display: 'Fraunces', text: 'DM Sans', accent: 'Caveat' };

const L = palette.light, D = palette.dark;
// [fg, bg, label] for every text/background pair in the page, both themes.
export const contrastPairs = [
  // light
  [L.ink, L.paper, 'light: body text on paper'],
  [L.ink, L['paper-deep'], 'light: standfirst text on deep paper'],
  [L['ink-soft'], L.paper, 'light: secondary text on paper'],
  [L['ink-soft'], L['paper-deep'], 'light: secondary text on deep paper'],
  [L.cobalt, L.paper, 'light: links on paper'],
  [L.cobalt, L['paper-deep'], 'light: links on deep paper'],
  [L.vermilion, L.paper, 'light: link hover / kicker on paper'],
  [L.dead, L.paper, 'light: Dead mark on paper'],
  [L.ghost, L.paper, 'light: Ghost mark on paper'],
  [L.dead, L['paper-deep'], 'light: Dead mark on deep paper'],
  [L.ghost, L['paper-deep'], 'light: Ghost mark on deep paper'],
  [L.ink, L['hero-wall'], 'light: headline on the hero wall'],
  [L['ink-soft'], L['hero-wall'], 'light: hero secondary text'],
  [L.ghost, L['hero-wall'], 'light: eyebrow on the hero wall'],
  [L.cobalt, L['hero-wall'], 'light: hero link'],
  [L.dead, L['hero-wall'], 'light: hero link hover'],
  [L.ink, L.amber, 'both: ink on the amber button and sticker'],
  [L.ink, L['paper-white'], 'both: price tags and shelf labels, print captions'],
  [L['ink-soft'], L['paper-white'], 'both: years on price tags, print meta'],
  [L.dead, L['paper-white'], 'both: Dead mark on print captions'],
  [L.ghost, L['paper-white'], 'both: Ghost mark on print captions'],
  [L.cream, L.charcoal, 'light: text on the photo band and footer'],
  [L['cream-soft'], L.charcoal, 'light: secondary text on the photo band and footer'],
  [L.amber, L.charcoal, 'light: amber hover on the photo band'],
  [L.cream, L['charcoal-2'], 'light: switcher text'],
  [L.charcoal, L.amber, 'both: switcher current item'],
  [L.cream, L.dead, 'both: Dead stamp reversed (illustration tag style)'],
  [L.cream, L.ghost, 'both: Ghost stamp reversed'],
  // dark
  [D.cream, D.charcoal, 'dark: body text on charcoal'],
  [D['cream-soft'], D.charcoal, 'dark: secondary text on charcoal'],
  [D.cream, D.card, 'dark: text on index cards'],
  [D['cream-soft'], D.card, 'dark: secondary text on index cards'],
  [D.cream, D['card-deep'], 'dark: key rows'],
  [D.amber, D.charcoal, 'dark: links on charcoal'],
  [D.amber, D.card, 'dark: links on index cards'],
  [D['amber-light'], D.charcoal, 'dark: link hover'],
  [D.mint, D.charcoal, 'dark: eyebrow'],
  [D['dead-dark'], D.charcoal, 'dark: Dead mark on charcoal'],
  [D['ghost-dark'], D.charcoal, 'dark: Ghost mark on charcoal'],
  [D['dead-dark'], D.card, 'dark: Dead mark on index cards'],
  [D['ghost-dark'], D.card, 'dark: Ghost mark on index cards'],
  [D['dead-dark'], D['card-deep'], 'dark: Dead mark on key rows'],
  [D['ghost-dark'], D['card-deep'], 'dark: Ghost mark on key rows'],
  [D.cream, D.band, 'dark: text on the photo band and footer'],
  [D['cream-soft'], D.band, 'dark: secondary text on the photo band and footer'],
  [D.amber, D.band, 'dark: hover on the photo band'],
  [D.cream, D['band-2'], 'dark: switcher text'],
  [D.charcoal, D.cream, 'dark: index tab (charcoal on cream)']
];

// ---------- Object manifest (one small illustrated object per brand) ----------
const MANIFEST_PATHS = [
  fileURLToPath(new URL('../../assets/homemix/objects/objects.json', import.meta.url)),
  '/workspace/spectre-brands/assets/homemix/objects/objects.json'
];
const GENERIC = {
  'generic-1': { file: '/assets/homemix/objects/generic-1.webp', object: 'Video cassette', w: 200, h: 260 },
  'generic-2': { file: '/assets/homemix/objects/generic-2.webp', object: 'Archive box', w: 200, h: 260 }
};
function readManifest() {
  for (const p of MANIFEST_PATHS) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
  console.warn('home-c: objects.json not found; every brand falls back to the generic objects');
  return {};
}
const objectFor = (manifest, slug, i) => {
  const o = manifest[slug];
  if (o && o.file && o.w > 0 && o.h > 0) return o;
  const g = i % 2 ? 'generic-2' : 'generic-1';
  return manifest[g] || GENERIC[g];
};
// Display size from the manifest's aspect ratio: squat things (a van, a console) ~70 px tall, a cassette-proportioned
// box ~80 px, tall bottles and towers up to 104 px. Width follows.
export const objectSize = o => {
  const r = o.h / o.w;
  const h = Math.round(Math.min(104, Math.max(70, 76 * Math.pow(r, 0.4))));
  return { h, w: Math.round(h / r) };
};

// ---------- The shelf unit: a wooden wall unit, one category per shelf ----------
// Row 1 is a full-width top shelf (the first category, which holds the most objects, plus a note card and the sticker);
// the other six categories pair up in two bays. data.categories order is kept.
function unit(data, manifest) {
  const cats = byCategory(data);
  const items = new Map();
  let i = 0;
  for (const k of cats) for (const b of k.brands) { const o = objectFor(manifest, b.slug, i++); items.set(b.slug, { o, ...objectSize(o) }); }
  const slot = Math.max(84, ...[...items.values()].map(x => x.h));
  const n = data.brands.length;
  const extra = `<div class="shelf-extra">
<p class="note-card"><span class="note-hand">Can’t see yours?</span> All ${n} titles are listed below, with years and a Dead or Ghost mark. <a href="#index">Browse the index<span aria-hidden="true"> ↓</span></a></p>
<p class="sticker" aria-hidden="true"><span class="sticker-top">Please rewind</span><span class="sticker-big">${n}</span><span class="sticker-bot">titles on file</span></p>
</div>`;
  const shelves = cats.map((k, ci) => {
    const eager = ci < 3; // the top shelf and the first pair of bays are in or near the fold
    return `<section class="shelf${ci === 0 ? ' shelf-wide' : ''}" id="shelf-${k.id}" aria-labelledby="shelf-h-${k.id}">
<ul class="objs">
${k.brands.map((b, j) => {
  const { o, w, h } = items.get(b.slug);
  return `<li class="obj"><a class="obj-link" href="/${b.slug}/"><img class="obj-img" src="${esc(o.file)}" width="${o.w}" height="${o.h}" style="--ow:${w}px;--oh:${h}px" alt="${esc(o.object)} (${esc(b.name)})"${eager ? '' : ' loading="lazy"'} decoding="async"><span class="tag${j % 2 ? ' tag-r' : ''}"><span class="tag-name">${esc(b.name)}</span><span class="tag-years">${esc(b.years)}</span></span></a></li>`;
}).join('\n')}
</ul>
${ci === 0 ? extra : ''}
<div class="board"><h3 class="shelf-label" id="shelf-h-${k.id}"><a href="/category/${k.id}/">${esc(k.label)}<span class="shelf-n"><span class="vh">, </span>${k.n}<span class="vh"> titles</span></span></a></h3></div>
</section>`;
  });
  return `<div class="unit" data-shelf style="--slot:${slot}px">
<h2 class="vh" id="shelves-h">The shelves: every brand as an object, by category</h2>
<div class="bays">
${shelves.join('\n')}
</div>
</div>`;
}

// ---------- The strip-and-ghost logo ----------
const STRIP = '/assets/homemix/strip/';
const layer = (n, cls) => `<img class="${cls}" src="${STRIP}layer-${n}-765.webp" width="765" height="132" alt="" decoding="async">`;
// Header: the four animation layers stacked in one box (they share a 765×132 canvas, so they register exactly).
// The body (strip + peel) never moves; the ghost and hands animate on hover, focus or tap (class .wave, added by homec.js;
// without JS, :hover / :focus-visible drive the same keyframes).
const stripBrand = () => `<a class="brand strip-brand" id="brand" href="/" aria-label="Spectre Brands home"><span class="strip-box" aria-hidden="true">${layer('ghost', 'sl sl-ghost')}${layer('body', 'sl sl-body')}${layer('hand-l', 'sl sl-hand-l')}${layer('hand-r', 'sl sl-hand-r')}</span></a>`;
// Footer: the static raster (AVIF/WebP) at a small size.
const stripStatic = ({ h = 34 } = {}) => {
  const w = Math.round(h * 3130 / 540);
  return `<picture class="strip-static"><source type="image/avif" srcset="${STRIP}strip-logo-510.avif 510w, ${STRIP}strip-logo-765.avif 765w, ${STRIP}strip-logo-1200.avif 1200w" sizes="${w}px"><img src="${STRIP}strip-logo-510.webp" srcset="${STRIP}strip-logo-510.webp 510w, ${STRIP}strip-logo-765.webp 765w, ${STRIP}strip-logo-1200.webp 1200w" sizes="${w}px" width="3130" height="540" alt="" style="height:${h}px" decoding="sync"></picture>`;
};

// ---------- The 3D cassette ----------
// A CSS box: the painted hero is the front face; top, bottom, left and right are black plastic drawn in CSS, as deep as
// 25/187 of the width (the real cassette is 187 × 103 × 25 mm). The strip-and-ghost body layer (plus the two hands) sits
// a little in front of the shell, on the strip's exact spot (hero pixels x 420–3550, y 0–540 of 4000 × 2207). homec.js
// tilts the box toward the cursor and lets it be dragged; without JS (or with reduced motion) it rests at a fixed angle.
function cassette() {
  return `<div class="cas" data-cassette>
<div class="cas-box">
<div class="cas-face cas-front">${heroLogo({ sizes: '(max-width: 860px) 100vw, 640px' })}<span class="cas-recess" aria-hidden="true"></span><span class="cas-sheen" aria-hidden="true"></span><span class="cas-label" aria-hidden="true">${layer('body', 'cl cl-body')}${layer('hand-l', 'cl cl-hand-l')}${layer('hand-r', 'cl cl-hand-r')}</span></div>
<div class="cas-face cas-top" aria-hidden="true"></div><div class="cas-face cas-bottom" aria-hidden="true"></div><div class="cas-face cas-left" aria-hidden="true"></div><div class="cas-face cas-right" aria-hidden="true"></div><div class="cas-face cas-back" aria-hidden="true"></div>
</div>
<span class="cas-shadow" aria-hidden="true"></span>
</div>`;
}

// ---------- Section system: a VHS-counter label above each major section ----------
// Same structure and vocabulary as the post-mortem pages' .pm-ch (assets/pmpreview/sections.css), with an hc- prefix:
// tape tab, "02 / 05", the section's name, then "Side A · 00:01:12" (reading time from the top at 220 wpm) pushed right.
const WPM = 220;
const words = html => String(html).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').split(/\s+/).filter(Boolean).length;
const counter = n => { const s = Math.round(n / WPM * 60); const p = v => String(v).padStart(2, '0'); return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`; };
function chapter(i, total, label, side, wordsSoFar) {
  const p = v => String(v).padStart(2, '0');
  return `<p class="hc-ch" data-side="${side}"><span class="hc-tape" aria-hidden="true"></span><span class="hc-n"><span class="vh">Section </span>${p(i)}<span class="hc-of"><span aria-hidden="true"> / </span><span class="vh">of </span>${p(total)}</span></span><span class="hc-k">${esc(label)}</span><span class="hc-tc"><span class="vh">reading time from the top </span><span class="hc-side" aria-hidden="true">Side ${side}</span><span class="hc-sep" aria-hidden="true">·</span><span class="hc-time">${counter(wordsSoFar)}</span></span></p>`;
}

const tier = b => `<span class="tier tier-${b.tier}">${esc(b.tierLabel)}</span>`;

function featured(b, ch) {
  return `<section class="featured" id="featured" aria-labelledby="featured-h">
${ch}
<div class="featured-pic"><a href="/${b.slug}/" tabindex="-1" aria-hidden="true">${brandPic(b, { eager: true }).replace(/decoding="async"/g, 'decoding="sync"')}</a>${b.illustration ? `<p class="pic-credit">${ILLUSTRATION_CREDIT}</p>` : (b.caption ? `<p class="pic-credit">${esc(b.caption)}</p>` : '')}</div>
<div class="featured-text">
<p class="kicker"><span class="kicker-no">No. ${esc(b.number)}</span></p>
<h2 id="featured-h"><a href="/${b.slug}/">${esc(b.name)}</a></h2>
<p class="meta-line"><span class="years">${esc(b.years)}</span><span class="sep" aria-hidden="true">·</span><a class="cat-link" href="/category/${b.category}/">${esc(b.categoryLabel)}</a><span class="sep" aria-hidden="true">·</span>${tier(b)}</p>
<p class="blurb">${esc(b.blurb)}</p>
${b.stat ? `<p class="stat"><strong class="stat-value">${esc(b.stat.value)}</strong><span class="stat-label">${esc(b.stat.label)}</span></p>` : ''}
<p class="read"><a class="btn" href="/${b.slug}/">Read the post-mortem<span aria-hidden="true"> →</span></a></p>
</div></section>`;
}

const catColor = id => ({ dotcom: '#3E5FA6', electronics: '#2C7F75', retail: '#C8513B', consumer: '#D9962C', games: '#6B7F2F', film: '#4F7CA2', restaurants: '#9A6428' })[id] || '#3E5FA6';

function ledger(data, ch) {
  const cats = byCategory(data);
  return `<section class="index" id="index" aria-labelledby="index-h">
<div class="wrap">
${ch}
<header class="index-head">
<h2 id="index-h"><span class="index-tab">Index</span> All ${data.brands.length} post-mortems, by shelf</h2>
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
</div>
</div></section>`;
}

function strip(brands, ch) {
  const hasIllo = brands.some(b => b.illustration);
  return `<section class="strip" id="archive" aria-labelledby="strip-h">
<div class="wrap">
${ch}
<header class="strip-head"><h2 id="strip-h">From the shelves</h2><p class="strip-sub">Ten of the archive’s pictures, in their source colours. Every post-mortem opens with one.</p></header>
<ul class="prints">
${brands.map(b => `<li class="print"><a href="/${b.slug}/" class="print-link"><span class="print-pic">${brandPic(b, { eager: true }).replace(/decoding="async"/g, 'decoding="sync"')}${illoTag(b)}</span><span class="print-cap"><span class="print-name">${esc(b.name)}</span><span class="print-meta"><span class="yr">${esc(b.years)}</span> · ${esc(b.categoryLabel)}</span>${tier(b)}</span></a></li>`).join('\n')}
</ul>
${hasIllo ? `<p class="strip-credit">${ILLUSTRATION_CREDIT}</p>` : ''}
</div></section>`;
}

// Own switcher: mixes A–D, this page as "C+", and the hub.
function switcherC() {
  const links = [1, 2, 3, 4].map((n, i) => `<a href="/preview/home-mix-${n}/" title="Mix ${'ABCD'[i]}">${'ABCD'[i]}</a>`).join('');
  return `<nav class="mix-switch" aria-label="Switch homepage mix"><span class="mix-switch-label">Mix C+: Front Counter</span><span class="mix-switch-links">${links}<a href="/preview/home-c/" aria-current="page" title="Mix C+: Front Counter, light and dark">C+</a><a href="/preview/" class="mix-switch-hub">Hub</a></span></nav>`;
}

// Theme: <html data-theme> is set before first paint from localStorage 'sb-theme', else from prefers-color-scheme.
const THEME_HEAD = `<meta name="color-scheme" content="light dark">
<script>(function(){var d=document.documentElement,t=null;d.className+=' js';try{t=localStorage.getItem('sb-theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t)})();</script>
<script src="/assets/homemix/homec.js" defer></script>`;
const THEME_SCRIPT = `<script>(function(){var d=document.documentElement,b=document.getElementById('theme-btn');if(!b||!window.matchMedia)return;var mq=matchMedia('(prefers-color-scheme: dark)');
function saved(){try{return localStorage.getItem('sb-theme')}catch(e){return null}}
function apply(t){d.setAttribute('data-theme',t);b.setAttribute('aria-pressed',t==='dark'?'true':'false');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${D.charcoal}':'${L['hero-wall']}')}
b.hidden=false;apply(d.getAttribute('data-theme')||(mq.matches?'dark':'light'));
b.addEventListener('click',function(){var t=d.getAttribute('data-theme')==='dark'?'light':'dark';try{localStorage.setItem('sb-theme',t)}catch(e){}apply(t)});
function onChange(e){var s=saved();if(s!=='light'&&s!=='dark')apply(e.matches?'dark':'light')}
if(mq.addEventListener)mq.addEventListener('change',onChange);else if(mq.addListener)mq.addListener(onChange)})();</script>`;

export function render(data) {
  const manifest = readManifest();
  const all = ordered(data);
  const lead = all[0];
  const picks = all.slice(1, 11);
  const nCats = data.categories.length;
  const N = 5; // numbered sections after the hero: standfirst, featured, index, photo strip, end of tape
  const header = `<a class="skip" href="#main">Skip to content</a>
<div class="hc-prog" aria-hidden="true"><i></i></div>
<header class="mast"><div class="wrap mast-in">
${stripBrand()}
<button class="theme-btn" id="theme-btn" type="button" aria-pressed="false" hidden><svg class="theme-ico" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path class="ico-moon" d="M13.6 2.6a7.5 7.5 0 1 0 3.8 10.6A6 6 0 0 1 13.6 2.6Z"/><g class="ico-sun"><circle cx="10" cy="10" r="4"/><path d="M10 1v2.5M10 16.5V19M1 10h2.5M16.5 10H19M3.6 3.6l1.8 1.8M14.6 14.6l1.8 1.8M3.6 16.4l1.8-1.8M14.6 5.4l1.8-1.8"/></g></svg><span class="theme-txt">Dark mode</span></button>
<nav class="nav" aria-label="Site"><a href="#index">Archive</a><a href="#index">Categories</a><a href="/about/">About</a><a href="/">Search</a></nav>
</div></header>`;
  const hero = `<section class="hero" aria-labelledby="hero-h">
<div class="wrap hero-in">
<div class="hero-logo-slot">${cassette()}</div>
<div class="hero-text">
<p class="eyebrow"><span>Sourced post-mortems<span class="eyebrow-dot" aria-hidden="true"></span></span> <span>${data.brands.length} brands<span class="eyebrow-dot" aria-hidden="true"></span></span> <span>${nCats} shelves</span></p>
<h1 id="hero-h">${data.site.headlineHtml}</h1>
<p class="hero-links"><a class="btn btn-amber" href="#index">Browse the index<span aria-hidden="true"> ↓</span></a><a class="hero-about" href="/about/">How the post-mortems are built</a></p>
</div>
${unit(data, manifest)}
</div>
</section>`;
  // the counter advances with the words read so far (hero included), so every label is a real position on the tape
  let w = words(hero);
  const standfirst = `<section class="standfirst-sec" aria-labelledby="standfirst-h">
${chapter(1, N, 'The archive', 'A', w)}
<h2 class="vh" id="standfirst-h">About the archive</h2>
<div class="standfirst">
<p class="standfirst-text">${data.site.introHtml}</p>
<dl class="key" aria-label="Key to the Dead and Ghost marks">
<div class="key-row"><dt>${tier({ tier: 'dead', tierLabel: 'Dead' })}</dt><dd>${esc(data.site.tiers.dead)}</dd></div>
<div class="key-row"><dt>${tier({ tier: 'ghost', tierLabel: 'Ghost' })}</dt><dd>${esc(data.site.tiers.ghost)}</dd></div>
</dl>
</div>
</section>`;
  w += words(standfirst);
  const feat = featured(lead, chapter(2, N, 'Featured post-mortem', 'A', w));
  w += words(feat);
  const idx = ledger(data, chapter(3, N, 'The index', 'A', w));
  w += words(idx);
  const photos = strip(picks, chapter(4, N, 'From the shelves', 'B', w));
  w += words(photos);
  return head(meta, { themeColor: L['hero-wall'], extra: THEME_HEAD }) + `
${header}
<main id="main">
${hero}
<div class="body"><div class="wrap">
${standfirst}
${feat}
</div></div>
${idx}
${photos}
</main>
<footer class="foot"><div class="wrap foot-in">
${chapter(5, N, 'End of tape', 'B', w)}
<p class="foot-brand"><a class="brand brand-foot" href="/" aria-label="Spectre Brands home">${stripStatic({ h: 34 })}</a></p>
<nav class="foot-nav" aria-label="Footer"><a href="/about/">About the archive</a><a href="#index">Index</a><a href="/">Search</a></nav>
${footerNote()}
</div></footer>
${switcherC()}
${THEME_SCRIPT}
</body></html>`;
}

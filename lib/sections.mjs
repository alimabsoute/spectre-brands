import fs from 'node:fs';
import { factFile, nowCards } from './viz/cards.mjs';
import { scrolly } from './viz/scrolly.mjs';
import { connections } from './viz/connections.mjs';
import { sourceBody } from './citations.mjs';
import { esc, inline, md, fn } from './md.mjs';
import { SECTIONS, TIERS } from './registry.mjs';
import { blocks } from './blocks.mjs';
import { picture, figure, imageKind, strength, isStrong, videoCard, VIDEO_TYPES } from './media.mjs';
import { waffle } from './infographics.mjs';
import { filmFor, filmHero } from './film.mjs';

// Images judged weak openers in docs/design-review-v2/IMAGE_SELECTION.md: sparse, incomplete or evidence-heavy.
// They are kept, at full size and with their provenance, in the Archive at the foot of the gallery.
const WEAK = /(^|\/)(closing-2013-miami|archive-2000-11-farewell|orbitz-(dec-1997|jan-1999|feb-2000|jan-2001|may-2001))\./;
const isWeak = file => WEAK.test(file);
// Where a pattern's opener points beyond the story: the journey leads into the map and the charts, the visual
// archive into the old website and the gallery.
const ROUTES = { journey: ['map', 'numbers', 'marketing'], archive: ['website', 'gallery'] };

const secHead = s => `<div class="sec-head"><p class="sec-k">${esc(s.kicker || s.label)}</p><h2>${inline(s.title)}</h2>${s.lede ? `<p class="lede">${inline(s.lede)}</p>` : ''}</div>`;
const wrap = (id, s, inner) => `<section id="${id}" class="sec sec-${SECTIONS[id].type}" aria-labelledby="${id}-h"><div class="wrap">\n${secHead(s).replace('<h2>', `<h2 id="${id}-h">`)}\n${inner}\n</div></section>\n`;

// The page opens on the strongest real image the brand has: the best of the three archive images chosen for
// the hero or, when none of those is a photograph, a storefront, sign, ad or product photo from the gallery.
// The brand's drawing leads only when there is no real image at all.
export function heroImages(c, ctx) {
  const g = c.sections.gallery?.archive || [];
  const load = a => ({ ...a, i: ctx.image(a.image), credit: a.credit || g.find(x => x.image === a.image)?.credit });
  const own = (c.hero.archive || []).map(load).filter(a => a.i);
  if (!own.length) return null;
  const best = (l, mine) => l.reduce((a, b) => strength(b, mine) > strength(a, mine) ? b : a);
  let lead = best(own, true);
  if (imageKind(lead.image, lead.i) !== 'photo') {
    const extra = g.filter(x => !own.some(o => o.image === x.image) && isStrong(x.image)).map(load).filter(a => a.i && a.i.w >= 700 && imageKind(a.image, a.i) === 'photo');
    if (extra.length) lead = best(extra);
  }
  const side = own.filter(a => a !== lead), mark = a => imageKind(a.image, a.i) === 'mark';
  return { lead, side: [...side.filter(a => !mark(a)), ...side.filter(mark)] };
}

export function overview(c, ctx, site) {
  if (c.factFile?.length) return overviewV2(c, ctx, site);
  const h = c.hero, t = TIERS[c.tier], cat = site.categories.find(k => k.id === c.category), m = heroImages(c, ctx);
  const alt = a => a.alt || `${c.name} archive image: ${a.caption}`, vt = `view-transition-name:art-${esc(c.slug)}`;
  if (m) ctx.heroLead = m.lead.image;
  // The opener is shaped by the brand's strongest asset: a wide photograph runs at 8 of 12 columns, a panorama at
  // the full width, an upright picture (or the drawing, if there is no real image) stands beside the title, and an
  // archived web page sits in a browser frame. On a phone the image always comes first, above the name.
  const kind = m && imageKind(m.lead.image, m.lead.i), ar = m ? m.lead.i.w / m.lead.i.h : 0;
  const v = !m ? 'upright drawing' : kind === 'capture' ? 'screen' : ar < 1 ? 'upright' : ar >= 1.65 && m.lead.i.w >= 1000 ? 'pano' : 'wide';
  const lead = m && figure(ctx, m.lead, { cls: 'hero-lead', alt: alt(m.lead), eager: true, style: vt });
  const framed = s => s.replace('<a class="zoom"', `<div class="browser"><div class="chrome" aria-hidden="true"><span class="cd"></span><span class="cd"></span><span class="cd"></span><span class="url">${esc(String(m.lead.caption || '').replace(/\[\^\d+\]/g, ''))}</span></div><a class="zoom"`).replace('</a><figcaption>', '</a></div><figcaption>');
  const media = m
    ? `${v === 'screen' ? framed(lead) : lead}<div class="hero-side n${m.side.length}">${m.side.map(a => figure(ctx, a, { cls: 'hero-fig', alt: alt(a) })).join('')}</div>`
    : `<figure class="hero-lead hero-art" style="${vt}">${ctx.art(h.art)}<figcaption>${inline(h.artCaption)}</figcaption></figure>`;
  return `<header class="hero v-${v}" id="overview" data-sec="overview"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/category/${esc(c.category)}/">${esc(cat.label)}</a></nav>
<div class="hero-open">
<div class="hero-head"><div class="hero-title">
<p class="kicker"><span class="tag ${c.tier}">${esc(t.label)}</span><span>${esc(c.place)}</span></p>
<h1 class="name" style="view-transition-name:name-${esc(c.slug)}">${esc(c.name)}</h1>
${factFile(c, site)}
<p class="dates">${inline(h.dates)}</p>
<p class="standfirst">${inline(h.standfirst)}</p>
</div><p class="tier-why"><b>Why ${esc(t.label.toLowerCase())}:</b> ${inline(c.tierWhy || '')}</p></div>
<div class="hero-media">${media}</div>
</div>
<div class="hero-intro">${md(h.deck, 'deck')}</div>
${c.keyNumbers ? `<div class="hero-nums"><h2 class="h-small">${inline(c.keyNumbers.caption || `${c.name} in numbers`)}</h2><div class="ctr-rows">${c.keyNumbers.rows.map(r => `<div class="ctr"><div class="ctr-v" data-count="${esc(r.value)}">${esc(r.value)}</div><div class="ctr-t">${inline(r.text)}</div></div>`).join('')}</div></div>` : ''}
${c.findings ? `<div class="findings"><h2 class="h-small">Key findings</h2><ol>${c.findings.map(f => `<li><b>${inline(f.title)}</b> ${inline(f.text)}</li>`).join('')}</ol></div>` : ''}
<p class="byline">Post-mortem No. ${esc(c.number)} · Every figure links to a numbered source · Derived figures, estimates and unverified claims are labeled</p>
</div></header>
`;
}

// The first screen pairs the brand and standfirst with the opener its pattern calls for. The native dossier
// keeps the complete overview, figures and facts accessible without JavaScript; the overview's other archive
// images are in the gallery's Archive.
function overviewV2(c, ctx, site) {
  const h = c.hero, t = TIERS[c.tier], cat = site.categories.find(k => k.id === c.category), m = heroImages(c, ctx);
  const alt = a => a.alt || `${c.name} archive image: ${a.caption}`, vt = `view-transition-name:art-${esc(c.slug)}`;
  if (m) ctx.heroLead = m.lead.image;
  const treatment = ['tape', 'browser', 'bottle'].includes(h.treatment) ? h.treatment : m && imageKind(m.lead.image, m.lead.i) === 'capture' ? 'browser' : 'archive';
  // Each pilot opens in its own pattern: a film on a television (cinema), the storefront capture beside the
  // complete drawing with links into the map and charts (journey), or the product photograph beside the drawing
  // (archive). A page with none of these keeps the single lead image.
  const yrs = String(c.years || '').match(/\d{4}/g) || [], y0 = yrs[0], y1 = yrs[1] || c.died;
  const film = filmFor(c.slug, ctx.warn);
  const pattern = film ? 'cinema' : h.art && m && treatment === 'browser' ? 'journey' : h.art && m && treatment === 'bottle' ? 'archive' : 'plain';
  const all = m ? [m.lead, ...m.side].filter(a => (c.hero.archive || []).some(x => x.image === a.image)) : [];
  const want = pattern === 'journey' ? 'capture' : 'photo', ok = all.filter(a => !isWeak(a.image));
  const pick = pattern === 'cinema' ? null : pattern === 'plain' ? m?.lead : ok.find(a => imageKind(a.image, a.i) === want) || ok[0] || m.lead;
  const kind = pick && imageKind(pick.image, pick.i);
  ctx.heroLead = pick?.image || null;
  let lead = pick ? figure(ctx, pick, { cls: 'hero-lead', alt: alt(pick), eager: true, style: vt }) : film ? '' : `<figure class="hero-lead hero-art" style="${vt}">${ctx.art(h.art)}<figcaption>${inline(h.artCaption)}</figcaption></figure>`;
  if (pick && kind === 'capture') lead = lead.replace('<a class="zoom"', `<div class="browser"><div class="chrome" aria-hidden="true"><span class="cd"></span><span class="cd"></span><span class="cd"></span><span class="url">${esc(String(pick.caption || '').replace(/\[\^\d+\]/g, ''))}</span></div><a class="zoom"`).replace('</a><figcaption>', '</a></div><figcaption>');
  lead = lead.replace('<figcaption>', '<figcaption><details class="hx-credit"><summary>Image credit</summary>').replace('</figcaption>', '</details></figcaption>');
  // The overview's other archive images move to the labeled Archive at the foot of the gallery, captions and
  // credits intact. A page without a gallery keeps them here.
  const rest = (m ? (pattern === 'plain' ? m.side : all) : []).filter(a => a !== pick);
  const moved = !!c.sections.gallery && rest.length > 0;
  if (moved) ctx.overviewArchive = rest;
  ctx.weakCaptures = (c.sections.website?.captures || []).filter(x => isWeak(x.image)).map(x => ({ ...x, section: c.sections.website.label || SECTIONS.website.label }));
  const side = moved ? `<p class="hx-archive-ref"><a href="#gallery-archive">Archive images (${rest.length})</a></p>`
    : rest.length ? `<section class="hx-archive" aria-labelledby="hx-${esc(c.slug)}-archive"><h2 id="hx-${esc(c.slug)}-archive" class="h-small">Archive</h2><div class="hx-thumbs n${rest.length}">${rest.map(a => figure(ctx, a, { cls: 'hero-fig', alt: alt(a) })).join('')}</div></section>` : '';
  const route = (ROUTES[pattern] || []).filter(k => c.sections[k]);
  const routeNav = route.length ? `<nav class="hx-route" aria-label="Jump to"><ol>${route.map(k => `<li><a href="#${k}">${esc(c.sections[k].label || SECTIONS[k].label)}</a></li>`).join('')}</ol></nav>` : '';
  // The drawing's full caption stays on the page, folded under a short label that says what the drawing is.
  const artNote = h.artCaption ? `<details class="hx-art-note"><summary>Original illustration · not official artwork</summary><p>${inline(h.artCaption)}</p></details>` : '';
  const art = () => `<figure class="hx-art">${ctx.art(h.art)}<figcaption>${artNote}</figcaption></figure>`;
  const media = pattern === 'cinema' ? filmHero(film, c)
    : pattern === 'plain' ? `<div class="hx-media${pick ? ` k-${esc(kind)}` : ''}"><div class="hx-osd" aria-hidden="true"><span class="hx-play">SP</span><span class="hx-tc">${esc(y0 || '')}${y1 ? `–${esc(y1)}` : ''}</span></div>${treatment === 'bottle' ? '<div class="hx-orbits" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}${lead}</div>`
    : `<div class="hx-media hx-duo k-${esc(kind)}">${treatment === 'bottle' ? '<div class="hx-orbits" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}${lead}${art()}</div>`;
  const tape = y0 && y1 ? `<div class="hx-tape" aria-hidden="true"><span class="hx-reel"></span><span class="hx-y">${esc(y0)}</span><span class="hx-track"><span class="hx-fill"></span></span><span class="hx-y">${esc(y1)}</span><span class="hx-reel"></span></div>` : '';
  const nums = c.keyNumbers ? `<div class="hero-nums hx-nums"><h2 class="h-small">${inline(c.keyNumbers.caption || `${c.name} in numbers`)}</h2><div class="ctr-rows">${c.keyNumbers.rows.map((r, i) => `<div class="ctr" style="--i:${i}"><div class="ctr-v" data-count="${esc(r.value)}">${esc(r.value)}</div><div class="ctr-t">${inline(r.text)}</div></div>`).join('')}</div></div>` : '';
  const panels = [
    ['facts', 'Fact file', factFile(c, site)],
    c.findings ? ['findings', 'Key findings', `<div class="findings"><ol>${c.findings.map(f => `<li><b>${inline(f.title)}</b> ${inline(f.text)}</li>`).join('')}</ol></div>`] : null,
    ['why', `Why ${t.label.toLowerCase()}`, `<p class="tier-why">${inline(c.tierWhy || '')}</p>`]
  ].filter(Boolean);
  const id = `hx-${esc(c.slug)}`;
  const tabs = `<div class="hx-tabs" role="tablist" aria-label="${esc(c.name)} at a glance" hidden>${panels.map(([k, l], i) => `<button type="button" role="tab" id="${id}-t-${k}" aria-controls="${id}-p-${k}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? '-1' : '0'}">${esc(l)}</button>`).join('')}<span class="hx-ind" aria-hidden="true"></span></div>`;
  return `<header class="hero hero-x hx-treatment-${treatment} hx-pattern-${pattern}" id="overview" data-sec="overview"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/category/${esc(c.category)}/">${esc(cat.label)}</a></nav>
<div class="hx-grid">
<div class="hx-copy">
<p class="kicker"><span class="tag ${c.tier}">${esc(t.label)}</span><span>${esc(c.place)}</span></p>
<h1 class="name" style="view-transition-name:name-${esc(c.slug)}">${esc(c.name)}</h1>
<p class="standfirst">${inline(h.standfirst)}</p>
${pattern === 'cinema' ? '' : tape}
<a class="hx-story-link" href="#story">Read the story <span aria-hidden="true">↓</span></a>
${routeNav}
</div>
${media}
</div>
<details class="hx-dossier"><summary><span>${moved ? 'Overview &amp; facts' : 'Overview, facts &amp; archive'}</span><span class="hx-dossier-hint">Open dossier</span><span class="hx-disclosure-icon" aria-hidden="true">+</span></summary><div class="hx-dossier-body">
<p class="dates">${inline(h.dates)}</p>
<div class="hero-intro hx-context">${md(h.deck, 'deck')}</div>
${nums}
<div class="hx-deck" data-hx-tabs>${tabs}${panels.map(([k, l, html], i) => `<section class="hx-panel" id="${id}-p-${k}" role="tabpanel" aria-labelledby="${id}-t-${k}" data-k="${k}"><h2 class="hx-ph">${esc(l)}</h2>${html}</section>`).join('')}</div>
${side}
<p class="byline">Post-mortem No. ${esc(c.number)} · Every figure links to a numbered source · Derived figures, estimates and unverified claims are labeled</p>
</div></details>
</div></header>
`;
}

// One row per chapter: the chapter's figure and visual on the left, its text on the right.
function story(s, ctx) {
  const html = storyChapters(s, ctx);
  return s.variant === 'scrolly' ? scrolly(s, html, ctx) : html;
}
function storyChapters(s, ctx) {
  const ch = s.chapters, n = ch.length;
  return `<div class="story">${ch.map((c, i) => {
    let vis = '';
    if (c.video) {
      const v = ctx.videos[c.video];
      if (!v) throw new Error(`story chapter ${i + 1} refers to unknown video id "${c.video}"`);
      ctx.inlineVideos.add(v.id); vis = videoCard(v, { compact: true });
    } else if (c.image) vis = `<figure class="chap-img">${picture(ctx, c.image.image || c.image, { alt: c.image.alt || c.image.caption || `${c.title}` })}${c.image.caption ? `<figcaption>${inline(c.image.caption)}</figcaption>` : ''}</figure>`;
    else if (c.art || s.stageArt) vis = `<figure class="chap-art">${ctx.art(c.art || s.stageArt)}${c.artCaption ? `<figcaption>${inline(c.artCaption)}</figcaption>` : ''}</figure>`;
    return `<article class="chap rv" style="--c:${esc(c.color || 'var(--brand)')}">
<div class="chap-vis"><div class="chap-vis-in">
<div class="chap-fig"><p class="chap-n"><span>Chapter ${i + 1} of ${n}</span><span class="chap-dots" aria-hidden="true">${ch.map((_, k) => `<i${k <= i ? ' class="on"' : ''}></i>`).join('')}</span></p><p class="big" data-count="${esc(c.big)}">${esc(c.big)}</p><p class="cap">${inline(c.cap)}</p></div>
${vis}</div></div>
<div class="chap-text"><p class="when">${esc(c.when)}</p><h3>${inline(c.title)}</h3>${md(c.body)}${c.pull ? `<blockquote class="pull"><p>${inline(c.pull.text)}</p><footer>${inline(c.pull.who)}</footer></blockquote>` : ''}</div>
</article>`;
  }).join('\n')}</div>`;
}

// Where each event sits on the time axis, as a fractional year. Dates in the data are free text
// ("Oct 7" + "1998", "Early 1994", "1930s", "FY 2002", "1999" + "Q4"). An event with no year keeps the
// previous event's year; a year with no month sits at mid-year. Source order is never reversed.
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const FUZZY = { early: 1, winter: 1, q1: 2, spring: 4, q2: 5, summer: 7, q3: 8, fall: 10, autumn: 10, late: 11, q4: 11, fy: 12 };
export function eventTimes(events) {
  let year = null, last = -Infinity;
  return events.map(e => {
    const s = `${e.date ?? ''} ${e.year ?? ''}`.toLowerCase();
    const y = s.match(/(?<!\d)(1[89]|20)\d\d(?!\d)/);
    if (y) year = +y[0];
    if (year == null) throw new Error(`timeline event "${e.title}" has no year in "${e.date}" / "${e.year}"`);
    const mi = MONTHS.findIndex(m => new RegExp(`\\b${m}`).test(s));
    const fz = Object.keys(FUZZY).find(k => new RegExp(`\\b${k}`).test(s));
    const day = s.match(/\b[a-z]{3,9}\.? (\d{1,2})(?!\d)/);
    const frac = /\d{3}0s/.test(s) ? 5
      : mi >= 0 ? (mi + (day ? (+day[1] - 1) / 31 : fz === 'early' ? .15 : fz === 'late' ? .85 : .5)) / 12
      : fz ? (FUZZY[fz] - .5) / 12 : .5;
    last = Math.max(last, year + frac);
    return +last.toFixed(3);
  });
}

// One compact view: a time-scaled chart built by timeline.js from this list. Without JavaScript the
// list is the timeline, folded into <details>.
function timeline(s, ctx) {
  const cats = s.categories || {}, t = eventTimes(s.events), m = ctx.meta;
  const chips = [['all', 'All'], ...Object.entries(cats).map(([k, v]) => [k, v.label])].map(([k, l], i) => `<button type="button" class="chip${i ? '' : ' on'}" data-f="${k}" aria-pressed="${i ? 'false' : 'true'}">${k === 'all' ? '' : `<i class="cdot" style="background:${esc(cats[k].color)}"></i>`}${esc(l)}</button>`).join('');
  const when = e => [e.date, e.year].filter((x, i, a) => x && (i === 0 || !String(a[0] || '').includes(x))).join(' ');
  return `<div class="tlx"${s.animated ? ' data-animated-timeline="true"' : ''} id="tlx" data-y0="${parseInt(m.years, 10)}" data-died="${+m.died}" style="--n:${Object.keys(cats).length}">
<div class="tlx-bar"><div class="tl-filters" id="tlf" role="group" aria-label="Filter the timeline by thread">${chips}</div></div>
${s.animated ? `<div class="timeline-scrub" hidden><label for="timeline-progress">Timeline progress</label><input id="timeline-progress" type="range" min="0" max="${s.events.length - 1}" value="0"><progress max="${s.events.length}" value="1" aria-label="Events reached"></progress></div>` : ''}
<div class="tlx-stage" id="tlxStage"></div>
<details class="data tl-list"><summary>All ${s.events.length} events as a list</summary>
<ol class="tlv" id="tlv">${s.events.map((e, i) => `<li class="ev" data-cat="${esc(e.cat)}" data-t="${t[i]}" data-d="${esc(when(e))}" style="--c:${esc((cats[e.cat] || {}).color || 'var(--brand)')}"><div class="d"><b>${esc(e.date)}</b>${esc(e.year || '')}</div><div class="ev-b"><div class="c">${esc((cats[e.cat] || {}).label || '')}</div><h3>${inline(e.title)}</h3><p>${inline(e.text)}${fn(e.src)}</p></div></li>`).join('')}</ol></details>
</div>`;
}

// The map runs the full width. Places are labelled on the map by map.js; the same places are listed, folded,
// underneath (that list is also what a reader without JavaScript gets).
function map(s, ctx) {
  ctx.data.map = { pins: s.pins, steps: s.steps, legend: s.legend, rings: s.rings || [], choropleth: s.choropleth || null, view: s.view || 'us' };
  const f = s.figure;
  const legend = s.legend.map(l => `<span><span class="lg-pin c-${esc(l.cat)}"></span>${inline(l.label)}</span>`).join('') + '<span><span class="lg-pin closed"></span>Closed by the selected date</span>';
  const ch = s.choropleth ? `<div class="choro-legend" id="choroLegend"></div>` : '';
  return `<figure class="map-fig">
<div class="card-head"><div><h3 class="fig-t" data-fig="Map">${inline(f.title)}</h3><p><b>What this map shows:</b> ${inline(f.whatItShows)}</p></div></div>
<div class="map-legend">${legend}</div>${ch}
<div class="tlbar" id="tlbar" role="group" aria-label="Timeline linked to the map. Use the arrow keys to step.">
<div class="tl-ctl"><button type="button" class="tl-play" id="tlPlay" aria-label="Play the timeline">Play</button><button type="button" class="tl-step" id="tlPrev" aria-label="Previous event">‹</button><button type="button" class="tl-step" id="tlNext" aria-label="Next event">›</button></div>
<div class="tl-track" id="tlTrack"><div class="tl-line"></div><div class="tl-fill" id="tlFill"></div></div>
</div>
<div class="mapbox" id="mapbox"><svg class="base" id="mapBase" viewBox="0 0 975 610" aria-hidden="true"></svg><svg class="ov" id="mapOv" viewBox="0 0 975 610" role="group" aria-label="${esc(String(f.title).replace(/\[\^\d+\]/g, ''))}"></svg><div class="maptip" id="mapTip"></div><div class="map-stat" id="mapStat"></div></div>
<div class="map-below"><div class="step-card" id="stepCard" aria-live="polite"></div><div class="step-card place-card" id="placeCard" aria-live="polite"></div></div>
<details class="data"><summary>All ${s.pins.length} places as a list</summary><ol class="map-key">${s.pins.map(p => `<li data-map-pin="${esc(p.id)}"><b>${inline(p.title)}</b>${p.when ? ` <span class="kw">${esc(p.when)}</span>` : ''}<p>${inline(p.text)}${fn(p.src)}</p></li>`).join('')}</ol></details>
<details class="data map-steps"><summary>All ${s.steps.length} map steps</summary><ol>${s.steps.map((step, i) => `<li><h4>${inline(step.title)}</h4><p data-map-step="${i}">${inline(step.text)}${fn(step.src)}</p></li>`).join('')}</ol></details>
<figcaption>${inline(f.caption)}</figcaption>
</figure>${blocks(s.blocks, ctx)}`;
}

function videos(s, ctx) {
  const list = s.videos;
  const types = [...new Set(list.map(v => v.type))];
  const chips = types.length > 1 ? `<div class="tl-filters" id="vidf" role="group" aria-label="Filter footage by type"><button type="button" class="chip on" data-f="all" aria-pressed="true">All ${list.length}</button>${types.map(t => `<button type="button" class="chip" data-f="${esc(t)}" aria-pressed="false">${esc(VIDEO_TYPES[t] || t)}</button>`).join('')}</div>` : '';
  return `${chips}<div class="vid-grid" id="vidGrid">${list.map(v => `<div class="vid-cell rv" data-type="${esc(v.type)}">${videoCard(v)}</div>`).join('')}</div>
<p class="note">Videos are embedded from the services that host them and load only when you press play. YouTube embeds use youtube-nocookie.com. Each video belongs to its uploader or rights holder and is shown here for commentary; we do not host any of the files.${s.note ? ' ' + inline(s.note) : ''}</p>${blocks(s.blocks, ctx)}`;
}

function website(s, ctx) {
  const tabs = s.captures.map((c, i) => `<button type="button" role="tab" id="wbt-${i}" aria-controls="wbv-${i}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? -1 : 0}" data-i="${i}"${i ? '' : ' class="on"'}><b>${esc(c.date)}</b>${esc(c.label)}</button>`).join('');
  const views = s.captures.map((c, i) => `<div class="wb-view" role="tabpanel" id="wbv-${i}" aria-labelledby="wbt-${i}" data-i="${i}"${i ? ' hidden' : ''}>
<figure class="browser"><div class="chrome" aria-hidden="true"><span class="cd"></span><span class="cd"></span><span class="cd"></span><span class="url">${esc(c.url)}</span></div><a class="shot" href="${esc(c.wayback)}" target="_blank" rel="noopener" aria-label="Open the ${esc(c.captured)} capture of ${esc(c.url)} on the Wayback Machine">${picture(ctx, c.image, { alt: `Screenshot of ${c.url} as archived ${c.captured}` })}</a></figure>
<div class="wb-cap"><p class="d">Captured ${esc(c.captured)}</p><h3>${inline(c.title)}</h3>${md(c.text)}${c.warn ? `<div class="warn">${inline(c.warn)}</div>` : ''}<p class="arch"><a href="${esc(c.wayback)}" target="_blank" rel="noopener">Open this capture on the Wayback Machine</a></p></div>
</div>`).join('\n');
  const snips = s.snips ? `<div class="snips"><h3 class="sub-h">Text preserved in the archived pages</h3><div class="snips-g">${s.snips.map(x => `<div class="snip">${inline(x.text)}<div class="when">${inline(x.when)}</div></div>`).join('')}</div></div>` : '';
  return `<div class="wb-strip" id="wbStrip" role="tablist" aria-label="Archived captures">${tabs}</div><div id="wbViews">${views}</div>${snips}${s.note ? `<p class="note">${inline(s.note)}</p>` : ''}${blocks(s.blocks, ctx)}`;
}

// Mixed-size rows with no card chrome and no orphans. The lead photograph (the strongest one the hero has not
// already used) gets a row of its own, or shares it with one upright picture; the rest are packed so that
// every picture in a row has the same height.
function archiveRows(photos, heroLead) {
  if (!photos.length) return [];
  const ar = a => a.i.w / a.i.h, fresh = photos.filter(a => a.image !== heroLead);
  const lead = (fresh.length ? fresh : photos).reduce((a, b) => strength(b) > strength(a) ? b : a);
  const rest = photos.filter(a => a !== lead);
  // an upright lead is paired with the strongest wide picture instead, so no row is one tall sliver
  const mate = ar(lead) < 1 ? rest.filter(a => ar(a) >= 1).sort((a, b) => strength(b) - strength(a))[0] : rest.filter(a => ar(a) <= .9).sort((a, b) => ar(a) - ar(b))[0];
  const rows = [(mate ? [lead, mate] : [lead]).sort((a, b) => ar(b) - ar(a))];
  let row = [], sum = 0;
  for (const a of rest.filter(a => a !== mate)) { row.push(a); sum += ar(a); if (sum >= 3) { rows.push(row); row = []; sum = 0; } }
  if (row.length) (rows.length === 1 && row.length === 1 || rows.length > 1 && sum < 1.6 ? rows.at(-1) : rows[rows.push([]) - 1]).push(...row);
  return rows;
}

// The Archive at the foot of the gallery: the weaker gallery images, the images the overview used to carry and
// the weaker website captures. Each keeps its caption and credit and links to the full-size file; an image that
// arrives with two captions is shown once with both.
function bottomArchive(shown, weak, ctx) {
  const dupe = a => shown.some(x => x.image === a.image && (x.caption || '') === (a.caption || ''));
  const groups = new Map();
  for (const a of [...weak, ...(ctx.overviewArchive || []).filter(a => !dupe(a))]) {
    const g = groups.get(a.image) || groups.set(a.image, { a, caps: [] }).get(a.image);
    const cap = `${a.date ? `<b>${esc(a.date)}</b> ` : ''}${inline(a.caption || '')}${a.credit ? `<span class="credit">${inline(a.credit)}</span>` : ''}`;
    if (!g.caps.includes(cap)) g.caps.push(cap);
  }
  for (const x of ctx.weakCaptures || []) {
    const i = ctx.image(x.image);
    if (!i) continue;
    const g = groups.get(x.image) || groups.set(x.image, { a: { image: x.image, i, alt: `Screenshot of ${x.url} as archived ${x.captured}` }, caps: [] }).get(x.image);
    g.caps.push(`${esc(x.url)}, captured ${esc(x.captured)}. Described under <a href="#website">${esc(x.section)}</a>. <a href="${esc(x.wayback)}" rel="noopener">Wayback Machine capture</a>`);
  }
  // every overview image is already in the rows above, under the same caption: keep the dossier's link valid
  if (!groups.size) return ctx.overviewArchive?.length ? '<span id="gallery-archive"></span>' : '';
  const figs = [...groups.values()].map(({ a, caps }) => {
    const full = a.i.fallback || a.i.src, plain = String(a.caption || '').replace(/\[\^\d+\]/g, '');
    return `<figure class="ga-fig k-${imageKind(a.image, a.i)}"><a class="zoom" href="${esc(full)}">${picture(ctx, a.image, { alt: a.alt || plain })}</a><figcaption>${caps.map(x => `<span class="ga-cap">${x}</span>`).join('')}<a class="ga-full" href="${esc(full)}">Full size${a.i.w ? `, ${a.i.w} × ${a.i.h}` : ''}</a></figcaption></figure>`;
  }).join('');
  return `<h3 class="sub-h" id="gallery-archive">Archive</h3><p class="ga-note">Images from the overview and weaker source material, kept at full size with their captions and credits.</p><div class="ga-grid">${figs}</div>`;
}

function gallery(s, ctx) {
  const every = (s.archive || []).map(a => ({ ...a, i: ctx.image(a.image) })).filter(a => a.i), ar = a => a.i.w / a.i.h;
  const items = every.filter(a => !isWeak(a.image));
  // logos and other small marks sit below the photographs, at their own size
  const marks = items.filter(a => imageKind(a.image, a.i) === 'mark');
  // a row is never taller than 34rem and never enlarges its smallest picture by more than 30%
  const rows = archiveRows(items.filter(a => !marks.includes(a)), ctx.heroLead).map(r => `<div class="gl-row${r.length === 1 ? ' solo' : ''}" style="max-width:${Math.round(Math.min(544, ...r.map(a => a.i.h * 1.3)) * r.reduce((n, a) => n + ar(a), 0) + (r.length - 1) * 24)}px">${r.map(a => figure(ctx, a, { cls: 'gl-fig rv', alt: a.alt || a.caption, style: `--ar:${ar(a).toFixed(3)}` })).join('')}</div>`).join('');
  const logos = rows + (marks.length ? `<div class="gl-marks">${marks.map(a => figure(ctx, a, { cls: 'gl-mark rv', alt: a.alt || a.caption, style: `--w:${a.i.w}px` })).join('')}</div>` : '');
  const draws = (s.drawings || []).map(d => `<figure class="gd-item rv">${ctx.art(d.art)}<figcaption><b>${inline(d.title)}</b> ${inline(d.caption)}</figcaption></figure>`).join('');
  const r = s.recreation;
  const rec = r ? `<div class="recreation rv" style="--r-bar:${esc(r.bar.bg)};--r-bar-fg:${esc(r.bar.fg)};--r-nav:${esc(r.nav.bg)};--r-nav-fg:${esc(r.nav.fg)};--r-tab:${esc(r.nav.tab || '#fff')};--r-side:${esc(r.side.bg)};--r-btn:${esc(r.buttons.bg)};--r-btn-fg:${esc(r.buttons.fg)};--r-font:${esc(r.font || "'Varela Round',sans-serif")}" role="img" aria-label="A recreation of the ${esc(r.bar.word)} site header in its original colours">
<div class="r-bar"><div class="r-word">${esc(r.bar.word)}<small>${esc(r.bar.sub)}</small></div><div class="r-btns">${r.buttons.items.map(b => `<span>${esc(b)}</span>`).join('')}</div></div>
<div class="r-nav${r.nav.tabs ? ' tabs' : ''}">${r.nav.items.map(b => `<span>${esc(b)}</span>`).join('')}</div>
<div class="r-body"><div class="r-side">${r.side.items.map(b => `<div>${esc(b)}</div>`).join('')}</div><div class="r-main">${ctx.art(r.art)}<div><div class="r-head">${esc(r.headline)}<br><span>${esc(r.subhead)}</span></div><p>${esc(r.body)}</p></div></div></div>
</div>` : '';
  const sw = s.swatches ? `<div class="swatches">${s.swatches.map(w => `<div class="sw"><span class="chip-c" style="background:${esc(w.hex)}"></span><b>${esc(w.hex.toUpperCase())}</b>${esc(w.label)}</div>`).join('')}</div>` : '';
  return `${logos ? `<h3 class="sub-h">The brand as it appeared</h3><div class="gl-rows">${logos}</div>` : ''}
${draws ? `<h3 class="sub-h">Original illustrations</h3><div class="gd-grid n${s.drawings.length}">${draws}</div><p class="gd-credit">Original illustrations by Spectre Brands, drawn in ink and the brand colour. They are not official artwork.</p>` : ''}
${blocks(s.blocks, ctx)}
${rec ? `<h3 class="sub-h">${inline(r.title || 'The look, rebuilt')}</h3>${rec}` : ''}${sw}
${bottomArchive(items, every.filter(a => isWeak(a.image)), ctx)}
${s.disclaimer ? `<p class="disclaimer">${inline(s.disclaimer)}</p>` : ''}`;
}

// Who ran it: a roster, one row per person. A portrait appears only where the gallery already holds a licensed
// photograph whose file is named for that person (and for no one else on the roster).
function people(s, ctx) {
  const surname = p => p.name.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(w => w.length > 3).at(-1);
  const faceOf = p => { const n = surname(p), hit = n && ctx.gallery.find(a => a.image.toLowerCase().includes(n)); return hit && s.people.filter(q => surname(q) === n).length === 1 ? hit : null; };
  const faces = s.people.map(faceOf), any = faces.some(Boolean);
  const rows = s.people.map((p, i) => `<tr class="rv">${any ? `<td class="r-face">${faces[i] ? picture(ctx, faces[i].image, { alt: `Portrait of ${p.name}` }) : ''}</td>` : ''}<th scope="row"><span class="r-name">${esc(p.name)}</span><span class="role">${inline(p.role)}</span></th><td>${md(p.text)}</td><td class="then">${p.later ? inline(p.later) : ''}</td></tr>`).join('');
  const credits = faces.map((f, i) => f && f.credit ? `${esc(s.people[i].name)}: ${inline(f.credit)}` : '').filter(Boolean);
  return `<table class="roster${any ? ' faces' : ''}"><thead><tr>${any ? '<td></td>' : ''}<th scope="col">Name and role</th><th scope="col">What they did</th><th scope="col">Afterwards</th></tr></thead><tbody>${rows}</tbody></table>${credits.length ? `<p class="credit">Portraits. ${credits.join(' ')}</p>` : ''}`;
}

// What they said: the one or two quotes marked big run large; the rest are a list of clippings, source first.
function press(s) {
  const lead = s.clips.filter(c => c.big).slice(0, 2);
  if (!lead.length && s.clips.length) lead.push(s.clips[0]);
  const rest = s.clips.filter(c => !lead.includes(c));
  return `<div class="lead-qs n${lead.length}">${lead.map(c => `<figure class="lead-q rv"><blockquote>${inline(c.q)}</blockquote><figcaption>${inline(c.who)}</figcaption></figure>`).join('')}</div>
${rest.length ? `<ol class="clips">${rest.map(c => `<li class="rv"><p class="clip-who">${inline(c.who)}</p><blockquote>${inline(c.q)}</blockquote></li>`).join('')}</ol>` : ''}`;
}

function cause(s) {
  const total = s.causes.reduce((a, c) => a + c.weight, 0), mx = Math.max(...s.causes.map(x => x.weight));
  const wf = total === 100 ? waffle({ title: 'Cause of death, by editorial weight', subtitle: 'One square is one percentage point. The weights are our judgment, not a measurement.', items: s.causes.map(c => ({ label: c.title, value: c.weight })), itemLabel: 'Cause', valueLabel: 'Weight' }) : '';
  return `${wf}<div class="cod" id="cod">${s.causes.map((c, i) => `<div class="cod-row${i ? '' : ' open'}"><h3><button type="button" class="cod-top" aria-expanded="${i ? 'false' : 'true'}" aria-controls="cod-b${i}"><span class="cod-l"><span class="cod-h">${inline(c.title)}</span><span class="cod-bar"><span style="--w:${(c.weight / mx * 100).toFixed(1)}%;--d:${i}"></span></span></span><span class="cod-pct">${c.weight}%</span><span class="cod-x" aria-hidden="true"></span></button></h3><div class="cod-body" id="cod-b${i}"><div>${md(c.text)}</div></div></div>`).join('')}</div><details class="fold method-notes"><summary>Editorial judgment</summary><p class="disclaimer"><b><a class="xlink" href="/about/#honesty">Editorial judgment</a>:</b> ${inline(s.disclaimer)}</p></details>`;
}
function whatif(s) {
  const featured = s.featured ?? s.forks.slice(0, 2).map((_, i) => i);
  if (!Array.isArray(featured) || featured.some(i => !Number.isInteger(i) || i < 0 || i >= s.forks.length)) throw new Error('Invalid whatif.featured index');
  const panel = (f, i) => `<article class="fork-pair" id="whatif-${i + 1}"><h3>${inline(f.tab)}</h3><div class="fork-pair-columns"><div class="actual"><p class="lbl">What happened</p>${md(f.actual)}</div><div class="whatif"><p class="lbl">What if <span class="lbl-spec">speculative</span></p>${md(f.whatif)}</div></div></article>`;
  const rest = s.forks.map((f, i) => ({ f, i })).filter(x => !featured.includes(x.i));
  return featured.map(i => panel(s.forks[i], i)).join('') + (rest.length ? `<details class="fold more-whatifs"><summary>More what-ifs</summary>${rest.map(({ f, i }) => panel(f, i)).join('')}</details>` : '');
}
// Afterlife: where the pieces went. The brand is the trunk; each piece branches off it with what became of it.
const afterlife = (s, ctx) => `<div class="pieces"><p class="pieces-root">${esc(ctx.meta.name)}</p><ol>${(s.items || []).map(x => `<li class="rv"><h3>${inline(x.title)}</h3><p class="st">${esc(x.status)}</p><div class="p-text">${md(x.text)}</div></li>`).join('')}</ol></div>${nowCards(s.now)}`;
const sources = s => `<label class="citation-toggle" hidden><input type="checkbox" id="citation-numbers"> Show citation numbers</label><ol class="sources">${s.list.map(x => `<li id="src-${x.id}" value="${x.id}">${sourceBody(x)}</li>`).join('')}</ol>${s.notes ? `<details class="fold flags"><summary>Data notes (${s.notes.length})</summary><h3 class="sub-h">Data notes</h3>${s.notes.map(n => `<p><b>${esc(n.label)}:</b> ${inline(n.text)}</p>`).join('')}</details>` : ''}`;

const RENDER = { connections, story, timeline, map, videos, website, gallery, people, press, cause, whatif, afterlife, sources, analysis: (s, ctx) => blocks(s.blocks, ctx) };
const OWN_BLOCKS = new Set(['analysis', 'map', 'videos', 'website', 'gallery']);

// Up to two photographs for the full-bleed breaks between acts: big enough to run wide (900px or more), not the
// page's lead image, and preferably not already shown in the hero. A closing-sale picture goes last.
export function actImages(c, ctx) {
  const hero = (c.hero.archive || []).map(a => a.image), g = c.sections.gallery?.archive || [];
  const pool = [...g, ...(c.hero.archive || []).filter(a => !g.some(x => x.image === a.image))].map(a => ({ ...a, i: ctx.image(a.image) }))
    .filter(a => a.i && a.i.w >= 900 && a.image !== ctx.heroLead && !isWeak(a.image) && imageKind(a.image, a.i) === 'photo');
  const rank = a => (hero.includes(a.image) ? -50 : 0) + strength(a);
  return pool.sort((a, b) => rank(b) - rank(a)).slice(0, 2).sort((a, b) => /closing/.test(a.image) - /closing/.test(b.image));
}

// The header that opens every act after the first: the part number, the act name and what is in it, under a
// full-bleed photograph when the brand has one to spare.
export function actBreak(ctx, { id, label, n, total, parts, image }) {
  const fig = image ? figure(ctx, image, { cls: 'act-img', alt: image.alt || image.caption || '' }) : '';
  return `<div class="act${image ? ' has-img' : ''}" id="act-${id}">${fig}<div class="wrap act-head"><p class="act-n">Part ${n} of ${total}</p><p class="act-t">${esc(label)}</p><p class="act-in">${parts.map(esc).join(' · ')}</p></div></div>\n`;
}

// Secondary modules that fold away on a phone (runtime.js closes them there; they stay open everywhere else).
const FOLD = { people: s => s.people.length, press: s => s.clips.length };

// Shared section copy lives once, in site.json sectionDefaults; a brand's own lede/disclaimer overrides it.
const SITE_DEFAULTS = JSON.parse(fs.readFileSync(new URL('../site.json', import.meta.url), 'utf8')).sectionDefaults || {};
const NUMW = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
export function section(id, s, ctx) {
  const type = SECTIONS[id].type;
  const def = SITE_DEFAULTS[type];
  if (def) { s = { ...s }; for (const [k, v] of Object.entries(def)) if (s[k] == null) s[k] = typeof v === 'string' ? v.replace('{N}', NUMW[(s.forks || []).length] || String((s.forks || []).length)) : v; }
  const method = s.method == null ? '' : `<details class="fold method-notes"><summary>How we know</summary>${md(s.method)}</details>`;
  const inner = RENDER[type](s, ctx) + method + (OWN_BLOCKS.has(type) ? '' : blocks(s.blocks, ctx));
  return wrap(id, s, FOLD[type] ? `<details class="fold" open><summary>${esc(s.label || SECTIONS[id].label)} (${FOLD[type](s)})</summary>${inner}</details>` : inner);
}

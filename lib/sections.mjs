import { esc, inline, md, fn } from './md.mjs';
import { SECTIONS, TIERS } from './registry.mjs';
import { blocks } from './blocks.mjs';
import { picture, figure, imageKind, strength, isStrong, videoCard, VIDEO_TYPES } from './media.mjs';
import { waffle } from './infographics.mjs';

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
  const h = c.hero, t = TIERS[c.tier], cat = site.categories.find(k => k.id === c.category), m = heroImages(c, ctx);
  const alt = a => a.alt || `${c.name} archive image: ${a.caption}`, vt = `view-transition-name:art-${esc(c.slug)}`;
  if (m) ctx.heroLead = m.lead.image;
  const media = m
    ? `${figure(ctx, m.lead, { cls: 'hero-lead', alt: alt(m.lead), eager: true, style: vt })}<div class="hero-side n${m.side.length}">${m.side.map(a => figure(ctx, a, { cls: 'hero-fig', alt: alt(a) })).join('')}</div>`
    : `<figure class="hero-lead hero-art" style="${vt}">${ctx.art(h.art)}<figcaption>${inline(h.artCaption)}</figcaption></figure>`;
  return `<header class="hero" id="overview" data-sec="overview"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/category/${esc(c.category)}/">${esc(cat.label)}</a></nav>
<div class="hero-head">
<p class="kicker"><span class="tag ${c.tier}">${esc(t.label)}</span><span>${esc(c.place)}</span></p>
<h1 class="name" style="view-transition-name:name-${esc(c.slug)}">${esc(c.name)}</h1>
<p class="dates">${inline(h.dates)}</p>
<p class="standfirst">${inline(h.standfirst)}</p>
</div>
<div class="hero-media${!m || m.lead.i.w < m.lead.i.h ? ' portrait' : ''}">
${media}
<div class="hero-intro"><div>${md(h.deck, 'deck')}</div><p class="tier-why"><b>Why ${esc(t.label.toLowerCase())}:</b> ${inline(c.tierWhy || '')}</p></div>
</div>
${c.keyNumbers ? `<div class="hero-nums"><h2 class="h-small">${inline(c.keyNumbers.caption || `${c.name} in numbers`)}</h2><div class="ctr-rows">${c.keyNumbers.rows.map(r => `<div class="ctr"><div class="ctr-v" data-count="${esc(r.value)}">${esc(r.value)}</div><div class="ctr-t">${inline(r.text)}</div></div>`).join('')}</div></div>` : ''}
${c.findings ? `<div class="findings"><h2 class="h-small">Key findings</h2><ol>${c.findings.map(f => `<li><b>${inline(f.title)}</b> ${inline(f.text)}</li>`).join('')}</ol></div>` : ''}
<p class="byline">Post-mortem No. ${esc(c.number)} · Every figure links to a numbered source · Derived figures, estimates and unverified claims are labeled</p>
</div></header>
`;
}

// One row per chapter: the chapter's figure and visual on the left, its text on the right.
function story(s, ctx) {
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
  return `<div class="tlx" id="tlx" data-y0="${parseInt(m.years, 10)}" data-died="${+m.died}" style="--n:${Object.keys(cats).length}">
<div class="tlx-bar"><div class="tl-filters" id="tlf" role="group" aria-label="Filter the timeline by thread">${chips}</div></div>
<div class="tlx-stage" id="tlxStage"></div>
<details class="data tl-list"><summary>All ${s.events.length} events as a list</summary>
<ol class="tlv" id="tlv">${s.events.map((e, i) => `<li class="ev" data-cat="${esc(e.cat)}" data-t="${t[i]}" data-d="${esc(when(e))}" style="--c:${esc((cats[e.cat] || {}).color || 'var(--brand)')}"><div class="d"><b>${esc(e.date)}</b>${esc(e.year || '')}</div><div class="ev-b"><div class="c">${esc((cats[e.cat] || {}).label || '')}</div><h3>${inline(e.title)}</h3><p>${inline(e.text)}${fn(e.src)}</p></div></li>`).join('')}</ol></details>
</div>`;
}

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
<div class="map-stage">
<div class="mapbox" id="mapbox"><svg class="base" id="mapBase" viewBox="0 0 975 610" aria-hidden="true"></svg><svg class="ov" id="mapOv" viewBox="0 0 975 610" role="group" aria-label="${esc(String(f.title).replace(/\[\^\d+\]/g, ''))}"></svg><div class="maptip" id="mapTip"></div><div class="map-stat" id="mapStat"></div></div>
<div class="step-card" id="stepCard" aria-live="polite"></div>
</div>
<ol class="map-key" id="mapKey"></ol>
<noscript><ol class="map-key">${s.pins.map(p => `<li><span class="kn">${esc(p.label)}</span><div><b>${inline(p.title)}</b> ${esc(p.when || '')}<br>${inline(p.text)}${fn(p.src)}</div></li>`).join('')}</ol></noscript>
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

function gallery(s, ctx) {
  const items = (s.archive || []).map(a => ({ ...a, i: ctx.image(a.image) })).filter(a => a.i), ar = a => a.i.w / a.i.h;
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
  return `${wf}<div class="cod" id="cod">${s.causes.map((c, i) => `<div class="cod-row${i ? '' : ' open'}"><h3><button type="button" class="cod-top" aria-expanded="${i ? 'false' : 'true'}" aria-controls="cod-b${i}"><span class="cod-l"><span class="cod-h">${inline(c.title)}</span><span class="cod-bar"><span style="--w:${(c.weight / mx * 100).toFixed(1)}%;--d:${i}"></span></span></span><span class="cod-pct">${c.weight}%</span><span class="cod-x" aria-hidden="true"></span></button></h3><div class="cod-body" id="cod-b${i}"><div>${md(c.text)}</div></div></div>`).join('')}</div><p class="disclaimer"><b>Editorial judgment:</b> ${inline(s.disclaimer)}</p>`;
}
const whatif = s => `<div class="fork-tabs" id="forkTabs" role="tablist" aria-label="Decision points">${s.forks.map((f, i) => `<button type="button" role="tab" id="fkt-${i}" aria-controls="fkp-${i}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? -1 : 0}" data-i="${i}"${i ? '' : ' class="on"'}>${esc(f.tab)}</button>`).join('')}</div>${s.forks.map((f, i) => `<div class="fork-panel${i ? '' : ' on'}" role="tabpanel" id="fkp-${i}" aria-labelledby="fkt-${i}"><div class="actual"><p class="lbl">What happened</p>${md(f.actual)}</div><div class="whatif"><p class="lbl">What if <span class="lbl-spec">speculative</span></p>${md(f.whatif)}</div></div>`).join('')}`;
// Afterlife: where the pieces went. The brand is the trunk; each piece branches off it with what became of it.
const afterlife = (s, ctx) => `<div class="pieces"><p class="pieces-root">${esc(ctx.meta.name)}</p><ol>${s.items.map(x => `<li class="rv"><h3>${inline(x.title)}</h3><p class="st">${esc(x.status)}</p><div class="p-text">${md(x.text)}</div></li>`).join('')}</ol></div>`;
const sources = s => `<ol class="sources">${s.list.map(x => `<li id="src-${x.id}" value="${x.id}">${inline(x.text)}</li>`).join('')}</ol>${s.notes ? `<details class="fold flags" open><summary>Data notes (${s.notes.length})</summary><h3 class="sub-h">Data notes</h3>${s.notes.map(n => `<p><b>${esc(n.label)}:</b> ${inline(n.text)}</p>`).join('')}</details>` : ''}`;

const RENDER = { story, timeline, map, videos, website, gallery, people, press, cause, whatif, afterlife, sources, analysis: (s, ctx) => blocks(s.blocks, ctx) };
const OWN_BLOCKS = new Set(['analysis', 'map', 'videos', 'website', 'gallery']);

// Up to two photographs for the full-bleed breaks between acts: big enough to run wide (900px or more), not the
// page's lead image, and preferably not already shown in the hero. A closing-sale picture goes last.
export function actImages(c, ctx) {
  const hero = (c.hero.archive || []).map(a => a.image), g = c.sections.gallery?.archive || [];
  const pool = [...g, ...(c.hero.archive || []).filter(a => !g.some(x => x.image === a.image))].map(a => ({ ...a, i: ctx.image(a.image) }))
    .filter(a => a.i && a.i.w >= 900 && a.image !== ctx.heroLead && imageKind(a.image, a.i) === 'photo');
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

export function section(id, s, ctx) {
  const type = SECTIONS[id].type;
  const inner = RENDER[type](s, ctx) + (OWN_BLOCKS.has(type) ? '' : blocks(s.blocks, ctx));
  return wrap(id, s, FOLD[type] ? `<details class="fold" open><summary>${esc(s.label || SECTIONS[id].label)} (${FOLD[type](s)})</summary>${inner}</details>` : inner);
}

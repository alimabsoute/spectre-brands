import { esc, inline, md, fn } from './md.mjs';
import { SECTIONS, TIERS } from './registry.mjs';
import { blocks } from './blocks.mjs';

const secHead = (s, n) => `<div class="sec-head"><div class="sec-k"><span class="sn">${String(n).padStart(2, '0')}</span>${esc(s.kicker || s.label)}</div><h2 class="rv">${inline(s.title)}</h2>${s.lede ? `<p class="lede rv">${inline(s.lede)}</p>` : ''}</div>`;
const wrap = (id, s, n, inner, alt) => `<section id="${id}" class="sec sec-${SECTIONS[id].type}${alt ? ' alt' : ''}"><div class="wrap">\n${secHead(s, n)}\n${inner}\n</div></section>\n`;

export function overview(c, ctx) {
  const h = c.hero, t = TIERS[c.tier];
  const strip = (h.archive || []).map(a => `<figure class="ha-item"><img src="${esc(ctx.img(a.image))}" alt="${esc(a.alt || a.caption)}" loading="eager"><figcaption>${inline(a.caption)}</figcaption></figure>`).join('');
  return `<header class="hero" id="overview" data-sec="overview"><div class="wrap">
<div class="hero-grid">
<div class="hero-text">
<p class="kicker rv"><span class="tag ${c.tier}" title="${esc(t.text)}">${esc(t.label)}</span>${esc(c.place)}</p>
<h1 class="name rv">${esc(c.name)}</h1>
<p class="dates rv">${inline(h.dates)}</p>
<p class="standfirst rv">${inline(h.standfirst)}</p>
${md(h.deck, 'deck rv')}
<p class="byline rv">Post-mortem No. ${esc(c.number)} · Every figure links to a numbered source · Estimates and unverified claims are labeled</p>
</div>
<div class="hero-brand rv">
<figure class="hero-art">${ctx.art(h.art)}<figcaption>${inline(h.artCaption)}</figcaption></figure>
${strip ? `<div class="hero-archive"><div class="ha-k">From the archive</div><div class="ha-row">${strip}</div></div>` : ''}
</div>
</div>
<div class="hero-tables">
${c.keyNumbers ? `<table class="kf rv"><caption>${inline(c.keyNumbers.caption || `${c.name} in numbers`)}</caption><tbody>${c.keyNumbers.rows.map(r => `<tr><td class="kv">${esc(r.value)}</td><td>${inline(r.text)}</td></tr>`).join('')}</tbody></table>` : ''}
${c.findings ? `<div class="findings rv"><h2 class="h-small">Key findings</h2><ol>${c.findings.map(f => `<li><b>${inline(f.title)}</b> ${inline(f.text)}</li>`).join('')}</ol></div>` : ''}
</div>
</div></header>
`;
}

function story(s, ctx) {
  const ch = s.chapters, n = ch.length, f = ch[0];
  const art = s.stageArt ? `<div class="stage-art" id="stArt">${ctx.art(s.stageArt)}</div>` : '';
  return `<div class="story">
<div class="stage" id="stage"><div class="chap-n" id="stN">Chapter 1 of ${n}</div><div class="big" id="stBig" style="color:${esc(f.color || 'var(--ink)')}">${esc(f.big)}</div><div class="cap" id="stCap">${inline(f.cap)}</div><div class="bar"><span id="stBar" style="width:${Math.round(100 / n)}%"></span></div>${art}</div>
<div class="chapters">${ch.map((c, i) => `<article class="chap" data-n="${i + 1}" data-big="${esc(c.big)}" data-cap="${esc(inline(c.cap))}" data-bar="${Math.round((i + 1) / n * 100)}" data-color="${esc(c.color || '')}">
<div class="when">${esc(c.when)}</div><h3>${inline(c.title)}</h3>${md(c.body)}${c.pull ? `<blockquote class="pull">${inline(c.pull.text)}<small>${inline(c.pull.who)}</small></blockquote>` : ''}</article>`).join('\n')}</div>
</div>`;
}

function timeline(s) {
  const cats = s.categories || {};
  const chips = [['all', 'All'], ...Object.entries(cats).map(([k, v]) => [k, v.label])].map(([k, l], i) => `<button type="button" class="chip${i ? '' : ' on'}" data-f="${k}">${k === 'all' ? '' : `<i class="cdot" style="background:${esc(cats[k].color)}"></i>`}${esc(l)}</button>`).join('');
  return `<div class="tl-filters" id="tlf">${chips}</div>
<div class="tlv" id="tlv">${s.events.map(e => `<div class="ev" data-cat="${esc(e.cat)}"><div class="d"><b>${esc(e.date)}</b>${esc(e.year || '')}</div><div class="dot" style="background:${esc((cats[e.cat] || {}).color || 'var(--gold)')}"></div><div><div class="c">${esc((cats[e.cat] || {}).label || '')}</div><h4>${inline(e.title)}</h4><p>${inline(e.text)}${fn(e.src)}</p></div></div>`).join('')}</div>`;
}

function map(s, ctx) {
  ctx.data.map = { pins: s.pins, steps: s.steps, legend: s.legend, rings: s.rings || [], choropleth: s.choropleth || null, view: s.view || 'us' };
  const f = s.figure;
  const legend = s.legend.map(l => `<span><span class="lg-pin c-${esc(l.cat)}"></span>${inline(l.label)}</span>`).join('') + '<span><span class="lg-pin closed"></span>Closed by the selected date</span>';
  const ch = s.choropleth ? `<div class="choro-legend" id="choroLegend"></div>` : '';
  return `<figure class="map-fig rv">
<div class="card-head"><div><h3 class="map-t">${inline(f.title)}</h3><p><b>What this map shows:</b> ${inline(f.whatItShows)}</p></div></div>
<div class="map-legend">${legend}</div>${ch}
<div class="tlbar" id="tlbar" role="group" aria-label="Timeline linked to the map">
<div class="tl-ctl"><button type="button" class="tl-play" id="tlPlay" aria-label="Play the timeline">Play</button><button type="button" class="tl-step" id="tlPrev" aria-label="Previous event">‹</button><button type="button" class="tl-step" id="tlNext" aria-label="Next event">›</button></div>
<div class="tl-track" id="tlTrack"><div class="tl-line"></div><div class="tl-fill" id="tlFill"></div></div>
</div>
<div class="map-stage">
<div class="mapbox" id="mapbox"><svg class="base" id="mapBase" viewBox="0 0 975 610" aria-hidden="true"></svg><svg class="ov" id="mapOv" viewBox="0 0 975 610"></svg><div class="maptip" id="mapTip"></div><div class="map-stat" id="mapStat"></div></div>
<div class="step-card" id="stepCard" aria-live="polite"></div>
</div>
<ol class="map-key" id="mapKey"></ol>
<figcaption>${inline(f.caption)}</figcaption>
</figure>${blocks(s.blocks, ctx)}`;
}

function website(s, ctx) {
  const tabs = s.captures.map((c, i) => `<button type="button" data-i="${i}"${i ? '' : ' class="on"'}><b>${esc(c.date)}</b>${esc(c.label)}</button>`).join('');
  const views = s.captures.map((c, i) => `<div class="wb-view" data-i="${i}"${i ? ' hidden' : ''}>
<figure class="browser"><div class="chrome"><span class="cd"></span><span class="cd"></span><span class="cd"></span><span class="url">${esc(c.url)}</span></div><a class="shot" href="${esc(c.wayback)}" target="_blank" rel="noopener"><img src="${esc(ctx.img(c.image))}" alt="Screenshot of ${esc(c.url)} as archived ${esc(c.captured)}" loading="lazy" width="640" height="${+c.h || 480}"></a></figure>
<figcaption class="wb-cap"><div class="d">Captured ${esc(c.captured)}</div><h3>${inline(c.title)}</h3>${md(c.text)}${c.warn ? `<div class="warn">${inline(c.warn)}</div>` : ''}<div class="arch"><a href="${esc(c.wayback)}" target="_blank" rel="noopener">Open this capture on the Wayback Machine ↗</a></div></figcaption>
</div>`).join('\n');
  const snips = s.snips ? `<div class="snips">${s.snips.map(x => `<div class="snip">${inline(x.text)}<div class="when">${inline(x.when)}</div></div>`).join('')}</div>` : '';
  return `<div class="wb-strip rv" id="wbStrip">${tabs}</div><div id="wbViews">${views}</div>${snips}${s.note ? `<p class="note">${inline(s.note)}</p>` : ''}${blocks(s.blocks, ctx)}`;
}

function gallery(s, ctx) {
  const logos = (s.archive || []).map(a => `<figure class="gl-item"><div class="gl-img"><img src="${esc(ctx.img(a.image))}" alt="${esc(a.alt || a.caption)}" loading="lazy"></div><figcaption><b>${esc(a.date)}</b> ${inline(a.caption)}</figcaption></figure>`).join('');
  const draws = (s.drawings || []).map(d => `<figure class="gd-item">${ctx.art(d.art)}<figcaption><b>${inline(d.title)}</b> ${inline(d.caption)}</figcaption></figure>`).join('');
  const r = s.recreation;
  const rec = r ? `<div class="recreation rv" style="--r-bar:${esc(r.bar.bg)};--r-bar-fg:${esc(r.bar.fg)};--r-nav:${esc(r.nav.bg)};--r-nav-fg:${esc(r.nav.fg)};--r-tab:${esc(r.nav.tab || '#fff')};--r-side:${esc(r.side.bg)};--r-btn:${esc(r.buttons.bg)};--r-btn-fg:${esc(r.buttons.fg)};--r-font:${esc(r.font || "'Varela Round',sans-serif")}">
<div class="r-bar"><div class="r-word">${esc(r.bar.word)}<small>${esc(r.bar.sub)}</small></div><div class="r-btns">${r.buttons.items.map(b => `<span>${esc(b)}</span>`).join('')}</div></div>
<div class="r-nav${r.nav.tabs ? ' tabs' : ''}">${r.nav.items.map(b => `<span>${esc(b)}</span>`).join('')}</div>
<div class="r-body"><div class="r-side">${r.side.items.map(b => `<div>${esc(b)}</div>`).join('')}</div><div class="r-main">${ctx.art(r.art)}<div><div class="r-head">${esc(r.headline)}<br><span>${esc(r.subhead)}</span></div><p>${esc(r.body)}</p></div></div></div>
</div>` : '';
  const sw = s.swatches ? `<div class="swatches">${s.swatches.map(w => `<div class="sw"><span class="chip-c" style="background:${esc(w.hex)}"></span><b>${esc(w.hex.toUpperCase())}</b>${esc(w.label)}</div>`).join('')}</div>` : '';
  return `${logos ? `<h3 class="sub-h">The brand as it appeared</h3><div class="gl-grid rv">${logos}</div>` : ''}
${draws ? `<h3 class="sub-h">Drawn from memory and the archive</h3><div class="gd-grid rv">${draws}</div>` : ''}
${rec ? `<h3 class="sub-h">${inline(r.title || 'The look, rebuilt')}</h3>${rec}` : ''}${sw}
${s.disclaimer ? `<p class="disclaimer">${inline(s.disclaimer)}</p>` : ''}${blocks(s.blocks, ctx)}`;
}

const people = s => `<div class="people">${s.people.map(p => `<div class="person rv"><h3>${esc(p.name)}</h3><div class="role">${inline(p.role)}</div>${md(p.text)}${p.later ? `<div class="then">Later: ${inline(p.later)}</div>` : ''}</div>`).join('')}</div>`;
const press = s => `<div class="press">${s.clips.map(c => `<div class="clip rv${c.big ? ' big' : ''}"><q>${inline(c.q)}</q><div class="who">${inline(c.who)}</div></div>`).join('')}</div>`;
const cause = s => `<div class="cod" id="cod">${s.causes.map((c, i) => `<div class="cod-row${i ? '' : ' open'}"><button type="button" class="cod-top" aria-expanded="${i ? 'false' : 'true'}"><span><span class="cod-h">${inline(c.title)}</span><span class="cod-bar"><span data-w="${c.weight / Math.max(...s.causes.map(x => x.weight)) * 100}"></span></span></span><span class="cod-pct">${c.weight}%</span></button><div class="cod-body">${md(c.text)}</div></div>`).join('')}</div><div class="disclaimer"><b>Editorial judgment:</b> ${inline(s.disclaimer)}</div>`;
const whatif = s => `<div class="fork-tabs" id="forkTabs">${s.forks.map((f, i) => `<button type="button" data-i="${i}"${i ? '' : ' class="on"'}>${esc(f.tab)}</button>`).join('')}</div>${s.forks.map((f, i) => `<div class="fork-panel${i ? '' : ' on'}"><div class="actual"><div class="lbl">What happened</div>${md(f.actual)}</div><div class="whatif"><div class="lbl">What if (speculative)</div>${md(f.whatif)}</div></div>`).join('')}`;
const afterlife = s => `<div class="now-grid">${s.items.map(x => `<div class="now rv"><div class="st" style="color:${esc(x.color || 'var(--mute)')}">${esc(x.status)}</div><h3>${inline(x.title)}</h3>${md(x.text)}</div>`).join('')}</div>`;
const sources = s => `<ol class="sources">${s.list.map(x => `<li id="src-${x.id}" value="${x.id}">${inline(x.text)}</li>`).join('')}</ol>${s.notes ? `<div class="flags">${s.notes.map(n => `<div><b>${esc(n.label)}:</b> ${inline(n.text)}</div>`).join('')}</div>` : ''}`;

const RENDER = { story, timeline, map, website, gallery, people, press, cause, whatif, afterlife, sources, analysis: (s, ctx) => blocks(s.blocks, ctx) };

export function section(id, s, n, ctx) {
  const type = SECTIONS[id].type;
  const extra = type === 'analysis' || type === 'map' || type === 'website' || type === 'gallery' ? '' : blocks(s.blocks, ctx);
  return wrap(id, s, n, RENDER[type](s, ctx) + extra, n % 2 === 0);
}

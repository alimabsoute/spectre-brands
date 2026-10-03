import { esc, inline, md, fn } from './md.mjs';
import { SECTIONS, TIERS } from './registry.mjs';
import { blocks } from './blocks.mjs';
import { picture, videoCard, VIDEO_TYPES } from './media.mjs';
import { waffle } from './infographics.mjs';

const secHead = s => `<div class="sec-head"><p class="sec-k">${esc(s.kicker || s.label)}</p><h2>${inline(s.title)}</h2>${s.lede ? `<p class="lede">${inline(s.lede)}</p>` : ''}</div>`;
const wrap = (id, s, inner) => `<section id="${id}" class="sec sec-${SECTIONS[id].type}" aria-labelledby="${id}-h"><div class="wrap">\n${secHead(s).replace('<h2>', `<h2 id="${id}-h">`)}\n${inner}\n</div></section>\n`;

export function overview(c, ctx, site) {
  const h = c.hero, t = TIERS[c.tier], cat = site.categories.find(k => k.id === c.category);
  const strip = (h.archive || []).map(a => `<figure class="ha-item">${picture(ctx, a.image, { alt: a.alt || `${c.name} archive image: ${a.caption}`, eager: true })}<figcaption>${inline(a.caption)}</figcaption></figure>`).join('');
  return `<header class="hero" id="overview" data-sec="overview"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/category/${esc(c.category)}/">${esc(cat.label)}</a></nav>
<div class="hero-grid">
<div class="hero-text">
<p class="kicker"><span class="tag ${c.tier}">${esc(t.label)}</span><span>${esc(c.place)}</span></p>
<h1 class="name" style="view-transition-name:name-${esc(c.slug)}">${esc(c.name)}</h1>
<p class="dates">${inline(h.dates)}</p>
<p class="standfirst">${inline(h.standfirst)}</p>
${md(h.deck, 'deck')}
<p class="tier-why"><b>Why ${esc(t.label.toLowerCase())}:</b> ${inline(c.tierWhy || '')}</p>
</div>
<div class="hero-brand">
<figure class="hero-art motion-${esc(h.motion || 'float')}" style="view-transition-name:art-${esc(c.slug)}">${ctx.art(h.art)}<figcaption>${inline(h.artCaption)}</figcaption></figure>
${strip ? `<div class="hero-archive"><p class="ha-k">From the archive</p><div class="ha-row">${strip}</div></div>` : ''}
</div>
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

function timeline(s) {
  const cats = s.categories || {};
  const chips = [['all', 'All'], ...Object.entries(cats).map(([k, v]) => [k, v.label])].map(([k, l], i) => `<button type="button" class="chip${i ? '' : ' on'}" data-f="${k}" aria-pressed="${i ? 'false' : 'true'}">${k === 'all' ? '' : `<i class="cdot" style="background:${esc(cats[k].color)}"></i>`}${esc(l)}</button>`).join('');
  return `<div class="tl-filters" id="tlf" role="group" aria-label="Filter the timeline by thread">${chips}</div>
<ol class="tlv" id="tlv">${s.events.map(e => `<li class="ev" data-cat="${esc(e.cat)}" style="--c:${esc((cats[e.cat] || {}).color || 'var(--brand)')}"><div class="d"><b>${esc(e.date)}</b>${esc(e.year || '')}</div><div class="ev-b"><div class="c">${esc((cats[e.cat] || {}).label || '')}</div><h3>${inline(e.title)}</h3><p>${inline(e.text)}${fn(e.src)}</p></div></li>`).join('')}</ol>`;
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

function gallery(s, ctx) {
  const logos = (s.archive || []).map(a => `<figure class="gl-item rv"><div class="gl-img">${picture(ctx, a.image, { alt: a.alt || `${a.caption}` })}</div><figcaption><b>${esc(a.date)}</b> ${inline(a.caption)}${a.credit ? `<span class="credit">${inline(a.credit)}</span>` : ''}</figcaption></figure>`).join('');
  const draws = (s.drawings || []).map(d => `<figure class="gd-item rv">${ctx.art(d.art)}<figcaption><b>${inline(d.title)}</b> ${inline(d.caption)}<span class="credit">Original illustration by Spectre Brands</span></figcaption></figure>`).join('');
  const r = s.recreation;
  const rec = r ? `<div class="recreation rv" style="--r-bar:${esc(r.bar.bg)};--r-bar-fg:${esc(r.bar.fg)};--r-nav:${esc(r.nav.bg)};--r-nav-fg:${esc(r.nav.fg)};--r-tab:${esc(r.nav.tab || '#fff')};--r-side:${esc(r.side.bg)};--r-btn:${esc(r.buttons.bg)};--r-btn-fg:${esc(r.buttons.fg)};--r-font:${esc(r.font || "'Varela Round',sans-serif")}" role="img" aria-label="A recreation of the ${esc(r.bar.word)} site header in its original colours">
<div class="r-bar"><div class="r-word">${esc(r.bar.word)}<small>${esc(r.bar.sub)}</small></div><div class="r-btns">${r.buttons.items.map(b => `<span>${esc(b)}</span>`).join('')}</div></div>
<div class="r-nav${r.nav.tabs ? ' tabs' : ''}">${r.nav.items.map(b => `<span>${esc(b)}</span>`).join('')}</div>
<div class="r-body"><div class="r-side">${r.side.items.map(b => `<div>${esc(b)}</div>`).join('')}</div><div class="r-main">${ctx.art(r.art)}<div><div class="r-head">${esc(r.headline)}<br><span>${esc(r.subhead)}</span></div><p>${esc(r.body)}</p></div></div></div>
</div>` : '';
  const sw = s.swatches ? `<div class="swatches">${s.swatches.map(w => `<div class="sw"><span class="chip-c" style="background:${esc(w.hex)}"></span><b>${esc(w.hex.toUpperCase())}</b>${esc(w.label)}</div>`).join('')}</div>` : '';
  return `${logos ? `<h3 class="sub-h">The brand as it appeared</h3><div class="gl-grid">${logos}</div>` : ''}
${draws ? `<h3 class="sub-h">Original illustrations</h3><div class="gd-grid">${draws}</div>` : ''}
${blocks(s.blocks, ctx)}
${rec ? `<h3 class="sub-h">${inline(r.title || 'The look, rebuilt')}</h3>${rec}` : ''}${sw}
${s.disclaimer ? `<p class="disclaimer">${inline(s.disclaimer)}</p>` : ''}`;
}

const people = s => `<div class="people">${s.people.map(p => `<div class="person rv"><h3>${esc(p.name)}</h3><p class="role">${inline(p.role)}</p>${md(p.text)}${p.later ? `<p class="then"><b>Later:</b> ${inline(p.later)}</p>` : ''}</div>`).join('')}</div>`;
const press = s => `<div class="press">${s.clips.map(c => `<figure class="clip rv${c.big ? ' big' : ''}"><blockquote>${inline(c.q)}</blockquote><figcaption>${inline(c.who)}</figcaption></figure>`).join('')}</div>`;

function cause(s) {
  const total = s.causes.reduce((a, c) => a + c.weight, 0), mx = Math.max(...s.causes.map(x => x.weight));
  const wf = total === 100 ? waffle({ title: 'Cause of death, by editorial weight', subtitle: 'One square is one percentage point. The weights are our judgment, not a measurement.', items: s.causes.map(c => ({ label: c.title, value: c.weight })), itemLabel: 'Cause', valueLabel: 'Weight' }) : '';
  return `${wf}<div class="cod" id="cod">${s.causes.map((c, i) => `<div class="cod-row${i ? '' : ' open'}"><h3><button type="button" class="cod-top" aria-expanded="${i ? 'false' : 'true'}" aria-controls="cod-b${i}"><span class="cod-l"><span class="cod-h">${inline(c.title)}</span><span class="cod-bar"><span style="--w:${(c.weight / mx * 100).toFixed(1)}%;--d:${i}"></span></span></span><span class="cod-pct">${c.weight}%</span><span class="cod-x" aria-hidden="true"></span></button></h3><div class="cod-body" id="cod-b${i}"><div>${md(c.text)}</div></div></div>`).join('')}</div><p class="disclaimer"><b>Editorial judgment:</b> ${inline(s.disclaimer)}</p>`;
}
const whatif = s => `<div class="fork-tabs" id="forkTabs" role="tablist" aria-label="Decision points">${s.forks.map((f, i) => `<button type="button" role="tab" id="fkt-${i}" aria-controls="fkp-${i}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? -1 : 0}" data-i="${i}"${i ? '' : ' class="on"'}>${esc(f.tab)}</button>`).join('')}</div>${s.forks.map((f, i) => `<div class="fork-panel${i ? '' : ' on'}" role="tabpanel" id="fkp-${i}" aria-labelledby="fkt-${i}"><div class="actual"><p class="lbl">What happened</p>${md(f.actual)}</div><div class="whatif"><p class="lbl">What if <span class="lbl-spec">speculative</span></p>${md(f.whatif)}</div></div>`).join('')}`;
const afterlife = s => `<div class="now-grid">${s.items.map(x => `<div class="now rv"><p class="st" style="--c:${esc(x.color || 'var(--mute)')}">${esc(x.status)}</p><h3>${inline(x.title)}</h3>${md(x.text)}</div>`).join('')}</div>`;
const sources = s => `<ol class="sources">${s.list.map(x => `<li id="src-${x.id}" value="${x.id}">${inline(x.text)}</li>`).join('')}</ol>${s.notes ? `<div class="flags"><h3 class="sub-h">Data notes</h3>${s.notes.map(n => `<p><b>${esc(n.label)}:</b> ${inline(n.text)}</p>`).join('')}</div>` : ''}`;

const RENDER = { story, timeline, map, videos, website, gallery, people, press, cause, whatif, afterlife, sources, analysis: (s, ctx) => blocks(s.blocks, ctx) };
const OWN_BLOCKS = new Set(['analysis', 'map', 'videos', 'website', 'gallery']);

export function section(id, s, ctx) {
  const type = SECTIONS[id].type;
  return wrap(id, s, RENDER[type](s, ctx) + (OWN_BLOCKS.has(type) ? '' : blocks(s.blocks, ctx)));
}

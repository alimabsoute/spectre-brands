// Content blocks. Any analysis-type section (context, numbers, economics, marketing, rivals) is a
// list of blocks; other sections may append blocks after their main content.
import { esc, inline, md, fn } from './md.mjs';
import { picture, videoCard } from './media.mjs';
import { INFOGRAPHICS, counters, dataTable, fmt } from './infographics.mjs';

export function blocks(list, ctx) {
  return (list || []).map(b => block(b, ctx)).join('\n');
}

function head(b, isFig) {
  if (!b.title && !b.subtitle) return '';
  return `<div class="card-head"><div><h3${isFig ? ' class="fig-t" data-fig="Figure"' : ''}>${inline(b.title || '')}</h3>${b.subtitle ? `<p>${inline(b.subtitle)}</p>` : ''}</div>${b.views ? `<div class="seg" data-chart="${esc(b.id)}" role="group" aria-label="Chart view">${b.views.map((v, i) => `<button type="button" data-v="${i}" aria-pressed="${i ? 'false' : 'true'}"${i ? '' : ' class="on"'}>${esc(v.label)}</button>`).join('')}</div>` : ''}</div>`;
}
const src = b => b.source ? `<div class="src">${inline(String(b.source).replace(/^Sources?:\s*/i, ''))}</div>` : '';

// The numbers behind a Chart.js chart, as a table for screen readers and anyone who wants the data.
function chartTable(b) {
  const views = b.views ? b.views : [{ label: '', chart: b.chart }];
  return views.map(v => {
    const sp = v.chart, series = sp.series.filter(s => !s.ref && !s.events);
    const events = sp.series.filter(s => s.events);
    let out = '';
    if (sp.labels && series.length) {
      const f = s => s.format || (s.axis === 'y1' ? (sp.y1 || {}).format : (sp.y || {}).format);
      const cell = (s, i) => { const d = s.data[i]; return d == null ? 'n/a' : Array.isArray(d) ? d.map(x => fmt(f(s), x)).join(' to ') : fmt(f(s), d); };
      out += dataTable([sp.xLabel || 'Period', ...series.map(s => s.label || 'Value')], sp.labels.map((l, i) => [String(l).replace('|', ' '), ...series.map(s => cell(s, i))]), `${b.title}${v.label ? ` (${v.label})` : ''}`);
    }
    if (events.length) out += dataTable(['Date', 'Event', 'Value'], events.flatMap(s => s.events.map(e => [e[0], e[2], e[1] == null ? 'on the index line' : fmt((sp.y || {}).format, e[1])])), `${b.title}: marked events`);
    if (sp.series.some(s => s.ref === 'nasdaq')) out += `<p class="data-ref">The index line is the Nasdaq Composite weekly close from FRED (series NASDAQCOM), ${esc(sp.from || '')} to ${esc(sp.to || '')}${sp.series.find(s => s.ref).indexTo ? ', rebased to 100' : ''}.</p>`;
    return out;
  }).join('');
}

function block(b, ctx) {
  if (INFOGRAPHICS[b.kind]) { ctx.count.infographics++; return INFOGRAPHICS[b.kind](b, ctx); }
  switch (b.kind) {
    case 'chart': {
      if (!b.id) throw new Error(`chart block without id in ${ctx.slug}`);
      ctx.data.charts[b.id] = b.views ? { views: b.views.map(v => v.chart) } : { views: [b.chart] };
      const h = (b.chart || b.views[0].chart).height;
      const first = b.chart || b.views[0].chart;
      const desc = first.series.filter(s => s.label).map(s => s.label).join(', ');
      return `<figure class="card fig rv${b.wide === false ? '' : ' wide'}">${head(b, true)}<div class="cbox"${h ? ` style="height:${+h}px"` : ''}><canvas id="${esc(b.id)}" role="img" aria-label="${esc(b.title)}${desc ? `. Series: ${esc(desc)}` : ''}. The data table follows."></canvas></div>${chartTable(b)}${src(b)}</figure>`;
    }
    case 'keyfacts':
      return `<table class="kf rv${b.compact ? ' compact' : ''}">${b.caption ? `<caption>${inline(b.caption)}</caption>` : ''}<tbody>${b.rows.map(r => `<tr><th scope="row" class="kv">${esc(r.value)}</th><td>${inline(r.text)}</td></tr>`).join('')}</tbody></table>${src(b)}`;
    case 'table': {
      const num = new Set(b.numeric || []);
      const th = b.columns.map((c, i) => String(c).trim() ? `<th scope="col"${num.has(i) ? ' class="num"' : ''}>${inline(c)}</th>` : `<td></td>`).join('');
      const tr = b.rows.map((r, j) => `<tr${(b.highlight ?? -1) === j ? ' class="me"' : ''}>${r.map((c, i) => i === 0 ? `<th scope="row">${inline(c)}</th>` : `<td${num.has(i) ? ' class="num"' : ''}>${inline(c)}</td>`).join('')}</tr>`).join('');
      return `<div class="card rv tbl">${head(b)}<div class="tbl-scroll" tabindex="0" role="region" aria-label="${esc(b.title || 'Table')}"><table class="cmp${b.columns.length > 3 ? ' wide' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>${src(b)}</div>`;
    }
    case 'text':
      return `<div class="prose rv">${b.title ? `<h3>${inline(b.title)}</h3>` : ''}${md(b.body)}</div>`;
    case 'note':
      return `<p class="note rv">${inline(b.body)}</p>`;
    case 'quote':
      return `<blockquote class="pull rv"><p>${inline(b.text)}</p><footer>${inline(b.who || '')}</footer></blockquote>`;
    case 'drawing': {
      const art = ctx.art(b.art);
      return `<div class="card rv drawcard"><figure class="draw">${art}${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ''}</figure><div>${b.title ? `<h3>${inline(b.title)}</h3>` : ''}${md(b.body)}</div></div>`;
    }
    case 'image':
      return `<figure class="card rv imgcard">${picture(ctx, b.image, { alt: b.alt || b.title || '' })}<figcaption>${b.title ? `<b>${inline(b.title)}</b> ` : ''}${inline(b.caption || '')}</figcaption></figure>`;
    case 'video': {
      const v = ctx.videos[b.video];
      if (!v) throw new Error(`video block refers to unknown video id "${b.video}" (see sections/videos.json)`);
      ctx.inlineVideos.add(v.id);
      return `<div class="vid-inline rv">${videoCard(v)}</div>`;
    }
    case 'versus':
      return `<div class="vs rv">${[b.left, b.right].map(s => `<div class="vs-col ${s.alive ? 'alive' : 'dead'}"><span class="tag ${s.alive ? 'alive' : 'dead'}">${esc(s.tag)}</span><h3>${esc(s.name)}</h3><dl>${s.rows.map(r => `<div class="vs-row"><dt>${inline(r[0])}</dt><dd>${inline(r[1])}</dd></div>`).join('')}</dl></div>`).join('')}</div>${src(b)}`;
    case 'stats':
      return counters({ items: b.items.map(s => ({ value: s.value, text: s.label })), source: b.source, compact: true });
    case 'row':
      return `<div class="g${b.blocks.length === 3 ? '3' : '2'}">${b.blocks.map(x => `<div class="gcell">${block(x, ctx)}</div>`).join('')}</div>`;
    default:
      throw new Error(`Unknown block kind "${b.kind}" in ${ctx.slug}`);
  }
}
export { fn };

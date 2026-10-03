// Content blocks. Any analysis-type section (context, numbers, economics, marketing, rivals) is a
// list of blocks; other sections may append blocks after their main content.
import { esc, inline, md, fn } from './md.mjs';

export function blocks(list, ctx) {
  return (list || []).map(b => block(b, ctx)).join('\n');
}

function head(b, isFig) {
  if (!b.title && !b.subtitle) return '';
  return `<div class="card-head"><div><h3${isFig ? ' class="fig-t"' : ''}>${inline(b.title || '')}</h3>${b.subtitle ? `<p>${inline(b.subtitle)}</p>` : ''}</div>${b.views ? `<div class="seg" data-chart="${esc(b.id)}">${b.views.map((v, i) => `<button type="button" data-v="${i}"${i ? '' : ' class="on"'}>${esc(v.label)}</button>`).join('')}</div>` : ''}</div>`;
}
const src = b => b.source ? `<div class="src">${inline(b.source)}</div>` : '';

function block(b, ctx) {
  switch (b.kind) {
    case 'chart': {
      if (!b.id) throw new Error(`chart block without id in ${ctx.slug}`);
      ctx.data.charts[b.id] = b.views ? { views: b.views.map(v => v.chart) } : { views: [b.chart] };
      const h = (b.chart || b.views[0].chart).height;
      return `<figure class="card fig rv${b.wide === false ? '' : ' wide'}">${head(b, true)}<div class="cbox"${h ? ` style="height:${+h}px"` : ''}><canvas id="${esc(b.id)}" role="img" aria-label="${esc(b.title)}"></canvas></div>${src(b)}</figure>`;
    }
    case 'keyfacts':
      return `<table class="kf rv${b.compact ? ' compact' : ''}">${b.caption ? `<caption>${inline(b.caption)}</caption>` : ''}<tbody>${b.rows.map(r => `<tr><td class="kv">${esc(r.value)}</td><td>${inline(r.text)}</td></tr>`).join('')}</tbody></table>${src(b)}`;
    case 'table': {
      const num = new Set(b.numeric || []);
      const th = b.columns.map((c, i) => `<th${num.has(i) ? ' class="num"' : ''}>${inline(c)}</th>`).join('');
      const tr = b.rows.map((r, j) => `<tr${(b.highlight ?? -1) === j ? ' class="me"' : ''}>${r.map((c, i) => `<td${num.has(i) ? ' class="num"' : ''}>${inline(c)}</td>`).join('')}</tr>`).join('');
      return `<div class="card rv tbl">${head(b)}<div class="tbl-scroll"><table class="cmp"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>${src(b)}</div>`;
    }
    case 'text':
      return `<div class="prose rv">${b.title ? `<h3>${inline(b.title)}</h3>` : ''}${md(b.body)}</div>`;
    case 'note':
      return `<p class="note rv">${inline(b.body)}</p>`;
    case 'quote':
      return `<blockquote class="pull rv">${inline(b.text)}<small>${inline(b.who || '')}</small></blockquote>`;
    case 'drawing': {
      const art = ctx.art(b.art);
      return `<div class="card rv drawcard"><figure class="draw">${art}${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ''}</figure><div>${b.title ? `<h3>${inline(b.title)}</h3>` : ''}${md(b.body)}</div></div>`;
    }
    case 'image':
      return `<figure class="card rv imgcard"><img src="${esc(ctx.img(b.image))}" alt="${esc(b.alt || b.title || '')}" loading="lazy"${b.width ? ` width="${+b.width}" height="${+b.height}"` : ''}><figcaption>${b.title ? `<b>${inline(b.title)}</b> ` : ''}${inline(b.caption || '')}</figcaption></figure>`;
    case 'versus':
      return `<div class="vs rv">${[b.left, b.right].map((s, i) => `<div class="vs-col ${s.alive ? 'alive' : 'dead'}"><span class="tag${s.alive ? ' alive' : ''}">${esc(s.tag)}</span><h3>${esc(s.name)}</h3>${s.rows.map(r => `<div class="vs-row"><span>${inline(r[0])}</span><span>${inline(r[1])}</span></div>`).join('')}</div>`).join('')}</div>${src(b)}`;
    case 'stats':
      return `<div class="stats rv">${b.items.map(s => `<div class="stat"><div class="sv">${esc(s.value)}</div><div class="sl">${inline(s.label)}</div></div>`).join('')}</div>${src(b)}`;
    case 'row':
      return `<div class="g${b.blocks.length === 3 ? '3' : '2'}">${b.blocks.map(x => `<div class="gcell">${block(x, ctx)}</div>`).join('')}</div>`;
    default:
      throw new Error(`Unknown block kind "${b.kind}" in ${ctx.slug}`);
  }
}
export { fn };

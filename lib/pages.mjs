// Category pages and the About / methodology page.
import { esc, inline, md } from './md.mjs';
import { TIERS } from './registry.mjs';
import { row, leader, ledgerHead } from './cards.mjs';

// A category opens on a real image (the strongest one among its brands), then lists every brand in the ledger.
export function categoryPage(site, k, list, img) {
  const n = t => list.filter(c => c.tier === t).length, top = leader(list, img);
  return `<header class="page-hero"><div class="wrap ph-grid"><div><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Categories</span></nav>
<h1>${esc(k.label)}</h1>${md(k.intro || k.blurb, 'lede')}
<p class="page-meta">${list.length} post-mortem${list.length === 1 ? '' : 's'} · ${n('dead')} dead · ${n('ghost')} ghost${n('ghost') === 1 ? '' : 's'}</p></div>
<figure class="ph-img"><a href="/${top.slug}/">${img.lead(top, { alt: `${top.name}: ${img.caption(top).replace(/\[\^\d+\]/g, '')}`, eager: true })}</a><figcaption><b>${esc(top.name)}.</b> ${inline(img.caption(top)).replaceAll('href="#src-', `href="/${top.slug}/#src-`)}</figcaption></figure></div></header>
<section class="index-sec"><div class="wrap"><h2 class="vh">Post-mortems in ${esc(k.label)}</h2>${ledgerHead}<div class="ledger">${list.map(c => row(c, site, img, { blurb: true })).join('\n')}</div>
<div class="cat-others"><h2 class="sec-k">Other categories</h2><p>${site.categories.filter(x => x.id !== k.id && x.n).map(x => `<a class="chip" href="/category/${x.id}/">${esc(x.label)} <small>${x.n}</small></a>`).join('')}</p></div>
</div></section>`;
}

export function aboutPage(site, companies) {
  const a = site.about;
  return `<header class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>About</span></nav>
<h1>${inline(a.title)}</h1>${md(a.lede, 'lede')}</div></header>
<section class="about-sec"><div class="wrap about-grid">
<nav class="about-toc" aria-label="On this page"><p class="sec-k">On this page</p>${a.sections.map(s => `<a href="#${s.id}">${esc(s.title)}</a>`).join('')}</nav>
<div class="about-body">
${a.sections.map(s => `<section id="${s.id}" class="about-s"><h2>${esc(s.title)}</h2>${md(s.body)}${s.id === 'tiers' ? `<dl class="defs">${Object.entries(TIERS).map(([k, t]) => `<div><dt><span class="tag ${k}">${t.label}</span></dt><dd>${esc(t.text)}</dd></div>`).join('')}</dl>
<div class="tbl-scroll" tabindex="0" role="region" aria-label="Tier of every brand"><table class="cmp"><caption>Why each brand is tagged the way it is</caption><thead><tr><th scope="col">Brand</th><th scope="col">Tier</th><th scope="col">Justification</th></tr></thead><tbody>${companies.map(c => `<tr><th scope="row"><a href="/${c.slug}/">${esc(c.name)}</a></th><td><span class="tag ${c.tier}">${esc(TIERS[c.tier].label)}</span></td><td>${inline(c.tierWhy).replaceAll('href="#src-', `href="/${c.slug}/#src-`)}</td></tr>`).join('')}</tbody></table></div>` : ''}${s.list ? `<ol class="method">${s.list.map(m => `<li>${inline(m)}</li>`).join('')}</ol>` : ''}${s.after ? md(s.after) : ''}</section>`).join('\n')}
</div></div></section>`;
}

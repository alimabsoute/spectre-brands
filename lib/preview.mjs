// Phase-1 review pages. Content and interactions remain owned by the real homepage renderer.
import fs from 'node:fs';
import { home } from './home.mjs';
import { head, masthead, footer, scripts } from './layout.mjs';
import { esc, inline, md } from './md.mjs';
import { TIERS } from './registry.mjs';

const illustrationCredit = 'Original illustration for Spectre Brands (AI-assisted). Not a historical image.';
const webvanCredit = 'Webvan truck photo: Mark Coggins, via Wikimedia Commons (File:Webvan.jpg), CC BY 2.0 — colorized by Spectre Brands; colours approximate the 2000 livery and are not documentary.';
const heroPicture = id => `<picture><source type="image/avif" srcset="/assets/preview/${id}-800.avif 800w, /assets/preview/${id}-1600.avif 1600w" sizes="(max-width: 620px) 100vw, 1080px"><img src="/assets/preview/${id}-1600.jpg" srcset="/assets/preview/${id}-800.jpg 800w, /assets/preview/${id}-1600.jpg 1600w" sizes="(max-width: 620px) 100vw, 1080px" width="1600" height="1067" alt="${id==='editorial-vibrant' ? 'An illustrated specimen board of a cassette, bottle, CDs, toy robot, truck and controller' : id==='retro-pop' ? 'An illustrated sunlit strip of colorful restaurant, video and toy storefronts' : 'An illustrated strip mall with amber, rose and mint shop signs after closing'}" fetchpriority="high"></picture>`;
const sourceNote = (c, img) => c.slug === 'webvan' ? 'Webvan truck · colorized; see credits below.' : img.caption(c);

export function previewPages({ site, companies, img, version, write, rd, root }) {
  const directions = JSON.parse(rd(`${root}/assets/preview/palettes.json`)).directions;
  const aliases = {bg:'bg',surface:'card','surface-2':'wash',text:'ink','text-muted':'mute',line:'line','accent-1':'site'};
  write('assets/preview/themes.css', directions.map(d => {
    const vars = Object.entries(d.tokens).map(([k,v]) => `--${k}:${v};`).join('');
    const mapped = Object.entries(aliases).map(([k,v]) => `--${v}:${d.tokens[k]};`).join('');
    const base = `html[data-theme="${d.id}"]`;
    return `${base}{${vars}${mapped}--ink-2:var(--text);--line-2:var(--line);--brand:${d.id==='retro-pop'?d.tokens['accent-2']:d.tokens['accent-1']};--brand-soft:var(--surface-2);--serif:'${d.fonts.display.family}',Georgia,serif;--sans:'${d.fonts.text.family}',system-ui,sans-serif;--inv:var(--bg);--inv-2:var(--bg);--inv-3:var(--bg);--inv-accent:var(--bg);--category-text:${d.id==='neon-arcade'?'#201524':'#FFFFFF'};}` + Object.entries(d.categories).map(([k,v]) => `${base} [data-cat="${k}"],${base} [data-g="cat"][data-v="${k}"]{--category:${v};--brand:${v}!important}`).join('');
  }).join('\n'));
  for (const d of directions) {
    d.icon = fs.existsSync(`${root}/assets/preview/${d.id}-icon.svg`) ? `/assets/preview/${d.id}-icon.svg` : null;
    const previewImg = { ...img,
      lead(c, opts = {}) {
        if(c.slug !== 'webvan') return img.lead(c,opts);
        return `<picture><source type="image/avif" srcset="/assets/preview/webvan-800.avif 800w, /assets/preview/webvan-1600.avif 1600w" sizes="(max-width:620px) 335px, 500px"><img class="k-photo" src="/assets/preview/webvan-800.jpg" width="800" height="565" alt="${esc(opts.alt ?? 'Webvan truck, colorized; see credits')}" loading="${opts.eager?'eager':'lazy'}"></picture>`;
      },
      logo(c) { return c.slug==='webvan' ? this.lead(c,{alt:''}) : img.logo(c); }
    };
    const featured = companies.find(c => c.slug===site.featured) || companies[0];
    // Mix the opening inventory across categories; all brands still appear exactly once.
    const picks = [featured, ...['circuit-city','crystal-pepsi','howard-johnsons','toys-r-us','blockbuster','webvan','sega','compusa','surge','kmart','geocities'].map(s=>companies.find(c=>c.slug===s))].filter(Boolean);
    const ordered = [...new Set([...picks,...companies])];
    const limit = d.id==='retro-pop'?12:d.id==='neon-arcade'?10:8;
    const wall = `<section class="preview-gallery" aria-labelledby="gallery-h"><div class="gallery-head"><div><p class="sec-k">From the archive</p><h2 id="gallery-h">Names you remember.</h2></div><p>Original businesses. Lasting memories.</p></div><div class="gallery-controls" hidden><button type="button" data-rail="prev" aria-label="Previous archive card" aria-controls="preview-wall">←</button><span id="rail-position" aria-live="polite"></span><button type="button" data-rail="next" aria-label="Next archive card" aria-controls="preview-wall">→</button></div><div class="preview-wall" id="preview-wall" data-limit="${limit}" tabindex="0" aria-label="Brand archive">${ordered.map((c,i)=>`<article class="archive-card ${i===0?'lead-card':''}" data-cat="${c.category}"${i>=limit?' data-extra=""':''}><a class="archive-link" href="/${c.slug}/"><div class="archive-img">${previewImg.lead(c,{alt:'',eager:i<6})}</div><div class="archive-caption"><p class="archive-category">${esc(site.categories.find(k=>k.id===c.category).label)}</p><h3>${esc(c.name)}</h3><p class="archive-years">${esc(c.years)} <span class="tag ${c.tier}">${TIERS[c.tier].label}</span></p></div></a><details class="archive-source"><summary>Image source</summary><div>${inline(sourceNote(c,img) || 'Original illustration; see the brand post-mortem for its archive and sources.').replaceAll('href="#src-', `href="/${c.slug}/#src-`)} <a href="/${c.slug}/#sources">Sources →</a></div></details></article>`).join('')}</div><button type="button" class="gallery-expand" aria-expanded="false" aria-controls="preview-wall" hidden>Show all ${companies.length} brands <span aria-hidden="true">↗</span></button></section>`;
    const split = site.intro.indexOf('. ')+1;
    const intro = `<div class="desktop-intro">${md(site.intro,'intro')}</div><div class="mobile-intro"><p class="intro">${inline(site.intro.slice(0,split))}</p><details class="intro-more"><summary>About the archive</summary>${md(site.intro.slice(split).trim(),'intro')}</details></div>`;
    const hero = `<figure class="preview-illustration">${heroPicture(d.id)}<figcaption>${illustrationCredit}</figcaption></figure>`;
    const categoryNav = `<nav class="preview-categories" aria-label="Browse by category">${site.categories.filter(k=>k.n).map(k=>`<a href="#cat-${k.id}" data-cat="${k.id}">${esc(k.label)} <span>${k.n}</span></a>`).join('')}</nav>`;
    const switcher = `<nav class="preview-switch" aria-label="Switch design direction"><span>Preview: ${esc(d.name)}</span><span>switch: ${directions.map((x,i)=>`<a href="/preview/${x.id}/" aria-label="${esc(x.name)}"${x.id===d.id?' aria-current="page"':''}>${'ABC'[i]}</a>`).join(' / ')}</span></nav>`;
    const credits = `<aside class="preview-credits wrap" aria-labelledby="credits-h"><h2 id="credits-h">Image credits &amp; notes</h2><p>${webvanCredit} <a href="https://commons.wikimedia.org/wiki/File:Webvan.jpg">Original photograph</a> · <a href="https://creativecommons.org/licenses/by/2.0/">Licence</a></p><p>${illustrationCredit} Archival images retain their available source colours. Open “Image source” on a card or the linked post-mortem for attribution.</p></aside>`;
    const url = `/preview/${d.id}/`;
    write(`preview/${d.id}/index.html`, head({site,title:`${d.name} · Homepage preview · Spectre Brands`,description:d.mood,path:url,version,preview:d})+masthead(site,companies,url,d)+`<main id="main" class="home preview-home">${home(site,companies,previewImg,{wall,hero,categoryNav,intro,heroInIntro:d.id==='editorial-vibrant',headline:inline(site.headline).replace(/(and again.*)/,'<span class="headline-final">$1</span>')})}</main>`+credits+footer(site,companies)+switcher+scripts('<script defer src="/assets/preview/home.js"></script>\n',version));
  }
  write('preview/index.html',head({site,title:'Three homepage directions · Spectre Brands',description:'Phase-1 design previews',path:'/preview/',version,preview:{id:'editorial-vibrant'}})+masthead(site,companies,'/preview/')+`<main id="main" class="preview-hub wrap"><p class="sec-k">Spectre Brands / Phase 01</p><h1>Three ways to remember.</h1><p class="lede">The same archive, in three different moods. Choose a direction to explore the complete homepage.</p><div class="direction-grid">${directions.map((d,i)=>`<a class="direction-card" href="/preview/${d.id}/" style="background:${d.tokens.bg};color:${d.tokens.text}"><img src="/assets/preview/${d.id}-800.jpg" width="800" height="533" alt="${esc(d.name)} illustration"><p class="direction-art-credit">${illustrationCredit}</p><div><small>Direction ${'ABC'[i]}</small><h2>${esc(d.name)}</h2><p>${esc(d.mood)}</p><span class="palette-swatches" aria-hidden="true">${['accent-1','accent-2','accent-3','dead','ghost'].map(k=>`<i style="background:${d.tokens[k]}"></i>`).join('')}</span><b>Explore direction →</b></div></a>`).join('')}</div><p class="hub-credit">${illustrationCredit}</p><h2>Logo explorations</h2><p class="lede"><a href="/preview/logos-vhs/">New: “Please Rewind” refined into 20 VHS × ghost variations →</a></p><img class="contact-sheet" src="/assets/preview/logo-contact-sheet.png" alt="Sixteen Spectre Brands logo concepts" loading="lazy"></main>`+footer(site,companies)+scripts('',version));
}

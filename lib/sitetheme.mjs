// Production theme: the Front Counter (Home C+) design applied to every built page.
// themePage(): post-pass over a built page (post-mortems, categories, about, 404): theme script, fonts, the section
// system stylesheet/script, the strip-and-ghost header, theme toggle, chapter lines and TOC where a page has sections.
// homePage(): the Home C+ render with the production <head> meta (canonical, OG, JSON-LD, icons) and the search
// palette, and without the design-review switcher and preview note.
import fs from 'node:fs'; import path from 'node:path';
import { pmTransform } from './pmtransform.mjs';
import { updatesTop, updatesMid, updatesFooter } from './updates.mjs';
// build.mjs leaves this where the mid-article prompt belongs (after a core section near the middle of the page).
export const UPD_MID_MARK = '<!--upd-mid-->';
// Email updates and the opening film, for a themed page or the homepage. Runs once per page: a page that already
// carries the top row is returned as it is. The top row is a child of <body> after the site and chapter navs, the
// invitation sits before the site footer, and the mid-article prompt replaces build.mjs's marker inside
// main.company. The forms post to the updates backend; nothing here marks them as a preview.
function updatesAndFilm(html, slug, V) {
  if (html.includes('data-upd="top"')) return html;
  const company = /<main id="main" class="company"/.test(html), film = html.includes('class="hx-media film"');
  const at = { slug: company || slug === 'about' || slug === 'glossary' ? slug : '' };
  html = html.replace(UPD_MID_MARK, () => company ? `<div class="wrap">${updatesMid(at)}</div>` : '').replaceAll(UPD_MID_MARK, '');
  html = html.replace(/(<main id="main" class="company"[^>]*)>/, '$1 data-upd-article>');
  html = html.replace('<nav class="pagenav" id="pagenav"', '<nav class="pagenav" id="pagenav" data-upd-sticky-nav');
  html = html.replace('<main id="main"', () => `${updatesTop(at)}<main id="main"`);
  html = html.replace('<footer class="foot"', () => `${updatesFooter(at)}<footer class="foot"`);
  html = html.replace('</head>', () => `${film ? `<link rel="stylesheet" href="/assets/css/film.css${V}">` : ''}<link rel="stylesheet" href="/assets/css/updates.css${V}"></head>`);
  return html.replace('</body>', () => `${film ? `<script defer src="/assets/js/film.js${V}"></script>` : ''}<script defer src="/assets/js/updates.js${V}"></script></body>`);
}
export function themePage(html, slug, V = '') {
  const heroFonts = html.includes('hx-treatment-tape') ? ['/assets/fonts/hero/barlow-condensed-bold.ttf', '/assets/fonts/preview/source-sans-3-2.woff2']
    : html.includes('hx-treatment-browser') ? ['/assets/fonts/varela-round.woff2']
    : html.includes('hx-treatment-bottle') ? ['/assets/fonts/preview/bodoni-moda-0.woff2'] : [];
  if (heroFonts.length) html = html.replace('</head>', `${heroFonts.map(href => `<link rel="preload" href="${href}" as="font" type="font/${href.endsWith('.ttf') ? 'ttf' : 'woff2'}" crossorigin>`).join('')}</head>`);
  html = html.replace('</head>', `<link rel="stylesheet" href="/assets/pmpreview/sections.css${V}"></head>`);
  html = html.replace('</body>', `<script src="/assets/pmpreview/sections.js${V}" defer></script></body>`);
  // after pmTransform, so the chapter nav is in place and the forms do not count towards the reading times
  return updatesAndFilm(pmTransform(html, slug), slug, V);
}
export function homePage(homec, prodHead, dialog, V = '') {
  // production meta from the regular head: everything from <head> up to the first stylesheet, minus charset/viewport
  const meta = prodHead.slice(prodHead.indexOf('<head>') + 6, prodHead.indexOf('<link rel="stylesheet"'))
    .replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '');
  const ldScripts = (prodHead.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || []).join('');
  let h = homec.replace(/<title>[\s\S]*?<\/title><meta name="description"[^>]*><meta name="robots"[^>]*>/, '')
    .replace(/<link rel="icon"[^>]*>|<link rel="apple-touch-icon"[^>]*>/g, '')
    .replace(/ data-mix="[^"]*"/, '')
    .replace('<meta name="viewport" content="width=device-width,initial-scale=1">', '<meta name="viewport" content="width=device-width,initial-scale=1">' + meta)
    .replace(/<p class="mix-note">[\s\S]*?<\/p>\n?/, '')
    .replace(/<nav class="mix-switch"[\s\S]*?<\/nav>\n?/, '')
    .replace(/\?v=[a-z0-9]+"/g, `${V}"`);
  // search: the nav and footer "Search" open the site's search palette
  h = h.replace(/<a href="\/">Search<\/a>/g, '<button type="button" class="nav-search" data-search aria-haspopup="dialog">Search</button>');
  h = h.replace('<a href="/about/">About the archive</a>', '<a href="/about/">About the archive</a><a href="/glossary/">Glossary</a>');
  h = h.replace('</head>', `<link rel="stylesheet" href="/assets/css/cmdk-home.css${V}">${ldScripts}</head>`);
  h = h.replace('</body>', `${dialog}<script defer src="/assets/js/runtime.js${V}"></script>\n</body>`);
  return updatesAndFilm(h, '', V);
}
// The search palette's styles for the homepage, which does not load site.css: the .cmdk/.tag rules with the site
// tokens scoped to the dialog (light and dark), so they cannot collide with the homepage's own variables.
export function cmdkCSS(siteCSS, tokensCSS, sectionsCSS) {
  const rules = (siteCSS.match(/[^{}]+\{[^{}]*\}/g) || []).filter(r => /\.cmdk|\.tag\b/.test(r.split('{')[0]))
    .map(r => { const [sel, body] = r.split('{'); return sel.split(',').map(x => /\.cmdk/.test(x) ? x.trim() : '.cmdk ' + x.trim()).join(',') + '{' + body; }).join('');
  const root = (tokensCSS.match(/:root\{[\s\S]*?\n\}/) || [''])[0].replace(':root{', '.cmdk{');
  const light = (sectionsCSS.match(/:root\{[\s\S]*?\n\}/) || [''])[0].replace(':root{', '.cmdk{');
  const dark = (sectionsCSS.match(/html\[data-theme="dark"\]\{[\s\S]*?\n\}/) || [''])[0].replace('html[data-theme="dark"]{', 'html[data-theme="dark"] .cmdk{');
  return root + light + dark + rules + '.nav-search{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}.nav-search:hover{text-decoration:underline}';
}

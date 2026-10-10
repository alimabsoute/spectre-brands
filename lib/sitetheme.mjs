// Production theme: the Front Counter (Home C+) design applied to every built page.
// themePage(): post-pass over a built page (post-mortems, categories, about, 404): theme script, fonts, the section
// system stylesheet/script, the strip-and-ghost header, theme toggle, chapter lines and TOC where a page has sections.
// homePage(): the Home C+ render with the production <head> meta (canonical, OG, JSON-LD, icons) and the search
// palette, and without the design-review switcher and preview note.
import fs from 'node:fs'; import path from 'node:path';
import { pmTransform } from './pmtransform.mjs';
export function themePage(html, slug, V = '') {
  html = html.replace('</head>', `<link rel="stylesheet" href="/assets/pmpreview/sections.css${V}"></head>`);
  html = html.replace('</body>', `<script src="/assets/pmpreview/sections.js${V}" defer></script></body>`);
  return pmTransform(html, slug);
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
  h = h.replace('</head>', `<link rel="stylesheet" href="/assets/css/cmdk-home.css${V}">${ldScripts}</head>`);
  h = h.replace('</body>', `${dialog}<script defer src="/assets/js/runtime.js${V}"></script>\n</body>`);
  return h;
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

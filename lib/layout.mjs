import { esc, json } from './md.mjs';
import { GROUPS, SECTIONS } from './registry.mjs';

export const MARK = '<svg class="brand-mark" viewBox="0 0 24 28" aria-hidden="true"><path d="M3 26.5V12a9 9 0 0 1 18 0v14.5l-3-2.6-3 2.6-3-2.6-3 2.6-3-2.6z" fill="currentColor"/><rect x="8" y="10" width="2.6" height="4.6" rx="1.3" fill="#fff"/><rect x="13.4" y="10" width="2.6" height="4.6" rx="1.3" fill="#fff"/></svg>';
export const WORDMARK = `${MARK}<span class="wm"><b>Spectre</b> Brands</span>`;

// <head>. `ld` is a JSON-LD object (or array); `image` an absolute or root-relative OpenGraph image.
export function head({ site, title, description, path = '/', image = '/og/default.png', type = 'website', ld = null, version = '' }) {
  const abs = u => /^https?:/.test(u) ? u : site.url.replace(/\/$/, '') + u;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(abs(path))}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:site_name" content="Spectre Brands">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(abs(path))}">
<meta property="og:image" content="${esc(abs(image))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FCFBF8">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/source-serif-4.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css${version}">
${ld ? `<script type="application/ld+json">${json(ld)}</script>` : ''}
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
`;
}

export function masthead(site, companies, active = '') {
  const cats = site.categories.map(k => ({ ...k, n: companies.filter(c => c.category === k.id).length })).filter(k => k.n);
  const catLinks = cats.map(k => `<a href="/category/${k.id}/"${active === `/category/${k.id}/` ? ' aria-current="page"' : ''}><span>${esc(k.label)}</span><small>${k.n}</small></a>`).join('');
  const cur = h => h === active ? ' aria-current="page"' : '';
  return `<a class="skip" href="#main">Skip to content</a>
<header class="mast"><div class="wrap">
<a class="brand" href="/" aria-label="Spectre Brands home">${WORDMARK}</a>
<nav class="site" aria-label="Site">
<a href="/"${cur('/')}>Home</a>
<div class="dd"><button type="button" class="dd-btn" aria-expanded="false" aria-controls="catMenu">Categories<span class="car" aria-hidden="true"></span></button><div class="dd-menu" id="catMenu">${catLinks}</div></div>
<a href="/about/"${cur('/about/')}>About</a>
<button type="button" class="search-btn" data-search aria-haspopup="dialog"><svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13.5 13.5L18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Search</span><kbd>/</kbd></button>
</nav>
<div class="mast-m">
<button type="button" class="icon-btn" data-search aria-label="Search" aria-haspopup="dialog"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13.5 13.5L18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
<button type="button" class="icon-btn" id="menuBtn" aria-expanded="false" aria-controls="mnav" aria-label="Menu"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
</div>
</div>
<nav class="mnav" id="mnav" aria-label="Site (mobile)" hidden><a href="/">Home</a><div class="mnav-h">Categories</div>${catLinks}<a href="/about/">About and methodology</a></nav>
</header>
<dialog class="cmdk" id="cmdk" aria-label="Search post-mortems"><div class="cmdk-in"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13.5 13.5L18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><input type="search" id="cmdkQ" placeholder="Search brands, categories, causes of death" autocomplete="off" aria-controls="cmdkList" aria-label="Search"><button type="button" class="cmdk-x" data-close aria-label="Close search">Esc</button></div><ul class="cmdk-list" id="cmdkList" role="listbox" aria-label="Results"></ul><p class="cmdk-empty" id="cmdkEmpty" hidden>No brand matches that. Try a category, a decade or a cause of death.</p></dialog>
`;
}

// Grouped, compact section nav. Only sections the page actually renders are listed.
export function pageNav(used, labels, name) {
  const groups = GROUPS.map(g => ({ ...g, items: used.filter(id => SECTIONS[id].group === g.id) })).filter(g => g.items.length);
  const link = id => `<a href="#${id}" data-sec="${id}">${esc(labels[id] || SECTIONS[id].label)}</a>`;
  const html = groups.map(g => g.items.length === 1
    ? `<div class="pn-g single" data-group="${g.id}">${link(g.items[0]).replace('<a ', '<a class="pn-btn" ')}</div>`
    : `<div class="pn-g" data-group="${g.id}"><button class="pn-btn" type="button" aria-expanded="false">${esc(g.label)}<span class="car" aria-hidden="true"></span></button><div class="pn-menu">${g.items.map(link).join('')}</div></div>`).join('');
  return `<nav class="pagenav" id="pagenav" aria-label="Sections of this post-mortem"><div class="progress" id="prog"></div><div class="wrap">
<div class="pn-groups">${html}</div>
<div class="pn-now" aria-hidden="true"><b>${esc(name)}</b><span id="pnNow">Overview</span></div>
</div></nav>
`;
}

export function footer(site, companies) {
  const cats = site.categories.filter(k => companies.some(c => c.category === k.id));
  return `<footer class="foot"><div class="wrap">
<div class="foot-grid">
<div><a class="brand" href="/">${WORDMARK}</a><p>Independent post-mortems of companies and brands, built from SEC filings, court records, contemporary press and archived web pages. Every figure links to a numbered source; derived figures, estimates and unverified claims are labeled.</p></div>
<nav aria-label="Categories"><h2>Categories</h2>${cats.map(k => `<a href="/category/${k.id}/">${esc(k.label)}</a>`).join('')}</nav>
<nav aria-label="About this site"><h2>Site</h2><a href="/">All post-mortems</a><a href="/about/">About and methodology</a><a href="/about/#fair-use">Trademarks and fair use</a><a href="/sitemap.xml">Sitemap</a><a href="${esc(site.repo)}" target="_blank" rel="noopener">Source on GitHub</a></nav>
</div>
<p class="legal">${esc(site.legal)}</p>
</div></footer>
`;
}

export const scripts = (extra = '', version = '') => `${extra}<div class="tip" id="tip" role="tooltip" hidden></div>\n<script defer src="/assets/js/runtime.js${version}"></script>\n</body>\n</html>\n`;

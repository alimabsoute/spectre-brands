import { esc } from './md.mjs';
import { GROUPS, SECTIONS } from './registry.mjs';

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600;700&family=Caveat:wght@500;600;700&family=Varela+Round&display=swap" rel="stylesheet">';
const LIBS = ['https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', 'https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.js',
  'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js', 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js'];
const ICON = '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%226%22 fill=%22%23161513%22/%3E%3Cpath d=%22M7 27V14a9 9 0 0 1 18 0v13l-3-2.4-3 2.4-3-2.4-3 2.4-3-2.4z%22 fill=%22%23f7f3ea%22/%3E%3Crect x=%2212%22 y=%2212%22 width=%222.6%22 height=%224.6%22 rx=%221.3%22 fill=%22%23161513%22/%3E%3Crect x=%2217.4%22 y=%2212%22 width=%222.6%22 height=%224.6%22 rx=%221.3%22 fill=%22%23161513%22/%3E%3C/svg%3E">';

export function head({ title, description, libs = false, image = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:site_name" content="Spectre Brands">
<meta property="og:description" content="${esc(description)}">${image ? `\n<meta property="og:image" content="${esc(image)}">` : ''}
<meta name="theme-color" content="#f7f3ea">
${ICON}
${FONTS}
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/modules.css">
<link rel="stylesheet" href="/assets/css/map.css">
${libs ? LIBS.map(u => `<script defer src="${u}"></script>`).join('\n') : ''}
</head>
<body>
`;
}

export const WORDMARK = '<svg class="brand-mark" viewBox="0 0 24 28" aria-hidden="true"><path d="M3 26.5V12a9 9 0 0 1 18 0v14.5l-3-2.6-3 2.6-3-2.6-3 2.6-3-2.6z" fill="currentColor"/><rect x="8" y="10" width="2.6" height="4.6" rx="1.3" fill="var(--paper)"/><rect x="13.4" y="10" width="2.6" height="4.6" rx="1.3" fill="var(--paper)"/></svg><span class="wm"><b>Spectre</b> Brands</span>';

export function masthead(companies, active) {
  const links = [['/', 'Index'], ...companies.map(c => [`/${c.slug}/`, c.name])];
  const nav = links.map(([h, t]) => `<a href="${h}"${h === active ? ' class="on" aria-current="page"' : ''}>${esc(t)}</a>`).join('');
  return `<div class="progress" id="prog"></div>
<header class="mast"><div class="wrap">
<a class="brand" href="/"><svg class="brand-mark" viewBox="0 0 24 28" aria-hidden="true"><path d="M3 26.5V12a9 9 0 0 1 18 0v14.5l-3-2.6-3 2.6-3-2.6-3 2.6-3-2.6z" fill="currentColor"/><rect x="8" y="10" width="2.6" height="4.6" rx="1.3" fill="var(--paper)"/><rect x="13.4" y="10" width="2.6" height="4.6" rx="1.3" fill="var(--paper)"/></svg><span class="wm"><b>Spectre</b> Brands</span></a>
<nav class="site" aria-label="Post-mortems">${nav}</nav>
</div></header>
`;
}

// Grouped, compact section nav. Only sections the page actually renders are listed.
export function pageNav(used, labels) {
  const groups = GROUPS.map(g => ({ ...g, items: used.filter(id => SECTIONS[id].group === g.id) })).filter(g => g.items.length);
  const link = id => `<a href="#${id}" data-sec="${id}">${esc(labels[id] || SECTIONS[id].label)}</a>`;
  const html = groups.map(g => g.items.length === 1
    ? `<div class="pn-g single" data-group="${g.id}">${link(g.items[0]).replace('<a ', '<a class="pn-btn" ')}</div>`
    : `<div class="pn-g" data-group="${g.id}"><button class="pn-btn" type="button" aria-expanded="false">${esc(g.label)}<span class="car" aria-hidden="true"></span></button><div class="pn-menu" role="menu">${g.items.map(link).join('')}</div></div>`).join('');
  return `<nav class="pagenav" id="pagenav" aria-label="Sections on this page"><div class="wrap">
<div class="pn-groups">${html}</div>
<div class="pn-now" aria-live="polite"><span class="pn-dot"></span><span id="pnNow">Overview</span></div>
</div></nav>
`;
}

export function footer(companies, current) {
  const rel = companies.filter(c => c.slug !== current).map(c => `<a href="/${c.slug}/" class="rel"><span class="no">No. ${esc(c.number)} · ${esc(c.tierLabel)}</span><div><h3>${esc(c.name)}</h3><p>${esc(c.card.blurb)}</p></div><span class="no">Read</span></a>`).join('');
  return `${current ? `<section id="more" class="more"><div class="wrap"><div class="sec-k">More post-mortems</div><div class="related">${rel}</div></div></section>` : ''}
<footer><div class="wrap"><div class="brand"><svg class="brand-mark" viewBox="0 0 24 28" aria-hidden="true"><path d="M3 26.5V12a9 9 0 0 1 18 0v14.5l-3-2.6-3 2.6-3-2.6-3 2.6-3-2.6z" fill="currentColor"/><rect x="8" y="10" width="2.6" height="4.6" rx="1.3" fill="var(--paper)"/><rect x="13.4" y="10" width="2.6" height="4.6" rx="1.3" fill="var(--paper)"/></svg><span class="wm"><b>Spectre</b> Brands</span></div><p>Independent post-mortems of companies and brands, built from SEC filings, contemporary press and archived web pages. Figures link to numbered sources; estimates and unverified claims are labeled. Brand names, logos and trademarks belong to their owners and appear here in historical and editorial context. Drawings are original recreations.</p><p><a href="/">All post-mortems</a> · <a href="https://github.com/alimabsoute/spectre-brands" target="_blank" rel="noopener">Source on GitHub</a></p></div></footer>
`;
}

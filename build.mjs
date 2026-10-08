#!/usr/bin/env node
// Spectre Brands static site builder. No dependencies: `node build.mjs` writes dist/.
// Pages are generated from companies/<slug>/company.json + companies/<slug>/sections/*.json.
// Flags: --only <slug>[,<slug>]  build just these companies (the homepage lists only them)
//        --out <dir>             write somewhere other than dist/ (lets several builds run at once)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SECTIONS, ORDER, TIERS, GROUPS } from './lib/registry.mjs';
import { head, masthead, pageNav, footer, scripts } from './lib/layout.mjs';
import { overview, section, heroImages, actImages, actBreak } from './lib/sections.mjs';
import { home } from './lib/home.mjs';
import { previewPages } from './lib/preview.mjs';
import { categoryPage, aboutPage } from './lib/pages.mjs';
import { row, ledgerHead, decadeOf } from './lib/cards.mjs';
import { imageInfo, imageKind, strength, picture, PROVIDERS, VIDEO_TYPES } from './lib/media.mjs';
import { json, esc } from './lib/md.mjs';
import { sketch } from './lib/sketch.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = k => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
const OUT = path.resolve(ROOT, flag('--out') || 'dist');
const ONLY = flag('--only') ? flag('--only').split(',') : null;
const rd = p => fs.readFileSync(p, 'utf8');
const readJSON = p => { try { return JSON.parse(rd(p)); } catch (e) { throw new Error(`Invalid JSON in ${path.relative(ROOT, p)}: ${e.message}`); } };
const errors = [], warnings = [];
const write = (rel, body) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); };

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  for (const f of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, f.name), d = path.join(dst, f.name);
    if (f.isDirectory()) copyDir(s, d); else { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(s, d); }
  }
}

function loadCompany(slug, site) {
  const dir = path.join(ROOT, 'companies', slug);
  const c = readJSON(path.join(dir, 'company.json'));
  c.slug = slug; c.dir = dir;
  for (const k of ['name', 'number', 'tier', 'tierWhy', 'category', 'cause', 'years', 'died', 'place', 'title', 'description', 'theme', 'card', 'hero'])
    if (c[k] == null) errors.push(`${slug}: company.json is missing "${k}"`);
  if (c.tier && !TIERS[c.tier]) errors.push(`${slug}: tier must be one of ${Object.keys(TIERS).join(', ')}`);
  if (!site.categories.some(x => x.id === c.category)) errors.push(`${slug}: unknown category "${c.category}" (see site.json)`);
  if (!site.causes.some(x => x.id === c.cause)) errors.push(`${slug}: unknown cause "${c.cause}" (see "causes" in site.json)`);
  for (const d of c.dates || []) if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) errors.push(`${slug}: dates[].date must be YYYY-MM-DD, got "${d.date}"`);
  c.tierLabel = TIERS[c.tier]?.label;
  c.sections = {};
  const sdir = path.join(dir, 'sections');
  for (const f of fs.existsSync(sdir) ? fs.readdirSync(sdir) : []) {
    if (!f.endsWith('.json')) continue;
    const id = f.slice(0, -5);
    if (!SECTIONS[id]) { errors.push(`${slug}: sections/${f} is not a known section id (see lib/registry.mjs)`); continue; }
    c.sections[id] = readJSON(path.join(sdir, f));
  }
  for (const [id, s] of Object.entries(SECTIONS)) if (s.core && id !== 'overview' && !c.sections[id]) errors.push(`${slug}: core section "${id}" is missing (sections/${id}.json)`);
  validate(c);
  return c;
}

// Data-honesty checks: every footnote must point at a real source, and every video must be complete.
function validate(c) {
  const ids = new Set((c.sections.sources?.list || []).map(x => String(x.id)));
  const { dir, sections, ...meta } = c;
  const scan = (where, obj) => {
    const text = JSON.stringify(obj);
    for (const m of text.matchAll(/\[\^(\d+)\]/g)) if (!ids.has(m[1])) errors.push(`${c.slug}/${where}: footnote [^${m[1]}] has no entry in sources.json`);
    for (const m of text.matchAll(/"src":\[([\d,\s]*)\]/g)) for (const n of m[1].split(',').map(s => s.trim()).filter(Boolean)) if (!ids.has(n)) errors.push(`${c.slug}/${where}: src ${n} has no entry in sources.json`);
  };
  scan('company.json', meta);
  for (const [id, s] of Object.entries(sections)) scan(id, s);
  const vids = sections.videos?.videos || [];
  const seen = new Set();
  for (const v of vids) {
    for (const k of ['id', 'title', 'year', 'type', 'embedId']) if (v[k] == null || v[k] === '') errors.push(`${c.slug}/videos: video "${v.id || v.title}" is missing "${k}"`);
    if (!PROVIDERS[v.provider || 'youtube']) errors.push(`${c.slug}/videos: "${v.id}" has unknown provider "${v.provider}"`);
    if (!VIDEO_TYPES[v.type]) errors.push(`${c.slug}/videos: "${v.id}" has unknown type "${v.type}" (use ${Object.keys(VIDEO_TYPES).join(', ')})`);
    if (seen.has(v.id)) errors.push(`${c.slug}/videos: duplicate video id "${v.id}"`);
    seen.add(v.id);
  }
  if (sections.videos && vids.length < 2) errors.push(`${c.slug}/videos: at least 2 videos are required (found ${vids.length})`);
}

function makeCtx(c) {
  const ctx = { slug: c.slug, meta: { name: c.name, years: c.years, died: c.died }, gallery: c.sections?.gallery?.archive || [], data: { charts: {} }, count: { infographics: 0 }, inlineVideos: new Set() };
  ctx.videos = Object.fromEntries((c.sections?.videos?.videos || []).map(v => [v.id, v]));
  ctx.art = file => {
    if (!file) return '';
    const p = path.join(c.dir, file);
    if (!fs.existsSync(p)) { errors.push(`${c.slug}: missing drawing ${file}`); return ''; }
    // every drawing is traced again by hand, in ink and the brand accent (lib/sketch.mjs)
    return sketch(rd(p).replace(/<\?xml[^>]*>\s*/, '').replace(/<!--[\s\S]*?-->/g, '').trim(), c.theme.accent, `${c.slug}/${file}`);
  };
  ctx.image = file => {
    const i = imageInfo(c.dir, `/${c.slug}`, file);
    if (!i) { errors.push(`${c.slug}: missing image ${file}`); return null; }
    if (/\.(avif|webp)$/.test(file) && !i.fallback) warnings.push(`${c.slug}: ${file} has no .jpg/.png fallback (run: node scripts/img.mjs --fallbacks companies/${c.slug}/img)`);
    return i;
  };
  return ctx;
}

function renderCompany(c, all, site, V) {
  const ctx = makeCtx(c);
  const used = ['overview', ...ORDER.filter(id => c.sections[id])];
  const labels = Object.fromEntries(used.filter(id => c.sections[id]).map(id => [id, c.sections[id].label || SECTIONS[id].label]));
  for (const id of used.slice(1)) c.sections[id].label = labels[id];
  let body = overview(c, ctx, site);
  // acts are the nav groups; each one after the first opens with a break, two of them with a photograph
  const acts = GROUPS.filter(g => used.some(id => SECTIONS[id].group === g.id)), photos = actImages(c, ctx);
  // an act of one section needs no header of its own (Sources, usually); photographs go to the first and last headers
  const many = g => used.filter(x => SECTIONS[x].group === g).length > 1, headed = acts.filter(a => a.id !== 'story' && many(a.id)).map(a => a.id);
  const photoFor = Object.fromEntries([...new Set([headed[0], headed.at(-1)])].filter(Boolean).map((g, i) => [g, photos[i]]));
  for (const id of used.slice(1)) {
    const g = SECTIONS[id].group, opens = headed.includes(g) && used.find(x => SECTIONS[x].group === g) === id;
    if (opens) body += actBreak(ctx, { id: g, label: acts.find(a => a.id === g).label, n: acts.findIndex(a => a.id === g) + 1, total: acts.length, parts: used.filter(x => SECTIONS[x].group === g).map(x => labels[x]), image: photoFor[g] });
    try { body += section(id, c.sections[id], ctx); } catch (e) { errors.push(`${c.slug}/${id}: ${e.message}`); }
  }
  c.stats = { infographics: ctx.count.infographics + (c.sections.cause?.causes?.reduce((a, x) => a + x.weight, 0) === 100 ? 1 : 0), videos: Object.keys(ctx.videos).length, inlineVideos: ctx.inlineVideos.size, charts: Object.keys(ctx.data.charts).length };
  const needsCharts = Object.keys(ctx.data.charts).length > 0, needsMap = !!ctx.data.map;
  const nasdaq = JSON.stringify(ctx.data).includes('"ref":"nasdaq"') ? readJSON(path.join(ROOT, 'data/nasdaq.json')) : null;
  const related = [...all.filter(x => x.slug !== c.slug && x.category === c.category), ...all.filter(x => x.slug !== c.slug && x.category !== c.category)].slice(0, 3);
  const artOf = (x, f) => makeCtx(x).art(f);
  const og = fs.existsSync(path.join(ROOT, 'og', `${c.slug}.png`)) ? `/og/${c.slug}.png` : '/og/default.png';
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: c.title, description: c.description, image: [site.url + og], datePublished: c.published || site.published, dateModified: c.updated || c.published || site.published,
    author: { '@type': 'Organization', name: 'Spectre Brands', url: site.url + '/' }, publisher: { '@type': 'Organization', name: 'Spectre Brands', logo: { '@type': 'ImageObject', url: site.url + '/apple-touch-icon.png' } },
    mainEntityOfPage: `${site.url}/${c.slug}/`, about: { '@type': 'Organization', name: c.name }, articleSection: site.categories.find(k => k.id === c.category)?.label };
  const html = head({ site, title: c.title, description: c.description, path: `/${c.slug}/`, image: og, type: 'article', ld, version: V })
    + masthead(site, all, `/${c.slug}/`) + pageNav(used, labels, c.name)
    + `<main id="main" class="company" style="--brand:${esc(c.theme.accent)};--brand-soft:${esc(c.theme.soft)}">${body}
<section id="more" class="more" aria-labelledby="more-h"><div class="wrap"><h2 id="more-h">More post-mortems</h2>${ledgerHead}<div class="ledger">${related.map(x => row(x, site, img)).join('\n')}</div><p class="more-all"><a href="/#index">Browse all ${all.length}<span aria-hidden="true"> →</span></a></p></div></section></main>`
    + footer(site, all)
    + scripts(`<script type="application/json" id="bo-data">${json({ ...ctx.data, nasdaq, needs: { charts: needsCharts, map: needsMap } })}</script>\n`, V);
  write(`${c.slug}/index.html`, html);
  copyDir(path.join(c.dir, 'img'), path.join(OUT, c.slug, 'img'));
  return used;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const site = readJSON(path.join(ROOT, 'site.json'));
const slugs = fs.readdirSync(path.join(ROOT, 'companies'), { withFileTypes: true }).filter(d => d.isDirectory() && !d.name.startsWith('_') && (!ONLY || ONLY.includes(d.name))).map(d => d.name);
const companies = slugs.map(s => loadCompany(s, site)).sort((a, b) => String(a.number).localeCompare(String(b.number)));
if (errors.length) { errors.forEach(e => console.error('error:', e)); process.exit(1); }
for (const k of site.categories) k.n = companies.filter(c => c.category === k.id).length;
const dupes = companies.map(c => c.number).filter((n, i, a) => a.indexOf(n) !== i);
if (dupes.length) errors.push(`duplicate company "number": ${[...new Set(dupes)].join(', ')}`);

// One stylesheet (tokens first), versioned by content hash so deploys never serve a stale file.
const CSS = ['tokens.css', 'base.css', 'modules.css', 'infographics.css', 'map.css', 'home.css'].map(f => rd(path.join(ROOT, 'assets/css', f))).join('\n');
copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
fs.rmSync(path.join(OUT, 'assets/css'), { recursive: true, force: true });
// light minification: comments and insignificant whitespace only
const minCSS = CSS.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,])\s*/g, '$1').replace(/;}/g, '}');
write('assets/site.css', minCSS);
const hash = crypto.createHash('sha1').update(CSS);
for (const f of fs.readdirSync(path.join(ROOT, 'assets/js'))) hash.update(rd(path.join(ROOT, 'assets/js', f)));
const V = '?v=' + hash.digest('hex').slice(0, 8);
for (const f of fs.readdirSync(path.join(OUT, 'assets/js'))) { const p = path.join(OUT, 'assets/js', f); fs.writeFileSync(p, rd(p).replaceAll('__V__', V)); }
copyDir(path.join(ROOT, 'static'), OUT);
copyDir(path.join(ROOT, 'og'), path.join(OUT, 'og'));

const artOf = (c, f) => makeCtx(c).art(f);
// How a brand is pictured outside its own page. lead: its strongest archive image (its drawing if it has no
// image at all). logo: the logo named in card.logo, else the lead. score: how strong the lead is.
const leadImage = c => { const x = makeCtx(c), m = heroImages(c, x); return m && { x, ...m.lead }; };
const img = {
  lead: (c, opts = {}) => { const l = leadImage(c); return l ? picture(l.x, l.image, { cls: `k-${imageKind(l.image, l.i)}`, ...opts }) : makeCtx(c).art(c.hero.art); },
  logo: c => c.card.logo ? picture(makeCtx(c), c.card.logo, { alt: '', cls: 'k-mark' }) : img.lead(c, { alt: '' }),
  score: c => { const l = leadImage(c); return l ? strength(l) : -999; },
  caption: c => leadImage(c)?.caption || ''
};
const report = companies.map(c => { const used = renderCompany(c, companies, site, V); return `${c.slug} [${c.tier}/${c.category}]: ${used.length} sections, ${c.stats.videos} videos (${c.stats.inlineVideos} inline), ${c.stats.charts} charts, ${c.stats.infographics} infographics`; });
for (const c of companies) {
  if (c.stats.infographics < 4) warnings.push(`${c.slug}: only ${c.stats.infographics} infographic blocks (aim for 4 or more)`);
  if (!fs.existsSync(path.join(ROOT, 'og', `${c.slug}.png`))) warnings.push(`${c.slug}: no OpenGraph image (run: node scripts/og.mjs)`);
}

const page = (rel, { title, description, body, ld = null, cls = '' }) => write(rel === '/' ? 'index.html' : `${rel.replace(/^\//, '')}index.html`,
  head({ site, title, description, path: rel, ld, version: V }) + masthead(site, companies, rel) + `<main id="main"${cls ? ` class="${cls}"` : ''}>${body}</main>` + footer(site, companies) + scripts('', V));

page('/', { title: site.title, description: site.description, body: home(site, companies, img), cls: 'home',
  ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Spectre Brands', url: site.url + '/', description: site.description } });
for (const k of site.categories.filter(k => k.n)) {
  const list = companies.filter(c => c.category === k.id);
  page(`/category/${k.id}/`, { title: `${k.label}: dead and ghost brands · Spectre Brands`, description: `${k.blurb} Sourced post-mortems of ${list.map(c => c.name).join(', ')}.`, body: categoryPage(site, k, list, img), cls: 'category',
    ld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: k.label, url: `${site.url}/category/${k.id}/`, hasPart: list.map(c => ({ '@type': 'Article', headline: c.title, url: `${site.url}/${c.slug}/` })) } });
}
page('/about/', { title: 'About and methodology · Spectre Brands', description: 'How Spectre Brands chooses sources, what Dead and Ghost mean, the data-honesty rules every post-mortem follows, and the trademark and fair-use position.', body: aboutPage(site, companies), cls: 'about' });
// Isolated design review pages; deliberately absent from production navigation, search and sitemap.
previewPages({ site, companies, img, version: V, write, rd, root: ROOT });
write('404.html', head({ site, title: 'Not found · Spectre Brands', description: 'Page not found', path: '/404.html', version: V }) + masthead(site, companies, '') + '<main id="main"><header class="page-hero"><div class="wrap"><h1>Nothing is buried here.</h1><p class="lede">That page does not exist. <a href="/">Back to the index</a>, or press / to search.</p></div></header></main>' + footer(site, companies) + scripts('', V));

// search index, sitemap, robots
// The search index. g: group shown in the palette; r: tier; i: logo or lead image; f: listed before anything is typed
// (the featured brand and the next four by number).
const thumbOf = c => { const i = c.card.logo ? makeCtx(c).image(c.card.logo) : leadImage(c)?.i; return i ? i.fallback || i.src : ''; };
const featured = [companies.find(c => c.slug === site.featured), ...companies].filter((c, i, a) => c && a.indexOf(c) === i).slice(0, 5);
write('search.json', JSON.stringify(companies.map(c => ({ g: 'Brands', r: c.tier, i: thumbOf(c), f: featured.includes(c) ? 1 : 0, n: c.name, u: `/${c.slug}/`, t: c.tierLabel, c: site.categories.find(k => k.id === c.category).label, y: c.years, d: decadeOf(c.died), k: site.causes.find(k => k.id === c.cause).label, b: c.card.blurb, p: c.place })).concat(site.categories.filter(k => k.n).map(k => ({ g: 'Categories', n: k.label, u: `/category/${k.id}/`, t: 'Category', c: '', y: `${k.n} post-mortems`, b: k.blurb, d: '', k: '', p: '' })), [{ g: 'Pages', n: 'About and methodology', u: '/about/', t: 'Page', c: '', y: '', b: 'Sources, Dead vs Ghost, data-honesty rules, trademarks and fair use.', d: '', k: '', p: '' }])));
const urls = ['/', '/about/', ...site.categories.filter(k => k.n).map(k => `/category/${k.id}/`), ...companies.map(c => `/${c.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${site.url}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

[...new Set(warnings)].forEach(w => console.warn('warning:', w));
if (errors.length) { [...new Set(errors)].forEach(e => console.error('error:', e)); process.exit(1); }
console.log(`Built ${companies.length} post-mortems, ${site.categories.filter(k => k.n).length} category pages, home and about into ${path.relative(ROOT, OUT) || OUT}/\n` + report.join('\n'));

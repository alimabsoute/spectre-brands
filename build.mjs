#!/usr/bin/env node
// Spectre Brands static site builder. No dependencies: `node build.mjs` writes dist/.
// Pages are generated from companies/<slug>/company.json + companies/<slug>/sections/*.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTIONS, ORDER, TIERS } from './lib/registry.mjs';
import { head, masthead, pageNav, footer } from './lib/layout.mjs';
import { overview, section } from './lib/sections.mjs';
import { home } from './lib/home.mjs';
import { json } from './lib/md.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const rd = p => fs.readFileSync(p, 'utf8');
const readJSON = p => { try { return JSON.parse(rd(p)); } catch (e) { throw new Error(`Invalid JSON in ${path.relative(ROOT, p)}: ${e.message}`); } };
const errors = [], warnings = [];

// Copy a file; files stored as <name>.b64 (base64 text) are decoded to <name>.
function copyAsset(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (src.endsWith('.b64')) fs.writeFileSync(dst.slice(0, -4), Buffer.from(rd(src).replace(/\s+/g, ''), 'base64'));
  else fs.copyFileSync(src, dst);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  for (const f of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, f.name), d = path.join(dst, f.name);
    if (f.isDirectory()) copyDir(s, d); else copyAsset(s, d);
  }
}

function loadCompany(slug) {
  const dir = path.join(ROOT, 'companies', slug);
  const c = readJSON(path.join(dir, 'company.json'));
  c.slug = slug; c.dir = dir;
  for (const k of ['name', 'number', 'tier', 'category', 'years', 'place', 'title', 'description', 'theme', 'card', 'hero'])
    if (c[k] == null) errors.push(`${slug}: company.json is missing "${k}"`);
  if (c.tier && !TIERS[c.tier]) errors.push(`${slug}: tier must be one of ${Object.keys(TIERS).join(', ')}`);
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
  return c;
}

function makeCtx(c) {
  const ctx = { slug: c.slug, data: { charts: {} } };
  ctx.art = file => {
    if (!file) return '';
    const p = path.join(c.dir, file);
    if (!fs.existsSync(p)) { errors.push(`${c.slug}: missing drawing ${file}`); return ''; }
    return rd(p).replace(/<\?xml[^>]*>\s*/, '').trim();
  };
  ctx.img = file => {
    const p = path.join(c.dir, file);
    if (!fs.existsSync(p) && !fs.existsSync(p + '.b64')) errors.push(`${c.slug}: missing image ${file}`);
    return `/${c.slug}/${file}`;
  };
  return ctx;
}

function renderCompany(c, all) {
  const ctx = makeCtx(c);
  const used = ['overview', ...ORDER.filter(id => c.sections[id])];
  const labels = Object.fromEntries(used.filter(id => c.sections[id]).map(id => [id, c.sections[id].label || SECTIONS[id].label]));
  for (const id of used.slice(1)) c.sections[id].label = labels[id];
  let body = overview(c, ctx);
  used.slice(1).forEach((id, i) => {
    try { body += section(id, c.sections[id], i + 1, ctx); } catch (e) { errors.push(`${c.slug}/${id}: ${e.message}`); }
  });
  const nasdaq = JSON.stringify(ctx.data).includes('"ref":"nasdaq"') ? readJSON(path.join(ROOT, 'data/nasdaq.json')) : null;
  const html = head({ title: c.title, description: c.description, libs: true }) + masthead(all, `/${c.slug}/`) + pageNav(used, labels)
    + `<main style="--brand:${c.theme.accent};--brand-soft:${c.theme.soft}">${body}</main>` + footer(all, c.slug)
    + `<script type="application/json" id="bo-data">${json({ ...ctx.data, nasdaq })}</script>\n<script defer src="/assets/js/runtime.js"></script>\n<script defer src="/assets/js/charts.js"></script>\n<script defer src="/assets/js/map.js"></script>\n</body>\n</html>\n`;
  fs.mkdirSync(path.join(OUT, c.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, c.slug, 'index.html'), html);
  copyDir(path.join(c.dir, 'img'), path.join(OUT, c.slug, 'img'));
  return used;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const site = readJSON(path.join(ROOT, 'site.json'));
const slugs = fs.readdirSync(path.join(ROOT, 'companies'), { withFileTypes: true }).filter(d => d.isDirectory() && !d.name.startsWith('_')).map(d => d.name);
const companies = slugs.map(loadCompany).sort((a, b) => String(a.number).localeCompare(String(b.number)));
for (const k of companies) if (!site.categories.some(x => x.id === k.category)) errors.push(`${k.slug}: unknown category "${k.category}" (see site.json)`);
const report = companies.map(c => `${c.slug}: ${renderCompany(c, companies).join(', ')}`);
const artOf = (c, f) => makeCtx(c).art(f);
fs.writeFileSync(path.join(OUT, 'index.html'), head({ title: site.title, description: site.description }) + masthead(companies, '/') + `<main>${home(site, companies, artOf)}</main>` + footer(companies, null) + '<script defer src="/assets/js/runtime.js"></script>\n</body>\n</html>\n');
copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
fs.writeFileSync(path.join(OUT, '404.html'), head({ title: 'Not found · Spectre Brands', description: 'Page not found' }) + masthead(companies, '') + '<main><section><div class="wrap"><h2>Nothing is buried here.</h2><p class="lede"><a href="/">Back to the index</a></p></div></section></main></body></html>');

warnings.forEach(w => console.warn('warning:', w));
if (errors.length) { errors.forEach(e => console.error('error:', e)); process.exit(1); }
console.log('Built', companies.length, 'post-mortems into dist/\n' + report.join('\n'));

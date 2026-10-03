#!/usr/bin/env node
// `npm run check`: build, link check and a Playwright smoke test at 375 and 1280.
//   1. node build.mjs must succeed.
//   2. Every internal href/src in dist/**/*.html must resolve to a file, and every #fragment to an id.
//   3. Every page is opened at 375px and 1280px: no console errors, no failed requests, no broken
//      images, no horizontal scroll.
// Flags: --external also checks external links (slow; network), --no-browser skips step 3.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { serve } from './dev.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const args = new Set(process.argv.slice(2));
const problems = [];
const bad = (where, msg) => problems.push(`${where}: ${msg}`);

console.log('1/3 build');
const only = process.argv.indexOf('--only');
execFileSync(process.execPath, ['build.mjs', ...(only > 0 ? ['--only', process.argv[only + 1]] : [])], { cwd: ROOT, stdio: 'inherit' });

console.log('2/3 links');
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p) : f.name.endsWith('.html') && pages.push(p); } })(DIST);
const idsOf = {}, external = new Set();
const html = Object.fromEntries(pages.map(p => [p, fs.readFileSync(p, 'utf8')]));
for (const p of pages) idsOf[p] = new Set([...html[p].matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const resolve = u => { let f = path.join(DIST, decodeURIComponent(u)); if (u.endsWith('/')) f = path.join(f, 'index.html'); return f; };
let nLinks = 0;
for (const p of pages) {
  const rel = '/' + path.relative(DIST, p);
  const refs = [...html[p].matchAll(/\s(?:href|src|poster)="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&'))
    .concat([...html[p].matchAll(/\ssrcset="([^"]+)"/g)].flatMap(m => m[1].split(',').map(s => s.trim().split(/\s+/)[0])));
  for (const u of refs) {
    if (/^(data:|mailto:|tel:|javascript:)/.test(u)) continue;
    if (/^https?:\/\//.test(u)) { if (!u.startsWith('https://spectre-brands.vercel.app')) external.add(u); continue; }
    if (!u.startsWith('/') && !u.startsWith('#')) continue; // meta content values that are not URLs
    nLinks++;
    const [file, frag] = u.split('#');
    const target = file ? resolve(file.split('?')[0]) : p;
    if (!fs.existsSync(target)) { bad(rel, `broken link ${u}`); continue; }
    if (frag && target.endsWith('.html') && !idsOf[target]?.has(frag)) bad(rel, `missing anchor ${u}`);
  }
}
console.log(`   ${pages.length} pages, ${nLinks} internal references, ${external.size} external URLs`);

if (args.has('--external')) {
  console.log('   checking external links...');
  const list = [...external].filter(u => !/fonts\.g|youtube-nocookie\.com\/embed|archive\.org\/embed/.test(u));
  let i = 0;
  const worker = async () => { while (i < list.length) { const u = list[i++]; try {
    const r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; SpectreBrands-linkcheck/1.0)' }, signal: AbortSignal.timeout(25000) });
    if (r.status >= 400 && ![401, 403, 429, 999].includes(r.status)) bad('external', `${r.status} ${u}`);
  } catch (e) { bad('external', `${e.name} ${u}`); } } };
  await Promise.all(Array.from({ length: 8 }, worker));
}

if (!args.has('--no-browser')) {
  console.log('3/3 browser smoke test (375, 1280)');
  const { chromium } = await import('playwright');
  const server = serve(4173);
  const browser = await chromium.launch();
  const urls = pages.map(p => '/' + path.relative(DIST, p).replace(/index\.html$/, '')).filter(u => u !== '/404.html');
  const run = async (u, width) => {
    const ctx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const where = `${u} @${width}`;
    page.on('console', m => { if (m.type() === 'error') bad(where, `console error: ${m.text().slice(0, 200)}`); });
    page.on('pageerror', e => bad(where, `page error: ${String(e).slice(0, 200)}`));
    page.on('requestfailed', r => { if (!/ERR_ABORTED/.test(r.failure()?.errorText || '')) bad(where, `request failed: ${r.url()}`); });
    page.on('response', r => { if (r.status() >= 400) bad(where, `HTTP ${r.status()}: ${r.url()}`); });
    await page.goto('http://localhost:4173' + u, { waitUntil: 'load' });
    // scroll through the page so lazy images, charts and the map initialise
    await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 700) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } scrollTo({ top: 0, behavior: 'instant' }); });
    await page.waitForLoadState('networkidle').catch(() => {});
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc),
      noAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length
    }));
    if (r.overflow > 1) bad(where, `horizontal scroll (${r.overflow}px wider than the viewport)`);
    r.brokenImgs.forEach(s => bad(where, `broken image ${s}`));
    if (r.noAlt) bad(where, `${r.noAlt} image(s) without alt`);
    await ctx.close();
  };
  const jobs = urls.flatMap(u => [375, 1280].map(w => [u, w]));
  let j = 0;
  await Promise.all(Array.from({ length: 4 }, async () => { while (j < jobs.length) { const [u, w] = jobs[j++]; await run(u, w); } }));
  await browser.close(); server.close();
  console.log(`   ${urls.length} pages × 2 widths`);
}

if (problems.length) { console.error(`\n${problems.length} problem(s):`); [...new Set(problems)].forEach(p => console.error('  ✗ ' + p)); process.exit(1); }
console.log('\ncheck passed');

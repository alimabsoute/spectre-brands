#!/usr/bin/env node
// Screenshot every page at 375/768/1280/1440: one full-page image plus one image per section.
// Usage: node scripts/shots.mjs <outDir> [--sections [timeline,gallery]] [--widths 375,1280] [--only /radioshack/]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { serve } from './dev.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const argv = process.argv.slice(2);
const out = path.resolve(argv[0] || 'docs/qa');
const opt = k => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
const widths = (opt('--widths') || '375,768,1280,1440').split(',').map(Number);
const only = opt('--only');
const sections = argv.includes('--sections');
const secIds = sections && opt('--sections') && !opt('--sections').startsWith('--') ? opt('--sections').split(',') : null;
const quality = +(opt('--quality') || 42);

const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p) : f.name === 'index.html' && pages.push('/' + path.relative(DIST, p).replace(/\\/g, '/').replace(/index\.html$/, '')); } })(DIST);
const urls = pages.filter(u => !only || only.split(',').includes(u)).sort();
fs.mkdirSync(out, { recursive: true });
const server = serve(4174);
const browser = await chromium.launch();
const name = u => u === '/' ? 'home' : u.replace(/^\/|\/$/g, '').replace(/\//g, '_');
const report = [];
const jobs = urls.flatMap(u => widths.map(w => [u, w]));
let j = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (j < jobs.length) {
    const [u, w] = jobs[j++];
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:4174' + u, { waitUntil: 'load' });
    // sections use content-visibility:auto (skipped until near the viewport); force them on for a full-page capture
    await page.addStyleTag({ content: '.sec,.more{content-visibility:visible!important}' });
    await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 90)); } scrollTo({ top: 0, behavior: 'instant' }); });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(900);
    const shot = await page.screenshot({ fullPage: true, type: 'jpeg', quality: 80 });
    // full pages are stored at reduced scale to keep the repo small; they are for layout review
    const scale = w >= 1280 ? 0.4 : w >= 768 ? 0.5 : 0.7;
    await sharp(shot, { limitInputPixels: false }).resize({ width: Math.round(w * scale) }).jpeg({ quality, mozjpeg: true }).toFile(path.join(out, `${name(u)}-${w}.jpg`));
    report.push({ page: u, width: w, ...(await page.evaluate(() => {
      const de = document.documentElement, vw = de.clientWidth;
      const emptyVisuals = [...document.querySelectorAll('.chap-vis-in')].filter(e => e.getBoundingClientRect().height < 80).length;
      const emptyCells = [...document.querySelectorAll('.gcell, .card, .entry, .vid-frame')].filter(e => e.getBoundingClientRect().height < 20).length;
      const wide = [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > vw + 1 && !e.closest('.tbl-scroll, .wb-strip, .fork-tabs, .pn-groups, .filters, .shot, .r-nav, svg, .cmpr, .yard, .tlx-area, .tlx-era, .tl-filters'); }).length;
      return { height: de.scrollHeight, horizontalOverflow: de.scrollWidth - vw, background: getComputedStyle(document.body).backgroundColor, emptyChapterVisuals: emptyVisuals, emptyBoxes: emptyCells, elementsPastViewport: wide, brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth && i.currentSrc).length };
    })) });
    if (sections) {
      const ids = await page.evaluate(() => [...document.querySelectorAll('main > [id]')].map(s => s.id));
      for (const id of ids.filter(i => !secIds || secIds.includes(i))) {
        const el = page.locator('#' + id).first();
        await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
        await el.screenshot({ path: path.join(out, `${name(u)}-${w}-${id}.jpg`), type: 'jpeg', quality }).catch(() => {});
      }
    }
    await ctx.close();
  }
}));
await browser.close(); server.close();
report.sort((a, b) => a.page.localeCompare(b.page) || a.width - b.width);
if (!only) fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
const bad = report.filter(r => r.horizontalOverflow > 1 || r.emptyChapterVisuals || r.emptyBoxes || r.elementsPastViewport || r.brokenImages || r.background !== 'rgb(252, 251, 248)');
bad.forEach(r => console.log('✗', JSON.stringify(r)));
console.log(`${jobs.length} page/width combinations -> ${path.relative(ROOT, out)}; ${bad.length} with layout problems`);

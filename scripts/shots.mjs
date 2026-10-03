#!/usr/bin/env node
// Screenshot every page at 375/768/1280/1440: one full-page image plus one image per section.
// Usage: node scripts/shots.mjs <outDir> [--sections] [--widths 375,1280] [--only /radioshack/]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from './dev.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const argv = process.argv.slice(2);
const out = path.resolve(argv[0] || 'docs/qa');
const opt = k => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
const widths = (opt('--widths') || '375,768,1280,1440').split(',').map(Number);
const only = opt('--only');
const sections = argv.includes('--sections');
const quality = +(opt('--quality') || 60);

const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p) : f.name === 'index.html' && pages.push('/' + path.relative(DIST, p).replace(/index\.html$/, '')); } })(DIST);
const urls = pages.filter(u => !only || only.split(',').includes(u)).sort();
fs.mkdirSync(out, { recursive: true });
const server = serve(4174);
const browser = await chromium.launch();
const name = u => u === '/' ? 'home' : u.replace(/^\/|\/$/g, '').replace(/\//g, '_');
const jobs = urls.flatMap(u => widths.map(w => [u, w]));
let j = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (j < jobs.length) {
    const [u, w] = jobs[j++];
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:4174' + u, { waitUntil: 'load' });
    await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 90)); } scrollTo({ top: 0, behavior: 'instant' }); });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(out, `${name(u)}-${w}.jpg`), fullPage: true, type: 'jpeg', quality });
    if (sections) {
      const ids = await page.evaluate(() => [...document.querySelectorAll('main > section[id], main > header[id]')].map(s => s.id));
      for (const id of ids) {
        const el = page.locator('#' + id).first();
        await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
        await el.screenshot({ path: path.join(out, `${name(u)}-${w}-${id}.jpg`), type: 'jpeg', quality }).catch(() => {});
      }
    }
    await ctx.close();
  }
}));
await browser.close(); server.close();
console.log(`${jobs.length} page/width combinations -> ${path.relative(ROOT, out)}`);

#!/usr/bin/env node
// Measure the rendered height of one element on every brand page (or the whole page) at 375 and 1280.
// Usage: node scripts/measure.mjs '#timeline'     (omit the selector to measure page height)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from './dev.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sel = process.argv[2] || 'html';
const slugs = fs.readdirSync(path.join(ROOT, 'companies')).filter(s => !s.startsWith('_'));
const server = serve(4175), browser = await chromium.launch();
const rows = [];
for (const width of [375, 1280]) {
  const page = await (await browser.newContext({ viewport: { width, height: 800 } })).newPage();
  for (const s of slugs) {
    await page.goto(`http://localhost:4175/${s}/`, { waitUntil: 'load' });
    await page.addStyleTag({ content: '.sec,.more{content-visibility:visible!important}' });
    await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 700) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 40)); } });
    await page.waitForLoadState('networkidle').catch(() => {});
    rows.push({ slug: s, width, height: await page.evaluate(q => Math.round(document.querySelector(q)?.getBoundingClientRect().height ?? -1), sel) });
  }
}
await browser.close(); server.close();
for (const s of slugs) console.log(s.padEnd(18), ...[375, 1280].map(w => `${w}: ${String(rows.find(r => r.slug === s && r.width === w).height).padStart(6)}px`));
for (const w of [375, 1280]) console.log(`max @${w}: ${Math.max(...rows.filter(r => r.width === w).map(r => r.height))}px`);

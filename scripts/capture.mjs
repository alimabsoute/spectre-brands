#!/usr/bin/env node
// Screenshot an Internet Archive capture at 1280px wide without the Wayback toolbar, and save it as
// AVIF + JPEG. Usage:
//   node scripts/capture.mjs <wayback-url> <output-stem> [--height 1400] [--wait 4000]
//   e.g. node scripts/capture.mjs https://web.archive.org/web/20000229000000/http://www.pets.com/ companies/pets-com/img/archive-2000-02-home
// The "if_" form of the URL (no toolbar) is used automatically. Prints the final capture timestamp.
import { chromium } from 'playwright';
import sharp from 'sharp';
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(k); return i < 0 ? d : a[i + 1]; };
const [url, stem] = a;
if (!url || !stem) { console.error('usage: node scripts/capture.mjs <wayback-url> <output-stem> [--height N] [--wait ms]'); process.exit(1); }
const frame = url.replace(/\/web\/(\d+)(?:[a-z]{2}_)?\//, '/web/$1if_/');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: +opt('--height', 1400) } });
try {
  const r = await p.goto(frame, { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(+opt('--wait', 4000));
  const final = p.url();
  const png = await p.screenshot({ type: 'png' });
  await sharp(png).resize({ width: 1280 }).avif({ quality: 45 }).toFile(stem + '.avif');
  await sharp(png).resize({ width: 1280 }).jpeg({ quality: 68, mozjpeg: true }).toFile(stem + '.jpg');
  console.log(`HTTP ${r.status()} ${final}\ncapture timestamp: ${(final.match(/\/web\/(\d+)/) || [])[1]}\nwrote ${stem}.avif + .jpg`);
} catch (e) { console.error('capture failed:', e.message); process.exitCode = 1; }
await b.close();

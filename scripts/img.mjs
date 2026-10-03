#!/usr/bin/env node
// Convert an image to AVIF plus a JPEG (or PNG, with --png) fallback with the same basename.
// Usage: node scripts/img.mjs <input> <output-stem> [--width 1280] [--png] [--quality 50]
//   e.g. node scripts/img.mjs /tmp/raw.png companies/zima/img/bottle-1994 --width 900
//   -> companies/zima/img/bottle-1994.avif + bottle-1994.jpg
// With --fallbacks <dir> it writes the missing .jpg next to every .avif/.webp in <dir>.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(k); return i < 0 ? d : a[i + 1]; };
if (a[0] === '--fallbacks') {
  for (const f of fs.readdirSync(a[1])) {
    if (!/\.(avif|webp)$/.test(f)) continue;
    const stem = path.join(a[1], f.replace(/\.(avif|webp)$/, ''));
    if (fs.existsSync(stem + '.jpg') || fs.existsSync(stem + '.png')) continue;
    await sharp(path.join(a[1], f)).flatten({ background: '#ffffff' }).jpeg({ quality: 72, mozjpeg: true }).toFile(stem + '.jpg');
    console.log('wrote', stem + '.jpg');
  }
} else {
  const [input, stem] = a, width = +opt('--width', 1280), q = +opt('--quality', 50);
  if (!input || !stem) { console.error('usage: node scripts/img.mjs <input> <output-stem> [--width N] [--png]'); process.exit(1); }
  const base = sharp(input).rotate().resize({ width, withoutEnlargement: true });
  await base.clone().avif({ quality: q }).toFile(stem + '.avif');
  if (a.includes('--png')) await base.clone().png({ compressionLevel: 9, palette: true }).toFile(stem + '.png');
  else await base.clone().flatten({ background: '#ffffff' }).jpeg({ quality: 74, mozjpeg: true }).toFile(stem + '.jpg');
  const m = await sharp(stem + '.avif').metadata();
  console.log(`${stem}.avif ${m.width}x${m.height} ${(fs.statSync(stem + '.avif').size / 1024).toFixed(0)}KB + fallback`);
}

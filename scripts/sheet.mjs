#!/usr/bin/env node
// Contact sheet: slice a tall full-page screenshot into side-by-side columns for review.
// Usage: node scripts/sheet.mjs <in.jpg> <out.jpg> [columnWidth=380] [columns=5]
import sharp from 'sharp';
const [src, out, cw = 380, cols = 5] = process.argv.slice(2);
const m = await sharp(src).metadata();
const buf = await sharp(src).resize({ width: +cw }).toBuffer();
const H = (await sharp(buf).metadata()).height, colH = Math.ceil(H / +cols);
const parts = [];
for (let i = 0; i < +cols; i++) {
  const top = i * colH, h = Math.min(colH, H - top); if (h <= 0) break;
  parts.push({ input: await sharp(buf).extract({ left: 0, top, width: +cw, height: h }).toBuffer(), left: i * (+cw + 8), top: 0 });
}
await sharp({ create: { width: parts.length * (+cw + 8), height: colH, channels: 3, background: '#888' } }).composite(parts).jpeg({ quality: 70 }).toFile(out);

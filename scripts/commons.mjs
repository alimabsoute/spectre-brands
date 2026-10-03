#!/usr/bin/env node
// Look up a Wikimedia Commons file's license and author, and optionally download and convert it.
// Usage: node scripts/commons.mjs "File:Blockbuster Bend Oregon.jpg" [output-stem] [--width 1200]
// Prints license, author, credit line and source URL. Only use files whose license is public domain,
// CC0, CC BY or CC BY-SA, and copy the printed credit into the gallery item's "credit" field.
// Logos on Commons are usually "PD-textlogo" (public domain for copyright, still trademarked).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const a = process.argv.slice(2), title = a[0], stem = a[1] && !a[1].startsWith('--') ? a[1] : null;
const width = a.includes('--width') ? +a[a.indexOf('--width') + 1] : 1200;
const UA = { 'user-agent': 'SpectreBrands-research/1.0 (static editorial site; github.com/alimabsoute/spectre-brands)' };
const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=${width}&titles=${encodeURIComponent(title)}`;
const j = await (await fetch(api, { headers: UA })).json();
const page = Object.values(j.query.pages)[0];
if (!page.imageinfo) { console.error('not found on Commons:', title); process.exit(1); }
const i = page.imageinfo[0], m = i.extmetadata, strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const license = strip(m.LicenseShortName?.value), author = strip(m.Artist?.value) || 'unknown author';
console.log(`title:   ${page.title}\nlicense: ${license}  ${m.LicenseUrl?.value || ''}\nauthor:  ${author}\nsize:    ${i.width}x${i.height} ${i.mime}\npage:    ${i.descriptionurl}`);
console.log(`credit:  Photo: ${author}, via [Wikimedia Commons](${i.descriptionurl}), ${license}.`);
const ok = /^(public domain|pd|cc0|cc by|cc-by)/i.test(license);
if (!ok) console.log('WARNING: this license is not clearly free. Do not use the file unless it is PD, CC0, CC BY or CC BY-SA.');
if (stem && ok) {
  const src = i.mime === 'image/svg+xml' ? i.thumburl : (i.thumburl || i.url);
  const buf = Buffer.from(await (await fetch(src, { headers: UA })).arrayBuffer());
  const tmp = `/tmp/commons-${process.pid}`; fs.writeFileSync(tmp, buf);
  console.log(execFileSync(process.execPath, ['scripts/img.mjs', tmp, stem, '--width', String(width)], { encoding: 'utf8' }).trim());
  fs.unlinkSync(tmp);
}

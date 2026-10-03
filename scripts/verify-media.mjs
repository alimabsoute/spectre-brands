#!/usr/bin/env node
// Verify that every embedded video still exists and can be embedded.
// YouTube: the oEmbed endpoint returns 200 for public, embeddable videos (401/403/404 otherwise).
// Internet Archive: /metadata/<identifier> must return a non-empty object with files.
// Usage: node scripts/verify-media.mjs [slug ...]     exit code 1 if any video fails
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2);
const UA = { 'user-agent': 'Mozilla/5.0 (compatible; SpectreBrands-mediacheck/1.0)' };
let bad = 0, n = 0;
for (const slug of fs.readdirSync(path.join(ROOT, 'companies'))) {
  if (slug.startsWith('_') || (only.length && !only.includes(slug))) continue;
  const f = path.join(ROOT, 'companies', slug, 'sections/videos.json');
  if (!fs.existsSync(f)) { console.log(`✗ ${slug}: no videos.json`); bad++; continue; }
  for (const v of JSON.parse(fs.readFileSync(f, 'utf8')).videos) {
    n++;
    let ok = false, info = '';
    try {
      if ((v.provider || 'youtube') === 'youtube') {
        const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.embedId}&format=json`, { headers: UA });
        ok = r.status === 200; info = ok ? (await r.json()).title : `HTTP ${r.status}`;
      } else if (v.provider === 'archive') {
        const j = await (await fetch(`https://archive.org/metadata/${v.embedId}`, { headers: UA })).json();
        ok = !!(j.files && j.files.length && j.metadata); info = ok ? `${j.metadata.title} (${j.metadata.mediatype})` : 'no such item';
        if (ok && !['movies', 'audio', 'texts', 'image'].includes(j.metadata.mediatype)) { ok = false; info += ' is not embeddable media'; }
      } else if (v.provider === 'vimeo') {
        const r = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${v.embedId}`, { headers: UA });
        ok = r.status === 200; info = ok ? (await r.json()).title : `HTTP ${r.status}`;
      }
    } catch (e) { info = e.message; }
    if (!ok) bad++;
    console.log(`${ok ? '✓' : '✗'} ${slug}/${v.id} [${v.provider || 'youtube'}:${v.embedId}] ${info}`);
  }
}
console.log(`\n${n} videos checked, ${bad} failed`);
process.exit(bad ? 1 : 0);

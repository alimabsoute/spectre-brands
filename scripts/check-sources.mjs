#!/usr/bin/env node
// Check that every URL cited in sources.json files still resolves. Slow (network).
// Usage: node scripts/check-sources.mjs [slug ...]   Writes docs/qa/sources.json with the results.
// 401/403/429 are reported as "blocked" (the site refuses bots; open it in a browser), not as dead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2);
const jobs = [];
for (const slug of fs.readdirSync(path.join(ROOT, 'companies'))) {
  if (slug.startsWith('_') || (only.length && !only.includes(slug))) continue;
  const f = path.join(ROOT, 'companies', slug, 'sections/sources.json');
  if (!fs.existsSync(f)) continue;
  for (const s of JSON.parse(fs.readFileSync(f, 'utf8')).list)
    for (const m of String(s.text).matchAll(/\]\((https?:[^)\s]+)\)/g)) jobs.push({ slug, id: s.id, url: m[1] });
}
const UA = u => /sec\.gov/.test(u) ? 'Spectre Brands research contact@spectrebrands.com' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const res = []; let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < jobs.length) {
    const j = jobs[i++]; let status = 0, note = '';
    for (let attempt = 0; attempt < 2 && !(status >= 200 && status < 400); attempt++) {
      try { const r = await fetch(j.url, { redirect: 'follow', headers: { 'user-agent': UA(j.url), accept: 'text/html,*/*' }, signal: AbortSignal.timeout(30000) }); status = r.status; }
      catch (e) { note = e.name; }
      if (/sec\.gov/.test(j.url)) await new Promise(r => setTimeout(r, 400));
    }
    res.push({ ...j, status, state: status >= 200 && status < 400 ? 'ok' : [401, 403, 429, 999].includes(status) ? 'blocked' : 'dead', note });
  }
}));
const by = s => res.filter(r => r.state === s);
for (const r of by('dead')) console.log(`✗ ${r.slug} [${r.id}] ${r.status || r.note} ${r.url}`);
for (const r of by('blocked')) console.log(`? ${r.slug} [${r.id}] ${r.status} (refuses automated requests) ${r.url}`);
console.log(`\n${res.length} source URLs: ${by('ok').length} ok, ${by('blocked').length} blocked to bots, ${by('dead').length} dead`);
if (!only.length) { fs.mkdirSync(path.join(ROOT, 'docs/qa'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'docs/qa/sources.json'), JSON.stringify(res.filter(r => r.state !== 'ok'), null, 1)); }

#!/usr/bin/env node
// Frozen-facts guard for copy edits. For each brand (companies/<slug>/**.json) and site.json it extracts the
// multiset of numbers, footnote markers ([^n]) and direct quotations (“…”), and the per-file footnote counts.
//   node scripts/facts.mjs --write    write facts/<slug>.json (the frozen baseline)
//   node scripts/facts.mjs            compare the current content with facts/ and exit 1 on any difference
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.json') ? [path.join(d, e.name)] : []);
const strings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (Array.isArray(o)) o.forEach(v => strings(v, out)); else if (o && typeof o === 'object') Object.values(o).forEach(v => strings(v, out)); return out; };
const bag = a => a.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
function extract(files) {
  const nums = [], notes = [], quotes = [], perFile = {};
  for (const f of files) {
    const ss = strings(JSON.parse(fs.readFileSync(f, 'utf8')));
    let n = 0;
    for (const s0 of ss) {
      if (/^(https?:|\/|#|var\()/.test(s0)) continue;
      const fn = s0.match(/\[\^[\w-]+\]/g) || []; notes.push(...fn); n += fn.length;
      const s = s0.replace(/\[\^[\w-]+\]/g, '');
      nums.push(...(s.match(/\$?\d[\d,]*(?:\.\d+)?(?:%|[MBK]\b)?/g) || []).map(x => x.replace(/,/g, '')));
      quotes.push(...(s.match(/“[^”]{3,}”/g) || []));
    }
    perFile[path.relative(ROOT, f)] = n;
  }
  return { numbers: bag(nums), footnotes: bag(notes), quotes: bag(quotes), footnoteCountByFile: perFile };
}
const units = fs.readdirSync(path.join(ROOT, 'companies')).filter(s => !s.startsWith('_') && fs.statSync(path.join(ROOT, 'companies', s)).isDirectory())
  .map(s => [s, walk(path.join(ROOT, 'companies', s))]).concat([['site', [path.join(ROOT, 'site.json')]]]);
const dir = path.join(ROOT, 'facts');
if (process.argv.includes('--write')) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [s, files] of units) fs.writeFileSync(path.join(dir, `${s}.json`), JSON.stringify(extract(files), null, 1) + '\n');
  console.log(`wrote ${units.length} facts files to facts/`); process.exit(0);
}
let bad = 0;
const diffBag = (a, b) => { const out = []; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if ((a[k] || 0) !== (b[k] || 0)) out.push(`${k}: ${a[k] || 0} → ${b[k] || 0}`); return out; };
for (const [s, files] of units) {
  const f = path.join(dir, `${s}.json`); if (!fs.existsSync(f)) { console.log(`${s}: no frozen facts`); bad++; continue; }
  const A = JSON.parse(fs.readFileSync(f, 'utf8')), B = extract(files);
  const d = { numbers: diffBag(A.numbers, B.numbers), footnotes: diffBag(A.footnotes, B.footnotes), quotes: diffBag(A.quotes, B.quotes), perFile: diffBag(A.footnoteCountByFile, B.footnoteCountByFile) };
  const n = Object.values(d).reduce((a, x) => a + x.length, 0);
  if (n) { bad++; console.log(`✗ ${s}`); for (const [k, v] of Object.entries(d)) if (v.length) console.log(`   ${k}: ${v.slice(0, 12).join(' | ')}${v.length > 12 ? ` … (+${v.length - 12})` : ''}`); }
}
console.log(bad ? `facts diff: ${bad} unit(s) changed` : `facts diff: empty (${units.length} units)`); process.exit(bad ? 1 : 0);

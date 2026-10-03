#!/usr/bin/env node
// Lighthouse (mobile) for every page of dist/. Prints a table and writes docs/qa/lighthouse.json.
// Usage: node scripts/lighthouse.mjs [/path/ ...] [--runs 1]
// Thresholds: Performance >= 85, Accessibility >= 95, Best Practices >= 95, SEO >= 95.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { serve } from './dev.mjs';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const argv = process.argv.slice(2), want = argv.filter(a => a.startsWith('/'));
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p) : f.name === 'index.html' && pages.push('/' + path.relative(DIST, p).replace(/index\.html$/, '')); } })(DIST);
const urls = (want.length ? want : pages).sort();
const server = serve(4175);
const PORT = 9333;
const browser = await chromium.launch({ args: [`--remote-debugging-port=${PORT}`] });
const MIN = { performance: 85, accessibility: 95, 'best-practices': 95, seo: 95 };
const out = {}; let fail = 0;
for (const u of urls) {
  const r = await lighthouse('http://localhost:4175' + u, { port: PORT, output: 'json', logLevel: 'error', onlyCategories: Object.keys(MIN), formFactor: 'mobile' });
  const s = Object.fromEntries(Object.keys(MIN).map(k => [k, Math.round(r.lhr.categories[k].score * 100)]));
  const a = r.lhr.audits;
  out[u] = { ...s, lcp: Math.round(a['largest-contentful-paint'].numericValue), cls: +a['cumulative-layout-shift'].numericValue.toFixed(3), tbt: Math.round(a['total-blocking-time'].numericValue),
    failed: Object.values(a).filter(x => x.score !== null && x.score < 0.9 && ['binary', 'numeric', 'metricSavings'].includes(x.scoreDisplayMode) && !/^(largest|first|speed|total-b|interactive|max-pot|cumul)/.test(x.id)).map(x => x.id) };
  const bad = Object.keys(MIN).filter(k => s[k] < MIN[k]);
  if (bad.length) fail++;
  console.log(`${bad.length ? '✗' : '✓'} ${u.padEnd(26)} perf ${s.performance}  a11y ${s.accessibility}  bp ${s['best-practices']}  seo ${s.seo}  LCP ${out[u].lcp}ms CLS ${out[u].cls} TBT ${out[u].tbt}ms${out[u].failed.length ? '  [' + out[u].failed.join(', ') + ']' : ''}`);
}
await browser.close(); server.close();
if (!want.length) { fs.mkdirSync(path.join(ROOT, 'docs/qa'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'docs/qa/lighthouse.json'), JSON.stringify(out, null, 1)); }
console.log(`\n${urls.length} pages, ${fail} below threshold`);
process.exit(fail ? 1 : 0);

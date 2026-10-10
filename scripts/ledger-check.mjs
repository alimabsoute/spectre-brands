#!/usr/bin/env node
// Checks research/<slug>/claims.jsonl: schema, quote-in-snapshot match, snapshot hash, cross-vendor verification.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const SNAP = process.env.SNAP_DIR || '/workspace/spectre-research';
const vendor = m => /claude|opus|sonnet/i.test(m||'') ? 'anthropic' : /gpt|codex|o\d/i.test(m||'') ? 'openai' : /grok/i.test(m||'') ? 'xai' : 'unknown';
const norm = s => s.normalize('NFKC').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync('research').filter(d => fs.existsSync(`research/${d}/claims.jsonl`));
let bad = 0, n = 0; const summary = {};
for (const slug of slugs) {
  const f = `research/${slug}/claims.jsonl`; if (!fs.existsSync(f)) continue;
  const s = summary[slug] = { total: 0, verified: 0, proposed: 0, rejected: 0, gaps: 0, errors: 0 };
  const ids = new Set();
  fs.readFileSync(f, 'utf8').split('\n').filter(l => l.trim()).forEach((l, i) => {
    n++; s.total++; let e; const err = m => { s.errors++; bad++; console.error(`${f}:${i+1} ${e?.id||''} ${m}`); };
    try { e = JSON.parse(l); } catch { return err('invalid JSON'); }
    if (ids.has(e.id)) err('duplicate id'); ids.add(e.id);
    s[e.status] = (s[e.status]||0) + 1; if (e.kind === 'gap') { s.gaps++; return; }
    for (const k of ['id','claim','kind','source','quote','snapshot','sha256','author','status']) if (!e[k]) err(`missing ${k}`);
    if (!e.source?.url) err('missing source.url');
    const p = path.join(SNAP, e.snapshot || '');
    if (!e.snapshot || !fs.existsSync(p)) return err(`snapshot not found: ${e.snapshot}`);
    const buf = fs.readFileSync(p);
    if (crypto.createHash('sha256').update(buf).digest('hex') !== e.sha256) err('sha256 mismatch');
    if (!norm(buf.toString('utf8')).includes(norm(e.quote||''))) err('quote not found in snapshot');
    if (e.status === 'verified') {
      if (!e.verifier) err('verified without verifier');
      else if (vendor(e.verifier) === vendor(e.author)) err(`verifier ${e.verifier} same vendor as author ${e.author}`);
    }
  });
}
console.log(`ledger-check: ${n} entries`, JSON.stringify(summary));
if (bad) { console.error(`ledger-check: ${bad} errors`); process.exit(1); }

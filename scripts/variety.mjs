#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSections } from '../lib/registry.mjs';
import { connectionsFor } from '../lib/viz/connections.mjs';
import { readLedger } from '../lib/ledger.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ledger = readLedger(ROOT), data = Object.fromEntries(['entities', 'edges'].map(key => {
  const file = path.join(ROOT, 'data', `${key}.json`);
  return [key, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []];
}));
const companies = fs.readdirSync(path.join(ROOT, 'companies')).filter(s => !s.startsWith('_')).map(slug => {
  const dir = path.join(ROOT, 'companies', slug), c = JSON.parse(fs.readFileSync(path.join(dir, 'company.json'), 'utf8'));
  c.slug = slug; c.sections = {};
  for (const f of fs.readdirSync(path.join(dir, 'sections'))) if (f.endsWith('.json')) c.sections[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, 'sections', f), 'utf8'));
  return c;
});
const pages = companies.map(c => {
  const connection = connectionsFor(c, data, companies, ROOT, ledger);
  if (connection) c.sections.connections = connection;
  const order = resolveSections(c), variants = order.map(id => `${id}:${c.sections[id].variant || (id === 'timeline' && c.sections[id].animated ? 'animated' : 'default')}`), signature = c.signature || 'unspecified';
  return { slug: c.slug, order, variants, signature, shape: `${variants.join('>')}|${signature}` };
});
const counts = key => Object.fromEntries([...new Set(pages.map(p => p[key]))].map(k => [k, pages.filter(p => p[key] === k).length]));
if (process.argv.includes('--json')) console.log(JSON.stringify({ pages, signatures: counts('signature'), shapes: counts('shape') }, null, 2));
else {
  pages.forEach(p => console.log(`${p.slug}: ${p.order.join(' > ')}; variants ${p.variants.join(', ')}; signature ${p.signature}`));
  console.log('Signatures:', JSON.stringify(counts('signature')));
  console.log('Shapes:', JSON.stringify(counts('shape')));
  for (const [signature, n] of Object.entries(counts('signature'))) if (n > 8) console.warn(`warning: signature ${signature} is shared by ${n}/${pages.length} pages (advisory cap 8)`);
}

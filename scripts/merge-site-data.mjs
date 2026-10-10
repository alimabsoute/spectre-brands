#!/usr/bin/env node
// Merge research/<slug>/site-data.json fragments into data/glossary.json, data/entities.json, data/edges.json.
// Dedupes by id (glossary, entities) and by from|to|type (edges, evidence unioned). Re-run after each page.
import fs from 'node:fs';
const read = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d;
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const out = { glossary: new Map(), entities: new Map(), edges: new Map() };
for (const slug of fs.readdirSync('research').filter(d => fs.existsSync(`research/${d}/site-data.json`)).sort()) {
  const d = read(`research/${slug}/site-data.json`, {});
  for (const g of d.glossary || []) { const id = g.id || slugify(g.term); if (!out.glossary.has(id)) out.glossary.set(id, { id, term: g.term, aliases: g.aliases || [], def: g.def }); }
  for (const e of d.entities || []) { const prev = out.entities.get(e.id); out.entities.set(e.id, { ...e, ...prev, slug: prev?.slug || e.slug }); }
  for (const e of d.edges || []) {
    const k = `${e.from}|${e.to}|${e.type}`, prev = out.edges.get(k);
    if (!prev) out.edges.set(k, { ...e, evidence: [...(e.evidence || [])] });
    else for (const ev of e.evidence || []) if (!prev.evidence.some(x => JSON.stringify(x) === JSON.stringify(ev))) prev.evidence.push(ev);
  }
}
for (const [k, m] of Object.entries(out)) fs.writeFileSync(`data/${k}.json`, JSON.stringify([...m.values()], null, 2) + '\n');
console.log(Object.fromEntries(Object.entries(out).map(([k, m]) => [k, m.size])));

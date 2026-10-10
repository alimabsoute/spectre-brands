import fs from 'node:fs';
import path from 'node:path';
import { esc, fn } from '../md.mjs';
export function connectionsFor(c, data, companies, root, ledger) {
  const entities = new Map((data.entities || []).map(e => [e.id, e])), pageIDs = new Set([...entities.values()].filter(e => e.slug === c.slug).map(e => e.id));
  const rows = [];
  for (const edge of data.edges || []) {
    if (edge.status !== 'verified' || !edge.evidence?.length || (!pageIDs.has(edge.from) && !pageIDs.has(edge.to))) continue;
    const from = entities.get(edge.from), to = entities.get(edge.to);
    if (!from || !to) continue;
    const evidence = edge.evidence.flatMap(ev => {
      if (ev.ledger) { const e = ledger.all.get(ev.ledger); return e?.status === 'verified' && e.fn != null ? [{ slug: e.slug, fn: e.fn }] : []; }
      return ev.slug && ev.fn != null ? [ev] : [];
    });
    if (!evidence.length || evidence.some(ev => {
      const p = path.join(root, 'companies', ev.slug, 'sections/sources.json');
      return !fs.existsSync(p) || !JSON.parse(fs.readFileSync(p, 'utf8')).list.some(s => String(s.id) === String(ev.fn));
    })) continue;
    const name = e => e.slug && companies.some(c => c.slug === e.slug) ? `<a href="/${esc(e.slug)}/">${esc(e.name)}</a>` : esc(e.name);
    rows.push([name(from), esc(edge.type), name(to), esc(edge.years || ''), evidence.map(e => e.slug === c.slug ? fn([e.fn]) : `<a href="/${esc(e.slug)}/#src-${e.fn}">Source ${e.fn} (${esc(e.slug)})</a>`).join(' ')]);
  }
  return rows.length >= 2 ? { title: 'Connections', label: 'Connections', rows } : null;
}
export function connections(s) {
  return `<div class="tbl-scroll" tabindex="0" role="region" aria-label="Connections"><table class="cmp"><caption>Verified relationships</caption><thead><tr>${['From', 'Relationship', 'To', 'Years', 'Evidence'].map(c => `<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${s.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

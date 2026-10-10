import fs from 'node:fs';
import path from 'node:path';
export function readLedger(root) {
  const all = new Map(), bySlug = new Map();
  const dir = path.join(root, 'research');
  for (const slug of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const file = path.join(dir, slug, 'claims.jsonl');
    if (!fs.existsSync(file)) continue;
    const entries = fs.readFileSync(file, 'utf8').split('\n').filter(s => s.trim()).map((s, i) => {
      try { return JSON.parse(s); } catch { throw new Error(`${file}:${i + 1}: invalid ledger JSON`); }
    });
    bySlug.set(slug, entries);
    for (const entry of entries) {
      if (!entry.id) throw new Error(`${file}: missing ledger id`);
      if (all.has(entry.id)) throw new Error(`Duplicate ledger id ${entry.id}`);
      all.set(entry.id, { ...entry, slug });
    }
  }
  return { all, bySlug };
}
export function ledgerReferences(root, ledger = readLedger(root)) {
  const errors = [];
  const scan = (obj, file, slug, at = '') => {
    if (!obj || typeof obj !== 'object') return;
    if (Object.hasOwn(obj, 'ledger')) {
      const ids = Array.isArray(obj.ledger) ? obj.ledger : [obj.ledger];
      for (const id of ids) {
        const e = ledger.all.get(id);
        if (!e || e.status !== 'verified' || e.kind === 'gap') errors.push(`${file}${at}: ledger ${id} is not verified`);
        else if (slug && e.slug !== slug) errors.push(`${file}${at}: ledger ${id} belongs to ${e.slug}`);
      }
    }
    for (const [key, value] of Object.entries(obj)) if (key !== 'ledger') scan(value, file, slug, `${at}.${key}`);
  };
  const walk = (dir, slug) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p, slug);
      else if (f.name.endsWith('.json')) scan(JSON.parse(fs.readFileSync(p, 'utf8')), path.relative(root, p), slug);
    }
  };
  for (const slug of fs.readdirSync(path.join(root, 'companies'))) if (!slug.startsWith('_')) walk(path.join(root, 'companies', slug), slug);
  walk(path.join(root, 'data'));
  return errors;
}
// Resolve ledger-only chart points to the verified entry's existing source number.
export function ledgerSources(obj, ledger) {
  if (!obj || typeof obj !== 'object') return;
  if (obj.ledger) {
    const entries = (Array.isArray(obj.ledger) ? obj.ledger : [obj.ledger]).map(id => ledger.all.get(id)).filter(e => e?.status === 'verified');
    const ids = entries.flatMap(e => e.fn == null ? [] : Array.isArray(e.fn) ? e.fn : [e.fn]);
    if (ids.length) obj.src = [...new Set([...(obj.src || []), ...ids])];
  }
  for (const [key, value] of Object.entries(obj)) if (key !== 'ledger') ledgerSources(value, ledger);
}

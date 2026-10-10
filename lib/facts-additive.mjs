import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readLedger } from './ledger.mjs';
// The pilot's immutable pre-renderer revision; this never rewrites facts/.
export const PILOT_BASE = '99efabee14dc32a3df72ca1ac7745a7438d05194';
// Display-equivalent numbers compare equal: 30.10 == 30.1, 1,296 == 1296.
const canon = n => n.replace(/,/g, '').replace(/(\.\d*?)0+(?=%|[MBK]|$)/, '$1').replace(/\.(?=%|[MBK]|$)/, '');
const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const pad = n => String(n).padStart(2, '0');
function isoDates(t) {
  const out = [];
  for (const m of t.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/gi)) out.push(`${m[3]}-${pad(MON[m[1].toLowerCase()])}-${pad(m[2])}`);
  for (const m of t.matchAll(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,?\s+(\d{4})/gi)) out.push(`${m[3]}-${pad(MON[m[2].toLowerCase()])}-${pad(m[1])}`);
  for (const m of t.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})/gi)) out.push(`${m[2]}-${pad(MON[m[1].toLowerCase()])}`);
  for (const m of t.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)) out.push(`${m[3]}-${pad(m[1])}-${pad(m[2])}`);
  for (const m of t.matchAll(/\b\d{4}-\d{2}(-\d{2})?\b/g)) out.push(m[0]);
  return out;
}
const bag = values => values.reduce((out, value) => (out[value] = (out[value] || 0) + 1, out), {});
export function additiveTokens(obj) {
  const numbers = [], footnotes = [], quotes = [];
  const scan = (value, key = '') => {
    // asOf (date we checked) and recheck (window) are maintenance metadata, not historical claims.
    if (['asOf', 'recheck'].includes(key)) return;
    if (['ledger', 'id', 'src', 'stagePoint', 'featured', 'glossaryOff'].includes(key)) {
      if (key === 'src') for (const n of Array.isArray(value) ? value : [value]) footnotes.push(`[^${n}]`);
      return;
    }
    if (Array.isArray(value)) { value.forEach(v => scan(v)); return; }
    if (value && typeof value === 'object') { Object.entries(value).forEach(([k, v]) => scan(v, k)); return; }
    if (typeof value === 'number') { numbers.push(canon(String(value))); return; }
    if (typeof value !== 'string' || /^(https?:|\/|#|var\()/.test(value)) return;
    if (/^\d{4}-\d{2}(-\d{2})?$/.test(value)) { numbers.push(value); return; } // ISO date field: one token
    footnotes.push(...(value.match(/\[\^[\w-]+\]/g) || []));
    const text = value.replace(/\[\^[\w-]+\]/g, '').replace(/\]\((?:https?:|\/|#)[^)]*\)/g, ']');
    numbers.push(...(text.match(/\$?\d[\d,]*(?:\.\d+)?(?:%|[MBK]\b)?/g) || []).map(canon));
    quotes.push(...(text.match(/“[^”]{3,}”/g) || []));
  };
  scan(obj);
  return { numbers: bag(numbers), footnotes: bag(footnotes), quotes: bag(quotes) };
}
export function additiveDiff(before, after, verified) {
  const allowedNumbers = new Set(), allowedFootnotes = new Set(), allowedQuotes = [];
  for (const e of verified.filter(e => e.status === 'verified' && e.kind !== 'gap')) {
    const tokens = additiveTokens([e.value, e.quote]);
    Object.keys(tokens.numbers).forEach(n => { allowedNumbers.add(n); allowedNumbers.add(n.replace(/^\$/, '').replace(/[%MBK]$/, '')); });
    if (e.accessed) { const d = String(e.accessed).slice(0, 10); allowedNumbers.add(d); allowedNumbers.add(d.slice(0, 4)); allowedNumbers.add(String(+d.slice(8, 10))); } // our own access date
    for (const t of [e.value, e.quote].filter(v => typeof v === 'string')) for (const iso of isoDates(t)) allowedNumbers.add(iso);
    if (e.fn != null) for (const n of Array.isArray(e.fn) ? e.fn : [e.fn]) allowedFootnotes.add(`[^${n}]`);
    allowedQuotes.push(...[e.value, e.quote].filter(v => typeof v === 'string').map(v => v.replace(/[“”]/g, '"')));
  }
  const out = [];
  for (const field of ['numbers', 'footnotes', 'quotes']) {
    for (const token of new Set([...Object.keys(before[field] || {}), ...Object.keys(after[field] || {})])) {
      const a = before[field]?.[token] || 0, b = after[field]?.[token] || 0;
      if (b < a) out.push(`${field}: ${token} removed or changed (${a} -> ${b})`);
      if (b <= a) continue;
      const allowed = field === 'numbers' ? allowedNumbers.has(token) : field === 'footnotes' ? allowedFootnotes.has(token) : allowedQuotes.some(q => q.includes(token.replace(/[“”]/g, '"')) || q === token.slice(1, -1));
      if (!allowed) out.push(`${field}: ${token} added without verified ledger support (${a} -> ${b})`);
    }
  }
  return out;
}
export function checkAdditive(root, units, base = process.env.FACTS_BASE || PILOT_BASE) {
  const { bySlug } = readLedger(root), errors = [];
  for (const [slug, currentFiles] of units) {
    const prefix = slug === 'site' ? 'site.json' : `companies/${slug}`;
    const baselineFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', base, '--', prefix], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(f => f.endsWith('.json'));
    if (!baselineFiles.length) { errors.push(`${slug}: no baseline at ${base}`); continue; }
    const current = new Map(currentFiles.map(f => [path.relative(root, f), f]));
    for (const file of new Set([...baselineFiles, ...current.keys()])) {
      const old = baselineFiles.includes(file) ? JSON.parse(execFileSync('git', ['show', `${base}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })) : {};
      const next = current.has(file) ? JSON.parse(fs.readFileSync(current.get(file), 'utf8')) : {};
      // A verified entry whose source URL equals an existing source's URL may cite that existing footnote id.
      const srcFile = path.join(root, prefix, 'sections/sources.json');
      const srcList = fs.existsSync(srcFile) ? (JSON.parse(fs.readFileSync(srcFile, 'utf8')).list || []) : [];
      const norm = u => String(u || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      const entries = (bySlug.get(slug) || []).map(e => {
        const ids = srcList.filter(x => (x.url || (x.text || '').match(/\((https?:[^)]+)\)/)?.[1]) && norm(x.url || (x.text || '').match(/\((https?:[^)]+)\)/)[1]) === norm(e.source?.url)).map(x => x.id);
        return ids.length ? { ...e, fn: [...new Set([...(e.fn == null ? [] : [].concat(e.fn)), ...ids])] } : e;
      });
      // Bibliographic metadata of NEW sources (titles, dates) is not a claim; existing sources stay frozen.
      if (file.endsWith('/sections/sources.json') && old.list) {
        const oldIDs = new Set(old.list.map(x => String(x.id)));
        next.__newSources = (next.list || []).filter(x => !oldIDs.has(String(x.id))).length;
      }
      const nextScan = file.endsWith('/sections/sources.json') && old.list ? { ...next, list: (next.list || []).filter(x => old.list.some(o => String(o.id) === String(x.id))), __newSources: undefined } : next;
      for (const error of additiveDiff(additiveTokens(old), additiveTokens(nextScan), entries)) errors.push(`${file}: ${error}`);
      if (file.endsWith('/sections/sources.json')) {
        const oldIDs = new Set((old.list || []).map(s => String(s.id)));
        const verifiedIDs = new Set(entries.filter(e => e.status === 'verified').flatMap(e => e.fn == null ? [] : Array.isArray(e.fn) ? e.fn : [e.fn]).map(String));
        for (const source of next.list || []) if (!oldIDs.has(String(source.id)) && !verifiedIDs.has(String(source.id))) errors.push(`${file}: new source ${source.id} has no verified ledger fn`);
        const newIDs = new Set((next.list || []).map(s => String(s.id)));
        for (const id of oldIDs) if (!newIDs.has(id)) errors.push(`${file}: source ${id} removed`);
      }
    }
  }
  return errors;
}

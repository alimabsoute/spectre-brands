import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readLedger } from './ledger.mjs';
// The pilot's immutable pre-renderer revision; this never rewrites facts/.
export const PILOT_BASE = '99efabee14dc32a3df72ca1ac7745a7438d05194';
const bag = values => values.reduce((out, value) => (out[value] = (out[value] || 0) + 1, out), {});
export function additiveTokens(obj) {
  const numbers = [], footnotes = [], quotes = [];
  const scan = (value, key = '') => {
    if (['ledger', 'id', 'src', 'stagePoint', 'featured', 'glossaryOff'].includes(key)) {
      if (key === 'src') for (const n of Array.isArray(value) ? value : [value]) footnotes.push(`[^${n}]`);
      return;
    }
    if (Array.isArray(value)) { value.forEach(v => scan(v)); return; }
    if (value && typeof value === 'object') { Object.entries(value).forEach(([k, v]) => scan(v, k)); return; }
    if (typeof value === 'number') { numbers.push(String(value)); return; }
    if (typeof value !== 'string' || /^(https?:|\/|#|var\()/.test(value)) return;
    footnotes.push(...(value.match(/\[\^[\w-]+\]/g) || []));
    const text = value.replace(/\[\^[\w-]+\]/g, '').replace(/\]\((?:https?:|\/|#)[^)]*\)/g, ']');
    numbers.push(...(text.match(/\$?\d[\d,]*(?:\.\d+)?(?:%|[MBK]\b)?/g) || []).map(n => n.replace(/,/g, '')));
    quotes.push(...(text.match(/“[^”]{3,}”/g) || []));
  };
  scan(obj);
  return { numbers: bag(numbers), footnotes: bag(footnotes), quotes: bag(quotes) };
}
export function additiveDiff(before, after, verified) {
  const allowedNumbers = new Set(), allowedFootnotes = new Set(), allowedQuotes = [];
  for (const e of verified.filter(e => e.status === 'verified' && e.kind !== 'gap')) {
    const tokens = additiveTokens([e.value, e.quote]);
    Object.keys(tokens.numbers).forEach(n => allowedNumbers.add(n));
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
      for (const error of additiveDiff(additiveTokens(old), additiveTokens(next), bySlug.get(slug) || [])) errors.push(`${file}: ${error}`);
    }
  }
  return errors;
}

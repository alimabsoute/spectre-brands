import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { citations } from '../lib/citations.mjs';
import { glossaryLinks } from '../lib/glossary.mjs';
import { stock } from '../lib/viz/stock.mjs';
import { rivalchart } from '../lib/viz/rivalchart.mjs';
import { storemap, TILES } from '../lib/viz/storemap.mjs';
import { factFile } from '../lib/viz/cards.mjs';
import { additiveTokens, additiveDiff } from '../lib/facts-additive.mjs';
import { ledgerReferences, ledgerSources } from '../lib/ledger.mjs';
import { checked } from '../lib/recheck.mjs';
import { collectRechecks } from '../scripts/recheck.mjs';
import { readingWords } from '../lib/pmtransform.mjs';
const superscript = n => `<sup class="fn"><a href="#src-${n}">${n}</a></sup>`;
const list = [1, 2, 3].map(id => ({ id, title: `Document ${id}`, publisher: 'Example publisher', url: `https://example.com/${id}` }));

test('citations retain marker positions and isolate paragraphs, rows, captions and list items', () => {
  const html = `<p>First${superscript(3)} sentence.${superscript(1)}${superscript(3)}</p><p>Second.${superscript(2)}</p><ul><li>List.${superscript(1)}</li></ul><table><caption>Caption.${superscript(2)}</caption><tr><td>Cell.${superscript(3)}</td></tr></table><dl><div class="factfile-row"><dt>Owner</dt><dd>Value.${superscript(1)}</dd></div></dl><section id="sources"><ol>${list.map(s => `<li id="src-${s.id}" value="${s.id}">Source ${s.id}</li>`).join('')}</ol></section>`;
  const result = citations(html, list);
  assert.match(result, /First<sup class="fn"><a href="#src-3">3<\/a><\/sup> sentence/);
  assert.match(result, /<p id="cite-1" data-src="1 3">/);
  assert.match(result, /<p id="cite-2" data-src="2">/);
  assert.equal((result.match(/class="srcs"/g) || []).length, 6);
  const hidden = result.match(/<ol id="sources-for-cite-1" hidden>([\s\S]*?)<\/ol>/)[1];
  assert.match(hidden, /Document 1/); assert.match(hidden, /Document 3/); assert.doesNotMatch(hidden, /Document 2/);
  assert.match(result, /href="#cite-1"/);
  assert.match(result, /<dd>Value\.[\s\S]*?class="srcs"[\s\S]*?<\/dd>/);
  assert.throws(() => citations(`<p>${superscript(9)}</p>`, list), /missing/);
  const event = citations(`<li class="ev"><h3>Title${superscript(1)}</h3><div class="ev-b"><p>Text.${superscript(2)}</p></div></li>`, list);
  assert.equal((event.match(/class="srcs"/g) || []).length, 1);
  assert.match(event, /class="ev" id="cite-1" data-src="1 2"/);
  assert.match(event, /<p>Text\.[\s\S]*?class="srcs"[\s\S]*?<\/p>/);
  const note = citations(`<section id="sources"><ol><li id="src-1">Source one.</li></ol><details><p>Derived value.${superscript(1)}</p></details></section>`, list);
  assert.match(note, /<p id="cite-1" data-src="1">Derived value/);
  assert.equal((note.match(/class="srcs"/g) || []).length, 1);
});

test('glossary skips protected text, limits six terms and respects aliases and opt-outs', () => {
  const terms = ['revenue', 'auction', 'debt', 'profit', 'loss', 'liquidation', 'receivership'].map((term, i) => ({ id: `term-${i}`, term, aliases: i === 0 ? ['sales'] : [], def: `Definition of ${term}.` }));
  const html = '<h2>revenue</h2><p><a href="/">revenue</a> “revenue” sales revenue auction debt profit loss liquidation receivership.</p><blockquote><p>auction</p></blockquote>';
  const result = glossaryLinks(html, terms);
  assert.equal((result.match(/class="glossary-button"/g) || []).length, 6);
  assert.match(result, /“revenue” <span class="glossary-term">/);
  assert.match(result, /aria-controls="glossary-term-0">sales<\/button>/);
  assert.match(result, /<h2>revenue<\/h2>/);
  assert.doesNotMatch(glossaryLinks('<p>sales revenue auction</p>', terms, ['term-0']), /glossary-term-0/);
  assert.match(glossaryLinks('<p>“a <b>revenue</b> quote” auction</p>', terms), /<b>revenue<\/b>/);
});

test('reading time excludes source mappings and duplicate glossary copy', () => {
  const html = `<p>Revenue was reported.${superscript(1)}</p><section id="sources"><ol><li id="src-1">Document words here.</li></ol></section>`;
  const result = glossaryLinks(citations(html, list), [{ id: 'revenue', term: 'Revenue', aliases: [], def: 'Money from sales.' }]);
  assert.equal(readingWords(result), readingWords(html));
});

test('stock ranges preserve a missing quarter and stop at the last supplied range', () => {
  const html = stock({ type: 'stock', title: 'Fixture', unit: 'USD', series: [{ q: '2000Q1', lo: 10, hi: 20 }, { q: '2000Q3', lo: 2, hi: 4 }] }, {});
  assert.equal((html.match(/class="v2-range"/g) || []).length, 2);
  assert.match(html, /2000Q2<\/th><td>No data<\/td><td>No data/);
  assert.doesNotMatch(html, /2000Q4/);
  assert.match(html, /<title id=/); assert.match(html, /<desc id=/); assert.match(html, /<figcaption>/);
  assert.throws(() => stock({ series: [{ q: '2000Q1', lo: 4, hi: 2 }] }, {}), /Invalid/);
  const delisted = stock({ type: 'stock', title: 'Fixture', unit: 'USD', series: [{ q: '2000Q1', lo: 10, hi: 20 }], events: [{ q: '2000Q2', label: 'Delisted' }] }, {});
  assert.equal((delisted.match(/class="v2-range"/g) || []).length, 1);
  assert.match(delisted, /2000Q2<\/th><td>No data<\/td><td>No data<\/td><td>Delisted/);
});

test('rival lines break on nulls and missing years', () => {
  const html = rivalchart({ type: 'rivalchart', title: 'Fixture', series: [{ name: 'Peer', points: [{ year: 2000, value: 1 }, { year: 2001, value: null }, { year: 2002, value: 3 }, { year: 2004, value: 4 }] }] }, {});
  const d = html.match(/class="v2-series" d="([^"]+)"/)[1];
  assert.equal((d.match(/M/g) || []).length, 3); assert.doesNotMatch(d, /L/);
  assert.match(html, /No data/);
});

test('maps have fifty states and DC, distinct zeros and unknowns, and reconciliation warnings', () => {
  assert.equal(TILES.length, 51); assert.equal(new Set(TILES.map(t => t[0])).size, 51);
  const warnings = [], html = storemap({ title: 'Fixture', dates: ['peak', 'end'], states: { TX: [3, 0] }, unknown: [1, 2], totals: [5, 2] }, { warn: warning => warnings.push(warning) });
  assert.equal(warnings.length, 1); assert.match(warnings[0], /states \+ unknown = 4, total = 5/);
  assert.match(html, /TX, end: 0 stores/); assert.match(html, /DC, peak: Unknown/);
});

test('empty fact files render nothing; cause is computed and checks have calendar due dates', () => {
  assert.equal(factFile({}, { causes: [] }), '');
  const html = factFile({ cause: 'debt', factFile: [{ key: 'was', value: 'Example', src: [1] }] }, { causes: [{ id: 'debt', label: 'Debt' }] });
  assert.match(html, /<dl class="factfile">/); assert.match(html, /<dt>Cause<\/dt><dd>Debt/);
  assert.deepEqual(checked('2026-10-03', '90d', '2027-01-02').due, '2027-01-01');
  assert.equal(checked('2026-10-03', '90d', '2027-01-02').overdue, true);
  assert.throws(() => checked('2026-02-30'), /Invalid/);
});

test('additive facts reject removals, unsupported repetitions, markers and quotes', () => {
  const before = additiveTokens({ body: 'Revenue was $10M.[^1] “old words”', points: [10] });
  const verified = [{ status: 'verified', value: '$20M', quote: '“new words”', fn: 2 }];
  assert.equal(additiveDiff(before, additiveTokens({ body: 'Revenue was $10M.[^1] “old words” Added $20M.[^2] “new words”', points: [10] }), verified).length, 0);
  assert.ok(additiveDiff(before, additiveTokens({ body: 'Revenue was $10M.[^1] “old words” Repeat $10M', points: [10] }), verified).length);
  assert.ok(additiveDiff(before, additiveTokens({ body: 'Revenue was $10M.[^1] “old words”', points: [11] }), verified).some(e => /removed/.test(e)));
  assert.ok(additiveDiff(before, additiveTokens({ body: 'Revenue was $10M.[^1] “old words”[^9]' }), verified).length);
  assert.equal(additiveDiff(additiveTokens({}), additiveTokens({ src: [2], ledger: ['claim-99'] }), verified).length, 0);
  assert.ok(additiveDiff(additiveTokens({}), additiveTokens({ body: '$20M.[^2]' }), [{ ...verified[0], status: 'proposed' }]).length);
});

test('ledger references fail for proposed and missing IDs, including site data', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v2-ledger-'));
  try {
    fs.mkdirSync(path.join(root, 'companies', 'example'), { recursive: true }); fs.mkdirSync(path.join(root, 'data'));
    fs.writeFileSync(path.join(root, 'companies/example/company.json'), JSON.stringify({ factFile: [{ ledger: ['good', 'proposed', 'foreign'] }] }));
    fs.writeFileSync(path.join(root, 'data/edges.json'), JSON.stringify([{ evidence: [{ ledger: 'missing' }] }]));
    const ledger = { all: new Map([['good', { status: 'verified', slug: 'example' }], ['proposed', { status: 'proposed', slug: 'example' }], ['foreign', { status: 'verified', slug: 'other' }]]) };
    const errors = ledgerReferences(root, ledger);
    assert.equal(errors.length, 3); assert.ok(errors.some(e => /data\/edges.json/.test(e)));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('ledger-only points inherit verified source IDs without using proposed entries', () => {
  const obj = { points: [{ ledger: 'good' }, { ledger: ['good', 'pending'], src: [3] }] };
  ledgerSources(obj, { all: new Map([['good', { status: 'verified', fn: 2 }], ['pending', { status: 'proposed', fn: 9 }]]) });
  assert.deepEqual(obj.points[0].src, [2]); assert.deepEqual(obj.points[1].src, [3, 2]);
});

test('rechecks collect all dated items with source URLs and sort by due date', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v2-recheck-')), dir = path.join(root, 'companies/example');
  try {
    fs.mkdirSync(path.join(dir, 'sections'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'company.json'), JSON.stringify({ factFile: [{ key: 'nameOwner', value: 'Example', asOf: '2026-10-03', src: [1] }] }));
    fs.writeFileSync(path.join(dir, 'sections/afterlife.json'), JSON.stringify({ now: [{ title: 'Earlier', text: 'Example status.', asOf: '2020-01-01', recheck: '365d', src: [1] }] }));
    fs.writeFileSync(path.join(dir, 'sections/sources.json'), JSON.stringify({ list: [{ id: 1, text: '[Document](https://example.com/report)' }] }));
    const rows = collectRechecks(root, '2026-10-10');
    assert.equal(rows.length, 2); assert.equal(rows[0].item, 'Earlier'); assert.equal(rows[0].overdue, true); assert.equal(rows[1].sourceUrl, 'https://example.com/report');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

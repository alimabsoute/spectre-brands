#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML, attr, hasClass, renderHTML, visit } from '../lib/html.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), out = path.resolve(ROOT, process.argv[2] || 'dist');
const errors = []; let pages = 0, blocks = 0, markers = 0;
for (const dir of fs.readdirSync(out, { withFileTypes: true })) {
  const file = path.join(out, dir.name, 'index.html');
  if (!dir.isDirectory() || !fs.existsSync(file)) continue;
  const tree = parseHTML(fs.readFileSync(file, 'utf8'));
  let main; const ids = new Map();
  visit(tree, node => { if (attr(node, 'id')) ids.set(attr(node, 'id'), node); if (hasClass(node, 'company')) main = node; });
  if (!main) continue;
  pages++;
  const bad = message => errors.push(`${dir.name}: ${message}`);
  visit(main, (node, ancestors) => {
    if (ancestors.some(n => attr(n, 'id') === 'sources' || hasClass(n, 'source-mapping') || n.tag === 'dialog')) return;
    if (node.tag === 'sup' && hasClass(node, 'fn')) {
      markers++;
      const source = renderHTML(node).match(/href="#src-(\d+)"/)?.[1];
      const block = [...ancestors].reverse().find(n => attr(n, 'data-src'));
      if (!block || !attr(block, 'data-src').split(' ').includes(source)) bad(`source ${source} has no matching block mapping`);
      if (!ids.has(`src-${source}`)) bad(`source anchor ${source} is missing`);
    }
    if (!hasClass(node, 'srcs')) return;
    blocks++;
    const id = attr(node, 'data-cite'), sourceIDs = attr(node, 'data-src').split(' '), mapping = ids.get(`sources-for-${id}`);
    if (!ids.has(id) || !mapping) { bad(`missing block or mapping ${id}`); return; }
    const mapped = mapping.children.filter(n => n.tag === 'li').map(n => attr(n, 'value'));
    if (mapped.join(' ') !== sourceIDs.join(' ')) bad(`${id} has the wrong source list`);
    for (const n of sourceIDs) {
      const source = ids.get(`src-${n}`);
      if (!source || !renderHTML(source).includes(`href="#${id}"`)) bad(`source ${n} has no backlink to ${id}`);
    }
  });
}
errors.forEach(e => console.error(e));
console.log(`citation check: ${pages} pages, ${blocks} blocks, ${markers} retained markers, ${errors.length} errors`);
process.exitCode = errors.length ? 1 : 0;

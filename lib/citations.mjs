import { esc, inline } from './md.mjs';
import { parseHTML, attr, hasClass, setAttr, renderHTML, visit } from './html.mjs';

export const sourceBody = x => x.text ? inline(x.text) : `${x.publisher ? `<span class="source-publisher">${esc(x.publisher)}</span> · ` : ''}<a href="${esc(x.url || x.link || '#sources')}" target="_blank" rel="noopener">${esc(x.title || 'Source')}</a>`;

// Citation superscripts stay exactly where the data placed them. Controls group those markers by block.
export function citations(html, list) {
  const tree = parseHTML(html), sources = new Map(list.map(x => [String(x.id), x]));
  const groups = new Map(), backs = new Map();
  visit(tree, (node, ancestors) => {
    if (node.tag !== 'sup' || !hasClass(node, 'fn') || ancestors.some(n => /^src-\d+$/.test(attr(n, 'id') || ''))) return;
    const n = renderHTML(node).match(/href="#src-(\d+)"/)?.[1];
    if (!n) return;
    const chain = [...ancestors].reverse();
    const block = chain.find(n => hasClass(n, 'factfile-row')) || chain.find(n => hasClass(n, 'ev') && n.tag === 'li') || chain.find(n => /^(p|li|figcaption|caption|td|th|dd|blockquote)$/.test(n.tag)) || chain.find(n => /^(div|h[1-6]|footer)$/.test(n.tag));
    if (!block) throw new Error(`Source ${n} has no citation block`);
    if (!sources.has(n)) throw new Error(`Source ${n} is missing`);
    if (!groups.has(block)) groups.set(block, new Set());
    groups.get(block).add(n);
  });
  let i = 0;
  const hidden = [];
  for (const [block, ids] of groups) {
    const id = attr(block, 'id') || `cite-${++i}`, ns = [...ids].sort((a, b) => +a - +b);
    setAttr(block, 'id', id); setAttr(block, 'data-src', ns.join(' '));
    const control = ` <a class="srcs" href="#sources" data-cite="${id}" data-src="${ns.join(' ')}" aria-haspopup="dialog">Sources<span class="vh"> for this block</span></a>`;
    // A fact file row is a div containing dt/dd; keep the control inside its dd.
    let target = hasClass(block, 'factfile-row') ? block.children.find(n => n.tag === 'dd') : block;
    if (hasClass(block, 'ev')) visit(block, node => { if (node.tag === 'p') target = node; });
    target.children.push(control);
    hidden.push(`<ol id="sources-for-${id}" hidden>${ns.map(n => `<li value="${n}"><span class="source-number">${n}.</span> ${sourceBody(sources.get(n))} <a class="source-jump" href="#src-${n}">Jump to source ${n}</a></li>`).join('')}</ol>`);
    for (const n of ns) { if (!backs.has(n)) backs.set(n, []); backs.get(n).push(id); }
  }
  visit(tree, node => {
    const n = attr(node, 'id')?.match(/^src-(\d+)$/)?.[1];
    if (!n || !backs.has(n)) return;
    node.children.push(`<p class="source-backs">Cited in ${backs.get(n).map((id, i) => `<a href="#${id}">block ${i + 1}<span class="vh"> citing source ${n}</span></a>`).join(', ')}</p>`);
  });
  return renderHTML(tree) + `<div class="source-mapping" hidden>${hidden.join('')}</div><dialog class="source-dialog" id="source-dialog" aria-labelledby="source-dialog-title"><div class="source-dialog-head"><h2 id="source-dialog-title">Sources for this block</h2><button type="button" data-source-close aria-label="Close sources">Close</button></div><ol id="source-dialog-list"></ol></dialog>`;
}

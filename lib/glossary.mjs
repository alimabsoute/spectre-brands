import { esc } from './md.mjs';
import { parseHTML, attr, hasClass, renderHTML } from './html.mjs';
export function glossaryLinks(html, terms = [], off = []) {
  const tree = parseHTML(html), used = new Set(off), definitions = [], seen = new Set();
  const candidates = terms.flatMap(term => [term.term, ...(term.aliases || [])].map(word => ({ term, word }))).filter(x => x.word).sort((a, b) => b.word.length - a.word.length);
  const boundary = c => !c || !/[\p{L}\p{N}_]/u.test(c);
  const walk = (node, prose = false, blocked = false) => {
    if (typeof node === 'string') return;
    const skip = blocked || /^(a|button|blockquote|q|h[1-6]|script|style|svg|table|sup)$/.test(node.tag) || attr(node, 'id') === 'sources' || hasClass(node, 'v2-viz');
    const inProse = prose || /^(p|li|dd)$/.test(node.tag);
    node.children = node.children.map(child => {
      if (typeof child !== 'string') { walk(child, inProse, skip); return child; }
      if (skip || !inProse || seen.size >= 6 || child.startsWith('<')) return child;
      // Preserve inline quoted passages, including straight and curly quotation marks.
      const parts = child.split(/(“[^”]*”|&quot;[\s\S]*?&quot;|"[^"]*")/g);
      return parts.map((text, part) => {
        if (part % 2 || seen.size >= 6) return text;
        let out = '', cursor = 0;
        while (cursor < text.length && seen.size < 6) {
          let hit = null;
          for (const candidate of candidates) {
            if (used.has(candidate.term.id)) continue;
            const needle = esc(candidate.word), lower = text.toLowerCase();
            let at = lower.indexOf(needle.toLowerCase(), cursor);
            while (at >= 0 && (!boundary(text[at - 1]) || !boundary(text[at + needle.length]))) at = lower.indexOf(needle.toLowerCase(), at + 1);
            if (at >= 0 && (!hit || at < hit.at)) hit = { ...candidate, at, length: needle.length };
          }
          if (!hit) break;
          const id = `glossary-${hit.term.id}`, label = text.slice(hit.at, hit.at + hit.length);
          out += text.slice(cursor, hit.at) + `<span class="glossary-term"><button type="button" class="glossary-button" aria-expanded="false" aria-controls="${esc(id)}">${label}</button><a class="glossary-fallback" href="/glossary/#${esc(hit.term.id)}">${label}</a><span class="glossary-pop" id="${esc(id)}" role="region" aria-label="${esc(hit.term.term)}" hidden>${esc(hit.term.def)} <a href="/glossary/#${esc(hit.term.id)}">Glossary entry</a></span></span>`;
          used.add(hit.term.id); seen.add(hit.term.id); definitions.push(hit.term.id);
          cursor = hit.at + hit.length;
        }
        return out + text.slice(cursor);
      }).join('');
    });
  };
  walk(tree);
  return renderHTML(tree);
}
export function glossaryPage(terms) {
  return `<header class="page-hero"><div class="wrap"><h1>Glossary</h1></div></header><div class="wrap"><dl class="glossary-list">${terms.map(t => `<div id="${esc(t.id)}"><dt>${esc(t.term)}</dt><dd>${esc(t.def)}</dd></div>`).join('')}</dl></div>`;
}

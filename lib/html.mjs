// Parse generated HTML while preserving its original bytes and tag order.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
export function parseHTML(html) {
  const root = { tag: '', children: [] }, stack = [root];
  const tokens = html.match(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]+>|[^<]+/gi) || [];
  for (const raw of tokens) {
    const close = raw.match(/^<\/([\w-]+)/);
    if (close) {
      const at = stack.findLastIndex(n => n.tag === close[1].toLowerCase());
      if (at > 0) { stack[at].close = raw; stack.length = at; }
      else stack.at(-1).children.push(raw);
      continue;
    }
    const open = raw.match(/^<([\w-]+)\b/);
    if (!open || /^(script|style)$/i.test(open[1])) { stack.at(-1).children.push(raw); continue; }
    const node = { tag: open[1].toLowerCase(), open: raw, close: '', children: [], parent: stack.at(-1) };
    stack.at(-1).children.push(node);
    if (!VOID.has(node.tag) && !raw.endsWith('/>')) stack.push(node);
  }
  return root;
}
export const attr = (node, name) => node.open?.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
export const hasClass = (node, name) => (attr(node, 'class') || '').split(/\s+/).includes(name);
export const setAttr = (node, name, value) => { node.open = node.open.replace(new RegExp(`\\s${name}="[^"]*"`), '').replace(/>$/, ` ${name}="${value}">`); };
export const renderHTML = node => typeof node === 'string' ? node : (node.open || '') + node.children.map(renderHTML).join('') + (node.close || '');
export function visit(node, fn, ancestors = []) {
  if (typeof node === 'string') return;
  fn(node, ancestors);
  for (const child of node.children) visit(child, fn, [...ancestors, node]);
}

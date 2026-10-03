// Minimal, predictable text markup used in every company data file.
//   **bold**        -> <b>bold</b>
//   [label](https://url) -> external link
//   [^12]           -> footnote 12 (links to #src-12 in the Sources section)
//   blank line      -> new paragraph (md() only; inline() keeps one paragraph)
// Everything else is HTML-escaped, so data files never contain raw HTML.
export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const fn = ids => (ids || []).map(n => `<sup class="fn"><a href="#src-${n}">${n}</a></sup>`).join('');

export function inline(s) {
  let h = esc(s);
  h = h.replace(/\[\^(\d+)\]/g, (_, n) => fn([n]));
  h = h.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (_, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
  h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return h;
}

export function md(s, cls = '') {
  if (s == null || s === '') return '';
  const paras = Array.isArray(s) ? s : String(s).split(/\n\s*\n/);
  return paras.map(p => `<p${cls ? ` class="${cls}"` : ''}>${inline(p.trim())}</p>`).join('\n');
}

// Attribute-safe JSON for <script type="application/json">
export const json = o => JSON.stringify(o).replace(/</g, '\\u003c');

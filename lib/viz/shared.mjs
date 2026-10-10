import { esc, inline, fn } from '../md.mjs';
export const value = v => v == null ? 'Unknown' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });
export const plain = s => String(s || '').replace(/\[\^\d+\]/g, '').replace(/\*\*/g, '');
export function chartID(ctx, prefix) { ctx.vizCount = (ctx.vizCount || 0) + 1; return `${prefix}-${ctx.vizCount}`; }
export function svg(id, title, desc, marks, box = '0 0 760 320') {
  return `<svg class="v2-svg" viewBox="${box}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${esc(plain(title))}</title><desc id="${id}-desc">${esc(desc)}</desc>${marks}</svg>`;
}
export function table(columns, rows, caption) {
  return `<details class="data v2-data"><summary>Data table</summary><div class="tbl-scroll" tabindex="0" role="region" aria-label="${esc(plain(caption))} data"><table class="cmp"><caption>${inline(caption)}</caption><thead><tr>${columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
}
export function figure(b, id, marks, rows, columns, description, extra = '') {
  return `<figure class="card v2-viz v2-${esc(b.type || b.kind)}" id="${id}"><h3>${inline(b.title)}</h3>${extra}${svg(id, b.title, description, marks)}<figcaption>${inline(b.note || b.metric || b.title)}${fn(b.src)}</figcaption>${table(columns, rows, b.title)}</figure>`;
}
export function axes(min, max, unit) {
  let out = '';
  for (let i = 0; i <= 4; i++) {
    const y = 260 - i * 54;
    out += `<path class="v2-grid" d="M72 ${y}H724"/><text x="62" y="${y + 4}" text-anchor="end">${esc(value(min + (max - min) * i / 4))}</text>`;
  }
  return out + `<text x="72" y="22">${esc(unit || '')}</text>`;
}

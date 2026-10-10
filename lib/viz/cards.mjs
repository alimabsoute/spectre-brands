import { esc, inline, md, fn } from '../md.mjs';
import { checked } from '../recheck.mjs';
const LABELS = { trademark: ['™', 'Trademark'], company: ['▣', 'Company'], brand: ['◇', 'Brand'], site: ['↗', 'Website'], store: ['⌂', 'Store'], people: ['♙', 'People'], revival: ['↻', 'Revival'] };
export function nowCards(cards = []) {
  if (!cards.length) return '';
  return `<div class="where-now"><h3>Where are they now</h3><div class="now-grid">${cards.map(c => {
    const [icon, label] = LABELS[c.type] || ['◇', c.type], date = checked(c.asOf, c.recheck || (c.type === 'trademark' ? '365d' : '90d'));
    return `<article class="now-card"><p class="now-type"><span aria-hidden="true">${icon}</span> ${esc(label)}</p><h4>${inline(c.title)}</h4>${md(c.text)}<p class="now-checked"><time datetime="${date.asOf}">${date.label}</time>${date.overdue ? ' <span class="stale">Recheck overdue</span>' : ''}${fn(c.src)}</p></article>`;
  }).join('')}</div></div>`;
}
export function factFile(c, site) {
  if (!c.factFile?.length) return '';
  const LABELS = { was: 'What it was', founded: 'Founded', peak: 'Peak', end: 'End', buyer: 'Company buyer', nameOwner: 'Name owner', remains: 'What remains', cause: 'Cause' };
  const rows = c.factFile.filter(r => r.key !== 'cause');
  rows.push({ key: 'cause', value: site.causes.find(x => x.id === c.cause)?.label || c.cause });
  return `<dl class="factfile">${rows.map(r => `<div class="factfile-row"><dt>${esc(r.label || LABELS[r.key] || r.key)}</dt><dd>${inline(r.value)}${r.when ? ` <span class="factfile-when">(${inline(r.when)})</span>` : ''}${r.asOf ? ` <time datetime="${esc(r.asOf)}">${checked(r.asOf, r.recheck || '90d').label}</time>` : ''}${fn(r.src)}</dd></div>`).join('')}</dl>`;
}

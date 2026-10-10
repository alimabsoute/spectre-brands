// Stage 5 proposal mock (branch previews only, noindex): the Blockbuster page with grouped, back-linked sources and
// in-body source popovers. Built from the finished page so the copy and citations are the real ones.
import fs from 'node:fs'; import path from 'node:path';
export function fnPreview({ OUT, write }) {
  const src = path.join(OUT, 'blockbuster/index.html'); if (!fs.existsSync(src)) return;
  let h = fs.readFileSync(src, 'utf8');
  // where each source is cited: section id → label
  const secs = [...h.matchAll(/<section id="([\w-]+)"[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m => ({ id: m[1], label: m[2].replace(/<[^>]+>/g, ''), at: m.index }));
  const citedIn = {};
  for (const m of h.matchAll(/<sup class="fn"><a href="#src-(\d+)">/g)) {
    const s = [...secs].reverse().find(x => x.at < m.index); if (!s || s.id === 'sources') continue;
    (citedIn[m[1]] ||= new Map()).set(s.id, s.label);
  }
  const kind = li => /sec\.gov/.test(li) ? 'Company filings' : /web\.archive\.org|Wayback/.test(li) ? 'Archived websites' : /youtube|vimeo|video/i.test(li) ? 'Video' : 'Press, books and other';
  const ORDER = ['Company filings', 'Press, books and other', 'Archived websites', 'Video'];
  h = h.replace(/<ol class="sources">([\s\S]*?)<\/ol>/, (_, inner) => {
    const items = [...inner.matchAll(/<li id="src-(\d+)" value="\d+">([\s\S]*?)<\/li>/g)];
    const groups = {};
    for (const [, n, body] of items) {
      const back = [...(citedIn[n] || new Map())].map(([id, l]) => `<a href="#${id}">${l}</a>`).join(', ');
      (groups[kind(body)] ||= []).push(`<li id="src-${n}" value="${n}"><span class="fx-n">${n}</span><div>${body}${back ? `<p class="fx-back">Cited in ${back}</p>` : ''}</div></li>`);
    }
    return `<div class="fx-groups">${ORDER.filter(k => groups[k]).map((k, i) => `<details class="fx-g"${i ? '' : ' open'}><summary>${k} <span>${groups[k].length}</span></summary><ol class="sources fx-list">${groups[k].join('')}</ol></details>`).join('')}</div>`;
  });
  const css = `<style>.fx-banner{background:#F2A33C;color:#1B1815;font:600 14px/1.4 'DM Sans',sans-serif;padding:10px 20px;text-align:center}
.fx-groups{display:grid;gap:12px;margin-top:18px}.fx-g{border-top:2px solid currentColor;padding-top:10px}.fx-g summary{cursor:pointer;font-weight:700;font-size:1.05rem;list-style:none}.fx-g summary span{font-weight:400;opacity:.7;margin-left:6px}
.fx-list li::before{content:none!important;display:none!important}.fx-list li::marker{content:''}.fx-list{list-style:none;padding:0;margin:10px 0 0}.fx-list li{display:grid;grid-template-columns:2.4em 1fr;gap:6px;padding:8px 0;border-bottom:1px dashed rgba(127,110,90,.35)}.fx-n{font-variant-numeric:tabular-nums;font-weight:700;opacity:.8}.fx-back{margin:.25em 0 0;font-size:.85em;opacity:.85}
sup.fn a{display:inline-block;min-width:1.5em;padding:0 .35em;border-radius:999px;background:rgba(242,163,60,.22);text-decoration:none;font-size:.72em;line-height:1.5;text-align:center}
.fx-pop{position:fixed;z-index:50;max-width:340px;background:var(--paper,#F6EFE0);color:var(--ink,#1B1815);border:1px solid rgba(27,24,21,.25);border-radius:8px;box-shadow:0 12px 30px -12px rgba(0,0,0,.45);padding:10px 12px;font:400 14px/1.45 'DM Sans',sans-serif}.fx-pop b{display:block;margin-bottom:2px}</style>`;
  const js = `<script>(()=>{let p;const hide=()=>{p&&p.remove();p=null};document.addEventListener('mouseover',e=>{const a=e.target.closest('sup.fn a');if(!a){if(!e.target.closest('.fx-pop'))hide();return}hide();const li=document.getElementById(a.hash.slice(1));if(!li)return;p=document.createElement('div');p.className='fx-pop';p.setAttribute('role','tooltip');p.innerHTML='<b>Source '+a.textContent+'</b>'+li.querySelector('div').innerHTML.replace(/<p class="fx-back">[\\s\\S]*<\\/p>/,'');document.body.append(p);const r=a.getBoundingClientRect();p.style.left=Math.min(r.left,innerWidth-360)+'px';p.style.top=(r.bottom+6)+'px'});})();</script>`;
  h = h.replace(/<meta name="robots"[^>]*>/, '').replace('</head>', `<meta name="robots" content="noindex,nofollow">${css}</head>`)
    .replace(/<body([^>]*)>/, `<body$1><div class="fx-banner">Stage 5 proposal mock: grouped, back-linked sources and in-body source popovers. Not live.</div>`)
    .replace(/<link rel="canonical"[^>]*>/, '');
  const end = h.lastIndexOf('</body>'); h = h.slice(0, end) + js + h.slice(end);
  write('preview/footnotes/index.html', h);
}

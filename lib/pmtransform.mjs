// HTML transform for the post-mortem section-system preview (/preview/pm-<slug>/). Owned by the section-system work.
// Adds, without touching the production build: a no-flash theme script, the preview fonts, a theme toggle in the
// masthead, a chapter line above every major section (number, kicker, VHS-style reading-time counter, side A/B),
// a chapter nav (desktop rail / mobile sticky bar), and token-friendly rewrites of a few inline colours.

const WPM = 230;
// Dark-mode brand colour: the page's brand mixed towards paper until it reaches 4.6:1 on the charcoal page
// (--brand paints kickers, footnote marks, act numbers and link hovers at small sizes).
const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = h => { const [r, g, b] = hex2(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const mix = (a, b, t) => { const A = hex2(a), B = hex2(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
export const darkBrand = (brand, bg = '#221E1B', paper = '#F3EBDC', min = 4.6) => { let t = 0.3, c = mix(brand, paper, t); while (contrast(c, bg) < min && t < 1) { t += 0.05; c = mix(brand, paper, t); } return c; };
 // words per minute, for the tape-counter timecode

const NOFLASH = `<script>(function(){var d=document.documentElement,t=null;try{t=localStorage.getItem('sb-theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t)})();</script>`;

const ICON = `<svg class="pm-theme-ico" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path class="pm-ico-moon" d="M13.6 2.6a7.5 7.5 0 1 0 3.8 10.6A6 6 0 0 1 13.6 2.6Z"/><g class="pm-ico-sun"><circle cx="10" cy="10" r="3.6"/><path d="M10 1.5v2.2M10 16.3v2.2M1.5 10h2.2M16.3 10h2.2M4 4l1.6 1.6M14.4 14.4 16 16M4 16l1.6-1.6M14.4 5.6 16 4"/></g></svg>`;
const themeBtn = (extra = '') => `<button type="button" class="pm-theme-btn${extra}" aria-pressed="false" aria-label="Switch to dark mode" title="Switch to dark mode">${ICON}<span class="pm-theme-txt" aria-hidden="true">Dark</span></button>`;

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, '’').replace(/&nbsp;/g, ' ');
const words = html => unesc(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')).split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length;
const pad = n => String(n).padStart(2, '0');
const timecode = s => `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}`;

export function pmTransform(html, slug) {
  // 1. <head>: no-flash theme script before the site stylesheet; preview fonts before the preview stylesheet.
  html = html.replace('<link rel="stylesheet" href="/assets/site.css', `${NOFLASH}\n<link rel="stylesheet" href="/assets/site.css`);
  html = html.replace('<link rel="stylesheet" href="/assets/pmpreview/sections.css', '<link rel="stylesheet" href="/assets/preview/fonts.css">\n<link rel="stylesheet" href="/assets/pmpreview/sections.css');

  // 2. Theme toggle: in the desktop site nav (before Search) and in the mobile icon group.
  html = html.replace('<button type="button" class="search-btn"', `${themeBtn()}\n<button type="button" class="search-btn"`);
  html = html.replace('<div class="mast-m">\n', `<div class="mast-m">\n${themeBtn(' pm-theme-m')}\n`);

  // 3. The page's brand colour: move the inline values to --brand-l/--brand-soft-l so sections.css can derive a
  //    dark-mode variant (inline style would otherwise beat any stylesheet).
  html = html.replace(/(<main id="main" class="company" style=")--brand:([^;"]+);--brand-soft:([^;"]+)(")/, (m, a, brand, soft, z) => `${a}--brand-l:${brand};--brand-soft-l:${soft};--brand-d:${darkBrand(brand, '#2E2925')};--brand-soft-d:${mix(brand, '#2E2925', .22)}${z}`);

  // 4. Inline category colours (timeline dots, chips, big figures) become overridable custom properties.
  html = html.replace(/style="--c:#([0-9a-fA-F]{6})"/g, (m, h) => `style="--c:var(--pm-c-${h.toLowerCase()},#${h})"`);
  html = html.replace(/class="cdot" style="background:#([0-9a-fA-F]{6})"/g, (m, h) => `class="cdot" style="background:var(--pm-c-${h.toLowerCase()},#${h})"`);

  // 5. Chapter lines + chapter nav. Major parts are <section id class="sec ..."> with a .sec-head; "more" is excluded.
  const mainAt = html.indexOf('<main id="main"');
  const secRe = /<section id="([a-z-]+)" class="sec[^"]*" aria-labelledby="[^"]+"><div class="wrap">\n<div class="sec-head"><p class="sec-k">([^<]*)<\/p>/g;
  const secs = [];
  for (let m; (m = secRe.exec(html));) secs.push({ id: m[1], kicker: m[2], at: m.index, len: m[0].length });
  const n = secs.length;
  if (!n) return html;
  const sideA = Math.ceil(n / 2);
  secs.forEach((s, i) => { s.n = i + 1; s.side = s.n <= sideA ? 'A' : 'B'; s.sec = Math.round(words(html.slice(mainAt, s.at)) / WPM * 60); s.tc = timecode(s.sec); });
  const total = timecode(Math.round(words(html.slice(mainAt)) / WPM * 60));

  let out = '', last = 0;
  for (const s of secs) {
    const line = `<p class="pm-ch" data-side="${s.side}"><span class="pm-tape" aria-hidden="true"></span><span class="pm-n"><span class="vh">Chapter </span>${pad(s.n)}<span class="pm-of"><span aria-hidden="true"> / </span><span class="vh">of </span>${pad(n)}</span></span><span class="pm-k">${s.kicker}</span><span class="pm-tc"><span class="vh">reading time from the top </span><span class="pm-side" aria-hidden="true">Side ${s.side}</span><span class="pm-sep" aria-hidden="true">·</span><span class="pm-time">${s.tc}</span></span></p>\n`;
    const open = html.slice(s.at, s.at + s.len).replace('<div class="sec-head">', `${line}<div class="sec-head">`);
    out += html.slice(last, s.at) + open; last = s.at + s.len;
  }
  html = out + html.slice(last);

  const brand = (html.match(/<h1 class="name"[^>]*>([^<]*)<\/h1>/) || [])[1] || slug;
  const items = [{ id: 'overview', n: 0, kicker: 'Overview' }, ...secs].map(s =>
    `<li><a href="#${s.id}" data-pm="${s.id}" aria-label="${pad(s.n)} ${esc(unesc(s.kicker))}"><b>${pad(s.n)}</b><span>${s.kicker}</span></a></li>`).join('');
  const toc = `<nav class="pm-toc" id="pm-toc" aria-label="Chapters of this post-mortem"><div class="pm-toc-in"><p class="pm-toc-h" aria-hidden="true"><b>${esc(brand)}</b><span class="pm-toc-tot">${total}</span></p><ol>${items}</ol></div><span class="pm-prog" aria-hidden="true"><i></i></span></nav>\n`;
  html = html.replace('<main id="main"', `${toc}<main id="main"`);
  return html;
}

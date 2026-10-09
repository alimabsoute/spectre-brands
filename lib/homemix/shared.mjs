// Shared helpers for the homepage mixes. Keep markup semantic; each mix owns its look in assets/homemix/mixN.css.
export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const MIXES = [
  { n: 1, letter: 'A', name: 'Shelf Talker' },
  { n: 2, letter: 'B', name: 'Night Drop' },
  { n: 3, letter: 'C', name: 'Front Counter' },
  { n: 4, letter: 'D', name: 'Spine Wall' }
];

// <head> with the mix's fonts and stylesheet. fonts: list of preview font families already self-hosted
// in /assets/preview/fonts.css (Fraunces, DM Sans, Space Grotesk, IBM Plex Sans), plus extra @font-face
// files in /assets/fonts (caveat.woff2 = Caveat, a hand-lettered face).
export function head(meta, { themeColor = '#141210', extra = '' } = {}) {
  const v = Date.now().toString(36);
  return `<!doctype html><html lang="en" data-mix="${meta.n}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(meta.name)} · Homepage mix ${meta.n} · Spectre Brands</title><meta name="description" content="${esc(meta.idea)}"><meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="${themeColor}"><link rel="icon" href="/assets/homemix/favicon.ico" sizes="any"><link rel="icon" href="/assets/homemix/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/homemix/icon-180.png">
<link rel="preload" as="image" type="image/avif" imagesrcset="/assets/homemix/hero-720.avif 720w, /assets/homemix/hero-1200.avif 1200w, /assets/homemix/hero-2400.avif 2400w" imagesizes="(max-width: 700px) 100vw, 900px">
<link rel="stylesheet" href="/assets/preview/fonts.css"><style>@font-face{font-family:'Caveat';src:url(/assets/fonts/caveat.woff2) format('woff2');font-weight:400 700;font-display:swap}</style>
<link rel="stylesheet" href="/assets/homemix/mix${meta.n}.css?v=${v}">${extra}</head><body>`;
}

// The painted hero logo (raster). sizes: CSS sizes attribute for the slot it sits in.
export const heroLogo = ({ sizes = '(max-width: 700px) 100vw, 900px', cls = 'hero-logo' } = {}) =>
  `<picture class="${cls}"><source type="image/avif" srcset="/assets/homemix/hero-720.avif 720w, /assets/homemix/hero-1200.avif 1200w, /assets/homemix/hero-2400.avif 2400w" sizes="${sizes}"><img src="/assets/homemix/hero-1200.webp" srcset="/assets/homemix/hero-720.webp 720w, /assets/homemix/hero-1200.webp 1200w, /assets/homemix/hero-2400.webp 2400w" sizes="${sizes}" width="2400" height="1324" alt="Spectre Brands: a black VHS cassette with an orange rental label reading Spectre Brands, and a small ghost peeling back its corner" fetchpriority="high"></picture>`;

// The vector (clean) logo for headers and small sizes, and the ghost icon.
export const smallLogo = ({ cls = 'small-logo', width = 230 } = {}) =>
  `<picture><source type="image/avif" srcset="/assets/homemix/strip/strip-logo-510.avif 510w, /assets/homemix/strip/strip-logo-765.avif 765w" sizes="${width}px"><img class="${cls}" src="/assets/homemix/strip/strip-logo-510.webp" srcset="/assets/homemix/strip/strip-logo-510.webp 510w, /assets/homemix/strip/strip-logo-765.webp 765w" sizes="${width}px" width="${width}" height="${Math.round(width / 5.796)}" alt="Spectre Brands" style="height:clamp(34px,3.6vw,44px);width:auto;max-width:none;display:block"></picture>`;
export const icon = ({ cls = 'logo-icon', size = 40 } = {}) => `<img class="${cls}" src="/assets/homemix/icon.svg" width="${size}" height="${size}" alt="">`;

// Fixed A/B/C/D switcher (bottom of every mix page).
export function switcher(n) {
  const m = MIXES.find(x => x.n === n);
  return `<nav class="mix-switch" aria-label="Switch homepage mix"><span class="mix-switch-label">Mix ${m.letter}: ${esc(m.name)}</span><span class="mix-switch-links">${MIXES.map(x => `<a href="/preview/home-mix-${x.n}/" title="Mix ${x.letter}: ${esc(x.name)}"${x.n === n ? ' aria-current="page"' : ''}>${x.letter}</a>`).join('')}<a href="/preview/" class="mix-switch-hub">Hub</a></span></nav>`;
}

// Brand image (archive photo in full colour, or the brand's original drawing). Archive photos are never filtered.
export const brandPic = (b, { eager = false } = {}) => eager ? b.pic.replace(/loading="lazy"/g, 'loading="eager"') : b.pic;
export const illoTag = b => b.illustration ? '<span class="illo-tag">Illustration</span>' : '';
export const ILLUSTRATION_CREDIT = 'Original illustration for Spectre Brands (AI-assisted). Not a historical image.';

// Brands in a stable "opening inventory" order (featured first, then mixed across categories), all 38 once.
export function ordered(data) {
  const lead = ['circuit-city', 'crystal-pepsi', 'howard-johnsons', 'toys-r-us', 'blockbuster', 'webvan', 'sega', 'compusa', 'surge', 'kmart', 'geocities'];
  const by = s => data.brands.find(b => b.slug === s);
  return [...new Set([by(data.site.featured), ...lead.map(by), ...data.brands].filter(Boolean))];
}
export const byCategory = data => data.categories.map(k => ({ ...k, brands: data.brands.filter(b => b.category === k.id) }));

export const footerNote = () => `<p class="mix-note">Design preview on the design-refresh branch. Not the live site. Archive photos are shown in their source colours; open a post-mortem for credits. Drawings marked “Illustration” are original artwork, not historical images.</p>`;

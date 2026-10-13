// Style check generator: one Blockbuster beat, three inside-screen treatments (A/B/C), one shared TV shell.
// Run from the repo root: node docs/design-review-v3/build-samples.mjs [--no-samples]
// Writes only inside docs/design-review-v3. No network requests: the review page inlines GSAP,
// each samples/<k>/ folder loads its own copied vendor/gsap.min.js.
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'docs/design-review-v3';
const b64 = (p) => fs.readFileSync(p).toString('base64');
const text = (p) => fs.readFileSync(p, 'utf8');

const GSAP = text(`${OUT}/vendor/gsap.min.js`).replace(/<\/script/gi, '<\\/script');
const FONT_HEAD = b64('assets/fonts/hero/barlow-condensed-bold.ttf');
const FONT_BODY = b64('assets/fonts/preview/source-sans-3-0.woff2');
// Third-party notices for the embedded fonts and GSAP: inert JSON data, never rendered or executed.
// "<" is escaped so no licence text can close the script element.
const NOTICES = `<script type="application/json" id="third-party-notices">${JSON.stringify({
  fonts: [
    { name: 'Barlow Condensed', license: 'SIL Open Font License 1.1', fullLicense: text('assets/fonts/hero/barlowcondensed-OFL.txt') },
    { name: 'Source Sans 3', license: 'SIL Open Font License 1.1', fullLicense: text('assets/fonts/preview/sourcesans3-OFL.txt') },
  ],
  scripts: [
    { name: 'GSAP', version: '3.14.2', source: 'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js', license: 'https://gsap.com/copyright/' },
  ],
}).replace(/</g, '\\u003c')}</script>`;
const STORE = text('companies/blockbuster/art/hero.svg');
const TAPE = text('companies/blockbuster/art/vhs-tape.svg');

const HEADLINE = 'A video store built like a supermarket';
const CAPS = [
  'Dallas · October 19, 1985',
  'Some 8,000 tapes on open shelves.',
  'A computerized checkout, while most video shops were small and thinly stocked.',
];
const CITE = { label: 'History.com, “First Blockbuster store opens,” October 19, 1985', url: 'https://www.history.com/this-day-in-history/october-19/first-blockbuster-store-opens' };
const STYLES = { a: 'Storybook', b: 'Cut paper', c: '2.5D' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// ---- shared artwork -------------------------------------------------------------------------

// Backdrop colours are taken from the source storefront so the code-drawn props match its palette.
function palette(svg) {
  const n = {};
  for (const [h] of svg.matchAll(/#[0-9a-f]{6}\b/gi)) n[h.toLowerCase()] = (n[h.toLowerCase()] || 0) + 1;
  const cols = Object.keys(n).map((h) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    return { h, n: n[h], lum: (0.299 * r + 0.587 * g + 0.114 * b) / 255, sat: (Math.max(r, g, b) - Math.min(r, g, b)) / 255 };
  });
  const pick = (f, fallback) => (cols.filter(f).sort((x, y) => y.n - x.n)[0] || { h: fallback }).h;
  return { dark: pick((c) => c.lum < 0.4 && c.sat > 0.15, '#14315f'), accent: pick((c) => c.sat > 0.4 && c.lum > 0.4, '#f6c21c') };
}

// Inline a source SVG, whole and uncropped, into a box of the 960x720 (4:3) scene. Ids are prefixed per copy.
function art(src, prefix, x, y, w, h, align = 'xMidYMax') {
  const m = src.replace(/<\?xml[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<!--[\s\S]*?-->/gi, '').match(/<svg\b([^>]*)>([\s\S]*)<\/svg>/i);
  if (!m) throw new Error(`No <svg> root found for ${prefix}`);
  const get = (k) => (m[1].match(new RegExp(`\\s${k}\\s*=\\s*["']([^"']*)["']`)) || [])[1];
  const viewBox = get('viewBox') || `0 0 ${parseFloat(get('width')) || 100} ${parseFloat(get('height')) || 100}`;
  const attrs = m[1].replace(/\s(?:xmlns(?::\w+)?|width|height|x|y|id|viewBox|preserveAspectRatio|version|role|aria-[\w-]+)\s*=\s*(?:"[^"]*"|'[^']*')/g, '');
  if (/<style/i.test(m[2])) console.warn(`[build-samples] ${prefix}: source SVG has a <style> block; class/id selectors are not prefixed.`);
  const inner = m[2]
    .replace(/(\s)id="([^"]+)"/g, `$1id="${prefix}-$2"`)
    .replace(/url\(\s*(['"]?)#([^)'"]+)\1\s*\)/g, `url(#${prefix}-$2)`)
    .replace(/\bhref="#([^"]+)"/g, `href="#${prefix}-$1"`);
  return `<svg class="art"${attrs} x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}" preserveAspectRatio="${align} meet">${inner}</svg>`;
}

function scene() {
  const P = palette(STORE);
  const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const layer = (depth, body) => `<g class="layer" data-depth="${depth}">${body}</g>`;
  const beat = (i, body) => `<g class="beat" data-beat="${i}"><g class="cam">${body}</g></g>`;
  const wide = (y, h, fill, extra) => rect(-100, y, 1160, h, fill, extra);

  const skyline = [[40, 330, 90], [140, 290, 70], [690, 310, 110], [810, 350, 80], [-40, 370, 70]]
    .map(([x, y, w]) => rect(x, y, w, 500 - y, P.dark, 'opacity=".16"')).join('');
  const bays = [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${120 + i * 130} 566 L${84 + i * 130} 660" stroke="#f7f0dc" stroke-width="6" stroke-linecap="round" fill="none"/>`).join('');
  const street = beat(0,
    layer(0.15, wide(-100, 620, '#f3e4c0') + `<circle cx="776" cy="128" r="54" fill="${P.accent}" opacity=".85"/>` + skyline) +
    layer(0.7, wide(492, 360, '#dccba8')) +
    layer(0.5, art(STORE, 's', 150, 56, 660, 448)) +
    layer(1, wide(560, 300, '#c2b08c') + bays));

  // Three shelving runs, back to front; every tape is the unmodified vhs-tape.svg.
  const rows = [[6, 0.72, 240, 0.35], [5, 0.86, 392, 0.65], [4, 1, 566, 1]].map(([n, s, base, depth], r) => {
    const w = 150 * s, gap = 30 * s, run = n * w + (n - 1) * gap, x0 = (960 - run) / 2;
    const tapes = Array.from({ length: n }, (_, i) => art(TAPE, `t${r}${i}`, x0 + i * (w + gap), base - w * 0.66, w, w * 0.66)).join('');
    return layer(depth, rect(x0 - 26 * s, base - w * 0.74, run + 52 * s, w * 0.74, '#e6d7b6', 'rx="4"') + tapes + rect(x0 - 34 * s, base, run + 68 * s, 16 * s, P.dark, 'rx="3"'));
  }).join('');
  const wall = wide(-100, 940, '#efe2c4') + wide(64, 24, P.accent) + wide(96, 6, P.dark);
  const shelves = beat(1, layer(0.12, wall + wide(580, 300, '#d5c39e')) + rows);

  const lines = [150, 108, 132, 70].map((w, i) => rect(602, 246 + i * 24, w, 9, '#9fe0a6', 'class="tline" rx="2"')).join('');
  const terminal = rect(560, 200, 250, 204, '#d9cdb2', 'rx="14"') + rect(582, 222, 206, 134, '#1d2a24', 'rx="12"') + lines +
    rect(590, 372, 60, 10, '#b9ac90', 'rx="3"') + rect(642, 404, 86, 22, '#b9ac90') + rect(536, 422, 298, 22, '#cabd9f', 'rx="6"');
  const checkout = beat(2,
    layer(0.12, wall) +
    layer(0.5, terminal) +
    layer(0.9, wide(440, 400, P.dark) + wide(440, 14, P.accent) + `<g class="slide">${art(TAPE, 'tc', 120, 256, 310, 196)}</g>`));

  // 4:3 tube: the art keeps its original coordinates; the extra 80 units at the bottom are floor.
  return `<svg class="scene" viewBox="0 0 960 720" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Illustration in three parts: a video store front, tapes on open shelves, and a checkout counter with a computer terminal.">
<rect class="paper" x="-100" y="-100" width="1160" height="940" fill="#f6ecd6"/>${street}${shelves}${checkout}</svg>`;
}

// ---- shared motion (stringified into every output; runs in the browser) -----------------------

// Returns ONE paused, finite, seekable 12s timeline. Only inner SVG groups/shapes (and .cap, if present) are tweened.
function buildTimeline(root, style) {
  const q = (s, c) => Array.from((c || root).querySelectorAll(s));
  const svg = root.querySelector('.scene');
  const base = svg.getScreenCTM();
  const unit = (el) => { const m = el.getScreenCTM(); return m && base ? Math.hypot(m.a, m.b) / Math.hypot(base.a, base.b) || 1 : 1; };
  const pieces = (el) => {
    let k = Array.from(el.children).filter((e) => !/^(defs|style|title|desc|metadata)$/i.test(e.tagName));
    while (k.length === 1 && /^g$/i.test(k[0].tagName) && k[0].children.length) k = Array.from(k[0].children);
    return k;
  };
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.to({}, { duration: 12 }, 0);

  q('.beat').forEach((beat, i) => {
    const t0 = i * 4, layers = q('.layer', beat);
    if (i) tl.fromTo(beat, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none' }, t0);
    if (i < 2) tl.to(beat, { opacity: 0, duration: 0.3, ease: 'none' }, t0 + 3.7);

    if (style === 'a') { // hand-drawn storybook: ink lines first, colour washes in behind them
      const drawn = q('path,rect,circle,ellipse,line,polyline,polygon', beat).filter((el) => {
        if (el.closest('defs,clipPath,mask,pattern,symbol') || el.classList.contains('tline')) return false;
        const cs = getComputedStyle(el);
        let len = 0; try { len = el.getTotalLength(); } catch (e) { /* not rendered */ }
        if (!len || cs.opacity === '0' || (cs.fill === 'none' && cs.stroke === 'none')) return false;
        if (cs.stroke === 'none') { el.style.stroke = '#2b2118'; el.style.strokeWidth = 1.5 / unit(el); el.style.strokeLinejoin = 'round'; }
        el.style.strokeLinecap = 'round'; el.style.strokeDasharray = len;
        el._len = len; el._fill = parseFloat(cs.fillOpacity) || 0;
        return true;
      });
      if (drawn.length) {
        tl.fromTo(drawn, { strokeDashoffset: (j, el) => el._len }, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut', stagger: { amount: 1.4 } }, t0 + 0.1);
        tl.fromTo(drawn, { fillOpacity: 0 }, { fillOpacity: (j, el) => el._fill, duration: 0.9, ease: 'power1.out', stagger: { amount: 1.2 } }, t0 + 0.8);
      }
      const rest = q('text,image,use', beat);
      if (rest.length) tl.fromTo(rest, { opacity: 0 }, { opacity: 1, duration: 0.6 }, t0 + 1.4);
    } else if (style === 'b') { // layered cut paper: sheets drop in back to front, then pieces settle
      tl.fromTo(layers, { y: (j) => (j % 2 ? 44 : -44), rotation: (j) => (j % 2 ? 2.5 : -2.5), opacity: 0, svgOrigin: '480 320' },
        { y: 0, rotation: 0, opacity: 1, svgOrigin: '480 320', duration: 0.8, stagger: 0.16, ease: 'power3.out' }, t0 + 0.05);
      const cut = q('.art', beat).reduce((all, a) => all.concat(pieces(a)), []);
      cut.forEach((el) => { el._o = parseFloat(getComputedStyle(el).opacity); });
      if (cut.length) tl.fromTo(cut, { scale: 0.84, opacity: 0, transformOrigin: '50% 60%' },
        { scale: 1, opacity: (j, el) => el._o, transformOrigin: '50% 60%', duration: 0.5, ease: 'power3.out', stagger: { amount: 1.1 } }, t0 + 0.55);
    } else { // playful 2.5D: slow push-in with depth parallax
      tl.fromTo(q('.cam', beat), { scale: 1, svgOrigin: '480 340' }, { scale: 1.07, svgOrigin: '480 340', duration: 4, ease: 'sine.inOut' }, t0);
      layers.forEach((l) => {
        const d = parseFloat(l.getAttribute('data-depth')) || 0;
        tl.fromTo(l, { x: -32 * d, y: 6 * d }, { x: 32 * d, y: -4 * d, duration: 4, ease: 'sine.inOut' }, t0);
      });
    }
  });

  // Common to all three styles: the tape reaches the counter, the terminal prints four lines.
  tl.fromTo(q('.slide'), { x: -150 }, { x: 0, duration: 1.3, ease: 'power3.out' }, 8.5);
  tl.fromTo(q('.tline'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, transformOrigin: '0% 50%', duration: 0.45, stagger: 0.35, ease: 'power1.out' }, 9.4);
  q('.cap').forEach((c, i) => {
    tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, i * 4 + 0.05);
    if (i < 2) tl.to(c, { opacity: 0, duration: 0.25, ease: 'none' }, i * 4 + 3.75);
  });
  return tl;
}

// Player for the comparison page: one stage, rebuilt from its static markup on every style switch.
function initPlayer(CAPS) {
  const $ = (s) => document.querySelector(s);
  document.documentElement.classList.remove('no-js');
  const stage = $('#stage'), tpl = stage.innerHTML, cap = $('#caption'), seekIn = $('#seek'), clock = $('#clock'), playBtn = $('#play'), replayBtn = $('#replay'), tv = $('.tv'), hint = $('#hint');
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const frameTime = (i) => i * 4 + 3.4; // each beat fully settled, before its cross-fade
  const beatOf = (t) => Math.min(2, Math.floor(t / 4));
  // fresh = untouched poster: the settled first beat is on screen, but the transport reads "ready", not a time.
  let tl, style = 'a', capIdx = -1, playing = false, fresh = true, reduced = false;

  function setPlaying(p) { playing = p; playBtn.textContent = p ? 'Pause' : 'Play'; tv.dataset.playing = p; }
  function render() {
    const t = tl.time(), i = beatOf(t), ready = fresh && !reduced;
    if (i !== capIdx) { capIdx = i; cap.textContent = CAPS[i]; }
    seekIn.value = reduced ? i : ready ? 0 : t.toFixed(1);
    clock.textContent = reduced ? 'Frame ' + (i + 1) + ' of 3' : ready ? 'Ready · 0:12' : '0:' + String(Math.floor(t)).padStart(2, '0') + ' / 0:12';
    seekIn.setAttribute('aria-valuetext', reduced ? clock.textContent : ready ? 'Ready to play a 12-second sample' : t.toFixed(1) + ' of 12 seconds');
  }
  // Follows the OS setting live. Either direction ends paused; turning it on snaps to the current beat's settled frame.
  function setReduced(r) {
    reduced = r;
    tl.pause(); setPlaying(false);
    playBtn.hidden = replayBtn.hidden = r;
    seekIn.max = r ? 2 : 12; seekIn.step = r ? 1 : 0.1;
    $('#seek-label').textContent = r ? 'Frame' : 'Seek';
    hint.textContent = r ? 'Keyboard: ←/→ step through three still frames, A/B/C switch style. No sound.' : 'Keyboard: Space plays or pauses, ←/→ step one second, A/B/C switch style. No sound.';
    if (r) tl.time(frameTime(beatOf(tl.time())));
    render();
  }
  function build(time) {
    if (tl) tl.kill();
    stage.innerHTML = tpl; stage.dataset.style = style;
    tl = buildTimeline(stage, style);
    tl.eventCallback('onUpdate', render).eventCallback('onComplete', () => setPlaying(false));
    tl.time(time); setPlaying(false); render();
  }
  function seek(t) { fresh = false; tl.pause(); setPlaying(false); tl.time(Math.max(0, Math.min(12, t))); render(); }
  function toggle() {
    if (reduced) return;
    if (playing) { tl.pause(); return setPlaying(false); }
    const rewind = fresh || tl.time() >= 12;
    fresh = false;
    if (rewind) tl.time(0);
    tl.play(); setPlaying(true);
  }
  const step = (dir) => (reduced ? seek(frameTime(Math.max(0, Math.min(2, capIdx + dir)))) : seek((fresh ? 0 : tl.time()) + dir));

  playBtn.addEventListener('click', toggle);
  replayBtn.addEventListener('click', () => { fresh = false; tl.restart(); setPlaying(true); });
  seekIn.addEventListener('input', () => seek(reduced ? frameTime(+seekIn.value) : +seekIn.value));
  document.querySelectorAll('input[name=style]').forEach((r) => r.addEventListener('change', () => { style = r.value; build(tl.time()); }));
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) { tl.pause(); setPlaying(false); } });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input,button,summary,a,select,textarea')) return;
    const k = e.key.toLowerCase(), pick = { a: 'a', b: 'b', c: 'c', 1: 'a', 2: 'b', 3: 'c' }[k];
    if (k === ' ' || k === 'k') { e.preventDefault(); toggle(); }
    else if (k === 'arrowleft' || k === 'arrowright') { e.preventDefault(); step(k === 'arrowleft' ? -1 : 1); }
    else if (pick) { const r = $('input[name=style][value=' + pick + ']'); r.checked = true; r.dispatchEvent(new Event('change')); }
  });
  const onMotion = (e) => setReduced(e.matches);
  if (mq.addEventListener) mq.addEventListener('change', onMotion); else mq.addListener(onMotion);
  build(frameTime(0)); // settled poster, shown as "Ready"; Play starts from 0:00
  if (mq.matches) setReduced(true);
}

// ---- markup ---------------------------------------------------------------------------------

const FONTS = `@font-face{font-family:"Barlow Condensed";font-weight:700;font-display:block;src:url(data:font/ttf;base64,${FONT_HEAD}) format("truetype")}
@font-face{font-family:"Source Sans 3";font-weight:200 900;font-display:block;src:url(data:font/woff2;base64,${FONT_BODY}) format("woff2")}`;
// Per-style look inside the glass only; the shell never reads data-style.
const SCENE_CSS = `.scene{display:block;width:100%;height:100%;background:#f6ecd6}
[data-style=b] .scene{background:#eadcc0}[data-style=b] .paper{fill:#eadcc0}
[data-style=b] .layer{filter:drop-shadow(0 3px 0 rgba(43,33,24,.16)) drop-shadow(0 10px 10px rgba(43,33,24,.24))}
[data-style=c] .paper{fill:#f1e3c2}[data-style=c] .layer[data-depth="1"],[data-style=c] .layer[data-depth="0.9"]{filter:drop-shadow(0 8px 14px rgba(43,33,24,.22))}`;
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 .28 0 0 0 0 .2 0 0 0 0 .1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E")`;

const PAGE_CSS = `*,*::before,*::after{box-sizing:border-box}[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%}body{margin:0;background:#f4efe6;color:#1f1a14;font:400 1rem/1.5 "Source Sans 3",system-ui,sans-serif}
.wrap{max-width:620px;margin:0 auto;padding:clamp(16px,2.5vw,24px) clamp(12px,4vw,32px) 48px}
.kicker{margin:0 0 4px;font-size:.8125rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#7a6a52}
h1{margin:0;font:700 clamp(2.6rem,11vw,4.25rem)/.92 "Barlow Condensed","Arial Narrow",sans-serif;text-transform:uppercase;letter-spacing:.01em;overflow-wrap:anywhere}
.headline{margin:6px 0 16px;font-size:clamp(1.0625rem,3.6vw,1.375rem);font-weight:600;line-height:1.25;color:#3a3024}
.tv{margin:0}
.cab{position:relative;display:grid;grid-template-columns:minmax(0,1fr) clamp(62px,13%,96px);grid-template-areas:"screen panel" "deck deck";gap:clamp(8px,2vw,16px);padding:clamp(10px,2.6vw,22px);border-radius:clamp(16px,3.4vw,30px);
 background:${NOISE},radial-gradient(120% 80% at 18% 0%,rgba(255,250,235,.55),transparent 55%),linear-gradient(165deg,#dccaa8 0%,#c4ae88 46%,#a38b66 100%);
 box-shadow:inset 0 2px 0 rgba(255,252,240,.7),inset 2px 0 0 rgba(255,252,240,.25),inset 0 -8px 14px rgba(70,46,18,.38),inset -3px 0 8px rgba(70,46,18,.2),0 2px 0 #7d684a,0 26px 44px -18px rgba(48,30,10,.6)}
.bezel{grid-area:screen;padding:clamp(8px,2vw,16px);border-radius:clamp(14px,3.6vw,30px);background:linear-gradient(170deg,#3a322a,#1d1915 60%,#2a241e);box-shadow:inset 0 3px 8px rgba(0,0,0,.75),inset 0 -1px 0 rgba(255,240,210,.14),0 1px 0 rgba(255,250,235,.55),0 -1px 0 rgba(70,46,18,.45)}
.glass{position:relative;aspect-ratio:4/3;border-radius:9%/12%;overflow:hidden;background:#15120f;box-shadow:0 0 0 2px #0c0a08,0 0 0 3px rgba(255,240,210,.1)}
.glass::before,.glass::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none}
.glass::before{z-index:2;background:radial-gradient(60% 42% at 24% 12%,rgba(255,255,255,.2),transparent 70%),linear-gradient(122deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,.03) 24%,transparent 42%)}
.glass::after{z-index:1;background:repeating-linear-gradient(0deg,rgba(0,0,0,.06) 0 1px,transparent 1px 3px);box-shadow:inset 0 0 34px 10px rgba(0,0,0,.42),inset 0 0 4px 2px rgba(0,0,0,.6)}
#stage{position:absolute;inset:0}
.panel{grid-area:panel;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:10px;padding:10px 6px;border-radius:12px;background:linear-gradient(180deg,rgba(70,46,18,.2),rgba(70,46,18,.08));box-shadow:inset 0 2px 5px rgba(60,38,12,.4),0 1px 0 rgba(255,250,235,.5)}
.dial{width:clamp(34px,72%,54px);aspect-ratio:1;border-radius:50%;background:linear-gradient(#f3e9d2,#f3e9d2) 50% 12%/3px 26% no-repeat,radial-gradient(circle at 34% 28%,#6a5c4c,#2b241d 62%,#191511);box-shadow:0 0 0 3px #b9a37c,0 0 0 4px rgba(70,46,18,.5),0 5px 7px rgba(40,24,6,.5),inset 0 1px 1px rgba(255,255,255,.25)}
.dial+.dial{transform:rotate(48deg)}
.grille{flex:1;width:74%;min-height:26px;border-radius:6px;background:repeating-linear-gradient(0deg,#2a231c 0 3px,transparent 3px 8px);opacity:.72}
.led{width:9px;height:9px;border-radius:50%;background:#5d2a1f;box-shadow:inset 0 1px 1px rgba(0,0,0,.5),0 1px 0 rgba(255,250,235,.5);transition:background .3s,box-shadow .3s}
.tv[data-playing=true] .led{background:#ff6a45;box-shadow:0 0 7px rgba(255,106,69,.8),0 1px 0 rgba(255,250,235,.5)}
.deck{grid-area:deck;display:flex;align-items:center;gap:clamp(8px,2vw,14px);padding:2px clamp(2px,1vw,8px)}
.slot{flex:1;height:clamp(14px,3vw,20px);border-radius:4px;background:linear-gradient(#0f0d0b 0 46%,#3b332b 46% 54%,#221d18 54%);box-shadow:inset 0 2px 3px #000,0 1px 0 rgba(255,250,235,.55)}
.key{width:clamp(16px,4vw,26px);height:clamp(10px,2.2vw,14px);border-radius:3px;background:linear-gradient(#4a4037,#2a241e);box-shadow:0 2px 0 #17130f,0 3px 3px rgba(40,24,6,.4),inset 0 1px 0 rgba(255,255,255,.18)}
.feet{display:flex;justify-content:space-between;padding:0 12%}.feet i{width:13%;height:8px;border-radius:0 0 6px 6px;background:#3a3027}
#caption{margin:14px 0 0;min-height:2lh;font-size:clamp(1.0625rem,3.4vw,1.25rem);font-weight:600;line-height:1.3;text-wrap:balance}
.controls{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-top:4px;padding:12px;border:1px solid #d9cdb6;border-radius:14px;background:#fbf7ef}.controls>*{min-width:0}
fieldset{margin:0;padding:0;border:0;min-width:0}legend,.lab{padding:0;margin-bottom:6px;font-size:.8125rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#6b5b45}
.segs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,5.25rem),1fr));gap:6px}
.seg{position:relative;display:block;min-width:0}.seg span{min-width:0;overflow-wrap:anywhere}.seg input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.seg span{display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:6px 8px;border:1px solid #b9a98d;border-radius:10px;background:#fff;font-weight:600;line-height:1.15;text-align:center}
.seg b{font:700 1.25rem/1 "Barlow Condensed",sans-serif}.seg input:checked+span{background:#1f1a14;border-color:#1f1a14;color:#fbf7ef}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;min-width:0}
button{min-width:84px;min-height:44px;padding:0 16px;border:1px solid #1f1a14;border-radius:10px;background:#1f1a14;color:#fbf7ef;font:600 1rem/1 "Source Sans 3",system-ui,sans-serif;cursor:pointer}
#replay{background:#fff;color:#1f1a14}
.seekwrap{flex:1 1 200px;display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;min-width:0}.seekwrap .lab{margin:0}
#seek{flex:1 1 5rem;min-width:0;height:44px;margin:0;accent-color:#1f1a14;cursor:pointer}
#clock{min-width:min(100%,11ch);max-width:100%;margin-left:auto;font-variant-numeric:tabular-nums;font-weight:600;text-align:right;white-space:nowrap}
:is(button,#seek,summary,a):focus-visible,.seg input:focus-visible+span{outline:3px solid #0b57d0;outline-offset:2px}
.hint,.cite{margin:10px 0 0;font-size:.875rem;color:#5c4e3b}.cite a{color:inherit;overflow-wrap:anywhere}
details{margin-top:14px}summary{min-height:44px;display:flex;align-items:center;font-weight:600;cursor:pointer}ol{margin:4px 0 0;padding-left:1.25em}
.no-js .controls,.no-js .hint,.no-js #caption{display:none}.no-js .beat+.beat{display:none}
@media (max-width:520px){.cab{grid-template-columns:minmax(0,1fr);grid-template-areas:"screen" "panel" "deck"}.panel{flex-direction:row;padding:6px 12px}.dial{width:30px}.grille{min-height:0;height:22px;width:auto}.seekwrap{flex-basis:100%}.seg span{flex-direction:column;gap:2px}#caption{min-height:3lh}}
@media (max-width:360px){.controls{padding:10px}.seekwrap{flex-basis:100%}.seg span{flex-direction:column;gap:2px;padding:6px 4px;font-size:.9375rem}}
@media (prefers-reduced-motion:reduce){.led{transition:none}}`;

const transcript = `<ol>${CAPS.map((c, i) => `<li><span>${i * 4}–${i * 4 + 4}s:</span> ${esc(c)}</li>`).join('')}</ol>`;
const page = `<!doctype html>
<html lang="en" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blockbuster hero · style check v3 (A/B/C)</title>
<style>${FONTS}\n${PAGE_CSS}\n${SCENE_CSS}</style></head><body>
<main class="wrap">
<p class="kicker">Style check · one beat, three treatments</p>
<h1>Blockbuster</h1>
<p class="headline">${esc(HEADLINE)}</p>
<figure class="tv" data-playing="false" aria-label="Illustrated opening beat shown on a television set">
<div class="cab">
<div class="bezel"><div class="glass"><div id="stage" data-style="a">${scene()}</div></div></div>
<div class="panel" aria-hidden="true"><i class="dial"></i><i class="dial"></i><i class="grille"></i><i class="led"></i></div>
<div class="deck" aria-hidden="true"><i class="slot"></i><i class="key"></i><i class="key"></i><i class="key"></i></div>
</div><div class="feet" aria-hidden="true"><i></i><i></i></div>
</figure>
<p id="caption" aria-live="polite">${esc(CAPS[0])}</p>
<div class="controls">
<fieldset><legend>Animation style</legend><div class="segs">${Object.entries(STYLES).map(([k, v], i) => `<label class="seg"><input type="radio" name="style" value="${k}"${i ? '' : ' checked'}><span><b>${k.toUpperCase()}</b> ${v}</span></label>`).join('')}</div></fieldset>
<div class="row"><button type="button" id="play">Play</button><button type="button" id="replay">Replay</button>
<div class="seekwrap"><label class="lab" id="seek-label" for="seek">Seek</label><input type="range" id="seek" min="0" max="12" step="0.1" value="0" aria-valuetext="Ready to play a 12-second sample"><output id="clock" for="seek">Ready · 0:12</output></div></div>
</div>
<p class="hint" id="hint">Keyboard: Space plays or pauses, ←/→ step one second, A/B/C switch style. No sound.</p>
<details><summary>Transcript</summary>${transcript}</details>
<p class="cite">Source: <a href="${CITE.url}">${esc(CITE.label)}</a>. The “supermarket” headline is this article’s own framing.</p>
<p class="cite">Illustration: Original article artwork with illustrated shelves and checkout.</p>
</main>
<script>${GSAP}</script>
<script>${buildTimeline}\n${initPlayer}\ninitPlayer(${JSON.stringify(CAPS)});</script>
${NOTICES}
</body></html>`;

// HyperFrames composition: one standalone root, one full-length clip, one paused timeline registered by id.
// GSAP is loaded from the sample's own vendor/ copy (written below), so the page source holds only our code.
const sample = (k) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=960,height=720">
<title>Blockbuster · ${STYLES[k]} (sample ${k.toUpperCase()})</title>
<style>${FONTS}\nhtml,body{height:100%;margin:0;background:#15120f}
#root{position:relative;width:100%;height:100%;overflow:hidden}.clip{position:absolute;left:0;top:0;width:100%;height:100%}
.cap{position:absolute;left:0;right:0;bottom:0;margin:0;padding:16px 32px 18px;background:rgba(31,26,20,.86);color:#fbf7ef;font:600 28px/1.25 "Source Sans 3",system-ui,sans-serif}
${SCENE_CSS}</style></head><body>
<div id="root" data-composition-id="blockbuster-${k}" data-style="${k}" data-start="0" data-width="960" data-height="720" data-duration="12">
<div class="clip" id="clip-${k}" data-start="0" data-duration="12" data-track-index="0">${scene()}${CAPS.map((c, i) => `<p class="cap" id="cap-${k}-${i + 1}">${esc(c)}</p>`).join('')}</div>
</div>
<script src="vendor/gsap.min.js"></script>
<script>${buildTimeline}
window.__timelines = window.__timelines || {};
window.__timelines["blockbuster-${k}"] = buildTimeline(document.querySelector('[data-composition-id="blockbuster-${k}"]'), "${k}");</script>
${NOTICES}
</body></html>`;

const write = (rel, html) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log(`wrote ${file} (${(html.length / 1024).toFixed(0)} KB)`);
};
write('spectre-tv-style-check-v3.html', page);
if (!process.argv.includes('--no-samples')) for (const k of Object.keys(STYLES)) {
  write(`samples/${k}/index.html`, sample(k));
  // Byte-for-byte copy of the vendored runtime; each sample folder stays portable on its own.
  const vendor = path.join(OUT, 'samples', k, 'vendor');
  fs.mkdirSync(vendor, { recursive: true });
  fs.copyFileSync(`${OUT}/vendor/gsap.min.js`, path.join(vendor, 'gsap.min.js'));
  console.log(`copied ${path.join(vendor, 'gsap.min.js')}`);
}

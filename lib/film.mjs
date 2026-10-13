// The opening film a page can carry in its first screen: an edit decision list over supplied source films,
// the caption lines that run beside it, and the markup for the television that plays it. The same list drives
// scripts/build-opening.mjs (the encode, the stills and the editable HyperFrames source) and film.js.
import fs from 'node:fs';
import { esc, inline } from './md.mjs';

// Every cut is the whole 16:9 source picture at 1x. `in`/`out` are seconds in the source film, `start` is the
// position on the 35.7s timeline. Cue text comes from the essay; a footnote marker stays on the claim it supports.
// `text` is the transcript line; `summary` is the short line shown under the picture (80 characters at most, no
// footnote markers). The page plays `video`, a smaller encode of `masterVideo`.
export const FILMS = {
  blockbuster: {
    id: 'blockbuster-opening-v4',
    duration: 35.7, fps: 30, width: 1920, height: 1080,
    video: '/assets/media/blockbuster-opening-v4-web.mp4',
    masterVideo: '/assets/media/blockbuster-opening-v4.mp4',
    web: { width: 1280, height: 720, crf: 25 },
    stills: '/assets/media/blockbuster-opening-v4/',
    still: { width: 1280, height: 720 },
    sources: {
      sign: '01-the-sign.mp4',
      receipt: '02-the-receipt.mp4',
      lights: '03-9094-lights.mp4',
      anime: '04-struggling-not-to-laugh.mp4'
    },
    reserved: '05-insert-coin.mp4',
    poster: { source: 'sign', at: 3.2, alt: 'The Blockbuster sign lit over a rain-wet storefront with a neon OPEN sign.' },
    // the caption before Play: written to the reader; cut, duration and source detail stay in the transcript and EDL
    intro: 'Rain, receipts, and a rental empire. A 36-second opening film.',
    cuts: [
      { n: 1, source: 'sign', in: 0.4, out: 3.4, start: 0, label: 'The sign',
        still: { at: 3.2, alt: 'The Blockbuster sign lit over a rain-wet storefront with a neon OPEN sign.' },
        cues: [{ at: 0, summary: 'A store within a short drive of most American homes.', text: 'It had a store within a short drive of most American homes.' }] },
      { n: 2, source: 'receipt', in: 0.45, out: 3.0, start: 3, label: 'Dallas, 1985',
        still: { at: 2.9, alt: 'A printed receipt headed Blockbuster Video, Store #0001, Dallas, Texas, Oct 19 1985.' },
        cues: [{ at: 3, summary: 'Dallas, October 19, 1985. The first store opens.', text: 'The first Blockbuster opened in Dallas on October 19, 1985.[^20]' }] },
      { n: 3, source: 'lights', in: 1.45, out: 5.6, start: 5.55, label: '400 stores, 1988',
        still: { at: 3.2, alt: 'A disc of small lights labeled 1988, about 400 stores, 1 light = 1 store.' },
        cues: [{ at: 5.55, summary: 'Some 400 stores by 1988. Late fees were $692.6M in 1999.', text: 'By 1988 it had some 400 stores.[^20] In 1999 late fees were $692.6M, 15.5% of revenue.[^2]' }] },
      { n: 4, source: 'anime', in: 5.1, out: 13.3, start: 9.7, label: 'The meeting, 2000',
        still: { at: 9.6, alt: 'A cartoon executive hiding a laugh behind his fist. On-screen text: He was struggling not to laugh, as Marc Randolph tells it.' },
        cues: [
          { at: 9.7, summary: '2000: Netflix asks $50M to be bought, in Marc Randolph’s account.', text: "By Marc Randolph’s account, Netflix offered itself to Blockbuster for $50M in September 2000.[^18]" },
          { at: 12.9, summary: 'In Randolph’s account, Blockbuster turns the offer down.', text: "It was turned down. Randolph writes that John Antioco “was struggling not to laugh.”[^18]" },
          { at: 15.6, summary: 'The meeting is Marc Randolph’s account.', text: "The meeting is Marc Randolph’s account." }
        ] },
      { n: 5, source: 'lights', in: 7.7, out: 10.6, start: 17.9, label: '9,094 stores, 2004',
        still: { at: 9.6, alt: 'A disc of lights labeled 2004, 9,094 stores in 25 countries, $905.6M paid out to shareholders with borrowed money, long-term debt $1,119.7M at the end of 2004.' },
        cues: [{ at: 17.9, summary: '2004: 9,094 stores across 25 countries.', text:'Blockbuster ended 2004 with 9,094 stores in 25 countries, the most it ever had.[^6]' }] },
      { n: 6, source: 'receipt', in: 9.0, out: 14.4, start: 20.8, label: 'Payout and debt',
        still: { at: 12.8, alt: 'A receipt listing the 2004 borrowing, $905.6M paid to shareholders, and long-term debt of $75.1M in 2003 and $1,119.7M in 2004.' },
        cues: [
          { at: 20.8, summary: '2004: about $905.6M to shareholders, funded by borrowing.', text:'That year it paid shareholders about $905.6M, funded by new borrowing.[^5]' },
          { at: 22.6, summary: 'Long-term debt rises from $75.1M to $1,119.7M in a year.', text:'Long-term debt rose from $75.1M to $1,119.7M in a year.[^6]' },
          { at: 24.4, summary: 'Net losses in every year from 1997 to 2010 except 2006.', text:'It reported a net loss in every year from 1997 to 2010 except 2006.[^2][^6][^9][^10]' }
        ] },
      { n: 7, source: 'sign', in: 11.6, out: 14.3, start: 26.2, label: 'Chapter 11, 2010',
        still: { at: 12.8, alt: 'The sign with most of its letters dark. On-screen text: 2010: Chapter 11, nearly $1 billion in debt.' },
        cues: [{ at: 26.2, summary: 'September 23, 2010: Chapter 11, nearly $1 billion in debt.', text:'On September 23, 2010 it filed for Chapter 11 with nearly $1 billion of debt.[^11]' }] },
      { n: 8, source: 'lights', in: 13.5, out: 17.9, start: 28.9, label: 'The stores close',
        still: { at: 16.0, alt: 'The disc of lights almost dark, labeled 2014, about 50 franchised stores.' },
        cues: [
          { at: 28.9, summary: 'The corporate stores close by January 2014.', text:'Dish closed the corporate stores by January 2014.[^27]' },
          { at: 31.1, summary: 'About 50 franchises remain, then close one by one.', text:'About 50 franchised stores stayed open.[^27][^28] They closed one by one.[^29][^30]' }
        ] },
      { n: 9, source: 'sign', in: 17.6, out: 20.0, start: 33.3, label: 'Bend, Oregon',
        still: { at: 19.2, alt: 'The sign dark, the neon OPEN sign still lit. On-screen text: Bend, Oregon. Still open.' },
        cues: [{ at: 33.3, summary: 'Bend, Oregon. One franchise still rents films.', text:'One franchised store in Bend, Oregon still rents films under the name.[^29][^31]' }] }
    ]
  }
};

const r3 = n => +n.toFixed(3);
export const cutDuration = c => r3(c.out - c.in);
export const clock = t => `${Math.floor(Math.floor(t) / 60)}:${String(Math.floor(t) % 60).padStart(2, '0')}`;
export const stillName = c => `chapter-${String(c.n).padStart(2, '0')}.jpg`;

// Cuts must be adjacent and fill the timeline exactly; cues must sit inside their own cut, in order.
export function checkFilm(f) {
  let t = 0;
  for (const c of f.cuts) {
    if (!f.sources[c.source]) throw new Error(`${f.id}: cut ${c.n} uses unknown source "${c.source}"`);
    if (r3(c.start) !== r3(t)) throw new Error(`${f.id}: cut ${c.n} starts at ${c.start}, expected ${r3(t)}`);
    if (!(c.out > c.in) || c.still.at < c.in || c.still.at > c.out) throw new Error(`${f.id}: cut ${c.n} has an invalid range or still time`);
    t = r3(t + cutDuration(c));
    let last = c.start;
    for (const q of c.cues) {
      if (q.at < last || q.at >= t) throw new Error(`${f.id}: cut ${c.n} cue at ${q.at} is outside ${c.start}–${t}`);
      if (!q.summary || q.summary.length > 80 || /\[\^\d+\]/.test(q.summary)) throw new Error(`${f.id}: cut ${c.n} cue at ${q.at} needs a summary of 80 characters or fewer with no footnote marker`);
      last = q.at;
    }
  }
  if (t !== r3(f.duration)) throw new Error(`${f.id}: cuts end at ${t}, duration is ${f.duration}`);
  if (!f.intro || f.intro.length > 80) throw new Error(`${f.id}: needs an intro caption of 80 characters or fewer`);
  return f;
}

// One row per caption line, with the time it ends (the next line, or the end of the film).
export function cueList(f) {
  const rows = f.cuts.flatMap(c => c.cues.map(q => ({ ...q, cut: c })));
  return rows.map((q, i) => ({ ...q, end: i + 1 < rows.length ? rows[i + 1].at : f.duration }));
}

// The film a company page opens on, or null when it has none or the encode has not been built yet
// (node scripts/build-opening.mjs). A page without the file keeps its ordinary opener.
export function filmFor(slug, warn = () => {}) {
  const f = FILMS[slug];
  if (!f) return null;
  if (!fs.existsSync(new URL(`..${f.video}`, import.meta.url))) { warn(`opening film ${f.video} is not built; run node scripts/build-opening.mjs`); return null; }
  return checkFilm(f);
}

// The television, the caption line under it, the player controls and the transcript. Without JavaScript the
// video keeps its own controls and the transcript is a native disclosure; film.js swaps in the custom player.
// The film is not fetched until Play (preload="none"); only the poster frame loads with the page. The running
// time is shown rounded up (35.7s reads 0:36). The caption shows each cue's summary and the transcript keeps the
// full line with its footnotes; unseen copies of every summary hold the caption at its tallest at every width.
export function filmHero(f, c) {
  const id = `film-${esc(c.slug)}`, cues = cueList(f), total = clock(Math.ceil(f.duration));
  const intro = f.intro;
  const sizers = [intro, ...cues.map(q => q.summary)].map(s => `<span class="film-cap-size" aria-hidden="true">${esc(s)}</span>`).join('');
  const opts = f.cuts.map(k => `<option value="${k.n}" data-start="${k.start}" data-still="${esc(stillName(k))}" data-alt="${esc(k.still.alt)}">${k.n}. ${esc(k.label)}</option>`).join('');
  const lines = cues.map(q => `<li data-film-cue data-at="${q.at}" data-end="${q.end}" data-ch="${q.cut.n}" data-label="${esc(q.cut.label)}" data-cap="${esc(q.summary)}"><span class="film-line-t">${clock(q.at)}</span> ${inline(q.text)}</li>`).join('');
  return `<div class="hx-media film" data-film data-duration="${f.duration}" data-stills="${esc(f.stills)}">
<figure class="film-set" aria-labelledby="${id}-k">
<div class="film-tv">
<div class="film-bezel"><div class="film-glass">
<video class="film-video" id="${id}-v" controls muted playsinline preload="none" width="${f.width}" height="${f.height}" poster="${esc(f.stills)}poster.jpg" aria-label="${esc(c.name)} opening film, ${f.duration} seconds. Captions and a transcript follow.">
<source src="${esc(f.video)}" type="video/mp4">
<a href="${esc(f.video)}">Download the ${esc(c.name)} opening film (MP4)</a>
</video>
<img class="film-still" src="${esc(f.stills)}poster.jpg" alt="${esc(f.poster.alt)}" width="${f.still.width}" height="${f.still.height}" decoding="async" loading="lazy" hidden>
<span class="film-sheen" aria-hidden="true"></span>
</div></div>
<div class="film-panel" aria-hidden="true"><span class="film-lamp"></span><span class="film-knob"></span><span class="film-knob"></span><span class="film-grille"></span></div>
</div>
<figcaption class="film-cap">
<p class="film-cap-k" id="${id}-k"><span data-film-k>Opening film · ${total}</span><span class="film-status" role="status" data-film-status></span></p>
<div class="film-cap-t"><span class="film-cap-now" data-film-caption>${esc(intro)}</span>${sizers}</div>
</figcaption>
</figure>
<div class="film-ui">
<div class="film-controls" data-film-controls hidden>
<label class="film-seek"><span class="film-vh">Seek</span><input type="range" data-film-seek min="0" max="${f.duration}" step="0.1" value="0" aria-valuetext="0:00 of ${total}"></label>
<span class="film-clock" data-film-clock>0:00 / ${total}</span>
<button type="button" class="film-btn film-play" data-film-play>Play</button>
<button type="button" class="film-btn film-prev" data-film-prev hidden>Previous</button>
<button type="button" class="film-btn film-next" data-film-next hidden>Next</button>
<button type="button" class="film-btn film-sound" data-film-sound aria-pressed="false">Sound off</button>
<label class="film-chapter"><span class="film-vh">Chapter</span><select data-film-chapter>${opts}</select></label>
</div>
<noscript><p class="film-nojs"><span class="film-nojs-motion">The player’s own controls work here. </span>Every line is in the transcript.</p></noscript>
</div>
<details class="film-transcript"><summary>Transcript and sources <span class="film-transcript-n">${cues.length} lines</span></summary>
<ol class="film-lines">${lines}</ol>
<p class="film-note">The Netflix meeting is Marc Randolph’s account. Each figure links to the numbered sources.</p>
</details>
</div>`;
}

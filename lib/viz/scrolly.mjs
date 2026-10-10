import { esc } from '../md.mjs';
import { rivalchart } from './rivalchart.mjs';
export function scrolly(s, chapters, ctx) {
  if (!s.stage?.points?.length) throw new Error('scrolly story requires stage.points');
  const stage = rivalchart({ type: 'rivalchart', title: s.stage.title || s.stage.metric, metric: s.stage.metric, unit: s.stage.unit, note: s.stage.note, src: s.stage.src, series: [{ name: s.stage.metric, points: s.stage.points }] }, ctx);
  const links = s.chapters.map((c, i) => {
    const requested = c.stagePoint ?? s.stage.points.findIndex(p => String(c.when).includes(String(p.year)));
    const point = requested >= 0 ? Math.min(requested, s.stage.points.length - 1) : Math.round(i * (s.stage.points.length - 1) / Math.max(1, s.chapters.length - 1));
    return { index: i, point };
  });
  let i = 0;
  chapters = chapters.replace(/<article class="chap rv"/g, () => { const n = links[i++]; return `<article id="story-chapter-${n.index + 1}" data-stage-point="${n.point}" class="chap rv"`; });
  return `<div class="scrolly" data-scrolly><div class="scrolly-stage">${stage}<div class="scrolly-controls" hidden><button type="button" data-story-play aria-pressed="false">Play</button><button type="button" data-story-prev aria-label="Previous chapter">Previous</button><button type="button" data-story-next aria-label="Next chapter">Next</button><p data-stage-status role="status" aria-live="polite">${esc(s.chapters[0].title)}</p></div></div>${chapters}</div>`;
}

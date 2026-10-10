const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('v2-ready');
let returnFocus;
const dialog = $('#source-dialog');
export function openSources(link) {
  const list = document.getElementById(`sources-for-${link.dataset.cite}`);
  if (!dialog || !list || !dialog.showModal) { location.hash = 'sources'; return; }
  returnFocus = link;
  $('#source-dialog-list').innerHTML = list.innerHTML;
  dialog.showModal();
  $('[data-source-close]', dialog).focus();
}
function revealAnchor(hash) {
  const target = document.getElementById(hash.slice(1));
  for (let el = target?.parentElement; el; el = el.parentElement) if (el.tagName === 'DETAILS') el.open = true;
  target?.scrollIntoView({ block: 'center', behavior: 'instant' });
}
if (dialog) {
  dialog.addEventListener('close', () => returnFocus?.focus({ preventScroll: true }));
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target.closest('[data-source-close]')) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
    if (event.key !== 'Tab') return;
    const stops = $$('button, a[href], input, [tabindex="0"]', dialog), first = stops[0], last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}
const toggle = $('#citation-numbers');
if (toggle) {
  toggle.parentElement.hidden = false;
  try { toggle.checked = localStorage.getItem('sb-citation-numbers') === 'true'; } catch {}
  const apply = () => {
    document.documentElement.classList.toggle('citation-numbers', toggle.checked);
    try { localStorage.setItem('sb-citation-numbers', String(toggle.checked)); } catch {}
  };
  toggle.addEventListener('change', apply); apply();
}
let glossaryButton;
function closeGlossary() {
  if (!glossaryButton) return;
  glossaryButton.setAttribute('aria-expanded', 'false');
  document.getElementById(glossaryButton.getAttribute('aria-controls')).hidden = true;
  glossaryButton = null;
}
document.addEventListener('click', event => {
  const source = event.target.closest('.srcs');
  if (source && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey) { event.preventDefault(); openSources(source); return; }
  const jump = event.target.closest('.source-jump, .source-backs a');
  if (jump) {
    if (dialog?.open) dialog.close();
    requestAnimationFrame(() => revealAnchor(jump.hash));
  }
  const button = event.target.closest('.glossary-button');
  if (button) {
    const open = button.getAttribute('aria-expanded') !== 'true';
    closeGlossary();
    if (open) { glossaryButton = button; button.setAttribute('aria-expanded', 'true'); document.getElementById(button.getAttribute('aria-controls')).hidden = false; }
  } else if (!event.target.closest('.glossary-pop')) closeGlossary();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && glossaryButton) { const button = glossaryButton; closeGlossary(); button.focus(); }
});
document.addEventListener('focusin', event => { if (glossaryButton && !event.target.closest('.glossary-term')) closeGlossary(); });

$$('[data-scrolly]').forEach(root => {
  const chapters = $$('.chap', root), dots = $$('.v2-point', root), controls = $('.scrolly-controls', root), play = $('[data-story-play]', root);
  let current = 0, timer = null;
  const stop = () => { clearInterval(timer); timer = null; play.textContent = 'Play'; play.setAttribute('aria-pressed', 'false'); };
  const select = i => {
    current = Math.max(0, Math.min(i, chapters.length - 1));
    chapters.forEach((c, j) => c.classList.toggle('stage-current', j === current));
    dots.forEach(dot => dot.classList.toggle('stage-active', dot.dataset.point === `0-${chapters[current].dataset.stagePoint}`));
    $('[data-stage-status]', root).textContent = `Chapter ${current + 1}: ${$('h3', chapters[current]).textContent}`;
  };
  const step = direction => { stop(); select(current + direction); chapters[current].scrollIntoView({ block: 'start', behavior: 'instant' }); };
  $('[data-story-prev]', root).addEventListener('click', () => step(-1));
  $('[data-story-next]', root).addEventListener('click', () => step(1));
  play.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (reduced.matches) return;
    if (current === chapters.length - 1) select(0);
    play.textContent = 'Pause'; play.setAttribute('aria-pressed', 'true');
    chapters[current].scrollIntoView({ block: 'start', behavior: 'instant' });
    timer = setInterval(() => {
      if (document.hidden || current === chapters.length - 1) { stop(); return; }
      select(current + 1); chapters[current].scrollIntoView({ block: 'start', behavior: 'instant' });
    }, 4000);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (reduced.matches) return;
      const entry = entries.filter(e => e.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
      if (entry) select(chapters.indexOf(entry.target));
    }, { rootMargin: '-15% 0px -55% 0px' });
    chapters.forEach(c => io.observe(c));
  }
  const mode = () => { stop(); controls.hidden = reduced.matches; root.classList.toggle('scrolly-static', reduced.matches); if (reduced.matches) { chapters.forEach(c => c.classList.remove('stage-current')); dots.forEach(d => d.classList.remove('stage-active')); } else select(current); };
  reduced.addEventListener('change', mode); mode();
});

$$('[data-animated-timeline]').forEach(root => {
  const input = $('.timeline-scrub input', root), progress = $('progress', root), controls = $('.timeline-scrub', root);
  const set = (n, activate = false) => {
    const dots = $$('.tlx-dot', root);
    if (!dots.length || reduced.matches) return;
    n = Math.min(dots.length - 1, Math.max(0, n));
    input.value = n; progress.value = n + 1;
    dots.forEach((dot, i) => dot.classList.toggle('timeline-reached', i <= n));
    if (activate) dots[n].click();
  };
  input.addEventListener('input', () => set(+input.value, true));
  root.addEventListener('click', event => { const dot = event.target.closest('.tlx-dot'); if (dot) set($$('.tlx-dot', root).indexOf(dot)); });
  root.addEventListener('keydown', event => { if (event.target.matches('.tlx-dot')) requestAnimationFrame(() => set($$('.tlx-dot', root).indexOf(document.activeElement))); });
  let queued = false;
  const update = () => {
    queued = false;
    if (reduced.matches || root.contains(document.activeElement)) return;
    const rect = root.getBoundingClientRect(), fraction = Math.max(0, Math.min(1, (innerHeight * .75 - rect.top) / Math.max(1, rect.height)));
    set(Math.floor(fraction * +input.max), rect.bottom > 0 && rect.top < innerHeight);
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  const mode = () => { controls.hidden = reduced.matches; root.classList.toggle('timeline-animated', !reduced.matches); if (reduced.matches) $$('.tlx-dot', root).forEach(d => d.classList.remove('timeline-reached')); };
  reduced.addEventListener('change', mode); mode();
  const observer = new MutationObserver(() => { if ($('.tlx-dot', root)) { observer.disconnect(); update(); } });
  observer.observe($('.tlx-stage', root), { childList: true, subtree: true });
});

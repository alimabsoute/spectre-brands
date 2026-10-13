// The opening film's player. The markup works without this file: the video keeps its native controls and the
// transcript is a <details>. Here the native controls give way to Play/Pause/Replay, Sound, a seek bar, a clock and
// a chapter select, the caption line follows the picture, and a reader who prefers reduced motion gets one still
// per chapter with Previous and Next instead of the moving picture. Nothing plays until Play is pressed.
(() => {
  const fmt = t => { const s = Math.max(0, Math.floor(t)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  document.querySelectorAll('[data-film]').forEach(root => {
    const $ = s => root.querySelector(s);
    const video = $('video'), still = $('.film-still'), controls = $('[data-film-controls]');
    const play = $('[data-film-play]'), prev = $('[data-film-prev]'), next = $('[data-film-next]'), sound = $('[data-film-sound]');
    const seek = $('[data-film-seek]'), seekRow = seek?.closest('label'), clockEl = $('[data-film-clock]'), select = $('[data-film-chapter]');
    const caption = $('[data-film-caption]'), kicker = $('[data-film-k]'), status = $('[data-film-status]');
    const lines = [...root.querySelectorAll('[data-film-cue]')];
    if (!video || !controls || !play || !seek || !select || !caption || !lines.length) return;
    // The running time is shown rounded up (35.7s reads 0:36); the seek bar keeps the exact duration.
    const D = +root.dataset.duration, total = fmt(Math.ceil(D)), stills = root.dataset.stills, chapters = select.options.length;
    const cues = lines.map(el => ({ el, at: +el.dataset.at, end: +el.dataset.end, ch: +el.dataset.ch, label: el.dataset.label, text: el.dataset.cap }));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)'), off = new AbortController(), on = { signal: off.signal };
    let mode = '', cue = -1, started = false, failed = false, frame = 0, waitTimer = 0;

    const say = text => { status.textContent = text; status.parentElement.classList.toggle('has-status', !!text); };
    const cueAt = t => { let i = 0; cues.forEach((q, k) => { if (t >= q.at - .001) i = k; }); return i; };
    const label = () => {
      const ended = started && (video.ended || video.currentTime >= D - .05);
      root.toggleAttribute('data-film-ended', ended && !failed);
      play.textContent = failed ? 'Retry' : !video.paused ? 'Pause' : ended ? 'Replay' : 'Play';
    };
    function showCue(i) {
      if (i === cue) return;
      cue = i;
      const q = cues[i];
      caption.textContent = q.text;
      const same = cues.filter(x => x.ch === q.ch);
      kicker.textContent = `Chapter ${q.ch} of ${chapters} · ${q.label}${mode === 'stills' && same.length > 1 ? ` · ${same.indexOf(q) + 1}/${same.length}` : ''}`;
      select.value = String(q.ch);
      cues.forEach((x, k) => k === i ? x.el.setAttribute('aria-current', 'true') : x.el.removeAttribute('aria-current'));
      if (mode === 'stills') {
        const o = select.selectedOptions[0], src = stills + o.dataset.still;
        if (still.getAttribute('src') !== src) still.src = src;
        still.alt = o.dataset.alt;
        prev.disabled = i === 0; next.disabled = i === cues.length - 1;
      }
    }
    function render(t = video.currentTime) {
      t = Math.min(D, Math.max(0, t));
      seek.value = String(t);
      const now = t >= D - .05 ? total : fmt(t);
      seek.setAttribute('aria-valuetext', `${now} of ${total}`);
      clockEl.textContent = `${now} / ${total}`;
      if (started) showCue(cueAt(t));
    }
    const tick = () => { render(); frame = video.paused ? 0 : requestAnimationFrame(tick); };
    const playing = isOn => {
      root.toggleAttribute('data-film-playing', isOn);
      document.documentElement.toggleAttribute('data-film-playing', isOn);
      cancelAnimationFrame(frame); frame = isOn ? requestAnimationFrame(tick) : 0;
      label();
    };
    const settle = () => { clearTimeout(waitTimer); waitTimer = 0; if (!failed) say(''); };
    // A film that will not load hands the picture back to the native controls and offers Retry. The chapter
    // stills do not need the film, so the message waits until the moving picture is on screen.
    function fail() {
      failed = true; settle(); playing(false);
      if (mode !== 'stills') { video.controls = true; say('The film did not load. Retry reloads it.'); }
      label();
    }
    function start() {
      if (failed) { failed = false; say(''); video.controls = false; video.load(); }
      if (video.ended || video.currentTime >= D - .05) video.currentTime = 0;
      started = true;
      const p = video.play();
      if (p) p.catch(e => { if (e.name !== 'AbortError' && !failed) say('Playback did not start. Press Play again.'); label(); });
    }
    // Seeking or choosing a chapter pauses first, so the film never resumes on its own from the new position.
    const goTo = t => { started = true; if (!video.paused) video.pause(); if (!failed) video.currentTime = t; render(t); label(); };

    // Moving picture or chapter stills. Switching never starts playback.
    function setMode(stillsMode) {
      const t = started ? (mode === 'stills' && cue >= 0 ? cues[cue].at : video.currentTime) : 0;
      mode = stillsMode ? 'stills' : 'film';
      root.dataset.filmMode = mode;
      if (stillsMode) video.pause();
      video.hidden = stillsMode; still.hidden = !stillsMode;
      [play, sound, seekRow, clockEl].forEach(el => { el.hidden = stillsMode; });
      prev.hidden = next.hidden = !stillsMode;
      caption.setAttribute('aria-live', stillsMode ? 'polite' : 'off');
      const i = cueAt(t);
      cue = -1;
      if (stillsMode) { started = true; say(''); showCue(i); } else { if (started && !failed) video.currentTime = cues[i].at; render(started ? cues[i].at : 0); }
      if (failed) fail(); else label();
    }

    play.addEventListener('click', () => video.paused ? start() : video.pause(), on);
    sound.addEventListener('click', () => { video.muted = !video.muted; if (!video.muted && video.volume === 0) video.volume = 1; }, on);
    seek.addEventListener('input', () => goTo(+seek.value), on);
    select.addEventListener('change', () => {
      const t = +select.selectedOptions[0].dataset.start;
      if (mode === 'stills') showCue(cueAt(t)); else goTo(t);
    }, on);
    prev.addEventListener('click', () => showCue(Math.max(0, cue - 1)), on);
    next.addEventListener('click', () => showCue(Math.min(cues.length - 1, cue + 1)), on);

    video.addEventListener('play', () => { started = true; playing(true); }, on);
    video.addEventListener('playing', settle, on);
    video.addEventListener('canplay', settle, on);
    video.addEventListener('pause', () => { settle(); playing(false); render(); }, on);
    video.addEventListener('ended', () => { settle(); playing(false); render(D); }, on);
    video.addEventListener('seeked', () => { render(); label(); }, on);
    video.addEventListener('timeupdate', () => { if (!frame) render(); }, on);
    video.addEventListener('waiting', () => { if (!video.paused && !waitTimer) waitTimer = setTimeout(() => { waitTimer = 0; if (!video.paused && !failed) say(video.readyState < 2 ? 'Loading the film.' : 'Buffering.'); }, 600); }, on);
    video.addEventListener('volumechange', () => {
      const audible = !video.muted && video.volume > 0;
      sound.setAttribute('aria-pressed', String(audible)); sound.textContent = audible ? 'Sound on' : 'Sound off';
    }, on);
    video.addEventListener('error', fail, on);
    video.querySelector('source')?.addEventListener('error', fail, on);

    // Leaving the tab or scrolling the set out of view pauses the film; coming back does not restart it.
    document.addEventListener('visibilitychange', () => { if (document.hidden && !video.paused) video.pause(); }, on);
    const seen = 'IntersectionObserver' in window ? new IntersectionObserver(es => { if (!es.at(-1).isIntersecting && !video.paused) video.pause(); }) : null;
    seen?.observe(root);
    reduce.addEventListener('change', () => setMode(reduce.matches), on);
    // A page kept in the back/forward cache only pauses; a page that is going away releases everything.
    addEventListener('pagehide', e => {
      video.pause(); playing(false); clearTimeout(waitTimer); waitTimer = 0;
      if (!e.persisted) { seen?.disconnect(); off.abort(); }
    }, on);

    // The film is not fetched until Play (preload="none"), so a load failure arrives through the error events
    // above. If the custom player cannot start, the native controls stay.
    try {
      video.controls = false;
      controls.hidden = false;
      setMode(reduce.matches);
      if (video.error) fail();
    } catch (e) {
      off.abort(); seen?.disconnect();
      video.hidden = false; still.hidden = true; video.controls = true; controls.hidden = true;
    }
  });
})();

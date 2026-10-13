/* Free email updates: form requests, the mid-article prompt's timing, the top disclosure and the one-time
   confirmation burst. Markup comes from lib/updates.mjs, styles from assets/css/updates.css. No dependencies.
   The email address is never written to storage; storage holds only timestamps and state names. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;

  // Keep in step with UPDATES_TIMING in lib/updates.mjs (tests/updates.test.mjs compares the two).
  var TIMING = {
    activeMs: 45000,   // active reading time before the mid-article prompt may appear
    progress: 0.35,    // share of the article scrolled; required as well as activeMs
    cooldownDays: 30,  // how long a dismissal lasts
    tickMs: 1000,      // resolution of the active-reading clock
    pendingHours: 24,  // a pending request suppresses the prompt for as long as its link works
    requestMs: 12000,  // request timeout
    burstMs: 1150      // the confirmation burst is removed after this; under 1.2 seconds
  };
  var COPY = {
    button: 'Get updates',
    sending: 'Sending…',
    pending: 'Check your inbox to confirm.',
    emptyEmail: 'Enter your email address.',
    invalidEmail: 'Enter a complete email address, such as name@example.com.',
    consent: 'Tick the box to agree to receive email updates.',
    // These say what the reader should do. None of them says what the server did or did not keep: the script cannot know.
    rate: 'Too many requests from this connection in the last hour. This request was not processed. Try again later.',
    unavailable: 'Email updates are not available right now, and this request was not completed. Try again later.',
    network: 'No answer came back from the server, so this request may not have gone through. Check the connection and try again.'
  };
  var KEY = { dismissed: 'sb:upd:dismissed', state: 'sb:upd:state', shown: 'sb:upd:shown', accepted: 'sb:upd:accepted', celebrated: 'sb:upd:celebrated' };

  // Storage that never throws: with storage disabled it keeps the values in memory for the life of the page.
  function storage(kind) {
    var mem = {}, s = null;
    try { s = window[kind]; s.setItem('sb:upd:probe', '1'); s.removeItem('sb:upd:probe'); } catch (e) { s = null; }
    return {
      get: function (k) { var v = null; if (s) { try { v = s.getItem(k); } catch (e) { v = null; } } return v != null ? v : (k in mem ? mem[k] : null); },
      set: function (k, v) { mem[k] = String(v); if (s) { try { s.setItem(k, String(v)); } catch (e) { /* memory copy stands */ } } }
    };
  }
  var local = storage('localStorage'), session = storage('sessionStorage');

  function reducedMotion() {
    return root.getAttribute('data-upd-motion') === 'reduce' || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function isPreview(el) { return !!(el && el.closest && el.closest('[data-upd-preview]')); }
  function subscriptionState() {
    var raw = local.get(KEY.state) || '', at = raw.indexOf(':'), name = at < 0 ? raw : raw.slice(0, at), ts = at < 0 ? 0 : Number(raw.slice(at + 1)) || 0;
    if (name === 'confirmed') return 'confirmed';
    if (name === 'pending' && Date.now() - ts < TIMING.pendingHours * 3600000) return 'pending';
    return '';
  }

  // ---------- reading conditions ----------
  var holds = 0;
  // An embedded player exists only once its poster has been activated (assets/js/runtime.js swaps the poster for
  // the iframe). Its pause state cannot be read from here, so one on screen counts as playing.
  var PLAYER_FRAMES = 'iframe[src*="youtube.com/embed"],iframe[src*="youtube-nocookie.com/embed"],[data-embed] iframe';
  function onScreen(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom <= 0 || r.top >= window.innerHeight) return false;
    var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
    return !cs || (cs.display !== 'none' && cs.visibility !== 'hidden');
  }
  function mediaPlaying() {
    // data-film-playing is set by assets/js/film.js on the TV and on <html> while the film plays
    if (holds > 0 || doc.querySelector('[data-upd-hold],[data-film-playing]')) return true;
    var media = doc.querySelectorAll('video,audio');
    for (var i = 0; i < media.length; i++) {
      var m = media[i];
      if (!m.paused && !m.ended && !(m.muted && m.loop)) return true; // a muted loop is decoration, not viewing
    }
    var frames = doc.querySelectorAll(PLAYER_FRAMES);
    for (var j = 0; j < frames.length; j++) if (onScreen(frames[j])) return true;
    var a = doc.activeElement;
    return !!(a && a.tagName === 'IFRAME'); // focus is inside an embedded player
  }
  function typing() {
    var a = doc.activeElement;
    if (!a || a === doc.body) return false;
    return /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable || !!(a.closest && a.closest('form'));
  }
  // The source overlay is a <dialog>; the glossary popover and the site and section menus mark themselves open.
  function overlayOpen() {
    if (doc.querySelector('dialog[open],[aria-modal="true"]:not([hidden]),.mnav:not([hidden]),.glossary-button[aria-expanded="true"],.dd.open,.pn-g.open')) return true;
    try { return !!doc.querySelector(':popover-open'); } catch (e) { return false; }
  }
  function conditions() {
    return { visible: doc.visibilityState === 'visible', focused: doc.hasFocus(), mediaPlaying: mediaPlaying(), typing: typing(), overlayOpen: overlayOpen() };
  }
  function isReading(s) { return !!(s.visible && s.focused && !s.mediaPlaying && !s.typing && !s.overlayOpen); }
  // Pure: whether the mid-article prompt may appear for a state such as the one SpectreUpdates.state() returns.
  // It reads nothing from the page, so it can be checked with made-up states.
  function eligibility(s) {
    var b = [];
    if (s.suppressed) b.push('suppressed');
    if (!s.visible) b.push('tab-hidden');
    if (!s.focused) b.push('window-unfocused');
    if (s.mediaPlaying) b.push('media');
    if (s.typing) b.push('typing');
    if (s.overlayOpen) b.push('overlay');
    if (!(s.activeMs >= TIMING.activeMs)) b.push('active-time');
    if (!(s.progress >= TIMING.progress)) b.push('progress');
    if (!s.placementSafe) b.push('placement');
    return { eligible: b.length === 0, blockers: b };
  }
  function articleProgress() {
    var el = doc.querySelector('[data-upd-article]') || doc.querySelector('main article') || doc.querySelector('main') || doc.body;
    var r = el.getBoundingClientRect(), h = r.height || 1;
    return Math.max(0, Math.min(1, (window.innerHeight - r.top) / h));
  }

  // ---------- forms ----------
  function normalize(value) {
    var v = String(value || '').replace(/[​-‍﻿]/g, '').trim(), at = v.lastIndexOf('@');
    return at < 1 ? v : v.slice(0, at) + '@' + v.slice(at + 1).toLowerCase();
  }
  function validEmail(v) {
    if (!v || v.length > 254) return false;
    var at = v.lastIndexOf('@');
    return at > 0 && at <= 64 && /^[^\s@<>()",;:\\]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(v);
  }
  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16), s = '';
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(b); else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
    for (var j = 0; j < 16; j++) s += (b[j] + 256).toString(16).slice(1);
    return s;
  }
  function part(form, sel) { return form.querySelector(sel); }
  function showError(form, name, text) {
    var p = part(form, '[data-upd-err="' + name + '"]'), field = part(form, '[name="' + name + '"]');
    if (p) { p.textContent = text; p.hidden = !text; }
    if (field) { if (text) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid'); }
  }
  function setStatus(form, text, kind) {
    var p = part(form, '.upd-status');
    if (!p) return;
    p.textContent = text || '';
    if (kind) p.setAttribute('data-kind', kind); else p.removeAttribute('data-kind');
  }
  function setLoading(form, on) {
    var btn = part(form, '.upd-btn'), email = part(form, '[name="email"]');
    form.setAttribute('data-upd-state', on ? 'loading' : 'idle');
    if (btn) { btn.disabled = on; btn.textContent = on ? COPY.sending : COPY.button; if (on) btn.setAttribute('aria-busy', 'true'); else btn.removeAttribute('aria-busy'); }
    if (email) email.readOnly = on;
  }
  // The backend accepted the request (202). This is "pending", never "subscribed": nothing is confirmed yet.
  function accepted(form) {
    var hadFocus = form.contains(doc.activeElement), fields = part(form, '.upd-fields'), email = part(form, '[name="email"]'), status = part(form, '.upd-status');
    var consent = part(form, '[name="consent"]'), again = part(form, '[data-upd-again]');
    setLoading(form, false);
    form.setAttribute('data-upd-state', 'pending');
    if (email) email.value = '';
    if (consent) consent.checked = false; // another request is a new agreement
    if (fields) fields.hidden = true;
    if (again) again.hidden = false;
    setStatus(form, COPY.pending, 'pending');
    form._intent = null; form._rid = null;
    if (hadFocus && status) { try { status.focus({ preventScroll: true }); } catch (e) { status.focus(); } }
    if (!isPreview(form)) { local.set(KEY.state, 'pending:' + Date.now()); session.set(KEY.accepted, '1'); }
    measureTop();
  }
  // "Request another link": the pending line gives way to the empty form again. The address was never kept, so
  // the reader types it again, and the new request gets a new request id.
  function onAgain(e) {
    var form = e.currentTarget.closest('form'), fields = part(form, '.upd-fields'), again = part(form, '[data-upd-again]'), email = part(form, '[name="email"]');
    if (again) again.hidden = true;
    if (fields) fields.hidden = false;
    setStatus(form, '');
    form.setAttribute('data-upd-state', 'idle');
    if (email) email.focus();
    measureTop();
  }
  function failed(form, text, focusField) {
    setLoading(form, false);
    form.setAttribute('data-upd-state', 'error');
    if (text) setStatus(form, text, 'error');
    if (focusField) focusField.focus();
    measureTop();
  }
  function send(form, payload) {
    var mode = form.getAttribute('data-upd-preview');
    if (mode !== null || isPreview(form)) { // review screens never touch the network
      return new Promise(function (resolve) { setTimeout(function () { resolve({ status: mode === 'error' ? 503 : mode === 'rate' ? 429 : 202, body: {} }); }, 500); });
    }
    var ctl = window.AbortController ? new AbortController() : null, timer = ctl ? setTimeout(function () { ctl.abort(); }, TIMING.requestMs) : 0;
    return fetch(form.getAttribute('action') || '/api/updates/subscribe', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: ctl ? ctl.signal : undefined,
      headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(payload)
    }).then(function (res) {
      clearTimeout(timer);
      return res.json().catch(function () { return {}; }).then(function (body) { return { status: res.status, body: body || {} }; });
    }, function (err) { clearTimeout(timer); throw err; });
  }
  function onSubmit(e) {
    var form = e.currentTarget;
    e.preventDefault();
    if (form.getAttribute('data-upd-state') === 'loading' || form.getAttribute('data-upd-state') === 'pending') return;
    var input = part(form, '[name="email"]'), consent = part(form, '[name="consent"]'), hp = part(form, '[name="website"]');
    var email = normalize(input.value), bad = null;
    showError(form, 'email', ''); showError(form, 'consent', ''); setStatus(form, '');
    if (!validEmail(email)) { showError(form, 'email', email ? COPY.invalidEmail : COPY.emptyEmail); bad = input; }
    if (!consent.checked) { showError(form, 'consent', COPY.consent); bad = bad || consent; }
    if (bad) { form.setAttribute('data-upd-state', 'error'); bad.focus(); measureTop(); return; }
    input.value = email;
    // one request id per intent: a retry of the same address from the same form reuses it, so the backend can drop duplicates
    var placement = form.getAttribute('data-placement') || '', intent = email + '|' + placement;
    if (form._intent !== intent || !form._rid) { form._intent = intent; form._rid = newId(); }
    setLoading(form, true);
    send(form, { email: email, consent: true, source: location.pathname, placement: placement, requestId: form._rid, website: hp ? hp.value : '' }).then(function (r) {
      if (r.status === 202) return accepted(form);
      if (r.status === 400 && r.body.error === 'invalid_email') { showError(form, 'email', COPY.invalidEmail); return failed(form, '', input); }
      if (r.status === 400 && r.body.error === 'consent_required') { showError(form, 'consent', COPY.consent); return failed(form, '', consent); }
      failed(form, r.status === 429 ? COPY.rate : COPY.unavailable);
    }, function () { failed(form, COPY.network); });
  }
  function initForms() {
    var forms = doc.querySelectorAll('form[data-upd-form]');
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i], source = part(form, '[name="source"]'), again = part(form, '[data-upd-again] button');
      form.noValidate = true; // the script validates and reports through the linked error text
      if (source) source.value = location.pathname;
      form.addEventListener('submit', onSubmit);
      if (again) again.addEventListener('click', onAgain);
      if (form.getAttribute('data-upd-preview') === 'pending') accepted(form);
    }
  }

  // ---------- top row: a native disclosure whose summary sticks below the chapter nav where there is room ----------
  var topEl = null, topBox = null, topSummary = null, topQuery = null, topFrame = 0;
  function stickyNavHeight() {
    var navs = doc.querySelectorAll('[data-upd-sticky-nav],.pagenav,.pm-toc'), h = 0;
    for (var i = 0; i < navs.length; i++) {
      var cs = getComputedStyle(navs[i]);
      if (cs.display !== 'none' && cs.position === 'sticky' && (parseFloat(cs.top) || 0) === 0) h = Math.max(h, navs[i].getBoundingClientRect().height);
    }
    return Math.round(h);
  }
  // Only the collapsed summary is sticky and only its height is measured: under html.upd-sticky the open body is
  // a panel beneath the summary (assets/css/updates.css), so opening it never makes the sticky row taller. The
  // offset is the nav's height as laid out now, whichever nav this width shows.
  function measureTop() {
    if (!topEl || !topQuery) return;
    cancelAnimationFrame(topFrame);
    topFrame = requestAnimationFrame(function () {
      if (topEl.hidden || !topSummary || !topQuery.matches) {
        root.classList.remove('upd-sticky'); root.style.removeProperty('--upd-nav-h'); root.style.removeProperty('--upd-top-h');
        return;
      }
      root.style.setProperty('--upd-nav-h', stickyNavHeight() + 'px');
      root.style.setProperty('--upd-top-h', Math.round(topSummary.getBoundingClientRect().height) + 'px');
      root.classList.add('upd-sticky');
    });
  }
  // Escape with focus inside the open disclosure closes it and returns focus to its summary. Opening and closing
  // are otherwise the browser's own; nothing here opens the disclosure or moves focus into it.
  function onTopKey(e) {
    if (e.key !== 'Escape' || e.defaultPrevented || !topBox.open || !topBox.contains(doc.activeElement)) return;
    e.preventDefault(); // handled: the mid-article prompt's Escape listener leaves it alone
    topBox.open = false;
    topSummary.focus();
  }
  function initTop() {
    topEl = doc.querySelector('[data-upd="top"]');
    if (!topEl) return;
    if (subscriptionState() && !isPreview(topEl)) { topEl.hidden = true; topEl = null; return; } // already asked or already confirmed
    topBox = topEl.querySelector('details'); topSummary = topBox && topBox.querySelector('summary');
    if (topSummary) { topBox.addEventListener('keydown', onTopKey); topBox.addEventListener('toggle', measureTop); }
    if (!window.matchMedia) return;
    // wide and tall, or a tall phone: the row is one line, and it sits below the sticky nav rather than over it
    topQuery = window.matchMedia('(min-width:900px) and (min-height:640px), (max-width:899.98px) and (min-height:700px)');
    window.addEventListener('resize', measureTop, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(measureTop).observe(topEl);
    measureTop();
  }

  // ---------- mid-article prompt ----------
  var mid = null, lastOutside = null, clock = { active: 0, seen: 0, slot: null };
  function midSuppressed() {
    if (session.get(KEY.shown) || session.get(KEY.accepted) || subscriptionState()) return true;
    var at = Number(local.get(KEY.dismissed)) || 0;
    return at > 0 && Date.now() - at < TIMING.cooldownDays * 86400000;
  }
  // Inline on narrow screens: reveal it only while it sits below the viewport, so no text the reader is on moves.
  function placementSafe(slot) {
    if (window.matchMedia && window.matchMedia('(min-width:900px)').matches) return true;
    return slot.getBoundingClientRect().top >= window.innerHeight;
  }
  function showMid(preview) {
    mid.hidden = false; // no focus() here: the reader keeps their place
    if (!reducedMotion()) mid.classList.add('upd-in-view');
    if (!preview) session.set(KEY.shown, '1');
  }
  // Hiding the inline prompt after the reader has scrolled past it would pull the text below it upward. The
  // scroll position is corrected by however far the next element moved, which is zero for the fixed card and
  // zero where the browser has already anchored the scroll itself.
  function hideInPlace(el) {
    var slot = el.closest('[data-upd-slot]') || el, ref = slot.nextElementSibling;
    var before = ref && slot.getBoundingClientRect().top < 0 ? ref.getBoundingClientRect().top : null;
    el.hidden = true;
    if (before === null) return;
    var moved = ref.getBoundingClientRect().top - before;
    if (moved) window.scrollBy(0, moved);
  }
  function closeMid() {
    if (!mid || mid.hidden) return;
    var inside = mid.contains(doc.activeElement);
    hideInPlace(mid);
    if (!isPreview(mid)) local.set(KEY.dismissed, String(Date.now()));
    // focus returns to where it was only if it had been inside the prompt; a reader's focus is left alone
    if (inside && lastOutside && lastOutside.isConnected) { try { lastOutside.focus({ preventScroll: true }); } catch (e) { lastOutside.focus(); } }
  }
  function initMid() {
    mid = doc.querySelector('[data-upd="mid"]');
    if (!mid) return;
    var slot = mid.closest('[data-upd-slot]') || mid.parentNode, closer = mid.querySelector('[data-upd-close]');
    if (closer) closer.addEventListener('click', closeMid);
    doc.addEventListener('focusin', function (e) { if (!mid.contains(e.target)) lastOutside = e.target; });
    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented || mid.hidden || overlayOpen()) return;
      closeMid();
    });
    clock.slot = slot;
    if (isPreview(mid)) { showMid(true); return; }
    if (midSuppressed()) return;
    var timer = 0;
    function onScroll() { clock.seen = Math.max(clock.seen, articleProgress()); }
    function stop() { clearInterval(timer); window.removeEventListener('scroll', onScroll); }
    window.addEventListener('scroll', onScroll, { passive: true });
    timer = setInterval(function () {
      if (midSuppressed()) { stop(); return; }
      var s = conditions();
      if (!isReading(s)) return; // hidden tab, typing, media playing or an overlay open: the clock stops and nothing appears
      clock.active += TIMING.tickMs; onScroll();
      s.suppressed = false; s.activeMs = clock.active; s.progress = clock.seen; s.placementSafe = placementSafe(slot);
      if (eligibility(s).eligible) { stop(); showMid(false); }
    }, TIMING.tickMs);
  }
  // What the prompt's timer sees right now, with the verdict eligibility() gives it. Read-only, for browser QA.
  function midState() {
    var s = conditions();
    s.suppressed = !mid || midSuppressed(); s.activeMs = clock.active; s.progress = clock.seen;
    s.placementSafe = !!clock.slot && placementSafe(clock.slot); s.shown = !!(mid && !mid.hidden);
    var e = eligibility(s);
    s.eligible = e.eligible; s.blockers = e.blockers;
    return s;
  }

  // ---------- confirmation ----------
  // Runs only on the backend's "confirmed" page, which exists only for a confirmation the backend has just made.
  function burst() {
    if (reducedMotion()) return; // the page's static stubs are the whole celebration
    var layer = doc.createElement('div'), n = 26;
    layer.className = 'upd-confetti'; layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) {
      var s = doc.createElement('i');
      s.className = i % 2 ? 'b' : 'a';
      s.style.setProperty('--x', (4 + (92 * i) / (n - 1) + (Math.random() * 4 - 2)).toFixed(1) + '%');
      s.style.setProperty('--dx', Math.round(Math.random() * 120 - 60) + 'px');
      s.style.setProperty('--r', Math.round(Math.random() * 540 - 270) + 'deg');
      s.style.setProperty('--d', (Math.random() * 0.2).toFixed(2) + 's');
      s.style.setProperty('--t', (0.75 + Math.random() * 0.15).toFixed(2) + 's');
      layer.appendChild(s);
    }
    doc.body.appendChild(layer);
    setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, TIMING.burstMs);
  }
  function initConfirmed() {
    var page = doc.querySelector('[data-upd-confirmed]');
    if (!page) return;
    if (isPreview(page)) { if (page.getAttribute('data-upd-confirmed') === 'new') burst(); return; }
    var fresh = page.getAttribute('data-upd-confirmed') === 'new' && !local.get(KEY.celebrated);
    local.set(KEY.state, 'confirmed');
    if (!fresh) return;
    local.set(KEY.celebrated, '1'); // durable: a reload or a second click never replays the burst
    burst();
  }

  // The film and TV players can pause the reading clock: SpectreUpdates.hold() / .release(), the events
  // spectre:updates-hold / spectre:updates-release, or a [data-upd-hold] attribute on any element while they play.
  // state() and eligibility() only report; nothing here, and nothing in the page URL, can make the prompt appear.
  window.SpectreUpdates = {
    TIMING: TIMING,
    state: midState,
    eligibility: eligibility,
    hold: function () { holds++; },
    release: function () { holds = Math.max(0, holds - 1); },
    closePrompt: closeMid
  };
  doc.addEventListener('spectre:updates-hold', function () { holds++; });
  doc.addEventListener('spectre:updates-release', function () { holds = Math.max(0, holds - 1); });

  function init() { initConfirmed(); initForms(); initTop(); initMid(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();

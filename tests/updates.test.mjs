// Email updates: markup, emails and the double opt-in backend. Everything here is synthetic: addresses are on
// example.test, mail goes to an in-memory mock, and no test opens a network connection.
// Run: node --test tests/updates.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { updatesTop, updatesMid, updatesFooter, updatesConfirmationPreview, updatesDocument, confirmationEmail, welcomeEmail, UPDATES_TIMING, UPDATES_MARK, UPDATES_STATES, SITE_DESCRIPTION } from '../lib/updates.mjs';
import worker, { createUpdatesHandler, MemoryStore, D1Store, resendMailer, readUpdatesConfig, normalizeEmail, safeEqual, sha256, LIMITS } from '../backend/updates-worker.mjs';
import { MARK } from '../lib/layout.mjs';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const read = rel => fs.readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const ORIGIN = 'https://updates.example.test';
const SECRET = 'synthetic-test-secret-not-a-credential-0123456789';
const POSTAL = 'Synthetic Sender, 1 Test Street, Testville';
const count = (s, re) => (s.match(re) || []).length;

function setup({ postalAddress = POSTAL, failSend = false } = {}) {
  const sent = [], tried = [], logs = [], clock = { t: Date.UTC(2026, 9, 11, 12, 0, 30) };
  // fail: true answers 500; 'throw' is an outage with no answer at all. `tried` holds every message handed over.
  const mailer = {
    fail: failSend,
    async send(m) {
      tried.push(m);
      if (this.fail === 'throw') throw new Error('synthetic outage');
      if (this.fail) return { ok: false, status: 500 };
      sent.push(m); return { ok: true, status: 200, id: `mock-${sent.length}` };
    }
  };
  const store = new MemoryStore();
  const handler = createUpdatesHandler({ store, mailer, config: { origin: ORIGIN, tokenSecret: SECRET, postalAddress }, now: () => clock.t, log: (event, fields) => logs.push({ event, ...fields }) });
  return { handler, store, mailer, sent, tried, logs, clock };
}
const NO_WELCOME = { sent: 0, failed: 0, held: 0, cancelled: 0, review: 0 };
const FORM = 'application/x-www-form-urlencoded';
const post = (path, body, { ip = '203.0.113.7', origin = ORIGIN, type = 'application/json' } = {}) => new Request(`${ORIGIN}/api/updates${path}`, {
  method: 'POST', headers: { ...(origin ? { origin } : {}), 'content-type': type, 'cf-connecting-ip': ip }, body: typeof body === 'string' ? body : JSON.stringify(body)
});
const get = path => new Request(`${ORIGIN}/api/updates${path}`);
const sub = (email, extra = {}) => ({ email, consent: true, source: '/pets-com/', placement: 'footer', requestId: `req-${email.replace(/\W/g, '')}-1`, website: '', ...extra });
const tokenIn = mail => new URL(mail.text.match(/https:\/\/\S+/)[0]).searchParams.get('t');
const confirmPost = token => post('/confirm', `t=${encodeURIComponent(token)}`, { type: 'application/x-www-form-urlencoded' });

test('markup: three placements share one form with unique ids, labels, consent, honeypot and status', () => {
  const html = updatesTop({ slug: 'pets-com' }) + updatesMid({ slug: 'pets-com' }) + updatesFooter({ slug: 'pets-com' });
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique across placements');
  for (const p of ['top', 'mid', 'footer']) {
    assert.match(html, new RegExp(`<label for="upd-${p}-email">Email</label><input type="email" id="upd-${p}-email" name="email" autocomplete="email"`));
    assert.match(html, new RegExp(`aria-describedby="upd-${p}-email-err upd-${p}-status"`));
    assert.match(html, new RegExp(`<input type="checkbox" id="upd-${p}-consent" name="consent" value="yes" required aria-describedby="upd-${p}-consent-err">`));
    assert.match(html, new RegExp(`id="upd-${p}-status" role="status" aria-live="polite"`));
    assert.match(html, new RegExp(`name="placement" value="${p}"`));
  }
  assert.equal(count(html, />Get updates<\/button>/g), 3);
  assert.equal(count(html, /name="website" tabindex="-1" autocomplete="off"/g), 3);
  assert.equal(count(html, /name="source" value="\/pets-com\/"/g), 3);
  assert.equal(count(html, /free email updates from Spectre Brands\. I can unsubscribe at any time\./g), 3);
  assert.match(updatesMid(), /<aside class="upd upd-mid" id="upd-mid" data-upd="mid" aria-labelledby="upd-mid-h" hidden>/);
  assert.match(updatesMid(), /data-upd-close aria-label="Close the email updates prompt"/);
  assert.doesNotMatch(updatesMid(), /role="dialog"|aria-modal|autofocus/);
  assert.equal(count(html, /<form class="upd-form" id="upd-(top|mid|footer)-form" data-upd-form/g), 3, 'all three placements remain');
  assert.doesNotMatch(html, /password|sign in|log in|account|member|premium|\$|per month|weekly|daily/i);
  assert.doesNotMatch(updatesTop({ slug: '"><script>' }), /<script>/);
  assert.match(updatesTop({ preview: true }), /data-upd-preview/);
  assert.doesNotMatch(updatesTop(), /data-upd-preview/);
});

test('top placement: a closed native disclosure that holds the unchanged form and works without the script', () => {
  const top = updatesTop({ slug: 'pets-com' });
  assert.match(top, /^<aside class="upd upd-top" id="upd-top" data-upd="top" aria-labelledby="upd-top-h">\s*<details class="upd-top-d">\s*<summary class="upd-top-s">/);
  assert.doesNotMatch(top, /<details[^>]*\sopen/, 'closed until the reader opens it');
  assert.match(top, /<span class="upd-top-t" id="upd-top-h">Free email updates<\/span>/);
  assert.equal(count(top, /<details/g), 1); assert.equal(count(top, /<summary/g), 1);
  // nothing but the browser is needed to open it or to send the form
  assert.doesNotMatch(top, /role="dialog"|aria-modal|autofocus|popover|<script|\son[a-z]+="/);
  const body = top.slice(top.indexOf('</summary>'), top.indexOf('</details>'));
  assert.match(body, /<form class="upd-form" id="upd-top-form" data-upd-form data-placement="top" action="\/api\/updates\/subscribe" method="post">/);
  assert.match(body, /<button type="submit" class="upd-btn" id="upd-top-submit">Get updates<\/button>/);
  // the same form as the footer's, differing only in its placement name
  const neutral = html => html.match(/<form[\s\S]*<\/form>/)[0].replace(/upd-(top|footer)/g, 'upd-X').replace(/(data-placement|name="placement" value)="(top|footer)"/g, '$1="X"');
  assert.equal(neutral(body), neutral(updatesFooter({ slug: 'pets-com' })));

  const css = read('assets/css/updates.css');
  assert.match(css, /\.upd-top-s \.upd-in\{[^}]*min-height:2\.75rem/, 'the summary is at least 44px tall');
  assert.match(css, /html\.upd-sticky \.upd-top-body\{[^}]*position:absolute[^}]*max-height:calc\(100dvh[^}]*overflow:auto/, 'an open body never makes the sticky row taller and scrolls inside itself');
  assert.doesNotMatch(css, /\.upd-top-body\{[^}]*display:none/, 'the stylesheet never hides the body: the details element does');
  const hp = css.match(/\.upd-hp\{[^}]*\}/)[0];
  assert.match(hp, /clip-path:inset\(50%\)/);
  assert.doesNotMatch(hp, /left:|right:|text-indent|-\d{2,}/, 'the honeypot is clipped in place, not parked off screen');
});

// The client script run against a hand-made page: a top row with an open-able disclosure and nothing else.
test('top disclosure: Escape with focus inside closes it and returns focus to the summary; only the summary is measured', () => {
  const listeners = {}, vars = {}, classes = new Set(), query = { matches: true };
  let focused = null;
  const summary = { focus() { focused = summary; document.activeElement = summary; }, getBoundingClientRect: () => ({ height: 44 }) };
  const email = {}, elsewhere = {};
  const details = { open: false, addEventListener(type, fn) { listeners[type] = fn; }, querySelector: sel => sel === 'summary' ? summary : null, contains: el => el === summary || el === email };
  const top = { hidden: false, querySelector: sel => sel === 'details' ? details : null, getBoundingClientRect: () => ({ height: 320 }) };
  const document = {
    documentElement: { getAttribute: () => null, classList: { add: c => classes.add(c), remove: c => classes.delete(c) }, style: { setProperty(k, v) { vars[k] = v; }, removeProperty(k) { delete vars[k]; } } },
    readyState: 'complete', activeElement: null, addEventListener() {},
    querySelector: sel => sel === '[data-upd="top"]' ? top : null, querySelectorAll: () => []
  };
  const window = { matchMedia: () => query, addEventListener() {} };
  vm.runInNewContext(read('assets/js/updates.js'), { window, document, requestAnimationFrame(fn) { fn(); return 1; }, cancelAnimationFrame() {} });

  assert.equal(details.open, false, 'the script never opens the disclosure');
  assert.equal(focused, null, 'and never takes focus');
  assert.ok(classes.has('upd-sticky'));
  assert.deepEqual(vars, { '--upd-nav-h': '0px', '--upd-top-h': '44px' });

  const press = (key, defaultPrevented = false) => { const e = { key, defaultPrevented, preventDefault() { e.defaultPrevented = true; } }; listeners.keydown(e); return e; };
  details.open = true; listeners.toggle();
  assert.equal(vars['--upd-top-h'], '44px', 'opening does not grow the sticky row');
  document.activeElement = email;
  press('Enter'); assert.equal(details.open, true);
  press('Escape', true); assert.equal(details.open, true, 'a key another handler took is left alone');
  document.activeElement = elsewhere;
  assert.equal(press('Escape').defaultPrevented, false); assert.equal(details.open, true, 'focus outside: not this disclosure’s key');
  document.activeElement = email;
  assert.equal(press('Escape').defaultPrevented, true, 'handled, so the mid-article prompt does not close on the same key');
  assert.equal(details.open, false); assert.equal(focused, summary); assert.equal(document.activeElement, summary);
  assert.equal(press('Escape').defaultPrevented, false, 'already closed: the key passes through');

  query.matches = false; listeners.toggle();
  assert.equal(classes.has('upd-sticky'), false); assert.deepEqual(vars, {}, 'no room: the row goes back into the page flow');
});

test('timing constants match the client script, and shared text matches the site', () => {
  const js = read('assets/js/updates.js');
  assert.match(js, new RegExp(`activeMs: ${UPDATES_TIMING.activeMs},`));
  assert.match(js, new RegExp(`progress: ${UPDATES_TIMING.progress},`));
  assert.match(js, new RegExp(`cooldownDays: ${UPDATES_TIMING.cooldownDays},`));
  assert.deepEqual([UPDATES_TIMING.activeMs, UPDATES_TIMING.progress, UPDATES_TIMING.cooldownDays], [45000, 0.35, 30]);
  assert.match(js, /pending: 'Check your inbox to confirm\.'/);
  assert.doesNotMatch(js, /setItem\([^)]*email/i, 'the address is never stored');
  assert.equal(UPDATES_MARK, MARK);
  assert.equal(SITE_DESCRIPTION, JSON.parse(read('site.json')).description);
  const css = read('assets/css/updates.css');
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.upd-confetti\{[^}]*pointer-events:none/);
});

test('state pages: only a fresh confirmation is marked for celebration', () => {
  for (const state of UPDATES_STATES) assert.match(updatesConfirmationPreview({ state }), new RegExp(`data-upd-state="${state}"`));
  assert.match(updatesConfirmationPreview({ state: 'confirmed' }), /data-upd-confirmed="new"[\s\S]*You’re on the list!/);
  assert.match(updatesConfirmationPreview({ state: 'repeat' }), /data-upd-confirmed="repeat"/);
  assert.doesNotMatch(updatesConfirmationPreview({ state: 'pending' }), /data-upd-confirmed|You’re on the list/);
  assert.match(updatesConfirmationPreview({ state: 'pending' }), /Check your inbox to confirm\./);
  assert.match(updatesConfirmationPreview({ state: 'review' }), /<form class="upd-page-form" method="post" action="https:\/\/preview\.invalid\/api\/updates\/confirm">/);
  const page = updatesDocument({ state: 'review', origin: ORIGIN, token: 'a"b<c' });
  assert.match(page, /value="a&quot;b&lt;c"/);
  assert.doesNotMatch(page, /<style|style="/, 'the served page needs no inline style');
});

test('emails: confirmation is transactional, welcome needs a configured postal address', () => {
  const c = confirmationEmail({ confirmUrl: 'https://preview.invalid/api/updates/confirm?t=x&y=1' });
  assert.equal(c.subject, 'Confirm your subscription');
  for (const body of [c.html, c.text]) {
    assert.match(body, /You asked for email updates from Spectre Brands\./);
    assert.match(body, /If you did not request this email, ignore it\. You will not be added\./);
    assert.doesNotMatch(body, /unsubscribe|account|member|password|Street|You’re on the list/i);
  }
  assert.match(c.html, /href="https:\/\/preview\.invalid\/api\/updates\/confirm\?t=x&amp;y=1"/);
  assert.match(c.html, /width="600"/); assert.match(c.html, /<b style="font-weight:700">Spectre<\/b> Brands/);
  assert.doesNotMatch(c.html, /<link|@import|@font-face|<script|<img/);
  assert.throws(() => confirmationEmail({ confirmUrl: 'javascript:alert(1)' }), TypeError);
  assert.throws(() => confirmationEmail({ confirmUrl: 'http://preview.invalid/' }), TypeError);

  const w = welcomeEmail({ unsubscribeUrl: 'https://preview.invalid/api/updates/unsubscribe?t=x', postalAddress: POSTAL, siteUrl: 'https://preview.invalid/' });
  assert.equal(w.subject, 'You’re on the list!');
  for (const body of [w.html, w.text]) { assert.match(body, /You’re on the list!/); assert.match(body, /Unsubscribe/); assert.match(body, /1 Test Street/); assert.match(body, /every figure linked to its source\./); }
  assert.match(w.text, /Unsubscribe: https:\/\/preview\.invalid\/api\/updates\/unsubscribe\?t=x/);
  for (const postalAddress of [undefined, '', '   ']) assert.throws(() => welcomeEmail({ unsubscribeUrl: 'https://preview.invalid/u', postalAddress }), e => e.code === 'postal_address_missing');
});

test('default Worker answers 503 until every setting is present', async () => {
  const fakeDb = { prepare() { throw new Error('not used'); } };
  const full = { UPDATES_ENABLED: 'true', UPDATES_DB: fakeDb, RESEND_API_KEY: 'synthetic', UPDATES_TOKEN_SECRET: SECRET, UPDATES_ORIGIN: ORIGIN };
  assert.equal(readUpdatesConfig(full).ok, true);
  for (const drop of Object.keys(full)) {
    const env = { ...full }; delete env[drop];
    assert.deepEqual(readUpdatesConfig(env).missing, [drop]);
    const res = await worker.fetch(post('/subscribe', sub('reader@example.test')), env);
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: 'updates_unavailable' });
  }
  assert.equal((await worker.fetch(get('/confirm?t=x'), {})).status, 503);
  assert.equal(readUpdatesConfig({ ...full, UPDATES_ENABLED: 'false' }).ok, false);
  assert.equal(readUpdatesConfig({ ...full, UPDATES_TOKEN_SECRET: 'short' }).ok, false);
  assert.equal(readUpdatesConfig({ ...full, UPDATES_ORIGIN: 'http://insecure.example.test' }).ok, false);
  assert.equal(readUpdatesConfig({ ...full, UPDATES_POSTAL_ADDRESS: 'REPLACE_WITH_ADDRESS' }).config.postalAddress, '');
  const example = JSON.parse(read('backend/updates-config.example.json'));
  assert.equal(example.vars.UPDATES_ENABLED, 'false');
  // the example file's own values never open the handler, even switched on and long enough
  const copied = { ...full, ...example.vars, UPDATES_ENABLED: 'true', ...example._secrets };
  assert.ok(example._secrets.UPDATES_TOKEN_SECRET.length >= 32);
  assert.deepEqual(readUpdatesConfig(copied).missing, ['RESEND_API_KEY', 'UPDATES_TOKEN_SECRET']);
  assert.equal(readUpdatesConfig(copied).config.tokenSecret, '');
  assert.equal((await worker.fetch(post('/subscribe', sub('reader@example.test')), copied)).status, 503);
  for (const fake of ['REPLACE_ME_REPLACE_ME_REPLACE_ME_REPLACE_ME', 'placeholder-placeholder-placeholder-0000', 'your-api-key-goes-here-your-api-key-here', '<paste the 32 character secret in here>', 'changeme-changeme-changeme-changeme-1234', 'x'.repeat(40), ` ${SECRET}`]) {
    assert.deepEqual(readUpdatesConfig({ ...full, UPDATES_TOKEN_SECRET: fake }).missing, ['UPDATES_TOKEN_SECRET'], fake);
    assert.deepEqual(readUpdatesConfig({ ...full, RESEND_API_KEY: fake }).missing, ['RESEND_API_KEY'], fake);
  }
  assert.equal(readUpdatesConfig(full).config.origin, ORIGIN);
  assert.equal(readUpdatesConfig(full).config.sender, 'Spectre Brands <hello@spectrebrands.com>');
});

test('an oversized body is cut off while it streams, with or without a content-length', async () => {
  const { handler, sent } = setup();
  let pulls = 0, cancelled = false;
  const endless = new ReadableStream({ pull(c) { pulls++; c.enqueue(new Uint8Array(1024).fill(32)); }, cancel() { cancelled = true; } }, { highWaterMark: 0 });
  const streamed = body => new Request(`${ORIGIN}/api/updates/subscribe`, { method: 'POST', headers: { origin: ORIGIN, 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7' }, body, duplex: 'half' });
  const res = await handler(streamed(endless));
  assert.equal(res.status, 413); assert.deepEqual(await res.json(), { error: 'body_too_large' });
  assert.equal(cancelled, true, 'the rest of the body is cancelled, not drained');
  assert.ok(pulls <= 4, `read stops just past the cap (${pulls} chunks of 1 KB)`);

  // a declared length over the cap is refused before anything is read
  let read = 0;
  const unread = new ReadableStream({ pull(c) { read++; c.enqueue(new Uint8Array(16)); c.close(); } }, { highWaterMark: 0 });
  const declared = new Request(`${ORIGIN}/api/updates/confirm`, { method: 'POST', headers: { origin: ORIGIN, 'content-type': FORM, 'content-length': String(LIMITS.bodyBytes + 1) }, body: unread, duplex: 'half' });
  assert.equal((await handler(declared)).status, 413); assert.equal(read, 0);

  // a small body in several chunks is read whole
  const parts = JSON.stringify(sub('chunked@example.test')), half = Math.ceil(parts.length / 2), bytes = new TextEncoder();
  const small = new ReadableStream({ start(c) { c.enqueue(bytes.encode(parts.slice(0, half))); c.enqueue(bytes.encode(parts.slice(half))); c.close(); } });
  assert.equal((await handler(streamed(small))).status, 202);
  assert.equal(sent.length, 1); assert.equal(sent[0].to, 'chunked@example.test');
});

test('subscribe validates origin, content type, size, email and consent, and ignores bots quietly', async () => {
  const { handler, sent, store } = setup();
  assert.equal((await handler(post('/subscribe', sub('a@example.test'), { origin: 'https://evil.example.test' }))).status, 403);
  assert.equal((await handler(post('/subscribe', sub('a@example.test'), { origin: '' }))).status, 403);
  assert.equal((await handler(post('/subscribe', sub('a@example.test'), { type: 'text/plain' }))).status, 415);
  assert.equal((await handler(post('/subscribe', { ...sub('a@example.test'), pad: 'x'.repeat(LIMITS.bodyBytes) }))).status, 413);
  assert.equal((await handler(post('/subscribe', '{not json'))).status, 400);
  for (const email of ['', 'nope', 'a@b', 'a b@example.test', 'a@example.test\r\nbcc: x@example.test', `${'x'.repeat(65)}@example.test`, 42]) {
    const res = await handler(post('/subscribe', sub('a@example.test', { email })));
    assert.equal(res.status, 400); assert.equal((await res.json()).error, 'invalid_email');
  }
  for (const consent of [false, 'true', 1, undefined]) assert.equal((await (await handler(post('/subscribe', sub('a@example.test', { consent })))).json()).error, 'consent_required');
  const bot = await handler(post('/subscribe', sub('bot@example.test', { website: 'https://spam.example.test' })));
  assert.equal(bot.status, 202); assert.deepEqual(await bot.json(), { status: 'pending' });
  assert.equal((await handler(new Request(`${ORIGIN}/api/updates/subscribe`))).status, 405);
  assert.equal((await handler(get('/nothing'))).status, 404);
  assert.equal(sent.length, 0); assert.equal(store.pending.size, 0); assert.equal(store.subscribers.size, 0);
  assert.equal(normalizeEmail('  Reader@Example.TEST '), 'reader@example.test');
  assert.equal(safeEqual('abc', 'abc'), true); assert.equal(safeEqual('abc', 'abd'), false); assert.equal(safeEqual('abc', 'ab'), false);
});

test('subscribe stores a pending request only, sends one confirmation, and answers every case the same way', async () => {
  const { handler, sent, store, clock } = setup();
  const first = await handler(post('/subscribe', sub('reader@example.test')));
  assert.equal(first.status, 202); assert.deepEqual(await first.json(), { status: 'pending' });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'reader@example.test'); assert.equal(sent[0].kind, 'confirmation'); assert.equal(sent[0].subject, 'Confirm your subscription');
  assert.match(sent[0].idempotencyKey, /^updates-confirm-[0-9a-f]{40}-1$/);
  assert.equal(store.subscribers.size, 0, 'no subscriber before confirmation');
  const [pending] = [...store.pending.values()];
  assert.equal(pending.source, '/pets-com/'); assert.equal(pending.placement, 'footer'); assert.equal(pending.consentAt, clock.t); assert.ok(pending.consentVersion);
  const token = tokenIn(sent[0]);
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(pending.tokenHash, await sha256(token)); assert.ok(!JSON.stringify([...store.pending.values()]).includes(token), 'only the hash and a nonce are stored');
  assert.equal(pending.sendStatus, 'sent'); assert.equal(pending.lastSentAt, clock.t);
  assert.ok(sent[0].text.includes(`${ORIGIN}/api/updates/confirm?t=`), 'links stay on the configured origin');

  // same request id: no second email
  assert.equal((await handler(post('/subscribe', sub('reader@example.test')))).status, 202);
  // new request id inside the cooldown: no second email
  assert.equal((await handler(post('/subscribe', sub('reader@example.test', { requestId: 'req-second-0001' })))).status, 202);
  assert.equal(sent.length, 1);
  // after the cooldown a new request sends the same link again under a new key, up to three in the hour
  clock.t += LIMITS.emailCooldownMs + 1;
  await handler(post('/subscribe', sub('reader@example.test', { requestId: 'req-third-00001', source: '/blockbuster/' }), { ip: '203.0.113.8' }));
  assert.equal(sent.length, 2);
  assert.equal(tokenIn(sent[1]), token, 'the first link is not rotated away');
  assert.equal(sent[1].idempotencyKey, sent[0].idempotencyKey.replace(/-1$/, '-2'));
  assert.equal(sent[1].html, sent[0].html);
  assert.equal(store.pending.size, 1); assert.equal([...store.pending.values()][0].source, '/blockbuster/');
  assert.equal([...store.pending.values()][0].tokenExpiresAt, clock.t + LIMITS.tokenTtlMs, 'the link lasts 24 hours from the latest email');
  clock.t += LIMITS.emailCooldownMs + 1;
  const limited = await handler(post('/subscribe', sub('reader@example.test', { requestId: 'req-fourth-0001' }), { ip: '203.0.113.9' }));
  assert.equal(limited.status, 202); assert.deepEqual(await limited.json(), { status: 'pending' });
  assert.equal(sent.length, 2, 'the fourth request of the hour for one address sends nothing');
});

test('subscribe limits each client address to five requests an hour without storing the address', async () => {
  const { handler, store, sent, clock } = setup();
  for (let i = 0; i < 5; i++) assert.equal((await handler(post('/subscribe', sub(`r${i}@example.test`)))).status, 202);
  const blocked = await handler(post('/subscribe', sub('r5@example.test')));
  assert.equal(blocked.status, 429); assert.equal(blocked.headers.get('retry-after'), '3600');
  assert.equal(sent.length, 5);
  assert.equal((await handler(post('/subscribe', sub('r6@example.test'), { ip: '198.51.100.4' }))).status, 202);
  assert.doesNotMatch(JSON.stringify([...store.rate.keys()]), /203\.0\.113\.7|198\.51\.100\.4|example\.test/);
  clock.t += LIMITS.hourMs;
  assert.equal((await handler(post('/subscribe', sub('r7@example.test')))).status, 202);
});

test('a failed confirmation send stays queued, and a retry of the same request sends the same link under the same key', async () => {
  const { handler, store, sent, tried, mailer, clock, logs } = setup({ failSend: true });
  const res = await handler(post('/subscribe', sub('reader@example.test')));
  assert.equal(res.status, 202); assert.deepEqual(await res.json(), { status: 'pending' });
  assert.equal(store.subscribers.size, 0); assert.equal(sent.length, 0); assert.equal(tried.length, 1);
  const [row] = [...store.pending.values()];
  assert.equal(row.sendStatus, 'failed'); assert.equal(row.lastSentAt, 0); assert.equal(row.sendFirstAt, clock.t);
  assert.equal(row.source, '/pets-com/'); assert.equal(row.placement, 'footer'); assert.equal(row.consentAt, clock.t); assert.ok(row.consentVersion);
  const token = tokenIn(tried[0]), firstAt = clock.t;
  assert.equal(row.tokenHash, await sha256(token)); assert.ok(!JSON.stringify(row).includes(token), 'the token itself is not stored');
  assert.ok(logs.some(l => l.event === 'confirmation_queued'));

  // the same request again: once with no answer from the provider, once after it recovers
  mailer.fail = 'throw'; clock.t += 1000;
  assert.equal((await handler(post('/subscribe', sub('reader@example.test')))).status, 202);
  mailer.fail = false; clock.t += 1000;
  assert.equal((await handler(post('/subscribe', sub('reader@example.test')))).status, 202);
  assert.equal(tried.length, 3); assert.equal(sent.length, 1);
  for (const m of tried) {
    assert.equal(m.idempotencyKey, tried[0].idempotencyKey);
    assert.equal(m.html, tried[0].html); assert.equal(m.text, tried[0].text); assert.equal(m.subject, tried[0].subject);
  }
  assert.equal([...store.pending.values()][0].sendFirstAt, firstAt, 'the first attempt time is kept');
  // once delivered, the same request sends nothing more
  await handler(post('/subscribe', sub('reader@example.test')));
  assert.equal(tried.length, 3);
  assert.match(await (await handler(confirmPost(token))).text(), /data-upd-confirmed="new"/, 'the link from the first attempt confirms');
});

test('a provider outage answers known and unknown addresses identically', async () => {
  const { handler, store, sent, tried, mailer, clock } = setup();
  await handler(post('/subscribe', sub('known@example.test')));
  await handler(confirmPost(tokenIn(sent[0])));
  assert.equal(store.subscribers.size, 1);
  clock.t += LIMITS.hourMs; tried.length = 0;
  const shape = async res => JSON.stringify([res.status, [...res.headers].sort(), await res.text()]);
  const formBody = (email, id) => `email=${encodeURIComponent(email)}&consent=yes&source=%2Fpets-com%2F&placement=top&requestId=${id}&website=`;
  let n = 0;
  for (const fail of [true, 'throw', false]) {
    mailer.fail = fail; n++;
    const known = await shape(await handler(post('/subscribe', sub('known@example.test', { requestId: `req-known-000${n}` }))));
    const unknown = await shape(await handler(post('/subscribe', sub(`new${n}@example.test`), { ip: '203.0.113.20' })));
    assert.equal(unknown, known, `JSON answers match (provider ${fail})`);
    assert.equal(JSON.parse(unknown)[0], 202); assert.equal(JSON.parse(JSON.parse(unknown)[2]).status, 'pending');
  }
  mailer.fail = true;
  const knownPage = await shape(await handler(post('/subscribe', formBody('known@example.test', 'req-form-known-1'), { type: FORM, ip: '203.0.113.21' })));
  const unknownPage = await shape(await handler(post('/subscribe', formBody('formnew@example.test', 'req-form-new-01'), { type: FORM, ip: '203.0.113.22' })));
  assert.equal(unknownPage, knownPage, 'form answers match');
  const page = JSON.parse(unknownPage);
  assert.equal(page[0], 202);
  assert.match(page[2], /Check your inbox to confirm\./); assert.match(page[2], /request another link/);
  assert.doesNotMatch(page[2], /on its way|You’re on the list/);
  // the outage left nobody confirmed and nothing lost: each new address is a queued pending row
  assert.equal(store.subscribers.size, 1);
  assert.deepEqual([...store.pending.values()].map(p => [p.email, p.sendStatus]).sort(), [['formnew@example.test', 'failed'], ['new1@example.test', 'failed'], ['new2@example.test', 'failed'], ['new3@example.test', 'sent']]);
  assert.equal(tried.filter(m => m.to === 'known@example.test').length, 0);
});

test('a queued confirmation is never re-sent under an expired key, and a stale row gets a new link', async () => {
  const { handler, store, tried, sent, mailer, clock } = setup({ failSend: 'throw' });
  await handler(post('/subscribe', sub('reader@example.test')));
  const first = tried[0], token = tokenIn(first);
  // the manual helper retries inside the window, with the same key and payload
  clock.t += LIMITS.hourMs;
  assert.deepEqual(await handler.retryConfirmations(), { sent: 0, queued: 1, skipped: 0 });
  assert.equal(tried.length, 2); assert.equal(tried[1].idempotencyKey, first.idempotencyKey); assert.equal(tried[1].html, first.html);

  // 23 hours after the first attempt the key may be gone: neither the helper nor a repeat of the request re-sends
  clock.t += LIMITS.idempotencyMs; mailer.fail = false;
  assert.ok([...store.pending.values()][0].tokenExpiresAt > clock.t, 'the link itself is still live');
  assert.deepEqual(await handler.retryConfirmations(), { sent: 0, queued: 0, skipped: 1 });
  assert.equal((await handler(post('/subscribe', sub('reader@example.test')))).status, 202);
  assert.equal(tried.length, 2);
  // a new request is a new delivery of the same link, under a new key
  assert.equal((await handler(post('/subscribe', sub('reader@example.test', { requestId: 'req-another-0001' })))).status, 202);
  assert.equal(tried.length, 3); assert.equal(sent.length, 1);
  assert.equal(tokenIn(tried[2]), token); assert.equal(tried[2].idempotencyKey, first.idempotencyKey.replace(/-1$/, '-2'));

  // once the link has expired, the next request gets a new link and the old one is dead
  clock.t += LIMITS.tokenTtlMs + 1;
  await handler(post('/subscribe', sub('reader@example.test', { requestId: 'req-stale-00001' })));
  assert.equal(tried.length, 4);
  const renewed = tokenIn(tried[3]);
  assert.notEqual(renewed, token); assert.notEqual(tried[3].idempotencyKey.slice(0, -2), first.idempotencyKey.slice(0, -2)); assert.match(tried[3].idempotencyKey, /-1$/);
  assert.equal((await handler(confirmPost(token))).status, 400);
  assert.equal(store.subscribers.size, 0);
  assert.match(await (await handler(confirmPost(renewed))).text(), /data-upd-confirmed="new"/);
});

test('two requests racing for a new address share one link', async () => {
  const { handler, store, tried } = setup();
  await Promise.all([
    handler(post('/subscribe', sub('racer@example.test', { requestId: 'req-race-00001' }))),
    handler(post('/subscribe', sub('racer@example.test', { requestId: 'req-race-00002' }), { ip: '203.0.113.30' }))
  ]);
  assert.equal(store.pending.size, 1);
  assert.equal(tried.length, 1, 'one claim wins the delivery');
  assert.equal(await sha256(tokenIn(tried[0])), [...store.pending.values()][0].tokenHash);
});

test('confirmation: GET changes nothing, POST confirms once, concurrent and repeated clicks send one welcome', async () => {
  const { handler, store, sent } = setup();
  await handler(post('/subscribe', sub('reader@example.test')));
  const token = tokenIn(sent[0]);

  const review = await handler(get(`/confirm?t=${token}`));
  assert.equal(review.status, 200);
  const reviewHtml = await review.text();
  assert.match(reviewHtml, /data-upd-state="review"/); assert.match(reviewHtml, new RegExp(`action="${ORIGIN}/api/updates/confirm"`));
  assert.match(review.headers.get('content-security-policy'), /form-action https:\/\/updates\.example\.test/);
  assert.equal(review.headers.get('cache-control'), 'no-store');
  assert.equal(store.subscribers.size, 0, 'a link scanner opening the link confirms nothing');
  assert.equal((await handler(confirmPost(token).clone())).status, 200);
  store.subscribers.clear(); store.outbox.clear(); sent.length = 0; // reset to test the race from a clean pending row
  await store.startPending({ emailKey: 'k', email: 'racer@example.test', nonce: 'n', tokenHash: await sha256(token), tokenExpiresAt: Date.UTC(2027, 0, 1), consentVersion: 'v', consentAt: 1, source: '/', placement: 'top', createdAt: 1 }, 1);

  const pages = await Promise.all([handler(confirmPost(token)), handler(confirmPost(token)), handler(confirmPost(token))].map(async p => (await p).text()));
  assert.equal(pages.filter(h => /data-upd-confirmed="new"/.test(h)).length, 1, 'exactly one request makes the transition');
  assert.equal(pages.filter(h => /data-upd-confirmed="repeat"/.test(h)).length, 2);
  assert.equal(store.subscribers.size, 1);
  const welcomes = sent.filter(m => m.kind === 'welcome');
  assert.equal(welcomes.length, 1);
  assert.equal(welcomes[0].to, 'racer@example.test'); assert.equal(welcomes[0].subject, 'You’re on the list!');
  assert.match(welcomes[0].headers['List-Unsubscribe'], /^<https:\/\/updates\.example\.test\/api\/updates\/unsubscribe\?t=[^>]+>$/);
  assert.equal(welcomes[0].headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.match(welcomes[0].text, /1 Test Street/);

  const replay = await (await handler(confirmPost(token))).text();
  assert.match(replay, /This address is already confirmed\./); assert.doesNotMatch(replay, /You’re on the list/);
  assert.equal(sent.filter(m => m.kind === 'welcome').length, 1);
  assert.equal((await store.getOutbox(`welcome:${[...store.subscribers.keys()][0]}`)).status, 'sent');

  assert.equal((await handler(confirmPost('A'.repeat(43)))).status, 400);
  assert.equal((await handler(get('/confirm?t=short'))).status, 400);
  assert.equal((await handler(post('/confirm', `t=${token}`, { type: 'application/x-www-form-urlencoded', origin: 'https://evil.example.test' }))).status, 403);
});

test('a confirmation link expires after 24 hours and adds nobody', async () => {
  const { handler, store, sent, clock } = setup();
  await handler(post('/subscribe', sub('late@example.test')));
  clock.t += LIMITS.tokenTtlMs + 1;
  const res = await handler(confirmPost(tokenIn(sent[0])));
  assert.equal(res.status, 410); assert.match(await res.text(), /This confirmation link no longer works\./);
  assert.equal(store.subscribers.size, 0); assert.equal(sent.length, 1);
});

test('without a postal address the welcome is held, never sent, and released only after configuration', async () => {
  const held = setup({ postalAddress: '' });
  await held.handler(post('/subscribe', sub('reader@example.test')));
  assert.equal(held.sent.length, 1, 'the transactional confirmation still goes out');
  const page = await (await held.handler(confirmPost(tokenIn(held.sent[0])))).text();
  assert.match(page, /data-upd-confirmed="new"/);
  const [subscriber] = [...held.store.subscribers.values()];
  assert.equal(subscriber.status, 'confirmed');
  const row = await held.store.getOutbox(`welcome:${subscriber.id}`);
  assert.equal(row.status, 'held'); assert.equal(row.blocker, 'postal_address_missing'); assert.equal(row.attempts, 0);
  assert.equal(held.sent.filter(m => m.kind === 'welcome').length, 0);
  assert.deepEqual(await held.handler.retryOutbox(), { ...NO_WELCOME, held: 1 });
  assert.equal(held.sent.filter(m => m.kind === 'welcome').length, 0);
  assert.equal((await held.store.getOutbox(`welcome:${subscriber.id}`)).firstAttemptAt, null, 'a held row has not been attempted');

  // the same store once the address is configured, days later: a row that was never attempted may start late, once
  held.clock.t += 3 * LIMITS.tokenTtlMs;
  const ready = createUpdatesHandler({ store: held.store, mailer: held.mailer, config: { origin: ORIGIN, tokenSecret: SECRET, postalAddress: POSTAL }, now: () => held.clock.t });
  assert.deepEqual(await ready.retryOutbox(), { ...NO_WELCOME, sent: 1 });
  assert.deepEqual(await ready.retryOutbox(), NO_WELCOME);
  assert.equal(held.sent.filter(m => m.kind === 'welcome').length, 1);
  assert.equal((await held.store.getOutbox(`welcome:${subscriber.id}`)).firstAttemptAt, held.clock.t);
});

test('an ambiguous welcome is retried only inside the idempotency window, then waits for provider review', async () => {
  const { handler, store, sent, tried, mailer, clock } = setup();
  await handler(post('/subscribe', sub('reader@example.test')));
  const token = tokenIn(sent[0]), welcomes = () => tried.filter(m => m.kind === 'welcome');
  mailer.fail = 'throw'; // no answer: the provider may or may not have taken the message
  assert.match(await (await handler(confirmPost(token))).text(), /data-upd-confirmed="new"/);
  const [subscriber] = [...store.subscribers.values()], id = `welcome:${subscriber.id}`, firstAt = clock.t;
  let row = await store.getOutbox(id);
  assert.equal(row.status, 'failed'); assert.equal(row.lastError, 'provider_unreachable'); assert.equal(row.firstAttemptAt, firstAt);

  // inside the window a retry is safe: same key, same payload
  clock.t += LIMITS.hourMs;
  assert.deepEqual(await handler.retryOutbox(), { ...NO_WELCOME, failed: 1 });
  assert.equal(welcomes().length, 2);
  assert.equal(welcomes()[1].idempotencyKey, welcomes()[0].idempotencyKey); assert.equal(welcomes()[1].html, welcomes()[0].html);
  assert.equal((await store.getOutbox(id)).firstAttemptAt, firstAt, 'the first attempt time never moves');

  // past the window the provider has forgotten the key: three helpers at once, and none of them sends
  clock.t += LIMITS.idempotencyMs; mailer.fail = false;
  const runs = await Promise.all([handler.retryOutbox(), handler.retryOutbox(), handler.retryOutbox()]);
  assert.equal(runs.reduce((n, r) => n + r.review, 0), 1, 'one helper moves the row to review');
  assert.equal(runs.reduce((n, r) => n + r.sent + r.failed, 0), 0);
  row = await store.getOutbox(id);
  assert.equal(row.status, 'review'); assert.equal(row.blocker, 'idempotency_window_expired'); assert.equal(row.lastError, 'provider_unreachable'); assert.equal(row.attempts, 2);
  clock.t += 10 * LIMITS.tokenTtlMs;
  assert.deepEqual(await handler.retryOutbox(), NO_WELCOME, 'a review row is never picked up again');
  assert.equal(welcomes().length, 2); assert.equal(sent.filter(m => m.kind === 'welcome').length, 0);

  // a replayed confirmation, and an unsubscribe followed by a new opt-in, queue no second welcome
  assert.match(await (await handler(confirmPost(token))).text(), /data-upd-confirmed="repeat"/);
  await store.unsubscribe(subscriber.id, clock.t);
  await handler(post('/subscribe', sub('reader@example.test', { requestId: 'req-again-00001' })));
  const again = sent.filter(m => m.kind === 'confirmation');
  assert.match(await (await handler(confirmPost(tokenIn(again[again.length - 1])))).text(), /data-upd-confirmed="new"/);
  assert.equal(welcomes().length, 2);
  assert.equal((await store.getOutbox(id)).status, 'review');
});

test('concurrent retries send a failed welcome once, and a row abandoned mid-send waits out its lease', async () => {
  const { handler, store, sent, tried, mailer, clock } = setup();
  await handler(post('/subscribe', sub('reader@example.test')));
  mailer.fail = true;
  await handler(confirmPost(tokenIn(sent[0])));
  const [subscriber] = [...store.subscribers.values()], id = `welcome:${subscriber.id}`;
  // a crash between the claim and the answer leaves the row in 'sending'
  assert.equal(await store.claimOutbox(id, ['failed'], clock.t), true);
  mailer.fail = false; clock.t += 60 * 1000;
  assert.deepEqual(await handler.retryOutbox(), NO_WELCOME, 'a fresh claim is left alone');
  clock.t += LIMITS.sendingLeaseMs;
  const runs = await Promise.all([handler.retryOutbox(), handler.retryOutbox(), handler.retryOutbox()]);
  assert.equal(runs.reduce((n, r) => n + r.sent, 0), 1);
  assert.equal(sent.filter(m => m.kind === 'welcome').length, 1); assert.equal(tried.filter(m => m.kind === 'welcome').length, 2);
  assert.equal((await store.getOutbox(id)).status, 'sent');
  assert.deepEqual(await handler.retryOutbox(), NO_WELCOME);
});

test('a failed welcome is recorded, retried by hand, and cancelled if the reader has unsubscribed', async () => {
  const { handler, store, sent, mailer } = setup();
  await handler(post('/subscribe', sub('reader@example.test')));
  const token = tokenIn(sent[0]);
  mailer.fail = true;
  assert.match(await (await handler(confirmPost(token))).text(), /data-upd-confirmed="new"/, 'the confirmation stands even if the welcome fails');
  const [subscriber] = [...store.subscribers.values()];
  let row = await store.getOutbox(`welcome:${subscriber.id}`);
  assert.equal(row.status, 'failed'); assert.equal(row.lastError, 'provider_500'); assert.equal(row.attempts, 1);
  await store.unsubscribe(subscriber.id, 1);
  mailer.fail = false;
  assert.deepEqual(await handler.retryOutbox(), { ...NO_WELCOME, cancelled: 1 });
  assert.equal(sent.filter(m => m.kind === 'welcome').length, 0);
});

test('unsubscribe: GET reviews, POST is one-click, idempotent and signed; a new opt-in is possible afterwards', async () => {
  const { handler, store, sent, clock } = setup();
  await handler(post('/subscribe', sub('reader@example.test')));
  await handler(confirmPost(tokenIn(sent[0])));
  const welcome = sent.find(m => m.kind === 'welcome');
  const link = new URL(welcome.headers['List-Unsubscribe'].slice(1, -1));
  const path = `/unsubscribe${link.search}`;
  const [subscriber] = [...store.subscribers.values()];

  const review = await handler(get(path));
  assert.equal(review.status, 200); assert.match(await review.text(), /data-upd-state="unsubscribe"/);
  assert.equal(store.subscribers.get(subscriber.id).status, 'confirmed', 'opening the link changes nothing');
  // RFC 8058: the mail provider posts without an Origin header
  const oneClick = () => handler(post(path, 'List-Unsubscribe=One-Click', { type: 'application/x-www-form-urlencoded', origin: '' }));
  for (let i = 0; i < 2; i++) { const res = await oneClick(); assert.equal(res.status, 200); assert.match(await res.text(), /You are unsubscribed\./); }
  assert.equal(store.subscribers.get(subscriber.id).status, 'unsubscribed');

  const forged = link.searchParams.get('t').replace(/.$/, c => c === '0' ? '1' : '0');
  assert.equal((await handler(post(`/unsubscribe?t=${forged}`, '', { type: 'application/x-www-form-urlencoded', origin: '' }))).status, 400);
  assert.equal((await handler(get('/unsubscribe?t=nope'))).status, 400);

  // opting in again needs a new confirmation and does not send a second welcome
  clock.t += LIMITS.hourMs;
  await handler(post('/subscribe', sub('reader@example.test', { requestId: 'req-again-00001' })));
  const again = sent.filter(m => m.kind === 'confirmation');
  assert.equal(again.length, 2);
  assert.match(await (await handler(confirmPost(tokenIn(again[1])))).text(), /data-upd-confirmed="new"/);
  assert.equal(store.subscribers.size, 1); assert.equal(store.subscribers.get(subscriber.id).status, 'confirmed');
  assert.equal(sent.filter(m => m.kind === 'welcome').length, 1);
});

test('logs never contain an address, an IP address or a token', async () => {
  const { handler, sent, logs } = setup();
  await handler(post('/subscribe', sub('private.reader@example.test')));
  const token = tokenIn(sent[0]);
  await handler(confirmPost(token));
  await handler(post('/subscribe', sub('private.reader@example.test', { requestId: 'req-other-00001' })));
  const unsub = new URL(sent.find(m => m.kind === 'welcome').headers['List-Unsubscribe'].slice(1, -1));
  await handler(post(`/unsubscribe${unsub.search}`, '', { type: 'application/x-www-form-urlencoded', origin: '' }));
  const text = JSON.stringify(logs);
  assert.ok(logs.length >= 4);
  assert.doesNotMatch(text, /private\.reader|example\.test|203\.0\.113/);
  assert.ok(!text.includes(token) && !text.includes(unsub.searchParams.get('t')));
});

test('the Resend adapter sends one message with the sender, idempotency key and a category tag', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, init }); return new Response(JSON.stringify({ id: 'mock-id' }), { status: 200 }); };
  const mailer = resendMailer({ apiKey: 'synthetic-key', fetchImpl });
  const result = await mailer.send({ to: 'reader@example.test', subject: 's', html: '<p>h</p>', text: 't', idempotencyKey: 'updates-confirm-abc', kind: 'confirmation' });
  assert.deepEqual(result, { ok: true, status: 200, id: 'mock-id' });
  assert.equal(calls.length, 1); assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.headers['idempotency-key'], 'updates-confirm-abc');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.from, 'Spectre Brands <hello@spectrebrands.com>'); assert.deepEqual(body.to, ['reader@example.test']);
  assert.deepEqual(body.tags, [{ name: 'category', value: 'updates_confirmation' }]);
  assert.deepEqual(Object.keys(body).sort(), ['from', 'html', 'subject', 'tags', 'text', 'to']);
});

// The D1 statements, run against SQLite in memory where this Node version ships node:sqlite.
test('D1 store: schema loads and the statements behave like the memory store', async t => {
  let DatabaseSync;
  try { ({ DatabaseSync } = await import('node:sqlite')); } catch { t.skip('node:sqlite is not available in this Node version'); return; }
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(read('backend/updates-schema.sql'));
  const stmt = (sql, args = []) => ({
    sql, args,
    bind: (...next) => stmt(sql, next),
    first: async () => sqlite.prepare(sql).all(...args)[0] ?? null,
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...args).changes) } })
  });
  const db = {
    prepare: sql => stmt(sql),
    batch: async list => { sqlite.exec('BEGIN'); try { const out = []; for (const s of list) out.push(await s.run()); sqlite.exec('COMMIT'); return out; } catch (e) { sqlite.exec('ROLLBACK'); throw e; } }
  };
  const store = new D1Store(db);
  assert.equal(await store.rateHit('ip:k', 1), 1); assert.equal(await store.rateHit('ip:k', 1), 2); assert.equal(await store.rateHit('ip:k', 2), 1);
  assert.equal(await store.claimRequest('r1', 1), true); assert.equal(await store.claimRequest('r1', 2), false);

  const pending = { emailKey: 'ek', email: 'reader@example.test', nonce: 'n1', tokenHash: 'h1', tokenExpiresAt: 1000, consentVersion: 'v1', consentAt: 5, source: '/pets-com/', placement: 'mid', createdAt: 5 };
  assert.equal(await store.startPending(pending, 5), true);
  assert.equal(await store.startPending({ ...pending, nonce: 'nx', tokenHash: 'hx' }, 6), false, 'a live row keeps its first link');
  let p = await store.getPending('ek');
  assert.deepEqual([p.nonce, p.tokenHash, p.sendSeq, p.sendStatus, p.sendAttempts, p.sendFirstAt, p.lastSentAt], ['n1', 'h1', 1, 'queued', 0, 0, 0]);
  // the confirmation outbox on the row: one claim at a time, the first attempt time kept, the expiry restarted
  assert.equal(await store.claimPendingSend('ek', 1, 7, 1007), true); assert.equal(await store.claimPendingSend('ek', 1, 7, 1007), false);
  assert.equal(await store.claimPendingSend('ek', 2, 7, 1007), false);
  assert.deepEqual(await store.listPendingSends(8), []);
  await store.markPendingSend('ek', 1, 'failed', 8);
  assert.equal((await store.listPendingSends(8)).length, 1); assert.equal((await store.listPendingSends(2000)).length, 0);
  assert.equal(await store.claimPendingSend('ek', 1, 9, 1009), true);
  await store.markPendingSend('ek', 1, 'sent', 10);
  p = await store.getPending('ek');
  assert.deepEqual([p.sendStatus, p.sendAttempts, p.sendFirstAt, p.sendClaimedAt, p.lastSentAt, p.tokenExpiresAt], ['sent', 2, 7, 9, 10, 1009]);
  const consent = { consentVersion: 'v2', consentAt: 11, source: '/blockbuster/', placement: 'top' };
  assert.equal(await store.renewPending('ek', 1, consent), true); assert.equal(await store.renewPending('ek', 1, consent), false);
  p = await store.getPending('ek');
  assert.deepEqual([p.tokenHash, p.sendSeq, p.sendStatus, p.sendAttempts, p.sendFirstAt, p.source, p.consentVersion], ['h1', 2, 'queued', 0, 0, '/blockbuster/', 'v2']);
  // an expired row is replaced, with a new link and a clean delivery state
  assert.equal(await store.startPending({ ...pending, nonce: 'n2', tokenHash: 'h2', tokenExpiresAt: 1500 }, 1009), true);
  p = await store.getPending('ek');
  assert.deepEqual([p.nonce, p.tokenHash, p.sendSeq, p.sendStatus, p.source, p.createdAt], ['n2', 'h2', 1, 'queued', '/pets-com/', 5]);
  assert.equal(await store.getSubscriberByEmailKey('ek'), null, 'no subscriber before confirmation');
  assert.equal((await store.confirm({ tokenHash: 'h1', id: 'id-0', now: 10 })).result, 'invalid', 'a replaced token is dead');
  assert.equal((await store.confirm({ tokenHash: 'h2', id: 'id-0', now: 2000 })).result, 'expired');

  const first = await store.confirm({ tokenHash: 'h2', id: 'id-1', now: 10 });
  assert.equal(first.result, 'confirmed'); assert.equal(first.subscriber.id, 'id-1'); assert.equal(first.subscriber.placement, 'mid'); assert.equal(first.subscriber.consentVersion, 'v1');
  assert.equal(await store.getPending('ek'), null);
  assert.equal((await store.confirm({ tokenHash: 'h2', id: 'id-2', now: 11 })).result, 'already');

  assert.equal(await store.enqueueOutbox({ id: 'welcome:id-1', subscriberId: 'id-1', kind: 'welcome', status: 'held', blocker: 'postal_address_missing', now: 12 }), true);
  assert.equal(await store.enqueueOutbox({ id: 'welcome:id-1', subscriberId: 'id-1', kind: 'welcome', status: 'sending', now: 13 }), false);
  assert.equal((await store.listOutbox(['held', 'failed'])).length, 1);
  assert.equal(await store.claimOutbox('welcome:id-1', ['held'], 14), true); assert.equal(await store.claimOutbox('welcome:id-1', ['held'], 15), false);
  assert.equal((await store.getOutbox('welcome:id-1')).firstAttemptAt, null);
  assert.equal(await store.startOutboxAttempt('welcome:id-1', 15), 15); assert.equal(await store.startOutboxAttempt('welcome:id-1', 99), 15);
  await store.markOutbox('welcome:id-1', 'sent', { providerId: 'p1', now: 16 });
  let row = await store.getOutbox('welcome:id-1');
  assert.equal(row.status, 'sent'); assert.equal(row.attempts, 1); assert.equal(row.providerId, 'p1'); assert.equal(row.blocker, null); assert.equal(row.firstAttemptAt, 15);
  assert.equal(await store.startOutboxAttempt('welcome:id-1', 17), null, 'only a claimed row can be attempted');
  // a failed row past its window: a stale claim loses, and review keeps the last provider code
  await store.markOutbox('welcome:id-1', 'failed', { error: 'provider_500', now: 17 });
  assert.equal(await store.claimOutbox('welcome:id-1', ['failed'], 18, 16), false); assert.equal(await store.claimOutbox('welcome:id-1', ['failed'], 18, 17), true);
  await store.markOutbox('welcome:id-1', 'review', { blocker: 'idempotency_window_expired', now: 19 });
  row = await store.getOutbox('welcome:id-1');
  assert.deepEqual([row.status, row.blocker, row.lastError, row.attempts, row.firstAttemptAt], ['review', 'idempotency_window_expired', 'provider_500', 2, 15]);
  assert.deepEqual(await store.listOutbox(['held', 'failed', 'sending']), []);

  assert.equal(await store.unsubscribe('id-1', 20), true); assert.equal(await store.unsubscribe('id-1', 21), true); assert.equal(await store.unsubscribe('missing', 22), false);
  assert.equal((await store.getSubscriber('id-1')).status, 'unsubscribed');
  assert.equal((await store.confirm({ tokenHash: 'h2', id: 'id-3', now: 23 })).result, 'invalid', 'an old link does not undo an unsubscribe');
  assert.equal(await store.startPending({ ...pending, nonce: 'n3', tokenHash: 'h3', tokenExpiresAt: 5000 }, 24), true);
  const again = await store.confirm({ tokenHash: 'h3', id: 'id-4', now: 30 });
  assert.equal(again.result, 'confirmed'); assert.equal(again.subscriber.id, 'id-1'); assert.equal(again.subscriber.unsubscribedAt, null);
});

test('client: no copy claims what was stored, and the prompt eligibility helper is pure and inspectable', () => {
  const js = read('assets/js/updates.js'), lib = read('lib/updates.mjs');
  assert.doesNotMatch(js + lib, /Nothing was saved/);
  for (const key of ['rate', 'unavailable', 'network']) assert.match(js, new RegExp(`${key}: '[^']*[Tt]ry again`), `${key} says how to retry`);
  assert.match(js, /\[data-film-playing\]/); assert.match(js, /youtube-nocookie\.com\/embed/);
  assert.match(js, /\.glossary-button\[aria-expanded="true"\]/); assert.match(js, /dialog\[open\]/);
  assert.doesNotMatch(js, /location\.(search|hash|href)|URLSearchParams/, 'nothing in the URL can trigger the prompt');
  const form = updatesFooter({ slug: 'pets-com' });
  assert.match(form, /<p class="upd-again" data-upd-again hidden>No email after a few minutes\? <button type="button" class="upd-btn upd-again-btn" id="upd-footer-again">Request another link<\/button><\/p>/);
  assert.match(form, /aria-describedby="upd-footer-email-err upd-footer-status"/, 'the email error stays linked to its field');
  assert.match(js, /showError\(form, 'email', COPY\.invalidEmail\); return failed\(form, '', input\)/, 'a rejected address returns focus to the field');

  // the script only registers listeners while the document is loading, so it runs against two bare objects
  const window = {}, document = { documentElement: { getAttribute: () => null }, readyState: 'loading', addEventListener() {} };
  vm.runInNewContext(js, { window, document });
  const { eligibility, TIMING, state } = window.SpectreUpdates;
  assert.equal(typeof state, 'function');
  const ready = { suppressed: false, visible: true, focused: true, mediaPlaying: false, typing: false, overlayOpen: false, activeMs: TIMING.activeMs, progress: TIMING.progress, placementSafe: true };
  const verdict = s => { const e = eligibility(s); return `${e.eligible}:${e.blockers.join(',')}`; };
  assert.equal(verdict(ready), 'true:');
  const blocked = { suppressed: [true, 'suppressed'], visible: [false, 'tab-hidden'], focused: [false, 'window-unfocused'], mediaPlaying: [true, 'media'], typing: [true, 'typing'], overlayOpen: [true, 'overlay'], activeMs: [TIMING.activeMs - 1000, 'active-time'], progress: [TIMING.progress - 0.01, 'progress'], placementSafe: [false, 'placement'] };
  for (const [field, [value, name]] of Object.entries(blocked)) assert.equal(verdict({ ...ready, [field]: value }), `false:${name}`);
  assert.equal(verdict({}), 'false:tab-hidden,window-unfocused,active-time,progress,placement', 'an unknown state is never eligible');
  assert.equal(verdict(ready), 'true:', 'the helper keeps no state between calls');
});

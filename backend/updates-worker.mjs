// Free email updates: double opt-in backend for a Cloudflare Worker with a D1 database, sending through Resend.
// Not deployed and not enabled. The default export answers 503 until every setting in
// backend/updates-config.example.json is present. No accounts, passwords, sessions or payments.
//
// Routes (all under /api/updates):
//   POST /subscribe     JSON or form post. Stores a pending request and queues its confirmation email. Always 202
//                       for a well-formed request, whatever the address's state and whether or not the mail
//                       provider answered, so addresses cannot be probed. A confirmation that could not be handed
//                       over stays queued on the pending row.
//   GET  /confirm?t=    Shows a page with a button. Changes nothing, so link scanners cannot confirm an address.
//   POST /confirm       Confirms atomically. A replay answers "already confirmed" and sends nothing.
//   GET  /unsubscribe?t=  Shows a page with a button. Changes nothing.
//   POST /unsubscribe?t=  Unsubscribes (also the RFC 8058 one-click target). Idempotent.
//
// Logs carry event names and codes only: never an email address, an IP address or a token.
import { confirmationEmail, welcomeEmail, updatesDocument } from '../lib/updates.mjs';

export const BASE = '/api/updates';
export const DEFAULT_SENDER = 'Spectre Brands <hello@spectrebrands.com>';
export const CONSENT_VERSION = '2026-10-11';
export const LIMITS = Object.freeze({
  bodyBytes: 2048,
  emailPerHour: 3,              // confirmation requests per address per clock hour
  ipPerHour: 5,                 // subscribe requests per client address per clock hour
  emailCooldownMs: 2 * 60 * 1000, // one confirmation email per address per two minutes
  tokenTtlMs: 24 * 60 * 60 * 1000,
  hourMs: 60 * 60 * 1000,
  outboxAttempts: 5,
  confirmAttempts: 5,           // provider attempts per confirmation delivery
  // Resend keeps an idempotency key for 24 hours. A message is retried under its key only inside this window,
  // measured from its first provider attempt; the hour of margin covers clock skew and a request in flight.
  idempotencyMs: 23 * 60 * 60 * 1000,
  sendingLeaseMs: 15 * 60 * 1000 // a welcome row left in 'sending' this long was abandoned by a crash
});

// ---------- crypto (WebCrypto only) ----------
const enc = new TextEncoder();
const hex = buf => Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const sha256 = async text => hex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
async function hmacRaw(secret, text) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(text)));
}
export const hmac = async (secret, text) => hex(await hmacRaw(secret, text));
// Constant-time comparison of two equal-length strings.
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// Lower-cased address, or '' when it is not one. Whitespace and control characters are rejected outright.
export function normalizeEmail(raw) {
  if (typeof raw !== 'string') return '';
  const v = raw.trim().toLowerCase(), at = v.lastIndexOf('@');
  if (v.length > 254 || at < 1 || at > 64) return '';
  return /^[^\s@<>()",;:\\\x00-\x1f\x7f]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(v) ? v : '';
}

const TOKEN = /^[A-Za-z0-9_-]{43}$/, UNSUB = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([0-9a-f]{64})$/, REQUEST_ID = /^[A-Za-z0-9_-]{8,64}$/;
const PLACEMENTS = new Set(['top', 'mid', 'footer']);

// ---------- configuration ----------
// A value copied from the example file, or an obvious stand-in, counts as unset however long it is. This is a
// shape check only: no key is ever tested against the provider.
const PLACEHOLDER = /REPLACE_|PLACEHOLDER|EXAMPLE|CHANGE[_-]?ME|YOUR[_-]?(?:API[_-]?)?(?:KEY|SECRET|TOKEN)|<[^>]*>|^(.)\1*$/i;
const realSecret = v => typeof v === 'string' && v !== '' && v === v.trim() && !PLACEHOLDER.test(v);

// Returns the settings and the names (never the values) of the ones that are missing.
export function readUpdatesConfig(env = {}) {
  const missing = [];
  let origin = '';
  try { const u = new URL(env.UPDATES_ORIGIN); if (u.protocol === 'https:') origin = u.origin; } catch { /* reported below */ }
  if (env.UPDATES_ENABLED !== 'true') missing.push('UPDATES_ENABLED');
  if (!env.UPDATES_DB || typeof env.UPDATES_DB.prepare !== 'function') missing.push('UPDATES_DB');
  if (!realSecret(env.RESEND_API_KEY)) missing.push('RESEND_API_KEY');
  if (!realSecret(env.UPDATES_TOKEN_SECRET) || env.UPDATES_TOKEN_SECRET.length < 32) missing.push('UPDATES_TOKEN_SECRET');
  if (!origin) missing.push('UPDATES_ORIGIN');
  const postal = String(env.UPDATES_POSTAL_ADDRESS || '').trim();
  return {
    ok: missing.length === 0, missing,
    config: {
      origin, tokenSecret: realSecret(env.UPDATES_TOKEN_SECRET) ? env.UPDATES_TOKEN_SECRET : '', sender: env.UPDATES_SENDER || DEFAULT_SENDER,
      // a placeholder left in from the example file counts as unset
      postalAddress: /REPLACE_|placeholder|example/i.test(postal) ? '' : postal,
      consentVersion: env.UPDATES_CONSENT_VERSION || CONSENT_VERSION
    }
  };
}

// ---------- stores ----------
// A store is any object with these async methods; rows use the camelCase fields below.
//   rateHit(key, bucket) -> count after this hit           claimRequest(key, now) -> true when the key is new
//   getSubscriber(id) / getSubscriberByEmailKey(emailKey)  confirm({ tokenHash, id, now }) -> { result, subscriber }
//   unsubscribe(id, now) -> true when the id exists        enqueueOutbox(row) -> true when inserted
// The pending row doubles as the confirmation outbox (sendSeq, sendStatus, sendAttempts, sendFirstAt, sendClaimedAt):
//   getPending(emailKey)
//   startPending(row, now) -> true when written; a live row is left as it is, so its first link keeps working
//   renewPending(emailKey, seq, consent) -> true when seq matched; starts delivery seq + 1 of the same link
//   claimPendingSend(emailKey, seq, now, tokenExpiresAt) -> true when moved from queued/failed to 'sending'
//   markPendingSend(emailKey, seq, status, now)            listPendingSends(now) -> live queued/failed rows
// The welcome outbox:
//   claimOutbox(id, fromStatuses, now, staleBefore?) -> true when moved to 'sending'
//   startOutboxAttempt(id, now) -> time of the row's first provider attempt, recorded on the first call
//   markOutbox(id, status, { providerId, error, blocker, now })   listOutbox(statuses) / getOutbox(id)
// confirm() results: 'confirmed' (this call made the transition), 'already' (the same link, replayed), 'expired', 'invalid'.

// In-memory store for tests and local review. Each method runs without awaiting, so each is atomic.
export class MemoryStore {
  constructor() { this.pending = new Map(); this.subscribers = new Map(); this.requests = new Map(); this.rate = new Map(); this.outbox = new Map(); }
  async rateHit(key, bucket) { const k = `${key}:${bucket}`, n = (this.rate.get(k) || 0) + 1; this.rate.set(k, n); return n; }
  async claimRequest(key, now) { if (this.requests.has(key)) return false; this.requests.set(key, now); return true; }
  async getPending(emailKey) { const p = this.pending.get(emailKey); return p ? { ...p } : null; }
  async startPending(row, now) {
    const p = this.pending.get(row.emailKey);
    if (p && p.nonce && p.tokenExpiresAt > now) return false;
    this.pending.set(row.emailKey, { ...row, createdAt: p ? p.createdAt : row.createdAt, lastSentAt: 0, sendSeq: 1, sendStatus: 'queued', sendAttempts: 0, sendFirstAt: 0, sendClaimedAt: 0 });
    return true;
  }
  async renewPending(emailKey, seq, { consentVersion, consentAt, source, placement }) {
    const p = this.pending.get(emailKey);
    if (!p || p.sendSeq !== seq) return false;
    Object.assign(p, { consentVersion, consentAt, source, placement, sendSeq: seq + 1, sendStatus: 'queued', sendAttempts: 0, sendFirstAt: 0 });
    return true;
  }
  async claimPendingSend(emailKey, seq, now, tokenExpiresAt) {
    const p = this.pending.get(emailKey);
    if (!p || p.sendSeq !== seq || (p.sendStatus !== 'queued' && p.sendStatus !== 'failed')) return false;
    Object.assign(p, { sendStatus: 'sending', sendAttempts: p.sendAttempts + 1, sendFirstAt: p.sendFirstAt || now, sendClaimedAt: now, tokenExpiresAt });
    return true;
  }
  async markPendingSend(emailKey, seq, status, now) {
    const p = this.pending.get(emailKey);
    if (!p || p.sendSeq !== seq || p.sendStatus !== 'sending') return;
    p.sendStatus = status;
    if (status === 'sent') p.lastSentAt = now;
  }
  async listPendingSends(now) { return [...this.pending.values()].filter(p => (p.sendStatus === 'queued' || p.sendStatus === 'failed') && p.tokenExpiresAt > now).map(p => ({ ...p })); }
  async getSubscriber(id) { const s = this.subscribers.get(id); return s ? { ...s } : null; }
  async getSubscriberByEmailKey(emailKey) { for (const s of this.subscribers.values()) if (s.emailKey === emailKey) return { ...s }; return null; }
  async confirm({ tokenHash, id, now }) {
    let p = null;
    for (const row of this.pending.values()) if (row.tokenHash === tokenHash) p = row;
    if (p && p.tokenExpiresAt > now) {
      let prior = null;
      for (const s of this.subscribers.values()) if (s.emailKey === p.emailKey) prior = s;
      this.pending.delete(p.emailKey);
      if (prior && prior.status === 'confirmed') return { result: 'invalid', subscriber: null };
      const sub = {
        id: prior ? prior.id : id, emailKey: p.emailKey, email: p.email, status: 'confirmed', consentVersion: p.consentVersion, consentAt: p.consentAt,
        source: p.source, placement: p.placement, confirmedAt: now, confirmTokenHash: tokenHash, unsubscribedAt: null
      };
      this.subscribers.set(sub.id, sub);
      return { result: 'confirmed', subscriber: { ...sub } };
    }
    if (p) return { result: 'expired', subscriber: null };
    for (const s of this.subscribers.values()) if (s.confirmTokenHash === tokenHash && s.status === 'confirmed') return { result: 'already', subscriber: { ...s } };
    return { result: 'invalid', subscriber: null };
  }
  async unsubscribe(id, now) {
    const s = this.subscribers.get(id);
    if (!s) return false;
    if (s.status === 'confirmed') { s.status = 'unsubscribed'; s.unsubscribedAt = now; }
    return true;
  }
  async enqueueOutbox(row) {
    if (this.outbox.has(row.id)) return false;
    this.outbox.set(row.id, { id: row.id, subscriberId: row.subscriberId, kind: row.kind, status: row.status, blocker: row.blocker || null, attempts: 0, lastError: null, providerId: null, firstAttemptAt: null, createdAt: row.now, updatedAt: row.now });
    return true;
  }
  async claimOutbox(id, from, now, staleBefore = null) {
    const o = this.outbox.get(id);
    if (!o || !from.includes(o.status) || (staleBefore !== null && o.updatedAt > staleBefore)) return false;
    o.status = 'sending'; o.blocker = null; o.updatedAt = now;
    return true;
  }
  async startOutboxAttempt(id, now) {
    const o = this.outbox.get(id);
    if (!o || o.status !== 'sending') return null;
    if (o.firstAttemptAt === null) o.firstAttemptAt = now;
    o.updatedAt = now;
    return o.firstAttemptAt;
  }
  async markOutbox(id, status, { providerId = null, error = null, blocker = null, now } = {}) {
    const o = this.outbox.get(id);
    if (!o) return;
    if (status === 'sent' || status === 'failed') o.attempts += 1;
    // a row sent for review keeps the code of its last provider attempt
    Object.assign(o, { status, providerId: providerId || o.providerId, lastError: status === 'review' ? o.lastError : error, blocker, updatedAt: now });
  }
  async getOutbox(id) { const o = this.outbox.get(id); return o ? { ...o } : null; }
  async listOutbox(statuses) { return [...this.outbox.values()].filter(o => statuses.includes(o.status)).map(o => ({ ...o })); }
}

// D1 store. Every statement is parameterised; the tables are in backend/updates-schema.sql.
const SUB_COLS = 'id, email_key AS emailKey, email, status, consent_version AS consentVersion, consent_at AS consentAt, source, placement, confirmed_at AS confirmedAt, confirm_token_hash AS confirmTokenHash, unsubscribed_at AS unsubscribedAt';
const OUT_COLS = 'id, subscriber_id AS subscriberId, kind, status, blocker, attempts, last_error AS lastError, provider_id AS providerId, first_attempt_at AS firstAttemptAt, created_at AS createdAt, updated_at AS updatedAt';
const PEND_COLS = 'email_key AS emailKey, email, nonce, token_hash AS tokenHash, token_expires_at AS tokenExpiresAt, consent_version AS consentVersion, consent_at AS consentAt, source, placement, created_at AS createdAt, last_sent_at AS lastSentAt, send_seq AS sendSeq, send_status AS sendStatus, send_attempts AS sendAttempts, send_first_at AS sendFirstAt, send_claimed_at AS sendClaimedAt';
const marks = n => Array(n).fill('?').join(',');
export class D1Store {
  constructor(db) { this.db = db; }
  async rateHit(key, bucket) {
    const row = await this.db.prepare('INSERT INTO updates_rate (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1 RETURNING count').bind(key, bucket).first();
    return row ? Number(row.count) : 1;
  }
  async claimRequest(key, now) {
    const r = await this.db.prepare('INSERT OR IGNORE INTO updates_requests (request_key, created_at) VALUES (?, ?)').bind(key, now).run();
    return r.meta.changes === 1;
  }
  async getPending(emailKey) { return await this.db.prepare(`SELECT ${PEND_COLS} FROM updates_pending WHERE email_key = ?`).bind(emailKey).first() || null; }
  // Inserts, or replaces a row whose link has expired (or one from before the nonce column). A live row is not
  // touched, so two requests racing for a new address end up sharing the first one's link.
  async startPending(p, now) {
    const r = await this.db.prepare(`INSERT INTO updates_pending (email_key, email, nonce, token_hash, token_expires_at, consent_version, consent_at, source, placement, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(email_key) DO UPDATE SET email = excluded.email, nonce = excluded.nonce, token_hash = excluded.token_hash, token_expires_at = excluded.token_expires_at, consent_version = excluded.consent_version, consent_at = excluded.consent_at, source = excluded.source, placement = excluded.placement, last_sent_at = 0, send_seq = 1, send_status = 'queued', send_attempts = 0, send_first_at = 0, send_claimed_at = 0
WHERE updates_pending.token_expires_at <= ? OR updates_pending.nonce = ''`)
      .bind(p.emailKey, p.email, p.nonce, p.tokenHash, p.tokenExpiresAt, p.consentVersion, p.consentAt, p.source, p.placement, p.createdAt, now).run();
    return r.meta.changes === 1;
  }
  async renewPending(emailKey, seq, { consentVersion, consentAt, source, placement }) {
    const r = await this.db.prepare("UPDATE updates_pending SET consent_version = ?, consent_at = ?, source = ?, placement = ?, send_seq = send_seq + 1, send_status = 'queued', send_attempts = 0, send_first_at = 0 WHERE email_key = ? AND send_seq = ?")
      .bind(consentVersion, consentAt, source, placement, emailKey, seq).run();
    return r.meta.changes === 1;
  }
  async claimPendingSend(emailKey, seq, now, tokenExpiresAt) {
    const r = await this.db.prepare("UPDATE updates_pending SET send_status = 'sending', send_attempts = send_attempts + 1, send_first_at = CASE WHEN send_first_at = 0 THEN ? ELSE send_first_at END, send_claimed_at = ?, token_expires_at = ? WHERE email_key = ? AND send_seq = ? AND send_status IN ('queued', 'failed')")
      .bind(now, now, tokenExpiresAt, emailKey, seq).run();
    return r.meta.changes === 1;
  }
  async markPendingSend(emailKey, seq, status, now) {
    await this.db.prepare("UPDATE updates_pending SET send_status = ?, last_sent_at = CASE WHEN ? = 'sent' THEN ? ELSE last_sent_at END WHERE email_key = ? AND send_seq = ? AND send_status = 'sending'")
      .bind(status, status, now, emailKey, seq).run();
  }
  async listPendingSends(now) {
    const r = await this.db.prepare(`SELECT ${PEND_COLS} FROM updates_pending WHERE send_status IN ('queued', 'failed') AND token_expires_at > ? ORDER BY created_at LIMIT 50`).bind(now).all();
    return r.results || [];
  }
  async getSubscriber(id) { return await this.db.prepare(`SELECT ${SUB_COLS} FROM updates_subscribers WHERE id = ?`).bind(id).first() || null; }
  async getSubscriberByEmailKey(emailKey) { return await this.db.prepare(`SELECT ${SUB_COLS} FROM updates_subscribers WHERE email_key = ?`).bind(emailKey).first() || null; }
  // One transaction: the subscriber row is written from the pending row and the pending row is deleted. Of two
  // requests racing with the same token, exactly one sees a change; the other finds the row by its token hash.
  async confirm({ tokenHash, id, now }) {
    const [moved] = await this.db.batch([
      this.db.prepare(`INSERT INTO updates_subscribers (id, email_key, email, status, consent_version, consent_at, source, placement, confirmed_at, confirm_token_hash)
SELECT ?, email_key, email, 'confirmed', consent_version, consent_at, source, placement, ?, token_hash FROM updates_pending WHERE token_hash = ? AND token_expires_at > ?
ON CONFLICT(email_key) DO UPDATE SET status = 'confirmed', consent_version = excluded.consent_version, consent_at = excluded.consent_at, source = excluded.source, placement = excluded.placement, confirmed_at = excluded.confirmed_at, confirm_token_hash = excluded.confirm_token_hash, unsubscribed_at = NULL
WHERE updates_subscribers.status = 'unsubscribed'`).bind(id, now, tokenHash, now),
      this.db.prepare('DELETE FROM updates_pending WHERE token_hash = ? AND token_expires_at > ?').bind(tokenHash, now)
    ]);
    const subscriber = await this.db.prepare(`SELECT ${SUB_COLS} FROM updates_subscribers WHERE confirm_token_hash = ?`).bind(tokenHash).first() || null;
    if (moved.meta.changes === 1 && subscriber) return { result: 'confirmed', subscriber };
    if (subscriber && subscriber.status === 'confirmed') return { result: 'already', subscriber };
    const stale = await this.db.prepare('SELECT 1 AS n FROM updates_pending WHERE token_hash = ?').bind(tokenHash).first();
    return { result: stale ? 'expired' : 'invalid', subscriber: null };
  }
  async unsubscribe(id, now) {
    await this.db.prepare("UPDATE updates_subscribers SET status = 'unsubscribed', unsubscribed_at = ? WHERE id = ? AND status = 'confirmed'").bind(now, id).run();
    return !!(await this.db.prepare('SELECT 1 AS n FROM updates_subscribers WHERE id = ?').bind(id).first());
  }
  async enqueueOutbox(row) {
    const r = await this.db.prepare('INSERT OR IGNORE INTO updates_outbox (id, subscriber_id, kind, status, blocker, attempts, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)')
      .bind(row.id, row.subscriberId, row.kind, row.status, row.blocker || null, row.now, row.now).run();
    return r.meta.changes === 1;
  }
  async claimOutbox(id, from, now, staleBefore = null) {
    const stale = staleBefore === null ? '' : ' AND updated_at <= ?';
    const r = await this.db.prepare(`UPDATE updates_outbox SET status = 'sending', blocker = NULL, updated_at = ? WHERE id = ? AND status IN (${marks(from.length)})${stale}`)
      .bind(now, id, ...from, ...(staleBefore === null ? [] : [staleBefore])).run();
    return r.meta.changes === 1;
  }
  async startOutboxAttempt(id, now) {
    const row = await this.db.prepare("UPDATE updates_outbox SET first_attempt_at = COALESCE(first_attempt_at, ?), updated_at = ? WHERE id = ? AND status = 'sending' RETURNING first_attempt_at AS firstAttemptAt").bind(now, now, id).first();
    return row ? Number(row.firstAttemptAt) : null;
  }
  async markOutbox(id, status, { providerId = null, error = null, blocker = null, now } = {}) {
    const tried = status === 'sent' || status === 'failed' ? 1 : 0;
    await this.db.prepare("UPDATE updates_outbox SET status = ?, attempts = attempts + ?, provider_id = COALESCE(?, provider_id), last_error = CASE WHEN ? = 'review' THEN last_error ELSE ? END, blocker = ?, updated_at = ? WHERE id = ?")
      .bind(status, tried, providerId, status, error, blocker, now, id).run();
  }
  async getOutbox(id) { return await this.db.prepare(`SELECT ${OUT_COLS} FROM updates_outbox WHERE id = ?`).bind(id).first() || null; }
  async listOutbox(statuses) {
    const r = await this.db.prepare(`SELECT ${OUT_COLS} FROM updates_outbox WHERE status IN (${marks(statuses.length)}) ORDER BY created_at LIMIT 50`).bind(...statuses).all();
    return r.results || [];
  }
}

// ---------- mail ----------
// The only code that calls Resend. It sends one message from the configured sender and nothing else: no contact,
// audience or import call exists here. `fetchImpl` is injectable so tests never open a connection.
export function resendMailer({ apiKey, from = DEFAULT_SENDER, fetchImpl = fetch }) {
  return {
    async send({ to, from: sender, subject, html, text, headers, idempotencyKey, kind }) {
      const res = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
        body: JSON.stringify({ from: sender || from, to: [to], subject, html, text, headers: headers || undefined, tags: [{ name: 'category', value: `updates_${kind}` }] })
      });
      let id = null;
      try { id = (await res.json()).id || null; } catch { /* a body is not required */ }
      return { ok: res.ok, status: res.status, id };
    }
  };
}

// ---------- responses ----------
const json = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra } });
const ACCEPTED = () => json(202, { status: 'pending' });
const methodNot = allow => json(405, { error: 'method_not_allowed' }, { allow });

// Reads the body as it arrives and stops at the cap, so a chunked request with no (or a false) content-length
// is never buffered whole. Returns null when the body is over the cap; the rest of the stream is cancelled.
async function readBody(request) {
  const body = request.body;
  if (Number(request.headers.get('content-length') || 0) > LIMITS.bodyBytes) {
    if (body) { try { await body.cancel(); } catch { /* already closed */ } }
    return null;
  }
  if (!body) return '';
  const reader = body.getReader(), chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > LIMITS.bodyBytes) { try { await reader.cancel(); } catch { /* already closed */ } return null; }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) { all.set(c, at); at += c.byteLength; }
  return new TextDecoder().decode(all);
}
const contentType = request => (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();

// ---------- handler ----------
export function createUpdatesHandler({ store, mailer, config, now = () => Date.now(), log = () => {}, randomBytes = n => crypto.getRandomValues(new Uint8Array(n)), uuid = () => crypto.randomUUID() }) {
  const origin = new URL(config.origin).origin, secret = config.tokenSecret;
  const sender = config.sender || DEFAULT_SENDER, consentVersion = config.consentVersion || CONSENT_VERSION;
  // every link in a page or an email is built here, on the configured origin; nothing is taken from the request
  const link = (path, token) => { const u = new URL(BASE + path, origin); u.searchParams.set('t', token); return u.toString(); };
  const page = (status, state, token = '') => new Response(updatesDocument({ state, origin, token }), {
    status, headers: {
      'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex',
      'referrer-policy': 'same-origin', 'x-frame-options': 'DENY',
      'content-security-policy': `default-src 'none'; style-src ${origin}; script-src ${origin}; img-src ${origin} data:; font-src ${origin}; form-action ${origin}; base-uri 'none'; frame-ancestors 'none'`
    }
  });
  const sameOrigin = request => request.headers.get('origin') === origin;
  const unsubToken = async id => `${id}.${await hmac(secret, `unsub:${id}`)}`;
  async function unsubId(token) {
    const m = UNSUB.exec(String(token || ''));
    return m && safeEqual(m[2], await hmac(secret, `unsub:${m[1]}`)) ? m[1] : null;
  }

  // The confirmation token is never stored. It is HMAC(secret, address key + the row's nonce), so the same row
  // always yields the same link and the same email, and the row holds only the token's hash.
  const confirmToken = async (emailKey, nonce) => b64url(await hmacRaw(secret, `confirm:${emailKey}:${nonce}`));
  // A delivery may be attempted again under its key only while Resend still remembers that key.
  const retryable = (row, t) => (row.sendStatus === 'queued' || row.sendStatus === 'failed') && !!row.nonce
    && row.sendAttempts < LIMITS.confirmAttempts && (!row.sendFirstAt || t - row.sendFirstAt < LIMITS.idempotencyMs);
  // One provider attempt for the row's current delivery. The key is the token hash plus the delivery number, and
  // the message is rebuilt from the stored nonce, so every attempt of one delivery carries the same key and the
  // same payload. Each attempt also restarts the link's 24 hours, which keeps the email's own sentence true.
  async function deliverConfirmation(row, t) {
    if (!await store.claimPendingSend(row.emailKey, row.sendSeq, t, t + LIMITS.tokenTtlMs)) return 'busy';
    let sent;
    try {
      const token = await confirmToken(row.emailKey, row.nonce);
      // a rotated secret no longer reproduces the stored link; nothing is sent for it
      if (!safeEqual(await sha256(token), row.tokenHash)) sent = { ok: false, status: 0, mismatch: true };
      else sent = await mailer.send({ to: row.email, from: sender, ...confirmationEmail({ confirmUrl: link('/confirm', token) }), kind: 'confirmation', idempotencyKey: `updates-confirm-${row.tokenHash.slice(0, 40)}-${row.sendSeq}` });
    } catch { sent = { ok: false, status: 0 }; }
    await store.markPendingSend(row.emailKey, row.sendSeq, sent.ok ? 'sent' : 'failed', now());
    if (sent.mismatch) { log('confirmation_token_mismatch', {}); return 'mismatch'; }
    log(sent.ok ? 'confirmation_sent' : 'confirmation_queued', { status: sent.status || 0, placement: row.placement });
    return sent.ok ? 'sent' : 'queued';
  }
  // Manual retry of confirmations the provider did not accept. Nothing calls this on a schedule; see the README.
  async function retryConfirmations() {
    const out = { sent: 0, queued: 0, skipped: 0 }, t = now();
    for (const row of await store.listPendingSends(t)) {
      const r = retryable(row, t) ? await deliverConfirmation(row, t) : 'skipped';
      out[r === 'sent' || r === 'queued' ? r : 'skipped']++;
    }
    return out;
  }

  async function deliverWelcome(sub, outboxId) {
    const unsubscribeUrl = link('/unsubscribe', await unsubToken(sub.id));
    let mail;
    try { mail = welcomeEmail({ unsubscribeUrl, postalAddress: config.postalAddress, siteUrl: origin }); }
    catch (e) {
      if (e && e.code === 'postal_address_missing') { await store.markOutbox(outboxId, 'held', { blocker: 'postal_address_missing', now: now() }); log('outbox_held', { blocker: 'postal_address_missing' }); return 'held'; }
      await store.markOutbox(outboxId, 'failed', { error: 'message_build_failed', now: now() });
      log('welcome_failed', { status: 0 });
      return 'failed';
    }
    // The time of the first provider attempt is written before the request leaves. From then on the row may be
    // sent again only while the provider still holds its idempotency key; after that nobody can tell from here
    // whether the first attempt was delivered, so the row waits for a person to check the provider.
    const first = await store.startOutboxAttempt(outboxId, now());
    if (first === null) return 'failed';
    if (now() - first >= LIMITS.idempotencyMs) return reviewWelcome(outboxId);
    let r;
    try {
      r = await mailer.send({
        to: sub.email, from: sender, ...mail, kind: 'welcome', idempotencyKey: `updates-welcome-${sub.id}`,
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      });
    } catch { r = { ok: false, status: 0 }; }
    await store.markOutbox(outboxId, r.ok ? 'sent' : 'failed', { providerId: r.id || null, error: r.ok ? null : `provider_${r.status || 'unreachable'}`, now: now() });
    log(r.ok ? 'welcome_sent' : 'welcome_failed', { status: r.status || 0 });
    return r.ok ? 'sent' : 'failed';
  }
  async function reviewWelcome(outboxId) {
    await store.markOutbox(outboxId, 'review', { blocker: 'idempotency_window_expired', now: now() });
    log('outbox_review', { blocker: 'idempotency_window_expired' });
    return 'review';
  }
  // One outbox row per subscriber, keyed by the subscriber id, so a second confirmation can never queue a second
  // welcome. Without a postal address the row is held and nothing is sent.
  async function queueWelcome(sub) {
    const id = `welcome:${sub.id}`, held = !config.postalAddress;
    const inserted = await store.enqueueOutbox({ id, subscriberId: sub.id, kind: 'welcome', status: held ? 'held' : 'sending', blocker: held ? 'postal_address_missing' : null, now: now() });
    if (!inserted) return 'duplicate';
    if (held) { log('outbox_held', { blocker: 'postal_address_missing' }); return 'held'; }
    return deliverWelcome(sub, id);
  }
  // Manual retry of held and failed welcome messages. Nothing calls this on a schedule; see the README.
  // A held row that was never attempted may start at any time. A row that was attempted is retried only inside
  // the idempotency window of its first attempt; past it the row moves to 'review' and is never sent from here.
  async function retryOutbox() {
    const out = { sent: 0, failed: 0, held: 0, cancelled: 0, review: 0 };
    for (const row of await store.listOutbox(['held', 'failed', 'sending'])) {
      const t = now();
      if (row.status === 'sending' && t - row.updatedAt < LIMITS.sendingLeaseMs) continue; // another request holds it
      if (row.status === 'held' && !config.postalAddress) { out.held++; continue; }
      const lapsed = !!row.firstAttemptAt && t - row.firstAttemptAt >= LIMITS.idempotencyMs;
      if (row.status === 'failed' && !lapsed && row.attempts >= LIMITS.outboxAttempts) { out.failed++; continue; }
      if (!await store.claimOutbox(row.id, [row.status], t, row.updatedAt)) continue;
      if (lapsed) { out[await reviewWelcome(row.id)]++; continue; }
      const sub = await store.getSubscriber(row.subscriberId);
      if (!sub || sub.status !== 'confirmed') { await store.markOutbox(row.id, 'cancelled', { now: now() }); out.cancelled++; continue; }
      out[await deliverWelcome(sub, row.id)]++;
    }
    return out;
  }

  async function subscribe(request) {
    if (request.method !== 'POST') return methodNot('POST');
    if (!sameOrigin(request)) return json(403, { error: 'forbidden_origin' });
    const type = contentType(request), asForm = type === 'application/x-www-form-urlencoded';
    if (type !== 'application/json' && !asForm) return json(415, { error: 'unsupported_media_type' });
    const raw = await readBody(request);
    if (raw === null) return json(413, { error: 'body_too_large' });
    let body;
    if (asForm) { const f = new URLSearchParams(raw); body = { email: f.get('email'), consent: f.get('consent') === 'yes', source: f.get('source'), placement: f.get('placement'), requestId: f.get('requestId'), website: f.get('website') || '' }; }
    else { try { body = JSON.parse(raw); } catch { body = null; } }
    const reply = (status, payload, state) => asForm ? page(status, state) : json(status, payload);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400, { error: 'invalid_request' }, 'retry');
    // a filled honeypot gets the same answer as a real request and no work is done
    if (typeof body.website === 'string' && body.website.trim()) { log('honeypot', {}); return reply(202, { status: 'pending' }, 'pending'); }
    const email = normalizeEmail(body.email);
    if (!email) return reply(400, { error: 'invalid_email' }, 'retry');
    if (body.consent !== true) return reply(400, { error: 'consent_required' }, 'retry');
    const t = now(), bucket = Math.floor(t / LIMITS.hourMs);
    const ipKey = await hmac(secret, `ip:${request.headers.get('cf-connecting-ip') || 'unknown'}`);
    if (await store.rateHit(`ip:${ipKey}`, bucket) > LIMITS.ipPerHour) { log('rate_ip', {}); return json(429, { error: 'rate_limited' }, { 'retry-after': '3600' }); }
    const emailKey = await hmac(secret, `email:${email}`);
    const requestId = typeof body.requestId === 'string' && REQUEST_ID.test(body.requestId) ? body.requestId : b64url(randomBytes(16));
    const requestKey = await sha256(`${requestId}:${emailKey}`);
    const done = () => reply(202, { status: 'pending' }, 'pending');
    // A repeat of a request id starts nothing new, but it may still retry a delivery that has not been accepted.
    const fresh = await store.claimRequest(requestKey, t);
    if (!fresh) log('duplicate_request', {});
    else if (await store.rateHit(`email:${emailKey}`, bucket) > LIMITS.emailPerHour) { log('rate_email', {}); return done(); }
    const existing = await store.getSubscriberByEmailKey(emailKey);
    if (existing && existing.status === 'confirmed') { log('already_confirmed', {}); return done(); }
    const consent = {
      consentVersion, consentAt: t,
      source: typeof body.source === 'string' && body.source.startsWith('/') ? body.source.slice(0, 200) : '/',
      placement: PLACEMENTS.has(body.placement) ? body.placement : 'unknown'
    };
    let row = await store.getPending(emailKey);
    if (!row || !row.nonce || row.tokenExpiresAt <= t) {
      // no live link: a new request gets a new one. Another request for the same address may write its row first;
      // whichever row is stored is the one delivered, so one address never has two working links.
      if (!fresh) return done();
      const nonce = b64url(randomBytes(16));
      await store.startPending({ emailKey, email, nonce, tokenHash: await sha256(await confirmToken(emailKey, nonce)), tokenExpiresAt: t + LIMITS.tokenTtlMs, ...consent, createdAt: t }, t);
      row = await store.getPending(emailKey);
    } else if (fresh && (row.sendStatus === 'sent' ? t - row.lastSentAt >= LIMITS.emailCooldownMs : !retryable(row, t) && t - row.sendClaimedAt >= LIMITS.emailCooldownMs)) {
      // "request another link": the same link is delivered again under a new key; the first email keeps working
      await store.renewPending(emailKey, row.sendSeq, consent);
      row = await store.getPending(emailKey);
    }
    if (!row || !retryable(row, t)) { log('cooldown', {}); return done(); }
    // The answer is the same whether or not the provider takes the message. One it did not take stays queued on
    // the row, for this request repeated, a later request or retryConfirmations().
    await deliverConfirmation(row, t);
    return done();
  }

  async function confirm(request, url) {
    if (request.method === 'GET' || request.method === 'HEAD') {
      const token = url.searchParams.get('t') || '';
      return TOKEN.test(token) ? page(200, 'review', token) : page(400, 'expired'); // no lookup, no change
    }
    if (request.method !== 'POST') return methodNot('GET, POST');
    if (!sameOrigin(request)) return json(403, { error: 'forbidden_origin' });
    const raw = await readBody(request);
    if (raw === null) return json(413, { error: 'body_too_large' });
    const token = new URLSearchParams(raw).get('t') || '';
    if (!TOKEN.test(token)) return page(400, 'expired');
    const { result, subscriber } = await store.confirm({ tokenHash: await sha256(token), id: uuid(), now: now() });
    log('confirm', { result });
    if (result === 'confirmed') { const welcome = await queueWelcome(subscriber); log('welcome', { result: welcome }); return page(200, 'confirmed'); }
    if (result === 'already') return page(200, 'repeat');
    return page(result === 'expired' ? 410 : 400, 'expired');
  }

  async function unsubscribe(request, url) {
    const fromQuery = url.searchParams.get('t') || '';
    if (request.method === 'GET' || request.method === 'HEAD') return await unsubId(fromQuery) ? page(200, 'unsubscribe', fromQuery) : page(400, 'invalid');
    if (request.method !== 'POST') return methodNot('GET, POST');
    // mail providers post here without an Origin header (RFC 8058), so the signed token is the only check
    const raw = await readBody(request);
    if (raw === null) return json(413, { error: 'body_too_large' });
    const id = await unsubId(fromQuery || new URLSearchParams(raw).get('t') || '');
    if (!id || !await store.unsubscribe(id, now())) return page(400, 'invalid');
    log('unsubscribed', {});
    return page(200, 'unsubscribed');
  }

  async function handle(request) {
    const url = new URL(request.url), route = url.pathname.replace(/\/+$/, '');
    try {
      if (route === `${BASE}/subscribe`) return await subscribe(request);
      if (route === `${BASE}/confirm`) return await confirm(request, url);
      if (route === `${BASE}/unsubscribe`) return await unsubscribe(request, url);
      return json(404, { error: 'not_found' });
    } catch (e) {
      log('error', { route, name: e && e.name ? e.name : 'Error' });
      return json(500, { error: 'server_error' });
    }
  }
  handle.retryOutbox = retryOutbox;
  handle.retryConfirmations = retryConfirmations;
  return handle;
}

// Default Worker entry. Closed (503) until UPDATES_ENABLED is "true" and the D1 binding, the Resend key, the
// token secret and the allowed origin are all configured. There is no scheduled handler.
export default {
  async fetch(request, env) {
    const { ok, missing, config } = readUpdatesConfig(env);
    if (!ok) { console.log(JSON.stringify({ event: 'updates_unavailable', missing })); return json(503, { error: 'updates_unavailable' }); }
    const handler = createUpdatesHandler({
      store: new D1Store(env.UPDATES_DB), mailer: resendMailer({ apiKey: env.RESEND_API_KEY, from: config.sender }), config,
      log: (event, fields) => console.log(JSON.stringify({ event, ...fields }))
    });
    return handler(request);
  }
};

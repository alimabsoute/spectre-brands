-- Free email updates: D1 (SQLite) schema for backend/updates-worker.mjs.
-- Not applied anywhere. Create the database and run this file only when the caller decides to go live.
-- No table holds a password, a session or a payment. Times are Unix milliseconds.

-- A request waiting for its confirmation click. One row per address. A row here is not a subscriber and
-- receives no updates. The token is never stored: it is HMAC(UPDATES_TOKEN_SECRET, email_key + nonce), rebuilt
-- when the email is built, and only its SHA-256 hash is kept. While the link is live a new request re-delivers
-- the same link; the nonce (and so the link) changes only after the row has expired.
-- The send_* columns are the confirmation outbox: one delivery per send_seq, each with its own idempotency key.
CREATE TABLE IF NOT EXISTS updates_pending (
  email_key        TEXT PRIMARY KEY,   -- HMAC-SHA256(UPDATES_TOKEN_SECRET, 'email:' + lower-cased address)
  email            TEXT NOT NULL,
  nonce            TEXT NOT NULL DEFAULT '', -- random; with the secret it regenerates the token
  token_hash       TEXT NOT NULL UNIQUE,
  token_expires_at INTEGER NOT NULL,   -- 24 hours after the latest delivery attempt
  consent_version  TEXT NOT NULL,
  consent_at       INTEGER NOT NULL,
  source           TEXT NOT NULL,      -- page path the form was on
  placement        TEXT NOT NULL,      -- top | mid | footer | unknown
  created_at       INTEGER NOT NULL,
  last_sent_at     INTEGER NOT NULL DEFAULT 0, -- last time the provider accepted the confirmation
  send_seq         INTEGER NOT NULL DEFAULT 1, -- delivery number; part of the idempotency key
  send_status      TEXT NOT NULL DEFAULT 'queued' CHECK (send_status IN ('queued', 'sending', 'sent', 'failed')),
  send_attempts    INTEGER NOT NULL DEFAULT 0, -- provider attempts for this send_seq
  send_first_at    INTEGER NOT NULL DEFAULT 0, -- first provider attempt for this send_seq; 0 when never attempted
  send_claimed_at  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS updates_pending_send ON updates_pending (send_status, created_at);

-- Written only by a confirmation. status is 'confirmed' or 'unsubscribed'.
CREATE TABLE IF NOT EXISTS updates_subscribers (
  id                 TEXT PRIMARY KEY,  -- random UUID; the unsubscribe token is this id signed with the token secret
  email_key          TEXT NOT NULL UNIQUE,
  email              TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('confirmed', 'unsubscribed')),
  consent_version    TEXT NOT NULL,
  consent_at         INTEGER NOT NULL,
  source             TEXT NOT NULL,
  placement          TEXT NOT NULL,
  confirmed_at       INTEGER NOT NULL,
  confirm_token_hash TEXT NOT NULL UNIQUE, -- the link that confirmed; a replay of it answers "already confirmed"
  unsubscribed_at    INTEGER
);

-- Idempotency: one row per (request id, address) pair, hashed.
CREATE TABLE IF NOT EXISTS updates_requests (
  request_key TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL
);

-- Fixed one-hour windows. key is 'ip:' or 'email:' plus an HMAC; no raw IP address or email address is stored here.
CREATE TABLE IF NOT EXISTS updates_rate (
  key    TEXT NOT NULL,
  bucket INTEGER NOT NULL,             -- floor(time / one hour)
  count  INTEGER NOT NULL,
  PRIMARY KEY (key, bucket)
);

-- Durable outbox for the welcome email. id is 'welcome:' + subscriber id, so a subscriber has at most one row.
-- status: sending | sent | failed | held | review | cancelled. blocker names the configuration gap of a held
-- row, or 'idempotency_window_expired' on a review row.
-- first_attempt_at is written before the first provider request and never changes. A row is re-sent only inside
-- the provider's idempotency window from that time. After it, a row that is not 'sent' moves to 'review': the
-- first attempt may have been delivered, so a person checks the provider before anything else happens. Do not
-- reset a review row to 'failed' or 'held' and do not clear first_attempt_at.
CREATE TABLE IF NOT EXISTS updates_outbox (
  id               TEXT PRIMARY KEY,
  subscriber_id    TEXT NOT NULL REFERENCES updates_subscribers(id),
  kind             TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('sending', 'sent', 'failed', 'held', 'review', 'cancelled')),
  blocker          TEXT,
  attempts         INTEGER NOT NULL DEFAULT 0,
  last_error       TEXT,               -- a provider status code such as 'provider_500'; never message content
  provider_id      TEXT,
  first_attempt_at INTEGER,            -- NULL until a provider request is about to be made
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS updates_outbox_status ON updates_outbox (status, created_at);

-- A database created from the earlier version of this file (none is known to exist) needs, by hand:
--   ALTER TABLE updates_pending ADD COLUMN nonce TEXT NOT NULL DEFAULT '';
--   ALTER TABLE updates_pending ADD COLUMN send_seq INTEGER NOT NULL DEFAULT 1;
--   ALTER TABLE updates_pending ADD COLUMN send_status TEXT NOT NULL DEFAULT 'sent';
--   ALTER TABLE updates_pending ADD COLUMN send_attempts INTEGER NOT NULL DEFAULT 0;
--   ALTER TABLE updates_pending ADD COLUMN send_first_at INTEGER NOT NULL DEFAULT 0;
--   ALTER TABLE updates_pending ADD COLUMN send_claimed_at INTEGER NOT NULL DEFAULT 0;
--   ALTER TABLE updates_outbox  ADD COLUMN first_attempt_at INTEGER;
-- Earlier pending rows keep working links but have no nonce, so their email cannot be rebuilt; a new request
-- for such an address replaces the row. SQLite cannot alter a CHECK, so the 'review' status needs
-- updates_outbox rebuilt (create the new table, copy the rows, swap the names).

-- Housekeeping, to be run by hand (no Cron trigger is configured). :now is the current time in milliseconds.
--   DELETE FROM updates_pending  WHERE token_expires_at < :now;
--   DELETE FROM updates_requests WHERE created_at < :now - 86400000;
--   DELETE FROM updates_rate     WHERE bucket < (:now / 3600000) - 24;

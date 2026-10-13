# Email updates

Free email updates from Spectre Brands, with double opt-in. There are no accounts, passwords, memberships, tiers or payments anywhere in this feature.

Status on 2026-10-11: written, not deployed. Nothing was deployed, no email was sent, no database or DNS record was created, and no key was read.

A hardening pass on the same day changed `backend/updates-worker.mjs`, `backend/updates-schema.sql`, `assets/js/updates.js`, `lib/updates.mjs` and `tests/updates.test.mjs`. It was written without a shell: the changed tests have not been run, and every statement below about that pass describes the code as written. The caller runs the checks in "Needs verification" at the end of this file.

## Files

| File | What it holds |
| --- | --- |
| `lib/updates.mjs` | Markup (`updatesTop`, `updatesMid`, `updatesFooter`, `updatesConfirmationPreview`, `updatesDocument`), the two emails (`confirmationEmail`, `welcomeEmail`), copy and timing constants. No imports. |
| `assets/css/updates.css` | Styles for the three placements, the state pages and the confirmation burst. |
| `assets/js/updates.js` | Form requests, prompt timing, the sticky top row, the one-time burst. No dependencies. |
| `backend/updates-worker.mjs` | Worker handler, `MemoryStore`, `D1Store`, the Resend adapter. |
| `backend/updates-schema.sql` | D1 tables. Not applied anywhere. |
| `backend/updates-config.example.json` | Placeholder settings. No credential. |
| `scripts/updates-email-preview.mjs` | Writes the email and state previews under this folder. Sends nothing. |
| `tests/updates.test.mjs` | Unit tests with synthetic `example.test` addresses and a mock mailer. |
| `21st-source.md` | Which 21st.dev component was retrieved and how it was used. |

## Integration (for the caller)

No existing file was edited. To put the feature on a page:

1. Load `/assets/css/updates.css` after the site stylesheets and `/assets/js/updates.js` with `defer`.
2. Place `updatesTop({ slug })` directly after the chapter nav (`.pm-toc` or `.pagenav`), as a child of `<body>` or of a container as tall as the page. A sticky element only sticks inside its parent.
3. Place `updatesMid({ slug })` inside the article column, around the middle of the article. It renders hidden.
4. Place `updatesFooter({ slug })` directly before `<footer class="foot">`.

Pass `preview: true` only on review screens. A preview form never calls the network, and a preview prompt shows at once and stores nothing.

The script finds the article through `[data-upd-article]`, then `main article`, then `main`. Add `data-upd-article` to the element that holds the post-mortem if `main` holds more than the article.

### Pausing the prompt during film and TV playback

The script treats each of these as playback:

- a `data-film-playing` attribute on any element (`assets/js/film.js` sets it on the TV and on `<html>` while the film plays);
- a playing `<video>` or `<audio>`, other than a muted loop;
- an activated YouTube embed that is on screen (`youtube.com/embed`, `youtube-nocookie.com/embed`, or any iframe inside `[data-embed]`). Its pause state cannot be read from the page, so it counts as playing for as long as any part of it is in the viewport;
- a focused `<iframe>`.

A player built another way should tell it directly, by any one of these:

- `SpectreUpdates.hold()` on play and `SpectreUpdates.release()` on pause or end.
- The events `spectre:updates-hold` and `spectre:updates-release` dispatched on `document`.
- A `data-upd-hold` attribute on any element for as long as playback lasts.

While a hold is active the reading clock stops and the prompt cannot appear.

## When the mid-article prompt appears

The constants are `UPDATES_TIMING` in `lib/updates.mjs` and `TIMING` in `assets/js/updates.js`. A test fails if they differ.

| Constant | Value | Meaning |
| --- | --- | --- |
| `activeMs` | 45000 | 45 seconds of active reading |
| `progress` | 0.35 | 35% of the article scrolled; required together with `activeMs` |
| `cooldownDays` | 30 | A dismissal lasts 30 days |
| once per session | | A session flag is set when the prompt is shown |

A second counts as active reading only while the tab is visible, the window has focus, no media is playing, no form field has focus and no overlay is open. An overlay is an open `<dialog>` (the source overlay and search are dialogs), an `aria-modal` element, a popover, the mobile menu, an open glossary term (`.glossary-button[aria-expanded="true"]`), or an open site or section menu (`.dd.open`, `.pn-g.open`). Under the same conditions the prompt is not shown: it waits until they clear.

### Inspecting the prompt in a browser

`SpectreUpdates.state()` returns what the timer sees: `visible`, `focused`, `mediaPlaying`, `typing`, `overlayOpen`, `suppressed`, `activeMs`, `progress`, `placementSafe`, `shown`, plus `eligible` and `blockers`. `SpectreUpdates.eligibility(state)` is the pure rule behind the last two; it reads nothing from the page. Blocker names: `suppressed`, `tab-hidden`, `window-unfocused`, `media`, `typing`, `overlay`, `active-time`, `progress`, `placement`. Both only report. Nothing in the page URL and no call on `SpectreUpdates` makes the prompt appear early.

The prompt is suppressed after a dismissal, after any accepted form request in the session, while a request is pending (24 hours) and once an address is confirmed in this browser. With storage disabled the same flags live in memory for the page, and no error is shown.

It never takes focus. The close button and Escape close it and record the dismissal. Focus returns to its earlier place only if it was inside the prompt when it closed.

At 900px and wider the prompt is a fixed card in the bottom corner that scrolls inside itself before it would leave the viewport. Below 900px it is inline in the article, and it is revealed only while its slot is still below the viewport, so text the reader is on does not move. A reader who has already scrolled past the slot when the conditions are met does not see the prompt on that page. Closing the inline prompt (the close button or Escape) after scrolling past it corrects the scroll position by the distance the following element moved, so the text being read stays where it is.

## The top row

In the page flow by default, and always in flow below 900px wide or 640px tall. On larger viewports the script measures the sticky chapter nav, sets `--upd-nav-h` and `--upd-top-h` on `<html>`, and adds `html.upd-sticky`. The row then sticks below the nav and `scroll-padding-top` grows by the row's height, so in-page links land clear of both bars. Without JavaScript the row does not stick. The row is hidden for 24 hours after a request and for good once an address is confirmed in this browser.

A custom sticky nav can opt in to the measurement with `data-upd-sticky-nav`.

## Client request

`POST /api/updates/subscribe` with JSON `{ email, consent: true, source, placement, requestId, website }`. `source` is `location.pathname`. `website` is the honeypot and is empty for a person. The address is trimmed and validated before the request. A retry of the same address from the same form reuses its `requestId`.

| Response | What the reader sees |
| --- | --- |
| 202 | "Check your inbox to confirm." The form fields are replaced by this line, with "No email after a few minutes? Request another link" under it. Nothing says "subscribed", and nothing says the email was delivered. |
| 400 `invalid_email`, `consent_required` | The error under the field, linked with `aria-describedby`, and focus on that field. |
| 429 | "Too many requests from this connection in the last hour. This request was not processed. Try again later." |
| 503 or other | "Email updates are not available right now, and this request was not completed. Try again later." |
| no response | "No answer came back from the server, so this request may not have gone through. Check the connection and try again." |

No message says what the server stored. The script cannot know, and a request that fails late can leave a pending row behind.

"Request another link" brings the empty form back and moves focus to the email field. The address is never kept in the page, so the reader types it again and ticks the box again. The backend sends at most one confirmation per address every two minutes, which is why the line says "a few minutes".

Without JavaScript the form posts natively and the Worker answers with a page. Its pending page says the same thing in a sentence: delivery is not guaranteed, and entering the address again requests another link.

The email address is never written to `localStorage` or `sessionStorage`. The keys are `sb:upd:dismissed` (a timestamp), `sb:upd:state` (`pending:<time>` or `confirmed`), `sb:upd:celebrated`, and the session keys `sb:upd:shown` and `sb:upd:accepted`.

## Confirmation and the burst

"You’re on the list!" appears only on the page the Worker returns from a `POST /confirm` that made the transition. A replayed link or a reload gets "This address is already confirmed." The burst of blue and amber ticket stubs runs once, for under 1.2 seconds, in a layer with `pointer-events: none` and `aria-hidden="true"`, and the layer is then removed. `sb:upd:celebrated` stops it from running again in the same browser. Under reduced motion there is no burst; the page shows five static stubs.

## Backend

Routes, all under `/api/updates`:

| Route | Effect |
| --- | --- |
| `POST /subscribe` | Validates, rate-limits, stores a pending request, queues and attempts the confirmation email. Answers 202 `{"status":"pending"}` for every well-formed request, whether or not the provider took the email. |
| `GET /confirm?t=` | A page with a "Confirm subscription" button. No lookup and no change, so a link scanner cannot confirm an address. |
| `POST /confirm` | Confirms in one transaction. Queues the welcome email. |
| `GET /unsubscribe?t=` | A page with an "Unsubscribe" button. No change. |
| `POST /unsubscribe?t=` | Unsubscribes. Also the RFC 8058 one-click target, so it does not require an `Origin` header. Idempotent. |

The default export answers 503 `{"error":"updates_unavailable"}` to every request until all five of these are set: `UPDATES_ENABLED` equal to the string `true`, the `UPDATES_DB` binding, `RESEND_API_KEY`, `UPDATES_TOKEN_SECRET` (32 characters or more) and `UPDATES_ORIGIN` (an https origin). There is no scheduled handler.

A key or secret that looks like a stand-in counts as unset, whatever its length: anything containing `REPLACE_`, `placeholder`, `example`, `changeme`, `your-api-key` and similar, text in angle brackets, one character repeated, or leading or trailing whitespace. So the values in `backend/updates-config.example.json` keep the handler closed even with `UPDATES_ENABLED` set to `true`. This is a shape check. No key is tested against Resend, and a wrong but plausible key is not detected here. The origin must be https and the sender defaults to `Spectre Brands <hello@spectrebrands.com>`, as before.

Checks on `POST /subscribe`, in order: method, `Origin` equal to `UPDATES_ORIGIN`, content type (`application/json` or a form post), a 2,048-byte body cap, honeypot, email format, `consent === true`, 5 requests per client address per clock hour (429), request-id idempotency, 3 new requests per email address per clock hour, already confirmed, and a two-minute cooldown per address. Every case from the idempotency check onward answers the same 202, including a provider outage, so neither the status nor the body reveals whether an address is known. Response timing was not equalized: a request that reaches the provider takes longer than one that does not.

The body cap is enforced while the body is read. A declared `content-length` over the cap is refused before any byte is read; otherwise the stream is read chunk by chunk and cancelled at the first byte past 2,048, so a chunked request with no length is never buffered whole. The same reader serves `/confirm` and `/unsubscribe`.

What is stored: the address itself (needed to send mail), an HMAC of the address as its key, the consent version, the consent time, the page path and the placement. Rate-limit keys are HMACs of the client address and of the email address; no raw IP address is stored. Logs carry event names and codes only.

Tokens: the confirmation token is HMAC-SHA256 of the address key and a random per-row nonce, keyed with `UPDATES_TOKEN_SECRET`. The row stores the nonce and the token's SHA-256 hash, never the token; the Worker rebuilds the token when it builds the email, so every attempt for a row carries the same link. The link expires 24 hours after the latest delivery attempt. Changing `UPDATES_TOKEN_SECRET` makes queued confirmations unsendable (the rebuilt token no longer matches the stored hash, and nothing is sent); links already delivered keep working. The unsubscribe token is the subscriber's random id signed with HMAC-SHA256 and compared in constant time. Every URL in a page or an email is built from `UPDATES_ORIGIN`; no request value becomes a redirect or a link target.

A pending request lives in `updates_pending`, with the consent version, consent time, page path and placement captured at the request. A row is written to `updates_subscribers` only by a confirmation, so no subscriber exists before one.

### Idempotency keys and the 24-hour window

Resend keeps an idempotency key for 24 hours. Inside that time a repeat of the same key with the same payload is not sent twice; after it the key is forgotten and the same request would send again. The Worker therefore records the time of the first provider attempt before the request leaves, and retries a message under its key only within `LIMITS.idempotencyMs` (23 hours) of that time. [NEED: confirm the 24-hour retention, and the behaviour for a repeated key with a different payload, against the current Resend documentation before going live. The Worker never sends a different payload under a used key.]

### Confirmation email: the queue on the pending row

The pending row is also the confirmation outbox. Its columns: `send_seq` (the delivery number), `send_status` (`queued`, `sending`, `sent`, `failed`), `send_attempts`, `send_first_at`, `send_claimed_at`, `last_sent_at`.

- The `Idempotency-Key` is `updates-confirm-<first 40 hex of the token hash>-<send_seq>`. The email is rebuilt from the stored nonce, so every attempt of one delivery has the same key and the same payload.
- If Resend refuses the email or does not answer, the row is `failed` and the response is still 202. The reader sees "Check your inbox to confirm" with the request-another-link path. Nobody is confirmed and the captured consent stays on the row.
- The same request sent again (same `requestId`) retries that delivery under the same key, up to 5 provider attempts and only inside the 23-hour window.
- A new request for an address with a live link ("request another link") starts delivery `send_seq + 1` of the same link under a new key, after the two-minute cooldown. The first email's link is not rotated away. The consent fields are refreshed from the new request.
- Each attempt restarts the link's 24 hours, so "The link works for 24 hours" is true of every email sent. A new link is generated only after the row has expired; the old link is then dead.
- Two requests racing for a new address share one row and one link; one of them makes the delivery.
- `createUpdatesHandler(...).retryConfirmations()` attempts every live `queued` or `failed` row that is still inside its limits and returns `{ sent, queued, skipped }`. It is not wired to any route or Cron trigger. Rows it skips are not sent until the reader asks again.

### Welcome email, the outbox and retries

A confirmation inserts one row in `updates_outbox` with the id `welcome:<subscriber id>`. The primary key makes a second welcome row for the same subscriber impossible, including after a replayed confirmation and after an unsubscribe and a new opt-in. The Resend request carries the `Idempotency-Key` `updates-welcome-<subscriber id>`.

| Outbox status | Meaning |
| --- | --- |
| `sending` | Claimed; the send is in progress. |
| `sent` | Resend accepted it. `provider_id` holds the id. |
| `failed` | Resend refused it or was unreachable. `last_error` holds a code such as `provider_500`; `attempts` counts tries. |
| `held` | Not attempted this time. `blocker` names the configuration gap. |
| `review` | Attempted, not known to be sent, and past the idempotency window. `blocker` is `idempotency_window_expired`. Nothing in the Worker sends this row again. |
| `cancelled` | The reader had unsubscribed before a retry. |

`first_attempt_at` is written immediately before the first provider request and never changes. Nothing retries on a schedule. `createUpdatesHandler(...).retryOutbox()` is not wired to any route or Cron trigger and returns `{ sent, failed, held, cancelled, review }`. It handles:

- `held` rows whose blocker is resolved. A held row that was never attempted may start at any time, however late.
- `failed` rows with fewer than 5 attempts, while inside the window of their first attempt.
- `sending` rows untouched for 15 minutes (a crash mid-send), under the same window rule.
- Any of these that was attempted and is past the window: moved to `review`, not sent.

Each row is claimed with a compare-and-set on its status and `updated_at`, so helpers running at once send it once.

A `review` row means the first attempt may have been delivered. Look the subscriber's address up in the Resend dashboard (or its API) for a message tagged `updates_welcome`. If one was delivered, set the row to `sent` by hand. If none was, sending it is a decision for a person; there is no helper for it, on purpose. Do not set a review row back to `failed` or `held` and do not clear `first_attempt_at`: that is the blind resend this status exists to prevent.

### Postal address blocker

The welcome email is commercial mail and must carry the sender's valid physical postal address. `welcomeEmail()` throws `postal_address_missing` when `postalAddress` is empty, and it never substitutes text.

While `UPDATES_POSTAL_ADDRESS` is empty, or still holds a `REPLACE_` placeholder:

- `POST /subscribe` and the confirmation email work as normal. The confirmation email is transactional and carries no postal address, promotion or unsubscribe link.
- `POST /confirm` confirms the address and shows "You’re on the list!".
- The welcome email is not sent. Its outbox row is `held` with `blocker = 'postal_address_missing'`.

[NEED: the business mailing address for Spectre Brands, from the site owner. It must not be a home or apartment address.] Once it is configured, `retryOutbox()` sends the held rows once each.

## Emails

`confirmationEmail({ confirmUrl })` and `welcomeEmail({ unsubscribeUrl, postalAddress })` return `{ subject, html, text }`. The HTML is a 600px table with inline CSS and system fonts (Georgia for display and body, the system sans for labels). The wordmark is live text, bold "Spectre" then "Brands", because mail clients strip inline SVG. A `prefers-color-scheme: dark` block covers clients that honor it; the amber button with dark text holds its contrast either way. The plain text carries the same sentences as the HTML.

The welcome email's description is the `description` field of `site.json`, word for word. A test compares the two.

## Previews

`node scripts/updates-email-preview.mjs` writes:

- `emails/confirmation.html`, `emails/confirmation.txt`, `emails/welcome.html`, `emails/welcome.txt`. Links point at `preview.invalid`. The welcome preview prints "PREVIEW ONLY: POSTAL ADDRESS PLACEHOLDER" where the address goes.
- `states/forms.html`, plus dark and reduced-motion variants: the three placements in a filler page.
- `states/form-pending.html` and `states/form-error.html`: the footer form after an accepted request, and one whose request fails when sent.
- `states/page-<state>.html` for `pending`, `review`, `confirmed`, `repeat`, `expired`, `retry`, `unsubscribe`, `unsubscribed` and `invalid`, plus `page-confirmed-reduced-motion.html` and `page-confirmed-dark.html`.

The state files link `assets/css/tokens.css`, `assets/css/base.css`, `assets/pmpreview/sections.css` and `assets/preview/fonts.css` by relative path. Adjust the list in the script if the site's stylesheet set differs.

## Tests

`node --test tests/updates.test.mjs`. The D1 test runs the real SQL against `node:sqlite` and skips itself on a Node version without that module.

## Needs verification (the caller runs these)

Written, not run:

- `node --test tests/updates.test.mjs`. The suite grew from 17 tests to 24. Two tests lean on runtime behaviour worth watching on the first run: the streaming-body test builds a `Request` from a `ReadableStream` (`duplex: 'half'`, and one case sets `content-length` by hand), and the client test loads `assets/js/updates.js` in `node:vm` against two bare objects.
- The D1 statements against a real D1 database. The test uses `node:sqlite`, and skips itself where that module is missing. `UPDATE ... RETURNING` and the conditional `ON CONFLICT ... DO UPDATE ... WHERE` are the statements to watch.
- Resend: the idempotency-key retention and the same-key-different-payload answer (see above), with a real key. Resend domain verification for `spectrebrands.com` is still pending.
- Browser QA of the prompt with `SpectreUpdates.state()`: during film playback, with an activated YouTube embed on and off screen, with the source overlay, a glossary term and each menu open, and on a narrow screen closing the prompt after scrolling past it.
- The "Request another link" line in all three placements. It reuses `.upd-btn`; `assets/css/updates.css` has no rule for `.upd-again` yet and was not edited in this pass.
- `scripts/updates-email-preview.mjs` output for the pending page and the pending form, whose copy changed.

## Not done, and why

- No database exists, so no migration was run. `backend/updates-schema.sql` lists the `ALTER TABLE` statements a database built from the earlier file would need.
- A change to the confirmation email's wording between two attempts of one delivery changes the payload under a used key. The Worker treats the provider's refusal as a failed attempt; the reader's next request starts a new delivery.
- `retryOutbox()` and `retryConfirmations()` read 50 rows a call, oldest first.

- The Impeccable brand and polish references under `${LOCAL_PATH}` could not be read: the file tools in this session are confined to the repository. The design follows `PRODUCT.md`, `assets/pmpreview/sections.css` and `docs/writing-rules/VOICE-SPECTRE.md` only.
- Fraunces and DM Sans are named first in the font stacks, with the site's serif and sans behind them. The Worker's pages do not load a font file; they show the fallback unless the caller adds one.
- `node scripts/slop-lint.mjs` was not run on the new copy.

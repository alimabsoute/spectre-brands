// Free email updates: the three on-page forms (top disclosure, mid-article prompt, footer invitation), the state pages
// the backend serves (confirm, confirmed, unsubscribe) and the two emails. No accounts, passwords or payments.
// This module has no imports so the Worker in backend/updates-worker.mjs can bundle it as it is.
// Client behaviour lives in assets/js/updates.js and the styles in assets/css/updates.css.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// When the mid-article prompt may appear. assets/js/updates.js carries the same numbers; tests/updates.test.mjs
// fails if the two drift apart.
export const UPDATES_TIMING = Object.freeze({
  activeMs: 45000,     // 45 seconds of active reading (page visible and focused, nothing playing, no field focused, no overlay open)
  progress: 0.35,      // and 35% of the article scrolled; both conditions must hold
  cooldownDays: 30,    // a dismissal hides the prompt for 30 days
  oncePerSession: true // shown at most once per browser session
});
export const UPDATES_ENDPOINT = '/api/updates/subscribe';
export const UPDATES_PLACEMENTS = Object.freeze(['top', 'mid', 'footer']);
export const UPDATES_STATES = Object.freeze(['pending', 'review', 'confirmed', 'repeat', 'expired', 'retry', 'unsubscribe', 'unsubscribed', 'invalid']);

// Every string a reader sees. assets/js/updates.js repeats the ones it sets at run time.
export const UPDATES_COPY = Object.freeze({
  label: 'Email',
  button: 'Get updates',
  consent: 'Send me free email updates from Spectre Brands. I can unsubscribe at any time.',
  topSummary: 'Free email updates',
  topContext: 'Confirm from your inbox. Unsubscribe at any time.',
  midTitle: 'Free email updates from Spectre Brands',
  footKicker: 'Email updates',
  footTitle: 'Spectre Brands by email.',
  footBody: 'Free email updates from Spectre Brands. No address is added until it is confirmed from its inbox, and every update has an unsubscribe link.',
  close: 'Close the email updates prompt',
  pending: 'Check your inbox to confirm.',
  againLead: 'No email after a few minutes?',
  again: 'Request another link',
  confirmed: 'You’re on the list!'
});

// The site's description, verbatim from site.json ("description"). The Worker cannot read site.json, so the
// sentence is repeated here and tests/updates.test.mjs checks it against the file.
export const SITE_DESCRIPTION = 'Sourced, illustrated post-mortems of companies and brands that died, or live on only as a name. Charts you can check, commercials you remember, and every figure linked to its source.';

// The ghost mark and wordmark from lib/layout.mjs (tests check the mark is identical).
export const UPDATES_MARK = '<svg class="brand-mark" viewBox="0 0 24 28" aria-hidden="true"><path d="M3 26.5V12a9 9 0 0 1 18 0v14.5l-3-2.6-3 2.6-3-2.6-3 2.6-3-2.6z" fill="currentColor"/><rect x="8" y="10" width="2.6" height="4.6" rx="1.3" fill="#fff"/><rect x="13.4" y="10" width="2.6" height="4.6" rx="1.3" fill="#fff"/></svg>';
const WORDMARK = `${UPDATES_MARK}<span class="wm"><b>Spectre</b> Brands</span>`;

const cleanSlug = slug => /^[a-z0-9][a-z0-9-]*$/.test(String(slug || '')) ? String(slug) : '';

// One form, used unchanged in all three placements; only the ids differ. It posts natively without JavaScript
// (the Worker accepts a form post and answers with a page); assets/js/updates.js upgrades it to a JSON request.
function form(placement, slug, preview) {
  const id = `upd-${placement}`, source = cleanSlug(slug) ? `/${cleanSlug(slug)}/` : '/';
  return `<form class="upd-form" id="${id}-form" data-upd-form data-placement="${placement}" action="${UPDATES_ENDPOINT}" method="post"${preview ? ' data-upd-preview' : ''}>
<div class="upd-fields">
<div class="upd-row">
<div class="upd-field"><label for="${id}-email">${UPDATES_COPY.label}</label><input type="email" id="${id}-email" name="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" maxlength="254" required aria-describedby="${id}-email-err ${id}-status"></div>
<button type="submit" class="upd-btn" id="${id}-submit">${UPDATES_COPY.button}</button>
</div>
<div class="upd-consent"><input type="checkbox" id="${id}-consent" name="consent" value="yes" required aria-describedby="${id}-consent-err"><label for="${id}-consent">${UPDATES_COPY.consent}</label></div>
<p class="upd-err" id="${id}-email-err" data-upd-err="email" hidden></p>
<p class="upd-err" id="${id}-consent-err" data-upd-err="consent" hidden></p>
<div class="upd-hp" aria-hidden="true"><label for="${id}-website">Website</label><input type="text" id="${id}-website" name="website" tabindex="-1" autocomplete="off"></div>
<input type="hidden" name="source" value="${esc(source)}"><input type="hidden" name="placement" value="${placement}">
</div>
<p class="upd-status" id="${id}-status" role="status" aria-live="polite" tabindex="-1"></p>
<p class="upd-again" data-upd-again hidden>${UPDATES_COPY.againLead} <button type="button" class="upd-btn upd-again-btn" id="${id}-again">${UPDATES_COPY.again}</button></p>
</form>`;
}

// One-line row under the masthead: a native disclosure, closed until the reader opens it, with the form in its
// body. It opens, closes and submits without JavaScript. In the page flow by default; assets/js/updates.js makes
// the collapsed summary stick below the chapter nav where there is room, and closes it on Escape.
export function updatesTop({ slug = '', preview = false } = {}) {
  return `<aside class="upd upd-top" id="upd-top" data-upd="top" aria-labelledby="upd-top-h"${preview ? ' data-upd-preview' : ''}>
<details class="upd-top-d">
<summary class="upd-top-s"><span class="upd-in"><span class="upd-tape" aria-hidden="true"></span><span class="upd-top-t" id="upd-top-h">${UPDATES_COPY.topSummary}</span><span class="upd-top-c">${UPDATES_COPY.topContext}</span><svg class="upd-top-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></summary>
<div class="upd-top-body"><div class="upd-in">
${form('top', slug, preview)}
</div></div>
</details>
</aside>
`;
}

// Mid-article prompt. Not a dialog: it never takes focus and never blocks the page. It stays hidden until
// assets/js/updates.js finds the reader eligible, so a page without JavaScript never shows it.
export function updatesMid({ slug = '', preview = false } = {}) {
  return `<div class="upd-mid-slot" data-upd-slot><aside class="upd upd-mid" id="upd-mid" data-upd="mid" aria-labelledby="upd-mid-h" hidden${preview ? ' data-upd-preview' : ''}>
<span class="upd-tape" aria-hidden="true"></span>
<button type="button" class="upd-x" id="upd-mid-close" data-upd-close aria-label="${UPDATES_COPY.close}"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
<h2 class="upd-mid-h" id="upd-mid-h">${UPDATES_COPY.midTitle}</h2>
${form('mid', slug, preview)}
</aside></div>
`;
}

// The main invitation, above the site footer.
export function updatesFooter({ slug = '', preview = false } = {}) {
  return `<section class="upd upd-foot" id="upd-footer" data-upd="footer" aria-labelledby="upd-footer-h"${preview ? ' data-upd-preview' : ''}><div class="upd-in">
<div class="upd-foot-head">
<p class="upd-k"><span class="upd-tape" aria-hidden="true"></span>${UPDATES_COPY.footKicker}</p>
<h2 class="upd-foot-h" id="upd-footer-h">${UPDATES_COPY.footTitle}</h2>
<p class="upd-foot-p">${UPDATES_COPY.footBody}</p>
</div>
<div class="upd-foot-body">
${form('footer', slug, preview)}
</div>
</div></section>
`;
}

// ---------- state pages ----------
const STATE = {
  pending: { h: UPDATES_COPY.pending, p: 'If the address can be added, a confirmation email is sent to it, and the link in it works for 24 hours. No address is added until it is confirmed. Delivery can take a few minutes and is not guaranteed: if nothing arrives, enter the address again on Spectre Brands to request another link.', back: true },
  review: { h: 'Confirm your subscription', p: 'Press the button to receive free email updates from Spectre Brands at this address. You can unsubscribe at any time.', post: 'confirm', button: 'Confirm subscription' },
  confirmed: { h: UPDATES_COPY.confirmed, p: 'This address is confirmed for free email updates from Spectre Brands. Every update has an unsubscribe link.', back: true, stubs: true },
  repeat: { h: 'This address is already confirmed.', p: 'Nothing changed, and no new email was sent.', back: true },
  expired: { h: 'This confirmation link no longer works.', p: 'Confirmation links last 24 hours. Enter the address again on Spectre Brands to get a new one. Nothing was added.', back: true },
  retry: { h: 'That request did not go through.', p: 'Enter a valid email address and tick the consent box, then send the form again. No confirmation email was sent for this request.', back: true },
  unsubscribe: { h: 'Unsubscribe from email updates', p: 'Press the button to stop email updates from Spectre Brands to this address.', post: 'unsubscribe', button: 'Unsubscribe' },
  unsubscribed: { h: 'You are unsubscribed.', p: 'This address will not receive email updates from Spectre Brands. To start again, enter it on the site and confirm it.', back: true },
  invalid: { h: 'This unsubscribe link is not valid.', p: 'Use the unsubscribe link in the most recent email from Spectre Brands.', back: true }
};

// The <main> of a state page. `fresh` marks a confirmation the backend has just made (the only state that may
// celebrate); a reload or a replayed link gets 'repeat' from the backend, never 'confirmed'.
function statePage({ state = 'pending', token = '', home = '/', base = '/api/updates', preview = false } = {}) {
  const s = STATE[state] || STATE.pending, key = STATE[state] ? state : 'pending';
  const mark = key === 'confirmed' ? ' data-upd-confirmed="new"' : key === 'repeat' ? ' data-upd-confirmed="repeat"' : '';
  return `<main class="upd-page" id="main" data-upd-state="${key}"${mark}${preview ? ' data-upd-preview' : ''}>
<a class="upd-brand" href="${esc(home)}" aria-label="Spectre Brands home">${WORDMARK}</a>
<div class="upd-card">
<span class="upd-tape" aria-hidden="true"></span>
<p class="upd-k">${UPDATES_COPY.footKicker}</p>
<h1 class="upd-page-h">${s.h}</h1>
<p class="upd-page-p">${s.p}</p>
${s.stubs ? '<div class="upd-stubs" aria-hidden="true"><i class="a"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="a"></i></div>\n' : ''}${s.post ? `<form class="upd-page-form" method="post" action="${esc(base)}/${s.post}"><input type="hidden" name="t" value="${esc(token)}"><button type="submit" class="upd-btn">${s.button}</button></form>\n` : ''}${s.back ? `<p class="upd-page-back"><a href="${esc(home)}">Back to Spectre Brands</a></p>\n` : ''}</div>
</main>
`;
}

// Semantic HTML of one state, for review screens. States: pending, review, confirmed, repeat, expired, retry,
// unsubscribe, unsubscribed, invalid. The forms carry a synthetic token and the page is marked as a preview, so
// assets/js/updates.js does not write the durable "confirmed" marker and replays the confirmed state on each load.
export function updatesConfirmationPreview({ state = 'pending' } = {}) {
  return statePage({ state, token: 'preview-token', home: 'https://preview.invalid/', base: 'https://preview.invalid/api/updates', preview: true });
}

// The full document the Worker serves. `origin` is the configured site origin; every URL stays on it.
export function updatesDocument({ state = 'pending', origin = '', token = '', version = '' } = {}) {
  const s = STATE[state] || STATE.pending, o = String(origin).replace(/\/+$/, ''), v = esc(version);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<title>${s.h.replace(/[.!]$/, '')} · Spectre Brands</title>
<link rel="icon" href="${esc(o)}/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${esc(o)}/assets/css/updates.css${v}">
</head>
<body class="upd-doc">
${statePage({ state, token, home: `${o}/`, base: `${o}/api/updates` })}<script defer src="${esc(o)}/assets/js/updates.js${v}"></script>
</body>
</html>
`;
}

// ---------- emails ----------
// Table layout, 600px, inline CSS, system type only. The wordmark is live text because mail clients strip inline SVG.
const E = { paper: '#F6EFE0', card: '#FCFBF8', ink: '#1B1815', ink2: '#3E3731', mute: '#5F554A', line: '#CDC1A6', amber: '#F2A33C' };
const SERIF = "Georgia,'Times New Roman',Times,serif", SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export class UpdatesConfigError extends Error {
  constructor(code, message) { super(message); this.name = 'UpdatesConfigError'; this.code = code; }
}
function httpsUrl(value, name) {
  let u; try { u = new URL(String(value)); } catch { throw new TypeError(`${name} must be an absolute URL`); }
  if (u.protocol !== 'https:') throw new TypeError(`${name} must use https`);
  return u.toString();
}
const para = (text, extra = '') => `<p class="sb-ink2" style="margin:0 0 16px;font:400 17px/1.6 ${SERIF};color:${E.ink2};${extra}">${text}</p>`;
const small = text => `<p class="sb-mute" style="margin:0 0 8px;font:400 13px/1.55 ${SANS};color:${E.mute}">${text}</p>`;
const button = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px"><tr><td bgcolor="${E.amber}" style="background:${E.amber};border-radius:6px"><a href="${esc(href)}" style="display:inline-block;padding:14px 22px;font:700 16px/1.25 ${SANS};color:${E.ink};text-decoration:none;border-radius:6px">${label}</a></td></tr></table>`;
const link = (href, label) => `<a class="sb-link" href="${esc(href)}" style="color:${E.ink};text-decoration:underline">${label}</a>`;

function shell({ title, preheader, body, footer }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
<style>
@media (max-width:620px){.sb-pad{padding:28px 20px!important}.sb-h{font-size:26px!important}}
@media (prefers-color-scheme:dark){
.sb-body,.sb-outer{background:#221E1B!important}.sb-card{background:#2E2925!important;border-color:#52493F!important}
.sb-ink,.sb-h,.sb-link{color:#F3EBDC!important}.sb-ink2{color:#DDD4C4!important}.sb-mute{color:#B3A896!important}.sb-rule{border-color:#52493F!important}
}
</style>
</head>
<body class="sb-body" style="margin:0;padding:0;background:${E.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}</div>
<table role="presentation" class="sb-outer" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${E.paper}" style="background:${E.paper}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
<tr><td style="padding:0 4px 16px"><span class="sb-ink" style="font:400 22px/1.2 ${SERIF};color:${E.ink};letter-spacing:-.01em"><b style="font-weight:700">Spectre</b> Brands</span></td></tr>
<tr><td class="sb-card sb-pad" bgcolor="${E.card}" style="background:${E.card};border:1px solid ${E.line};border-radius:8px;padding:36px 36px 28px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="60" height="3" bgcolor="${E.amber}" style="width:60px;height:3px;line-height:3px;font-size:0;background:${E.amber}">&nbsp;</td></tr></table>
<h1 class="sb-h" style="margin:20px 0 16px;font:700 30px/1.15 ${SERIF};color:${E.ink};letter-spacing:-.015em">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 4px 0">
${footer}
</td></tr>
</table>
</td></tr></table>
</body>
</html>
`;
}

// Transactional: sent for a subscribe request, before any consent is confirmed. The same URL always gives the
// same message, which the Worker relies on when it retries a delivery under one idempotency key. It carries no postal
// address, no promotion and no unsubscribe link, because nothing has been subscribed.
export function confirmationEmail({ confirmUrl } = {}) {
  const url = httpsUrl(confirmUrl, 'confirmUrl');
  const subject = 'Confirm your subscription';
  const lead = 'You asked for email updates from Spectre Brands. Confirm this email address to receive them.';
  const life = 'The link works for 24 hours.';
  const ignore = 'If you did not request this email, ignore it. You will not be added.';
  const html = shell({
    title: subject, preheader: lead,
    body: `${para(lead)}
${button(url, 'Confirm subscription')}
${small(`${life} If the button does not open, copy this address into a browser:`)}
<p class="sb-mute" style="margin:0 0 20px;font:400 13px/1.55 ${SANS};color:${E.mute};word-break:break-all">${link(url, esc(url))}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="sb-rule" style="border-top:1px solid ${E.line};padding-top:16px">${para(ignore, 'margin:0;font-size:15px')}</td></tr></table>`,
    footer: small('Spectre Brands')
  });
  const text = `${subject}\n\n${lead}\n\n${url}\n\n${life}\n\n${ignore}\n\nSpectre Brands\n`;
  return { subject, html, text };
}

// Commercial: sent once, after a confirmation. It needs the sender's postal address from configuration. Without
// one it throws; the Worker then holds the message in the outbox. An address is never invented here.
export function welcomeEmail({ unsubscribeUrl, postalAddress, siteUrl = 'https://spectrebrands.com', description = SITE_DESCRIPTION } = {}) {
  const postal = String(postalAddress ?? '').trim();
  if (!postal) throw new UpdatesConfigError('postal_address_missing', 'The welcome email needs the sender’s postal address (UPDATES_POSTAL_ADDRESS).');
  const unsub = httpsUrl(unsubscribeUrl, 'unsubscribeUrl'), site = httpsUrl(siteUrl, 'siteUrl');
  const subject = UPDATES_COPY.confirmed;
  const lead = 'This email address is confirmed for free email updates from Spectre Brands.';
  const why = 'You are receiving this email because you confirmed a subscription to email updates from Spectre Brands.';
  const html = shell({
    title: subject, preheader: lead,
    body: `${para(lead)}
${para(esc(description))}
${para(link(site, 'Read the post-mortems'), 'margin:0')}`,
    footer: `${small(why)}
${small(link(unsub, 'Unsubscribe'))}
${small(`Spectre Brands<br>${esc(postal).replace(/\r?\n/g, '<br>')}`)}`
  });
  const text = `${subject}\n\n${lead}\n\n${description}\n\nRead the post-mortems: ${site}\n\n${why}\nUnsubscribe: ${unsub}\n\nSpectre Brands\n${postal}\n`;
  return { subject, html, text };
}

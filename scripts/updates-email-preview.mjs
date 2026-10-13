// Writes review files for the email updates feature. It sends nothing and opens no connection.
//   docs/design-review-v4/updates/emails/  confirmation and welcome email, HTML and plain text
//   docs/design-review-v4/updates/states/  the forms and every state page, using the real markup, CSS and JS
// Every URL is on preview.invalid, a reserved name that cannot resolve. The welcome preview shows a labeled
// placeholder where the sender's postal address goes; the Worker never sends one (it holds the email instead).
// Run: node scripts/updates-email-preview.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { confirmationEmail, welcomeEmail, updatesTop, updatesMid, updatesFooter, updatesConfirmationPreview, UPDATES_STATES } from '../lib/updates.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs', 'design-review-v4', 'updates');
const write = (rel, text) => { const file = path.join(out, rel); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); console.log(path.relative(root, file)); };

// ---------- emails ----------
const POSTAL_PLACEHOLDER = 'PREVIEW ONLY: POSTAL ADDRESS PLACEHOLDER\n[NEED: the sender’s business mailing address, from UPDATES_POSTAL_ADDRESS]';
const confirmation = confirmationEmail({ confirmUrl: 'https://preview.invalid/api/updates/confirm?t=PREVIEW-TOKEN-NOT-A-REAL-LINK' });
const welcome = welcomeEmail({ unsubscribeUrl: 'https://preview.invalid/api/updates/unsubscribe?t=PREVIEW-TOKEN-NOT-A-REAL-LINK', postalAddress: POSTAL_PLACEHOLDER, siteUrl: 'https://preview.invalid/' });
for (const [name, mail] of [['confirmation', confirmation], ['welcome', welcome]]) {
  write(`emails/${name}.html`, mail.html);
  write(`emails/${name}.txt`, `Subject: ${mail.subject}\n\n${mail.text}`);
}

// ---------- state screens ----------
const A = '../../../../assets';
const doc = ({ title, body, theme = '', motion = '', docClass = '' }) => `<!doctype html>
<html lang="en"${theme ? ` data-theme="${theme}"` : ''}${motion ? ` data-upd-motion="${motion}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} · email updates preview</title>
<link rel="stylesheet" href="${A}/preview/fonts.css">
<link rel="stylesheet" href="${A}/css/tokens.css">
<link rel="stylesheet" href="${A}/css/base.css">
<link rel="stylesheet" href="${A}/pmpreview/sections.css">
<link rel="stylesheet" href="${A}/css/updates.css">
</head>
<body${docClass ? ` class="${docClass}"` : ''}>
${body}
<script defer src="${A}/js/updates.js"></script>
</body>
</html>
`;
const filler = n => Array.from({ length: n }, () => '<p style="max-width:42rem;margin:0 auto 1.25rem;padding:0 1.25rem">Preview filler paragraph. It stands in for article text so the forms can be judged in a page of normal length.</p>').join('\n');
const forms = `${updatesTop({ slug: 'preview', preview: true })}<main id="main"><article data-upd-article>
<h1 style="max-width:42rem;margin:2rem auto 1.25rem;padding:0 1.25rem">Email updates: the three forms</h1>
${filler(6)}
${updatesMid({ slug: 'preview', preview: true })}${filler(10)}
</article></main>
${updatesFooter({ slug: 'preview', preview: true })}`;
write('states/forms.html', doc({ title: 'Forms', body: forms }));
write('states/forms-dark.html', doc({ title: 'Forms, dark', body: forms, theme: 'dark' }));
write('states/forms-reduced-motion.html', doc({ title: 'Forms, reduced motion', body: forms, motion: 'reduce' }));

// the footer form after an accepted request, and after a failed one (send it to see the error)
const formIn = mode => updatesFooter({ slug: 'preview', preview: true }).replace(/(<form[^>]*) data-upd-preview>/, `$1 data-upd-preview="${mode}">`);
write('states/form-pending.html', doc({ title: 'Form, pending', body: `<main id="main">${filler(2)}</main>\n${formIn('pending')}` }));
write('states/form-error.html', doc({ title: 'Form, request failed', body: `<main id="main">${filler(2)}</main>\n${formIn('error')}` }));

for (const state of UPDATES_STATES) write(`states/page-${state}.html`, doc({ title: `Page, ${state}`, body: updatesConfirmationPreview({ state }), docClass: 'upd-doc' }));
write('states/page-confirmed-reduced-motion.html', doc({ title: 'Page, confirmed, reduced motion', body: updatesConfirmationPreview({ state: 'confirmed' }), motion: 'reduce', docClass: 'upd-doc' }));
write('states/page-confirmed-dark.html', doc({ title: 'Page, confirmed, dark', body: updatesConfirmationPreview({ state: 'confirmed' }), theme: 'dark', docClass: 'upd-doc' }));

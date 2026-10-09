// Section-system preview for post-mortem pages (design-refresh only). Takes the built page HTML of a few brands and
// writes /preview/pm-<slug>/ with the preview stylesheet + script injected. Production pages are untouched.
import fs from 'node:fs'; import path from 'node:path';
export const PM_PREVIEW = ['blockbuster', 'orbitz-drink'];
export function pmPreview({ OUT, write, transform }) {
  for (const slug of PM_PREVIEW) {
    const src = path.join(OUT, slug, 'index.html'); if (!fs.existsSync(src)) continue;
    let html = fs.readFileSync(src, 'utf8');
    html = html.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">');
    html = html.replace('</head>', `<link rel="stylesheet" href="/assets/pmpreview/sections.css?v=${Date.now().toString(36)}"></head>`);
    html = html.replace('</body>', `<script src="/assets/pmpreview/sections.js?v=${Date.now().toString(36)}" defer></script></body>`);
    if (transform) html = transform(html, slug);
    write(`preview/pm-${slug}/index.html`, html);
  }
}

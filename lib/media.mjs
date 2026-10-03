// Images and video facades. Images are emitted as <picture> with an AVIF/WebP source and a JPEG/PNG
// fallback when a sibling file with the same basename exists; width/height are read from the file so
// the page never shifts while images load.
import fs from 'node:fs';
import path from 'node:path';
import { esc, inline } from './md.mjs';

const MIME = { avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml' };

// Pixel size of a PNG, JPEG, WebP or AVIF without dependencies.
export function imageSize(file) {
  const b = fs.readFileSync(file);
  try {
    if (b.toString('ascii', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (b[0] === 0xff && b[1] === 0xd8) {
      let o = 2;
      while (o < b.length) {
        if (b[o] !== 0xff) { o++; continue; }
        const m = b[o + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(o + 7), h: b.readUInt16BE(o + 5) };
        o += 2 + b.readUInt16BE(o + 2);
      }
    }
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const t = b.toString('ascii', 12, 16);
      if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      if (t === 'VP8L') { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
    }
    const i = b.indexOf('ispe');
    if (i > 0) return { w: b.readUInt32BE(i + 8), h: b.readUInt32BE(i + 12) };
  } catch { /* fall through */ }
  return null;
}

// Returns { src, type, fallback, w, h } for a company-relative image path, or null if missing.
export function imageInfo(dir, urlBase, file) {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) return null;
  const ext = path.extname(file).slice(1).toLowerCase(), stem = file.slice(0, -ext.length - 1);
  const info = { src: `${urlBase}/${file}`, type: MIME[ext], ...(ext === 'svg' ? {} : imageSize(p) || {}) };
  if (ext === 'avif' || ext === 'webp') {
    for (const fb of ['jpg', 'png']) if (fs.existsSync(path.join(dir, `${stem}.${fb}`))) { info.fallback = `${urlBase}/${stem}.${fb}`; break; }
  }
  return info;
}

export function picture(ctx, file, { alt = '', cls = '', eager = false, sizes = '' } = {}) {
  const i = ctx.image(file);
  if (!i) return '';
  const dim = i.w ? ` width="${i.w}" height="${i.h}"` : '';
  const img = `<img src="${esc(i.fallback || i.src)}" alt="${esc(alt)}"${dim}${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${sizes ? ` sizes="${esc(sizes)}"` : ''}>`;
  return i.fallback ? `<picture><source srcset="${esc(i.src)}" type="${i.type}">${img}</picture>` : img;
}

// ---- video facade: a thumbnail and a play button; the iframe is created on click ----
export const VIDEO_TYPES = { commercial: 'Commercial', news: 'News segment', event: 'Event', retrospective: 'Retrospective', documentary: 'Documentary', interview: 'Interview', film: 'Film' };
export const PROVIDERS = {
  youtube: { name: 'YouTube', thumb: id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, w: 480, h: 360, page: id => `https://www.youtube.com/watch?v=${id}` },
  archive: { name: 'the Internet Archive', thumb: id => `https://archive.org/services/img/${id}`, w: 480, h: 360, page: id => `https://archive.org/details/${id}` },
  vimeo: { name: 'Vimeo', thumb: () => '', page: id => `https://vimeo.com/${id}` }
};

export function videoCard(v, { compact = false } = {}) {
  const P = PROVIDERS[v.provider || 'youtube'];
  if (!P) throw new Error(`video "${v.id}": unknown provider "${v.provider}"`);
  const url = v.url || P.page(v.embedId);
  const thumb = v.thumb || P.thumb(v.embedId);
  const kind = VIDEO_TYPES[v.type] || 'Footage';
  return `<figure class="vid${compact ? ' compact' : ''}" id="video-${esc(v.id)}">
<div class="vid-frame" data-provider="${esc(v.provider || 'youtube')}" data-embed="${esc(v.embedId)}"${v.start ? ` data-start="${+v.start}"` : ''}>
<button type="button" class="vid-btn" aria-label="Play video: ${esc(v.title)}">${thumb ? `<img src="${esc(thumb)}" alt="" width="${P.w || 480}" height="${P.h || 360}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}<span class="vid-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l11-6.500z" fill="currentColor"/></svg></span></button>
</div>
<figcaption><span class="vid-meta">${esc(kind)} · ${esc(v.year)}</span><b>${inline(v.title)}</b>${v.caption ? ` <span>${inline(v.caption)}</span>` : ''} <a href="${esc(url)}" target="_blank" rel="noopener">Watch on ${esc(P.name)}</a></figcaption>
</figure>`;
}

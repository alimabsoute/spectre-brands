#!/usr/bin/env node
// Generate OpenGraph images (1200×630 PNG) into og/: one per brand plus og/default.png.
// They are committed to the repo so the Vercel build stays dependency-free.
// Usage: node scripts/og.mjs [slug ...]   (no arguments = every brand and the default)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2);
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const font = f => `url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'assets/fonts', f)).toString('base64')})`;
const CSS = `@font-face{font-family:S;src:${font('source-serif-4.woff2')};font-weight:400 700}@font-face{font-family:I;src:${font('inter.woff2')};font-weight:400 700}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#FCFBF8;color:#16161A;font-family:I;display:grid;grid-template-columns:1fr 440px}
.t{padding:64px 0 56px 72px;display:flex;flex-direction:column}.b{display:flex;align-items:center;gap:12px;font-size:26px}.b b{font-weight:700}.b svg{width:26px;height:30px}
h1{font:600 92px/1 S;letter-spacing:-.03em;margin-top:auto}h1.long{font-size:72px}h1.site{font-size:60px;line-height:1.06}
.y{font-size:28px;color:#3B3B42;margin-top:18px;display:flex;gap:14px;align-items:center}.tag{background:#16161A;color:#fff;font-weight:600;font-size:22px;padding:4px 14px;border-radius:6px}.tag.ghost{background:#fff;color:#16161A;border:2.5px solid #16161A}
.s{font:400 27px/1.35 S;color:#3B3B42;margin-top:22px;max-width:620px}
.a{margin:40px 48px 40px 24px;border-radius:28px;display:flex;align-items:center;justify-content:center;padding:36px}.a svg{width:100%;height:auto;max-height:440px}`;
const MARK = '<svg viewBox="0 0 24 28"><path d="M3 26.5V12a9 9 0 0 1 18 0v14.5l-3-2.6-3 2.6-3-2.6-3 2.6-3-2.6z" fill="#16161A"/><rect x="8" y="10" width="2.6" height="4.6" rx="1.3" fill="#fff"/><rect x="13.4" y="10" width="2.6" height="4.6" rx="1.3" fill="#fff"/></svg>';
const pages = [];
for (const slug of fs.readdirSync(path.join(ROOT, 'companies'))) {
  if (slug.startsWith('_') || (only.length && !only.includes(slug))) continue;
  const dir = path.join(ROOT, 'companies', slug);
  if (!fs.existsSync(path.join(dir, 'company.json'))) continue;
  const c = JSON.parse(fs.readFileSync(path.join(dir, 'company.json'), 'utf8'));
  const art = fs.existsSync(path.join(dir, c.hero.art)) ? fs.readFileSync(path.join(dir, c.hero.art), 'utf8').replace(/<\?xml[^>]*>/, '') : '';
  const cat = site.categories.find(k => k.id === c.category)?.label || '';
  pages.push([slug, `<div class="t"><div class="b">${MARK}<span><b>Spectre</b> Brands</span></div><h1${c.name.length > 11 ? ' class="long"' : ''}>${esc(c.name)}</h1><div class="y"><span class="tag ${c.tier}">${c.tier === 'ghost' ? 'Ghost' : 'Dead'}</span>${esc(c.years)} · ${esc(cat)}</div><p class="s">${esc(c.card.stat.value)} ${esc(String(c.card.stat.label).replace(/\[\^\d+\]/g, ''))}</p></div><div class="a" style="background:${c.theme.soft}">${art}</div>`]);
}
if (!only.length || only.includes('default')) pages.push(['default', `<div class="t" style="grid-column:1/-1;padding-right:72px"><div class="b">${MARK}<span><b>Spectre</b> Brands</span></div><h1 class="site">Every brand dies twice: once when the money runs out, and again when people forget it.</h1><p class="s" style="max-width:900px">Sourced, illustrated post-mortems of dead and ghost brands.</p></div>`]);
fs.mkdirSync(path.join(ROOT, 'og'), { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const [slug, body] of pages) {
  await p.setContent(`<!doctype html><style>${CSS}</style><body>${body}</body>`);
  await p.evaluate(() => document.fonts.ready);
  const png = await p.screenshot({ type: 'png' });
  await sharp(png).png({ compressionLevel: 9, palette: true, colours: 128 }).toFile(path.join(ROOT, 'og', `${slug}.png`));
  console.log('og/' + slug + '.png', (fs.statSync(path.join(ROOT, 'og', `${slug}.png`)).size / 1024).toFixed(0) + 'KB');
}
await b.close();

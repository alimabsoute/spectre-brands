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
// Front Counter brand: paper ground, Fraunces + DM Sans, the strip-and-ghost logo, an orange tape edge.
const b64 = f => fs.readFileSync(path.join(ROOT, f)).toString('base64');
const CSS = `@font-face{font-family:S;src:${font('preview/fraunces-0.woff2')};font-weight:400 800}@font-face{font-family:I;src:${font('preview/dm-sans-0.woff2')};font-weight:400 700}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#F6EFE0;color:#1B1815;font-family:I;display:grid;grid-template-columns:1fr 440px;border-bottom:16px solid #F2A33C;background-image:repeating-linear-gradient(90deg,rgba(90,70,40,.05) 0 2px,transparent 2px 46px)}
.t{padding:56px 0 48px 72px;display:flex;flex-direction:column}.b img{height:58px;width:auto;display:block}
h1{font:600 92px/1 S;letter-spacing:-.03em;margin-top:auto}h1.long{font-size:72px}h1.site{font-size:54px;line-height:1.08}
.y{font-size:28px;color:#3E3731;margin-top:18px;display:flex;gap:14px;align-items:center}.tag{background:#1B1815;color:#F6EFE0;font-weight:700;font-size:20px;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:4px}.tag.ghost{background:transparent;color:#1B1815;border:2px dashed #1B1815}
.s{font:400 27px/1.35 S;color:#3E3731;margin-top:22px;max-width:620px}
.a{margin:40px 48px 40px 24px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:36px;box-shadow:0 2px 0 rgba(27,24,21,.12),0 20px 40px -20px rgba(27,24,21,.4)}.a svg{width:100%;height:auto;max-height:440px}
.hero{position:absolute;right:36px;top:170px;width:520px;transform:rotate(-4deg);filter:drop-shadow(0 18px 24px rgba(27,24,21,.35))}`;
const MARK = `<img src="data:image/webp;base64,${b64('assets/homemix/strip/strip-logo-510.webp')}" alt="">`;
const HERO = `<img class="hero" src="data:image/webp;base64,${b64('assets/homemix/hero-720.webp')}" alt="">`;
const pages = [];
for (const slug of fs.readdirSync(path.join(ROOT, 'companies'))) {
  if (slug.startsWith('_') || (only.length && !only.includes(slug))) continue;
  const dir = path.join(ROOT, 'companies', slug);
  if (!fs.existsSync(path.join(dir, 'company.json'))) continue;
  const c = JSON.parse(fs.readFileSync(path.join(dir, 'company.json'), 'utf8'));
  const art = fs.existsSync(path.join(dir, c.hero.art)) ? fs.readFileSync(path.join(dir, c.hero.art), 'utf8').replace(/<\?xml[^>]*>/, '') : '';
  const cat = site.categories.find(k => k.id === c.category)?.label || '';
  pages.push([slug, `<div class="t"><div class="b">${MARK}</div><h1${c.name.length > 11 ? ' class="long"' : ''}>${esc(c.name)}</h1><div class="y"><span class="tag ${c.tier}">${c.tier === 'ghost' ? 'Ghost' : 'Dead'}</span>${esc(c.years)} · ${esc(cat)}</div><p class="s">${esc(c.card.stat.value)} ${esc(String(c.card.stat.label).replace(/\[\^\d+\]/g, ''))}</p></div><div class="a" style="background:${c.theme.soft}">${art}</div>`]);
}
if (!only.length || only.includes('default')) pages.push(['default', `<div class="t" style="grid-column:1/-1;padding-right:610px"><div class="b">${MARK}</div><h1 class="site">Every brand dies twice: once when the money runs out, and again when people forget it.</h1><p class="s" style="max-width:900px">Sourced, illustrated post-mortems of dead and ghost brands.</p></div>${HERO}`]);
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

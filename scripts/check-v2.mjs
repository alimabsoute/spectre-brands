#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), out = fs.mkdtempSync(path.join(os.tmpdir(), 'spectre-v2-browser-'));
execFileSync(process.execPath, ['build.mjs', '--fixture', '--only', '_template', '--out', out, '--no-previews'], { cwd: ROOT, stdio: 'pipe' });
const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', svg: 'image/svg+xml', woff2: 'font/woff2', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost'), file = path.join(out, decodeURIComponent(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '');
  if (!file.startsWith(out + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file).slice(1)] || 'application/octet-stream' }).end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`, browser = await chromium.launch();
const errors = [], screenshots = '/tmp/spectre-v2-qa'; fs.mkdirSync(screenshots, { recursive: true });
try {
  for (const width of [375, 1280]) for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addInitScript(theme => localStorage.setItem('sb-theme', theme), theme);
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`${base}/_template/`); await page.waitForSelector('.v2-ready');
    assert.equal(await page.locator('.factfile-row').count(), 6);
    assert.equal(await page.locator('.v2-storemap .v2-tile').count(), 102);
    assert.equal(await page.locator('.where-now .now-card').count(), 2);
    assert.equal(await page.locator('.stale').count(), 1);
    assert.equal(await page.locator('#connections tbody tr').count(), 2);
    assert.equal(await page.locator('.more-whatifs .fork-pair').count(), 1);
    assert.equal(await page.locator('.more-whatifs').evaluate(d => d.open), false);
    assert.equal(await page.locator('[data-story-play]').getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('.scrolly-stage').evaluate(el => getComputedStyle(el).position), width === 375 ? 'static' : 'sticky');
    for (const selector of ['.hero', '#story', '#numbers', '#afterlife']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${selector}: overflow at ${width}/${theme}`);
    }
    await page.locator('#numbers').screenshot({ path: `${screenshots}/numbers-${width}-${theme}.png` });
    const link = page.locator('.factfile .srcs').first(), ids = (await link.getAttribute('data-src')).split(' ');
    await link.click();
    assert.equal(await page.locator('#source-dialog').evaluate(d => d.open), true);
    assert.equal(await page.locator('#source-dialog-list li').count(), ids.length);
    assert.deepEqual(await page.locator('#source-dialog-list li').evaluateAll(items => items.map(item => item.value.toString())), ids);
    await page.locator('#source-dialog a').last().focus(); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-source-close')), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('source-jump')), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#source-dialog').evaluate(d => d.open), false);
    assert.equal(await link.evaluate(el => el === document.activeElement), true);
    const glossary = page.locator('.glossary-button').first();
    await glossary.click(); assert.equal(await glossary.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape'); assert.equal(await glossary.getAttribute('aria-expanded'), 'false');
    assert.equal(await glossary.evaluate(el => document.activeElement === el), true);
    await page.locator('#citation-numbers').check();
    assert.equal(await page.locator('.factfile sup.fn').first().evaluate(el => getComputedStyle(el).display), 'inline');
    await page.reload(); await page.waitForSelector('.v2-ready'); assert.equal(await page.locator('#citation-numbers').isChecked(), true);
    await page.locator('#citation-numbers').uncheck();
    assert.equal(await page.locator('.factfile sup.fn').first().evaluate(el => getComputedStyle(el).display), 'none');
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.factfile sup.fn').first().evaluate(el => getComputedStyle(el).display), 'inline');
    assert.equal(await link.evaluate(el => getComputedStyle(el).display), 'none');
    await page.emulateMedia({ media: 'screen' });
    await page.locator('#story-chapter-1').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-stage-status]').textContent.startsWith('Chapter 1:'));
    await page.locator('[data-story-next]').evaluate(b => b.click());
    assert.match(await page.locator('[data-stage-status]').textContent(), /Chapter 2/);
    assert.equal(await page.locator('.scrolly .stage-active').count(), 1);
    await page.locator('[data-story-play]').click(); assert.equal(await page.locator('[data-story-play]').textContent(), 'Pause');
    await page.locator('[data-story-play]').click(); assert.equal(await page.locator('[data-story-play]').textContent(), 'Play');
    await page.locator('#timeline').scrollIntoViewIfNeeded(); await page.waitForSelector('.tlx-dot');
    await page.locator('#timeline-progress').focus(); await page.keyboard.press('End');
    assert.equal(await page.locator('#timeline-progress').inputValue(), '1');
    assert.equal(await page.locator('#tlxN').textContent(), '2 of 2');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.scrolly-stage').evaluate(el => getComputedStyle(el).position), 'static');
    assert.equal(await page.locator('.timeline-scrub').isVisible(), false);
    assert.equal(await page.locator('[data-story-play]').isVisible(), false);
    assert.equal(await page.locator('.scrolly .stage-active').count(), 0);
    await page.goto(`${base}/about/`);
    assert.equal(await page.locator('sup.fn').first().evaluate(el => getComputedStyle(el).display), 'inline');
    await ctx.close();
  }
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } }), page = await nojs.newPage();
  await page.goto(`${base}/_template/`);
  assert.equal(await page.locator('.factfile sup.fn').first().evaluate(el => getComputedStyle(el).display), 'inline');
  assert.equal(await page.locator('.glossary-fallback').first().isVisible(), true);
  await page.locator('.factfile .srcs').first().click(); assert.match(page.url(), /#sources$/);
  await page.locator('.more-whatifs summary').focus(); await page.keyboard.press('Enter'); assert.equal(await page.locator('.more-whatifs').evaluate(d => d.open), true);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await nojs.close();
  assert.deepEqual(errors, []);
  const bytes = fs.statSync(path.join(ROOT, 'assets/js/v2.js')).size;
  assert.ok(bytes <= 25 * 1024, `v2.js raw size ${bytes} exceeds the minified budget`);
  console.log(`v2 browser checks passed: two widths, both themes, keyboard, disclosures, chart data, playback, reduced motion, no JavaScript and print. v2.js ${bytes} bytes before minification.`);
  console.log(`Screenshots: ${screenshots}`);
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve)); fs.rmSync(out, { recursive: true, force: true });
}

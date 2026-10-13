import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './dev.mjs';

const stage = process.argv[2] || 'before';
const slugs=process.argv[3]?[process.argv[3]]:['blockbuster','pets-com','orbitz-drink'];
const dir = path.resolve('docs/hero-review', stage);
fs.mkdirSync(dir, { recursive: true });
const server = stage === 'before' ? (await import('../../spectre-baseline/scripts/dev.mjs')).serve(0) : serve(0);
await new Promise(resolve => server.on('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const report = [], errors = [];
try {
  for (const width of stage === 'before' ? [375, 1280] : [320, 375, 768, 1024, 1280, 1440]) {
    for (const slug of slugs) {
      const page = await browser.newPage({ viewport: { width, height: width < 700 ? 812 : 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', e => errors.push({ slug, width, error: String(e) }));
      await page.goto(`${base}/${slug}/`);
      await page.waitForSelector('.v2-ready');
      await page.evaluate(() => document.fonts.ready);
      if (stage !== 'before') {
        assert.equal(await page.locator('.hx-dossier').evaluate(el=>el.open),false);
        const initial = await page.evaluate(()=>({title:{bottom:document.querySelector('h1.name').getBoundingClientRect().bottom},media:{top:document.querySelector('.hx-media').getBoundingClientRect().top},hero:{height:document.querySelector('.hero-x').getBoundingClientRect().height},overflow:document.documentElement.scrollWidth>innerWidth}));
        assert.equal(initial.overflow,false,`${slug} ${width}: collapsed overflow`);
        assert.ok(initial.title.bottom<page.viewportSize().height,`${slug} ${width}: title below fold`);
        assert.ok(initial.media.top<page.viewportSize().height,`${slug} ${width}: visual below fold`);
        assert.ok(initial.hero.height<(width>900?700:950),`${slug} ${width}: oversized collapsed hero`);
        assert.equal(await page.locator('.hx-media .zoom').evaluate(el=>getComputedStyle(el).animationName),'none');
      }
      await page.screenshot({ path: path.join(dir, `${slug}-${width}-viewport.png`) });
      await page.locator('.hero-x').screenshot({ path: path.join(dir, `${slug}-${width}-hero.png`) });
      report.push({ slug, width, ...await page.evaluate(() => {
        const rect = s => { const b = document.querySelector(s).getBoundingClientRect(); return { x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom }; };
        return { hero:rect('.hero-x'), title:rect('h1.name'), media:rect('.hx-media'), copy:rect('.hx-copy'), overflow:document.documentElement.scrollWidth > innerWidth, bodyHeight:document.body.scrollHeight };
      }) });
      if (stage === 'before') {
        const chart=await page.locator('.v2-viz').count()?page.locator('.v2-viz').first():page.locator('.fig.info').first();
        if (await chart.count()) { await chart.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await chart.screenshot({path:path.join(dir,`${slug}-${width}-lower-chart.png`)}); }
      }
      if (stage !== 'before') {
        const summary=page.locator('.hx-dossier>summary');
        await summary.focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('.hx-dossier').evaluate(el=>el.open),true);
        const tabs=page.locator('.hx-tabs [role=tab]');
        for (let i=0;i<await tabs.count();i++) {
          await tabs.nth(i).focus(); await page.keyboard.press('Enter');
          assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true');
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${slug} ${width}: expanded overflow`);
          if ([375,1280].includes(width)) {
            // A tall capture viewport keeps the sticky chapter bar above the dossier crop.
            const original=page.viewportSize(),height=await page.locator('.hx-dossier').evaluate(el=>Math.ceil(el.getBoundingClientRect().height+el.offsetTop+300));
            await page.setViewportSize({width,height:Math.max(original.height,height)});await page.evaluate(()=>scrollTo(0,0));
            await page.locator('.hx-dossier').screenshot({path:path.join(dir,`${slug}-${width}-panel-${i}.png`)});await page.setViewportSize(original);
          }
        }
        await tabs.first().focus(); await page.keyboard.press('ArrowRight');
        assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
        await page.keyboard.press('End');
        assert.equal(await tabs.last().getAttribute('aria-selected'),'true');
        const marker=page.locator('.hx-panel:not([hidden]) .srcs-compact').first();
        const cite=await marker.getAttribute('data-cite');
        await marker.focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('#source-dialog').evaluate(el=>el.open),true);
        await page.keyboard.press('Escape');
        assert.equal(await marker.evaluate(el=>el===document.activeElement),true);
        await marker.click(); await page.locator('#source-dialog .source-jump').first().click();
        await page.locator('.hx-dossier').evaluate(el=>el.open=false);
        await page.locator(`.source-backs a[href="#${cite}"]`).first().click();
        await page.waitForFunction(id=>document.getElementById(id).closest('details').open,cite);
        assert.equal(await page.locator(`#${cite}`).isVisible(),true);
        assert.equal(await tabs.last().getAttribute('aria-selected'),'true');
        await page.goto(`${base}/${slug}/`); await page.waitForSelector('.v2-ready');
        await page.locator('.hx-media a.zoom').click();
        assert.equal(await page.locator('.lb').evaluate(el=>el.open),true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.lb').evaluate(el=>el.open),false);
        await page.locator('.hero-x .hx-credit summary').focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('.hero-x .hx-credit').evaluate(el=>el.open),true);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        await page.locator('.hero-x .hx-credit summary').focus(); await page.keyboard.press('Enter');
        await page.locator('.hx-story-link').click(); assert.ok(page.url().endsWith('#story'));
        const chart=await page.locator('.v2-viz').count()?page.locator('.v2-viz').first():page.locator('.fig.info').first();
        if (await chart.count()) {
          await chart.scrollIntoViewIfNeeded();
          const range=chart.locator('input[type=range]');
          if (await range.count()) { await range.focus();await page.keyboard.press('Home');assert.equal(await range.inputValue(),'0');await page.keyboard.press('End');await range.evaluate(el=>el.blur()); }
          if ([375,1280].includes(width)) {await page.mouse.move(0,0);await chart.screenshot({path:path.join(dir,`${slug}-${width}-lower-chart.png`)});}
        }
      }
      await page.close();
    }
  }
  if (stage !== 'before') {
    for (const slug of slugs) for (const width of [375,1280]) {
      const ctx=await browser.newContext({viewport:{width,height:900}});
      await ctx.addInitScript(()=>localStorage.setItem('sb-theme','dark'));
      const page=await ctx.newPage();await page.goto(`${base}/${slug}/`);await page.waitForSelector('.v2-ready');await page.evaluate(()=>document.fonts.ready);
      await page.screenshot({path:path.join(dir,`${slug}-${width}-dark.png`)});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.emulateMedia({media:'print'});assert.equal(await page.locator('.hx-dossier-body').isVisible(),true);await ctx.close();
      const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});const p=await nojs.newPage();await p.goto(`${base}/${slug}/`);
      await p.locator('.hx-dossier>summary').focus();await p.keyboard.press('Enter');
      assert.equal(await p.locator('.hx-panel').count(),await p.locator('.hx-panel:visible').count());
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await nojs.close();
    }
  }
  if(process.argv[3]&&fs.existsSync(path.join(dir,'report.json'))){const prior=JSON.parse(fs.readFileSync(path.join(dir,'report.json'),'utf8'));report.unshift(...prior.report.filter(r=>r.slug!==process.argv[3]));errors.unshift(...prior.errors.filter(r=>r.slug!==process.argv[3]));}
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify({ report, errors }, null, 2));
  console.log(JSON.stringify({ dir, report, errors }, null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }

import fs from 'node:fs';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const file='docs/hero-review/spectre-hero-review.html';
const server=http.createServer((req,res)=>res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(fs.readFileSync(file))).listen(0,'127.0.0.1');
await new Promise(r=>server.on('listening',r));const browser=await chromium.launch();
try{
  for(const width of [320,1280]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));await page.goto(`http://127.0.0.1:${server.address().port}/`);
    for(let i=0;i<3;i++){
      const tab=page.getByRole('tab').nth(i);await tab.focus();await page.keyboard.press('Enter');
      assert.equal(await tab.getAttribute('aria-selected'),'true');
      assert.equal(await page.locator('.brand-panel:visible').count(),1);
      const panel=page.locator('.brand-panel:visible');
      for(const summary of await panel.locator('summary').all()){await summary.click();assert.equal(await summary.evaluate(el=>el.parentElement.open),true);}
      await panel.locator('video').first().evaluate(el=>el.play());await page.waitForTimeout(400);
      assert.ok(await panel.locator('video').first().evaluate(el=>el.currentTime>0));
      await panel.locator('video').first().evaluate(el=>el.pause());
      const overflow=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].filter(el=>el.scrollWidth>el.clientWidth+1&&el.clientWidth>0).map(el=>({tag:el.tagName,cls:el.className,width:el.clientWidth,scrollWidth:el.scrollWidth,overflow:getComputedStyle(el).overflowX,text:el.textContent?.slice(0,60)})).slice(0,12)}));
      console.log(JSON.stringify({width,page:i,overflow}));assert.equal(overflow.scrollWidth>overflow.width,false);
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:`docs/hero-review/report-${width}-${i}.png`});
    }
    assert.equal(await page.evaluate(()=>[...document.images].filter(img=>img.complete&&img.naturalWidth===0).length),0);
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log('Standalone visual report: three tabs, disclosures, embedded images and video playback pass at 320/1280px.');
}finally{await browser.close();await new Promise(r=>server.close(r));}

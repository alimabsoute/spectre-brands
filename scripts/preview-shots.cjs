const {chromium}=require('/workspace/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const findings=[];
 for(const id of ['retro-pop','neon-arcade','editorial-vibrant']) for(const width of [1280,375]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(`http://localhost:8000/preview/${id}/`,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready; for(let y=0;y<document.documentElement.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}document.querySelector('#preview-wall').scrollLeft=10000;await new Promise(r=>setTimeout(r,200));document.querySelector('#preview-wall').scrollLeft=0;window.scrollTo(0,0);});
  await page.waitForTimeout(250);
  const status=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&i.currentSrc).map(i=>i.currentSrc),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>`${f.family} ${f.weight}`),entries:document.querySelectorAll('#idx .entry').length,cards:document.querySelectorAll('.archive-card').length}));
  await page.screenshot({path:`/workspace/spectre-design/mockups/${id}-${width}-fold.png`});
  await page.screenshot({path:`/workspace/spectre-design/mockups/${id}-${width}-full.png`,fullPage:true});
  // Verify expand/collapse and the real data-driven category/status filters.
  await page.locator('.gallery-expand').click();
  status.expanded=await page.locator('.archive-card:visible').count();
  await page.locator('.gallery-expand').click();
  await page.locator('#filters [data-g="tier"][data-v="ghost"]').click();
  status.ghostCount=await page.locator('#idx .entry:not(.hide)').count();
  await page.locator('#filters [data-g="cat"][data-v="consumer"]').click();
  status.consumerGhosts=await page.locator('#idx .entry:not(.hide)').count();
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width,height:900}});
  await nojs.goto(`http://localhost:8000/preview/${id}/`);status.nojsCards=await nojs.locator('.archive-card:visible').count();await nojs.close();
  findings.push({id,width,...status,errors});await page.close();
 }
 fs.writeFileSync('/workspace/spectre-design/mockups/render-checks.json',JSON.stringify(findings,null,2));
 console.log(JSON.stringify(findings,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './dev.mjs';
const stage=process.argv[2]||'after';
const dir=path.resolve('docs/hero-review',stage==='before'?'motion-before':'motion');fs.mkdirSync(dir,{recursive:true});
const server=stage==='before'?(await import('../../spectre-baseline/scripts/dev.mjs')).serve(0):serve(0);await new Promise(r=>server.on('listening',r));
const browser=await chromium.launch(),report=[];
try {
  for(const slug of ['blockbuster','pets-com','orbitz-drink'])for(const width of [375,1280]){
    const ctx=await browser.newContext({viewport:{width,height:900},recordVideo:{dir,size:{width,height:900}}});
    await ctx.addInitScript(()=>{window.pageCLS=0;window.heroCLS=0;window.heroShifts=[];new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput){window.pageCLS+=e.value;if(e.sources.some(s=>(s.node?.nodeType===3?s.node.parentElement:s.node)?.closest?.('.hero-x')))window.heroCLS+=e.value;window.heroShifts.push({value:e.value,time:e.startTime,sources:e.sources.map(s=>({node:(s.node?.nodeType===3?s.node.parentElement:s.node)?.outerHTML?.slice(0,200),before:s.previousRect.toJSON(),after:s.currentRect.toJSON()}))});}})).observe({type:'layout-shift',buffered:true});});
    const page=await ctx.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/${slug}/`);await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:path.join(dir,`${slug}-${width}-start.png`)});
    await page.waitForTimeout(4500);
    await page.screenshot({path:path.join(dir,`${slug}-${width}-settled.png`)});
    const result=await page.evaluate(()=>({pageCLS:window.pageCLS,heroCLS:window.heroCLS,shifts:window.heroShifts,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),activeHeroAnimations:document.querySelector('.hero-x').getAnimations({subtree:true}).filter(a=>a.playState==='running').length}));
    console.log(JSON.stringify({slug,width,...result}));
    if(stage==='after'){assert.equal(result.heroCLS,0,`${slug} ${width}: initial hero layout shift`);assert.equal(result.activeHeroAnimations,0,`${slug} ${width}: motion did not settle`);}
    const video=page.video();await ctx.close();await video.saveAs(path.join(dir,`${slug}-${width}.webm`));
    report.push({slug,width,...result});
  }
  fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();await new Promise(r=>server.close(r));}

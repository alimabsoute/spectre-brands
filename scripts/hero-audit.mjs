import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './dev.mjs';
const dir=path.resolve('docs/hero-review');
const server=serve(0);await new Promise(r=>server.on('listening',r));
const browser=await chromium.launch(),results=[];
try{
  for(const slug of ['blockbuster','pets-com','orbitz-drink'])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
    await page.addInitScript(t=>localStorage.setItem('sb-theme',t),theme);
    await page.goto(`http://127.0.0.1:${server.address().port}/${slug}/`);await page.evaluate(()=>document.fonts.ready);
    const contrast=await page.evaluate(()=>{
      const rgb=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
      const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
      return ['h1.name','.standfirst','.kicker','.hx-tape','.hx-story-link','.hx-dossier>summary','.hero-x .hx-credit summary'].map(selector=>{
        const el=document.querySelector(selector),style=getComputedStyle(el);let bg=el;
        while(bg.parentElement&&getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)')bg=bg.parentElement;
        const a=lum(rgb(style.color)),b=lum(rgb(getComputedStyle(bg).backgroundColor));
        const size=parseFloat(style.fontSize),weight=parseFloat(style.fontWeight);
        return {selector,foreground:style.color,background:getComputedStyle(bg).backgroundColor,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),minimum:size>=24||(size>=18.66&&weight>=700)?3:4.5,font:style.fontFamily,fontSize:size};
      });
    });
    for(const row of contrast)assert.ok(row.ratio>=row.minimum,`${slug} ${theme} ${row.selector}: contrast ${row.ratio}`);
    await page.setViewportSize({width:320,height:900});
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    await page.locator('.hx-dossier>summary').click();
    await page.screenshot({path:path.join(dir,'after',`${slug}-320-text200-${theme}.png`)});
    const textOverflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth>innerWidth,hero:document.querySelector('.hero-x').scrollWidth>innerWidth,heroWidth:document.querySelector('.hero-x').scrollWidth,offenders:[...document.querySelectorAll('.hero-x *')].filter(el=>el.scrollWidth>el.clientWidth+1&&el.clientWidth>0).map(el=>({tag:el.tagName,cls:el.className,width:el.clientWidth,scrollWidth:el.scrollWidth,right:el.getBoundingClientRect().right,text:el.textContent?.slice(0,75)})).slice(-18)}));
    console.log(JSON.stringify({slug,theme,contrast,textOverflow}));
    assert.equal(textOverflow.hero,false,`${slug} ${theme}: 200% root-text hero overflow`);
    results.push({slug,theme,contrast,textOverflow});await page.close();
  }
  fs.writeFileSync(path.join(dir,'audit-measurements.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close();await new Promise(r=>server.close(r));}

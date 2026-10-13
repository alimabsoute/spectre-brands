import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const dir=path.resolve('docs/design-review-v3'), out=path.join(dir,'qa-final');
fs.mkdirSync(out,{recursive:true});
const source=process.argv[2] ? path.resolve(process.argv[2]) : path.join(dir,'spectre-tv-style-check-v3.html');
const url=pathToFileURL(source).href, results={file:path.basename(source),widths:[],interaction:[],reduced:[],hf:[],limits:['Chromium desktop engine with emulated viewports; no real mobile device or screen-reader session.','Visibility pause is tested by a synthetic visibility event; background OS scheduling is not measured.']};
const b=await chromium.launch();
const errors=[], requests=[];
const attach=p=>{p.on('pageerror',e=>errors.push(String(e)));p.on('request',r=>{if(/^https?:/.test(r.url())) requests.push(r.url());});};
const seek=(p,t)=>p.locator('#seek').evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},t);
const clock=p=>p.locator('#clock').innerText();
const value=p=>p.locator('#seek').inputValue().then(Number);
const audit=async p=>p.evaluate(()=>{
  const w=innerWidth;
  const overflow=[...document.querySelectorAll('main,header,h1,.headline,.tv,.controls,.seg span,button,.seekwrap,#caption,summary,details')].map(e=>({tag:e.tagName,id:e.id,cls:e.className,box:e.getBoundingClientRect().toJSON(),scroll:e.scrollWidth,client:e.clientWidth})).filter(e=>e.box.left < -1 || e.box.right>w+1 || e.scroll>e.client+2);
  const clippedLabels=[...document.querySelectorAll('.seg span')].flatMap(e=>{const range=document.createRange();range.selectNodeContents(e);const box=e.getBoundingClientRect();return [...range.getClientRects()].filter(r=>r.left<box.left+1||r.right>box.right-1).map(r=>({text:e.textContent,box:box.toJSON(),textBox:r.toJSON()}));});
  return {width:w,pageOverflow:document.documentElement.scrollWidth>w,overflow,clippedLabels,controls:[...document.querySelectorAll('button:not([hidden]),input[name=style],#seek,summary')].map(e=>({name:e.id||e.value||e.textContent.trim(),height:e.getBoundingClientRect().height})),font:document.fonts.check('700 40px "Barlow Condensed"'),captionBox:document.querySelector('#caption').getBoundingClientRect().toJSON(),controlsBox:document.querySelector('.controls').getBoundingClientRect().toJSON()};
});
try {
  for(const width of [320,375,768,1024,1280,1440]){
    const p=await b.newPage({viewport:{width,height:900}});attach(p);
    await p.goto(url);await p.evaluate(()=>document.fonts.ready);
    assert.match(await clock(p),/Ready/,'poster must announce readiness');assert.equal(await value(p),0);
    await p.waitForTimeout(400);assert.equal(await value(p),0,'no autoplay');
    for(const style of ['a','b','c']){
      await p.locator(`input[value=${style}]`).check();
      const initial=await audit(p);assert.equal(initial.pageOverflow,false);assert.deepEqual(initial.overflow,[]);assert.deepEqual(initial.clippedLabels,[]);assert.equal(initial.font,true);
      assert.ok(initial.controls.every(c=>c.height>=43.5),'controls must be at least44px');
      const anchors=[];
      for(const [name,t] of [['poster',3.4],['entrance',1.3],['shelves',5.5],['checkout',10.5],['end',12]]){
        await seek(p,t);const m=await audit(p);anchors.push(m.controlsBox.top);
        assert.equal(m.pageOverflow,false);assert.deepEqual(m.overflow,[]);
        if([320,375,1280].includes(width)) await p.screenshot({path:path.join(out,`${style}-${width}-${name}.png`),fullPage:true});
      }
      assert.ok(Math.max(...anchors)-Math.min(...anchors)<1,'captions must not move controls');
      results.widths.push({width,style,checks:'overflow, label clipping,44px controls,loaded font,5 timeline states,stable caption height',controlsTop:anchors[0],...initial});
    }
    if(width===320){await p.addStyleTag({content:'html{font-size:200%}'});await seek(p,10.5);const m=await audit(p);results.text200=m;assert.equal(m.pageOverflow,false);assert.deepEqual(m.overflow,[]);assert.deepEqual(m.clippedLabels,[]);await p.screenshot({path:path.join(out,'320-text200.png'),fullPage:true});}
    console.log(`width ${width} complete`);
    await p.close();
  }
  const p=await b.newPage({viewport:{width:1280,height:900}});attach(p);await p.goto(url);
  await p.evaluate(()=>{window._cls=[];new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window._cls.push(e.value)}).observe({type:'layout-shift',buffered:false});});
  await p.locator('#play').click();await p.waitForTimeout(900);assert.ok(await value(p)>.5);assert.equal(await p.locator('#play').innerText(),'Pause');
  await p.locator('#play').click();const paused=await value(p);await p.waitForTimeout(500);assert.equal(await value(p),paused);
  await p.locator('#replay').click();await p.waitForTimeout(150);assert.ok(await value(p)<.5);assert.equal(await p.locator('#play').innerText(),'Pause');
  await p.locator('input[value=b]').check();assert.equal(await p.locator('#play').innerText(),'Play');const switched=await value(p);await p.waitForTimeout(300);assert.equal(await value(p),switched);
  await p.locator('input[value=b]').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('input[value=c]').isChecked(),true);
  await p.locator('#seek').focus();await p.keyboard.press('End');assert.equal(await value(p),12);await p.keyboard.press('Home');assert.equal(await value(p),0);await p.keyboard.press('ArrowRight');assert.ok(await value(p)>0);
  await p.locator('h1').click();await p.keyboard.press('a');assert.equal(await p.locator('input[value=a]').isChecked(),true);await p.keyboard.press('k');assert.equal(await p.locator('#play').innerText(),'Pause');await p.keyboard.press('Space');assert.equal(await p.locator('#play').innerText(),'Play');
  await p.locator('summary').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('details').evaluate(e=>e.open),true);assert.ok(await p.locator('details ol').isVisible());await p.keyboard.press('Enter');assert.equal(await p.locator('details').evaluate(e=>e.open),false);
  await seek(p,11.8);await p.locator('#play').click();await p.waitForTimeout(500);assert.equal(await value(p),12);assert.equal(await p.locator('#play').innerText(),'Play');
  await p.locator('#replay').click();await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});assert.equal(await p.locator('#play').innerText(),'Play');
  results.interaction.push('no autoplay;Play/Pause;Replay;style switch pauses;radio arrows;seek End/Home/Arrow;A/K/Space shortcuts;keyboard transcript;12s finite end;visibility handler');
  results.cls=await p.evaluate(()=>({entries:window._cls,total:window._cls.reduce((a,b)=>a+b,0)}));assert.equal(results.cls.total,0);
  for(const style of ['a','b','c']){
    await p.locator(`input[value=${style}]`).check();await seek(p,0);await p.locator('#play').click();
    await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(150);assert.equal(await p.locator('#play').isVisible(),false);assert.equal(await p.locator('#seek').getAttribute('max'),'2');assert.match(await clock(p),/Frame/);
    for(const frame of [0,1,2]){await seek(p,frame);assert.equal(await clock(p),`Frame ${frame+1} of 3`);await p.waitForTimeout(200);assert.equal(await value(p),frame);}
    await p.screenshot({path:path.join(out,`${style}-reduced.png`),fullPage:true});
    await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(100);assert.equal(await p.locator('#play').isVisible(),true);assert.equal(await p.locator('#play').innerText(),'Play');assert.equal(await p.locator('#seek').getAttribute('max'),'12');const t=await value(p);await p.waitForTimeout(200);assert.equal(await value(p),t);
    results.reduced.push({style,dynamic:'enable pauses;three settled static frames;disable stays paused'});
  }
  await p.close();
  const reduced=await b.newPage({viewport:{width:320,height:900},reducedMotion:'reduce'});attach(reduced);await reduced.goto(url);assert.equal(await reduced.locator('#play').isVisible(),false);assert.equal(await clock(reduced),'Frame 1 of 3');await reduced.locator('#seek').focus();await reduced.keyboard.press('End');assert.equal(await clock(reduced),'Frame 3 of 3');assert.deepEqual((await audit(reduced)).overflow,[]);await reduced.close();
  const nojs=await b.newPage({viewport:{width:320,height:900},javaScriptEnabled:false});attach(nojs);await nojs.goto(url);assert.equal(await nojs.locator('.controls').isVisible(),false);await nojs.locator('summary').click();assert.equal(await nojs.locator('details ol').isVisible(),true);await nojs.screenshot({path:path.join(out,'320-nojs.png'),fullPage:true});await nojs.close();results.noJS='static storefront and native expandable transcript available';
  for(const style of ['a','b','c']){
    const hp=await b.newPage({viewport:{width:960,height:720}});attach(hp);await hp.goto(pathToFileURL(path.join(dir,'samples',style,'index.html')).href);await hp.evaluate(()=>document.fonts.ready);
    const h=await hp.evaluate(k=>{const tl=window.__timelines[`blockbuster-${k}`];return {duration:tl.duration(),paused:tl.paused(),size:[document.querySelector('#root').clientWidth,document.querySelector('#root').clientHeight]};},style);
    assert.equal(h.duration,12);assert.equal(h.paused,true);assert.deepEqual(h.size,[960,720]);
    for(const t of [1.3,3.4,5.5,7.4,10.5,12]){await hp.evaluate(({k,t})=>{window.__timelines[`blockbuster-${k}`].time(t);},{k:style,t});await hp.screenshot({path:path.join(out,`hf-${style}-${t}.png`)});}
    results.hf.push({style,...h,seekFrames:6});console.log(`HyperFrames source ${style} complete`);await hp.close();
  }
  // Full12-second normal-motion browser recordings, inspected separately via contact sheets.
  for(const style of ['a','b','c']){
    const context=await b.newContext({viewport:{width:1000,height:1000},recordVideo:{dir:path.join(out,'motion'),size:{width:1000,height:1000}}});const p=await context.newPage();attach(p);await p.goto(url);await p.locator(`input[value=${style}]`).check();await seek(p,0);await p.locator('#play').click();await p.waitForTimeout(12400);assert.equal(await value(p),12);assert.equal(await p.locator('#play').innerText(),'Play');const video=p.video();await context.close();await video.saveAs(path.join(out,`sample-${style}.webm`));console.log(`recording ${style} complete`);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);results.errors=errors;results.externalRequests=requests;results.ok=true;
  fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({ok:true,widthCases:results.widths.length,staticHFFrames:18,recordedSamples:3,cls:results.cls.total,reduced:results.reduced,noJS:results.noJS,errors,externalRequests:requests}));
} catch(e){results.ok=false;results.failure=String(e);results.errors=errors;results.externalRequests=requests;fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(results,null,2));throw e;}
finally {await b.close();}

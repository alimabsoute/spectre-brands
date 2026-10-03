import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1280,height:1400}, userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'});
try{ const r=await p.goto('https://www.circuitcity.com/',{waitUntil:'load',timeout:60000}); await p.waitForTimeout(8000);
console.log(r.status(), p.url(), await p.title());
console.log((await p.evaluate(()=>document.body.innerText)).slice(0,3000));
await p.screenshot({path:'/tmp/cc/now.png'});}catch(e){console.log('ERR',e.message)}
await b.close();

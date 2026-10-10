#!/usr/bin/env node
// IndexNow: tell Bing, Yandex and other IndexNow engines that pages changed. No login needed: the key file
// static/90f98eafa518a47f4811ec43f02e2da5.txt is served at https://spectrebrands.com/90f98eafa518a47f4811ec43f02e2da5.txt and proves ownership.
// Usage: node scripts/indexnow.mjs            submit every URL in the live sitemap
//        node scripts/indexnow.mjs /a/ /b/    submit only these paths
const HOST = 'spectrebrands.com', KEY = '90f98eafa518a47f4811ec43f02e2da5';
const paths = process.argv.slice(2);
let urls = paths.map(p => `https://${HOST}${p}`);
if (!urls.length) urls = [...(await (await fetch(`https://${HOST}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const keyOk = (await (await fetch(`https://${HOST}/${KEY}.txt`)).text()).trim() === KEY;
if (!keyOk) { console.error('key file not live yet: deploy first'); process.exit(1); }
for (const ep of ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow', 'https://yandex.com/indexnow']) {
  const r = await fetch(ep, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }) });
  console.log(ep, r.status, r.statusText, `(${urls.length} URLs)`);
}

// A separate chat-size companion. Never writes over the complete review, source media, or project assets.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const dir='docs/design-review-v4',full=path.join(dir,'spectre-integrated-review-v4.html'),html=fs.readFileSync(full,'utf8');
const match=html.match(/const P=([\s\S]*?),urls=\{\};/);if(!match)throw Error('Full review payload not found');
const data=JSON.parse(match[1]),removed=[];
for(const [key,value]of Object.entries(data.assets))if(value.type==='video/mp4'){removed.push(key);delete data.assets[key];}
// Review the complete caption/transcript and chapter stills. Playback belongs to the independent MP4.
const filmJs=data.assets['/assets/js/film.js'];if(!filmJs)throw Error('Film controller missing');let js=Buffer.from(filmJs.data,'base64').toString('utf8');
const old="const reduce = matchMedia('(prefers-reduced-motion: reduce)'),";
if(!js.includes(old))throw Error('Stills-mode hook changed; refusing an unchecked transform');
js=js.replace(old,'const reduce = { matches: true, addEventListener() {} },');filmJs.data=Buffer.from(js).toString('base64');
for(const p of Object.values(data.pages)){p.html=p.html.replace(/<source[^>]+type="video\/mp4"[^>]*>/g,'').replace(/(<video[^>]*)( src="[^"]+\.mp4")/g,'$1');}
data.pages.game={title:'Coverage',html:'<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><style>body{margin:24px;background:#f6efe0;color:#1b1815;font:18px/1.6 system-ui;max-width:50rem}h1{font-size:28px}</style><h1>Compact review coverage</h1><p>Includes the three complete articles, original artwork and graphs, all opening-film chapter stills and full cited transcript, synthetic email previews, demo forms and before/after screenshots.</p><p>The complete 35.7-second opening is delivered separately as spectre-blockbuster-opening-v4-720p.mp4. The fifth game is excluded from this compact file and remains in the full local review.</p><p>The full-quality 1080p master and complete interactive review remain unchanged in Downloads. No real email is sent from this review.</p></html>'};
const encoded=JSON.stringify(data).replace(/</g,'\\u003c');let compact=html.slice(0,match.index)+'const P='+encoded+',urls={};'+html.slice(match.index+match[0].length);
compact=compact.replaceAll('Spectre Brands - integrated review v4','Spectre Brands - compact review v4').replace('Local preview. Email delivery is disconnected; remote video embeds are disabled. Confirmation screens are synthetic demos.','Compact companion: articles, graphs, chapter stills and email demos. The full opening film is a separate MP4; the fifth film is excluded. No live email.').replace('Three distinct article openings, the four-film edit, and the separate fifth film.','Full-quality originals remain in Downloads. <a href="spectre-blockbuster-opening-v4-720p.mp4" target="_blank" rel="noopener">Open the separate 720p film</a>.').replace('data-key="game" type="button">Reserved game','data-key="game" type="button">Coverage');
const output=path.join(dir,'spectre-compact-review-v4.html');fs.writeFileSync(output,compact);
const movie='assets/media/blockbuster-opening-v4-web.mp4',copy=path.join(dir,'spectre-blockbuster-opening-v4-720p.mp4');fs.copyFileSync(movie,copy);
const fileInfo=f=>({file:path.resolve(f),bytes:fs.statSync(f).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')});
const result={files:[fileInfo(copy),fileInfo(output)],removedVideos:removed,fullReview:fileInfo(full),coverage:'Complete 720p movie separate; compact HTML has full articles, graphs, stills/transcript, before/after and email demos; fifth film only in full originals.'};
for(const f of result.files)if(f.bytes>=20000000)throw Error(`${f.file} exceeds 20 MB target`);
fs.writeFileSync(path.join(dir,'compact-manifest.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));

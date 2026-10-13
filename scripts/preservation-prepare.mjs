// Preserve source versions and public-safe evidence. Originals stay in place; no service calls or uploads.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const root=process.cwd(),base='2f066ae5047159a385584646bd9b975583eff4a0',out='docs/preservation/v4',archive='archive/spectre-versions';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const write=(file,value)=>{const target=path.resolve(root,file);if(!target.startsWith(root+path.sep))throw Error('Outside repository');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,value);};
const scrub=s=>s.replace(/C:[/\\]Users[/\\][^\s"'<>`]+/g,v=>{const n=v.replaceAll('\\','/');for(const alias of ['spectre-hero/','product-videos/','Downloads/']){const i=n.indexOf(alias);if(i>=0)return '${LOCAL_'+alias.slice(0,-1).replaceAll('-','_').toUpperCase()+'}/'+n.slice(i+alias.length);}return '${LOCAL_PATH}';}).replace(/libfile_[a-zA-Z0-9]+|file_[a-f0-9]{20,}/g,'[private delivery identifier omitted]').replace(/(?:\/Users\/[\w.-]+|\/home\/box)/g,'${LOCAL_HOME}');
const docs=[
 'docs/hero-review/README.md','docs/hero-review/IMPECCABLE_AUDIT.md','docs/hero-review/CHANGED_FILES.md',
 'docs/design-review-v2/PATTERN_MAP.md','docs/design-review-v2/IMAGE_SELECTION.md',
 'docs/design-review-v3/FINAL_REVIEW.md','docs/design-review-v3/SOURCES_AND_STYLES.md','docs/design-review-v3/LATEST_DIRECTION.md',
 'docs/design-review-v4/FINAL_VISUAL_REVIEW.md','docs/design-review-v4/CHANGED_FILES.md','docs/design-review-v4/updates/README.md','docs/design-review-v4/updates/21st-source.md',
 'docs/design-review-v4/film/BRIEF.md','docs/design-review-v4/film/STORYBOARD.md','docs/design-review-v4/film/DESIGN.md'];
const evidence=[
 'docs/hero-review/content-check.json','docs/hero-review/audit-measurements.json','docs/hero-review/baseline-content.json',
 'docs/design-review-v2/inventory-summary.json','docs/design-review-v2/asset-inventory.json',
 'docs/design-review-v3/qa-final/qa-results.json','docs/design-review-v3/qa-hyperframes-a.json','docs/design-review-v3/qa-hyperframes-b.json','docs/design-review-v3/qa-hyperframes-c.json',
 'docs/design-review-v4/qa/results.json','docs/design-review-v4/qa/portable-results.json','docs/design-review-v4/qa/compact-results.json',
 'docs/design-review-v4/film/web-playback.json','docs/design-review-v4/film/master-playback.json','docs/design-review-v4/film/hyperframes-check-final.json','docs/design-review-v4/film/hyperframes-lint-final.json',
 'docs/design-review-v4/film/encoded-probe.json','docs/design-review-v4/claude-code-evidence.json','docs/design-review-v4/unit-final.txt','docs/design-review-v4/site-check-final.txt','docs/design-review-v4/prose-final.json'];
const copied=[];
const scrubValue=v=>typeof v==='string'?scrub(v):Array.isArray(v)?v.map(scrubValue):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,scrubValue(x)])):v;
for(const file of [...docs,...evidence])if(fs.existsSync(file)){const target=`${out}/history/${file.replace(/^docs\//,'')}`,raw=fs.readFileSync(file,'utf8'),text=file.endsWith('.json')?JSON.stringify(scrubValue(JSON.parse(raw)),null,2)+'\n':scrub(raw);write(target,text);copied.push({source:file,path:target,bytes:Buffer.byteLength(text),sha256:sha(text),privateMetadataSanitized:true});}
// A small selection of real article screenshots; no account interfaces or third-party reference frames.
for(const slug of ['blockbuster','pets-com','orbitz-drink'])for(const width of [375,1280]){
 for(const [phase,file]of [['baseline',`docs/hero-review/before/${slug}-${width}-viewport.png`],['final',`docs/design-review-v4/qa/${slug}-${width}.png`]])if(fs.existsSync(file)){const bytes=fs.readFileSync(file),target=`${out}/screenshots/${phase}-${slug}-${width}.png`;write(target,bytes);copied.push({source:file,path:target,bytes:bytes.length,sha256:sha(bytes)});}
}
// First-pass source overlay: restore onto base, not over the current v4 files.
const snapshot=path.resolve(root,'../spectre-first-pass-snapshot'),tracked=execFileSync('git',['--work-tree=.','diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean),oldFiles=[];
for(const file of tracked){if(!/^(assets\/|lib\/|companies\/|scripts\/|tests\/|build\.mjs)/.test(file))continue;const source=path.join(snapshot,file);if(!fs.existsSync(source))continue;const bytes=fs.readFileSync(source),original=execFileSync('git',['show',`${base}:${file}`]);if(!bytes.equals(original)){const target=`${archive}/first-pass-2026-10-12/${file}`;write(target,bytes);oldFiles.push({path:file,bytes:bytes.length,sha256:sha(bytes)});}}
for(const file of ['assets/css/hero-v2.css','assets/fonts/hero/barlow-condensed-bold.ttf','assets/fonts/hero/barlowcondensed-OFL.txt','assets/fonts/hero/varelaround-OFL.txt','PRODUCT.md']){const source=path.join(snapshot,file);if(fs.existsSync(source)){const bytes=fs.readFileSync(source);write(`${archive}/first-pass-2026-10-12/${file}`,bytes);oldFiles.push({path:file,bytes:bytes.length,sha256:sha(bytes)});}}
write(`${archive}/first-pass-2026-10-12/overlay-manifest.json`,JSON.stringify({base,variant:'First-pass compact heroes before the integrated film/signup work',verification:'Historical first-pass validation only; not rerun as a separate version today.',files:oldFiles},null,2)+'\n');
// Preserve all three experimental source treatments, without their generated recordings/reference frames.
const tvFiles=['docs/design-review-v3/build-samples.mjs','docs/design-review-v3/vendor/gsap.min.js',...['a','b','c'].flatMap(k=>[`docs/design-review-v3/samples/${k}/index.html`,`docs/design-review-v3/samples/${k}/vendor/gsap.min.js`])],tv=[];
for(const file of tvFiles){const bytes=fs.readFileSync(file);write(`${archive}/tv-v3-2026-10-12/${file}`,bytes);tv.push({path:file,bytes:bytes.length,sha256:sha(bytes)});}
write(`${archive}/tv-v3-2026-10-12/overlay-manifest.json`,JSON.stringify({base,variant:'A/B/C source experiments; not the accepted v4 direction',files:tv},null,2)+'\n');
write(`${out}/public-evidence-manifest.json`,JSON.stringify({base,copies:copied},null,2)+'\n');
// Public manifest uses aliases, never credential/private delivery IDs or complete machine paths.
const localFiles=[];
function walk(dir){if(!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isSymbolicLink())continue;if(e.isDirectory())walk(f);else if(/\.(mp4|webm)$/.test(f)||fs.statSync(f).size>=10000000){const bytes=fs.readFileSync(f);localFiles.push({path:path.relative(root,f).replaceAll('\\','/'),bytes:bytes.length,sha256:sha(bytes),state:'local-only; no new remote artifact backup in this task'});}}}
for(const d of ['assets/media','docs/hero-review','docs/design-review-v2','docs/design-review-v3','docs/design-review-v4'])walk(d);
const web='assets/media/blockbuster-opening-v4-web.mp4';const all=localFiles.map(x=>x.path===web?{...x,state:'included in Git as the essential runtime encode'}:x);
const sourceRoot=process.argv[2]||path.join(process.env.USERPROFILE||'','product-videos/blockbuster/renders');
for(const name of ['01-the-sign.mp4','02-the-receipt.mp4','03-9094-lights.mp4','04-struggling-not-to-laugh.mp4','05-insert-coin.mp4']){const configured=path.join(sourceRoot,name);if(fs.existsSync(configured)){const bytes=fs.readFileSync(configured);all.push({path:'${SOURCE_FILMS_ROOT}/'+name,bytes:bytes.length,sha256:sha(bytes),state:'original source; local-only status in this checkpoint'});}}
write(`${out}/local-only-assets.json`,JSON.stringify({base,scope:'High-quality masters, raw sources, large portable bundles and generated recordings are not in this Git commit. Existing copies remain untouched; manifests are not an off-device backup.',assets:all},null,2)+'\n');
console.log(JSON.stringify({publicEvidenceFiles:copied.length,firstPassOverlayFiles:oldFiles.length,v3SourceFiles:tv.length,localAssetEntries:all.length,localAssetBytes:all.filter(x=>x.state.startsWith('local-only')).reduce((s,x)=>s+x.bytes,0)}));

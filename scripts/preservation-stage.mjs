// Stage only the reviewed preservation set. No commit, push, reset, deletion or service call.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const git=args=>execFileSync('git',['--work-tree=.',...args],{encoding:'utf8'}),base='2f066ae5047159a385584646bd9b975583eff4a0';
const tracked=git(['diff','--name-only',base]).trim().split('\n').filter(Boolean);
const untracked=git(['ls-files','--others','--exclude-standard','-z']).split('\0').filter(Boolean);
const selected=untracked.filter(f=>/^(?:PRODUCT\.md$|assets\/(?:css|js|fonts\/hero|media)\/|backend\/|lib\/|tests\/|archive\/spectre-versions\/|docs\/preservation\/|scripts\/.*\.mjs$)/.test(f)&&!/(?:reference-inspect|portable-form-debug|zoom-debug)\.mjs$/.test(f));
const required=['docs/design-review-v4/source-hashes.json','docs/design-review-v4/film/EDL.json','docs/design-review-v4/film/index.html','docs/design-review-v4/film/vendor/gsap.min.js','docs/design-review-v3/vendor/gsap.min.js'];
const files=[...new Set([...tracked,...selected,...required])].filter(f=>fs.existsSync(f)&&!['docs/preservation/v4/source-manifest.json','docs/preservation/v4/public-scan.json'].includes(f));
const findings=[],manifest=[];
for(const file of files){const b=fs.readFileSync(file),text=b.toString('utf8');if(b.length>10000000)findings.push({file,rule:'new-file-over-10MB'});if(/(?:\.claude|\.vercel|node_modules|(^|\/)dist\/|\.env|\.private\.)/.test(file))findings.push({file,rule:'excluded-machine-context'});if(/\.(?:mp4|webm)$/.test(file)&&file!=='assets/media/blockbuster-opening-v4-web.mp4')findings.push({file,rule:'local-only-media'});
 if(/\.(?:mjs|js|json|md|txt|css|sql|html|py)$/.test(file)){
  for(const [rule,pattern]of [['private-delivery-id',/\b(?:libfile_[A-Za-z0-9]+|file_[a-f0-9]{20,})\b/],['credential-format',/\b(?:gh[oopsr]_[A-Za-z0-9_]{25,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9_-]{25,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)\b/]])if(pattern.test(text))findings.push({file,rule});
  const secret=process.env.GITHUB_PERSONAL_ACCESS_TOKEN;if(secret&&secret.length>20&&text.includes(secret))findings.push({file,rule:'configured-secret-value'});
 }
 manifest.push({path:file,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});
}
fs.mkdirSync('docs/preservation/v4',{recursive:true});fs.writeFileSync('docs/preservation/v4/source-manifest.json',JSON.stringify({base,branch:'backup/spectre-v4-paused-2026-10-13',note:'Changed/new source and evidence only. Existing unchanged files remain in parent history; this manifest excludes itself.',files:manifest},null,2)+'\n');
fs.writeFileSync('docs/preservation/v4/public-scan.json',JSON.stringify({files:files.length,bytes:manifest.reduce((s,x)=>s+x.bytes,0),findings,credentialsOrPrivateDeliveryValuesPrinted:false},null,2)+'\n');
if(findings.length){console.log(JSON.stringify({blocked:true,findings}));process.exit(1);}
const exact=[...files,'docs/preservation/v4/source-manifest.json','docs/preservation/v4/public-scan.json'];for(let i=0;i<exact.length;i+=80)git(['add','--',...exact.slice(i,i+80).filter(f=>!required.includes(f))]);git(['add','-f','--',...required]);
for(const entry of manifest){const blob=execFileSync('git',['--work-tree=.','show',`:${entry.path}`],{maxBuffer:11000000});entry.gitBlobBytes=blob.length;entry.gitBlobSha256=crypto.createHash('sha256').update(blob).digest('hex');}
fs.writeFileSync('docs/preservation/v4/source-manifest.json',JSON.stringify({base,branch:'backup/spectre-v4-paused-2026-10-13',note:'Changed/new source and evidence only; existing unchanged files remain in parent history. sha256 records captured working-copy bytes; gitBlobSha256 records staged bytes after Git line-ending normalization. This manifest and scan receipt exclude themselves.',files:manifest},null,2)+'\n');git(['add','--','docs/preservation/v4/source-manifest.json']);
const config=JSON.parse(fs.readFileSync('vercel.json','utf8')),original=JSON.parse(git(['show',`${base}:vercel.json`]));if(config.git?.deploymentEnabled?.['backup/spectre-v4-paused-2026-10-13']!==false)throw Error('Backup deployment guard missing');delete config.git;if(JSON.stringify(config)!==JSON.stringify(original))throw Error('Unrelated Vercel config changed');
console.log(JSON.stringify({stagedFiles:exact.length,bytes:manifest.reduce((s,x)=>s+x.bytes,0),scanFindings:findings.length,backupDeploymentDisabled:true}));

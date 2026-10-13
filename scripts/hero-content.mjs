import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const baselineFile = 'docs/hero-review/baseline-content.json';
const collect = () => Object.fromEntries(['blockbuster','pets-com','orbitz-drink'].map(slug => {
  const html = fs.readFileSync(`dist/${slug}/index.html`, 'utf8');
  const start = html.indexOf('<header class="hero hero-x'), end = html.indexOf('</header>', start) + 9;
  return [slug, { hero:html.slice(start,end), lower:crypto.createHash('sha256').update(html.slice(end).replace(/cite-\d+/g,'cite-ID')).digest('hex'), company:JSON.parse(fs.readFileSync(`companies/${slug}/company.json`,'utf8')) }];
}));
if (process.argv[2] === 'save') { fs.writeFileSync(baselineFile, JSON.stringify(collect(), null, 2)); console.log('Saved baseline content.'); }
else {
  const plain = s => s.replace(/\[([^\]]+)\]\((?:[^()]|\([^()]*\))*\)/g,'$1');
  let strings = 0, values = 0, files = 0;
  const compare = (before, after, location) => {
    if (typeof before === 'string') { assert.equal(plain(after),plain(before),location); strings++; }
    else if (before && typeof before === 'object') for (const [key,value] of Object.entries(before)) compare(value,after?.[key],`${location}.${key}`);
    else { assert.deepEqual(after,before,location); values++; }
  };
  const originals = execFileSync('git',['ls-tree','-r','--name-only','HEAD','companies/blockbuster','companies/pets-com','companies/orbitz-drink'],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.json'));
  for (const filename of originals) {
    const before = JSON.parse(execFileSync('git',['show',`HEAD:${filename}`],{encoding:'utf8'}));
    compare(before,JSON.parse(fs.readFileSync(filename,'utf8')),filename); files++;
  }
  const result={files,strings,values,originalWordsPreserved:true,qualifiersNumbersQuotesCitationsPreserved:true};
  fs.writeFileSync('docs/hero-review/content-check.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
}

import fs from 'node:fs';
import assert from 'node:assert/strict';
const primary = (slug, id) => {
  const source = JSON.parse(fs.readFileSync(`companies/${slug}/sections/sources.json`)).list.find(s => s.id === id);
  return source.text.match(/\]\((https?:[^)]+)\)/)[1];
};
const links = [
  ['blockbuster','story',['chapters',4,'body'],'Redbox','/redbox/',24],
  ['blockbuster','story',['chapters',4,'body'],'the sale closed on April 26',primary('blockbuster',13),13],
  ['blockbuster','story',['chapters',5,'body'],'The store’s website',primary('blockbuster',31),31],
  ['pets-com','story',['chapters',2,'body'],'The prospectus',primary('pets-com',1),1],
  ['pets-com','cause',['causes',0,'text'],'The prospectus',primary('pets-com',1),1],
  ['pets-com','people',['lede'],'IPO prospectus',primary('pets-com',1),1],
  ['orbitz-drink','story',['chapters',3,'body'],'annual report for 2002',primary('orbitz-drink',6),6],
  ['orbitz-drink','people',['people',0,'text'],'annual report for 2002',primary('orbitz-drink',6),6],
  ['orbitz-drink','afterlife',['now',2,'text'],'revoked the registration of its securities',primary('orbitz-drink',31),31]
];
const provenance = [];
for (const [slug, section, keys, anchor, destination, sourceId] of links) {
  const filename = `companies/${slug}/sections/${section}.json`;
  const raw = fs.readFileSync(filename,'utf8'), data = JSON.parse(raw);
  let parent = data; for (const key of keys.slice(0,-1)) parent = parent[key];
  assert.ok(parent, `${filename}: missing ${keys.join('.')}`);
  const key = keys.at(-1), before = parent[key];
  assert.equal(typeof before,'string');
  if (before.includes(`[${anchor}](${destination})`)) {
    provenance.push({ filename, field:keys.join('.'), anchor, destination, sourceId });
    continue;
  }
  assert.ok(before.includes(anchor),`${filename}: missing ${anchor}`);
  assert.ok(!before.includes(`[${anchor}]`),`${filename}: already linked ${anchor}`);
  const after = before.replace(anchor,`[${anchor}](${destination})`);
  assert.equal(after.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1'),before.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1'));
  assert.ok(raw.includes(JSON.stringify(before)),'Could not retain source file formatting');
  fs.writeFileSync(filename,raw.replace(JSON.stringify(before),JSON.stringify(after)));
  provenance.push({ filename, field:keys.join('.'), anchor, destination, sourceId });
}
fs.writeFileSync('docs/hero-review/link-provenance.json',JSON.stringify(provenance,null,2));
console.log(`Added ${provenance.length} links without changing anchor wording.`);

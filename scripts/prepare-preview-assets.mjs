// One-time phase-1 asset import. Run from /workspace so sharp resolves there.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/workspace/package.json');
const sharp = require('sharp');
const root = path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '..');
const input = '/workspace/spectre-design';
const out = path.join(root, 'assets/preview');
fs.mkdirSync(out, { recursive: true });
const palettes = JSON.parse(fs.readFileSync(`${input}/palettes/palettes.json`));
fs.writeFileSync(`${out}/palettes.json`, JSON.stringify(palettes, null, 2)+'\n');
let fonts = '';
for (const d of palettes.directions) for (const f of Object.values(d.fonts)) {
  const slug = f.family.toLowerCase().replaceAll(' ', '-');
  const source = fs.readFileSync(`${input}/palettes/fonts/${slug}.source.css`, 'utf8');
  const blocks = source.match(/@font-face\s*\{[^}]+\}/g).filter(b => b.includes('U+0000-00FF'));
  blocks.forEach((b, i) => {
    const name = `${slug}-${i}.woff2`;
    fs.copyFileSync(`${input}/palettes/fonts/${name}`, `${root}/assets/fonts/preview/${name}`);
    fonts += b.replace(/url\([^)]+\)/, `url(/assets/fonts/preview/${name})`) + '\n';
  });
}
for (const f of fs.readdirSync(`${input}/palettes/fonts`).filter(f => f.endsWith('-OFL.txt'))) fs.writeFileSync(`${root}/assets/fonts/preview/${f}`, fs.readFileSync(`${input}/palettes/fonts/${f}`, 'utf8').replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, ''));
fs.copyFileSync(`${input}/palettes/fonts/manifest.json`, `${root}/assets/fonts/preview/manifest.json`);
fs.writeFileSync(`${out}/fonts.css`, fonts);
const concepts = ['concept-11-out-of-register', 'concept-05-still-open', 'concept-12-the-footnote'];
for (const [i, d] of palettes.directions.entries()) {
  const concept = concepts[i];
  const replacements = i === 0 ? {'#00A6A6':'#3156C8','#FF4FA3':'#E34B32','#6C4BFF':'#29213D'} : i === 1 ? {'#00A6A6':'#70DECC','#FF4FA3':'#F584BA','#FFF6E5':'#FFF5E9'} : {'#00A6A6':'#007D78','#FF5A36':'#C82F5C','#6C4BFF':'#142F3B','#FFF6E5':'#F6F8FC'};
  let svg = fs.readFileSync(`${input}/logos/${concept}.svg`, 'utf8');
  for (const [a,b] of Object.entries(replacements)) svg=svg.replaceAll(a,b);
  // Remove empty presentation padding from the concept's viewBox, retaining vector lettering.
  const {info} = await sharp(Buffer.from(svg)).trim().png().toBuffer({resolveWithObject:true});
  const x=-info.trimOffsetLeft, y=-info.trimOffsetTop;
  svg=svg.replace(/width="600" height="240" viewBox="0 0 600 240"/, `width="${info.width+8}" height="${info.height+8}" viewBox="${x-4} ${y-4} ${info.width+8} ${info.height+8}"`);
  fs.writeFileSync(`${out}/${d.id}-logo.svg`,svg);
  if(fs.existsSync(`${input}/logos/${concept}-icon.svg`)) {
    let icon=fs.readFileSync(`${input}/logos/${concept}-icon.svg`,'utf8');
    for(const [a,b] of Object.entries(replacements)) icon=icon.replaceAll(a,b);
    fs.writeFileSync(`${out}/${d.id}-icon.svg`,icon);
  }
  const hero = `${input}/heroes/${d.id}-hero-${i===0?2:1}.png`;
  for (const w of [1600,800]) {
    await sharp(hero).resize({width:w}).avif({quality:58,effort:6}).toFile(`${out}/${d.id}-${w}.avif`);
    await sharp(hero).resize({width:w}).jpeg({quality:85,mozjpeg:true}).toFile(`${out}/${d.id}-${w}.jpg`);
  }
}
for(const w of [1600,800]) {
  const s = `${input}/heroes/colorized-webvan-van-lumalocked.png`;
  await sharp(s).resize({width:w,withoutEnlargement:true}).avif({quality:65}).toFile(`${out}/webvan-${w}.avif`);
  await sharp(s).resize({width:w,withoutEnlargement:true}).jpeg({quality:88,mozjpeg:true}).toFile(`${out}/webvan-${w}.jpg`);
}
fs.copyFileSync(`${input}/logos/contact-sheet.png`, `${out}/logo-contact-sheet.png`);
console.log('Imported preview fonts, palettes, vector logos and optimized illustrations.');

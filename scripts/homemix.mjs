// Fast dev render of the homepage mixes into dist/ (needs one full `npm run build` first for data.json and images).
// usage: node scripts/homemix.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { renderHomeMixes } from '../lib/homemix.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const OUT = path.join(ROOT, 'dist');
const data = JSON.parse(fs.readFileSync(path.join(OUT, 'assets/homemix/data.json'), 'utf8'));
fs.mkdirSync(path.join(OUT, 'assets/homemix'), { recursive: true });
fs.cpSync(path.join(ROOT, 'assets/homemix'), path.join(OUT, 'assets/homemix'), { recursive: true });
const write = (rel, body) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); };
const r = await renderHomeMixes({ data, write }).catch(e => { console.error(e); process.exit(1); });
console.log("rendered", r.map(x => x.n + " (" + x.name + ")").join(", "));

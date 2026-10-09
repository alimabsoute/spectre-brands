// Fast dev re-render of /preview/pm-<slug>/ from the already-built dist pages. usage: node scripts/pmpreview.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { pmPreview } from '../lib/pmpreview.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const OUT = path.join(ROOT, 'dist');
const { pmTransform } = await import(`../lib/pmtransform.mjs?t=${Date.now()}`);
fs.cpSync(path.join(ROOT, 'assets/pmpreview'), path.join(OUT, 'assets/pmpreview'), { recursive: true });
const write = (rel, body) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); };
pmPreview({ OUT, write, transform: pmTransform }); console.log('ok');

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve('.');
const out = path.join(root, 'docs/design-review-v2');
fs.mkdirSync(out, { recursive: true });
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const slugs = ['blockbuster', 'pets-com', 'orbitz-drink'];
const report = { branch: execFileSync('git', ['--work-tree=.', 'branch', '--show-current'], { encoding: 'utf8' }).trim(), head: execFileSync('git', ['--work-tree=.', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), routes: slugs.map(s => `/${s}/`), brands: [] };
function walk(x, visit, trail = [], parent = null) {
  if (typeof x === 'string') visit(x, trail, parent);
  else if (Array.isArray(x)) x.forEach((v, i) => walk(v, visit, [...trail, i], x));
  else if (x && typeof x === 'object') Object.entries(x).forEach(([k, v]) => walk(v, visit, [...trail, k], x));
}
const files = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
for (const slug of slugs) {
  const dir = path.join(root, 'companies', slug);
  const company = JSON.parse(fs.readFileSync(path.join(dir, 'company.json')));
  const sections = Object.fromEntries(files(path.join(dir, 'sections')).filter(p => p.endsWith('.json')).map(p => [path.basename(p, '.json'), JSON.parse(fs.readFileSync(p))]));
  const refs = [];
  for (const [where, data] of Object.entries({ company, ...sections })) walk(data, (value, trail, parent) => {
    if (/^(art|img)\//.test(value)) refs.push({ file: value, where: `${where}.${trail.join('.')}`, context: parent });
  });
  const assets = [];
  for (const p of [...files(path.join(dir, 'art')), ...files(path.join(dir, 'img'))].sort()) {
    const relative = path.relative(dir, p).replaceAll('\\', '/');
    const bytes = fs.readFileSync(p);
    const references = refs.filter(r => r.file === relative);
    const sibling = relative.replace(/\.(avif|jpg|webp|png)$/, '.avif');
    const fallback = relative.endsWith('.jpg') && fs.existsSync(path.join(dir, sibling));
    const logicalRefs = references.length ? references : fallback ? refs.filter(r => r.file === sibling) : [];
    let originalHash = null, originalBytes = null;
    try { originalBytes = execFileSync('git', ['--work-tree=.', 'show', `HEAD:companies/${slug}/${relative}`], { maxBuffer: 10 * 1024 * 1024 }); originalHash = hash(originalBytes); } catch {}
    const unchanged = relative.endsWith('.svg') && originalBytes ? bytes.toString().replaceAll('\r\n','\n') === originalBytes.toString().replaceAll('\r\n','\n') : hash(bytes) === originalHash;
    const metadata = await sharp(bytes).metadata();
    const label = relative.endsWith('.svg') ? bytes.toString().match(/aria-label="([^"]+)"/)?.[1] : logicalRefs.map(r => r.context.alt || r.context.caption || r.context.title).find(Boolean);
    const stem = path.basename(relative, path.extname(relative));
    const archive = relative.startsWith('img/');
    assets.push({ file: relative, type: archive ? fallback ? 'image fallback' : 'archival image' : 'custom illustration', logicalId: `${slug}/${archive ? 'img' : 'art'}/${stem}`, label: label || stem, bytes: bytes.length, sha256: hash(bytes), unchangedFromHead: unchanged, comparison: relative.endsWith('.svg') ? 'SVG text compared after CRLF/LF normalization only' : 'Binary SHA-256 compared to git blob', width: metadata.width, height: metadata.height, viewBox: relative.endsWith('.svg') ? bytes.toString().match(/viewBox="([^"]+)"/)?.[1] : undefined, references: logicalRefs, destinations: {
      cinematic: archive ? `Visual archive / ${stem}; selected archive moments beside full custom art` : `Full-size art stage or illustrated chapter; complete art index / ${stem}`,
      journey: archive ? `Evidence beside the relevant source moment; complete visual archive / ${stem}` : `Full-size illustrated moment; complete art index / ${stem}`,
      archive: `Visible collection / ${archive ? 'archive' : 'original illustrations'} / ${stem}`
    }, retainedInteraction: archive ? 'Full image with contain fit, native full-resolution link, caption/date/credit, optional keyboard dialog; JPG fallback retained' : 'Complete uncropped SVG, original accessible name and colors; scroll entrance retained where supported; static reduced-motion/no-JS version; original art expands in keyboard dialog' });
  }
  const charts = [];
  for (const [section, s] of Object.entries(sections)) (s.blocks || []).forEach((b, i) => charts.push({ section, index: i, kind: b.kind, id: b.id, title: b.title, type: b.chart?.type, data: b.chart || (['arc', 'waffle', 'bars', 'flow', 'scale', 'chain', 'multiples', 'counters'].includes(b.kind) ? b : undefined), destination: `Existing ${section} block retained; any replacement uses identical data, notes and citations` }));
  report.brands.push({ slug, name: company.name, company, sections, assets, videos: (sections.videos?.videos || []).map(v => ({ ...v, destination: 'Existing video section and chapter association retained; optional archive video shelf', retainedInteraction: 'Opt-in external embed, title/year/provider/caption, keyboard controls; no autoplay' })), charts, map: sections.map || null, timeline: { title: sections.timeline?.title, events: sections.timeline?.events.length, animated: sections.timeline?.animated, destination: 'Existing timeline retained pending attachment inspection; journey prototype demonstrates large source moments without replacing chronology' }, motion: { declaredHero: company.hero.motion || null, activeSourceArtAnimation: 'assets/css/home.css:107-108 m-enter view-timeline on .gd-item svg and .chap-art svg; static if unsupported/reduced motion', sourceSvgHooks: assets.filter(a=>a.file.endsWith('.svg')).filter(a=>/class="screen"/.test(fs.readFileSync(path.join(dir,a.file),'utf8'))).map(a=>a.file), sourceSvgHookBehavior: 'screen class has no matching active animation CSS in current checkout; hero.motion metadata has no reader. Preserve hooks without claiming they currently animate.', retained: ['source drawing geometry and aria-label', 'view-driven drawing entrance where supported', 'v2 scrolly chapter association and progress', 'animated chart draw-in and scrubber', 'count-up values with final exact text', 'map pin pulse and step playback when present', 'optional animated timeline range', 'first-pass finite hero motion'], prototypeMotion: 'Finite replay of original art group or .screen hook; explicit play/pause, reduced-motion disabled, no auto-advance of content' } });
}
fs.writeFileSync(path.join(out, 'asset-inventory.json'), JSON.stringify(report, null, 2));
const totals = report.brands.map(b => ({ name: b.name, drawings: b.assets.filter(a=>a.type==='custom illustration').length, archiveImages: b.assets.filter(a=>a.type==='archival image').length, imageFallbacks: b.assets.filter(a=>a.type==='image fallback').length, videos: b.videos.length, timelineEvents: b.timeline.events, pies: b.charts.filter(c=>c.type==='doughnut').map(c=>c.id), unreferenced: b.assets.filter(a=>!a.references.length).map(a=>a.file), allAssetBytesUnchanged: b.assets.every(a=>a.unchangedFromHead) }));
fs.writeFileSync(path.join(out, 'inventory-summary.json'), JSON.stringify({branch:report.branch,head:report.head,routes:report.routes,totals},null,2));
console.log(JSON.stringify({branch:report.branch,head:report.head,routes:report.routes,totals},null,2));

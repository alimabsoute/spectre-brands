#!/usr/bin/env node
// Builds the Blockbuster opening film from the supplied source films, following the edit decision list in
// lib/film.mjs. Usage: node scripts/build-opening.mjs [--src <renders dir>] [--ffmpeg <path>] [--source-only | --web-only]
//
// The supplied films are only ever read: each is hashed, copied, and hashed again, and ffmpeg works from the
// copies. Every output path is a fixed file under this repository; nothing is deleted and no directory is cleared.
// ffmpeg runs through spawn with an argument array and no shell.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FILMS, checkFilm, cueList, cutDuration, stillName } from '../lib/film.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback; };
const SRC = path.resolve(arg('--src', process.env.OPENING_SRC || 'C:/Users/alima/product-videos/blockbuster/renders'));
const FFMPEG = arg('--ffmpeg', process.env.FFMPEG || (process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'));
const SOURCE_ONLY = process.argv.includes('--source-only');
// --web-only re-encodes the page's copy from the master already on disk; the master and the stills are left alone.
const WEB_ONLY = process.argv.includes('--web-only');
const film = checkFilm(FILMS.blockbuster), FADE = 0.08;

// The only places this script may write.
const OUT = {
  film: path.join(ROOT, 'docs/design-review-v4/film'),
  filmAssets: path.join(ROOT, 'docs/design-review-v4/film/assets'),
  vendor: path.join(ROOT, 'docs/design-review-v4/film/vendor'),
  reserved: path.join(ROOT, 'docs/design-review-v4/reserved-game'),
  media: path.join(ROOT, 'assets/media'),
  stills: path.join(ROOT, 'assets/media', film.id)
};
function target(dir, name) {
  if (!Object.values(OUT).includes(dir)) throw new Error(`refusing to write outside the film outputs: ${dir}`);
  if (name !== path.basename(name) || !/^[\w.-]+$/.test(name)) throw new Error(`unsafe output name: ${name}`);
  const file = path.join(dir, name);
  if (SRC === dir || file.startsWith(SRC + path.sep)) throw new Error(`refusing to write into the source directory: ${file}`);
  fs.mkdirSync(dir, { recursive: true });
  return file;
}
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sec = n => (+n).toFixed(3);
const run = args => new Promise((resolve, reject) => {
  const child = spawn(FFMPEG, ['-hide_banner', '-nostdin', '-loglevel', 'error', ...args], { shell: false, windowsHide: true, stdio: ['ignore', 'inherit', 'inherit'] });
  child.on('error', e => reject(new Error(`could not start ${FFMPEG}: ${e.message}`)));
  child.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)));
});

// 1. Copy the sources. The originals must match the recorded hashes before and after.
const recorded = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/design-review-v4/source-hashes.json'), 'utf8'));
const names = [...Object.values(film.sources), film.reserved], before = {};
for (const name of names) {
  const from = path.join(SRC, name);
  if (!fs.existsSync(from)) throw new Error(`missing source film ${from}`);
  before[name] = sha(from);
  const want = recorded[`renders/${name}`];
  if (want && want !== before[name]) throw new Error(`${name} does not match docs/design-review-v4/source-hashes.json`);
  const to = target(name === film.reserved ? OUT.reserved : OUT.filmAssets, name);
  fs.copyFileSync(from, to);
  if (sha(to) !== before[name]) throw new Error(`copy of ${name} does not match its source`);
}
const copy = key => path.join(OUT.filmAssets, film.sources[key]);
fs.copyFileSync(path.join(ROOT, 'docs/design-review-v3/vendor/gsap.min.js'), target(OUT.vendor, 'gsap.min.js'));

// 2. The provenance list and the editable HyperFrames source.
const edl = {
  id: film.id, duration: film.duration, fps: film.fps, width: film.width, height: film.height, speed: 1, picture: 'whole 16:9 frame, no crop',
  audio: { fadeSeconds: FADE, defaultMuted: true },
  output: { video: film.video, masterVideo: film.masterVideo, web: { ...film.web, from: film.masterVideo, video: 'H.264, preset fast', audio: 'copied from the master' }, poster: `${film.stills}poster.jpg`, stills: film.cuts.map(c => `${film.stills}${stillName(c)}`) },
  sources: Object.fromEntries(Object.entries(film.sources).map(([k, name]) => [k, { file: `assets/${name}`, original: `renders/${name}`, sha256: before[name] }])),
  reserved: { file: `../reserved-game/${film.reserved}`, original: `renders/${film.reserved}`, sha256: before[film.reserved], use: 'held for a later feature; never part of the opening' },
  poster: film.poster,
  cuts: film.cuts.map(c => ({ n: c.n, label: c.label, source: c.source, in: c.in, out: c.out, start: c.start, duration: cutDuration(c), still: c.still, cues: c.cues }))
};
fs.writeFileSync(target(OUT.film, 'EDL.json'), JSON.stringify(edl, null, 2) + '\n');

// One video clip and one audio clip per cut, all direct children of the root. The picture is the source cut at 1x.
// Each audio clip sits on its own track (cut n on track n), so two clips that meet at a cut are never read as one
// track overlapping itself when their end points round differently. The only automation is the 80ms fade at each
// end of each audio clip: a volume lane in data-automation, with t in seconds from the start of the clip.
const r3 = n => +(+n).toFixed(3);
const envelope = d => JSON.stringify({ version: 1, lanes: [{ target: 'volume', points: [{ t: 0, v: 0 }, { t: FADE, v: 1 }, { t: r3(d - FADE), v: 1 }, { t: d, v: 0 }] }] });
const hyperframes = () => {
  const clips = film.cuts.map(c => `  <video id="v${c.n}" class="clip" data-start="${c.start}" data-duration="${cutDuration(c)}" data-media-start="${c.in}" data-track-index="0" src="assets/${film.sources[c.source]}" muted playsinline preload="auto"></video>`).join('\n');
  const audio = film.cuts.map(c => `  <audio id="a${c.n}" class="clip" data-start="${c.start}" data-duration="${cutDuration(c)}" data-media-start="${c.in}" data-track-index="${c.n}" data-volume="1" data-automation='${envelope(cutDuration(c))}' src="assets/${film.sources[c.source]}" preload="auto"></audio>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, height=1080">
<title>${film.id}</title>
<style>
html, body { margin: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
#root { position: relative; width: 100%; height: 100%; background: #000; }
#root > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
</style>
</head>
<body>
<div id="root" data-composition-id="${film.id}" data-start="0" data-duration="${film.duration}" data-width="${film.width}" data-height="${film.height}" data-fps="${film.fps}">
${clips}
${audio}
</div>
<script src="vendor/gsap.min.js"></script>
<script>
  // Source cuts only: no motion, crop or retime. The ${FADE * 1000}ms audio fades are the data-automation volume
  // lanes on the audio clips; the timeline only sets the total duration.
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  tl.set({}, {}, ${film.duration});
  window.__timelines['${film.id}'] = tl;
</script>
</body>
</html>
`;
};
fs.writeFileSync(target(OUT.film, 'index.html'), hyperframes());

// 3. The master encode: trim each cut from its copy, fade its audio, join the nine, then 30fps H.264 and AAC.
if (!SOURCE_ONLY && !WEB_ONLY) {
  const inputs = film.cuts.flatMap(c => ['-i', copy(c.source)]);
  const graph = film.cuts.map((c, i) => {
    const d = cutDuration(c);
    return `[${i}:v]trim=start=${sec(c.in)}:end=${sec(c.out)},setpts=PTS-STARTPTS,scale=${film.width}:${film.height},setsar=1[v${i}];`
      + `[${i}:a]atrim=start=${sec(c.in)}:end=${sec(c.out)},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,`
      + `afade=t=in:st=0:d=${FADE},afade=t=out:st=${sec(d - FADE)}:d=${FADE}[a${i}]`;
  }).join(';') + `;${film.cuts.map((_, i) => `[v${i}][a${i}]`).join('')}concat=n=${film.cuts.length}:v=1:a=1[vc][ac];[vc]fps=${film.fps},format=yuv420p[v];[ac]aresample=48000[a]`;
  await run([...inputs, '-filter_complex', graph, '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', String(film.fps),
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
    '-t', sec(film.duration), '-movflags', '+faststart', '-y', target(OUT.media, path.basename(film.masterVideo))]);
}

// The page's copy: the master scaled down whole, its audio copied as it is.
if (!SOURCE_ONLY) {
  const master = path.join(OUT.media, path.basename(film.masterVideo));
  if (!fs.existsSync(master)) throw new Error(`missing master ${film.masterVideo}; run without --web-only first`);
  await run(['-i', master, '-vf', `scale=${film.web.width}:${film.web.height},setsar=1`,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', String(film.web.crf), '-pix_fmt', 'yuv420p', '-r', String(film.fps),
    '-c:a', 'copy', '-movflags', '+faststart', '-y', target(OUT.media, path.basename(film.video))]);
}

if (!SOURCE_ONLY && !WEB_ONLY) {

  // The poster and one settled frame per cut, for readers who prefer reduced motion.
  const frame = (source, at, name) => run(['-ss', sec(at), '-i', copy(source), '-frames:v', '1', '-vf', `scale=${film.still.width}:${film.still.height}`, '-q:v', '3', '-y', target(OUT.stills, name)]);
  await frame(film.poster.source, film.poster.at, 'poster.jpg');
  for (const c of film.cuts) await frame(c.source, c.still.at, stillName(c));
}

// 4. The originals are untouched.
for (const name of names) if (sha(path.join(SRC, name)) !== before[name]) throw new Error(`${name} changed while the script ran`);
console.log(`${film.id}: ${film.cuts.length} cuts, ${cueList(film).length} caption lines, ${film.duration}s.`);
console.log(`Sources verified unchanged: ${names.join(', ')}`);
console.log(SOURCE_ONLY ? 'Wrote the HyperFrames source and EDL only.' : WEB_ONLY ? `Wrote ${film.video} from ${film.masterVideo}.` : `Wrote ${film.masterVideo}, ${film.video}, the poster and ${film.cuts.length} chapter stills under ${film.stills}`);

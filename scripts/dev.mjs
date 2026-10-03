#!/usr/bin/env node
// Local dev server with live reload. `npm run dev` -> http://localhost:8000
// Rebuilds dist/ when anything under companies/, lib/, assets/, data/ or site.json changes,
// then tells open pages to reload over Server-Sent Events. No dependencies.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = +(process.env.PORT || 8000);
const TYPES = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', avif: 'image/avif', webp: 'image/webp', ico: 'image/x-icon', xml: 'application/xml', txt: 'text/plain', woff2: 'font/woff2' };
const RELOAD = '<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>';
const clients = new Set();

let building = false, queued = false;
function build() {
  if (building) { queued = true; return; }
  building = true;
  const t = Date.now();
  spawn(process.execPath, ['build.mjs'], { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] }).on('exit', code => {
    building = false;
    console.log(code ? 'build failed (see errors above)' : `built in ${Date.now() - t}ms`);
    if (!code) clients.forEach(r => r.write('data: reload\n\n'));
    if (queued) { queued = false; build(); }
  });
}

export function serve(port = PORT, { reload = false } = {}) {
  return http.createServer((req, res) => {
    if (reload && req.url === '/__reload') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
      clients.add(res); req.on('close', () => clients.delete(res)); return;
    }
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(DIST, p);
    if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) { res.writeHead(308, { location: p + '/' }).end(); return; }
    let status = 200;
    if (!fs.existsSync(file)) { file = path.join(DIST, '404.html'); status = 404; }
    const ext = path.extname(file).slice(1);
    let body = fs.readFileSync(file);
    if (reload && ext === 'html') body = Buffer.from(body.toString().replace('</body>', RELOAD + '</body>'));
    const headers = { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': reload ? 'no-store' : 'public, max-age=3600' };
    // compress text like the production host does, so local Lighthouse numbers are realistic
    if (/^(html|css|js|json|svg|xml|txt)$/.test(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { headers['content-encoding'] = 'gzip'; body = zlib.gzipSync(body); }
    res.writeHead(status, headers).end(body);
  }).listen(port);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
  serve(PORT, { reload: true });
  let timer;
  for (const d of ['companies', 'lib', 'assets', 'data', 'og'])
    if (fs.existsSync(path.join(ROOT, d))) fs.watch(path.join(ROOT, d), { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(build, 120); });
  for (const f of ['site.json', 'build.mjs']) fs.watch(path.join(ROOT, f), () => { clearTimeout(timer); timer = setTimeout(build, 120); });
  console.log(`Spectre Brands dev server: http://localhost:${PORT}/  (live reload on)`);
}

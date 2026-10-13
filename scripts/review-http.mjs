import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const types={html:'text/html;charset=utf-8',css:'text/css',js:'text/javascript',json:'application/json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',avif:'image/avif',webp:'image/webp',woff2:'font/woff2',ttf:'font/ttf',mp4:'video/mp4',webm:'video/webm',txt:'text/plain'};
export function reviewServer(directory='dist',port=0){
 const workspace=path.resolve('.'),root=path.resolve(directory);if(root!==workspace&&!root.startsWith(workspace+path.sep))throw Error('Review root must stay in workspace');
 const server=http.createServer((req,res)=>{try{
  const u=new URL(req.url,'http://127.0.0.1');
  if(u.pathname.startsWith('/api/updates/')){res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({error:'Email updates are not enabled on this review server.'}));return;}
  const review=u.pathname.startsWith('/__review/'),base=review?workspace:root;
  let name=decodeURIComponent(review?u.pathname.slice('/__review'.length):u.pathname);
  // Synthetic state/email previews live in docs; use the generated asset versions for them too.
  if(review&&name.startsWith('/assets/'))name='/dist'+name;
  let file=path.resolve(base,'.'+name);
  if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end('Not found');return;}
  const size=fs.statSync(file).size,headers={'Content-Type':types[path.extname(file).slice(1)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  let start=0,end=size-1,status=200;const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(range){start=+range[1];end=range[2]?Math.min(+range[2],size-1):size-1;if(start>=size||start>end){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);
  if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
 }catch{if(!res.headersSent)res.writeHead(500);res.end('Review server error');}});
 return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>resolve(server));});
}

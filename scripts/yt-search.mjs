#!/usr/bin/env node
// Research helper: list YouTube search results (id, length, channel, title) for a query, then check
// each id against the oEmbed endpoint (200 = public and embeddable).
// Usage: node scripts/yt-search.mjs "pets.com sock puppet super bowl commercial" [max=10]
const [q, max = 10] = process.argv.slice(2);
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', 'accept-language': 'en-US,en;q=0.9' };
const html = await (await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), { headers: UA })).text();
const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
if (!m) { console.error('could not parse results'); process.exit(1); }
const out = [];
(function walk(o) { if (!o || typeof o !== 'object') return; if (o.videoRenderer) { const v = o.videoRenderer; out.push({ id: v.videoId, title: v.title?.runs?.map(r => r.text).join(''), channel: v.ownerText?.runs?.[0]?.text, len: v.lengthText?.simpleText, views: v.viewCountText?.simpleText, age: v.publishedTimeText?.simpleText }); return; } for (const k in o) walk(o[k]); })(JSON.parse(m[1]));
for (const v of out.slice(0, +max)) {
  const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.id}&format=json`, { headers: UA });
  console.log(`${v.id}  embed:${r.status}  ${String(v.len).padEnd(8)} ${String(v.channel).slice(0, 24).padEnd(24)} ${v.title}  [${v.views || ''}, ${v.age || ''}]`);
}

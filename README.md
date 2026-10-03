# Spectre Brands

Sourced, illustrated post-mortems of dead and ghost brands: companies that died, or live on only as a name.
Working domain: spectrebrands.com (not attached yet).

| Page | Tier | Category |
|---|---|---|
| `/` | index: hero, Dead/Ghost explainer, filters, featured cards, coming-soon categories | |
| `/pets-com/` | Dead | Dot-com |
| `/webvan/` | Dead | Dot-com |
| `/radioshack/` | Ghost | Retail & consumer |

## How it works

Every post-mortem page is generated from data files by one shared renderer. Nobody edits HTML.

```
site.json                      homepage copy, categories, method notes
companies/<slug>/company.json  name, tier, category, theme colors, homepage card, hero, key numbers
companies/<slug>/sections/*.json  one file per section (story.json, timeline.json, map.json, ...)
companies/<slug>/art/*.svg     original drawings, inlined into the page
companies/<slug>/img/*         archived screenshots and logos (see "Images" below)
companies/_template/           copy this to start a new company (folders starting with _ are skipped)
lib/registry.mjs               THE SCHEMA: section ids, core vs optional, nav groups, page order, tiers
lib/sections.mjs, blocks.mjs   section and block renderers
lib/layout.mjs                 <head>, masthead + wordmark, grouped section nav, footer
lib/home.mjs                   homepage
lib/md.mjs                     the tiny text markup (**bold**, [link](url), [^n] footnotes)
assets/css, assets/js          shared styles and runtime (nav, story, tabs, charts, map)
data/nasdaq.json               FRED NASDAQCOM weekly closes, Jul 1998 – Dec 2001
build.mjs                      validates everything and writes dist/
```

Core sections are required on every page; optional modules (map, website, gallery, ...) appear only
when a company has the file, and the section menu lists only what the page contains.
Full field reference: **[SCHEMA.md](SCHEMA.md)**.

## Build and preview

Node 18+ and no dependencies.

```sh
node build.mjs                      # validates data, writes dist/
python3 -m http.server 8000 -d dist # preview at http://localhost:8000/
```

The build fails with a readable message for invalid JSON, unknown section ids, missing core
sections, missing drawings or images, unknown tiers or categories, and unknown block kinds.

## Deploy

Vercel project `spectre-brands` (live at https://spectre-brands.vercel.app), connected to this repo; every push to `main` deploys to production.
`vercel.json` sets `buildCommand: node build.mjs`, `outputDirectory: dist`, `trailingSlash: true`.

## Images

Raster images may be committed either as normal files (`logo-2000.avif`) or as base64 text files with
a `.b64` suffix (`logo-2000.avif.b64`). `build.mjs` decodes `*.b64` to the real file in `dist/`, so data
files always refer to the real name (`"image": "img/logo-2000.avif"`). The current images are `.b64`
because the repo was first published through a text-only API. Converting back is fine:
`base64 -d x.avif.b64 > x.avif && rm x.avif.b64`.

Archived websites are shown as **screenshots** of Internet Archive captures (no iframes), each linked
to its Wayback URL. Drawings in `art/` are original SVG recreations, not official assets.

Third-party libraries load from jsDelivr: Chart.js 4, d3 7, topojson-client 3, rough.js 4 and the
us-atlas state shapes. Fonts: Source Serif 4, Inter and Caveat (Google Fonts).

## Data honesty rules

1. Every figure links to a numbered source (`[^n]` → Sources section). SEC filings first, then contemporary press, then archives.
2. Numbers we calculate are labeled **derived**; estimates are labeled **estimate**; claims we could not confirm are labeled **unverified** or left out. Each page's Sources section ends with data notes listing them.
3. Cause-of-death weights and what-if scenarios are editorial judgment and are labeled as such.
4. Logos, ads and screenshots appear in historical/editorial context; trademarks belong to their owners.

## Adding a company

See the checklist at the end of [SCHEMA.md](SCHEMA.md). Short version: `cp -r companies/_template companies/<slug>`,
fill in `company.json` and the core section files, add optional modules, run `node build.mjs`.

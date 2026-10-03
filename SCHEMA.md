# Spectre Brands page schema

A post-mortem page is `companies/<slug>/company.json` + `companies/<slug>/sections/<id>.json`,
rendered by `build.mjs`. The source of truth for section ids is `lib/registry.mjs`; this file documents it.
A complete, buildable example lives in `companies/_template/` (skipped by the build because it starts with `_`).

## 1. Sections

| id | core? | nav group | renderer | default label |
|---|---|---|---|---|
| overview | **core** (from company.json) | Story | overview | Overview |
| context | optional | Story | blocks | Context |
| story | **core** | Story | story | Story |
| timeline | **core** | Story | timeline | Timeline |
| map | optional | Story | map + linked timeline | Map |
| numbers | **core** | Business | blocks | The numbers |
| economics | optional | Business | blocks | Unit economics |
| marketing | optional | Business | blocks | Marketing |
| rivals | optional | Business | blocks | Rivals |
| videos | **core** | Brand | video gallery | Commercials & footage |
| website | optional | Brand | archived screenshots | Old website |
| gallery | optional | Brand | logos, drawings, recreation | Brand gallery |
| people | optional | People | people | People |
| press | optional | People | press | Press |
| cause | **core** | Verdict | cause | Cause of death |
| whatif | **core** | Verdict | whatif | What if |
| afterlife | **core** | Verdict | afterlife | Afterlife |
| sources | **core** | Sources | sources | Sources |

- **Core** files must exist or the build fails. **Optional** files are rendered only if present.
- Sections always render in the order above (`ORDER` in registry.mjs).
- The sticky section menu shows six groups (Story, Business, Brand, People, Verdict, Sources). Each group
  lists only the sections this page has; a group with no sections is hidden. On mobile the groups scroll horizontally.
- Every section file accepts: `kicker` (small label above the title), `title` (required), `lede` (optional
  intro paragraph), `label` (overrides the menu label) and `blocks` (extra content blocks appended at the end).
- Adding a new section type: add it to `SECTIONS` and `ORDER` in registry.mjs and a renderer in sections.mjs.

## 2. Text markup (all string fields)

Data files never contain HTML; everything is escaped, then:

| write | get |
|---|---|
| `**bold**` | bold |
| `[label](https://url)` | external link (new tab) |
| `[^12]` | footnote 12, linking to source 12 in the Sources section |
| blank line (`\n\n`) | new paragraph, in fields rendered as paragraphs (`body`, `text`, `deck`, `actual`, `whatif`) |

Fields named `src` take an array of source ids, e.g. `"src": [1, 3]`.

## 3. company.json

| field | required | notes |
|---|---|---|
| `name` | yes | display name |
| `number` | yes | "001", "002"... sets order on the homepage and in menus |
| `tier` | yes | `dead` (company gone, nothing operates under the name) or `ghost` (the name is still in use: licensed brand, shell, one surviving outlet, limited re-release, or a much smaller operation). See `TIERS` |
| `tierWhy` | yes | one sentence justifying the tier, with footnotes. Shown in the hero and in the table on /about/ |
| `category` | yes | an id from `site.json` `categories`: dotcom, electronics, retail (toy stores), consumer (food & drink), games, film, restaurants |
| `cause` | yes | main cause of death, an id from `site.json` `causes`: unit-economics, overexpansion, debt, disruption, competition, management, fad. Drives the homepage filter |
| `years` | yes | "1998 – 2000" (use an en dash with spaces; the homepage headstones split on it) |
| `died` | yes | the year the original business ended (number). Drives the "Ended in" decade filter |
| `dates` | no | `[{ "date": "2000-11-07", "text": "announced it was winding down" }]`: key dates for the homepage "On this day" box. `text` is plain text that reads after "Name: " |
| `published`, `updated` | no | ISO dates for the Article JSON-LD |
| `place` | yes | "What it sold · City, State" |
| `title` | yes | `<title>` and og:title |
| `description` | yes | meta description / og:description |
| `theme` | yes | `{ "accent": "#hex", "soft": "#hex" }`: brand accent (links, bars, tags) and a pale tint |
| `card` | yes | homepage card: `blurb`, `stat {value,label}`, `spark` (numbers for the mini line), `peak` (index highlighted), optional `logo` (image path) and `logoYear` |
| `hero` | yes | `dates`, `standfirst`, `deck`, `art` (SVG path, the big hero drawing), `artCaption`, optional `motion` (idle animation of the drawing: `float` default, `bob`, `drive`, `flicker`, `fizz`, `spin`), optional `archive` [{`image`, `caption`, `alt`}] (exactly 3 looks best) shown as a "From the archive" strip |
| `keyNumbers` | no | `{ caption, rows: [{value, text}] }`: four large counters under the hero. Use exactly 4 rows; values tick up on first view |
| `findings` | no | `[{title, text}]` numbered "Key findings" |

## 4. Section fields

**story**: `chapters` [{ `when`, `title`, `big` (the chapter's headline figure, kept short: "$11.00", "5,289"), `cap` (what the figure is), `color` (optional hex for the figure), `body`, `pull` {`text`,`who`} (optional), and **one visual per chapter**: `video` (an id from videos.json; the facade is shown beside the chapter), or `image` {`image`, `caption`, `alt`}, or `art` (SVG path) + `artCaption` }]. Each chapter renders as a row: figure and visual on the left, text on the right. Give every chapter its own visual and vary them; `stageArt` (one SVG for chapters with no visual) is only a fallback.

**videos** (core; every brand needs at least 2, ideally 3–5): `videos` [{ `id` (short slug, unique on the page), `title`, `year` (when it aired or was published), `type` (`commercial`, `news`, `event`, `retrospective`, `documentary`, `interview`, `film`), `provider` (`youtube` default, `archive`, `vimeo`), `embedId` (YouTube video id, archive.org identifier, or Vimeo id), `caption` (what it is, when it aired, why it matters; footnotes allowed), optional `url` (override the link), `start` (seconds), `thumb` (override thumbnail URL) }], optional `note`. Rendered as a filterable gallery; a video can also be placed inline with `"video": "<id>"` on a story chapter or a `{"kind":"video","video":"<id>"}` block. Nothing loads from the host until the reader presses play (YouTube through youtube-nocookie.com). Verify every id with `node scripts/verify-media.mjs <slug>`.

**timeline**: `categories` { key: {`label`, `color`} } (filter chips), `events` [{ `date`, `year`, `cat`, `title`, `text`, `src` }].

**map** (optional module; a US map driven by a horizontal timeline):
- `figure` { `title`, `whatItShows`, `caption` }
- `legend` [{ `cat`, `label` }]. Pin categories `a` red, `b` purple, `c` blue, `d` green, `e` gold
- `pins` [{ `id`, `label` (text on the pin), `cat`, `ll` [lon, lat], `offset` [dx, dy] (optional nudge; a leader line joins it to the true spot), `title`, `text`, `src`, `from` / `to` (ISO dates: hidden before `from`, active between, gray "closed" after `to`), `when` (display text) }]
- `steps` [{ `date` (ISO, sets which pins are visible), `label` (shown on the timeline), `title`, `text`, `src`, `pins` [ids to highlight and pulse], `note` (optional hand-drawn note: `text` [lines], `box` [x, y] in the 975×610 map space, and `at` pin id or `ll` [lon, lat] for the arrow target), `stat` {`value`,`label`} (big number in the corner), `layer` (choropleth layer key to show), `estimate` (text shown as an estimate flag) }]
- `rings` (optional) [{ `ll`, `miles`, `cat` }]: dashed radius circles
- `choropleth` (optional) { `layers`: { key: { `title`, `values` {"State name": number}, `scale` [thresholds], `colors` [scale.length+1 colors], `labels` [one per color], `tip` ("{name}: {v} stores"), `also` [{`layer`, `tip`}] } } }
- Controls: Play/Pause, ‹ ›, arrow keys, or click any timeline dot. Clicking updates pins, note, stat and the step card.

**website** (optional): `captures` [{ `date`, `label` (tab), `url` (original URL, shown in the fake browser bar), `wayback` (capture URL, the screenshot links here), `image` (screenshot path), `h` (image height hint), `captured` (display date), `title`, `text`, `warn` (optional broken-render warning) }], optional `snips` [{`text`, `when`}] (text preserved in captures), `note`.
Screenshots, not iframes. Capture them at 1280px wide from `web.archive.org/web/<timestamp>/<url>` and crop the Wayback toolbar.

**gallery** (optional): `archive` [{`image`, `date`, `caption`, `alt`, `credit` (where the image came from and its license, e.g. "Photo: Jane Doe, via [Wikimedia Commons](url), CC BY-SA 4.0." or "Cropped from an Internet Archive capture. Shown for commentary.")}] (logos, packaging, storefronts and ads as they appeared), `blocks` (put a `compare` then-vs-now block here), `drawings` [{`art`, `title`, `caption`}] (original SVGs), `recreation` (optional CSS rebuild of the old site header: `title`, `font`, `bar` {`bg`,`fg`,`word`,`sub`}, `nav` {`bg`,`fg`,`tab`,`tabs`,`items`}, `side` {`bg`,`items`}, `buttons` {`bg`,`fg`,`items`}, `art`, `headline`, `subhead`, `body`), `swatches` [{`hex`, `label`}], `disclaimer`.

**people**: `people` [{`name`, `role`, `text`, `later`}]. **press**: `clips` [{`q`, `who`, `big` (bool)}].

**cause**: `causes` [{`weight` (number; bars are scaled to the largest), `title`, `text`}], `disclaimer` (shown after "Editorial judgment:"). When the weights sum to 100 a waffle chart of the breakdown is drawn automatically.

**whatif**: `forks` [{`tab`, `actual`, `whatif`}]. The what-if column is always labeled speculative.

**afterlife**: `items` [{`status`, `color`, `title`, `text`}].

**sources**: `list` [{`id`, `text`}] (ids are what `[^n]` and `src` refer to), `notes` [{`label`, `text`}]: data notes, which must list every derived figure, estimate and unverified claim.

**context, numbers, economics, marketing, rivals**: a list of `blocks` (below).

## 5. Blocks

Used by the analysis sections, and appended to any section via `blocks`.

| kind | fields |
|---|---|
| `chart` | `id` (unique on the page), `title`, `subtitle`, `chart` (spec below) **or** `views` [{`label`, `chart`}] (toggle buttons), `source`, `wide` (default true) |
| `keyfacts` | `caption`, `rows` [{`value`, `text`}], `compact`, `source` |
| `table` | `title`, `subtitle`, `columns` [..], `rows` [[..]], `numeric` [column indexes, right-aligned], `highlight` (row index), `source` |
| `text` | `title`, `body` |
| `note` | `body` (small gray note) |
| `quote` | `text`, `who` |
| `drawing` | `art` (SVG path), `caption`, `title`, `body` |
| `image` | `image`, `alt`, `title`, `caption`, `width`, `height` |
| `versus` | `left` / `right`: {`name`, `tag`, `alive` (bool), `rows` [[label, value]]}, `source` |
| `stats` | `items` [{`value`, `label`}], `source` (rendered as compact counters; prefer `counters`) |
| `video` | `video` (an id from videos.json), placed inline |
| infographics | `arc`, `waffle`, `flow`, `multiples`, `counters`, `scale`, `chain`, `compare`, `bars`: see section 7 |
| `row` | `blocks` [2 or 3 blocks shown side by side; stacked on mobile] |

## 6. Chart spec

Rendered by `assets/js/charts.js` (Chart.js 4).

Every chart also gets a "Data table" disclosure generated from its spec, so the numbers are readable without the canvas.

- `type`: `bar`, `line` or `doughnut`; `horizontal` (bool); `stacked` (bool); `height` (px); `legend: false`; `cutout` (doughnut)
- `labels`: category labels. Omit when using the Nasdaq reference.
- `y`, `y1` (second axis), `x`: { `format`, `min`, `max`, `log`, `ticks` [only these values get labels], `title`, `noGrid` }
- `format`: `usd`, `usd2`, `usdK`, `usdM`, `usdB`, `usdAuto`, `pct`, `num`, `x`, or `{ "pre": "$", "suf": "M", "dec": 1 }`
- `series` [{ `label`, `data` (a `null` gap; `[low, high]` pairs make floating bars), `type` (mix line into bar), `color` / `colors` (named: ink, brand, red, gold, green, blue, plum, teal, grey, light, or hex; the old names `tan` and `sand` still work and now map to neutral greys), `axis: "y1"`, `stack`, `dashed`, `fill`, `points`, `showLine`, `tension`, `spanGaps`, `barPercentage`, `order`, `format`, `hideLegend` }]
- Nasdaq reference: a series with `"ref": "nasdaq"` pulls `data/nasdaq.json` (FRED NASDAQCOM) between spec `from`/`to` (ISO); `indexTo` (ISO date) rebases to 100. A series with `events` [[`"YYYY-MM-DD"`, value or `null`, `"label"`]] plots points snapped to the nearest week (`null` uses the index value).
- `refLines` [{`value`, `label`, `axis`}]: dashed reference lines
- `notes` [{`text` [lines], `s` (series index) + `i` (point index, or `"ev:YYYY-MM-DD"`), or `x`/`y`, `dx`, `dy`}]: hand-drawn rough.js annotations (hidden under 560px)
- `tooltip` { `format`, `footers` [per-label footer text] }

## 7. Infographic blocks

Rendered to HTML/SVG at build time by `lib/infographics.mjs` (no chart library). Each one prints its values,
has a "Data table" disclosure underneath, and animates in on first view. Aim for at least four per company,
placed in the section they belong to (any section accepts `blocks`). Every block takes `title`, `subtitle`,
`source` (text with footnotes) and `note`. Colours are names: `brand`, `ink`, `red`, `blue`, `green`, `gold`,
`plum`, `teal`, `grey`, `light` (or a hex).

| kind | what it shows | fields |
|---|---|---|
| `arc` | rise-and-fall line with numbered turning points | `labels` [x labels], `format`, `series` [{`label`, `data`, `color`}] (1 or 2; the first gets an area fill), `points` [{`i` (index into labels), `s` (series index, default 0), `title`, `text`}], `xLabel` |
| `waffle` | 100 squares split by share | `items` [{`label`, `value`, `note`, `color`}], `format` (default `pct`), `itemLabel`, `valueLabel` |
| `flow` | money flow from one source to several destinations (a simple Sankey) | `from` {`label`, `value`}, `to` [{`label`, `value`, `color`, `note`}], `format`. The destinations **must sum to the source** (within 1%); add a clearly labeled "derived remainder" item if needed, or the build fails |
| `multiples` | competitor small multiples: who won, who died | `items` [{`name`, `status` (`alive`, `dead`, `acquired`, `merged`, `ghost`), `statusLabel`, `self` (true for this page's company), `value` (headline figure as text), `text`, `data` [numbers for a sparkline, optional], `range` [first label, last label]}], `metric` |
| `counters` | large figures with a context sentence each | `items` [{`value`, `text`}], `title`, `compact` |
| `scale` | "A = N × B", drawn as N icons | `left` {`value`, `label`}, `unit` {`value`, `label`}, `count` (N, at most 300), `icon` (`tv`, `box`, `store`, `coin`, `person`, `van`, `bottle`, `disc`, `cart`, `ticket`, `burger`, `phone`, `gamepad`, `dot`), `equation` (the arithmetic and its sources; shown with a "Derived" label), `per` (what one icon stands for, if not one unit) |
| `chain` | acquisition chain: who owned the name, in order | `nodes` [{`when`, `owner`, `what`, `price`, `status` (`bankrupt`, `current`)}] |
| `compare` | then-vs-now slider | `before` / `after`: {`label`, `image` or `art` (+ `bg`), `caption`, `alt`}, `ratio` ("16/10") |
| `bars` | ranked horizontal bars with printed values | `items` [{`label`, `value`, `display`, `note`, `color`, `self`}], `format`, `itemLabel`, `valueLabel` |

`format` is the same as for charts: `usd`, `usd2`, `usdK`, `usdM`, `usdB`, `pct`, `num`, `x`, or `{ "pre": "$", "suf": "M", "dec": 1 }`.

## 8. Assets

- `art/*.svg`: original drawings, inlined into the HTML. Keep them self-contained (no external refs), with a `viewBox`, and no fixed width.
- `img/*`: screenshots, logos and photos, as **AVIF plus a JPEG (or PNG) fallback with the same basename**
  (`logo-2000.avif` + `logo-2000.jpg`). Data files reference the `.avif`; the build emits a `<picture>` with the
  fallback and reads width/height from the file. Helpers:
  - `node scripts/img.mjs <input> <stem> [--width 1280]` converts any image to `<stem>.avif` + `<stem>.jpg`
  - `node scripts/capture.mjs <wayback-url> <stem>` screenshots an Internet Archive capture at 1280px
  - `node scripts/commons.mjs "File:Name.jpg" <stem>` prints a Wikimedia Commons file's license and credit line and downloads it
  Keep each image under about 60 KB where possible.
- The build fails if a referenced drawing or image is missing.

## 9. Adding a company

Follow the step-by-step guide in [docs/ADD_A_BRAND.md](docs/ADD_A_BRAND.md).

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
| website | optional | Brand | archived screenshots | Old website |
| gallery | optional | Brand | logos, drawings, recreation | Brand gallery |
| people | optional | People | people | People |
| press | optional | People | press | Press |
| cause | **core** | Verdict | cause | Cause of death |
| whatif | **core** | Verdict | whatif | What if |
| afterlife | **core** | Verdict | afterlife | Afterlife |
| sources | **core** | Sources | sources | Sources |

- **Core** files must exist or the build fails. **Optional** files are rendered only if present.
- Sections always render in the order above (`ORDER` in registry.mjs) and are numbered 01, 02, ...
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
| `tier` | yes | `dead` (company gone) or `ghost` (name lives on as a licensed brand/shell). See `TIERS` |
| `category` | yes | an id from `site.json` `categories` (dotcom, consumer, restaurants, film, games) |
| `years` | yes | "1998 – 2000" |
| `place` | yes | "What it sold · City, State" |
| `title` | yes | `<title>` and og:title |
| `description` | yes | meta description / og:description |
| `theme` | yes | `{ "accent": "#hex", "soft": "#hex" }`: brand accent (links, bars, tags) and a pale tint |
| `card` | yes | homepage card: `blurb`, `stat {value,label}`, `spark` (numbers for the mini line), `peak` (index highlighted), optional `logo` (image path) and `logoYear` |
| `hero` | yes | `dates`, `standfirst`, `deck`, `art` (SVG path, the big hero drawing), `artCaption`, optional `archive` [{`image`, `caption`, `alt`}] shown as a "From the archive" strip |
| `keyNumbers` | no | `{ caption, rows: [{value, text}] }` table under the hero |
| `findings` | no | `[{title, text}]` numbered "Key findings" |

## 4. Section fields

**story**: `chapters` [{ `when`, `title`, `big` (large stage figure), `cap` (stage caption), `color` (optional), `body`, `pull` {`text`,`who`} (optional) }], optional `stageArt` (SVG shown on the sticky stage).

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

**gallery** (optional): `archive` [{`image`, `date`, `caption`, `alt`}] (logos/ads as they appeared), `drawings` [{`art`, `title`, `caption`}] (original SVGs), `recreation` (optional CSS rebuild of the old site header: `title`, `font`, `bar` {`bg`,`fg`,`word`,`sub`}, `nav` {`bg`,`fg`,`tab`,`tabs`,`items`}, `side` {`bg`,`items`}, `buttons` {`bg`,`fg`,`items`}, `art`, `headline`, `subhead`, `body`), `swatches` [{`hex`, `label`}], `disclaimer`.

**people**: `people` [{`name`, `role`, `text`, `later`}]. **press**: `clips` [{`q`, `who`, `big` (bool)}].

**cause**: `causes` [{`weight` (number; bars are scaled to the largest), `title`, `text`}], `disclaimer` (shown after "Editorial judgment:").

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
| `stats` | `items` [{`value`, `label`}], `source` |
| `row` | `blocks` [2 or 3 blocks shown side by side; stacked on mobile] |

## 6. Chart spec

Rendered by `assets/js/charts.js` (Chart.js 4).

- `type`: `bar`, `line` or `doughnut`; `horizontal` (bool); `stacked` (bool); `height` (px); `legend: false`; `cutout` (doughnut)
- `labels`: category labels. Omit when using the Nasdaq reference.
- `y`, `y1` (second axis), `x`: { `format`, `min`, `max`, `log`, `ticks` [only these values get labels], `title`, `noGrid` }
- `format`: `usd`, `usd2`, `usdK`, `usdM`, `usdB`, `usdAuto`, `pct`, `num`, `x`, or `{ "pre": "$", "suf": "M", "dec": 1 }`
- `series` [{ `label`, `data` (a `null` gap; `[low, high]` pairs make floating bars), `type` (mix line into bar), `color` / `colors` (named: ink, red, gold, green, blue, plum, tan, sand, or hex), `axis: "y1"`, `stack`, `dashed`, `fill`, `points`, `showLine`, `tension`, `spanGaps`, `barPercentage`, `order`, `format`, `hideLegend` }]
- Nasdaq reference: a series with `"ref": "nasdaq"` pulls `data/nasdaq.json` (FRED NASDAQCOM) between spec `from`/`to` (ISO); `indexTo` (ISO date) rebases to 100. A series with `events` [{`date`, `label`, `value`}] plots points snapped to the nearest week (`value: null` uses the index value).
- `refLines` [{`value`, `label`, `axis`}]: dashed reference lines
- `notes` [{`text` [lines], `s` (series index) + `i` (point index, or `"ev:YYYY-MM-DD"`), or `x`/`y`, `dx`, `dy`}]: hand-drawn rough.js annotations (hidden under 560px)
- `tooltip` { `format`, `footers` [per-label footer text] }

## 7. Assets

- `art/*.svg`: original drawings, inlined into the HTML. Keep them self-contained (no external refs), with a `viewBox`, and no fixed width.
- `img/*`: screenshots and logos. Reference them by real name (`img/logo-2000.avif`). Store either the file
  itself or a base64 text file with `.b64` added (`img/logo-2000.avif.b64`); the build decodes `.b64`.
  Prefer AVIF or WebP under about 40 KB each.
- The build fails if a referenced drawing or image is missing.

## 8. Adding a company: checklist

1. `cp -r companies/_template companies/<slug>` (the slug is the URL: `/<slug>/`).
2. `company.json`: every required field, a new `number`, `tier`, a `category` from site.json, and theme colors sampled from the real brand.
3. Fill in the core sections: story, timeline, numbers, cause, whatif, afterlife, sources.
4. Add the optional modules that have real material (map only if place matters; website only with real Wayback captures). Delete the template's `map.json` if unused.
5. Draw `art/hero.svg` and gallery drawings as original recreations. Save archive screenshots and logos into `img/`.
6. Every number gets `[^n]`; label derived figures, estimates and unverified claims, and list them in `sources.notes`.
7. `node build.mjs`, fix any errors, preview `dist/`, and check 1280px and 375px widths (no horizontal scroll).
8. Commit and push to `main`; Vercel deploys automatically.

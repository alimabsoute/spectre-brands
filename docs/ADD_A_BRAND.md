# Adding a brand

A post-mortem is a folder of data files. Nobody writes HTML. Follow these steps in order; the build
checks most of them for you. Field reference: [SCHEMA.md](../SCHEMA.md). A complete worked example:
`companies/pets-com/`.

## 0. Before you start

- Pick the **slug** (the URL): lowercase, hyphens, e.g. `circuit-city` gives `/circuit-city/`.
- Pick the next free **number** (`"number": "018"`); it sets the order on the homepage.
- Decide the **tier** and write the one-sentence justification (`tierWhy`):
  - `dead`: the company is gone and nothing operates under the name.
  - `ghost`: the original business failed or shrank to a shadow, but the name is still in use (licensed
    brand, shell, one surviving outlet, limited re-releases, a much smaller operation under new owners).
- Pick the **category** and **cause** ids from `site.json`. If none fits, add one there first.

```sh
cp -r companies/_template companies/<slug>
```

## 1. Research first, write second

Collect sources before writing a sentence. Order of preference:

1. SEC filings on EDGAR (10-K, 10-Q, 8-K, S-1, proxies), bankruptcy dockets, company press releases.
2. Contemporary press (wire services, national papers, trade press) from the time of the events.
3. Later reporting, books and reference histories, for context and pre-EDGAR periods (before about 1996).
4. Internet Archive captures for what the website said, and for footage.

Rules that are not negotiable:

- **Every number gets a footnote** `[^n]` that resolves to an entry in `sections/sources.json`. The build
  fails on a footnote with no source.
- **Open every source URL** and confirm it loads and says what you cite it for. Do not cite a URL from
  memory. Prefer stable URLs (sec.gov/Archives, archive.org, the publisher's own page).
- A figure you calculated is labeled **derived**, with the arithmetic in the chart note or data notes.
- An estimate is labeled **estimate** and attributed. A widely repeated claim you could not trace is
  labeled **unverified** or left out. If something is unknown, say it is unknown.
- Uncontroversial facts with no citation (a product's launch year) are listed under a "General knowledge"
  data note.
- Wikipedia is for finding sources, not for figures.
- Write plainly. No hype, no invented quotes. Quotes are verbatim from a cited source.

## 2. company.json

Fill every required field (SCHEMA.md section 3). Notes:

- `theme.accent`: one colour from the brand's real palette, dark enough for text on white (contrast of at
  least 4.5:1; avoid yellow, pick the brand's red, blue or green). `theme.soft`: a very pale tint of it for
  illustration backgrounds (not beige or tan).
- `card.spark`: 5 to 10 numbers that trace the rise and fall (stores, revenue, share price); `card.peak` is
  the index of the peak. `card.stat`: the one number that defines the failure.
- `keyNumbers.rows`: exactly four.
- `dates`: two to four exact dates (YYYY-MM-DD) for the homepage "On this day" box: the bankruptcy filing,
  the last day of business, the launch.
- `hero.archive`: three images if you have them.

## 3. Core sections (required)

| file | what goes in it |
|---|---|
| `sections/story.json` | 4 to 6 chapters. Each has a headline figure (`big`), a caption and **its own visual**: a video id, an image, or a drawing. Put the famous commercial beside the chapter about the marketing. |
| `sections/timeline.json` | 15 to 35 dated events in 3 to 6 threads (corporate, money, product, rivals, death). |
| `sections/numbers.json` | The financial record as blocks: at least one `chart`, plus infographics (below). |
| `sections/videos.json` | **At least 2 videos, ideally 3 to 5** (see step 5). |
| `sections/cause.json` | 4 to 6 causes with weights that sum to 100, each with sourced evidence, and the disclaimer. |
| `sections/whatif.json` | 2 to 4 forks: what happened, and a clearly speculative alternative. |
| `sections/afterlife.json` | What became of the name, the stores, the people, the idea. Add a `chain` block for the owners of the name. |
| `sections/sources.json` | The numbered list, and data notes listing every derived figure, estimate and unverified claim. |

## 4. Optional modules (add the ones with real material)

`context.json` (the market it was born into), `economics.json` (unit economics), `marketing.json`,
`rivals.json`, `website.json` (Wayback screenshots), `gallery.json` (logos, storefronts, packaging, original
drawings), `people.json`, `press.json` (headlines and quotes, verbatim and cited), `map.json` (only when
geography matters: store footprints, delivery markets; skip it otherwise).

## 5. Videos

```sh
node scripts/yt-search.mjs "circuit city commercial 1995"   # lists ids and checks each is embeddable
node scripts/verify-media.mjs <slug>                        # must print 0 failed
```

- Sources: YouTube, the Internet Archive (`provider: "archive"`, `embedId` is the identifier from
  `archive.org/details/<identifier>`; verify with `https://archive.org/metadata/<identifier>`), Vimeo.
- Mix types: `commercial`, `news`, `event`, `retrospective`, `documentary`, `interview`.
- Caption each with what it is, the year it aired and why it matters. If the year comes only from the
  uploader, say so. Do not download or re-host video files.
- Place one or two inline: `"video": "<id>"` on a story chapter, or a `{"kind":"video","video":"<id>"}` block.

## 6. Infographics (at least four)

Use the infographic blocks in SCHEMA.md section 7 inside the section they belong to:

- `arc` in numbers: stores, revenue or users over time, with numbered turning points.
- `flow` in numbers or economics: money raised to where it went (destinations must sum to the source).
- `multiples` in rivals: who won, who died.
- `scale` in marketing or numbers: one number expressed as a count of something familiar.
- `chain` in afterlife: who bought the name after death.
- `compare` in gallery: then vs now (two screenshots, two logos, two photos).
- `bars`, `waffle`, `counters` wherever they fit. The cause-of-death waffle is drawn automatically.

Every infographic needs a `source` line with footnotes. Use only figures that are in your sources.

## 7. Images and drawings

```sh
node scripts/capture.mjs https://web.archive.org/web/20001109000000/http://www.example.com/ companies/<slug>/img/archive-2000-11-home
node scripts/commons.mjs "File:Example storefront.jpg" companies/<slug>/img/storefront-1998
node scripts/img.mjs /tmp/raw.png companies/<slug>/img/logo-1995 --width 600
```

- Real imagery: Wayback captures of the brand's own site (logos, pages), and Wikimedia Commons photos
  with a free license (public domain, CC0, CC BY, CC BY-SA). Put the license and author in the item's
  `credit`. Do not use press photos or images of unknown origin.
- Every image is stored as `.avif` plus a `.jpg` fallback with the same name (the helpers do this).
- Drawings (`art/*.svg`) are **original illustrations** in the house style: flat colour, a 3px dark
  outline (`stroke="#1d1b18"`, round caps and joins), a `viewBox` and no fixed width or height, no external
  references, under 4 KB. Draw the product, the storefront, the mascot's silhouette or the packaging in the
  spirit of the brand; do not trace a logo. Add `role="img"` and an `aria-label`. `art/hero.svg` is required;
  two or three more make the story and gallery better. Elements with `class="screen"` flicker and elements
  with `class="spin"` rotate when `hero.motion` is `flicker` or `spin`.
- Captions say what the image is, the year, where it came from, and (for drawings) that it is an original
  illustration and not an official asset.

## 8. Build and check

```sh
node build.mjs --only <slug> --out /tmp/dist-<slug>   # fast check of one brand
npm run check                                         # full build, links, Playwright at 375 and 1280
node scripts/verify-media.mjs <slug>
node scripts/og.mjs <slug>                            # OpenGraph image -> og/<slug>.png
node scripts/shots.mjs /tmp/shots --only /<slug>/     # screenshots at 375/768/1280/1440 to review
```

The build fails on invalid JSON, unknown section ids or block kinds, missing core sections, missing
images or drawings, footnotes without a source, fewer than two videos, and a `flow` whose parts do not
sum. It warns when a brand has fewer than four infographics, an image without a fallback, or no
OpenGraph image.

Look at the page at 375px and 1280px before committing: no horizontal scroll, no empty columns, every
chapter with a visual, every chart with a source line.

## 9. Publish

Commit and push to `main`. Vercel builds with `node build.mjs` and deploys automatically. The homepage,
the category page, the search index, the sitemap and the "On this day" calendar update by themselves.

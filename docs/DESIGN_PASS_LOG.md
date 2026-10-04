# Design pass log

Run on 2026-10-04 from `DESIGN_PASS_PROMPT.md`, starting at `d80003c`. One section per area: the research
queries that were run (which MCP, what came back), then what was measured. Design decisions are in
`docs/design-pass/NOTES.md`; the per-area summary is in `docs/design-pass/SUMMARY.md`.

## Setup

- `git status` clean on `main` at `d80003c`. `npm install` and `npm run check` passed before any change
  (27 pages, 7,317 internal references, 26 pages × 2 widths).
- `claude mcp list` reported Mobbin, 21st.dev (`plugin:21st:21st`) and shadcn as connected.
  - **Mobbin**: answered test queries in this session (`search_screens`).
  - **21st.dev**: answered test queries in this session (`search`).
  - **shadcn**: listed as connected by `claude mcp list`, but the server timed out when this session tried to
    attach to it (`CONNECT_TIMEOUT`), so its MCP tools were not callable here. The registry was read with the
    shadcn CLI instead (`npx shadcn@latest view @shadcn/<item>`), which is the same registry the MCP server
    wraps. Every "shadcn" entry below is a CLI `view`, not an MCP call. No `components.json` was needed.
- Baseline screenshots: `docs/design-pass/before/` (all 26 pages at 375 and 1280, plus `report.json`).
  `scripts/shots.mjs` could not match `--only` on Windows (paths came back with backslashes); that was fixed
  first, and the script gained `--sections <ids>` so one section can be captured on its own.
- Baseline page heights (from `before/report.json`): brand pages 28,039–39,437 px at 1280 and
  50,426–62,524 px at 375.

## 1. Timelines

### Research

Mobbin (`search_screens`, web):

| Query | Top hits |
| --- | --- |
| horizontal history timeline with event dots on a year axis and a detail panel | [GetYourGuide itinerary rail + map](https://mobbin.com/screens/4c6089bb-c5ed-4e53-8b37-307c502463ea), [Shopify order timeline](https://mobbin.com/screens/96f5193a-ddb8-4376-b272-4a7048d6a1c5), [Basecamp Lineup](https://mobbin.com/screens/9185e0ca-8d0e-4be3-bcff-9dd902a31666) |
| company history timeline with years along a horizontal axis and milestones | [Basecamp Lineup, add marker](https://mobbin.com/screens/09264499-59be-4a34-b204-b232f3300cf1), [Canny changelog](https://mobbin.com/screens/32a827a7-bbaf-4184-942d-d52462742365), [Cofounder daily activity chart](https://mobbin.com/screens/2f7a876a-0cb0-4ec2-b47b-e2c6f119f566) |
| stock price chart with a draggable scrubber showing the value at the selected date | [Base, ETH price chart with cursor line](https://mobbin.com/screens/5d35e943-618c-402a-a9e8-2d8addd1f612), [Shopify attribution date range](https://mobbin.com/screens/0fefe340-be05-4143-a323-9c4cad81cf88), [Copilot Money investments](https://mobbin.com/screens/ff5af71c-c937-448f-9e7d-f7e13567e38e) |
| chart with a range slider below it to select a date range | [Square sales summary](https://mobbin.com/screens/d8598065-f6d7-4c60-89c9-bcec9b1f3c51), [DoorDash Merchant sales](https://mobbin.com/screens/7592fb42-3a52-4542-a970-4197ae07b165), [Calendly analytics](https://mobbin.com/screens/974ba92d-69d3-4b7f-9abb-39c4f7a6664f) |
| Gantt chart with bars across a horizontal time axis and row labels | [Square Workday](https://mobbin.com/screens/9eba6531-f7ba-44e9-b6c0-07ccf28d85c8), [Basecamp Lineup](https://mobbin.com/screens/9185e0ca-8d0e-4be3-bcff-9dd902a31666), [Toggl Track](https://mobbin.com/screens/53cb7210-22af-4c97-9849-7a685ea666f8) |
| event browser listing events grouped by date with category filter chips | [Browserbase sessions](https://mobbin.com/screens/b633730a-9656-4a4e-8721-76845ed05684), [Calendly event types](https://mobbin.com/screens/371e857d-8928-4e58-bd58-76c3a7e0287f) |
| calendar year view showing all twelve months with marked days | [Calendly calendar](https://mobbin.com/screens/3a2fdf98-1d65-4469-8031-d43b2a64c08a), [Sweatpals schedule](https://mobbin.com/screens/f2ecf33a-f83c-408d-82a7-a8f6fb07a039). Neither is a true year view; nothing useful here. |
| changelog page with dated entries and a tag per entry | [Mintlify](https://mobbin.com/screens/f5b84a31-9145-44d3-a766-39ff4d372181), [Basecamp "History of changes"](https://mobbin.com/screens/07446502-ce66-4714-a13d-fd4d6b9707a9) |

21st.dev (`search`, components):

| Query | Top hits |
| --- | --- |
| horizontal timeline | [shadcnspace Interactive Timeline](https://21st.dev/@shadcnspace/components/timeline-02) (year selector swaps one detail block), [slide-cn Timeline](https://21st.dev/@slide-cn/components/timeline), [hyperiux Product Timeline](https://21st.dev/@hyperiux/components/timeline) |
| timeline | [nyxbui Timeline](https://21st.dev/@nyxbui/components/timeline), [cubby-ui Timeline](https://21st.dev/@cubby-ui/components/timeline), [olewandowski1 Activity Timeline](https://21st.dev/@olewandowski1/components/timeline-3) |
| scrubber | [rmahammad Filmstrip Scrub](https://21st.dev/@rmahammad/components/filmstrip-scrub), [ruixen.ui Chapter Scrubber](https://21st.dev/@ruixen.ui/components/chapter-scrubber), [pulkitxm Scroll-Linked Video Scrubber](https://21st.dev/@pulkitxm/components/scroll-linked-video-scrubber) |
| range slider | [arihantcodes Dual Range Slider](https://21st.dev/@arihantcodes_1f7b8c4d/components/dual-range-slider), [originui Slider](https://21st.dev/@originui/components/slider), [wensity Slider](https://21st.dev/@wensity/components/slider) |
| event timeline | Activity Timeline, slide-cn Timeline and Interactive Timeline again (same three as above) |

shadcn (CLI `view`; see Setup):

| Item | What was taken from it |
| --- | --- |
| `@shadcn/scroll-area` | Radix root / viewport / scrollbar split. Used as the model for a clipped plot area with its own position control. |
| `@shadcn/tooltip`, `@shadcn/hover-card` | Hover content anchored to a trigger. Rejected for event detail: a floating card hides neighbouring dots, so detail goes in a fixed panel. |
| `@shadcn/toggle-group` | Single-select pressed buttons. Pattern for the thread chips and the "Busiest stretch / All years" switch (`aria-pressed`). |
| `@shadcn/slider` | Track, range and thumbs with `role="slider"` and arrow keys. Pattern for the two handles of the year range. |

### Measured (Playwright, `node scripts/measure.mjs '#timeline'`, viewport height 800)

Height of the whole `#timeline` section, heading and padding included.

| | 1280 | 375 |
| --- | --- | --- |
| Before, tallest brand | 4,082 px | 6,260 px |
| After, shortest brand (RadioShack) | 769 px | 923 px |
| After, tallest brand | 892 px (Zima, 8 threads) | 1,069 px (Howard Johnson's) |

After, per brand at 1280 / 375: aol 782 / 982, atari 807 / 1035, blockbuster 782 / 1042, burger-chef 826 / 1014,
circuit-city 782 / 980, crystal-pepsi 807 / 1031, dreamcast 826 / 1010, groupon 782 / 1042,
howard-johnsons 782 / 1069, kb-toys 782 / 1042, kiddie-city 782 / 1010, pets-com 807 / 1024, quibi 841 / 1032,
radioshack 769 / 923, toys-r-us 807 / 1035, webvan 794 / 971, zima 892 / 1045.

Limits now enforced by `npm run check` on every brand page: 900 px at 1280, 1,200 px (1.5 × the 800 px test
viewport) at 375, and every event in the list must have a dot in the chart.

Also verified in a browser on `/pets-com/`: arrow keys, Home and End move the selection and focus; the section
height stayed at 815 px through every selection; the thread filter left 9 of 34 dots active for "Death & estate";
the era bands, presets, range handles (keyboard) and dragging the range all changed the years shown; selecting
an event moved the map to the matching step (Home → step 1, End → step 9), and stepping the map moved the
timeline selection; hovering a dot showed that event in the panel ("Jul 2000") and leaving restored the
selected one ("Sep 27 1999"). Hover and the map link were checked by hand-written probes, not by `npm run check`.

## 2. Real imagery (hero archive, brand gallery)

### Research

Mobbin (`search_screens`, web):

| Query | Top hits |
| --- | --- |
| editorial photo essay article with large full-width photographs and captions with photo credits | [ZARA lookbook, three large images with numbered captions](https://mobbin.com/screens/b1d5eb25-ab1f-4898-8e91-136f24093100), [GetYourGuide article](https://mobbin.com/screens/1e654ccf-6ad7-4821-8ea6-20b86cd353b8), [H&M full-bleed campaign image](https://mobbin.com/screens/6dcf8042-82a6-4397-9358-aa80eb242a6f) |
| museum collection object page with a large artwork image and catalogue details beside it | [Variant reference board](https://mobbin.com/screens/42d49819-409e-47cd-9614-f0266711069a), ZARA lookbook again, [GetYourGuide Arc de Triomphe: one lead photo plus four smaller, "View all"](https://mobbin.com/screens/82f217fe-febf-4036-97d8-51c3cc146e1a). No actual museum page came back. |
| news article image gallery with mixed size photos in a grid | [ZARA editorial, mixed-size images on a bare grid](https://mobbin.com/screens/08deb7b1-447c-4f5c-88ce-aa31f3f3eebf), [GetYourGuide article cards](https://mobbin.com/screens/a815406f-1440-461f-a7cc-125f04a034b6) |
| image lightbox overlay showing one enlarged photo with caption and previous next arrows | [Square "Add image" dialog](https://mobbin.com/screens/3ccde47f-f6c0-4a47-89df-64f0abef3cc7), [DoorDash Merchant photo dialog](https://mobbin.com/screens/936610f4-3743-485e-9a7b-4b33c855ec4b). Both are upload dialogs, not viewers. |

21st.dev (`search`, components):

| Query | Top hits |
| --- | --- |
| image gallery masonry | [ayushmxxn Masonry Lightbox](https://21st.dev/@ayushmxxn/components/masonry-lightbox), [olewandowski1 Grayscale Mosaic Gallery](https://21st.dev/@olewandowski1/components/gallery-4), [vinny Arch Gallery](https://21st.dev/@vinny_b0b96136/components/arch-gallery) |
| lightbox | [inference-sh Zoomable Image](https://21st.dev/@inference-sh/components/zoomable-image), [arihantcodes Image Preview](https://21st.dev/@arihantcodes_1f7b8c4d/components/image-preview), Masonry Lightbox again |
| photo caption editorial | [felipemenezes098 Editorial Image Hero](https://21st.dev/@felipemenezes098/components/hero-07), [Editorial Hero](https://21st.dev/@felipemenezes098/components/hero-05), [platejs Caption](https://21st.dev/@platejs/components/caption) |

shadcn (CLI `view`):

| Item | What was taken from it |
| --- | --- |
| `@shadcn/dialog` | Overlay, content, a close button with a text label, title/description slots. The viewer is a native `<dialog>` with the same parts. |
| `@shadcn/aspect-ratio` | A box that holds its ratio before the image loads. Done here with `width`/`height` attributes and `aspect-ratio` in CSS. |
| `@shadcn/carousel` | `role="region"`, previous/next buttons with text labels, arrow keys. Used for the viewer's previous/next; no carousel was added on mobile. |

### Measured and verified

- Lead image chosen per brand (read back from the built HTML): 16 of 17 brands now open on a real image; Kiddie City
  has no images at all and keeps its drawing. 12 leads come from the hero's own three archive images; 4 (Blockbuster,
  KB Toys, RadioShack, Webvan) come from gallery photographs because none of their hero images is a photograph.
- Hero lead width at 1280: 8 of 12 columns (about 700 px) for wide images, 5 of 12 for upright ones
  (Circuit City, Zima, Kiddie City). Before, the three archive images were about 150 px wide each.
- Gallery rows (read back from the built HTML): every row has two or three pictures of equal height, or one picture
  with its label beside it. No brand has a row with a single orphan card.
- Viewer, tested in a browser at 1280 and 375 on `/circuit-city/`: clicking the lead opened it with its caption,
  the right arrow key moved to the next image, Escape closed it. `npm run check` now tests open and Escape.
- `npm run check` passed (27 pages, 7,454 internal references).

## 3. Homepage hero

### Research

Mobbin (`search_screens`, web):

| Query | Top hits |
| --- | --- |
| magazine homepage with a large lead story image, headline and a column of secondary stories | [ZARA editorial, mixed-size image wall](https://mobbin.com/screens/08deb7b1-447c-4f5c-88ce-aa31f3f3eebf), [GetYourGuide article cards](https://mobbin.com/screens/a815406f-1440-461f-a7cc-125f04a034b6), [Microsoft Copilot "Stories to explore"](https://mobbin.com/screens/6fa834b9-ef0c-4704-8964-c5a8595267ff) |
| archive landing page showing a wall of many items as a dense image grid | [Square image library](https://mobbin.com/screens/1d2591d5-1c06-4ec5-9ae5-3d00e4117dc2), [Variant saved boards](https://mobbin.com/screens/5e77e164-07a4-4215-ac5a-53cce9dfa860) |
| museum homepage with a featured exhibition image and a list of collection highlights | [ZARA campaign cover, type set over full-bleed photos](https://mobbin.com/screens/69b0b18a-82b5-40ed-a7da-a2b6b412922b), [GetYourGuide home, a row of image tiles with a name under each](https://mobbin.com/screens/0580ed2a-ddc5-4aa3-8dd6-d49dfc27adba) |
| editorial index page listing articles as a dense table of contents with dates | GetYourGuide article cards again, [Mintlify docs](https://mobbin.com/screens/4120c8e3-0c29-47d9-80c1-c87d2750ce57), [Microsoft Copilot story page with a contents rail](https://mobbin.com/screens/dc66b58d-7d30-47ca-87fb-d881ff01e1f8) |

Mobbin is a product-UI library; it returned no real magazine or museum front page for these queries.

21st.dev (`search`, components):

| Query | Top hits |
| --- | --- |
| editorial hero | [Editorial Hero](https://21st.dev/@felipemenezes098/components/hero-05), [Editorial Image Hero](https://21st.dev/@felipemenezes098/components/hero-07), [Editorial Collage Hero](https://21st.dev/@felipemenezes098/components/hero-04) |
| newspaper masthead | The same three editorial heroes; nothing masthead-specific. |

shadcn (CLI `view`): `@shadcn/separator` (a decorative rule with an orientation; the dateline rules follow it) and
`@shadcn/badge` (variant pill; not used, the tier is plain text in each stone's label).

### Verified

- Screenshots at 1280 and 375 reviewed: `docs/design-pass/after/03-home-hero/`.
- The wall holds all 17 brands (16 real images and the Kiddie City drawing), read back from the built HTML.
- The two pill buttons are gone; the hero has one text link, "Browse the index".
- `npm run check` passed.

## 4. Index and category pages

### Research

Mobbin (`search_screens`, web):

| Query | Top hits |
| --- | --- |
| editorial list view of articles as rows with a small thumbnail, title, date and category | [Square categories list](https://mobbin.com/screens/1c577e29-e3e6-4266-a553-7e439448e599), [GetYourGuide article cards](https://mobbin.com/screens/a815406f-1440-461f-a7cc-125f04a034b6), [Klaviyo products table: thumbnail, name, status, dates](https://mobbin.com/screens/7021c620-ec7c-4131-ba4b-7e692499324d) |
| dense data table with logo, name, status badge, a number column and an inline sparkline per row | [Shopify companies](https://mobbin.com/screens/7c5875cc-c53f-4721-9ea5-5380c32044fa), [Twenty companies with logos](https://mobbin.com/screens/35f5c474-ed6a-4c77-a6cb-f2e1d6b12398), [Semrush topics: number columns and a sparkline per row](https://mobbin.com/screens/c2ea4534-58e7-49c8-8405-eb3ddf3e9a4d) |
| archive index page with a list of entries grouped under section headings | [Microsoft Copilot "Previous experiments" rows with images](https://mobbin.com/screens/c912dc52-284e-47e8-a25c-e43230d5a0ea), [Delphi knowledge list](https://mobbin.com/screens/c905dd4a-4fd3-44c6-96d6-3eb99e583245) |
| obituary listing page with names, years and short descriptions in a list | [Cofounder transaction history](https://mobbin.com/screens/77dbe86b-4a7b-4150-9ba4-3bc1b3a58dfa), [Perplexity history: dense single-line rows, hairlines only](https://mobbin.com/screens/207e87e0-1bbe-4240-a4e1-51db64ff588c). No obituary page came back. |

21st.dev (`search`, components):

| Query | Top hits |
| --- | --- |
| editorial list | The three felipemenezes098 editorial heroes again; no list component. |
| data table minimal | [ruixen.ui Minimisable Table](https://21st.dev/@ruixen.ui/components/minimisable-table), [ephraimduncan Data Table](https://21st.dev/@ephraimduncan/components/table-05), [preetsuthar17 Basic Data Table](https://21st.dev/@preetsuthar17/components/basic-data-table) |

shadcn (CLI `view`): `@shadcn/table` (container that scrolls sideways, header row, hairline row borders, hover
tint, caption). `@shadcn/toggle-group` and `@shadcn/hover-card` were viewed in area 1; neither a grid/list switch
nor a hover preview was added (see NOTES).

### Measured and verified

- Homepage height at 375: 16,401 px before, see `after/04-index/home-375.jpg` for after. The index section alone is
  6,240 px at 375 and 3,653 px at 1280 (from the section screenshots).
- Index filters, probed in a browser: all 17 rows in 7 groups; "Dead" 6 rows in 5 groups; "Dead" + "Dot-com" 2 rows
  in 1 group; adding "Debt and buyouts" 0 rows and the empty note shows.
- All seven category pages open on a real image (read back from the built HTML: each `ph-img` holds a `<picture>`).
- The first `npm run check` failed: the electronics page had a dead `#src-16` link, because RadioShack's image
  caption carries a footnote. Footnotes in that caption now link to the brand page's sources. The re-run passed.

## 5. Original illustrations

### Research

Mobbin (`search_screens`, web):

| Query | Top hits |
| --- | --- |
| article page with hand-drawn spot illustrations placed inline between paragraphs | [GetYourGuide article](https://mobbin.com/screens/1e654ccf-6ad7-4821-8ea6-20b86cd353b8), [Mintlify docs](https://mobbin.com/screens/0009ec65-be9e-4065-ad21-9d6aef32d94c), [Microsoft Copilot document](https://mobbin.com/screens/295f5c48-ed5f-44a7-830a-490e0cfa0ab5). None has illustrations. |
| landing page section with ink line drawings in one accent colour on a plain background | [Microsoft Copilot experiments](https://mobbin.com/screens/c912dc52-284e-47e8-a25c-e43230d5a0ea), [Dropbox Dash](https://mobbin.com/screens/31a95e42-7374-4c6e-a4fb-39f1da438580), [Bloom: one object rendered in a single accent on a plain ground](https://mobbin.com/screens/9fd42782-3bf7-478d-9fa3-6fc5786ab57a) |

Mobbin has product UI, not editorial illustration; only the Bloom hit was usable.

21st.dev (`search`, components):

| Query | Top hits |
| --- | --- |
| hand drawn illustration | [adrielzimbril Doodle Callout](https://21st.dev/@adrielzimbril/components/doodle-callout), [pulkitxm Handwriting SVG](https://21st.dev/@pulkitxm/components/handwriting-svg), [dqnamo Animated Signature](https://21st.dev/@dqnamo/components/signature) |
| sketch annotation | [xubohuah Bubble Sketch](https://21st.dev/@xubohuah/components/bubble-sketch), [airbnb-visx Annotation](https://21st.dev/@airbnb-visx/components/annotation), [ruixen.ui Sketchpad Dropzone](https://21st.dev/@ruixen.ui/components/sketchpad-dropzone) |

shadcn (CLI `view`): `@shadcn/aspect-ratio` and `@shadcn/card`. Neither was used: the drawings now sit on the
page with no card and take their own proportions.

### Measured and verified

- 68 drawings in 17 brands go through `lib/sketch.mjs` at build time (counted by running it over every file).
- Source colours are gone from the built pages: `grep` for three of Circuit City's old fills in
  `dist/circuit-city/index.html` returns 0.
- Handwriting (Caveat) in drawings: the only labels left in any built brand page are "Because pets" and
  "can't drive!", inside the sock puppet's speech bubble. The other 20 handwritten notes are now plain small labels
  with the same words.
- Cost: the drawings grow from 105 KB to 659 KB of SVG in total, because hand-drawn lines and hatching are longer
  paths. Page HTML: Pets.com 204 KB to 244 KB (62 KB gzipped), Kiddie City 160 KB to 264 KB (70 KB gzipped),
  homepage 56 KB to 84 KB (23 KB gzipped).
- Screenshots reviewed at 1280 and 375: `docs/design-pass/after/05-illustrations/`. The first phone capture
  overflowed (a 24-column grid with gaps is wider than a phone); the phone layout was changed to two columns and
  the re-capture reported no layout problems.
- `npm run check` passed.

## 6. Section rhythm on brand pages

### Research

Mobbin (`search_screens`, web):

| Query | Top hits |
| --- | --- |
| longform article page with a full-width photograph between text sections and a large pull quote | [ZARA editorial wall](https://mobbin.com/screens/08deb7b1-447c-4f5c-88ce-aa31f3f3eebf), [AirOps Brand Kit: a full-width banner, then numbered sections](https://mobbin.com/screens/25153dfa-7e60-4232-abcf-463a8c52a4f0), [GetYourGuide article: photo between text blocks, progress line, contents rail](https://mobbin.com/screens/fa287971-5bec-46e6-9845-f398d4ba85c9) |
| scrollytelling story page with a sticky chapter navigation and reading progress bar | [Microsoft Copilot research report](https://mobbin.com/screens/d77fe48b-77a6-4da7-a14a-54d00682b7dc), [Telegram story viewer with segmented progress](https://mobbin.com/screens/fd061f59-bef4-4339-a176-8f51e0855ef2), [Descript transcript with a timeline of markers](https://mobbin.com/screens/b6ea2099-ac98-4570-a035-0f31b762a90b) |
| feature story layout with a dark section containing videos between light text sections | [Variant boards (dark)](https://mobbin.com/screens/cb345a4f-ff18-4a6e-b429-84a5f009a136), GetYourGuide article cards, [Microsoft Copilot story card](https://mobbin.com/screens/8f98a7e7-e9a9-4033-89e4-08f98e9481e1) |

21st.dev (`search`, components):

| Query | Top hits |
| --- | --- |
| scroll progress chapters | [cnippet-dev Scroll Progress](https://21st.dev/@cnippet-dev/components/scroll-progress), [designali-in Scroll Progress](https://21st.dev/@designali-in/components/scroll-progress-1), [ibelick Scroll Progress](https://21st.dev/@ibelick/components/scroll-progress) |
| longform article layout | [olewandowski1 Article With Author Sidebar](https://21st.dev/@olewandowski1/components/article-5); the other two hits were form layouts. |

shadcn (CLI `view`): `@shadcn/collapsible` and `@shadcn/accordion` (a trigger and a content region with an open
state; done here with native `<details>`), `@shadcn/progress` (an indicator scaled along a track; the act
progress line is six of them).

### Measured and verified

Full page height (`node scripts/measure.mjs`, viewport height 800):

| | 1280 | 375 |
| --- | --- | --- |
| Before, range across 17 brands | 28,039 to 39,437 px | 50,426 to 62,524 px |
| After, range | 27,297 to 36,908 px | 40,155 to 52,133 px |

Desktop length barely moved: the timeline is about 3,000 px shorter, but the act breaks add 170 to 715 px each
and the opener is taller because the images are larger. The length that remains is content (story, numbers,
gallery and sources are 2,000 to 4,300 px each at 1280). The phone is about 10,000 px shorter.

Probed in a browser on `/circuit-city/`:

- At 375 the People, Press and Data notes modules load closed (People section 371 px, Press 233 px) and open on tap.
  At 1280 they are open and have no summary row.
- The nav label read "Part 1 of 6" to "Part 6 of 6" at the six act starts, and the progress segments filled in
  order (for example at the start of part 4: `1.00 1.00 1.00 0.24 0.00 0.00`).
- Act breaks: Circuit City gets two photographs (before Business and before Verdict). Pets.com and Webvan get
  none, because they have no spare photograph 900 px or wider; their breaks are type only.
- `npm run check` passed.

## 7. Secondary modules (people, press, afterlife, key findings, numbers)

### Research

Mobbin (`search_screens`, web):

| Query | Top hits |
| --- | --- |
| team directory page listing people in a compact table with a small portrait, name, role and note | [Square team members](https://mobbin.com/screens/42858659-a933-4138-8494-a62a18d078d3), [Calendly organization directory: avatar and name, then role](https://mobbin.com/screens/4be5c2e5-5478-4b3d-97af-b4e0fbd288d7), [Klaviyo profiles table](https://mobbin.com/screens/c4006505-8637-4785-922e-d78471727183) |
| large pull quote set in serif type with the speaker name and source beneath | [ZARA lookbook](https://mobbin.com/screens/b1d5eb25-ab1f-4898-8e91-136f24093100), [Microsoft Copilot document](https://mobbin.com/screens/144f636f-ec65-497e-9319-32091b7c6593), [Delphi home](https://mobbin.com/screens/4fdc62c3-54d9-49b2-b97b-1d908d1333c9). No pull quote came back. |
| press coverage list with publication name, date and headline in rows | GetYourGuide article cards, [Klaviyo activity feed: who, what, when in rows](https://mobbin.com/screens/f509ead5-2779-4937-b9fd-b0ad4760ba5a), Microsoft Copilot stories |
| row of large key statistics as plain numbers with small captions and no cards | [Square key metrics (boxed)](https://mobbin.com/screens/5177a33a-3723-4681-ae9b-00fdde7ba677), [DoorDash Merchant cancellations: plain figures under small labels, no boxes](https://mobbin.com/screens/632bea0a-a4ed-4621-be98-b7a6b677b45f) |

21st.dev (`search`, components):

| Query | Top hits |
| --- | --- |
| testimonial editorial | [jatin-yadav05 Editorial Testimonial](https://21st.dev/@jatin-yadav05/components/editorial-testimonial), Editorial Hero, [uilayout testimonial](https://21st.dev/@uilayout.contact/components/testimonial) |
| pull quote | [designali-in dot-pattern quote](https://21st.dev/@designali-in/components/dot-pattern-1), [Astryx Blockquote: `<blockquote>` with a cited footer](https://21st.dev/@Astryxdesign/components/astryx-blockquote), [danielpetho Text Rotate](https://21st.dev/@danielpetho/components/text-rotate) |
| stat row | [originui Table](https://21st.dev/@originui/components/table), [rmahammad Streaming Data Rows](https://21st.dev/@rmahammad/components/streaming-data-rows), [Reshaped Table](https://21st.dev/@reshaped/components/reshaped-table) |

shadcn (CLI `view`): `@shadcn/item` (media, content, title, description: the anatomy of a roster row).
`@shadcn/separator` and `@shadcn/hover-card` were viewed in areas 3 and 1; rules separate the rows, and no hover
card was added.

### Verified

- Portraits (read back from the built HTML): Quibi has two (Katzenberg, Whitman) and Groupon one (Mason). No
  other brand has a licensed photograph of a person in its data, so the other 14 rosters have no portrait column.
- Screenshots reviewed at 1280 and 375: `docs/design-pass/after/07-modules/`.
- `npm run check` passed.

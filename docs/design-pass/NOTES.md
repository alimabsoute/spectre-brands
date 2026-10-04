# Design pass notes

References picked per area (one line each on why it fits), the approach taken, and gaps where the existing
data did not support what the brief asked for. Queries and raw results are in `docs/DESIGN_PASS_LOG.md`.

## 1. Timelines

References:

- **Basecamp Lineup** (Mobbin): a true time axis with gridlines and date ticks, items placed by date rather
  than in list order. The model for the proportional axis and the lanes.
- **Base ETH price chart** (Mobbin): a cursor line with a date readout, and range tabs (1H to All) that rescale
  the axis. The model for a year-range control that zooms the axis, with the selected point read out away from
  the marks. The draggable two-handle range itself follows `@shadcn/slider`.
- **shadcnspace Interactive Timeline** (21st.dev): choosing a point on a horizontal axis swaps one detail
  block in place. The model for the fixed panel, so the page never grows.

Approach: one lane per thread on a linear time axis, under a whole-life strip that carries the era bands and
the year range, with a fixed detail panel below. Rationale: the timelines are very uneven (Circuit City has
60 years and half its events in two of them), so a single axis at true scale is unreadable without zoom; an
overview plus a zoomed lane chart keeps the proportions honest and still lets every event be picked.

- The chart opens on the "busiest stretch": the shortest run of years that holds 60% of the events. "All years"
  and the era bands are one click away, and the range can be dragged or resized.
- Era bands come only from `company.json`: **Origins** (events before the first year in `years`), **Life**
  (first year in `years` to the `died` year) and **Afterlife** (after `died`). Each thread also draws a faint
  span from its first to its last event, so the brand's own "Death & estate" (or "Collapse", "Retreat") thread
  reads as a band.
- **Gap: no "peak" or "decline" band.** Nothing in the timeline data dates a peak, and the death thread is not a
  clean era (AOL's starts in 1997, Howard Johnson's in 1944). Deriving one would mean inventing a boundary.
- Dates in the data are free text ("Early 1994", "1930s", "FY 2002", "1999" + "Q4"). The build turns each into
  a position: a bare year sits at mid-year, a decade at its middle, an event with no year keeps the previous
  event's year, and source order is never reversed. The label shown is always the original text.
- Phone: the same chart without lane labels (the chips are the colour key), a 13.5rem panel, 44px previous /
  next buttons and swipe on the panel.
- Without JavaScript the chart is absent and the full list sits in a collapsed `<details>`; with JavaScript the
  same list stays available under "All N events as a list".
- Map link: selecting an event moves the map to the latest step at or before that date; stepping the map
  selects the nearest event. Each side has a text link to the other.

## 2. Real imagery

References:

- **ZARA editorial pages** (Mobbin): images of different sizes on a bare grid, no card, a small label under each.
  The model for the gallery rows.
- **GetYourGuide activity page** (Mobbin): one lead photograph at about two thirds of the width with the smaller
  ones stacked beside it. The model for the opener.
- **Image Preview / Zoomable Image** (21st.dev) with `@shadcn/dialog`: click a picture, see it large with a
  labelled close button. The model for the viewer.

Approach: the page opens on the strongest real image the brand has, at 8 of 12 columns, with the other archive
images beside it and a museum-style label (caption, then credit) under each. The gallery is rows of mixed sizes
with no card chrome; each picture's share of a row is its aspect ratio, so the pictures in a row share one height
and every row is full. Logos and other small marks sit below at their own size instead of being stretched.

- "Strongest" is a rule, not a new data field: photographs beat website captures, which beat logos; store, sign,
  ad and product photos get a bonus; anything under 600 px wide cannot lead. The rule is in `lib/media.mjs`.
- When none of the hero's three archive images is a photograph, the lead is taken from the gallery
  (a storefront or closing-sale photo). The gallery then leads with a different picture, so the same photo is
  not shown large twice.
- The brand drawing no longer sits in the hero when a real image exists. It still appears on cards and in the
  gallery until areas 4 and 5.
- Upright leads (Circuit City's closing-sale photo, the Zima bottle) are shown whole in 5 columns rather than
  cropped into a wide box, and the intro moves up beside them.
- **Gap: the source images are small.** Most are 640 to 1,000 px wide, so nothing is run full-bleed: a row never
  enlarges a picture by more than 30%, and Pets.com's gallery (a 640 px capture and a 320 px ad still) stays small.
- No mobile carousel: the rows wrap to one or two pictures per line, which keeps every label readable.

## 3. Homepage hero

References:

- **ZARA editorial wall** (Mobbin): pictures do the talking, type stays small and plain. The model for leading
  with artefacts instead of a headline-plus-buttons block.
- **GetYourGuide home** (Mobbin): one row of image tiles with only a name under each. The model for the stone
  and its two-line label.
- **Editorial Image Hero** (21st.dev): headline and copy share a row, the image carries the section, calls to
  action are secondary. Used for the headline/intro split, without its buttons.

Approach: a dated front page. A dateline (the counts and the date of the last update, both from the data), the
headline with the intro beside it, then a wall of every brand's strongest real image cropped as a headstone.

- The stones reuse the lead image chosen in area 2, so the wall and each brand page agree.
- Images are greyscale until hovered or focused, which makes 17 unrelated photographs and screenshots read as
  one wall. Ghost brands are faded and have a dashed outline; dead brands are solid. The label also says which.
- The featured brand (`site.json` "featured") gets a stone four times the size. With 17 brands the 7-column
  wall has one empty plot at the end; that changes as brands are added.
- The old stones drifted up and down and flipped on hover. Both are gone (float animation is on the banned list).
- The dateline uses the latest `published` / `updated` date in the data. It does not show today's date: the
  site is not a daily, and a client-side date would pretend it is.
- Phone: headline, then the wall as one swipeable row, then the intro and the link.

## 4. Index and category pages

References:

- **Klaviyo products table** (Mobbin): a small image, the name, a status and dated columns on one hairline row.
  The anatomy of a ledger row.
- **Semrush topics table** (Mobbin): numbers set in columns with a sparkline at the end of each row. The model
  for the key figure and trajectory columns.
- **Perplexity history** (Mobbin) with `@shadcn/table`: dense rows separated by hairlines only, no card, a quiet
  hover. The model for the density and the lack of chrome.

Approach: a ledger. One row per brand: logo (or real image), name, years, status, main cause, key figure and a
sparkline. Each category leads with one larger feature built on a real image, then its other brands as rows.
Rows span the full width, so a category with two brands is two lines, not a card and a hole.

- The feature in each category is the brand with the strongest real image (same rule as area 2).
- Rows use the logo named in `card.logo` where there is one (11 brands); the rest use their lead image, and
  Kiddie City its drawing.
- Category pages open on that same real image beside the title, then list every brand as a row with its blurb.
- "More post-mortems" at the foot of each brand page uses the same rows.
- The homepage "Featured post-mortem" block now shows the brand's real image instead of its drawing.
- The existing filters keep working unchanged: rows and features carry the same `data-*` attributes as the cards.
- Not added: a grid/list switch (one view is enough for 17 brands) and a hover preview (each row already shows
  the image).
- Phone: each row becomes three short lines (logo, name and status; cause and sparkline; key figure).

## 5. Original illustrations

References:

- **Bloom landing page** (Mobbin): one object drawn in a single accent colour on a plain ground. The model for
  "the brand accent plus near-black, no panel".
- **Bubble Sketch** (21st.dev): shapes drawn with a rough, wobbling outline rather than clean vectors. The same
  technique rough.js gives, which is already vendored here.
- **visx Annotation** (21st.dev): a plain small label tied to the thing it describes. The model for turning the
  handwritten notes inside drawings into quiet labels.

Approach: every drawing is traced again by hand at build time (`lib/sketch.mjs`). The source SVGs are untouched.
The vendored rough.js generator re-draws each shape with a wobbling pen line; colour is reduced to near-black ink,
the brand accent (hatched on large areas, solid on small ones and behind lettering) and paper white. The quality
bar was the Pets.com sock puppet: it keeps its shapes and its speech bubble and gains the same line as the rest.

- Nothing is redrawn or added: geometry and wording come from the existing files, so no trademarked character is
  drawn that was not already an original drawing.
- No tinted panels: the pastel cards behind drawings are gone in the hero, the story, the gallery and the
  "then and now" slider.
- Varied scale: the gallery drawings stand on one line at different widths (8, 5, 6 and 5 of 24 columns) with
  their labels under a rule, instead of four equal pink cards. Story drawings alternate between a large and a
  small size from chapter to chapter.
- Handwriting stays only inside drawn speech bubbles. The rule in code is "bold Caveat lettering is a speech
  bubble"; that matches the one bubble in the current art (the sock puppet) and would need a real marker if
  more bubbles are drawn.
- The idle float, bob, drive and fizz animations on the hero drawing are removed, as is the drifting ghost icon.
- **Gap: drawings are not moved into the story.** The gallery drawings have no link to a story chapter in the
  data, so placing them beside particular paragraphs would mean inventing that link. Chapters that already name
  a drawing keep it inline.
- Done at build time rather than in the browser, so the hand-made line shows without JavaScript and costs no
  runtime work. The cost is page weight (see the log).

## 6. Section rhythm on brand pages

References:

- **AirOps Brand Kit** (Mobbin): a full-width image band, then numbered sections with the number in the margin.
  The model for the act break: photograph, "Part 2 of 6", the act name, what is in it.
- **GetYourGuide article** (Mobbin): a photograph between runs of text and a progress line under the header.
  The model for image breaks and for keeping the progress line.
- **Telegram story viewer** (Mobbin) with `@shadcn/progress`: progress cut into segments, one per part.
  The model for the act indicator in the sticky nav.

Approach: the page is in acts (the six nav groups). Each act after the first opens with a break; two of them
carry a full-bleed photograph. Between breaks the sections change register instead of repeating one template.

- **Dark room:** the footage section is the only dark section on the page.
- **Wide spread:** a quote that stands alone as a block runs large between two rules across the full width.
- **Narrow column:** Cause of death and What if are text-led, so they sit in a 58rem column.
- **Rules, not cards:** charts, tables, the chapter figures, the versus columns and the what-if panels lose their
  border, radius and shadow; a rule above each does the job.
- **Folded on a phone:** People, Press and Data notes load closed at 700 px and below (a tap opens them). They
  stay open on larger screens and when JavaScript is off.
- **Act indicator:** the progress line in the sticky nav has one segment per act, and the nav reads
  "Part 3 of 6" beside the section name.
- Photographs for breaks must be 900 px wide or more and not already leading the page. Only two per page, at the
  first and last act headers, so the same few photographs are not repeated a third time. An act with a single
  section (Sources) gets no header.
- **Gap:** brands without a spare large photograph (Pets.com, Webvan and others) get type-only act breaks.
- **Not done:** the page is not much shorter on desktop. The remaining length is content, and cutting it is
  outside "presentation only".

## 7. Secondary modules

References:

- **Calendly organization directory** (Mobbin) with `@shadcn/item`: a small portrait and name, then role, on one
  row. The model for the roster.
- **Astryx Blockquote** and **Editorial Testimonial** (21st.dev): a quote set large with its citation beneath,
  and nothing else. Used for the lead quotes, without the testimonial furniture (stars, avatars, cards).
- **DoorDash Merchant figures** (Mobbin): numbers under small labels with no boxes around them. The model for
  the numbers row.

What changed:

- **Who ran it** is a roster table: name and role, what they did, afterwards. A portrait is shown only where
  the gallery already has a licensed photograph whose file is named for that person; the credit is printed under
  the table. That is three people across two brands today.
- **What they said**: the one or two quotes marked `big` in the data run large; the rest are a clippings list
  with the source and date first and the quote beside it. If no quote is marked, the first one leads.
- **Afterlife** is a "where the pieces went" diagram: the brand is the trunk and each piece branches off it
  with what became of it. No coloured dots; the status is plain text after an arrow.
- **Key findings**: numbered prose with plain serif numerals, no circles.
- **Numbers**: a typographic row under one rule. No cell borders or dividers.
- **Gap: the clippings are not sorted by date.** The date is part of each quote's free-text attribution, so it
  is shown but cannot be sorted or set in its own column without editing the data.
- **Gap: portraits.** `people.json` has no image field. Matching by file name is a stopgap that only finds the
  three photographs already in galleries.

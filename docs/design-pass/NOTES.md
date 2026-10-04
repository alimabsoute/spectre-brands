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

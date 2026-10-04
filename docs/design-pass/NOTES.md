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

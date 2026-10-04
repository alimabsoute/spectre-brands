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

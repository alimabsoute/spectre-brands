# Design research and the design system

What was looked at, what was taken from each source, and the design system that came out of it.
The raw notes, with every URL and whether the page was actually fetched, are in
[DESIGN_RESEARCH_NOTES.md](DESIGN_RESEARCH_NOTES.md).

## 1. Tools and skills actually used in this run

| Tool | Status | What it was used for |
|---|---|---|
| shadcn MCP | available, used | Listed the `@shadcn` registry (61 `ui` items, 78 chart items) and inspected `command`, `hover-card` and `tabs`. |
| Mobbin MCP | **not configured on this machine** | Replaced by public-web research (section 3). See section 6 for the follow-up list. |
| 21st.dev Magic MCP | **not configured on this machine** | Replaced by public pages of 21st.dev, Magic UI and Aceternity UI (section 4). See section 6. |
| `design:design-critique` skill | used | Structure of the audit in DESIGN_AUDIT.md and of the final polish review. |
| `design:accessibility-review` skill | used | WCAG 2.1 AA checklist in the audit and in the QA pass. |
| `design:design-system` skill | used | Token audit in the polish pass (hard-coded values, naming). |
| impeccable / polish / frontend-design skills | not installed | Their principles were applied by hand: one type scale, one spacing scale, clear hierarchy, no template tells. |

## 2. shadcn registry: what was taken

The site is static HTML with no React, so nothing could be installed with `npx shadcn add`. The registry
was used as a specification: which primitives exist, how they behave, and which ARIA patterns they follow.
Each one below is re-implemented in plain HTML, CSS and a few lines of JavaScript.

| shadcn item | Where it is used here | How it was re-implemented |
|---|---|---|
| `command` (cmdk) | Site search, opened with `/` or Ctrl/Cmd+K | Native `<dialog>` + a listbox; filtered from a build-time `search.json`; arrow keys, Enter, Esc. |
| `navigation-menu` / `dropdown-menu` | Categories menu, grouped section menu | Disclosure buttons with `aria-expanded`, closing on Esc and outside click (WAI-ARIA disclosure navigation). |
| `tabs` | Archived website captures, what-if forks | `role="tablist"` with roving `tabindex`, arrow keys, Home and End. |
| `accordion` / `collapsible` | Cause of death, "Data table" under every chart | Buttons with `aria-expanded` and `aria-controls`; native `<details>` for data tables. |
| `tooltip` / `hover-card` | Values on infographic marks | One shared tooltip element positioned on pointer move and tap. |
| `badge` | Dead / Ghost tags, status tags | `.tag` with a shape difference (filled vs outlined with a ghost glyph), not colour alone. |
| `toggle-group` | Chart view switch, filter chips | Buttons with `aria-pressed`. |
| `scroll-area` | Wide tables, capture strip | Native overflow with a focusable, labelled region. |
| `slider` | Then-vs-now comparison | A real `<input type="range">` over two clipped layers, so it works with a keyboard. |
| `dialog` | Search | Native `<dialog>` with `showModal()` (focus trap and Esc for free). |
| `card`, `separator`, `breadcrumb`, `kbd` | Brand cards, hairlines, breadcrumb, shortcut hint | Plain CSS. |
| `carousel` | Not used | A grid reads better than a carousel for six videos; nothing is hidden behind a swipe. |
| `chart` blocks (area, bar, line, pie with labels) | Reference for labelled charts | Charts stay on Chart.js for the existing figures; new infographics are build-time SVG. |

## 3. Pattern references (the Mobbin-equivalent pass, from public pages)

| Source | What was taken |
|---|---|
| The Pudding homepage (pudding.cool) | An index where every piece has a one-line hook and a row of filter chips with "All" first. Became the homepage index, its chips and the card blurbs. |
| The Pudding, "Responsive scrollytelling best practices" and "How to implement scrollytelling" | Stack static graphics on small screens unless the transition itself carries meaning; do not size steps in `vh`. This is why the story section is now one row per chapter with its own visual, instead of a single sticky stage driven by scroll position. |
| Scrollama (github.com/russellsamora/scrollama) | Confirmed that the old sticky stage could be rebuilt with `position: sticky` and one IntersectionObserver. Rejected in favour of per-chapter rows, which cannot leave an empty half-screen. |
| Rest of World (restofworld.org) | Two badges per card (beat and region). Here: tier and category on every card, plus the cause of death. |
| Stripe Press (press.stripe.com) | Restraint: off-white ground, one accent per title, serif display type. Became the surface tokens and the per-brand accent. |
| FT Visual Vocabulary (github.com/Financial-Times/chart-doctor) | Pick the chart by the relationship shown: change over time (line), part-to-whole (waffle, stacked bar), flow (Sankey), ranking (bars). Used to choose the infographic kinds. |
| Datawrapper, "Text in data visualizations" | The title states the finding; series are labelled directly; a grey source line sits under every figure. Applied to every chart and infographic. |
| d3-annotation (subject, connector, note) | Numbered markers on the line with the notes listed underneath, which survive a 375 px screen where callout boxes do not. |
| Mapbox storytelling template | A map driven by a list of steps. The existing map already worked this way; it was kept and restyled. |
| WAI-ARIA Authoring Practices, disclosure navigation | The Categories menu and the section menu. |
| cmdk (github.com/pacocoursey/cmdk) | Search behaviour: one input, a ranked list, arrow keys. |
| Mobbin | Direct fetches returned 403. Only search-result snippets were seen, so nothing is attributed to it. |

## 4. Component references (the 21st.dev-equivalent pass, from public pages)

| Need | Reference | What was built |
|---|---|---|
| Stat counters | Magic UI "Number Ticker" | `[data-count]`: counts up once when 60% visible, eased, keeps prefix and suffix, skips years, off under reduced motion. |
| Then vs now | Aceternity "Compare"; `img-comparison-slider` | `compare` block: two layers, `clip-path: inset()` driven by a range input. |
| Video cards | `lite-youtube-embed`; Magic UI "Hero Video Dialog" | `.vid-frame`: thumbnail and play button; the iframe (youtube-nocookie.com or archive.org) is created on click. |
| Card hover | Aceternity "3D Card", `vanilla-tilt.js` | Lift and a 1.5° rotate of the drawing on hover; ghost-tier cards fade the drawing. Kept far below the libraries' default tilt. |
| Flip card | MDN `backface-visibility` | Homepage headstones that flip to show the years (hover and keyboard focus). |
| Timeline | Aceternity "Timeline" | Date column, spine and dot per event; filter chips by thread. |
| Tooltips | Aceternity "Animated Tooltip" | A plain tooltip, without the spring. |
| Page transitions | MDN View Transition API | `@view-transition { navigation: auto }` and a shared `view-transition-name` on each brand's drawing and title. |
| Scroll-linked motion | MDN scroll-driven animations | Drawings slide in with `animation-timeline: view()` where supported. |
| Logo marquee | Magic UI "Marquee" | **Not used.** A row of drifting third-party logos is decoration and raises a trademark question; the headstone grid does the job with type only. |
| Hero parallax | Aceternity "Hero Parallax" | Not used; too much motion for an index page. |
| 21st.dev | Landing and community listing only | Category counts and component names were visible; no component source was opened, so nothing is attributed to it. |

## 5. The design system

All tokens are in one file: `assets/css/tokens.css`. No other stylesheet defines a colour, size, radius,
shadow or duration.

**Surfaces.** Page `#FCFBF8`, cards `#FFFFFF`, hairlines `#E8E6E1` (stronger rule `#D6D3CC`), wash `#F5F4F0`
for hover states. No cream, tan or paper texture.

**Ink.** `#16161A` text, `#3B3B42` secondary, `#63636B` muted (5.8:1 on the page colour).

**Accent.** One per brand, sampled from the brand's real palette and set as `--brand` on the page; a pale
tint `--brand-soft` backs the illustrations. The site's own accent is `#B3261E`.

**Chart palette.** Red `#C2412D`, blue `#3B6EA8`, green `#3F8A5A`, gold `#A9781F`, plum `#7B5EA7`, teal
`#2C8C8C`, grey `#8B8B94`. Marks never rely on colour alone: values are printed, line series use different
point shapes or dashes, and waffle cells carry a different hatch per category.

**Map pins.** The pastel pin palette is unchanged (`--pin-a` to `--pin-e` with a darker outline each); the land
fill is now neutral grey `#ECEBE7`.

**Type.** Source Serif 4 for body copy, headlines and figures; Inter for interface, labels, captions and
data; Caveat only for the hand-drawn notes on maps and charts. All self-hosted. Scale (rem): 0.75, 0.8125,
0.9375, 1.125 (body), 1.3125, 1.625, then fluid 1.75–2.5, 2.25–3.75 and 2.75–5.25 for h2, page titles and
brand names. No italics for emphasis, no letter-spaced capitals.

**Spacing.** A 4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96. Sections are 64 px apart (48 px on mobile), cards
24 px. Text measure 42 rem; page width 1160 px.

**Shape.** Radius 4 px (controls), 10 px (cards), 16 px (feature cards), pill for chips and buttons.
Three shadows, all neutral.

**Motion.** Primary technique: CSS transitions and keyframes, with IntersectionObserver adding one class.
No animation library. Durations 150, 300, 600 and 1100 ms on one easing curve. Everything non-essential
stops under `prefers-reduced-motion`.

**Components.** Brand card, tag, chip, button, counter row, figure card (chart or infographic with source
line and data table), chapter row, video facade, tabs, accordion, tooltip, command palette.

## 6. Gaps: Mobbin and 21st.dev MCP not available in this run

Neither MCP was configured here, and no keys were sought. A follow-up pass on a machine that has them
should look up the following and compare with what was built.

**Mobbin MCP**
1. Editorial longform article screens (web): heading scale, measure, pull quotes, figure captions.
2. Data-story screens with a sticky graphic, and how they collapse on iOS.
3. Timeline patterns: vertical with a spine versus horizontal scrubber; which apps use a draggable range.
4. Map screens with pins and a detail card (store locators, travel apps): pin states, selected state, list pairing.
5. Category browsing with card rows and "see all" links.
6. Filter bars with several chip groups on mobile (overflow scroll versus a filter sheet).
7. Search overlays and command palettes: empty state, recent items, result grouping.
8. Mobile navigation for content sites: sheet versus full-screen menu.
9. Homepage heroes for editorial indexes and archives.
10. "On this day" and anniversary modules.
11. Image comparison (before/after) interactions and their handles.
12. Video galleries with inline play versus lightbox.

**21st.dev Magic MCP**
1. "Image Compare": check handle design and touch behaviour against the `compare` block.
2. "Timeline" and "Brush Chart": a scrubber for the map timeline with a draggable range.
3. "Scroll media expansion hero" and "Container Scroll Animation": a candidate for the homepage hero.
4. Number ticker variants with a slot-machine roll.
5. "Hover Card": richer previews for footnote links (source title on hover).
6. "Spotlight Card": a cursor-following highlight for brand cards.
7. Category filter chips with a sliding active indicator.
8. Video embed cards with a lightbox.
9. Annotation and callout components for charts.
10. Sankey and waffle chart components, to compare with the build-time SVG versions.

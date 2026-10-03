# Research notes: pattern and component references

Date: 2026-10-03. Scope: public web pages only (Mobbin MCP and 21st.dev Magic MCP were not available).
Target stack: plain HTML/CSS/vanilla JS emitted by a Node build script. No React.

## How to read this file

- **[F]** = page was fetched and summarised in this pass. **[S]** = seen only as a search result (title/snippet); not opened.
- Fetches go through a text-only summariser: no screenshots, no rendered JS, no visual inspection. Anything about
  colour, spacing or motion feel is therefore NOT verified here. Treat structural notes as reliable, visual ones as unverified.
- "Vanilla idea" lines are my own re-implementation suggestions, not claims about how the source site is built.

### Could not be fetched (do not rely on descriptions of these)

| URL | Result |
|---|---|
| https://mobbin.com/explore/web | HTTP 403 |
| https://mobbin.com/glossary | HTTP 403 |
| https://mobbin.com/glossary/chip | HTTP 403 |
| https://www.bloomberg.com/graphics/ | HTTP 403 |
| https://www.reuters.com/graphics/ | fetch tool refused the domain |
| https://ig.ft.com/ | fetch tool refused the domain |
| https://timeline.knightlab.com/ | HTTP 403 |
| https://reuters-graphics.github.io/graphics-components/ | JS-only Storybook shell; only the title came back |

NYT graphics pages were not attempted. FT, Bloomberg, NYT and Reuters longform layouts are consequently NOT covered
first-hand below; the FT entry is its public chart-selection repo, not an article page.

---

## Part A: real-world pattern references (Mobbin-equivalent)

### A1. Editorial longform and index layouts

1. **The Pudding homepage** [F] https://pudding.cool/
   An index that is a numbered archive: each card carries thumbnail, issue number + month/year ("#224 Aug 2026"), a short
   title and a one-line tagline. Filter chips above the grid: All / Our Faves / Popular / Updating / Your Input / Video /
   Audio, plus a search icon and a "Load More Stories" button.
   Borrow: number every post-mortem (case file no.) and use a one-line "cause of death" tagline on each card; chips that
   mix editorial picks (Faves, Popular) with format (Video).

2. **The Pudding, "Are Pop Lyrics Getting More Repetitive?"** [F] https://pudding.cool/2017/05/song-repetition/
   Single narrow text column with charts interleaved at the point in the argument where they are needed, building from
   distribution to time series to per-artist comparison. Each chart has an explanatory caption, and scale choices are
   justified in prose. One searchable dropdown lets the reader explore a single artist.
   Borrow: chart-per-claim sequencing, and one "pick your own" explorer per article at most.

3. **Rest of World homepage** [F] https://restofworld.org/
   One lead story with a large image and a read-time ("3 min read"), then stacked cards with thumbnail, category label,
   headline, read time and byline. Two parallel taxonomies are exposed in nav: beats (Tech Giants, EV Revolution, ...)
   and regions (Africa, Asia, ...), and every card is badged with both. Named section bands ("Features") divide the page.
   Borrow: dual taxonomy on every card. For Spectre: industry (retail, dot-com, ...) plus failure mode (debt, fraud,
   disruption, ...). Read time on every card.

4. **Rest of World article page** [F] https://restofworld.org/2023/3-minutes-with/
   Series label above the headline linking to the series index, region tag, byline + date, single reading column, and a
   three-card related-stories row at the foot (thumbnail + author).
   Borrow: series/category kicker as a link above H1; exactly three related cards at the end.

5. **Stripe Press** [F] https://press.stripe.com/
   The fetched text is a single long catalogue: per title there is author, a 2-3 sentence description, purchase links,
   author bio and 3-5 attributed blockquote praise items. The known 3D bookshelf presentation is JS-rendered and was NOT
   visible to the fetch, so it is not described here.
   Borrow (structural only): consistent per-item record with identical field order; attributed quotes as blockquotes.

6. **FT Visual Vocabulary** [F] https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
   Nine data-relationship categories (deviation, correlation, ranking, distribution, change over time, magnitude,
   part-to-whole, spatial, flow) used to pick a chart form. Change over time: line as the standard, plus column, slope,
   area, fan. Magnitude: columns/bars that must start at zero, lollipop, proportional symbol.
   Borrow: a build-time rule that each chart in a post declares its relationship type, which constrains allowed forms
   (stock price = line; store counts by year = column from zero; peak vs final valuation = slope).

### A2. Scrollytelling with a sticky visual

7. **The Pudding, "Responsive scrollytelling best practices"** [F] https://pudding.cool/process/responsive-scrollytelling/
   Two mobile strategies: "keep scrolly" (only when the transition itself carries meaning) or "stack charts" (static,
   simplified charts in normal flow, chosen for performance, standalone legibility or build speed). Do not size steps in
   `vh`; compute px from `window.innerHeight` on load/resize because mobile browser chrome resizes the viewport mid-scroll.
   Use `matchMedia()` so JS and CSS agree on the breakpoint. Replace hover with fixed annotations on mobile. Split chart
   setup from draw so resize updates rather than rebuilds.
   Borrow: default to stacked static figures below the breakpoint; keep scrolly only for the timeline.

8. **The Pudding, "How to implement scrollytelling"** [F] https://pudding.cool/process/how-to-implement-scrollytelling/
   Defines the pattern as observing scroll, never hijacking it. Text steps carry data attributes and fire at the viewport
   midpoint; the graphic has three states (in flow, fixed, pinned to section bottom). Older article: the library
   comparison (Waypoints, ScrollMagic, graph-scroll) predates `position: sticky` + IntersectionObserver.
   Borrow: the markup contract (`<section class="scrolly"><figure class="sticky">..</figure><div class="steps"><div
   class="step" data-step="1">`), not the libraries.

9. **Scrollama** [F] https://github.com/russellsamora/scrollama
   IntersectionObserver-based step detection. `setup({step, offset})`, callbacks `onStepEnter`, `onStepExit`,
   `onStepProgress` (0-1), per-step `data-offset` in fraction or px. Documents two layouts, both plain
   `position: sticky`: side-by-side (text column beside a stuck graphic) and overlay (full-bleed graphic, text cards
   scrolling over it). Recommends px offsets on mobile so the trigger line does not jump on direction change.
   Vanilla idea: about 30 lines without the library. One IntersectionObserver with
   `rootMargin: "-50% 0px -50% 0px"` on `.step`; on intersect set `figure.dataset.active = step.dataset.step`; CSS does
   the rest via `[data-active="2"] .layer-2 { opacity: 1 }`. Side-by-side at >= 900px, overlay cards below.

### A3. Charts with annotations

10. **d3-annotation** [F] https://d3-annotation.susielu.com/
    Annotation anatomy is subject (the thing marked: point, circle, rect, threshold line), connector (straight, elbow or
    curve, optional dot/arrow end) and note (wrapped title + label). Presets: label, callout, elbow, curve, circle,
    rect, threshold, badge.
    Borrow: the vocabulary as a data schema, e.g. `{type:"threshold", x:"2000-11", note:{title, label}, dx, dy}`,
    rendered to inline SVG at build time. Threshold lines suit "IPO", "Chapter 11 filing"; badges suit numbered events
    cross-referenced in body text.

11. **Datawrapper, "Text in data visualizations"** [F] https://www.datawrapper.de/blog/text-in-data-visualizations
    Titles in conversational language that state the finding; technical terms pushed to notes. Label series directly on
    the chart instead of using a colour key. About two levels of text hierarchy; sources and notes small, light, grey.
    Borrow: chart title = the claim; mandatory source line under every figure, styled as the lowest tier. This fits a
    sourced post-mortem site directly.

### A4. Timelines and annotated maps

12. **Mapbox storytelling template** [F] https://github.com/mapbox/storytelling
    A config-driven scrolly map: an array of chapters, each with centre, zoom, pitch, bearing, text alignment (left,
    center, right, full) and `onChapterEnter` / `onChapterExit` arrays that set layer opacity. Uses Scrollama; alignment
    falls back to center under 750px wide. Optional marker per chapter; byline and footer slots. Static hosting only.
    Borrow: the chapter-config shape for store-footprint stories (RadioShack store counts by year). A token-free version
    is an inline SVG map with per-chapter `viewBox` and layer opacity.

13. **Aceternity Timeline** [F] https://ui.aceternity.com/components/timeline (also listed under Part B)
    Vertical timeline whose date label sticks on the left while that entry's content scrolls on the right, with a
    progress beam that fills along the spine as you scroll. Mobile behaviour is not documented on the page.

    Knight Lab TimelineJS (slide + scrubber pattern) could not be fetched (403); not described.

### A5. Browsing, filters, search, navigation

14. **Mobbin (search results only; all direct fetches returned 403)**
    - [S] https://mobbin.com/glossary/chip : snippet defines chips as compact pill elements for input, attribute or
      action, short text, used in sets rather than alone.
    - [S] https://mobbin.com/glossary/command-palette : snippet frames it as fast keystroke access to commands, and notes
      chips inside a palette for tag selection and filtering.
    - [S] https://mobbin.com/explore/web/screens/browse-discover , /screens/home , /screens/search ,
      https://mobbin.com/explore/web/flows/searching-finding , https://mobbin.com/explore/mobile/flows/filtering-sorting ,
      https://mobbin.com/explore/mobile/screens/timeline-history : collection pages exist under these slugs.
    - [S] https://mobbin.com/changelog : snippet mentions "Mobbin Sites" with Section filters (Hero, Features, Pricing)
      and Style filters (Brutalist, Editorial, Minimal). The "Editorial" style filter is the most relevant entry point.
    Nothing on Mobbin was viewed. No claim is made about what those collections contain.

15. **cmdk** [F] https://github.com/pacocoursey/cmdk
    Anatomy: root, input, list, group (with heading; hidden when it has no matches), item, empty state, optional dialog
    wrapper. Items take keywords as search aliases; a custom filter returns a rank score. The library does not bind
    Cmd+K itself. State is exposed as attributes (`[cmdk-item][data-selected]`). List height animates through a
    `--cmdk-list-height` variable.
    Vanilla idea: native `<dialog>` + `showModal()`, input with `role="combobox"` and `aria-activedescendant`, list with
    `role="listbox"`. Build script emits `search.json` (title, slug, years, industry, failure mode, aliases); lazy-fetch
    it on first open. Groups: Brands / Categories / Pages. Bind Cmd/Ctrl+K and `/`.

16. **WAI-ARIA APG disclosure navigation** [F] https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
    Site nav as buttons with `aria-expanded` + `aria-controls` toggling plain lists of links; Escape closes; explicitly
    not `role="menu"`, since site navigation does not need menu-widget keyboard semantics.
    Borrow: mobile nav as one disclosure button revealing a full-height link list (or a `<dialog>`), no ARIA menu roles.

---

## Part B: component references (21st.dev-equivalent)

Source pages are React/Tailwind/Motion. Notes give the mechanism and a vanilla equivalent.

| # | Need | Reference | What the page shows | Vanilla re-implementation |
|---|---|---|---|---|
| 1 | Number ticker | [F] https://magicui.design/docs/components/number-ticker and source https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/registry/magicui/number-ticker.tsx | Props value, startValue, direction, delay, decimalPlaces. Source: in-view once, spring (damping 60, stiffness 100), writes `textContent` through `Intl.NumberFormat("en-US")`. | IntersectionObserver (once) + `requestAnimationFrame` with ease-out over ~1.2s; format with `Intl.NumberFormat`. Server-render the final value in HTML so no-JS and reduced-motion show the real number. Add `font-variant-numeric: tabular-nums`. |
| 2 | Logo marquee | [F] https://magicui.design/docs/components/marquee and source `.../registry/magicui/marquee.tsx` | Wrapper `flex overflow-hidden` with `--duration:40s`, `--gap:1rem`; children duplicated `repeat` (default 4) times, each copy animated; `pauseOnHover`, `reverse`, `vertical`. | Emit the logo row twice at build time (second copy `aria-hidden`). `@keyframes marquee { to { transform: translateX(calc(-100% - var(--gap))) } }` on each copy. `:hover` sets `animation-play-state: paused`. Disable under reduced motion. Good for a "graveyard" strip of dead-brand logos. |
| 3 | Then vs now slider | [F] https://ui.aceternity.com/components/compare | Props slideMode (hover or drag), initialSliderPercentage, showHandlebar, autoplay, autoplayDuration. Clip mechanism not shown on the page. | Two stacked images; top one gets `clip-path: inset(0 calc(100% - var(--pos)) 0 0)`. Drive `--pos` from a visually-hidden full-width `<input type="range">`, which gives keyboard and touch support for free. |
| 4 | Then vs now slider (drop-in) | [F] https://github.com/sneas/img-comparison-slider | Web component: `<img-comparison-slider><img slot="first"><img slot="second"></img-comparison-slider>`. Attributes value, hover, direction, keyboard; custom handle slot; CSS vars `--divider-width`, `--divider-color`; under 12 kB. | Framework-free, usable as-is if a dependency is acceptable; otherwise row 3. Use for archived homepage capture vs final/"closing" page. |
| 5 | Video card with lazy facade | [F] https://github.com/paulirish/lite-youtube-embed | Custom element `<lite-youtube videoid playlabel params>`; poster thumbnail as background; iframe injected only on click; youtube-nocookie.com; no-JS fallback is a link inside the element. | Use directly (vanilla custom element) or hand-roll: `<a>` to the video wrapping a local poster `<img loading="lazy">` and a play button; on click replace with the iframe (`autoplay=1`). Self-host the poster to avoid a third-party request before consent. |
| 6 | Video in hero | [F] https://magicui.design/docs/components/hero-video-dialog | Thumbnail + play button opens a modal with the iframe; eight entrance styles (from-center, fade, from-bottom, ...). | Native `<dialog>`; create the iframe on open and remove it on close so audio stops. |
| 7 | Card hover tilt | [F] https://ui.aceternity.com/components/3d-card-effect | CardContainer / CardBody / CardItem; pointer position maps to rotateX/rotateY; children carry their own translateZ; resets on leave. | `perspective: 1000px` on the wrapper; on `pointermove` set `--rx`, `--ry` from normalised pointer offset (max about 6 deg); `transform-style: preserve-3d`; children use `translateZ()`. Gate with `@media (hover:hover) and (pointer:fine)`. |
| 8 | Card hover tilt (library) | [F] https://github.com/micku7zu/vanilla-tilt.js | Dependency-free, about 8.5 kB. Options max (15), perspective (1000), scale, speed (300), glare, gyroscope, reset. | Reference for defaults. For an editorial site keep max well below 15 and leave glare and gyroscope off. |
| 9 | Card grid focus | [F] https://ui.aceternity.com/components/focus-cards | Hovering one card keeps it sharp while siblings blur. | Pure CSS: `.grid:has(.card:hover) .card:not(:hover) { filter: blur(2px); opacity: .7 }`. Also trigger on `:focus-within`. |
| 10 | Sliding hover highlight | [F] https://ui.aceternity.com/components/card-hover-effect | One highlight background slides between hovered cards (Motion `layoutId`). | One absolutely positioned highlight element per grid; on `pointerenter` copy the card's `offsetLeft/Top/Width/Height` into CSS vars and transition `transform`/size. Also works for the active filter chip. |
| 11 | Timeline | [F] https://ui.aceternity.com/components/timeline | `data: {title, content}[]`; sticky label left, content right, scroll-progress beam. | Each entry is a 2-column grid; year label `position: sticky; top: 6rem`. Beam: a spine element with `transform: scaleY(var(--p))`, `--p` from a scroll listener, or CSS `animation-timeline: view()` where supported. |
| 12 | Sticky scrolly section | [F] https://ui.aceternity.com/components/sticky-scroll-reveal | Text reveals on scroll beside a sticky container; props `content[]`, `contentClassName`. Layout and mobile behaviour not shown on the page. | See A2 item 9. |
| 13 | Animated hero | [F] https://ui.aceternity.com/components/hero-parallax | Header text above rows of thumbnail cards that translate in opposite directions on scroll, with an initial rotateX/opacity intro. | Rows of brand cards with `translateX` bound to scroll progress via `animation-timeline: scroll()`, static grid as fallback. Likely too showy for a sourced editorial index; consider a single restrained row. |
| 14 | Annotation tooltip | [F] https://ui.aceternity.com/components/animated-tooltip | Tooltip on hover that follows the pointer with a spring rotate/translate; items are id, name, designation, image. | For footnote/source popovers use the Popover API (`popover` + `popovertarget`) on a button so it works on tap and keyboard. Hover-follow is decoration only. |
| 15 | 3D flip card | [F] https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility | `backface-visibility: hidden` on faces, `transform-style: preserve-3d` + `perspective` on the parent, back face pre-rotated `rotateY(180deg)`. No effect with 2D transforms. | Make the card a `<button aria-pressed>` toggling a class that rotates the inner wrapper 180deg; set `inert` on the hidden face. Use: brand logo front, "cause of death" + years back. Cross-fade under reduced motion. |
| 16 | Command palette | [F] https://github.com/pacocoursey/cmdk | See A5 item 15. | See A5 item 15. |
| 17 | Page transitions | [F] https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using | Cross-document transitions are CSS-only opt-in: `@view-transition { navigation: auto; }` in both pages, same-origin only. `view-transition-name` pairs elements; `::view-transition-old/new(name)` customise; `pageswap` / `pagereveal` events for per-navigation names. | Put the at-rule in the shared stylesheet. Build script emits `style="view-transition-name: brand-<slug>"` on the card image and on the article hero so the image morphs from index to article. Names must be unique per page. Wrap in `prefers-reduced-motion: no-preference`. |
| 18 | Scroll-linked effects | [F] https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations | `animation-timeline: scroll()` / `view()`, `animation-range` with entry/cover/exit ranges, named timelines. | Reading-progress bar and reveal-on-enter with no JS, behind `@supports (animation-timeline: view())`. The fetched summary called support outside Chromium partial; verify current Firefox/Safari support before relying on it, and ensure content is visible by default. |
| 19 | Category chips | [F] https://pudding.cool/ (live example); [S] https://mobbin.com/glossary/chip | Pudding: single row, "All" first, mixes curated and format filters. | Chips as real links to pre-built category pages (`/category/retail/`) so filtering works without JS, then enhance: intercept clicks, toggle `hidden` on cards by `data-*`, update the URL with `history.replaceState`, set `aria-current`/`aria-pressed`. Horizontal scroll with `scroll-snap` on mobile. |

**21st.dev** [F] https://21st.dev/ and https://21st.dev/community/components : the landing page describes a registry of
"12,000+" React/Tailwind components, templates and shadcn themes. The community listing returned only partial content:
category counts (Heroes 1,152; Cards 1,780; Navigation Menus 477; Texts 663; Buttons 2,043) and a few names. Popular:
"Scroll media expansion hero", "Container Scroll Animation", "Spotlight Card". Newest: "Timeline", "Image Compare",
"Brush Chart", "Line Chart", "Activity Heatmap", "Hover Card". Individual component pages and source were NOT opened, so
no implementation detail is claimed for them. "Scroll media expansion hero", "Image Compare", "Timeline" and "Brush
Chart" (a draggable range under a chart, i.e. a timeline scrubber) are the ones to pull through the MCP.

**Timeline scrubber**: no public page fetched in this pass documents one. Suggested vanilla build, unreferenced:
`<input type="range">` over the year span with a `<datalist>` of key events, driving the sticky figure state from A2.

**Aceternity index** [F] https://ui.aceternity.com/components : other slugs confirmed to exist but not opened:
`/components/tracing-beam`, `/components/flip-words`, `/components/text-generate-effect`, `/components/typewriter-effect`.

---

## Part C: What to look up in Mobbin MCP and 21st.dev Magic MCP in a follow-up pass

### Mobbin MCP

Sites / web, style filter "Editorial" (visual details this pass could not verify):
1. Sites, Style = Editorial, Section = Hero: hero treatments for editorial indexes (headline scale, lead image vs none).
2. Web screens "Browse & Discover" (`/explore/web/screens/browse-discover`): card grid density, metadata rows, badge placement.
3. Web screens "Home" filtered to news/media apps: lead-story plus secondary-grid layouts.
4. Web screens "Search" and flow "Searching & Finding": command-palette overlays, grouped results, empty and no-result states.
5. Flow "Filtering & Sorting" (web and mobile): chip rows, active state, clear-all, overflow on narrow screens.
6. UI element "Chip" (web and mobile): selected vs unselected styling, counts inside chips.
7. Glossary pages `chip`, `command-palette`, `badge`, plus any of `tabs`, `timeline`, `tooltip`, `stepper`, `carousel`: best-practice text.
8. Mobile screens "Timeline / History" (`/explore/mobile/screens/timeline-history`): vertical timeline at phone width.
9. Search terms: "article", "article detail", "reader", "long read", "table of contents", "reading progress".
10. Search terms: "map", "store locator", "annotated map" for footprint visuals.
11. Search terms: "stats", "metrics", "KPI row" for the by-the-numbers strip on a brand page.
12. Mobile navigation: "navigation drawer", "bottom sheet menu", "tab bar" in news apps (NYT, Guardian, Bloomberg, Substack, Medium if indexed).
13. Specific apps/sites to query by name: The Pudding, Rest of World, Stripe Press, Financial Times, Bloomberg, The
    New York Times, Reuters, The Verge, Substack, Medium, Readwise, Are.na.
14. Flows: "Onboarding to first article", "Sharing an article", "Saving / bookmarking".

### 21st.dev Magic MCP

Fetch source for each, then port the mechanism to vanilla CSS/JS:
1. "scroll media expansion hero" and "container scroll animation" (the two most-viewed heroes seen).
2. "editorial hero", "magazine hero", "text reveal hero", "minimal hero serif".
3. "filter chips", "category pills", "segmented control", "animated tabs" (sliding active indicator).
4. "spotlight card", "tilt card", "3d card", "hover card", "bento grid".
5. "timeline", "vertical timeline scroll progress", "timeline scrubber", "brush chart", "range slider with ticks".
6. "number ticker", "animated counter", "stat card", "stats section".
7. "image compare", "before after slider".
8. "video card", "video dialog", "youtube lazy embed".
9. "logo marquee", "logo cloud", "infinite slider".
10. "tooltip", "annotation", "footnote popover", "hover card".
11. "flip card", "3d flip".
12. "command palette", "cmdk", "search dialog", "spotlight search".
13. "page transition", "view transition", "shared element transition".
14. "sticky scroll", "scroll reveal", "scrollytelling", "sticky section".
15. "mobile menu", "navbar", "navigation drawer", "floating dock".
16. "line chart", "area chart annotation", "activity heatmap", "sparkline" (chart mark styling and annotation layers).
17. "table of contents", "reading progress bar", "article layout".

For every result record: component URL, author, dependencies (motion, radix, etc.), and whether the effect is
transform/opacity only (cheap to port) or depends on layout animation (needs FLIP by hand).

### Gaps from this pass to close

- First-hand look at FT, Bloomberg, NYT and Reuters longform/graphics pages (all blocked here).
- Any visual verification at all: screenshots at 390px and 1280px of items A1-A5.
- A real timeline-scrubber reference and a real annotated-map editorial example.
- Current browser support for scroll-driven animations and cross-document view transitions (check caniuse/MDN compat tables).

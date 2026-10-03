# Design audit (before the redesign)

Captured with Playwright (`node scripts/shots.mjs docs/audit/before --sections`) at 375, 768, 1280 and 1440 px
on commit `cf06e10`. Four pages existed: `/`, `/pets-com/`, `/webvan/`, `/radioshack/`. Screenshots are in
`docs/audit/before/` as `<page>-<width>.jpg` (full page, downscaled) and `<page>-<width>-<section>.jpg`
(story, overview, map, gallery, website, cause). Measurements below were read from the DOM with Playwright.

Skills used for this audit: `design:design-critique` (structure of the critique: first impression, usability,
hierarchy, consistency, accessibility) and `design:accessibility-review` (WCAG 2.1 AA checklist). The
"impeccable", "polish" and "frontend-design" skills are not installed in this environment, so their
principles (type rhythm, spacing scale, hierarchy, no template tells) were applied by hand.

Severity: **P0** breaks the page, **P1** clearly hurts reading, **P2** polish.

## 1. Story section: half the screen is empty (P0)

Evidence: `radioshack-1280-story.jpg`, `radioshack-1440-story.jpg`, `pets-com-1280-story.jpg`, `webvan-1280-story.jpg`.

| measure (RadioShack story, 1280 and 1440) | value |
|---|---|
| section height | 3,240 px for about 450 words |
| height of each chapter box | 648 px (`min-height: 72vh`) |
| height of the text inside each chapter | 299–329 px |
| dead space per chapter | about 320 px, so half of every chapter is empty |
| sticky "stage" on the left | 478 × 520 px holding one number, one caption and a 190 px drawing |
| opacity of chapters that are not the active one | 0.35 |

What is wrong:
- The left column is a single sticky panel for the whole section. It holds a number and a small drawing in a
  478 px column, so most of the left half is blank even when it works. On a tall window the panel is capped at
  520 px and the rest of the column is empty.
- The panel shows the same drawing for every chapter; only the number changes. Nothing on the left relates to
  the chapter being read apart from that number.
- Each chapter is forced to 72% of the window height regardless of how much text it has, which produces the
  "huge vertical gaps between chapters".
- Chapters other than the active one are drawn at 35% opacity. Body text at that opacity is about 2.0:1 on the
  page background, far below WCAG AA (4.5:1), and anyone who scrolls quickly or prints sees grey text.
- The active chapter is chosen by an IntersectionObserver band (`-40% 0 -50% 0`). If JavaScript fails the
  panel never updates and every chapter stays faded.
- At 375 and 768 the panel collapses to a 104 px sticky strip that covers content under the section nav
  (`radioshack-375-story.jpg`), and the drawing shrinks to 76 px.

Fix: one row per chapter. Each row carries its own visual (the chapter's figure plus a drawing, archive image,
video or mini chart chosen for that chapter) next to its text; the visual is sticky only inside its own row.
No fixed heights, no faded text, and the layout is plain stacked blocks below 900 px.

## 2. Background and surfaces (P0, requested)

Evidence: every screenshot. `body` is `rgb(247,243,234)` (#F7F3EA), alternate sections `rgb(243,238,226)`
(#F3EEE2), cards #FFFDF8, rules #D9CFBB. The page reads as tan/cream paper.

Fix: body `#FCFBF8`, cards `#FFFFFF`, hairlines `#E8E6E1`. No alternating tan bands; sections are separated by
space and a hairline. Chart and map fills that used the same beige (`#ebe4d6` states, `#ddd3c2` bars,
`#c9b48a` "tan" series) move to neutral greys and a defined chart palette.

## 3. Vertical rhythm and whitespace (P1)

- Sections use 84 px top and bottom padding plus a 44 px gap before every card, and section headings sit in
  an 820 px column while charts span 1,180 px, so the left edge is consistent but the right edge is ragged.
- Page length: RadioShack is 26,084 px at 1280 and 38,476 px at 375. The story alone is 12% of the desktop page.
- Spacing values in the CSS are ad hoc: 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 30, 32, 36, 40, 44, 48, 52, 56,
  60, 64, 84 px all appear. There is no scale.
- The two-column source list and three-column press quotes leave uneven column bottoms (`radioshack-1280.jpg`).

## 4. Hierarchy and typography (P1)

- Section titles (Inter 700, 28–40 px) and chapter titles (24–29 px) are close in size; card titles, figure
  titles and table captions are all 13–19 px Inter 600. Three levels look like one.
- Body copy is Source Serif 4 but every heading is Inter, so the page reads as a dashboard with serif
  paragraphs rather than an editorial piece.
- Footnote markers are red, bold and 0.62em; in dense paragraphs they compete with the text.
- Figure captions, sources and notes are 12.5 px grey (#625B4F on #F7F3EA is 5.6:1, fine) but several labels
  use `--dim` #8D8577, which is 3.3:1 and fails AA for small text.

## 5. Template tells (P1, requested)

- 34 elements per company page are uppercase with letter-spacing (`.sec-k` section kickers "02 THE STORY",
  `.ha-k` "FROM THE ARCHIVE"). This is the spaced-out eyebrow label pattern on every section.
- The `stats` block is a generic grid of big numbers with small labels and no context sentence.
- Every card has the same 1 px ink top rule; nothing distinguishes a chart from a table from a quote.
- No emoji, no Roman numerals, no gradient glows and no italic accent words were found (the CSS already
  forces `em` upright). These stay banned.

## 6. Navigation and information architecture (P1)

- The masthead lists every company by name (`home-1280.jpg`). It works for three; it cannot hold seventeen.
- There are no category pages, no search and no About page; the method text sits at the bottom of the homepage.
- The section menu's dropdowns open on click only and are not reachable in a sensible order by keyboard on
  mobile, where the row scrolls sideways with no affordance.
- The homepage has three "Coming soon" placeholder cards that look like broken content (`home-1280.jpg`).

## 7. Motion (P2)

- All content carries `.rv` (opacity 0 until an IntersectionObserver adds `.in`). With JavaScript disabled or
  blocked the page body is invisible. The first full-page capture run (smooth scrolling on) showed whole
  sections blank for this reason.
- Nothing else moves: charts appear fully drawn, drawings are static, there are no hover states on gallery
  items and no transition between pages.

## 8. Charts, map and data (P1)

- Chart.js canvases have `role="img"` and a title as `aria-label`, but no data table or text alternative.
- Several series are distinguished by colour only (red vs green lines in the gross-profit chart).
- The hand-drawn chart notes are hidden under 560 px with nothing replacing them.
- The map's state fill is the same beige as the page, so the map looks washed out (`radioshack-1280-map.jpg`).
- At 375 the timeline scrubber shows only the active label; the dots are 14 px, under the 24 px minimum target.

## 9. Brand section (P2)

- The gallery mixes three very small archive crops, drawings and a CSS recreation with no "then vs now".
- Archive images are AVIF only (no fallback) and have no intrinsic size, so the page shifts as they load.
- There is no video anywhere, although the Pets.com story is about a television campaign.

## 10. Accessibility (design:accessibility-review)

| check | result |
|---|---|
| 1.1.1 text alternatives | images have alt; charts do not have data alternatives |
| 1.4.3 contrast | fails for 35%-opacity chapters and `--dim` labels |
| 1.4.10 reflow | no horizontal scroll at 375 (passes) |
| 2.1.1 keyboard | cause-of-death rows and tabs are buttons (pass); map pins focusable (pass); no skip link |
| 2.4.7 focus visible | browser default only; invisible on dark buttons |
| 2.3.3 / reduced motion | `.rv` respects it; smooth scroll respects it |
| 2.5.8 target size | timeline dots 14–18 px, section-menu links 28 px tall (fail) |
| 1.3.1 structure | h1 → h2 → h3 mostly correct; "Key findings" is an h2 inside the header |
| 2.4.1 bypass blocks | no skip link |

## 11. What works and stays

All text, sources and data-honesty labels; the original drawings; the archived screenshots in a browser
frame; the pastel-pin map with hand-drawn notes and its linked timeline; the cause-of-death bars; the
what-if tabs; the numbered sources with footnote links.

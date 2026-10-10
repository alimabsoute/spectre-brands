# Spacing audit: v2 pilot pages

Pages: /blockbuster/, /pets-com/, /orbitz-drink/. Measured with Playwright at 375 and 1280 px, light theme, reduced motion (`.gaps.mjs`).

## What made the gaps

- Every `.sec` carried 96 px of padding top and bottom on desktop (`assets/pmpreview/sections.css`), so two sections sat 192 px apart before any heading. On phones it was 64 + 64 = 128 px.
- `.sec-head` added another 48 px under each heading.
- The hero stacked fact file, tier note, standfirst, image grid, deck, numbers and findings in one column: 2,283 to 2,706 px tall on desktop and 3,252 to 4,469 px on a phone.

## Reference spacing (Mobbin)

- Pitch, "Pitch 2.0" article (https://mobbin.com/sites/sections/5c087f48-be52-4fb4-b5c4-87202563bbff): date, headline, author and body in one tight column; about 24 to 32 px between header blocks.
- Equals, "How we improved charting" (https://mobbin.com/sites/sections/ffa049eb-0dc2-4a16-b18f-d67b128806d1 and https://mobbin.com/sites/sections/64ac05bb-d293-4e9b-8f96-22debaee69dc): a compact title block with the chart directly under it.
- IKEA, year in review (https://mobbin.com/sites/sections/3c009a99-4b27-4ef5-980f-de0b9783fb72): photo beside headline and deck in one band; the facts block follows at roughly 64 px.
- MasterClass (https://mobbin.com/sites/sections/578881a1-cd34-448a-9628-14a894c60d79): a single row of large numbers directly under the hero image.
- Eventbrite trends report (https://mobbin.com/sites/sections/ccc52090-36a7-4629-be76-4c711f2b4467): tag, headline, deck and date in under 150 px.

Judged by eye from the screenshots (not measured), these pages keep about 80 to 120 px between major sections on desktop and 24 to 32 px inside a header block.

## Target scale (applied only to pages with the v2 hero, `main:has(.hero-x)`)

| Token | Phone (375) | Desktop (1280) | Use |
|---|---|---|---|
| `--sp-sec` | 40 px | 56 px | `.sec` padding, each side; 80 / 112 px between sections |
| `--sp-head` | 20 px | 32 px | under a section heading |
| `--sp-block` | 24 px | 32 px | above and below charts, cards and figures |
| `--s-4` / `--s-5` | 16 / 24 px | 16 / 24 px | inside the hero: title to standfirst, standfirst to deck, numbers to tabs |

All three use `clamp()`, so tablets fall in between.

## Before and after

| Page @ width | Section padding | Gap between sections | Hero height | Empty runs of 120 px or more |
|---|---|---|---|---|
| blockbuster @ 375 | 64 → 40 | 128 → 80 | 4,055 → 2,198 | 7 → 5 |
| blockbuster @ 1280 | 96 → 56 | 192 → 112 | 2,544 → 1,363 | 16 → 7 |
| pets-com @ 375 | 64 → 40 | 128 → 80 | 3,252 → 2,011 | 15 → 11 |
| pets-com @ 1280 | 96 → 56 | 192 → 112 | 2,283 → 1,215 | 22 → 13 |
| orbitz-drink @ 375 | 64 → 40 | 128 → 80 | 4,469 → 2,892 | 12 → 7 |
| orbitz-drink @ 1280 | 96 → 56 | 192 → 112 | 2,706 → 1,520 | 17 → 4 |

The empty runs that remain are mostly Chart.js canvases and the timeline stage, which draw only when scrolled into view and read as empty to the measuring script. They are not visible gaps.

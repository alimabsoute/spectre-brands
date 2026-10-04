# Progress (redesign + content expansion)

Updated after every commit so a resumed session can pick up where the last one stopped.

## Phases
- [x] Phase 0: repo hygiene (.b64 → binaries, no `_parts/` existed, `npm run dev`, `npm run check`)
- [x] Phase 1: design audit (`docs/DESIGN_AUDIT.md`, baseline screenshots in `docs/audit/before/`)
- [x] Phase 2: design research (`docs/DESIGN_RESEARCH.md`, raw notes in `docs/DESIGN_RESEARCH_NOTES.md`)
- [x] Phase 3: redesign (tokens, story rows, #FCFBF8), videos module, 9 infographic blocks, gallery credits, then-vs-now
- [x] Phase 4: animation (CSS + IntersectionObserver; counters, draw-in, idle illustrations, flip stones, view transitions)
- [ ] Phase 5: content expansion (see table)
- [x] Phase 6: homepage, category pages, About, search, SEO files, favicon (OG images: run `node scripts/og.mjs` when all brands are in)
- [ ] Phase 7: data honesty pass (`npm run media`, `npm run sources`, read every tierWhy)
- [ ] Phase 8: QA (`npm run check`, `npm run lighthouse`, `npm run shots`, review `docs/qa/`), CHANGELOG_REDESIGN.md

## Brands

| # | slug | category | tier | state |
|---|---|---|---|---|
| 001 | pets-com | dotcom | dead | upgraded (videos, infographics, per-chapter visuals) |
| 002 | webvan | dotcom | dead | being upgraded |
| 003 | radioshack | electronics | ghost | upgraded |
| 004 | circuit-city | electronics | dead | in research |
| 005 | toys-r-us | retail | ghost | in research |
| 006 | kb-toys | retail | tbd | in research |
| 007 | kiddie-city | retail | dead | in research |
| 008 | groupon | dotcom | ghost | in research |
| 009 | aol | dotcom | ghost | in research |
| 010 | zima | consumer | ghost | in research |
| 011 | crystal-pepsi | consumer | ghost | in research |
| 012 | dreamcast | games | dead | in research |
| 013 | atari | games | ghost | in research |
| 014 | blockbuster | film | ghost | in research |
| 015 | quibi | film | dead | in research |
| 016 | howard-johnsons | restaurants | ghost | in research |
| 017 | burger-chef | restaurants | dead | in research |

## Session notes
- 2026-10-03 evening: all 14 brand-research agents were cut off together by the account's session rate
  limit. Partial folders were left under `companies/` (untracked). They are being resumed five at a time,
  and each brand is committed as soon as it builds. Do not run more than about five research agents at once.
- Order of resumption: kb-toys, zima, aol, toys-r-us, groupon; then circuit-city, kiddie-city, crystal-pepsi,
  blockbuster, quibi; then dreamcast, atari, howard-johnsons, burger-chef.

## How to resume
1. `node build.mjs` and fix whatever a half-finished brand folder reports (a folder without all core
   sections fails the build; finish it following `docs/ADD_A_BRAND.md`, or move it out of `companies/`).
2. `node scripts/verify-media.mjs`, `node scripts/og.mjs`, `npm run check`, `npm run lighthouse`.
3. `npm run shots` and review `docs/qa/` at all four widths.
4. Write `docs/CHANGELOG_REDESIGN.md`, commit. Do not push from the headless box (no credentials).

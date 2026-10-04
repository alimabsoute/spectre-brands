# Progress (redesign + content expansion)

Updated after every commit so a resumed session can pick up where the last one stopped.

## Phases
- [x] Phase 0: repo hygiene (.b64 → binaries, no `_parts/` existed, `npm run dev`, `npm run check`)
- [x] Phase 1: design audit (`docs/DESIGN_AUDIT.md`, baseline screenshots in `docs/audit/before/`)
- [x] Phase 2: design research (`docs/DESIGN_RESEARCH.md`, raw notes in `docs/DESIGN_RESEARCH_NOTES.md`)
- [x] Phase 3: redesign (tokens, story rows, #FCFBF8), videos module, 9 infographic blocks, gallery credits, then-vs-now
- [x] Phase 4: animation (CSS + IntersectionObserver; counters, draw-in, idle illustrations, flip stones, view transitions)
- [x] Phase 5: content expansion (17 brands, see table)
- [x] Phase 6: homepage, category pages, About, search, SEO files, favicon (OG images: run `node scripts/og.mjs` when all brands are in)
- [x] Phase 7: data honesty pass (111 videos verified, 674 source URLs checked, tier justifications on /about/)
- [x] Phase 8: QA (check, Lighthouse on 26 pages, 104 screenshots in `docs/qa/`), CHANGELOG_REDESIGN.md
- [ ] Push to `main` and confirm the Vercel deployment (not possible from the headless box)

## Brands

| # | slug | category | tier | state |
|---|---|---|---|---|
| 001 | pets-com | dotcom | dead | done, committed |
| 002 | webvan | dotcom | dead | done, committed |
| 003 | radioshack | electronics | ghost | done, committed |
| 004 | circuit-city | electronics | ghost | done, committed |
| 005 | toys-r-us | retail | ghost | done, committed |
| 006 | kb-toys | retail | ghost | done, committed |
| 007 | kiddie-city | retail | dead | done, committed |
| 008 | groupon | dotcom | ghost | done, committed |
| 009 | aol | dotcom | ghost | done, committed |
| 010 | zima | consumer | ghost | done, committed |
| 011 | crystal-pepsi | consumer | ghost | done, committed |
| 012 | dreamcast | games | dead | done, committed |
| 013 | atari | games | ghost | done, committed |
| 014 | blockbuster | film | ghost | done, committed |
| 015 | quibi | film | dead | done, committed |
| 016 | howard-johnsons | restaurants | ghost | done, committed |
| 017 | burger-chef | restaurants | dead | done, committed |

## Session notes
- 2026-10-03 evening: all 14 brand-research agents were cut off together by the account's session rate
  limit. Partial folders were left under `companies/` (untracked). They are being resumed five at a time,
  and each brand is committed as soon as it builds. Do not run more than about five research agents at once.
- Order of resumption: kb-toys, zima, aol, toys-r-us, groupon; then circuit-city, kiddie-city, crystal-pepsi,
  blockbuster, quibi; then dreamcast, atari, howard-johnsons, burger-chef.

## What is left
Everything is committed locally. Remaining work is listed in `docs/CHANGELOG_REDESIGN.md` section 11:
push and confirm the deployment, the Mobbin / 21st.dev follow-up pass, a third brand per category, and
the human checks in section 9.

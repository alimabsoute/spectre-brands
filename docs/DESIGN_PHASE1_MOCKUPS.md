# Spectre Brands — phase 1 homepage previews

Three generated homepage directions for owner review. These pages are isolated under `/preview/`, have `noindex`, and are absent from production navigation, `search.json`, and `sitemap.xml`. The existing homepage, all 38 post-mortems, category pages, production CSS and runtime output were compared against a pre-change build and remain byte-for-byte unchanged.

| Preview | Treatment | Logo | Hero |
| --- | --- | --- | --- |
| `/preview/retro-pop/` — Rewind Club | Vanilla/apricot, Fraunces + DM Sans, cobalt controls, rounded record sleeves, six-column archive with 12 initially displayed | Concept 11, Out of Register, recolored to cobalt/vermilion/plum; presentation padding cropped from vector viewBox | `retro-pop-hero-2.png`, sunny storefront strip |
| `/preview/neon-arcade/` — After Hours | Plum-black/aubergine, Space Grotesk + IBM Plex Sans, amber/rose/mint, five-column storefront cabinets with 10 initially displayed | Concept 05, Still Open, recolored mint/rose/ivory | `neon-arcade-hero-1.png`, night strip mall |
| `/preview/editorial-vibrant/` — The Living Archive | Porcelain/mint, Bodoni Moda + Source Sans 3, teal/raspberry/saffron, specimen-board art beside the intro and four-column contact sheet with eight initially displayed | Concept 12, The Footnote, recolored petrol/teal/raspberry; matching icon favicon | `editorial-vibrant-hero-1.png`, specimen board |

`/preview/` links the three directions and includes palette swatches and the complete logo concept contact sheet. Every variant has a fixed A/B/C switcher, the real headline and intro, all 38 brands, 15 Dead and 23 Ghost definitions, featured Pets.com story, the data-driven calendar, category/decade/cause/status filters and methodology. On mobile the first intro sentence is visible immediately and “About the archive” reveals the rest of the original copy. Rewind Club and After Hours use keyboard-accessible rails with arrow buttons and position counts; The Living Archive uses a two-column mobile contact sheet after a wide lead. Gallery expansion is progressive enhancement: all 38 cards remain displayed without JavaScript.

Fonts are local Latin WOFF2 subsets with OFL licence files and the source manifest. Each illustrated hero has a visible AI-assisted provenance caption and 1600px/800px AVIF + JPEG alternatives. Historical photos retain available source color and full opacity. Webvan uses only `colorized-webvan-van-lumalocked.png` (800 × 565, preserved source luminance); the raw AI pass is never imported. The full required Mark Coggins/Wikimedia/CC BY 2.0 derivative credit appears on every variant. Per-card “Image source” disclosures lead to the corresponding brand's sources, including correctly routed numbered citations.

## Files changed

- `build.mjs`: generates the isolated preview routes through `lib/preview.mjs`; search and sitemap inventories unchanged.
- `lib/home.mjs`: optional preview opener/gallery/intro parameters; default rendering unchanged.
- `lib/layout.mjs`: optional scoped theme, noindex, preview styles, vector logo and favicon; default rendering unchanged.
- `lib/preview.mjs`: data-driven variant/hub generation and exact theme tokens/category accents.
- `assets/preview/`: palettes, isolated CSS/JS, optimized artwork/colorization, recolored SVG logos and contact sheet.
- `assets/fonts/preview/`: local Latin font files, source manifest and OFL licences.
- `scripts/prepare-preview-assets.mjs`: reproducible import/conversion from `/workspace/spectre-design/` with Sharp.
- `scripts/preview-shots.cjs`: local Playwright captures and interaction checks.
- `docs/DESIGN_PHASE1_MOCKUPS.md`: repository copy of these review notes.

Generated `dist/` is gitignored. Screenshots and capture/contrast results live in `/workspace/spectre-design/mockups/` outside the repository. No push, merge, or main-branch checkout was performed.

## View and reproduce

From `/workspace/spectre-brands`, run `npm run build`, then `python3 -m http.server 8000 --directory dist`. Open `http://localhost:8000/preview/` and use trailing-slash URLs. Production remains at `http://localhost:8000/`.

Run `node /workspace/spectre-brands/scripts/preview-shots.cjs` from `/workspace` so Playwright resolves via `/workspace/node_modules`. Captures use 1280 × 900 and 375 × 900 viewports, reduced motion, loaded fonts and a full scroll to initialise lazy images. Files are `<id>-1280-fold.png`, `<id>-1280-full.png`, `<id>-375-fold.png`, `<id>-375-full.png`. “Full” captures show the initially displayed gallery; “Show all” is separately verified to reveal all 38 cards. A fixed switcher appears at the original viewport position in full-page Playwright captures.

## Verification

- `npm run build`: passed.
- `npm run check`: passed across all 52 pages (51 pages × two widths plus keyboard/search/media/timeline/no-JavaScript interactions). An earlier run found three preview caption anchors pointing locally instead of to their brand page; these were corrected.
- Preview captures: all images intact, correct direction fonts loaded, zero horizontal overflow at 375px/1280px, no browser errors; 38 index entries and 38 gallery cards; expansion and combined Ghost/consumer filters verified; no-JavaScript archive verified.
- Rendered text contrast scan (interface text; historical artwork excluded): no failing visible text pairs across the three directions; exact palette pairs follow the supplied AA specification. This is a targeted check, not a full accessibility certification.
- All twelve final screenshots visually inspected, with opener composition, source routing and mobile discovery refined before the final render.
- Existing production output hashes unchanged; preview paths absent from search and sitemap.

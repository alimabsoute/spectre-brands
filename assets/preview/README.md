# Phase-1 preview assets

Loaded only on `/preview/`. `palettes.json` is copied verbatim from the supplied design directions. `themes.css` is emitted by the builder from these exact tokens.

Hero sources: `/workspace/spectre-design/heroes/retro-pop-hero-2.png`, `neon-arcade-hero-1.png`, `editorial-vibrant-hero-1.png`. These are original AI-assisted conceptual illustrations, not historical images. Each page labels this visibly. AVIF/JPEG exports use Sharp at 1600px and 800px.

Webvan source: **only** `colorized-webvan-van-lumalocked.png`, 800 × 565. The original is Mark Coggins' Wikimedia Commons File:Webvan.jpg, CC BY 2.0. The supplied derivative preserves source luminance/geometry and adds approximate 2000 livery colors. It is not documentary. Required attribution and derivative disclosure appear on each preview. This native-resolution asset is not upscaled; both responsive export names retain its 800px width. Never replace it with the raw `colorized-webvan-van.png` AI pass.

Logo concepts 11 (Out of Register), 05 (Still Open), and 12 (The Footnote) are local outlined SVGs recolored to direction tokens. Presentation padding is removed through the viewBox, keeping the outlines intact. Concept 12 has its supplied icon variant. The original sixteen-concept contact sheet appears on the preview hub.

Fonts in `../fonts/preview/` are the downloaded Latin WOFF2 subsets, with their OFL licences and source manifest. No font or image service is called at runtime.

Re-import: `node /workspace/spectre-brands/scripts/prepare-preview-assets.mjs`. This intentionally reads the external design handoff directory. Ordinary `npm run build` uses only committed local files and Node's standard library.

# Hero review — 2026-10-11

Target: `https://github.com/alimabsoute/spectre-brands.git`, branch `v2-pilot`, base HEAD `2f066ae5047159a385584646bd9b975583eff4a0`.

Routes: `/blockbuster/`, `/pets-com/`, `/orbitz-drink/`.

The working checkout is isolated in `spectre-hero`. The untouched detached worktree `../spectre-baseline` supplies the before captures. Neither older production nor the older `spectre-sync` main checkout is the baseline.

## Feedback and implementation

| Feedback | Evidence before editing | Implemented response |
|---|---|---|
| Too much text and dead space at the top | Desktop heroes were 1,215–1,520px tall; phone heroes were 1,992–2,873px tall | Keep the original standfirst visible; put full overview, dates, figures, fact file, findings, tier explanation and archive behind one native dossier disclosure |
| Condensed information still accessible | Phone title followed the image gallery, around 490–560px down | Title and summary precede the image; dossier, tabs, citations, image credit and full archive remain keyboard accessible |
| Beautiful animation above the fold | Existing reel strip came after large image/text stacks | One lead image per brand, finite transform animation, tape reels, browser framing and Orbitz orbit rings; reduced-motion override |
| Classier, distinct typography | Prior Blockbuster heading used the house serif | Barlow Condensed 700 for Blockbuster, existing Varela Round 400 for Pets.com, existing Bodoni Moda 600 for Orbitz |
| Lower sections and graphs already good | Actual chart screenshots and source data inspected | Preserve graph code and data, lower composition and existing spacing scale; compact only source controls and add nine links on original phrases |
| Preserve every substantive word | All 47 company and section JSON files compared to base HEAD | 3,897 original strings and 1,342 non-string values preserved; comparison strips only added Markdown link syntax |
| Reuse the hero on future pages | Three pilots share `overviewV2` | Shared layout and dossier contract, `hero.treatment` variants, conservative archive fallback |

## Reproduce

Use the locked dependencies with `npm ci --ignore-scripts`, then `npm run build` and `npm run dev`. The local server defaults to port 8000. No service configuration changes are required.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='${LOCAL_PATH}'
npm run check
npm run check:v2
node scripts/hero-content.mjs
node scripts/hero-review.mjs after
node scripts/hero-motion.mjs
node scripts/hero-audit.mjs
node scripts/slop-lint.mjs --json
node scripts/hero-report.mjs
node scripts/hero-report-qa.mjs
```

`hero-review.mjs before` requires the detached baseline worktree and its built `dist`. Captures use 320, 375, 768, 1024, 1280 and 1440px widths. Expanded dossier crops use a tall viewport at the named width so the existing sticky chapter bar remains above the crop; ordinary viewport captures use 812px phone / 900px desktop height.

## Extend the system

`hero.treatment` accepts `tape`, `browser`, or `bottle`. Unknown or absent values use the capture/browser or generic archive treatment. Keep each brand's original `hero.standfirst`, `hero.dates`, `hero.deck`, `keyNumbers`, `factFile`, `findings`, `tierWhy`, and archive assets. Supply real sourced image captions, credit and alt text through existing assets. Do not add a second visible synopsis or duplicate numbers above the fold.

Prefer existing theme tokens. Add brand-specific display typography in `assets/css/hero-v2.css` and a conditional preload in `lib/sitetheme.mjs`. Reserve image dimensions; animate transforms or opacity only, finitely; add equally specific reduced-motion rules. The native dossier must continue to work without JavaScript. Citation backlinks must open the dossier and the relevant tab.

## Font provenance

Barlow Condensed Bold is self-hosted (109,912 bytes), fetched from the official Google Fonts repository: `https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/BarlowCondensed-Bold.ttf`. Its SIL Open Font License is beside the asset in `assets/fonts/hero/barlowcondensed-OFL.txt`.

Pets.com uses the existing `assets/fonts/varela-round.woff2`, with the official license added at `assets/fonts/hero/varelaround-OFL.txt` from `https://raw.githubusercontent.com/google/fonts/main/ofl/varelaround/OFL.txt`. Orbitz uses existing `assets/fonts/preview/bodoni-moda-0.woff2`; its existing license is `assets/fonts/preview/bodonimoda-OFL.txt`. All three display families are confirmed loaded in the motion report. No external font requests are introduced.

## Research and limits

Impeccable v3.8.0 is installed and was used for the structural, motion, polish and technical audit passes. See `IMPECCABLE_AUDIT.md`; its detector returned `[]`.

Allowed Obsidian, local project documentation, Codex memory files, Claude Code configuration and relevant planning notes were searched. Forbidden session directories were not read. Earlier production was not substituted for the v2 target.

The user’s Claude Code notes identified an enabled installed `21st@21st` plugin. Its supported `https://21st.dev/api/mcp` endpoint successfully initialized with the existing process credential. Three free MCP searches returned 15 references. Selected metadata: Editorial Collage Hero (19074), Hero with Dashboard Mockup (19068), Ghost Accordion (29230), recorded in `reference-selections.json`. The final review uses their composition and disclosure descriptions, not copied component code. Public preview-image retrieval returned HTTP 403, so these reference images were not visually inspected. No paid generation, component retrieval, installation or credential changes occurred.

Mobbin is configured in the existing local integrations, but its supported initialization returned HTTP 401. The remaining requirement is reauthentication of that existing connection. A paid plan does not resolve authentication. No alternate endpoint or token copying was attempted.

`link-provenance.json` records nine added semantic anchors and their existing source IDs. The internal Redbox route passes the site link check. Bend Blockbuster returned HTTP 200. The SEC text filings were independently readable through web retrieval, but direct HTTP probes returned 403; the SEC revocation PDF also could not be retrieved through the web tool. This is a validation limit, not evidence of a 404. All SEC destinations already existed in the article sources. No ranking uplift is claimed.

Whole-page 200% root-text checks expose inherited lower-page overflow outside the hero; the expanded hero itself passes at 320px in both themes. Tests cover Chromium, not a device farm or all assistive technologies. Normal-motion cold-load observations show zero hero-attributed CLS; tiny existing navigation / lower-heading font-paint shifts remain in the full-page measurement. Lighthouse was not run: the locked version requires Node >=22.19 while this host has Node 22.18.

The repository is static JavaScript/ESM and exposes no separate TypeScript or general ESLint task. Changed JavaScript modules were syntax checked. The existing prose linter reports zero errors, one warning and 313 informational findings across the whole corpus; this task preserves the original prose. `git diff --check` passes.

No commits, pushes, merges, deployment, production publication or live-service configuration changes are part of this task.

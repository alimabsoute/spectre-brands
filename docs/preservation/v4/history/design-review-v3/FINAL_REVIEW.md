# Spectre: final A/B/C style review

The requested review gate is complete: three playable 12-second treatments of the same sourced Blockbuster opening beat, inside one shared 4:3 CRT/VHS shell. The full ten-beat recap and route-pattern rollout remain paused for the user's style choice. This document records local work and observed checks; it is not a production release approval.

## Deliverable

- `spectre-tv-style-check-v3.html`, also copied directly to `${LOCAL_DOWNLOADS}/spectre-tv-style-check-v3.html`.
- Single portable HTML: original article SVG artwork, fonts, license notices and GSAP3.14.2 embedded. It plays without network requests or sound.
- Native A/B/C radio selector, explicit Play/Pause, Replay, seek, keyboard shortcuts, visible captions, expandable transcript and visible source. No autoplay.
- Reduced motion is honored at load and when the preference changes: playback stops and three settled still frames become available. Disabling reduced motion keeps playback paused.
- Initial poster reads `Ready · 0:12`; it does not imply that3.4seconds have already played. Style changes preserve the current comparison time and pause.
- First-pass `spectre-hero-review.html` remains unchanged in the repo and Downloads. Its SHA256 is `98f9bbf218bb67aa653843f202dfe4a8e1a6c31e7e8c5c56eb128135aaf7bfa4`.

## Target and feedback map

Isolated checkout: `spectre-hero`, branch `v2-pilot`, unchanged HEAD `2f066ae5047159a385584646bd9b975583eff4a0`, repo `alimabsoute/spectre-brands`. Exact pilot routes are `/blockbuster/`, `/pets-com/`, `/orbitz-drink/`. Older production/main was not used as the updated design baseline.

| Feedback | Local response | Current status |
| --- | --- | --- |
| Too much text/dead space in all three heroes | First pass condensed visible hero hierarchy and moved full facts/credits to accessible disclosure controls | Retained and previously tested; see `../hero-review/HANDOFF.md` |
| Good lower content, charts and animation should stay | No lower sections or graph data were removed for the style check | Content and asset preservation rechecked |
| Beautiful motion at front, essay always accessible | This bounded style test provides an explicit player with transcript and source | Preview only; full article player waits for style choice |
| Premium structure/type/spacing/depth before patina | Barlow Condensed heading, compact transport, physical bezel/cabinet/dials, light static glass finish | Visually reviewed at desktop and phone sizes |
| Same sourced beat, different inside-screen treatment | A line/fill reveal; B layered paper assembly; C restrained parallax/push | Same shell, content, duration, original art and captions |
| Three optional article patterns | Cinematic story, Interactive journey, Visual archive mapped to every pilot asset | `../design-review-v2/PATTERN_MAP.md`; no forced map/globe/chart |
| Weak/B&W material belongs in bottom Archive | Complete image-selection map with provenance and reasons | `../design-review-v2/IMAGE_SELECTION.md`; article moves deferred |
| Timeline should follow the newest attachment | No timeline redesign was attempted without seeing it | Attachment access still blocked |

## Visual assessment

**C is my recommendation** for the default treatment: steady illustrated depth, legible complete settled artwork, clear continuity and little distraction from the facts. **A** is the most distinctive drawing treatment; its deliberate line-first entrances leave more empty paper while the illustration forms. **B** offers more assembly and paper-shadow depth, with restrained settling and no spring easing. The shared VHS slide and terminal-line action are illustrative, not archival footage.

The TV has warm aged plastic, dark recessed bevels, curved glass, substantial depth, dials, grille, VHS slot and worn-looking buttons. Patina stays subtle and static. No broadcaster logos, characters, music, watermarks or reference frames are copied into the deliverable.

Actual screenshots were inspected before editing and after fixes. Resolved findings included: a clipped320px selector, awkward375px word break, invalid button font shorthand, misleading poster time, overflow at200%text, and desktop Play initially below the fold. On the delivered1280x800 copy, Play's bottom is790.125px. The last label polish stacks letter/name on all phone widths.

Before: `qa/a-1280-poster.png`, `qa/a-320-poster.png`. After: `qa-final/final-1280x800-ready.png`, `qa-final/a-320-poster.png`, `qa-final/a-375-poster.png`, plus entrance/shelves/checkout/end frames for all three styles. Initial B/C captures named `poster` in `qa/` preserved the previous seek position; use the final captures for equal-time comparisons.

Each style ran to its12second end in Chromium and was recorded. Motion contact sheets were visually inspected; the empty eighth tile is contact-sheet padding, not a video frame. Art is copied whole from the source SVGs, with original files unchanged. Entrance motion intentionally reveals or moves pieces before their settled state.

## Observed verification

| Check | Result/evidence |
| --- | --- |
| Actual Claude Code implementation | CLI2.1.296; streamed assistant model `claude-opus-5-5` verified for build and fixes; `claude-code-proof.json` contains sanitized proof |
| Six widths × three styles |320,375,768,1024,1280,1440px;18cases; five timeline states per case; no document/control overflow or clipped selector labels |
| Text scaling |320px with200%root text size; responsive stacked controls, wrapped heading, no horizontal overflow |
| Touch/keyboard | Native radios, radio arrows, seek Home/End/Arrow, A/B/C and Space/K, Play/Pause/Replay, expanded/collapsed transcript;44px minimum measured control height |
| Motion/accessibility | Reduced motion at initial load and live changes, all three static frames, restore stays paused, finite12second end, visibility-pause handler |
| No JavaScript | Static storefront and native expandable transcript/source remain available at320px |
| Offline/errors | No external requests or page errors in the comparison or local HF sources |
| Layout stability | Measured interaction CLS0; caption/control anchors stable across all five sought states at all widths |
| Full playback | Three browser recordings, `qa-final/sample-a.webm`, `sample-b.webm`, `sample-c.webm`; all reach12seconds and stop |
| HyperFrames | Installed0.8.15 `check` passed runtime, lint-error and contrast gates for all three sources;960x720, duration12, paused registered timeline;18independent sought source frames |
| Contrast |11comparison UI/text pairs pass4.5:1; minimum4.571:1. HF sampled captions pass4/4 checks per style |
| Content preservation |47JSONfiles,3897strings and1342values preserve original words/qualifiers/numbers/quotes/citations; original-word links are the only deliberate prose markup additions from the first pass |
| Media preservation |52physical asset files unchanged from HEAD;10drawings,21archive images plus21fallbacks,18video references and127timeline events inventoried; no unreferenced pilot assets |
| Site checks already completed | Build passes38brands;11unit tests pass; full-site check69HTMLfiles/52997internal references; prior pilot browser checks, graph/dialog keyboard checks and original hero QA retained |

New style-test scripts are `scripts/tv-style-check.mjs` and `scripts/tv-delivery-check.mjs`. Structured results are `qa-final/qa-results.json` and `qa-final/delivery-check.json`. HF reports are `qa-hyperframes-a.json`, `-b.json`, `-c.json`. First-pass build/unit evidence remains in `../design-review-v2/build-preserved.txt` and `unit-preserved.txt`.

## Impeccable technical audit

Used installed Impeccable3.8.0, its `reference/audit.md` workflow and bundled detector, then verified detector findings visually. This is a technical audit plus the visual observations above, not a claim of full WCAG certification.

Anti-pattern verdict: pass for this scoped review. The detector's two warnings were verified as false positives: its type scan misses the much larger responsive Barlow heading; its dark-glow scan mistakes the physical TV bezel/LED on a light page for a dark application theme. The shell's gradients create requested physical depth; there is no gradient text, generic metric-card hero or ornamental glass panel.

| Dimension | Score | Finding |
| --- | --- | --- |
| Accessibility |3/4 | Keyboard, labels, contrast, live reduced motion and transcript checked; screen reader session not run |
| Performance |3/4 |Approximately303KiBsingle-file preview, no remote assets, finite transform/opacity motion; line drawing still paints many SVG shapes |
| Responsive |4/4 | Six widths,44pxcontrols and320px/200%text pass within checked cases |
| Theming |1/4 | Deliberate fixed warm preview palette; colors are not yet article theme tokens |
| Anti-patterns |4/4 | Distinctive restrained CRT craft; the two detector flags were visually disproved |
| **Total** | **15/20—Good** | No P0/P1 issue found within tested scope; integration polish remains before production |

- **P2: article theme integration.** `PAGE_CSS` currently hard-codes its warm preview palette. Before routing it into article pages, use the existing site tokens for surrounding text/controls and validate both article themes while retaining the TV's physical palette. Suggested command: `$impeccable colorize`.
- **P2: line-drawing render budget.** StyleA animates many paths across repeated original tape art. Before a full ten-beat film, measure low-end device performance and cache geometry/avoid repeated synchronous SVG measurement. The current desktop test does not establish a mobile GPU budget. Suggested command: `$impeccable optimize`.
- After integration fixes, use `$impeccable polish` and repeat the audit. Those commands can be requested one at a time or together; they are not run here because the current finish line is the style choice.

## Exact file scope

Current style-check implementation: `docs/design-review-v3/build-samples.mjs` (written and refined through Claude Code), its generated HTML, `samples/{a,b,c}/index.html` and local unmodified GSAP copies. Supporting work: `SOURCES_AND_STYLES.md`, this review, sanitized model proof, QA scripts/results/screenshots/recordings and the prior reference-observation notes. Font license notices are embedded in every generated output.

Independent inventory/pattern work: `scripts/pattern-inventory.mjs`, `asset-sheet.mjs`, `asset-sheet-check.mjs`, and `docs/design-review-v2/{asset-inventory.json,inventory-summary.json,PATTERN_MAP.md,IMAGE_SELECTION.md,asset-preservation-sheet-v2.html}`. Unfinished pattern scaffolding is documentation-only and is not loaded by article pages.

Cumulative first-pass article changes are listed exactly in `../hero-review/CHANGED_FILES.md` and `changed-files.json`. No new TV code is wired into routes in this style-check pass. No commits, pushes, merges, production publication or live service configuration changes were made.

## Delivery/access limits

The versioned HTML is saved in Downloads and Library. The final Library item is `[private delivery identifier omitted]`, current version1, File Service id `[private delivery identifier omitted]`; the final replacement succeeded with a version0 guard. Its current local metadata helper cannot write xattrs on this Windows Python runtime (`os.setxattr` is absent). Local Library identity is therefore retained in private task metadata instead; no alternate transfer workaround was used and no share URL was invented. `delivery-manifest.json` records exact file size/hash and successful Library version.

The latest timeline attachment `image (4).png` still could not be materialized: the current Library helper and one bounded consumer-local retry both returned `library file transfer failed: download failed`. Pixels were never seen, so no timeline redesign is claimed. The CBS Storybreak reference was inspected through real Chrome at four timestamps; the complete clip was not watched, and its frames are internal reference material only.

Limits: Chromium emulated viewports, not physical phones/Safari/Firefox; no screen-reader session; visibility is tested through a synthetic visibility event; no whole-site Lighthouse run on this Node22.18environment (installed Lighthouse13.5requires>=22.19). HF check warnings remain for intentional oversized background overscan used by parallax and its advisory composition length; it was not run in strict-warning mode. HF render captions are sized for960x720, while the delivered comparison's captions are responsive outside the screen.

No real user data, credentials, raw Claude logs, signed transfer URLs or third-party reference screenshots are included in the delivered HTML. The next decision is A/B/C; the full film and article-pattern implementation stop here pending that choice.

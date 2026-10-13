# Impeccable audit — final local hero pass

Scope: the shared v2 hero, its three branded treatments, compact citation integration, and source/backlink behavior. Installed skill: `${LOCAL_PATH}`, v3.8.0. Commands applied: init/context, brand, distill, animate, polish and audit guidance. The detector was run against `assets/css/hero-v2.css`, `lib/sections.mjs` and `assets/js/v2.js`; result: `[]`.

## Anti-pattern verdict

Pass. The three treatments use real archive imagery and distinct, licensed typography. There are no gradient headlines, glass panels, invented dashboard numbers, decorative metric cards above the fold, continuous bouncing, full-screen intro gates or generic multi-CTA hero stacks. The existing tape motif remains a house navigation cue. The full four-number blocks remain inside the original overview context, with labels and sources.

## Audit health

| Dimension | Score | Evidence and limit |
|---|---:|---|
| Accessibility | 3/4 | Native disclosures, meaningful image alt text, tab states/arrow keys, visible focus, source dialog Escape/focus return, citation backlinks reopening the correct panel, no-JS and print checks. Sampled hero text passes AA contrast in both themes. No assistive-technology certification is claimed. |
| Performance | 3/4 | Finite transform/opacity animation; reserved image boxes; conditional local font preloads; zero observed hero-attributed CLS in six cold-load checks; shared JS is 16,351 bytes. No Lighthouse/frame-rate/device-farm result is available. |
| Responsive design | 3/4 | Collapsed and expanded states pass at 320, 375, 768, 1024, 1280 and 1440px; expanded hero passes 200% root text at 320px. Whole-page enlarged-text overflow remains in inherited lower sections. |
| Theming | 4/4 | Existing theme and brand tokens, explicit high-contrast image badges, six theme/brand contrast checks and actual dark screenshots. |
| Anti-patterns | 4/4 | Deliberate editorial hierarchy, one real image, one story link, one plainly labeled dossier; distinct brand types rather than repeated marketing-template components. |
| **Total** | **17/20 — Good** | Focused implementation is ready for human review; the limits below remain explicit. |

## Findings

No P0 or P1 finding remains within the changed hero behavior.

**P2, inherited lower-page enlarged-text overflow.** At 320px with the root font enlarged to 200%, some original lower components overflow the document. The expanded hero does not. Category: responsive/accessibility; WCAG reflow/text-resize risk requires a separate focused lower-page review. Location: existing lower-page components in `assets/css/base.css` and graph/section layouts. Recommended follow-up: Impeccable adapt/harden, keeping sourced chart values and article copy unchanged. Normal 320px viewport checks pass across the pages.

**P3, inherited font-paint movement outside the hero.** Tiny cold-load shifts remain in mobile chapter navigation and first lower-section heading text, also observed on the original v2 baseline. Recorded full-page CLS in the final six motion captures is below 0.001; hero-attributed CLS is zero. Category: performance. Location: existing `assets/pmpreview/sections.css` navigation and house font faces. Recommended follow-up: Impeccable optimize with font metric matching, tested separately from the accepted lower layout.

Compact inline source markers are smaller than standalone 44px buttons by design and fall under the inline-text target-size exception. They have full source-number accessible labels, visible keyboard focus and a fallback numbered bibliography. Main hero buttons/disclosures use 44px or larger heights. Do not convert them back into repeated large source pills.

## Fixes verified during this audit

- Matched the reduced-motion override specificity to the Orbitz bottle animation.
- Made closed native dossier content visible in print CSS; browser print checks pass.
- Increased image-credit control height to 44px.
- Added critical display-font preloads and explicit headline line height.
- Made expanded figures, long words, archive captions and fact-file columns reflow under enlarged text.
- Kept image-credit disclosures and source dialogs free from duplicated controls or keyboard traps.

## Visual review

Desktop: the three heroes use a balanced two-column arrangement; story content begins within the initial 900px view. Blockbuster's blue/yellow ticket frame and condensed display face are distinct from Pets.com's rounded wordmark/browser archive and Orbitz's Bodoni/bottle composition. Phone: brand and summary come first; all three real images start above the fold, with the dossier immediately below. At 320px the original Vancouver location wraps naturally and the controls remain usable.

Expanded views retain the original overview, dates, four labeled figures, fact file, findings, tier explanation, archived images, full captions and byline. Lower chart before/after pairs retain the plotted shapes, ranges, values and controls; only the source-control treatment is intentionally smaller.

Read `audit-measurements.json`, `after/report.json`, `motion/report.json`, `motion-before/report.json`, `content-check.json`, `check.log` and `check-v2.log` for reproducible evidence. The standalone visual report contains actual browser captures and recorded motion.

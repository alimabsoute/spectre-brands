# Blockbuster hero: style check v3 (A/B/C)

One opening beat, three inside-screen treatments, one shared TV shell. This is a style check only; the full ten beats wait for feedback on which treatment to carry forward.

## Build

```
node docs/design-review-v3/build-samples.mjs            # comparison page + HyperFrames samples
node docs/design-review-v3/build-samples.mjs --no-samples
```

| Output | Purpose |
| --- | --- |
| `spectre-tv-style-check-v3.html` | Comparison page: TV shell, A/B/C switch, Play/Pause/Replay, seek, clock, transcript |
| `samples/a/index.html`, `samples/b/…`, `samples/c/…` | HyperFrames compositions `blockbuster-a/b/c`, 960×720 (4:3), 12 s, one paused timeline each in `window.__timelines` |
| `samples/<k>/vendor/gsap.min.js` | Unmodified copy of `vendor/gsap.min.js`, one per sample folder |

Fonts and both SVGs are inlined at build time. The comparison page also inlines GSAP 3.14.2 so it stays a single portable file; each sample instead loads `vendor/gsap.min.js` from its own folder, so the sample's page source contains only our code. No output makes a network request. The generator writes only inside `docs/design-review-v3`; source SVGs are read, never modified.

## Styles

All three share the same scene markup (`scene()`), the same beat cross-fades, captions and 12 s duration. Only the per-beat entrance differs, in one branch of `buildTimeline()`.

- **A · Storybook**: every shape is drawn as an ink line (stroke-dash reveal), then its original fill washes in.
- **B · Cut paper**: depth layers drop in back to front with stacked paper shadows; the pieces of the source art then settle on a `power3.out` ease, with no overshoot or bounce.
- **C · 2.5D**: a slow 7% push-in with parallax between depth layers; nothing else moves except the shared checkout action.

The shell (warm plastic cabinet, bevelled dark bezel, curved recessed glass with highlight and static scanlines, two dials, grille, tape slot) is original CSS and does not change between styles. The glass is 4:3. It carries no logos or broadcaster graphics. The CBS Storybreak reference was used only for its general idea of illustrated depth inside a rounded brown CRT; nothing from it is reproduced.

## Sources

- Artwork: `companies/blockbuster/art/hero.svg` (storefront) and `companies/blockbuster/art/vhs-tape.svg`, inlined whole and uncropped. Backdrops, shelves, counter and terminal are simple code-drawn shapes coloured from the storefront's own palette. The page labels this as "Original article artwork with illustrated shelves and checkout."
- Type: Barlow Condensed Bold (title), Source Sans 3 (text).
- Facts: existing article chapter 0 and source 20: History.com, "First Blockbuster store opens," October 19, 1985, https://www.history.com/this-day-in-history/october-19/first-blockbuster-store-opens
- Captions (exact): 0–4 s `Dallas · October 19, 1985`; 4–8 s `Some 8,000 tapes on open shelves.`; 8–12 s `A computerized checkout, while most video shops were small and thinly stocked.` The "some" and "most" qualifiers are kept.
- Headline `A video store built like a supermarket` is the article's existing interpretation, labelled as such on the page.

## Recommendation

After the visual check: **C (2.5D)** is the recommended default for its steady depth and legible settled artwork. **A** is the most distinctive drawing reveal; **B** provides layered paper assembly. The shared VHS entrance temporarily moves the tape across the screen edge. Full production waits for the user's choice. See `FINAL_REVIEW.md` for observations and evidence.

## Fixes after the first visual check

The first A/B/C outputs were generated and inspected at320,375and1280px. The outputs were then regenerated and checked at six widths, with keyboard/reduced-motion testing and full12second playback. See `qa-final/qa-results.json` and `FINAL_REVIEW.md`.

1. **Style selector at 320 px.** At 360 px and below each option stacks its letter above its name (15 px text, 44 px minimum height kept). The radios are still native inputs with their full labels. The button `font` shorthand was invalid (`inherit` as a family) and is now `600 1rem/1 "Source Sans 3", …`.
2. **Poster state.** Before any interaction the screen shows the settled first beat, the clock reads `Ready · 0:12`, the slider sits at 0 and its `aria-valuetext` is `Ready to play a 12-second sample`. Switching style keeps that state. Play starts from 0:00; seeking, pausing and the end show the normal clock.
3. **Reduced motion, live.** The page listens for `prefers-reduced-motion` changes. Turning it on pauses, snaps to the settled frame of the current beat, hides Play/Replay and turns the slider and ←/→ into a three-frame stepper. Turning it off stays paused at the same time and restores the 0–12 s seek. Neither direction starts playback.
4. **HyperFrames source.** Samples load a local `vendor/gsap.min.js` copied into each sample folder instead of inlining it. The clip (`clip-<k>`) and captions (`cap-<k>-1…3`) have stable ids. `html`, `body`, root and clip are 100% × 100%. The timeline is still one finite, paused, registered 12 s timeline. The vendor file is copied unmodified.
5. **4:3 screen.** Glass aspect ratio is 4/3, scene `viewBox` is `0 0 960 720`, samples declare `data-height="720"` and a 960×720 viewport. Art coordinates are unchanged; backdrop and floor rectangles extend further down to fill the extra 80 units.
6. **Cut paper easing.** Both `back.out` eases are now `power3.out`. The 2.5D foreground shadow selector matches the real attribute value, `data-depth="0.9"`.
7. **Transcript.** Collapsed by default. The source line and an illustration note now sit below it, always visible. Transcript text, facts and qualifiers are unchanged.

## Check limits

- Browser and HyperFrames0.8.15checks are complete. All three pass runtime and sampled contrast checks; layout overscan and composition-length warnings are retained and explained in `FINAL_REVIEW.md`.
- The HyperFrames captions are a fixed 28 px, sized for the 960×720 render; they do not scale if the sample is previewed at another size.
- The generator was written without opening the two SVGs. It handles them generically (viewBox or width/height, prefixed ids). If either file has an internal `<style>` block the build prints a warning, because class and `#id` selectors are not prefixed and could collide.
- Style A's line count and pacing depend on how many shapes the source art contains; the shelves beat inlines the tape 15 times, so check smoothness there first.
- Palette extraction reads six-digit hex colours only; otherwise it falls back to navy and yellow.
- The Source Sans file is the preview subset; a missing glyph (for example `·`) would fall back to the system font.
- Reduced motion is read at load and on every change; it switches the page to three static frames with a Frame slider.
- The HyperFrames samples show the scene full-frame with captions burned in at the bottom; the TV shell appears only on the comparison page.
- Without JavaScript the page shows the storefront frame, the collapsed transcript and the source; controls are hidden.

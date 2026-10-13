# Blockbuster opening film: brief

## What it is

A 35.7-second film that opens the Blockbuster post-mortem inside a drawn television. It is cut from four of the five supplied 20-second films. The fifth, `05-insert-coin.mp4`, is copied to `docs/design-review-v4/reserved-game/` and held for a later feature; it never appears in the opening.

## Decisions already made

The Sign (rain, neon, reflections) is the preferred film, so it opens, turns the story at 2010 and closes. The earlier SVG A/B/C television drawings are rejected. The film uses the supplied footage only: whole 16:9 frame, 1x speed, no crop, no new footage and no new claims.

## Flow

1. `node scripts/build-opening.mjs` hashes the five originals against `../source-hashes.json`, copies four into `film/assets/` and the fifth into `reserved-game/`, and hashes the originals again at the end. ffmpeg reads the copies.
2. The script writes `EDL.json` and `index.html` (the editable HyperFrames source) from the list in `lib/film.mjs`. `--source-only` stops here.
3. It encodes `assets/media/blockbuster-opening-v4.mp4`: nine trims, an 80ms audio fade in and out of every cut, one concat, then 1920×1080 H.264 at 30fps (preset fast, CRF 22) with 48kHz stereo AAC and faststart.
4. It writes `poster.jpg` (The Sign at 3.2s) and `chapter-01.jpg` to `chapter-09.jpg` under `assets/media/blockbuster-opening-v4/`, each a settled frame from inside its own cut.
5. The page build picks the film up through `filmFor()` in `lib/film.mjs`. Until the MP4 exists, the Blockbuster page keeps its earlier opener and the build prints a warning.

## Constraints

- Sound is off by default. Only the Sound button, or the native control when JavaScript is off, turns it on.
- Nothing plays until the reader presses Play. The essay is one link away from the first screen and is never gated by the film.
- Every narrative line also exists as text outside the screen: a caption line under the set and a transcript with sources.
- The meeting in Dallas stays attributed to Marc Randolph, with the essay's note that Blockbuster's filings do not mention it.
- The script writes to six fixed directories, deletes nothing, and runs ffmpeg through an argument array with no shell.

## Not done here

No final HyperFrames export. The caller validates `index.html`, runs the script and ffprobe, and wires `film.css` and `film.js` into the build.

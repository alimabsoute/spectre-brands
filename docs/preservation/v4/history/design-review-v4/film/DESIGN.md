# Blockbuster opening film: design

## First screen

Blockbuster opens as a cinematic story: compact copy in five columns, the television in seven. The copy column holds the tier and place, the name in Barlow Condensed, the standfirst and the link to the story. The reel strip is dropped from this pattern because the set carries the motion. At 900px and below the columns stack, copy first, and the set is capped at 40rem.

## The set

The cabinet is warm, aged plastic lit from above, with a darker, yellowed lower right corner as the only patina. A dark bevel drops from the cabinet face to the tube. The tube is 4:3 with an elliptical corner radius of 9% of its height. The film is 16:9 and sits whole inside it with `object-fit: contain`, so the letterbox bars are 12.5% of the height and the corner radius never reaches the picture. A faint highlight sits near the top edge of the glass. This is a drawn object, not a translucent panel: nothing is blurred and nothing sits behind it.

The lamp, two knobs and speaker grille are scenery and are `aria-hidden`. They move under the tube below 560px so the picture keeps the full width. The lamp turns red while the film plays.

## Outside the glass

A label line names the chapter. Under it, one caption line follows the picture. Both reserve their tallest state: the caption holds two lines above 700px, three to 420px and five below. The player reserves two rows (three below 420px) before `film.js` runs, so swapping native controls for custom ones moves nothing.

The player is a grid: seek bar and clock on the first row; Play, Sound and the chapter select on the second. Every target is at least 44px and uses native elements, so focus order and keys are the browser's own. There are no page-level shortcuts. Play becomes Pause, then Replay at the end; the film does not loop. Seeking or choosing a chapter moves the picture without starting it.

The transcript is a native disclosure under the player. Each line carries its footnotes, which the page's citation pass links to the sources.

## States

- No JavaScript: the video keeps its native controls, muted by default, and the transcript still opens.
- Reduced motion, at load or switched on later: the film pauses and hides, one still per chapter takes its place, and Previous and Next step through the caption lines. The caption becomes a polite live region in this mode only.
- Buffering: the label line says so after 600ms of waiting while playing. Nothing is shown before the reader presses Play.
- Load failure: the label line says the film did not load, the native controls return and Play becomes Retry.
- Hidden tab or set scrolled out of view: the film pauses and stays paused.
- Playing: `data-film-playing` is set on the player and on `<html>`, for the newsletter prompt to respect.

## The other two pilots

Pets.com opens as an interactive journey: the anniversary storefront capture in its browser frame beside the complete sock-puppet drawing, with links from the copy into the map and the two chart sections. Orbitz opens as a visual archive: the full-color bottle photograph beside the complete bottle drawing, taller than the other two openers, with links to the old website and the gallery. Neither gets a television, and Orbitz gets no map.

## Archive

Images the overview used to hold, and the images judged weak openers in `../../design-review-v2/IMAGE_SELECTION.md`, now sit in a labeled Archive at the foot of each gallery. Each keeps its caption and credit and links to the full-size file. Weak website captures appear there with their capture date and a link back to the website section, where the comparison and the missing-image notes are unchanged. Story chapters keep their own images. No image is recolored, converted to grayscale or removed.

## 21st.dev reference

`../21st-layout-search.json` was used for chapter and navigation structure. Scroll-locked and autoplaying patterns were rejected because the film must wait for Play.

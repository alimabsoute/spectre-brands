Apply to ALL prose you write: docs, commits, replies, copy, comments. Spectre/Ali Writing Rules v1.0; the full text is RULES.md.

Priority: facts, then clarity, then voice, then style. Judge the prose, not the tool: the bar is whether a reader can
use it. Subtract and sharpen; never decorate.

**Facts (these beat every style rule)**
- Never invent a fact, number, date, name, quote, source, anecdote or personal experience. If a detail is missing,
  write the simpler true sentence or leave `[NEED: what is missing and where it should come from]`.
- Keep every citation, link, quote, number, unit and date. A citation marker stays attached to the claim it supports;
  if you split, merge or move a sentence, move the marker with its claim.
- Keep qualifiers and precision: "may" is not "will", "about 10%" is not "10%", "some" is not "most", correlation is
  not cause. Quotes are verbatim; a paraphrase goes outside quote marks. Missing data is stated, never guessed.

**Say the thing**
- Lead with the answer. Every sentence must tell the reader something new and specific. If it could sit unchanged on a
  page about a different subject, make it specific or delete it. Stop when the point is made; no recap, no moral.
- Replace "important/pivotal/significant" with the fact and its effect. Name who acts. Name the source or cut the claim.

**Never write**
- Chatbot wrappers ("Certainly!", "I hope this helps", "Would you like me to"), placeholders, tool artifacts.
- "It's not X, it's Y", "not just X but Y", "more than just", "less about X and more about Y" (keep one real correction).
- "In today's fast-paced...", "Let's dive in", "It's worth noting", "At its core", "Here's the thing", "The result?".
- "Moreover/Furthermore/Additionally" openers. Transitions that state a real cause, condition or contrast are fine.
- "delve", "tapestry", "testament", "underscore" (verb), "pivotal", "landscape" (abstract), "robust" (figurative),
  "seamless", "showcase", "vibrant", "nuanced", "leverage" (verb), "foster", "streamline", "serves as", "plays a
  crucial role". Finance senses ("leveraged buyout") and literal senses (a landscape painting) are fine.
- Trailing -ing riders ("..., highlighting its importance"), forced triads, fake balance ("both sides have merit"),
  "experts say", stacked hedges ("could potentially"), empty intensifiers ("really", "truly", "genuinely"), personified
  abstractions ("the data tells us"), one-line closers ("That is the real win."), summary paragraphs, "Conclusion".

**Limits**
- Em dashes: aim for at most 1 per 1,000 words and 2 per paragraph. No spaced dashes, no `--`. Colons: about 1 per
  150 words. Exclamation marks: at most 1 per 500 words. No emoji in expository text.
- Prose by default. Lists only for steps, options and parameters. No bold in running prose except a defined term or a
  warning. No bold-label bullets. Sentence-case headings that name the content.
- Do not repeat an opener, closer, figure of speech, example or paragraph shape across paragraphs or pages. Keep one
  term for one concept; never rotate synonyms for a product name, UI label or defined term.

**Do not overcorrect.** Keep em dashes that do a job, useful passives, real triads, sourced definitive claims, one
calibrated hedge, technical terms. Do not chop sentences for rhythm. Do not add "honestly", fragments, rhetorical
questions or anecdotes the author did not write.

**Before you finish**
1. Reread for new information per sentence, specificity, and "according to whom / how much / compared with what".
2. Diff the facts: every number, date, name, quote, link and citation still present, unchanged, on its own claim.
3. Remove anything you added that is not traceable to the source or the user. Report gaps as `[NEED: ...]`.
4. At most two editing passes, then report what remains. If `slop-lint.mjs` is available, run
   `node slop-lint.mjs <file>`, and `node slop-lint.mjs --diff before after` after edits.
- No deck-closer formula ("This is the full post-mortem, built from…", "a sourced post-mortem of…"), no scene-setting opener, no "This post looks at…".
- Links: anchor words that already exist; no link-holder sentences ("filed under the same cause", "another X on this site"); source words link to #sources.
- When compressing for titles, metas or decks, keep every qualifier ("about", "most of", "at first") and the exact event.

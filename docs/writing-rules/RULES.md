# Spectre/Ali Writing Rules

Version 1.0, 2026-10-10. Merged from two independent research sets (see `SOURCES.md`) plus read-only notes from X.
Companion files: `QUICK.md` (the block to embed in CLAUDE.md or AGENTS.md), `VOICE-SPECTRE.md` (house voice for the
Spectre Brands site), `slop-lint.mjs` (the linter), `tests/` (its fixtures), `CHANGELOG.md`.

Rule IDs (W words, S structure, R repetition, P punctuation, H hedging and tone, F facts) are the ones `slop-lint.mjs`
prints in square brackets. Numbers tagged (house) are our own starting limits, not research findings. Calibrate them on
pages written before 30 November 2022 if you have any. Numbers attributed to a source are that source's.

---

## 0. Ground rules and priority order

**0.1 Priority order: facts, then clarity, then voice, then style.** A lower rule never overrides a higher one. A style
rule that would change a number, a qualifier, a quotation or a citation loses (section 5). A voice rule that makes a
sentence unclear loses. Where two sources disagree below, the stricter rule wins unless it harms clarity, and the
exception is written next to it.

**0.2 Judge the prose, not the tool.** The bar is whether a reader can use the text, not who or what produced it. In the
one study Wikipedia cites (German theses), readers picked out AI text 57% of the time and human text 64% of the time.
Detectors misfire, especially on non-native English writers, and Wikipedia's own guide says not to treat its signs as
the problems to fix. Every rule here is justified by reader cost: vague claims, padding, unsupported facts, sameness. A
text can pass every rule and still be empty. A text can trip several and be fine. Never say "this sounds like AI" in a
review; say what the reader loses.

**0.3 One tell is weak, a cluster is strong.** Three levels of response:
- Act on one sighting: chatbot residue, tool artifacts, placeholders, "not X, it's Y", stock significance phrases, one-line closers.
- Act on two or more in the same paragraph: tier B words (W2), forced triads, -ing riders, stacked hedges.
- Act only on density: tier C words, dashes, colons, bold, passive voice, curly quotes, repeated openings.

**0.4 Structure outlasts word lists.** Word habits change with each model generation. Wikipedia's era table shows
"delve" peaking in 2023 to mid-2024 and falling in 2025, while "not X, but Y" kept going. Treat W1 to W3 as a data
file to refresh, and treat S and R rules as the core. Do not swap a flagged word for its nearest synonym ("delve",
"explore", "navigate", "unpack" is one tell wearing four coats).

**0.5 Do not overcorrect.** Editing out every sign of fluency makes a new tell. Keep:
- Em dashes that do a job (a paired aside, an interruption), within the P1 limit. Editors who strip every dash from
  fear of looking automated damage good sentences.
- Transitions that state a real relationship: because, however, therefore, for example, instead.
- Passive voice when the actor is unknown, irrelevant or would distract.
- One genuine "not X, but Y" correction per piece, and any triad whose three items are distinct.
- A hedge that carries real uncertainty, a stated scope, a legal or safety notice.
- Technical terms, product names, UI labels and defined terms, repeated exactly (R3).
- A sourced definitive claim ("the first", "the only"). Human writers use these more than models do. Cut only unsourced inflation.
- "Very", "perhaps", "tends to": human text uses them more than model text does. They are not defects.
- A page whose rhythm is already varied. Do not chop sentences to fake variety.

**0.6 Do not install a new fingerprint.** An independent stress test of one popular humanizer found its output had its
own recognizable voice. Never add to text that lacked them: fragments for rhythm, "honestly", rhetorical questions,
invented first-person experience, forced contrarianism, performed candor, intentional typos, manufactured stakes,
invented specifics. Subtract and sharpen. Add voice only by surfacing what the author already wrote.

**0.7 Text written before 30 November 2022 is not model text.** Do not "humanize" it. Leave its voice alone and fix only
errors of fact or clarity (F13).

**0.8 Scope.** These rules cover English nonfiction, documentation, editorial pages and product copy. Fiction and
dialogue need their own exceptions. Quotations, titles, code, commands, interface labels and legal text are protected
regions (F9). The house voice in `VOICE-SPECTRE.md` may override a style rule (for example bold key numbers), never
a fact rule.

### 0.9 Where the sources disagreed, and what this file does

| Question | Disagreement | Decision |
|---|---|---|
| Em dashes | Some skills: zero. One skill: 1 per 1,000 words, "not an authorship signal". Wikipedia (Oct 2026): overuse is a historical sign, and newer models over-correct to commas and periods. A second research set: review above 4 per 1,000. | Strictest workable limit: aim for 1 per 1,000 words, warn above 2, never more than 2 in a paragraph. No ban. See P1. |
| Adverbs | "Kill all adverbs" vs human text using "very", "perhaps". | No adverb ban. Delete intensifiers that add nothing (H3). `-ly` is not a defect. |
| Passive voice | "None allowed" vs "weak alone". | Not flagged by the linter. Fix it when the reader's next question is "who?" (S18). |
| Triads | "Use two items or one" vs "keep three real items". | Three real items stay. Test each item for a distinct idea (S6). |
| Hedging | "Avoid hedging even at the risk of overstating" (Gwern) vs "preserve uncertainty". | Keep the one hedge that carries real uncertainty, cut stacks, and never turn a hedge into certainty (H1, F3). Fact fidelity outranks directness. |
| Word lists | Tier A bans vs "review in context, never ban". | Tier A words are replaced on sight in the listed sense. Literal, technical, quoted and attributed uses are exempt (W6). |
| `utilize`, `in order to` | Counted as tells vs "clarity edits only". | Clarity edits, not evidence. Listed in W5. |
| Lists and bold | Near-ban vs "accessibility can justify heavy use". | Prose by default. Steps, parameters and real comparisons may be lists. Reference pages may be list-heavy (P4). |
| Quotation handling | One style guide silently normalizes quotes; the news standard forbids it. | Quotes are verbatim, always (F5). |
| Repeating a noun | "Vary your nouns" vs "one label per concept". | One label per concept (R1d, R3). |

---

## 1. Banned and overused words and phrases

**1.0 Method.** Identify the sense, not the string. "Landscape" in a painting, "robust" in statistics, "key" on a
keyboard, "leveraged buyout" in finance and "underscore" the character are fine. When a replacement needs a fact you
do not have, cut the clause or leave a `[NEED: ...]` marker (F1). Replacing a slop word with a plainer word is only the
minimum. The better repair states what the word was standing in for.

### W1. Tier A: replace on sight (one hit is enough)

| Avoid | Use instead |
|---|---|
| delve into, delves, delving | look at, examine, or just state the finding |
| tapestry, rich tapestry (abstract) | the actual parts: "a mix of Arab, Indian and Italian cooking" |
| testament to, stands as a testament | shows, proves; or give the fact it proves |
| underscore(s), highlight(s) as a verb for importance, emphasize | shows, says; or cut and let the fact stand |
| showcase(s), showcasing | shows, includes, lists |
| pivotal, crucial, vital, key (adjective), "plays a pivotal role" | important, needed; or say what depends on it |
| intricate, intricacies, meticulous(ly), nuanced, multifaceted | complex, careful, detailed; or name the complication |
| vibrant, bustling, thriving, nestled, breathtaking, renowned, must-visit, "diverse array", "in the heart of" | say what the place is and give one checkable detail |
| landscape (abstract), realm, ecosystem (metaphor), paradigm, beacon, symphony, cornerstone, game-changer | field, market, model, area; or the concrete thing |
| robust (figurative), seamless(ly), comprehensive, cutting-edge, state-of-the-art, best-in-class, world-class | reliable, smooth, complete, new; or give the number or the test |
| leverage (verb), utilize, facilitate, harness, unlock, unleash, empower, streamline, spearhead, elevate | use, help, run, let, simplify, lead; or name what changed |
| bolster, garner, foster, enhance, interplay, enduring (legacy), deeply rooted, indelible mark | strengthen, get, encourage, improve, relationship; "lasting" with a duration; or cut |
| navigate (challenges), unpack, lean into, double down, deep dive, circle back, moving forward | handle, explain, accept, commit, analysis, return to, next |
| serves as, stands as, functions as, boasts, "represents a", "marks a" | is, has |
| Moreover, Furthermore, Additionally, In addition, Notably, Importantly (as sentence openers) | And, Also; or restructure so the link is obvious; or nothing |
| align with, resonate with, contribute to, valuable insights | match, appeal to, cause; or say what the insight was |
| "it's not X, it's Y" and every form in S1 | state Y |
| "not just X but Y", "more than just a", "less about X and more about Y" | state Y; keep a contrast only if someone held X (S1) |
| "in today's fast-paced / ever-evolving / digital world", "in an era of" | delete; start with the subject |
| "Let's dive in", "Let's unpack", "Let's break this down", "without further ado" | delete; begin |

<!-- slop-lint-ignore -->
Linter note: words that are too often legitimate to flag singly (crucial, vital, key, comprehensive, robust, enhance,
facilitate, harness, streamline, navigate, ecosystem, symphony, cornerstone, utilize, "in the heart of") are checked
only as tier B clusters. Edit them on sight when you read the text; the linter will not insist.

Leverage: the verb is management-speak. "Leveraged buyout", "highly leveraged", "operating leverage" and "leverage
ratio" are finance terms and stay. The linter flags the verb and skips the finance senses.

### W2. Tier B: flag when two or more distinct words share a paragraph

<!-- slop-lint-ignore ai-vocab,ai-vocab-soft -->
crucial, key role or factor, highlight (verb), emphasize, enhance, robust, comprehensive, valuable, resonate,
encompass, poised, burgeoning, nascent, quintessential, overarching, paramount, landscape, ecosystem, quietly, deeply,
journey, streamline, facilitate, navigate, notable, iconic, storied, captivating, stunning, thriving, evolving,
holistic, innovative. Low confidence (one source, mid-2026 list): dependable, universally, prioritize.
One of them in a paragraph is ordinary English. Two or more is a cluster; rewrite the paragraph around its facts.

### W3. Tier C: flag only on density

significant(ly), innovative, effective(ly), dynamic, scalable, compelling, unprecedented, exceptional, remarkable,
sophisticated, instrumental. Flag a word when it appears at least max(4, 1% of the words) times in a document (house;
a more lenient source uses 3%). Replace with the number, the comparison or the example.

### W4. Stock phrases and formulas

| Family | Fix |
|---|---|
| "It's worth noting that", "It's important to note", "It should be noted", "Needless to say" | delete the lead-in; if the caveat changes what the reader does, state it as a fact |
| "At its core", "At the end of the day", "When it comes to", "The reality is", "The truth is", "The heart of the matter" | delete and state the point |
| "Here's the thing", "Here's what you need to know", "Let me be clear", "Plot twist", "Real talk", "Let that sink in", "Read that again", "Full stop." | delete |
| "plays a crucial role", "marks a pivotal moment", "sets the stage for", "reflects broader trends", "shaping the future of", "evolving landscape" | give what happened, when, with what effect. No effect to state: cut |
| "Despite its challenges, X continues to thrive", "The future looks bright", "Exciting times lie ahead", "Only time will tell" | state the specific problem and the specific response, or end on the last concrete fact |
| "a stark / powerful / poignant reminder", "serves as a reminder", "faced numerous challenges", "providing valuable insights into" | cut, or state the reminder or the insight |
| "In conclusion", "In summary", "To sum up", "All in all", "Ultimately," | end on the last new fact (S13) |
| "I hope this helps", "Great question!", "Certainly!", "You're absolutely right", "Would you like me to", "Here is an overview", "As an AI language model" | remove the wrapper, keep the content (S19) |
| "As of my last update", "based on available information", "while specific details are limited", "maintains a low profile" | state what the source shows; never guess (F6) |
| "Experts say", "studies show", "research suggests", "many believe", "it is widely regarded" | name the source or cut (H6) |
| "Seamless", "effortless", "game-changing", "supercharge", "revolutionize", "next level", "blazingly fast" | give the number and the condition, or cut (H7) |
| cliches: "cautionary tale", "a household name", "paved the way", "stood the test of time", "took the world by storm", "lessons learned", "food for thought", "a double-edged sword" | state the fact the cliche gestures at |

### W5. Clarity edits that are not AI tells

utilize, commence, ascertain, endeavor, "in order to" (to), "due to the fact that" (because), "at this point in time"
(now), "in the event that" (if), "has the ability to" (can), "on a daily basis" (daily), "a large number of" (many; the
count if known), "make a decision" (decide). Shorten them for concision (Strunk, Orwell), but never count them as
evidence of anything. "In order to" can help parsing. "Only if" and "if", "can" and "may" do different jobs.

### W6. Words to keep

"Actually" when it marks a real correction. "Key" as a noun. "Landscape" for terrain or page orientation. "Robust" in
statistics and engineering. "Gate" in code. "Challenge" for a literal challenge. "Underscore" for the character.
"Leveraged buyout". "Journey" for actual travel. "Foster" in foster care and the surname. Any word inside a direct
quotation, a title, a proper name or a defined term. A name such as Foster City or Clearly Canadian is a name, not a
tell. A word being overused by models does not make its synonyms suspect.

### H. Hedges, intensifiers, signposting and tone

H2 (fake balance) and H6 (vague attribution) sit in section 2, next to the structures they belong with.

**H1. Hedging.** Cut stacks: "could potentially", "might possibly", "may arguably", "it could be argued that", "in some
cases it may". Keep one modal that carries real uncertainty, a stated condition, a scope limit, a safety or legal
notice, and ordinary "perhaps" and "tends to". Say what the uncertainty depends on. Calibrated words (certain, likely,
possible, unlikely) beat vague ones. Never remove a hedge in a way that raises certainty (F3). "The update may
potentially reduce memory use" becomes "The update may reduce memory use", not "The update reduces memory use".

<!-- slop-lint-ignore -->
**H3. Empty intensifiers.** Delete when deleting changes nothing: really, truly, genuinely, honestly, literally,
incredibly, extremely, remarkably, profoundly, utterly, absolutely, undoubtedly, "quite frankly", "to be honest". Mild
ones (very, quite, deeply, clearly, obviously, of course) are reviewed, not banned. Replace with the measurement when
the evidence supplies one ("The file is 8 GB"). When the size is unknown, remove the intensity; do not manufacture a
number. Keep "actually" for a real expectation gap, "literally" in its literal sense, and modifiers that change
meaning: approximately, partially, locally, statistically. An -ly ending is not a defect. The linter flags density above
6 per 1,000 words.

**H4. Lazy extremes.** Every, always, never, everyone, nobody, all and none used as rhetorical force. Replace with the
count or scope ("in 9 of the 12 trials"). Keep them when the statement is exactly true.

**H5. Signposting and meta-commentary.** "Let's explore...", "In this section we'll cover...", "As we'll see below",
"Let me walk you through", "Here's what I mean", "Think about it:", "Now let's look at", "Moving on to". Delete. The
reader can see the structure. Transitions that
state a real relationship (because, however, for example, therefore) stay. Three or more generic openers in five
sentences means the organization needs review, not a synonym swap.

<!-- slop-lint-ignore -->
**H7. Over-promising and sales language.** Seamless, effortless, game-changing, unlock, supercharge, revolutionize,
"take X to the next level", unquantified "significantly faster", "blazingly fast". Give the number and the condition it
was measured under, or cut.

**H8. Sycophancy and condescension.** Delete "Great question!", "You're absolutely right!", "I'd be happy to", "Hope
this helps", "Feel free to reach out". In instructions, drop "simply", "just", "easy" and "obviously" when they judge
the reader's ability; state the step and its prerequisites. Keep "just" or "simply" when they set a real scope ("just
one account"). Contractions, humor and opinions fit an established voice. Fake memories and planted typos do not (F10).

---

## 2. Structural tells

S1 to S5 justify an edit on one sighting. The rest are judged in context.

**S1. Not X but Y (negative parallelism).** Forms: "It's not X, it's Y"; "This isn't about X. It's about Y"; "not
only X but also Y"; "not just X but Y"; "more than just X"; "less about X and more about Y"; "stops being X and starts
being Y"; "This does not mean X. It means Y"; stacked "Not a X. Not a Y. A Z."; clipped "no setup, no config, no
hassle" and "..., no guessing". The negative half names something nobody claimed, so the positive half sounds bigger
without adding a claim. Keep a contrast only when (a) a named person or the reader holds the false belief, or (b) both
halves carry information ("the command deletes the local cache, not the remote files"). One genuine correction per
piece is allowed. "Not only X but also Y" is a warning, not an error, because it is ordinary formal English.

**S2. One-line closers and dramatic fragments.** "That is the real win." "That distinction matters." "Read that
again." "The result? Clarity." A sentence that only says the previous sentence mattered. Rule: a short sentence stays
only if it carries a fact the previous sentence did not. The same closer after several sections is always cut (R1b).

**S3. Sayings that sound deep, and vague declaratives.** "The implications are significant." "The stakes are high."
"The reasons are structural." "Efficiency becomes a trap." Say the specific thing. If you cannot name the implication,
delete the sentence.

**S4. Staged run-up and performed candor.** "Honestly?", "Look,", "Real talk", "Let's be honest", "To be clear",
"Quick note:", "Spoiler:", "I promise". Delete the run-up. "Honestly" inside a casual sentence is fine. A standalone
opener before a routine claim is the tell.

**S5. Arguing with no one.** "A tempting approach would be to...", "You might think...", "Don't get me wrong." Check
whether anyone raised the objection. If not, state the claim.

**S6. Forced triads.** Adjective, noun or verb triplets, three parallel examples, three short facts then a moral. Test:
does each item add a different idea? Merge overlapping ones, develop the one that matters. Three real items stay
(a workflow with three steps has three steps). Counted on density by the linter.

**S7. Shallow -ing riders.** A participle bolted on to add importance: ", highlighting the importance of...",
", reflecting a deep connection to...", ", fostering...", ", showcasing...", ", ensuring the...". Keep the main-clause
fact. Keep the rider only if the source states it as a separate, attributable claim. Even when attached to a real
source ("Ebert highlighted the lasting influence") check that the source says it (F7).

**S8. The "challenges and future" outline.** "Despite its X, Y faces challenges... continues to thrive", "Future
Outlook", "Challenges and Legacy". The formula is the tell, not the mention of challenges. Name the specific problem
and the specific response, or stop at the last concrete fact.

**S9. Significance inflation.** Ordinary facts dressed as turning points: "marking a pivotal moment", "reflects
broader trends". Models regress to the mean: a specific fact ("inventor of a train-coupling device") becomes "a
revolutionary titan of industry". Restore the specific fact. Keep a significance claim only when a source makes it, and
name the source.

**S10. Vague association and borrowed authority.** "Associated with", "in connection with", "linked to" where a plain
verb exists ("was CEO of", "taught at"). Prestige-outlet lists. "Independent coverage". If the source does not say how
two things are linked, keep the vague word rather than invent a role. If no real source exists, cut (H6).

**S11. Inline-header lists and decorative bullets.** "- **Performance:** Performance has been improved..." (label
repeated in the body). Five or more bullets of bare noun phrases. Bold on every item. Emoji bullets. If the labels add
nothing, write one sentence (P4).

**S12. Heading habits.** Title Case On Every Heading. Emoji or arrows in headings. "Conclusion", "In Summary", "Final
Thoughts", "Key Takeaways", "Looking Ahead". A heading restated by the first sentence under it. A top-level heading
that repeats the page title. Skipped levels. Slogan headings ("The decision, on one screen") instead of labels ("How
the six options compare"). Use sentence case. Headings name the content.

**S13. Section summaries and conclusions.** "In summary", "Overall", "Ultimately," at the end of a paragraph that
restates it. Cut the restatement and end on the last new fact. A navigational recap in a long reference document is
fine.

**S14. Writing about the document instead of the subject.** "This section explores...", "In this article we'll...",
"As we'll see", "The table below compares...", "was added to replace the previous approach", "anything unconfirmed is
flagged rather than guessed". Keep a caveat that changes what the reader should do. Mention earlier versions only in
changelogs. One short orienting sentence at the top of a long document is acceptable.

**S15. Rhetorical questions the next sentence answers.** "The result? ...", "What if I told you...?", "So what does
this mean?", "Why does this matter?" Make the statement.

**S16. False agency and personification.** "The complaint becomes a fix." "The data tells us." "The market rewards."
"The plan remembers." "The code knows." Name who acts, or address the reader. Software and physical objects may be
grammatical subjects ("The server rejects expired tokens"): do not invent a human operator. Figurative verbs on
inanimate subjects in technical prose ("a fix arrived", "a setting carries a value") only where the metaphor adds meaning.

**S17. Uniformity.** Every sentence the same length, every paragraph ending on a punchy line, every section the same
shape (claim, three bullets, moral). The Economist (July 2026, read through secondary reports) found model text has longer "and"-chained sentences and fewer commas, semicolons and parentheses than professional writing. One source reports newest models clustering in an 8 to 20 word band. The
linter reports sentence-length variation (CV below 0.4) and the share of short paragraph endings. Vary shape by
changing what you say, not by chopping sentences (0.6).

**S18. Copula avoidance and missing subjects.** "Serves as", "stands as", "boasts", "features" for "is" and "has".
"No configuration file needed. Results are preserved automatically." becomes "You do not need a configuration file.
The system preserves results automatically." Passive voice is not an error: keep it when the actor is unknown or
irrelevant, fix it when "who?" is the reader's next question ("A decision was made by the committee" becomes "The
committee delayed the launch").

**S19. Chatbot residue and wrong-reader replies.** Greetings, praise, offers ("Would you like me to..."), sign-offs,
"Here is an overview", knowledge-cutoff disclaimers. A required disclosure about AI use is not residue. In a reply,
lead with the decision, keep the one fact the reader lacks, and move the proof to a document.

**S20. Decoration with no meaning.** Step numbers on content that is not a sequence, eyebrow labels, dividers between
every section. A structural device must encode information about the content.

**S21. Lead with the answer; stop when done.** In the first paragraph, give the decision, event, finding, definition
or task. Background goes first only when the answer would be unintelligible without it. Do not force narrative into an
instruction template. End on the answer, consequence, limit or next action, not on an inspirational restatement.

**S22. Every paragraph has a job.** Establish a claim, explain a mechanism, present evidence, state a limit or tell
the reader what to do. At each transition name the relationship: cause, condition, comparison, inference, change of
scope. If two paragraphs do the same job, merge or cut one. Write "because" only if the causal link is established.

**S23. Deck-closer formula.** "This is the full post-mortem, built from the company’s own SEC filings, contemporary press
and the archived website." "A sourced post-mortem of X." Written once, it is a method note; pasted onto every page, it is
a template the reader learns to skip, and it ends the deck on the writer instead of the subject. End the deck on the
subject. Sourcing goes in the sources section, or in one sentence specific to this page ("The filings and the CDC’s
reports disagree about the count, and the page says where"). Linter: `deck-closer` (error).

**S24. Scene-setting opener.** "Picture a strip mall in Dallas…", "It was a cold morning in Pittsfield when…", "On a
rainy day in 2008…". The scene stands in for a fact the writer has not stated yet, and it is usually invented weather.
Open with the fact: "The first store opened in Dallas on October 19, 1985." Linter: `scene-opener` (warn), plus
`signpost` for "Picture this". Same family: "This post looks at…", "This page examines…" (`meta-doc`).

**S25. Link-holder sentences.** A sentence whose only job is to carry a link: "X is filed under the same cause",
"another console on this site", "covered on this site". Link words that already make a comparison, or leave the page
unlinked; never assert a parallel the other page does not support. Linter: `site-filler` (warn).

**S26. Honest anchors.** The anchor promises its destination. "SEC filings" or "sources" links to this page’s
sources (`#sources`), not to a general methods page; "editorial judgment" may link to the method. An anchor naming a
rival links to that rival’s page, not to a different product of the same company ("Sega" is not the Dreamcast page).
Linter: `link-anchor` (warn) for source words pointing at /about/.

**S27. Answer-first does not mean one template.** An answer-first deck opens with what the thing was and what happened
to it, but "X was a/an/the …" on thirty pages in a row is a new formula (R2). Vary the grammatical subject: lead with the
decisive fact, the number, or the owner when that is the clearer answer. Compress without changing precision: keep
"about", "most of", "at first", ranges and the exact event (F9).

**H2. Fake balance and evasion.** "There are valid points on both sides." "It depends on various factors." "A balanced
approach." "The answer is not straightforward." "While X offers many benefits, challenges remain." Take the position the
evidence supports, name the factors, or say what you do not know. Weight conflicting claims by evidence and relevance,
never by equal word count, and keep genuine disagreement. Do not invent an opposing side to sound fair. "It depends.
Each format has strengths and weaknesses. CSV is required by the importer; JSON is required by the API" becomes "Use CSV
for the importer and JSON for the API."

**H6. Vague attribution and overgeneralization.** "Experts say", "studies show", "research suggests", "many believe",
"critics argue", "industry reports", "it is widely regarded", "it has been noted". Name who said it, what they said,
where and when, or cut the claim. A missing citation alone is not a tell. A vague authority standing in for a source
is. Never invent a named researcher or study to repair it (F1). The linter does not flag a vague attribution that a
footnote marker follows.

---

## 3. Repetition

Models converge on the same stock moves, within one model and across models, so a site drafted with their help repeats
itself across pages even when each page reads fine alone. Check the document, then the whole content tree.

### R1. Within one document

| ID | Check | Fix |
|---|---|---|
| R1a | Three consecutive sentences open with the same word or two words (not deliberate anaphora, not dates) | Merge, or lead with the action |
| R1b | Every section ends on a short sentence, or on a restatement of its heading | Cut the closers (S2, S13) |
| R1c | A tier A word twice, or any non-topic word above max(4, 1% of words) | Replace with the specific thing |
| R1d | Synonym cycling: one referent, a different noun each time ("the constraints of socialist realism", "the challenging climate of Soviet artistic constraints") | Repeat the right word. Technical terms never vary (R3) |
| R1e | The same proposition stated three times (intro, body, conclusion) without a new function | Keep the clearest occurrence |
| R1f | The same sentence of 12 or more words twice | Keep one, or link to it |
| R1g | A repeated word ("the the"), outside "had had" and quotations | Delete one |
| R1h | The same claim shape in every section ("X. Not Y. Z." or "First, second, third") | Vary what you say |

Repetition is right for instructions, a warning at the point of action, a deliberate summary and accessibility.

### R2. Across a site (run over the whole content tree, not per file)

| ID | Check | Fix |
|---|---|---|
| R2a | A passage of 7 or more words in body prose on 3 or more pages (exclude code, quotes, navigation, approved boilerplate) | Rewrite the weakest page, or whitelist a deliberate term of art |
| R2b | Identical or near-identical final sentence on 2 or more pages | Remove the closers |
| R2c | The same H2 sequence (3 or more headings) on 3 or more pages | Headings come from the content |
| R2d | The same first four words in the opening sentence on 3 or more pages ("In today's...", "X is a... that...") | Rewrite the openings |
| R2e | The same figure of speech (tapestry, journey, ecosystem, lens, symphony, realm, landscape) on 3 or more pages | Say the literal thing on all but one page |
| R2f | Stock LLM names in examples: Elara Voss, Aris Thorne, Elias Vance, Whispering Woods, Eldora | Use real names from sources, or neutral labels |
| R2g | The same analogy or worked example on several pages | Use it once and link to it |
| R2h | Pages all land in a narrow word-count band with equal paragraph counts | Let length follow the evidence |
| R2i | The same caveat paragraph pasted into many pages | Put it once in a shared place and link |
| R2j | Near-identical pages that differ only in a name or a number | Each page needs its own evidence, or it needs to be one page |

Do not fix R2 by shuffling one generic promise into three paraphrases. The repeated absence of information is the problem.

### R3. Boilerplate and deliberate consistency are not repetition

Keep identical, everywhere: product names, UI labels, units, number formats, spelling variety, defined terms, legal
notices, source-line wording, and a section skeleton that serves readers (Prerequisites, Steps, Result). Pick one
spelling variety (US or UK) per site and hold it, since a sudden switch is itself a sign of stitched text. Shared text
that readers need is fine; shared text that carries no page-specific fact is the finding. Record deliberate repeats in an allow file (`--allow FILE`, or `slop-lint-allow.txt` in the working directory; the Spectre site's own boilerplate is built into the linter) so a new, unplanned repeat stands out.

---

## 4. Punctuation

**P1. Em dashes (and en dashes, and double hyphens).** Overuse was a strong sign from 2022 to 2025. Wikipedia (Oct
2026) now files it as a historical sign, newer models avoid it and some over-correct into commas and periods only.
Therefore a limit on density, not a ban.
1. Aim for at most 1 em dash per 1,000 prose words. The linter warns above 2 per 1,000 (documents of 300 or more words) and at 3 or more in one paragraph. Headings count.
2. No spaced dashes (` — `) and no double hyphens (` -- `) as dashes.
3. En dashes only for ranges (1998–2004, pp. 12–18), including a spaced range if the house style uses one.
4. When removing a dash, choose by meaning. A period if it separates two claims. A comma pair or parentheses for an aside. A colon only if what follows explains or lists what came before. Rewrite if the dash staged a reveal.
5. Do not convert every dash to a comma; a text of only commas and periods is flat.
6. Exempt: code, URLs, quotations, and an author whose own pages show a steady dash rate (match the sample).

**P2. Colons.** Fine after a full clause that introduces a list or an explanation, and in times, ratios and code. A
tell: "Label: Sentence" in running prose, and a colon that stages a reveal ("The problem: trust."). Limit: about 1 per
150 words of running prose, never more than 2 in a sentence, never directly after a verb or preposition ("The options
are: A, B"), never at the start of three consecutive paragraphs. Labels on a table or definition list are not prose.

**P3. Semicolons and parentheses.** Models use fewer of both than professional writers. Do not add them to look
human. If a page over 600 words has none, no variation in sentence length and a mechanical read-aloud rhythm, look
again at the sentences. Treat that as a prompt, not a defect.

**P4. Lists.** Prose by default. A list is for parallel, independent, scannable items: steps, options, parameters,
reference entries. Not more than one list per 250 words of body text, no list of fewer than three items, no list of
bare one-word items outside a reference list, numbering only for ordered steps, at most two levels, consistent
grammatical form. No bold lead-in plus colon on every item (S11). Exception: reference pages, checklists and
accessibility needs may be list-heavy. A table is for a real comparison.

**P5. Bold, italics, headings.** Bold: none in running prose, except a defined term at first use or a real warning
(at most one bold phrase per major section). Never bold every instance of a keyword or a whole sentence. Restructure so
the point leads instead. A house style may bold a figure by design (see `VOICE-SPECTRE.md`); that is a style choice,
documented, not a habit to spread. Sentence-case headings, no trailing colon, no emoji.

**P6. Quotes, apostrophes, ellipses, exclamation marks, emoji.** Curly quotes alone mean nothing (editors auto-curl).
Pick one style per site and keep it; mixed curly and straight in one page is the tell. Straight quotes in code and
commit messages. At most 1 exclamation mark per 500 words in expository text. No ellipsis as a trailing-off flourish.
No emoji in headings or bullets of expository writing. Hyphenate a compound modifier before a noun ("a high-quality
report") and not after ("the report is high quality").

---

## 5. Factual integrity

These rules override everything above. They bind the writer and the editor equally.

**F1. Never invent.** No fact, name, number, date, quote, source, feature, ranking, cause, anecdote, example company or
person unless it comes from the source material or the user. A fabricated specific is worse than the vague sentence it
replaced. When a rewrite needs a detail you lack, write the simpler true sentence, or leave a visible gap marker:
`[NEED: what the page needs and where it should come from]`. A gap marker is a deliverable, not a failure. The linter
reports every one as a warning until it is resolved.

**F2. Keep every citation, and keep it attached to its claim.** Before and after any edit, list the footnote markers,
links, DOIs, quoted strings, numbers with units, years, and proper names. Compare as multisets so a lost second
occurrence shows. If a sentence is split, merged or moved, the marker moves with the claim it supports. A marker at the
end of a sentence that now carries two claims must be split or re-pointed. No citation disappears to make prose
smoother, and no marker gets attached to a claim its source does not support. Use `slop-lint.mjs --diff before after`.

**F3. Do not change certainty.** "May" does not become "will", "about 10%" does not become "10%", "some" does not become
"most", "associated with" does not become "caused". Keep a source's hedge when it carries real uncertainty, even in a
blunt voice. Remove only redundant cushioning ("may potentially" becomes "may").

**F4. Preserve the precision and scope of numbers.** Keep denominators, populations, periods, units, baselines,
approximation and direction. Percent is not percentage points. A derived figure is labeled as derived and its
arithmetic is recorded. Estimates say whose estimate. Do not round a figure for rhythm.

**F5. Quotations are verbatim.** Same words, spelling, punctuation and caveats, with omissions and insertions marked.
A paraphrase goes outside quotation marks with its attribution. Never improve a speaker's grammar, strengthen a verb
or drop a qualifier inside quote marks. Never invent a quote to fix a missing one.

**F6. Do not turn missing data into a guess.** Allowed: "The founding date is not stated in the sources reviewed."
Not allowed: "likely founded in the 1990s", "maintains a low profile", or a speculative explanation of why a record is
absent. State what the source shows. If a source is thin, the page is thin (F12).

**F7. Attribution must match the source.** If a claim is tied to a named source, the source says it. Models attach
superficial analysis to real sources regardless of what they say. After restructuring, reread each citation in its new
position: splitting a sentence can make a source appear to support a claim it never made, and merging paragraphs can
blur which source supports which finding. Separate observation, inference, recommendation and example, and label each.

**F8. Verify that every citation exists and says what you cite it for.** The URL resolves, a DOI resolves to the right
title, authors, year and venue match, and the passage supports the sentence. Remove tool artifacts and tracking junk:
`oaicite`, `contentReference`, `turn0search0`, `[cite: 1]`, `grok_card`, private-use "cite" characters,
`utm_source=chatgpt.com`, `referrer=grok.com`, placeholder dates like `2025-xx-xx`. Hallucinated citations have reached
accepted conference papers (GPTZero's analysis of NeurIPS 2025, reported by TechCrunch; counts differ between
reports), so a plausible-looking reference is not evidence.

**F9. Protected regions.** Do not restyle code, commands, paths, URLs, front matter, data tables, block quotes, titles,
proper names, interface labels or legal text. Report a problem found there instead of editing it. Quoted examples of
bad writing (like the ones in this file) are exempt from the rules.

**F10. Do not invent a human.** No "in my experience", "I once worked with", "when I first tried it", no invented
reactions, mistakes or opinions, unless the author wrote them. Do not add errors to simulate a person.

**F11. No placeholders or drafting leftovers.** `[Insert...]`, `TODO`, `TBD`, "Delete before submission", "Reviewer
note:", "lorem ipsum", unfilled `[NEED: ...]` markers. None ship.

**F12. If the source is thin, the page is thin.** Do not pad. A short, accurate page beats a long one that needs S8 and
S9 to fill space. Do not weaken a sourced definitive claim into a hedge either.

**F13. Pre-2022 text is human text.** See 0.7.

---

**F9. Compression drift.** When a sentence is shortened for a title, meta description or deck, check each qualifier
survived: "about 3,400" is not "3,400"; "most of the $83 million loss" is not "the $83 million loss"; "valued at
$7.78 billion at the first day’s close" is not "its IPO valued it at". No superlative ranking ("grew faster than
anything the internet had seen") without the figures or a named source (`unsupported-superlative`). No structured-data
answer that is not visible on the page (no FAQPage whose questions the reader never sees).

## 6. The finishing procedure

Run in this order. Stop when a step exposes missing evidence, and fix the evidence, not the prose.

**Step 0. Scope.** What kind of text is this (reference, essay, news, product page, reply, commit message)? Who is the
reader, and what do they already know? Is there a voice sample, or a house voice file? Mark the protected regions (F9).

**Step 1. Freeze the facts.** Extract every URL, footnote marker, quote, number with unit, date, year and proper name.
Save the list or keep the original file for the diff.

**Step 2. Read once, mark the tells, strongest first.**
1. Chatbot residue, artifacts, placeholders, source-gap guesses (S19, F6, F8, F11).
2. S1 to S5, then S9, S8, S10, S7.
3. W1 words; W2 and W3 only as clusters or density.
4. S6, S11, S12 (triads, lists, headings).
5. P1 to P6 counts, R1 repetition.
Also look at paragraph shape: a contrast split over two sentences, three parallel examples or a closer after every
section is the same tell at a larger size.

**Step 3. Fix by stating, not patching.** For each mark ask: what would I say if I could not use this phrase? Write
that sentence. Replace the whole sentence, not one word. If nothing is left, delete it.

**Step 4. The four reader tests.**
1. New information: after this sentence, what does the reader know that they did not? Nothing: delete.
2. Specificity: could the sentence sit unchanged on a page about a different subject? Yes: make it specific or delete.
3. Challenge: would a careful reader ask "according to whom?", "how much?", "compared with what?" Answer in the text or remove the claim.
4. Read aloud: would you say this to a colleague? If it sounds like a pull quote, rewrite it.

**Step 5. Check what you may have installed (0.6).** Count fragments under five words, rhetorical questions,
"honestly", first-person asides, sentences starting with "And" or "But". None may exceed what the original author used.

**Step 6. Check across pages (R2).** Open two or three sibling pages. Do the openings, closers, headings and
examples differ because the content differs?

**Step 7. Run the linter** (below). Fix each finding or record why it stays.

**Step 8. Diff the facts.** Compare with Step 1: every URL, marker, quote, number, date and name present and
unchanged. Anything added must trace to the source or the user. Anything dropped must be dropped by a rule you can name.

**Step 9. Cap the loop.** At most two editing passes. After the second, report residue instead of rewriting again;
overediting is how new fingerprints appear. Report what changed, what you left on purpose and why, which checks ran
(linter or reading only) and every `[NEED: ...]` gap.

### Checklist

- [ ] No chatbot residue, placeholders, tool artifacts or tracking parameters
- [ ] No "not X, it's Y" unless someone held X; no sentence that only says a point mattered
- [ ] No tier A words in the listed sense; no tier B cluster
- [ ] No "plays a pivotal role", "stands as a testament", "in today's fast-paced", "Let's dive in"
- [ ] Triads justified; bold and bullet labels removed unless needed; headings in sentence case
- [ ] Em dashes at most 1 per 1,000 words and 2 per paragraph; colons purposeful
- [ ] One calibrated hedge per claim; no fake balance; no "experts say"
- [ ] Openers, closers, stock words and examples not repeated in the page or across pages
- [ ] Every fact, quote, number, link and citation traced and preserved, markers still on their claims
- [ ] Nothing added to sound more human; no invented anecdotes or specifics
- [ ] Reads aloud as one person talking to one reader

### Running slop-lint

Zero dependencies, Node 18 or later. Run it from the repository you are checking.

```
node slop-lint.mjs                       # Spectre Brands repo content from the current directory
node slop-lint.mjs page.md docs/         # markdown, text and json files (tests/bad.md is skipped in directories)
node slop-lint.mjs --quiet               # totals and per-rule counts only
node slop-lint.mjs --top 100 --info      # longer issue list, including info
node slop-lint.mjs --only chatbot,placeholder --strict   # CI gate on named rules
node slop-lint.mjs --diff before.md after.md             # F2 fact check (exit 1 with --strict)
node slop-lint.mjs --allow boilerplate.txt               # deliberate repeats, one phrase per line (--no-allow: drop the built-in Spectre list)
node slop-lint.mjs --list-rules          # every rule id, severity and RULES.md reference
node slop-lint.mjs --selftest            # fixtures in tests/ plus micro cases; run after any rule edit
```

Severity: **error** means rewrite it (residue, placeholders, tier A words, S1 forms, significance formulas). **warn**
means look at it. **info** is context and statistics, and the findings inside quotations, which belong to the source.
Exit code 1 only for `--strict` with errors, or `--selftest` failure.

Scope it handles for you: front matter, code fences, inline code, block quotes and tables are skipped. JSON pull
quotes, press clips and archived page text are treated as quotations. A capitalised word mid-sentence, or one that
starts a capitalised name, is a name. Finance senses of leverage, and physical or statistical senses of landscape and
robust, are skipped. Footnote markers are removed before matching, and a vague attribution followed by a marker is
not flagged. Control it with `<!-- slop-lint-ignore -->` (next paragraph), `<!-- slop-lint-ignore rule1,rule2 -->` and
`<!-- slop-lint-disable-file -->`. A page about writing can quote its bad examples in block quotes or code.

What it cannot do: judge whether a contrast corrects a real misconception, find a vague declarative with no stock
words, detect an invented specific (only `--diff` against the source can), tell a wrong-reader reply from a right one,
or check that a citation supports its sentence. Read the text for those. A clean run is not a pass, and a finding is
not a verdict. Calibration: on Strunk's 1918 text (human, 13,081 words) the linter reports 0 errors and 5 warnings,
all explainable, which is the false-positive floor to beat. It runs on the Spectre site (38 company pages plus `site.json`) in under 2 seconds.

---

## 7. Worked examples

Each is short. "After" versions use only facts present in "Before" or stated as source facts. Where a repair needs a
fact the text lacks, it says so.

**7.1 Words and openers (W1, W4, S9).**

> Before: In today's fast-paced digital landscape, Blockbuster's story serves as a testament to the pivotal importance of adaptation.
> After: Blockbuster ended 2004 with 9,094 stores. Six years later it filed for bankruptcy. *(Figures from the company's filings.)*

**7.2 Not X but Y (S1).**

> Before: Late fees weren't just a revenue line; they were the pillar the whole business stood on.
> After: Extended viewing fees were $692.6M in 1999, or 15.5% of revenue.
> Keep (real correction): "Blockbuster did not lose its customers in a single season. It lost its profits first, then its balance sheet, and only then its stores." A reader could hold the other view, and the second sentence says what happened.

**7.3 -ing rider and significance (S7, S9).**

> Before: The group opened a second office, demonstrating its deep commitment to the community and reflecting broader trends in regional growth.
> After: The group opened a second office. *(If the group stated a commitment, quote and attribute it. Otherwise nothing replaces the rider.)*

**7.4 Fake balance and vague attribution (H2, H6).**

> Before: Experts agree that remote work has benefits and drawbacks, and the best approach depends on various factors.
> After: *(Cut.)* Or keep the topic and flag the gap: `[NEED: the study or figure behind the claim about remote work, with its source]`. Do not name a study you have not read.

**7.5 Hedge handling (H1, F3).**

> Before: It could potentially be argued that the update might possibly reduce memory use.
> After: The update may reduce memory use.
> Wrong repair: "The update reduces memory use." That changes the claim.

**7.6 Dashes (P1).**

> Before: The policy — announced without warning — affects thousands of workers. The changes -- long overdue, critics say -- take effect now.
> After: The policy, announced without warning, affects thousands of workers. Critics say the changes were long overdue. They take effect now.
> Keep: "The backup, unlike the original, is encrypted." or, if the aside is a real interruption, one dash. A paired aside counts as two characters but is one construction.

**7.7 Closers and signposts (S2, S13, S14).**

> Before: This section explores why the chain failed. Debt rose from $75.1M to $1,119.7M in 2004. That is the real takeaway. In conclusion, debt matters.
> After: Long-term debt rose from $75.1M to $1,119.7M in 2004, the year of a $5.00 a share distribution.

**7.8 Personification (S16).**

> Before: The market punished the chain, and the numbers tell the story of a brand that forgot its customers.
> After: Revenue was still $5.07B in 2008, four years after the peak. What collapsed first was profit. *(Figures from the filings cited on the page. Name the actor and the evidence, not the abstraction.)*

**7.9 List labels (S11, P4).**

> Before: - **Security:** Security has been strengthened with end-to-end encryption.
> - **Speed:** Speed has been improved with caching.
> After: The update adds end-to-end encryption and a cache.

**7.10 Headings (S12).**

> Before: ## Key Takeaways And Final Thoughts: Why It All Matters
> After: ## What the filings show about the debt

**7.11 Site-level repetition (R2).**

> Before: Three pages begin "In 2000, the company faced a pivotal moment." and end "Its story is a cautionary tale."
> After: Each opens with its own date and event ("The Nasdaq peaked on March 10, 2000; Pets.com had gone public four weeks earlier.") and ends on its last sourced fact. Shared source-line wording stays identical on purpose (R3).

**7.12 Facts preserved while editing (F1 to F5).**

> Source says: the company said it expected no proceeds from the sale to be available to preferred or common stockholders.[^13]
> Bad edit: Shareholders got nothing.[^13] *(Certainty raised: the company said it expected none.)*
> Good edit: The company expected no sale proceeds to reach preferred or common stockholders.[^13]

**7.13 Missing evidence (F1, F6).**

> Before: The founder's early life shaped the company's culture in important ways.
> After: `[NEED: one sourced fact about the founder's early life that the page uses]`. Do not write "likely" or "reportedly" to fill it.

**7.14 Overcorrection (0.5).**

> Original: The export failed because the file exceeded the memory limit. However, a smaller file passed.
> Overcorrected: The export failed. The file exceeded the memory limit. A smaller file passed.
> Repair: restore the original. "Because" and "however" state real relationships, and removing them lost the logic. Delete padding, not connectives.

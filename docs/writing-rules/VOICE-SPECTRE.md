# Spectre Brands house voice

Version 1.0, 2026-10-10. Read this with `RULES.md`. Where this file and a style rule in `RULES.md` disagree, this file wins
for Spectre Brands pages (bold key figures, spaced en dash in year ranges). It never overrides section 5 of `RULES.md`
(facts, citations, quotations).

Derived by reading the repository read-only: `company.json` and `sections/*.json` for the pages named in the brief
(blockbuster, pets-com, chi-chis, webvan, quibi, dreamcast), then spot checks and counts across all 38 company folders and
`site.json`. Nothing in the repository was edited. Counts below are from the page data on 2026-10-10 and will drift.

## 1. The voice in one paragraph

Editorial and sourced. A patient reporter with the filings open. The narrator states what the record shows, says whose
account it is when the record is thin, and lets the facts do the joking. The dry wit comes from setting two documented
facts next to each other (a slogan and its fate, a headline figure and the smaller true one), never from a joke, a
pun-for-its-own-sake or an adjective. The tone is level: it avoids exclamation marks, hype, gloating and moralizing.
People and companies are treated fairly even when they were wrong. Judgment is allowed, and it is always labeled as
judgment.

"We" appears only to state method or a limit: "we found no order-level data behind them", "is not in our sources". Direct address is rare. It appears in interface instructions ("Tap a cause to see the evidence") and when the page repeats the subject's own promise ("groceries at your door"). The narration never lectures the reader.

## 2. Moves that make it work

1. Juxtapose, then stop. Two plain sentences, the second turning on the first. No third sentence explaining the turn.
2. Correct the popular story with a record. "X did not Y. It Z." The second sentence carries a sourced fact. Used
   once per section at most. This is the S1 exception in `RULES.md` because a reader plausibly holds the other view.
3. Numbers do the adjectives. Say "9,094 stores", never "a huge chain". Give the unit, the year, the denominator.
4. Say whose account it is. "by Marc Randolph's account", "as reported by the Wall Street Journal", "(company
   estimate)", "reportedly". If a claim is a recollection or a press figure, the sentence says so.
5. Label what we computed. "(derived)" after a figure we calculated, with the arithmetic in the source line. "estimate"
   with the estimator. `**unverified**` for what we could not confirm.
6. State the gap, never fill it. "What creditors finally received is not in our sources." "We found no announcement
   of one." A gap sentence is short and flat.
7. Mark speculation. Cause weights are "an interpretive model by the Spectre Brands editors, not a measured
   quantity". What-if panels are "speculation, labeled as such". Counterfactuals start from a documented decision and
   end on an honest "the effect on survival is unclear".
8. Fair to the subject. Give the strongest sourced case for the other side, then say what the record shows.
9. End on the last fact. Paragraphs stop; they do not summarize or moralize.

## 3. Exemplars (verbatim)

Each is quoted exactly from the page data, with the file and key path. Copy the move, not the topic.

1. "It had a store within a short drive of most American homes. Then the drive stopped being necessary."
   `companies/blockbuster/company.json`, `hero.standfirst`. Two sentences; the turn is a restatement of the first fact.
2. "Blockbuster did not lose its customers in a single season. It lost its profits first, then its balance sheet, and only
   then its stores." `companies/blockbuster/sections/story.json`, `lede`. A correction with an order of events as the payload.
3. "The company’s slogan was “Because pets can’t drive.” Its business model didn’t get far either."
   `companies/pets-com/company.json`, `hero.standfirst`. Dry wit by juxtaposition: slogan, then outcome.
4. "Pet food is heavy, bulky and cheap per pound. Customers could buy it at any supermarket. Shipping it to them one
   order at a time was the problem the company never solved." `companies/pets-com/sections/economics.json`, `lede`.
   Three plain facts building to the cause; no adjective does work the facts do not.
5. "Chi-Chi’s is remembered as the chain a hepatitis outbreak killed. Its owner’s SEC filings show it was bankrupt four
   weeks before anyone knew about the outbreak." `companies/chi-chis/company.json`, `hero.standfirst`. The record against the legend.
6. "It came four weeks after the Chapter 11 filing, so it cannot be the cause of the insolvency. It is the reason there
   was no buyer for the business as a going concern." `companies/chi-chis/sections/cause.json`, `causes[2].text`. A precise,
   fair distinction between two causes.
7. "Webvan promised groceries at your door inside a 30-minute window you chose. It built the warehouses first and waited
   for the customers." `companies/webvan/company.json`, `hero.standfirst`. The order of events carries the verdict.
8. "The name meant “quick bites.” The company turned out to be one." `companies/quibi/company.json`, `hero.standfirst`.
   The shortest possible juxtaposition.
9. "The Dreamcast did not fail at launch. It failed in its second holiday season, when Sega needed it to pay for itself
   and buyers were waiting for a Sony machine most of them could not yet find." `companies/dreamcast/sections/story.json`, `lede`.
   Corrective lede with a specific mechanism.
10. "We don’t repeat the widely told 40-lb-bag anecdotes: we found no order-level data behind them."
    `companies/pets-com/sections/economics.json`, `blocks[1].body`. Declining a good story because the record does not support it.
11. "The account is Randolph’s; Blockbuster’s filings do not mention the meeting."
    `companies/blockbuster/sections/story.json`, `chapters[2].body`. Attribution as a plain sentence.
12. "Without the merger Webvan would have had fewer markets to convert and no $46M Dallas goodwill write-down. It would
    also have kept a well-funded rival, so the effect on survival is unclear." `companies/webvan/sections/whatif.json`,
    `forks[1].whatif`. Speculation that argues both sides and says what it cannot know.

## 4. Conventions as they stand today

**Footnote markers.** Written `[^12]`, matched to a numbered source in `sources.json`. In running prose the marker follows
the punctuation that ends the sentence, with no space: `...to 6.3 million.[^21]` (4,388 sentence ends against 393 where the
marker precedes the period; most of those are in source lines). Several markers stack with no space: `[^2][^6][^9]`
(2,081 adjacent pairs). Mid-sentence, the marker sits before the comma or semicolon (`...in 2004[^5], ...`; 211 against 6).
After a quotation the period stays inside the closing quote mark and the marker follows it: `“was struggling not to
laugh.”[^18]` (386 cases; the marker is never inside the quote). Blocks that cite use a `src` array of source ids instead.
Never move a marker away from the claim it supports; if a sentence is split, the marker goes with its claim
(`RULES.md` F2).

**Numbers.** Body text, tables and captions use the compact form: `$692.6M`, `$6.05B`, `$1,119.7M`, `15.5%`. Surfaces that
sell the page (description, card blurb, hero deck) spell the headline figure out: "$1.75 billion", "just over $6
billion". Counts are exact with thousands separators: "9,094 stores". Keep the precision of the source; do not round for
rhythm. Bold may mark a headline figure in body text (`**$692.6M**`), one per paragraph at most.

**Dates.** Full month names in running prose ("October 19, 1985"; 863 uses). Abbreviated months in labels and compact
surfaces: `hero.dates` ("Launched Apr 6, 2020."), timelines, map steps and charts (599 uses). ISO dates in data fields.
Always give the year. A date that is approximate says so ("on or about December 1, 2020").

**Ranges.** The `years` and `when` fields use an en dash with spaces ("1998 – 2000", "1994 – 2004 · The Viacom years").
Inside prose and source lines the en dash is unspaced ("1995–1999", "100–110%"). Never a hyphen for a range.

**Dashes in prose.** The site's own prose has almost no em dashes outside source-list entries (which use "Publisher —
[Title](url)") and quotations. Keep it that way: at most 1 per 1,000 words.

**Quotation marks.** Curly quotes and curly apostrophes throughout (about 3,500 curly apostrophes against 35 straight in the data).
Punctuation goes inside the closing quote for full sentences and short quotes, as in US style. Quotes are verbatim.

**Headings and titles.** Sentence case. Titles name the story, often with a list of three concrete things: "Nine
thousand stores, a billion of debt and a rival it would not buy". Section titles say what the section shows: "Sixteen
years of filings: the stores, the losses and the debt". Chart titles state the finding: "Marketing peaked two quarters
before the cash ran out".

**Labels.** `(derived)`, `estimate`, `**unverified**`, "company estimate", "by X's account". Captions on original art:
"Original illustration. Not an official asset." The cause-of-death disclaimer and the Wayback Machine description are
deliberate shared text, identical across pages (`RULES.md` R3). The linter has this shared text built in for the default repository run, so it does not report it (`--no-allow` shows it).

**Spelling.** US English and US dates are the norm ("center" 64 uses against "centre" 16; "license" 92 against "licence" 33). UK forms also appear: "programme", "licence" as a noun, "centre", "computerised", "favour". Pick US spelling for new and
edited text and fix the others on the next pass over a page. Quotations keep the source's spelling. Treat the mix as a
consistency defect (`RULES.md` R3), not a style.

**Spoken register.** Contractions are fine and used ("didn't", "don't", "isn't") in limits and asides. The narration of
events is past tense; headings and cause weights are present tense.

## 5. SEO and answer-engine conventions that fit the voice

These come from how the pages are already built plus standard practice. They never override the facts.

- Lead with the answer. The first sentence of the standfirst, the lede and each chapter states the event and the date.
  `tierWhy` answers "is it dead or ghost?" in one sentence with its footnotes. A search snippet or an AI answer should be
  able to lift the first one or two sentences and be correct.
- Make the answer self-contained. Name the company and the year in the sentence. Avoid a pronoun as the only subject
  of the first sentence of a section. "Blockbuster ended 2004 with 9,094 stores" quotes better than "It ended the year with 9,094".
- Dates and numbers exact, in text. Put the figure in a sentence as well as in the chart, so it can be read and quoted
  as text. Keep the unit and the year attached. Use the same figure everywhere on the page (check `keyNumbers`, `findings`,
  chart sources and prose agree).
- One name per entity. Define "Blockbuster Inc." or "Blockbuster Video" once, then keep to the name. Keep product names,
  tickers, form names ("Form 10-K", "FY2004 10-K") fixed (`RULES.md` R1d, R3).
- Meta text. `title` follows "Name (years): post-mortem · Spectre Brands" on all 38 pages. `description` runs 161 to 264
  characters (median 217): a colon-led pattern of the hook facts, then "a sourced post-mortem of X, from [primary sources]".
  Search engines usually show about the first 155 to 160 characters, so put the strongest fact first and any tail after
  it. `hero.standfirst` is 9 to 41 words (median 20). `card.blurb` is 20 to 46 words (median 34). No keyword stuffing; the
  company name appears because it is the subject.
- Structure for extraction. Headings in sentence case that name their content, short paragraphs that
  each hold one claim, definitions stated plainly (the repository defines Dead and Ghost in one clause each). Do not repeat a heading
  as the first sentence under it.
- Structured data and dates. Keep `published` and `updated` honest. They feed Article markup. Do not change `updated`
  without changing content.
- Do not game it. No FAQ blocks invented to catch questions, no repeated intro paragraphs across pages, no keyword
  lists. Repeated intros are an R2 finding and a search liability.

## 6. Avoid

- Everything `RULES.md` bans: tier A words, "not X, it's Y" beyond the one corrective lede, significance inflation, -ing
  riders, forced triads, fake balance, vague attribution, summary closers, stock headings.
- Jokes, puns, rhetorical questions, exclamations, "ironically", "tragically", "sadly", "of course", "famously" and other
  words that tell the reader how to feel.
- Hindsight as superiority ("they should have known"). Say what was known when, with the source.
- Round numbers where the record is exact; exact numbers where the record is a press estimate. Say which.
- Personified brands and markets ("the market punished", "the brand wanted"). Name who bought, sold, filed or decided.
- Adjectives of scale ("massive", "giant", "legendary", "iconic"). Give the number.
- A mascot, logo or ad described as if the site owns it. Illustrations are original and say so.
- Repeating the same paragraph shape on every page. Shared template text is for labels and disclaimers only.
- Anecdotes without a source, however well known. If there is no order-level data, say so and leave it out.

## 7. Before editing a page

1. Read the whole `company.json` and the section you are changing so the figure you touch agrees with the others.
2. Use the page's sources. Do not add a claim without a numbered source or a stated gap.
3. After the edit, diff the file and check every footnote marker is still on its claim (`slop-lint.mjs --diff` does the same for text exports). Then run `node /home/box/writing-rules/slop-lint.mjs` from the repository root. A growing count of body-text repeats is the signal to look at.
4. Mark anything you could not confirm `**unverified**`, or leave it out.

## 8. Deviations noticed in the current content (report, do not fix here)

- The hero deck sentence "This is the full post-mortem, built from ..." repeats across several pages. It is deliberate template text, but it is the body-prose repeat the linter flags most often (8 pages). Vary it or accept it knowingly.
- US and UK spellings are mixed (section 4).
- Three sentences appear word for word in two places on the same page (a timeline event and a map step or afterlife node):
  hollywood-video, radioshack and webvan. Keep one, or link the second to it.
- `colon-density` runs above 10 per 1,000 words on the pets-com page, mostly from source-line labels. That is the
  label pattern, not the prose.

# Changelog

## 1.0, 2026-10-10

First canonical release of the Spectre/Ali Writing Rules, merged from two independent research sets (`claude/` and
`codex/` under `/workspace/writing-research/`) plus read-only X notes and the raw Wikipedia "Signs of AI writing" wikitext.

### Added
- `RULES.md`: one merged ruleset in seven sections (ground rules, words, structure, repetition, punctuation, factual
  integrity, finishing procedure and linter use), 22 structural rules, 13 factual rules, 14 worked examples. Conflicts
  between the sources are listed in a table with the decision taken. Where sources disagreed the stricter rule won unless
  it harmed clarity, and the exception is written next to the rule.
- `QUICK.md`: under-60-line instruction block and checklist for embedding in CLAUDE.md or AGENTS.md. It carries no heading and no
  comment markers, because `sync.sh` and `SKILL.template.md` wrap it in their own.
- `VOICE-SPECTRE.md`: the Spectre Brands house voice, derived from the pages named in the brief, with 12 verbatim
  exemplars (file and key path), current conventions (footnote markers, numbers, dates, ranges, quotes, spelling),
  SEO and answer-engine conventions, things to avoid, and deviations noticed.
- `SOURCES.md`: merged source list grouped by type (papers, Wikipedia, GitHub, style guides, journalism, X posts). All 85
  URLs were requested on 2026-10-10: 75 returned 200 on the first pass and two more after a retry; seven are bot-blocked,
  one old URL is dead (gwern.net/Writing) and one gave no response. Statuses and star counts are recorded.
- `tests/good.md` and `tests/bad.md`: fixtures for the linter.

### Changed: `slop-lint.mjs` (same CLI and output format; zero dependencies)
- New flags: `--selftest`, `--list-rules`, `--diff A B`, `--allow FILE`, `--no-allow`, `--no-corpus`, `--info`. The Spectre site's deliberate
  shared text (labels, disclaimers, method statements) is built in for the default repository run. Existing flags unchanged.
- New markdown handling: front matter, code fences, inline code, block quotes and tables are skipped; list items are
  linted one by one; headings are checked separately. `<!-- slop-lint-ignore -->`, `<!-- slop-lint-ignore rule,rule -->`
  and `<!-- slop-lint-disable-file -->` directives.
- Quotation handling extended to JSON pull quotes, quote blocks and archived page text, so words that belong to a source
  stay at info level.
- Word lists split into tier A (error, one hit), tier B (warn, two distinct words in a paragraph) and tier C (warn, density).
  Sense exceptions for "leverage" (finance), "landscape", "robust", "vital" and "foster". A capitalized mid-sentence word, or one that
  begins a capitalized name ("Clearly Canadian", "Foster City"), is treated as a name.
- Rules added: chatbot residue (extended), source-gap disclaimers, tool markup and private-use characters, placeholders
  and `[NEED: ...]` markers, "not just X but Y" (error), "not only X but also Y", contrast split across sentences,
  significance formulas, copula avoidance, false balance, hedge stacks, vague attribution with a citation exemption,
  rhetorical-question and colon reveals, one-line closers, "despite challenges" formula, meta-document language, sales
  language, performed candor, personification, repeated words, spaced dashes, em-dash density (warn above 2 per 1,000
  words, previously 4), bold density, inline-header lists, emoji, heading habits, sentence-length band and punchy
  paragraph endings, duplicate sentences, repeated phrases.
- Repetition checks: three consecutive sentences with the same opener (replaces the document-wide count that produced 53
  warnings on the site), repeated n-grams across documents now warn only for body prose of 7 or more words, and approved
  boilerplate can be allow-listed. New site-wide checks: repeated closing sentence, repeated first sentence, same H2
  skeleton, figure of speech reused across documents, stock LLM names, uniform page length.
- Dash counts ignore quotations and ranges ("1998 – 2000"), so the site's year ranges no longer count as dashes.
- Sentence splitting protects common abbreviations and initials.
- Measured on the Spectre site (38 company pages and `site.json`, 163,098 words after quotations are set aside): 0 errors,
  7 warnings, runtime about 1.3 seconds. Strunk's 1918 text (human, 13,081 words): 0 errors,
  5 warnings, all explainable. `node slop-lint.mjs --selftest` passes: 30 micro cases and both fixtures.

### Decisions worth knowing
- Em dashes: a density limit (aim 1 per 1,000 words, warn above 2, at most 2 per paragraph), never a ban.
- Hedges: stacks are cut, but a hedge is never turned into certainty. Fact fidelity outranks directness.
- Triads, passives and "not only X but also Y" are warnings or context, not errors.
- Quotations are verbatim, always. One research set's silent quote normalization was rejected.
- Rejected from the source skills: "kill all adverbs", "no passive", "no sentences starting with Wh-", zero-dash rules.
- The antislop-sampler word lists were not imported: they were built from LLM-written fiction.

### Known limits
- The linter cannot judge whether a contrast corrects a real misconception, find a vague declarative with no stock words,
  detect an invented specific, or check that a citation supports its sentence. `--diff` catches dropped or added facts only
  when the original is available.
- Numeric limits marked (house) in `RULES.md` are starting points, not research results. Calibrate on pages written before
  30 November 2022.
- Wikipedia's mid-2026 word list and its "punctuation monoculture" claim rest on one source each and are low confidence.

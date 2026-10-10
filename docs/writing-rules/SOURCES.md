# Sources

Merged on 2026-10-10 from two independent research passes and a third pass over X. Grouped by type. Each entry says what it
contributes and why it deserves trust, or why it does not.

**How to read this file.** "Checked" means the merge pass requested the URL on 2026-10-10 with a browser user agent and got
HTTP 200 (after redirects). It shows that the page exists. It does not show that every claim on the page is right.
"Blocked" means the publisher refuses automated fetches (403) or the request got no answer; the content was read second
hand through the sources named. GitHub star counts and licenses were read from the GitHub API on 2026-10-10. "Read" says
whether a research pass read the primary text or only a summary. Interest (stars) is not editing quality. Wikipedia's
own page and several skills say their signs are descriptive, not a test of authorship, and this repository follows that.

Where the two research passes disagreed on a detail, the more cautious figure is used and the difference is noted.

---

## 1. Research papers and datasets

| Source | URL | What it contributes | Why credible, and limits |
|---|---|---|---|
| Kobak, González-Márquez, Horvát, Lause. "Delving into LLM-assisted writing in biomedical publications through excess vocabulary." *Science Advances* 11(27), July 2025 | https://arxiv.org/abs/2406.07016 ; full text https://pmc.ncbi.nlm.nih.gov/articles/PMC12219543/ ; journal DOI page https://www.science.org/doi/10.1126/sciadv.adt3813 (blocked) | Excess-vocabulary method on PubMed abstracts from 2010 to 2024 (about 14 million in the preprint, over 15 million in the published text). Style words, not content words: "delves" ratio 28.0, "underscores" 10.9, "showcasing" 10.2. Published lower bound of 13.5% of 2024 abstracts LLM-processed. Basis for W1. Checked. Read: primary (preprint). | Peer reviewed, open data (below). Biomedical abstracts only, so the lists transfer imperfectly to other genres. Not a detector accuracy figure. |
| berenslab/llm-excess-vocab | https://github.com/berenslab/llm-excess-vocab | Authors' data release: 900 annotated excess words 2013 to 2024, 407 tagged "style". 56 stars, MIT. Checked. Read: primary. | Same authors as above. Contains noise ("these", "were") that was excess in some year; take the top style words by hand, not wholesale. |
| Juzek and Ward. "Why Does ChatGPT 'Delve' So Much?" COLING 2025, pp. 6397-6411 | https://aclanthology.org/2025.coling-main.426/ ; preprint https://arxiv.org/abs/2412.11385 | 21 focal words; results consistent with an RLHF contribution, an exploratory human study complicates it. Checked. Read: abstract. | Peer reviewed. Does not authorise banning words for every writer. |
| Juzek and Ward. "Word Overuse and Alignment in LLMs: The Influence of Learning from Human Feedback" | https://arxiv.org/abs/2508.01930 | Follow-up on RLHF as a cause. Checked. Read: existence only. | Preprint. |
| Jiang et al. "Artificial Hivemind: The Open-Ended Homogeneity of Language Models (and Beyond)." NeurIPS 2025 | https://arxiv.org/abs/2510.22954 | Intra-model repetition and inter-model convergence on open-ended prompts across 70+ models. The evidence for the repetition rules (section 3): different models, same stock moves. Checked. Read: abstract. | NeurIPS 2025 paper (reported as a best paper). Open-ended prompts, not editorial prose. |
| Shaib, Chakrabarty, Garcia-Olano, Wallace. "Measuring AI 'Slop' in Text" | https://arxiv.org/abs/2509.19163 ; full text https://arxiv.org/html/2509.19163v2 | Expert-informed dimensions and span annotation; shows zero-shot LLM judges agree with human labels at kappa near zero (0.01, -0.01, 0.03). Reason to require evidence spans and human review. Checked. Read: full text (codex pass). | Named academic authors. arXiv version, venue unconfirmed. Does not prove every model-assisted review is useless. |
| Paech, Roush, Goldfeder, Shwartz-Ziv. "Antislop" | https://arxiv.org/abs/2510.15061 | Backtracking suppression of repeated patterns versus indiscriminate token bans. Checked. Read: abstract. | Public methods and code. Concerns the models and tasks it evaluated. |
| Masrour et al. "DAMAGE" (GenAIDetect 2025) | https://aclanthology.org/2025.genaidetect-1.9/ | Evaluation of 19 humanizer and paraphrasing tools for meaning preservation and detector robustness. Reason to test rewrite fidelity separately from detector scores. Checked. | Workshop paper on commercial tools, not on the skills used here. |
| Liang et al. "GPT detectors are biased against non-native English writers" (*Patterns*, 2023) | https://arxiv.org/abs/2304.02819 | False-positive evidence for detectors on non-native writers. Part of the case for 0.2. Checked. | Published, widely cited. Specific to the tested detectors. |
| Al Ali, Helcl, Libovický. "Different Time, Different Language: Revisiting the Bias Against Non-Native Speakers in GPT Detectors" | https://arxiv.org/abs/2602.05769 | Czech-language follow-up finding no systematic bias for the detector families tested. A scope check on Liang. Checked. | Reported accepted at the EACL 2026 Student Research Workshop. |
| "Adversarial Paraphrasing: A Universal Attack for Humanizing AI-Generated Text" | https://arxiv.org/abs/2506.07001 | Paraphrase attacks sharply cut detector accuracy. Cited by avoid-ai-writing (1.3). Checked. Read: title only. | Preprint; the figure used in the skill (about 88%) was not re-read here. |
| Jabarian and Imas, BFI Working Paper 2025-116 | no working URL found | Detector error rates, as quoted by avoid-ai-writing. | Second hand only. Not used for any number in RULES.md. |
| GPTZero analysis of hallucinated citations in NeurIPS 2025 papers, via TechCrunch, 21 January 2026 | https://techcrunch.com/2026/01/21/irony-alert-hallucinated-citations-found-in-papers-from-neurips-the-prestigious-ai-conference/ | 100 confirmed fabricated citations across 51 of 4,841 accepted papers (counts differ across other reports). Supports F8. Checked. Read: summary. | Press report of a vendor analysis (GPTZero sells detection). Directionally solid, exact figure uncertain. |

## 2. Wikipedia

| Source | URL | What it contributes | Why credible, and limits |
|---|---|---|---|
| Wikipedia:Signs of AI writing (WikiProject AI Cleanup) | https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing ; pinned revision https://en.wikipedia.org/w/index.php?oldid=1379367647&title=Wikipedia:Signs_of_AI_writing | The best single field guide. Significance inflation, promotional tone, vague attribution, "challenges and future" formula, vocabulary by model era, copula avoidance, negative parallelism, rule of three, title case, boldface, inline-header lists, emoji, chatbot residue, knowledge-cutoff disclaimers, markup artifacts (`oaicite`, `turn0search0`, `utm_source=chatgpt.com`), plus "signs of human writing", "ineffective indicators" and "historical indicators". Checked. Read: full wikitext (225 KB, October 2026 text), saved locally as `mine/wiki-signs.txt` in the research folder. | Maintained by editors reviewing thousands of cases, with 100+ citations. States its own limits: an advice page, descriptive not prescriptive, "do not merely treat these signs as the problems to be fixed". Its text moves; pin a revision. |
| The same page, historical-indicator section | same | Em-dash overuse (2022 to September 2026) and elegant variation are listed as historical. A note about commas-and-periods-only profiles is tagged as needing a citation, so it is used as low confidence. | |

## 3. GitHub: skills, rule sets and tooling

| Source | URL | What it contributes | Why credible, and limits |
|---|---|---|---|
| blader/humanizer (v3.1.0) | https://github.com/blader/humanizer ; skill https://raw.githubusercontent.com/blader/humanizer/main/SKILL.md | 26 patterns in six groups, strongest first. Before/after pairs. "Weak alone" flags. Mark, rewrite, check for added or dropped facts, search again. "When not to act". Voice matching. Checked. Read: primary. | 55,345 stars, MIT, pushed 2026-09-28. Most mature humanizer; lineage is Wikipedia's guide, so it is not independent confirmation. Its 16-of-16 preference result is a small self-reported test. |
| hardikpandya/stop-slop | https://github.com/hardikpandya/stop-slop ; https://raw.githubusercontent.com/hardikpandya/stop-slop/main/SKILL.md ; https://raw.githubusercontent.com/hardikpandya/stop-slop/main/references/phrases.md ; https://raw.githubusercontent.com/hardikpandya/stop-slop/main/references/structures.md | Throat-clearing, emphasis crutches, binary contrasts, false agency, jargon table, five-axis self-scoring. Checked. Read: primary. | 17,887 stars, MIT, last push 2026-03-17. Opinionated: "kill all adverbs", "no passive", "no Wh- openers" would give false positives, so those are rejected in RULES.md 0.9. |
| conorbronsdon/avoid-ai-writing (v3.37.0) | https://github.com/conorbronsdon/avoid-ai-writing | Three-tier word list, density formula, em-dash cap, 109-entry replacement table, "never inject" list, source-fidelity contract, detector caveats. Checked. Read: primary (SKILL and patterns). | 4,941 stars, MIT, pushed 2026-10-08. Most careful about false positives. Admits its "5-20x" frequency claim is inherited, not measured. Reports a stress test showing humanizer output acquired its own voice. |
| tbhb/vale-ai-tells | https://github.com/tbhb/vale-ai-tells | Vale package with about 137 prose rules plus commit-message rules. Concrete patterns for contrast by negation, conclusion markers, false balance, colon then capital. Checked. Read: README and six rule files. | 117 stars, MIT, pushed 2026-10-09. Defaults are strict (any dash is an error); scoped to technical docs. |
| adewale/anti-slop-writing | https://github.com/adewale/anti-slop-writing ; https://raw.githubusercontent.com/adewale/anti-slop-writing/main/skills/anti-slop-writing/SKILL.md | Tests for the mechanism behind a claim and for the logical link between paragraphs. Allows meaningful contrast and parenthetical dashes. Source of S22. Checked. Read: primary (codex pass). | 18 stars, MIT. Included for useful specificity, not popularity. |
| anthropics/skills | https://github.com/anthropics/skills ; https://raw.githubusercontent.com/anthropics/skills/main/skills/doc-coauthoring/SKILL.md | No dedicated humanizer. `frontend-design` ("more on writing": plain verbs, sentence case, errors do not apologise, structural devices must encode information) and `doc-coauthoring` (reader test, "slop or generic filler" pass). Source of the reader-comprehension step. Checked. Read: primary. | 180,243 stars, pushed 2026-10-09. Workflow authority, not evidence for particular words. |
| sam-paech/antislop-sampler | https://github.com/sam-paech/antislop-sampler | 2,000 over-represented words and 2,500 phrases with counts, plus regexes (`not ... but`). Checked. Read: primary. | 357 stars, Apache-2.0. The lists come from LLM-written fiction (elara, nodded, shadows), so they are not used for expository prose. Only intricate, meticulously, symphony, tapestry and a few more carry over. |
| sam-paech/slop-forensics | https://github.com/sam-paech/slop-forensics | Corpus-level analysis of words, bigrams, trigrams, lexical complexity. Inspiration for the site-wide report. Checked. | 374 stars, MIT. A general-language baseline can mistake a site's topic words for slop. |
| EQ-Bench Slop Score and lists | https://eqbench.com/slop-score.html ; https://github.com/sam-paech/slop-score ; https://github.com/sam-paech/slop-score/blob/main/data/slop_list.json ; https://github.com/sam-paech/slop-score/blob/main/data/slop_list_trigrams.json | Published weighting (words 60%, contrast patterns 25%, trigrams 15%). Warns about single-topic skew. Checked. | First-party documentation. Not an AI probability; weights are not adopted. |
| sam-paech/auto-antislop | https://github.com/sam-paech/auto-antislop | Code for the Antislop paper. Checked. | 199 stars. |
| EQ-bench/creative-writing-bench | https://github.com/EQ-bench/creative-writing-bench | Home of the fiction slop score. Existence only. Checked. | Fiction; not used in the rules. |
| brandonwise/humanizer | https://github.com/brandonwise/humanizer | Origin of the three-tier vocabulary idea and uniformity metrics (burstiness, sentence-length CV). Checked. Read: summary. | 127 stars, MIT. Metric ideas only; its "5-20x" claim is unpublished. |
| aaazzam/dslop | https://github.com/aaazzam/dslop | The only source that publishes numeric uniformity thresholds (sentence-length CV 0.3, "which"-chains). Checked. Read: summary. | 6 stars, Apache-2.0. Numbers are starting points, not facts. The linter uses CV 0.4. |
| isatimur/de-slop | https://github.com/isatimur/de-slop | "Fidelity over flair" and "flag hollow spans, do not fabricate", capped rewrite loop. Checked. Read: summary. | 3 stars. Cited because avoid-ai-writing borrows its guardrails. |
| Vale | https://github.com/vale-cli/vale (the old URL https://github.com/errata-ai/vale redirects here) ; docs https://docs.vale.sh/checks/existence , https://docs.vale.sh/checks/substitution , https://docs.vale.sh/checks/occurrence , https://docs.vale.sh/checks/repetition ; https://vale.sh/features/markup ; catalog https://vale.sh/explorer | Markup-aware prose linting; exact check definitions used to design the linter's scoping. Checked. | 6,223 stars, MIT. Official documentation. |
| Vale write-good and proselint packages | https://vale.sh/explorer/write-good ; https://vale.sh/explorer/proselint | Cliche, wordiness, weasel word and repetition checks (8 and 34 rules). Checked. | Catalog entries (49 and 45 stars). Review each rule; the E-Prime and paragraph-initial "but" rules clash with this ruleset. |
| vale-cli/Google, vale-cli/Microsoft | https://github.com/vale-cli/Google ; https://github.com/vale-cli/Microsoft | Machine-readable ports of two house styles (93 and 112 stars, MIT). Checked. | Ports, not endorsed by Google or Microsoft. Combining both whole creates contradictory alerts. |
| btford/write-good | https://github.com/btford/write-good | Passive, weasel words, adverbs, lexical illusions ("the the"). 5,096 stars, last push 2025-03. Checked. | Not AI-specific; a baseline. |
| amperser/proselint | https://github.com/amperser/proselint | Linter built from Orwell, Strunk and White, Garner and others. 4,584 stars, BSD-3-Clause, pushed 2026-09-04. Checked. | Mirror of the primary repo. |
| Screened out: dmmulroy/anti-slop, peakoss/anti-slop | https://github.com/dmmulroy/anti-slop ; https://github.com/peakoss/anti-slop | Both exist but concern JavaScript lint rules and pull-request moderation, not prose. Checked. | Not used. |

## 4. Style guides, essays and blogs

| Source | URL | What it contributes | Why credible, and limits |
|---|---|---|---|
| George Orwell, "Politics and the English Language" (1946) | https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/politics-and-the-english-language/ ; alternate text https://www.orwell.ru/library/essays/politics/english/e_polit | Six rules, four bad habits (dying metaphors, verbal false limbs, pretentious diction, meaningless words). The last rule allows breaking any rule before writing something barbarous. Checked. | Foundational plain-style source, text hosted by the Orwell Foundation. Not LLM research. |
| William Strunk Jr., *The Elements of Style* (1918/1920) | https://www.gutenberg.org/ebooks/37134 ; https://www.gutenberg.org/files/37134/37134-h/37134-h.htm | "Omit needless words", the active voice, paragraph unity. Also our human-text control: the linter reports 0 errors and 5 warnings on 13,081 words. Checked. Read: primary. | Public domain. Period-specific usage is not imported. |
| The Economist, style guide introduction | https://www.economist.com/styleguide/introduction | "Do not be too chatty. Do not be too didactic." Blocked (403); the wording was taken from search snippets. | Strong house style, unverified quote. |
| The Economist Education / Lane Greene, "Writing with Style" excerpt | https://education.economist.com/blog/what-to-read/writing-with-style | Keep specialist terms that do work; replace jargon used to signal membership. Checked. | First-party excerpt (page dated 2024-02-15). Some preferences are house taste. |
| Paul Graham, "Write Simply" (2021) | https://paulgraham.com/simply.html | Plain words reduce reader effort, including for non-native readers; writing simply keeps you honest. Checked. | Widely cited essayist. Editorial reasoning, not data. |
| Gwern, Manual of Style | https://gwern.net/style-guide ; the older URL https://www.gwern.net/Writing is dead (404) | Link durability, estimative words (certain, likely, possible), explicit exceptions, and the counterweight "avoid hedging". Checked. | Rigorous, idiosyncratic. Its "overstate rather than hedge" and silent quote normalization conflict with F3 and F5, so those are rejected. |
| Google developer documentation style guide | https://developers.google.com/style/tone ; https://developers.google.com/style/word-list | Respectful instructions; do not call a step easy or simple. Source of H8. Checked. | Google's own maintained guidance. |
| Associated Press, "Telling the Story" | https://www.ap.org/about/news-values-and-principles/telling-the-story/ | Accurate quotation, attribution, sourcing disputable claims. The editorial basis for F2, F5 and F7. Checked. | The news organization's published standards. |
| slhck, "Claudish" | https://slhck.info/software/2026/06/22/claudish.html | Claude-specific tics: "The one thing you need to X", "Honest caveat:", revision history narrated in the document. Source of S14's last point. Checked. Read: summary. | One person's blog; cross-confirmed by humanizer and stop-slop. Treat as a pointer. |
| Max Read, "Who is Elara Voss?" | https://maxread.substack.com/p/who-is-elara-voss | "Promptonyms": names every large model converges on. Source of R2f. Checked. Read: summary. | Journalist's investigation, cited by Wikipedia's guide. |

## 5. Journalism on LLM writing

| Source | URL | What it contributes | Why credible, and limits |
|---|---|---|---|
| The Economist, "How to spot AI writing", 30 July 2026 | https://www.economist.com/culture/2026/07/30/how-to-spot-ai-writing (blocked) ; read through https://daringfireball.net/linked/2026/08/11/economist-ai-writing and https://theeconomistoffthecharts.substack.com/p/how-to-spot-ai-writing | About 56,000 sentences compared with professional prose. Only Claude still exceeds professional writers on em dashes; AI text uses fewer commas, semicolons and parentheses and more Latinate words and "not only ... but also". Checked (the two secondary pages). | Large and methodical, but read second hand: exact figures are not quoted anywhere in this repository. |
| Sam Kriss, "Why Does A.I. Write Like ... That?", NYT Magazine, 3 December 2025 | https://www.nytimes.com/2025/12/03/magazine/chatbot-writing-style.html | Em dashes, "not X, but Y", rule of three, "tapestry", the habit of calling everything "quiet". Blocked (403). | Essay, not a measurement. Cited by Wikipedia's guide. |
| The Atlantic, July 2026, on negative parallelism | https://www.theatlantic.com/technology/2026/07/ai-chatbot-writing-tic-negative-parallelism/687892/ (blocked) ; summary https://aiweekly.co/alerts/atlantic-ais-its-not-x-its-y-tic-proves-hardest-to-shake | "It's not X; it's Y" outlasted "delve"; a count of the phrase in Fortune 500 filings rose from about 50 in 2023 to over 200 in 2025 (Barron's, as reported). Checked (the summary only). | Second hand; the byline was not verified. The persistence claim matches Wikipedia's era table. |
| The Washington Post, "What are the clues that ChatGPT wrote something?", 13 November 2025 | https://www.washingtonpost.com/technology/interactive/2025/how-detect-chatgpt-em-dash/ (no response) ; read through https://www.bostonglobe.com/2025/11/13/business/chatgpt-writing-style-clues/ | 328,744 public ChatGPT messages: "core" far more frequent, emoji in most messages, em dashes. Cautions that none of it proves AI authorship. Checked (Boston Globe copy). | Large sample, reputable outlet, but ChatGPT-only and 2024 to 2025. |
| Pangram Labs, "Walking through AI phrases" | https://www.pangram.com/blog/walking-through-ai-phrases (the page https://www.pangram.com/blog/pangram-ai-phrases is dead, 404) | Phrase-family overuse ratios ("as a poignant", "serves as a powerful", "faced numerous challenges"). Checked. Read: summary. | Vendor blog (they sell a detector); ratios come from rare n-grams and are noisy. Use for families, not exact numbers. |

## 6. X posts (read-only; not machine-verifiable)

X returns HTTP 200 to any request, so the links below were not verified by script. The text was read by the research pass
through X search on 2026-09 and 2026-10. They shaped three rules; none supplies a number.

| Post | URL | What it contributes |
|---|---|---|
| @emollick (Ethan Mollick, Wharton), 2026-09-17 | https://x.com/emollick/status/2100431676501602641 | AI writing over-assigns agency and action to inanimate things ("the code knows it now", "the plan remembers"). Basis for S16. |
| @mattyglesias (Matt Yglesias, Slow Boring), 2026-09-25 | https://x.com/mattyglesias/status/2103463028364570676 | Editors strip needed em dashes out of fear of looking automated. Basis for P1 as a density limit and for 0.5. |
| @Noahpinion (Noah Smith), 2026-09-23 | https://x.com/Noahpinion/status/2102617457936760953 | "AI writing is just fine": quality, not provenance, is the bar. Basis for 0.2. |
| @scriptjunkie1, 2026-09 | https://x.com/scriptjunkie1/status/2099495260405547042 | "It's not just X — it's Y" is the most-cited tell, even in book-jacket copy. Supports S1. |
| @chinmay185, 2026-09 | https://x.com/chinmay185/status/2105280424926998749 | Tells moved from em dashes to "It's not X, it's Y" to deeper patterns such as narrow range and uniform rhythm. Supports 0.4. |

The broad searches were mostly crypto-bot noise, so only credible writer accounts were sampled with `from:` searches.

## 7. Not verified, and handled with care

- Economist, NYT, Atlantic and WaPo originals, and the Science DOI page: blocked or paywalled. Used second hand and said so.
- Wikipedia's "mid-2026 and on" word list rests on one non-academic source, and the "punctuation monoculture" claim carries
  a citation-needed tag. Both are low confidence (W2, P1).
- Pangram ratios, dslop thresholds and EQ-Bench weights are vendor or small-repo numbers. Not adopted as thresholds.
- Jabarian and Imas (BFI): no URL; second hand through avoid-ai-writing; no number from it is used.
- Every numeric limit in RULES.md marked (house) is ours, not research. Calibrate on pages written before 30 November 2022.
- Source lineage reduces apparent consensus: several skills descend from Wikipedia's guide, so agreement among them is
  weaker evidence than it looks.

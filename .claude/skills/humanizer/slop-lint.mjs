#!/usr/bin/env node
// slop-lint 1.0: flags AI-sounding prose, repetition and lost facts. Part of the Spectre/Ali Writing Rules (RULES.md, QUICK.md alongside).
// Usage:
//   node slop-lint.mjs                         lint the Spectre Brands repo content (companies/**.json, site.json) from cwd
//   node slop-lint.mjs file.md dir/ ...        lint markdown / text / json files (json: prose strings are extracted)
//   options: --json (machine output)  --top N (issues shown, default 40)  --strict (exit 1 on any 'error')
//            --min-docs N (cross-doc n-gram threshold, default 3)  --only rule1,rule2  --quiet
//   added in 1.0:
//            --selftest      run tests/good.md, tests/bad.md and the built-in micro cases; exit 1 on any failure
//            --list-rules    print every rule id, severity and RULES.md reference, then exit
//            --diff A B      compare two versions of a text and report dropped/added URLs, numbers, years, quotes and
//                            citation markers (the F1/F2 fact check); with --strict, exit 1 if anything differs
//            --allow FILE    phrases (one per line, # comments) that are deliberate repetition; cross-document repeats
//                            containing one are ignored. ./slop-lint-allow.txt is read automatically if it exists, and in default
//                            (Spectre repo) mode the site's known boilerplate is built in
//            --no-allow      do not apply the built-in Spectre boilerplate allow-list (default mode only)
//            --no-corpus     skip the cross-document checks
//            --info          also list info-level issues in the issue list
//   markdown controls: <!-- slop-lint-ignore --> skips the next paragraph; <!-- slop-lint-ignore rule1,rule2 --> skips
//   only those rules there; <!-- slop-lint-disable-file --> skips the file. Code fences and > blockquotes are never linted.
// Zero dependencies. Severity: error = rewrite it; warn = look at it; info = context/statistics.
// A finding is an editing prompt, never evidence about who wrote the text (RULES.md section 0).
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const flag = k => argv.includes(k);
const TOP = +opt('--top', 40), MIN_DOCS = +opt('--min-docs', 3), ONLY = (opt('--only', '') || '').split(',').filter(Boolean);
const skipNext = new Set(['--top', '--min-docs', '--only', '--allow']);
const inputs = argv.filter((a, i) => !a.startsWith('--') && !skipNext.has(argv[i - 1]));

// ---------- rules ----------
// Span rules: [id, severity, regex, message, ref(RULES.md), options]. Regexes run on prose with footnote markers removed and
// apostrophes normalised to '. options: raw (run on the unstripped paragraph), skip(match, text) (sense exceptions), proper (skip a
// capitalised match that is probably a name), cs (case-sensitive).
const W = s => new RegExp(`\\b(?:${s})\\b`, 'gi');
const FIN = /^\s+(?:buy-?outs?|recap\w*|loans?|ratios?|financ\w*|capital|positions?|funds?|etfs?|structure|esop|bids?|deals?|acquisitions?|lbo|debt|of \d|by (?:debt|borrow)|at \d|multiple)/i;
const leverageSkip = (m, t) => { // finance senses are fine; flag the management-speak verb
  const after = t.slice(m.index + m[0].length, m.index + m[0].length + 28), before = t.slice(Math.max(0, m.index - 30), m.index).toLowerCase();
  if (FIN.test(after)) return true;
  if (/^leverag(?:es|ing)$/i.test(m[0])) return false;
  return !/\b(?:to|will|would|can|could|may|might|must|should|shall|and|or|we|you|they|it|which|that|who|help|helps|by|then|also|now|not|better|further|had|has|have)\s+$/.test(before);
};
const vitalSkip = (m, t) => /^\s+(?:signs?|statistics|records?)/i.test(t.slice(m.index + m[0].length, m.index + m[0].length + 14));
const fosterSkip = (m, t) => /^\s+(?:care|child|children|parents?|homes?|famil\w+|kids?|mother|father|brother|sister)/i.test(t.slice(m.index + m[0].length, m.index + m[0].length + 14));
const landscapeSkip = (m, t) => /rural|urban|desert|mountain|painting|photograph|orientation|garden|portrait|screen|mode|terrain|artist|canvas|scenery/i.test(t.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60));
const robustSkip = (m, t) => /statistic|standard error|estimator|regression|variance|heteroskedast|robust to|outlier|test/i.test(t.slice(Math.max(0, m.index - 50), m.index + m[0].length + 50));
const SENSE = { leverage: leverageSkip, vital: vitalSkip, foster: fosterSkip, landscape: landscapeSkip, robust: robustSkip };

const RULES = [
  // ---- chatbot residue, markup artifacts, placeholders: one sighting is enough (RULES S19, F7, F11) ----
  ['chatbot', 'error', /\b(?:I hope this helps|hope that helps|great question|excellent question|good question[!.]|you'?re absolutely right|as an AI(?: language model)?|as a large language model|as of my (?:last|knowledge)|up to my last training|my knowledge cutoff|I'?d be happy to|would you like me to|want me to (?:expand|continue|elaborate)|here(?:'s| is) (?:a|an|the) (?:quick )?(?:overview|summary|breakdown|rundown) of|certainly!|absolutely!|sure thing!)/gi, 'chatbot residue', 'S19'],
  ['chatbot-soft', 'warn', /\b(?:feel free to (?:reach|ask|contact)|let me know if|don'?t hesitate to|happy to help)\b/gi, 'stock sign-off; fine in real correspondence, cut it from published prose', 'S19'],
  ['availability-disclaimer', 'warn', /\b(?:(?:while|although) specific details[^.]{0,60}(?:limited|scarce|unavailable|documented)|(?:not|isn'?t|aren'?t) (?:extensively|widely|publicly|readily) (?:documented|available|disclosed)|in the provided (?:sources|search results)|based on (?:the )?available information|maintains a low profile|keeps? (?:his|her|their) personal details private)\b/gi, 'source-gap disclaimer: state what the source shows, never guess to fill the gap', 'F6'],
  ['markup-residue', 'error', /oaicite|oai_citation|contentReference|turn\d+(?:search|view|fetch)\d+|attributableIndex|grok_card|grok_render|\[cite:\s*\d|\[span_\d+\]|\[attached_file:\d+\]|\[web:\d+\]|ppl-ai-file-upload|【\d+†|[-]|(?:utm_source=(?:chatgpt\.com|openai|copilot\.com)|referrer=grok\.com)/gi, 'AI tool markup or tracking residue', 'F8', { raw: true }],
  ['placeholder', 'error', /\[(?:Insert|Your|Entertainer|Company|Name|Add|TODO|TBD)\b[^\]]{0,60}\]|\((?:Add|Insert) your [^)]{0,40}\)|\b20\d\d-xx-xx\b|\bTODO\b|\bTBD\b|lorem ipsum|delete this section before|reviewer note:/gi, 'placeholder or drafting leftover', 'F11', { raw: true }],
  ['need-marker', 'warn', /\[NEED:[^\]]{0,160}\]/g, 'unresolved [NEED: ...] gap: supply the fact or cut the claim before publishing', 'F1', { raw: true, cs: true }],
  // ---- AI vocabulary tier A: replace on sight (RULES W1) ----
  ['ai-vocab', 'error', W("delv(?:e|es|ed|ing)|tapestr(?:y|ies)|testament to|underscor(?:es|ed|ing)(?=\\s+(?:the|its|their|his|her|our|this|that|these|those|how|why|a|an|just|again|once|further|both|[a-z]+'s)\\b)|showcas(?:e|es|ed|ing)|foster(?:s|ed|ing)?|garner(?:s|ed|ing)?|interplay|intricat(?:e|ely)|intricacies|meticulous(?:ly)?|pivotal|bolster(?:s|ed|ing)?|boasts|vibrant|realms?|beacons?|multifaceted|nuanced|seamless(?:ly)?|synerg(?:y|ies)|paradigm|holistic(?:ally)?|transformative|unwavering|indelible|enduring legacy|rich history|ever-evolving|ever-changing|commendable|noteworthy|embark(?:s|ed|ing)? on|spearhead(?:s|ed|ing)?|myriad|plethora|unparalleled|bustling|nestled|breathtaking|renowned|must-visit|diverse array|empower(?:s|ed|ing)?|elevat(?:e|es|ed|ing) (?:your|the|our|their|its)|unlock(?:s|ed|ing)? (?:the |your |new |its |their )?(?:potential|value|power|secrets|growth|possibilities|opportunities)|navigat(?:e|es|ed|ing) (?:the )?(?:complexit|challeng|landscape|waters)\\w*"), 'AI-overused word (tier A)', 'W1', { proper: true, skipBy: 'foster' }],
  ['ai-vocab', 'error', W('leverag(?:e|es|ed|ing)'), 'AI-overused word: leverage as a verb (use "use"; leveraged buyout and operating leverage are finance terms and fine)', 'W1', { skip: leverageSkip }],
  // ---- stock phrases and formulas (RULES W4, S3, S9) ----
  ['stock-phrase', 'error', /\b(?:in today'?s (?:fast-paced|digital|ever|rapidly|modern|dynamic)|in an era (?:of|where)|in the (?:ever-)?(?:evolving|changing) (?:world|landscape)|let'?s (?:dive|delve|explore|unpack|break this down|take a (?:closer )?look)|dive (?:deep|into)|deep dive|it'?s (?:important|worth|crucial|essential) (?:to note|noting|to remember|mentioning|to understand)|it should be noted|needless to say|at the end of the day|when it comes to|the (?:world|realm) of|stands? as a testament|serves? as a (?:powerful |poignant )?reminder|a (?:stark|powerful|poignant|sobering) reminder|without further ado|let that sink in|read that again|here'?s the (?:thing|kicker|catch)|here'?s what you need to know|let me be clear|plot twist|real talk|at its core|the heart of the matter)\b/gi, 'stock phrase', 'W4'],
  ['significance', 'error', /\b(?:plays? an? (?:crucial|pivotal|key|vital|significant|important) role|marks? an? (?:pivotal|key|significant|important|turning) (?:moment|point|shift|milestone)|(?:underscor|highlight|emphasi[sz])\w* (?:its|their|the) (?:importance|significance|role)|sets? the stage for|indelible mark|evolving landscape|deeply rooted|reflects? (?:a )?broader|shaping the future|broader movement|a turning point in|only time will tell|the future (?:looks|is) bright|exciting times (?:lie |are )?ahead|(?:left|leaves) an? (?:lasting|enduring) (?:mark|legacy|impact))\b/gi, 'significance formula: state the fact and its effect, or cut', 'S9'],
  ['cliche', 'warn', /\b(?:cautionary tale|the rest is history|ultimately,|in conclusion|in summary|to sum up|all in all|the bottom line|lessons? (?:to be )?learned|the takeaway|food for thought|paved the way|stood the test of time|captured the (?:hearts|imagination)|took the world by storm|a household name|the perfect storm|a double-edged sword|the writing (?:was|is) on the wall|perfect example|a story of|a step in the right direction|speaks volumes)\b/gi, 'cliche / empty closer', 'S13', { proper: true }],
  ['hype', 'warn', /\b(?:effortless(?:ly)?|supercharg\w*|turbocharg\w*|revolutioni[sz]\w*|next level|blazing(?:ly)? fast|best-in-class|world-class|state-of-the-art|cutting-edge|game-?chang\w+|groundbreaking|take (?:your|the|it|\w+) to the next level)\b/gi, 'sales language: give the number and the condition, or cut', 'H7', { proper: true }],
  ['signpost', 'warn', /\b(?:here'?s (?:the thing|why|what|how)|the (?:short|long) answer|the (?:real )?(?:question|answer|truth|reality) is|what (?:this|that) means is|the key (?:here|is)|make no mistake|spoiler:|picture this|imagine a|to be clear|don'?t get me wrong|i promise|in (?:this|the following) (?:article|section|post|guide),? (?:we|i)(?:'ll| will)|as we'?ll see|the rest of this (?:essay|post|article)|now let'?s look at|moving on to|let me walk you through)\b/gi, 'signposting / throat-clearing', 'H5'],
  ['candor', 'warn', /(?:^|[.!?]\s+)(?:Honestly|Frankly|Look|Listen|Real talk)[,?]/g, 'performed candor opener', 'S4', { cs: true }],
  ['meta-doc', 'warn', /\b(?:this (?:section|document|guide|post|article) (?:explores|will cover|covers|is organi[sz]ed by)|this (?:post|page|piece|article|essay) (?:looks at|examines|tells the story|traces|is about|walks through)|the (?:table|chart|figures?|list) (?:below|above) (?:compares?|shows?|lists?|summari[sz]es?)|was added to replace|flagged rather than guessed)\b/gi, 'writing about the document instead of the subject', 'S14'],
  // Added 2026-10-10 from the Spectre copy pass (Stage 4): formulas that survived the first ruleset or that the edits created.
  ['deck-closer', 'error', /\b(?:this is the (?:full |complete )?(?:post-mortem|story|account)|(?:a|this) sourced post-mortem(?: of)?|(?:this|the) (?:page|post-mortem|account|story) is built from)\b/gi, 'deck-closer formula ("This is the full post-mortem, built from…", "a sourced post-mortem of…"): end on the subject, put sourcing in the sources section', 'S23'],
  ['scene-opener', 'warn', /^(?:Picture (?:this|a|the)\b|Imagine (?:a|an|the|it'?s|walking)\b|It (?:was|is) (?:a|an|the) (?:cold|hot|rainy|quiet|late|early|bright|grey|gray|crisp|warm)\b[^.]{0,40}\b(?:morning|night|day|evening|afternoon)\b|On a (?:cold|hot|rainy|quiet|crisp|warm|bright|grey|gray)\b[^.]{0,30}\b(?:morning|night|day|evening|afternoon)\b)/gim, 'scene-setting opener: start with the fact the scene was standing in for', 'S24', { raw: true }],
  ['site-filler', 'warn', /\b(?:is|are) (?:filed|listed) under the same cause\b|\b(?:another|the other) (?:[\w-]+ ){0,4}(?:on|in) this (?:site|archive)\b|\bcovered (?:on|in) this (?:site|archive)\b/gi, 'link-holder sentence that only says another page exists: link words that already make a comparison, or leave it unlinked', 'S25'],
  ['unsupported-superlative', 'warn', /\b(?:faster|bigger|larger|more) than (?:anything|anyone|any other [\w-]+|any [\w-]+) (?:(?:else )?(?:had|before|in history)\b|the [\w -]{1,30} had (?:ever )?seen)/gi, 'unsourced superlative ranking: give the figures, or cite who ranked it', 'F9'],
  ['link-anchor', 'warn', /\[[^\]]*\b(?:filings?|sources|10-Ks?|press|records)\b[^\]]*\]\(\/about\/?\)/gi, 'anchor names this page\'s sources but links to the general About page: link #sources, or the About section that explains the method', 'S26', { raw: true }],
  ['rhetorical-q', 'warn', /\b(?:The (?:result|catch|upshot|answer|fix|reason|verdict|problem)\?\s+[A-Z]|what if I told you|so what does (?:this|that) mean\?|why does (?:this|that) matter\?)/g, 'rhetorical question answered by the next sentence', 'S15', { cs: true }],
  ['colon-reveal', 'warn', /(?:^|[.!?]\s+)(?:The|A|One) (?:result|problem|catch|answer|fix|lesson|truth|upshot|verdict|reason|takeaway|problem): [A-Z]/g, 'colon used to stage a reveal', 'P2', { cs: true }],
  ['closer', 'warn', /\b(?:that(?:'s| is) the (?:real )?(?:win|point|difference|takeaway|lesson|magic|kicker)|that (?:distinction|difference|part) matters|(?:this|that|it) (?:shows|demonstrates|reminds us) (?:the importance of|how important)|full stop\.)/gi, 'one-line closer that only says the point mattered', 'S2'],
  ['despite-formula', 'warn', /\bdespite (?:these|its|the|such) (?:challenges|setbacks|obstacles|headwinds)\b[^.]{0,140}\b(?:continues? to|remains?|still)\b/gi, '"despite challenges, continues to" formula', 'S8'],
  // ---- negative parallelism (RULES S1) ----
  ['not-x-but-y', 'error', /\b(?:(?:it|this|that|they|these|those|he|she|which|there)(?:'s| is| was|'re| are| were| isn'?t| wasn'?t| aren'?t| weren'?t) not (?:just |only |merely |simply |about )?|(?:is|are|was|were|isn'?t|aren'?t) not (?:just|only|merely|simply|about) )[^.;:!?]{1,80}?[,;:—–-]+\s*(?:but |it'?s |it was |it is |this is |that is |that'?s |they'?re |they were |these are |rather )/gi, '"It\'s not X, it\'s Y" construction', 'S1'],
  ['not-just', 'error', /\bnot (?:just|merely|simply) (?!because|when|if|yet|now)[^.;!?]{1,80}?,? but (?:also |rather )?|\bmore than (?:just|merely|simply) (?:a|an|the)\b|\bless about\b[^.!?]{2,60}\band more about\b|\b(?:stops|stopped) being\b[^.!?]{2,40}\bstarts? being\b/gi, '"not just X but Y" construction', 'S1'],
  ['not-only', 'warn', /\bnot only\b[^.!?]{3,100}?\bbut (?:also )?/gi, '"not only X but also Y" (fine once if both halves carry facts)', 'S1'],
  ['not-split', 'warn', /(?:^|[.!?]\s+)(?:It|This|That|The (?:question|problem|issue|point|goal|answer)) (?:is|was|does|did)(?: not|n'?t)\b[^.!?]{2,80}[.!?]\s+(?:It|That|This|They)(?:'s| is| are| was| means| meant)\b/g, 'contrast split across two sentences ("This isn\'t X. It\'s Y.")', 'S1', { cs: true }],
  ['no-x-no-y', 'warn', /\bNo [a-z]+(?: [a-z]+){0,2}\. No [a-z]+|\bno [a-z]+, no [a-z]+, (?:no|just)\b|[a-z], no (?:guessing|surprises|hassle|fuss|nonsense|magic|catch|tricks|ambiguity|compromises?|second-guessing)\b/g, 'staccato "No X. No Y." / clipped tail', 'S1', { cs: true }],
  // ---- editorialising tails, copula avoidance, false balance (RULES S7, S18, H2) ----
  ['ing-tail', 'warn', /,\s(?:highlighting|underscoring|emphasi[sz]ing|reflecting|showcasing|signaling|signalling|marking|cementing|solidifying|illustrating|demonstrating|symboli[sz]ing|reinforcing|contributing to|paving the way|fostering|cultivating|resonating with|ensuring (?:that )?(?:the|its|their|a)\b)/gi, 'trailing -ing clause that editorialises', 'S7'],
  ['copula', 'warn', /\b(?:serves|stands|functions) as (?:a|an|the)\b|\bboasts (?:a|an|the|over|more than|\d)/gi, 'copula avoidance: write "is" / "has"', 'S18'],
  ['copula-soft', 'info', /\b(?:features|offers|maintains) (?:a|an|the|over|more than|\d)/gi, 'possible copula avoidance (fine if it names a real feature or offer)', 'S18'],
  ['false-balance', 'warn', /\b(?:both sides (?:have|has|present)|each (?:side|perspective|viewpoint) (?:has|have|offers?)|valid points on both sides|a balanced approach|strike a balance|nuanced (?:understanding|approach|view)|(?:it )?depends on (?:various|many|several|a number of) factors|there is no (?:simple|easy|one-size-fits-all) answer|the answer is not (?:straightforward|simple)|the truth lies somewhere in the middle|while \w+ offers many benefits, (?:challenges|drawbacks) remain)\b/gi, 'fake balance: name the factors or take the position the evidence supports', 'H2'],
  // ---- hedging and intensity (RULES H1, H3) ----
  ['hedge-stack', 'warn', /\b(?:(?:could|might|may|can) (?:potentially|possibly|arguably|conceivably)|(?:possibly|potentially) (?:may|might|could)|it could be argued|it can be said|some might say)\b/gi, 'stacked hedge: one calibrated hedge, placed where the doubt is', 'H1'],
  ['hedge', 'warn', W('arguably|it seems that|it appears that|to some extent|in many ways|in some ways'), 'hedge; commit or cite', 'H1'],
  ['soft-hedge', 'info', W('perhaps|potentially|a number of|various|somewhat|relatively|fairly'), 'soft hedge (fine when it carries real uncertainty)', 'H1'],
  ['intensifier', 'warn', W('really|truly|incredibly|extremely|remarkably|profoundly|utterly|absolutely|undeniably|undoubtedly|literally|genuinely|honestly|simply put|quite frankly|to be honest'), 'empty intensifier / sincerity marker', 'H3', { proper: true, skip: (m, t) => /^literally$/i.test(m[0]) && /(?:too|taken|take|takes|taking|read|interpret\w*)\s+(?:it |them |that |this )?$/i.test(t.slice(Math.max(0, m.index - 24), m.index)) }],
  ['intensifier-soft', 'info', W('very|quite|deeply|certainly|definitely|clearly|obviously|of course'), 'mild intensifier (cut if deleting it changes nothing)', 'H3', { proper: true }],
  ['condescension', 'info', /\b(?:simply|just|easily|obviously|of course) (?:click|select|open|run|use|add|type|press|install)\b/gi, 'tells the reader the step is easy; state the step', 'H8'],
  ['vague-attribution', 'warn', /\b(?:experts|critics|analysts|observers|industry insiders|many|some|historians|commentators|fans|scholars|researchers|most people)\s+(?:say|said|argue|argued|believe|believed|note|noted|suggest|suggested|agree|agreed|contend|have (?:said|argued|noted|called|cited))\b|\b(?:studies|research|reports|data|surveys) (?:show|shows|suggest|suggests|indicate|indicates|reveal|reveals)\b|\bit (?:is|has been) (?:widely |generally |often )?(?:believed|said|noted|argued|regarded|considered)\b|\bindustry (?:reports|coverage)\b/gi, 'vague attribution; name the source', 'H6', { needsNoCite: true }],
  ['personification', 'warn', /\b(?:the (?:code|plan|data|numbers|story|era|decade|market|industry|culture|system|file|setting|document|brief))\s+(?:knows|remembers|remembered|wants|rewards|punishes|whispered|dreams|tells us|learned|insists)\b/gi, 'abstraction given agency (Mollick)', 'S16'],
  ['lexical-illusion', 'warn', /\b(?!had\b|that\b|is\b|was\b|do\b|does\b|can\b|will\b|very\b|bye\b)([a-z]{2,})\s+\1\b/gi, 'repeated word', 'R1', { proper: true }],
];
const SPAN_RULES = RULES.map(([id, sev, re, msg, ref, o = {}]) => ({ id, sev, re, msg, ref, ...o }));

// Tier B: flagged only when two distinct words share a paragraph (RULES W2). Tier C: flagged only on density (RULES W3).
const TIER_B = W("crucial|key (?:role|factor|takeaway|player|driver|component|aspect|insight)|highlight(?:s|ed|ing)? (?:the|how|that|its|their|a|an|this|these|why)|emphasi[sz](?:e|es|ed|ing)|enhanc(?:e|es|ed|ing)|robust|comprehensive|valuable|align(?:s|ed|ing)? with|resonat(?:e|es|ed|ing)|encompass(?:es|ed|ing)?|poised|burgeoning|nascent|quintessential|overarching|paramount|landscape|ecosystem|quietly|deeply|dependable|universally|prioriti[sz](?:e|es|ed|ing)|journey|streamlin(?:e|es|ed|ing)|harness(?:es|ed|ing)?|facilitat(?:e|es|ed|ing)|navigat(?:e|es|ed|ing)|notabl[ey]|iconic|storied|captivating|vital|stunning|thriving|cornerstone|symphony|mosaic|evolving|utili[sz](?:e|es|ed|ing)|holistic|innovative");
const TIER_C = W('significant(?:ly)?|innovative|innovation|effective(?:ly)?|dynamic|scalable|compelling|unprecedented|exceptional(?:ly)?|remarkabl[ey]|sophisticated|instrumental');
const MONTH = /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?,?$/;
const BODY_KEY = /(?:^|\.)(?:body|text|deck|standfirst|actual|whatif|blurb|title)(?:\[\d+\])?$/; // prose keys; labels like lede, note, source, caption and disclaimer are expected to repeat
const TRANSITION = /(?:^|[.!?]\s+)(?:Moreover|Furthermore|Additionally|In addition|Notably|Importantly|Interestingly|Crucially|In essence|Essentially|Overall)\b,?/g;
const TRANSITION_WEAK = /(?:^|[.!?]\s+)(?:Consequently|Indeed|Thus|Hence|That said|With that in mind)\b,?/g;
const METAPHORS = W('tapestry|symphony|beacon|kaleidoscope|mosaic|journey|ecosystem|lens|realm|landscape');
const PROMPTONYM = /\b(?:Elara (?:Voss|Vex|Dorne)|Elena Voss|Elias (?:Vance|Thorne)|Aris Thorne|Whispering Woods|Eldora)\b/g;
const STOP = new Set('the a an of to in and or for on at by with from as is was were be been it its that this which who his her their they he she i we you our not but if then than so up out into over after before about'.split(' '));
const SMALL = new Set('a an the and or but nor for so yet of in on at to by from with as is are vs via per'.split(' '));
const ABBR = /\b(?:Inc|Corp|Co|Ltd|Jr|Sr|Mr|Mrs|Ms|Dr|St|No|vs|etc|Mt|Gov|Sen|Rep|Gen|Col|Lt|Prof|Fig|Dept|Ave|Blvd|approx|est|a\.m|p\.m|e\.g|i\.e|U\.S|U\.K|[A-Z])\./g;

// ---------- input ----------
const QUOTE_KEYS = new Set(['q', 'quote', 'quotes', 'said', 'line', 'tagline', 'slogan']);
const PROSE_KEYS_SKIP = new Set(['url', 'href', 'src', 'img', 'image', 'art', 'logo', 'slug', 'id', 'color', 'colour', 'kind', 'provider', 'embed', 'file', 'alt', 'credit', 'license', 'licence', 'publisher', 'date', 'when', 'archive', 'theme', 'brand', 'soft', 'icon', 'category', 'cause', 'tier', 'status', 'who']);
function proseFromJSON(obj, out, keyPath = '', qctx = false) {
  if (typeof obj === 'string') { if (obj.split(/\s+/).length >= 6 && !/^https?:|^\/|^#|^var\(/.test(obj)) out.push({ where: keyPath, text: obj, quote: qctx || QUOTE_KEYS.has(keyPath.split('.').pop().replace(/\[\d+\]$/, '')) }); return; }
  if (Array.isArray(obj)) return obj.forEach((v, i) => proseFromJSON(v, out, `${keyPath}[${i}]`, qctx));
  if (obj && typeof obj === 'object') { // pull quotes, quote blocks and text kept from archived pages are the source's words, not ours
    const q = qctx || obj.kind === 'quote' || /(?:^|\.)pull$/.test(keyPath) || /(?:^|\.)snips\[\d+\]$/.test(keyPath);
    for (const [k, v] of Object.entries(obj)) if (!PROSE_KEYS_SKIP.has(k)) proseFromJSON(v, out, keyPath ? `${keyPath}.${k}` : k, q);
  }
}
// Markdown to prose blocks: skips front matter, fences, tables, images, blockquotes and html; one block per paragraph or list item.
function parseMarkdown(raw) {
  const paras = [], heads = []; let body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, m => m.replace(/[^\n]/g, ''));
  if (/^\s*<!--\s*slop-lint-disable-file\s*-->\s*$/m.test(body.replace(/^(```+|~~~+)[^\n]*\n[\s\S]*?\n\1[^\n]*$/gm, ''))) return { paras, heads, off: true };
  const lines = body.split(/\r?\n/); let cur = null, fence = null, ignore = null, pending = null;
  const flush = () => { if (cur && !cur.quote) { const text = cur.lines.join(' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); if (text.split(/\s+/).length >= 6) paras.push({ where: `L${cur.line}`, text, ignore: cur.ignore, list: cur.list }); if (pending && !cur.list) pending.after = text; pending = null; } cur = null; };
  lines.forEach((ln, i) => {
    const f = ln.match(/^\s*(```+|~~~+)/);
    if (fence) { if (f && f[1][0] === fence[0] && ln.trim().length >= fence.length) fence = null; return; }
    if (f) { flush(); pending = null; fence = f[1]; return; }
    const d = ln.match(/^\s*<!--\s*slop-lint-ignore(?:\s+([\w,-]+))?\s*-->\s*$/);
    if (d) { flush(); ignore = d[1] ? d[1].split(',') : ['*']; return; }
    if (!ln.trim()) { flush(); return; }
    const h = ln.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) { flush(); heads.push({ level: h[1].length, text: h[2], line: i + 1, ignore }); pending = heads[heads.length - 1]; ignore = null; return; }
    if (/^\s*(?:\||!\[|<)/.test(ln)) { flush(); pending = null; return; }
    if (/^\s*>/.test(ln)) { flush(); pending = null; cur = { quote: true, lines: [], line: i + 1 }; return; }
    if (cur && cur.quote) return;
    const li = ln.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/);
    if (li) { flush(); pending = null; cur = { line: i + 1, lines: [li[1]], ignore, list: true }; ignore = null; return; }
    if (!cur) { cur = { line: i + 1, lines: [], ignore }; ignore = null; }
    cur.lines.push(ln.trim());
  });
  flush(); return { paras, heads };
}
const docs = []; // {name, kind, files, paras:[{where,text,quote,file,ignore}], heads:[]}
function addDoc(name, kind) { let d = docs.find(x => x.name === name); if (!d) docs.push(d = { name, kind, files: [], paras: [], heads: [] }); return d; }
function addFile(f, group) {
  const raw = fs.readFileSync(f, 'utf8'); let paras = [], heads = [];
  if (f.endsWith('.json')) {
    if (/sources\.json$|videos\.json$|gallery\.json$/.test(f)) return; // citations and media captions are not prose under edit
    try { proseFromJSON(JSON.parse(raw), paras); } catch { return; }
  } else { const r = parseMarkdown(raw); if (r.off) return; paras = r.paras; heads = r.heads; }
  const d = addDoc(group || f, f.endsWith('.json') ? 'json' : 'md'); d.files.push(f);
  paras.forEach(p => d.paras.push({ ...p, file: f })); heads.forEach(h => d.heads.push({ ...h, file: f }));
}
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.name.startsWith('.') || e.name === 'node_modules' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
function loadInputs(list) {
  if (!list.length) {
    if (!fs.existsSync('companies')) { console.error('No inputs and no ./companies directory. Pass files or run from the Spectre Brands repo.'); process.exit(2); }
    for (const slug of fs.readdirSync('companies')) { if (slug.startsWith('_')) continue; const dir = path.join('companies', slug); if (!fs.statSync(dir).isDirectory()) continue; walk(dir).filter(f => f.endsWith('.json')).forEach(f => addFile(f, slug)); }
    if (fs.existsSync('site.json')) addFile('site.json', 'site.json');
  } else for (const i of list) (fs.statSync(i).isDirectory() ? walk(i).filter(f => /\.(md|markdown|txt|json|mdx)$/.test(f) && !/(?:^|[\\/])tests[\\/]bad\.md$/.test(f)) : [i]).forEach(f => addFile(f));
}

// ---------- text helpers ----------
// prepare(): strip markup, normalise apostrophes, drop footnote markers but remember where they were (cites = offsets in the result)
function prepare(text) {
  let t = text.replace(/`[^`]*`/g, 'CODE').replace(/\*\*|__/g, '').replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, '$1').replace(/[’‘]/g, "'");
  const cites = []; let out = '', last = 0; const re = /\[\^[\w-]+\]/g; let m;
  while ((m = re.exec(t))) { out += t.slice(last, m.index); cites.push(out.length); last = m.index + m[0].length; }
  return { t: out + t.slice(last), cites };
}
const inQuote = (t, idx) => { const before = t.slice(0, idx); return ((before.match(/“/g) || []).length > (before.match(/”/g) || []).length) || ((before.match(/"/g) || []).length % 2 === 1); };
const stripQuotes = t => t.replace(/“[^”]*”/g, ' ').replace(/"[^"]*"/g, ' ');
const sentences = t => t.replace(ABBR, m => m.slice(0, -1) + '\u0001').split(/(?<=[.!?])\s+(?=[A-Z“"‘(])/).map(s => s.replace(/\u0001/g, '.').trim()).filter(s => s.split(/\s+/).length >= 2);
const nwords = s => s.split(/\s+/).filter(Boolean).length;
const countDashes = t => { const s = stripQuotes(t); return (s.match(/—/g) || []).length + (s.match(/(?<=[A-Za-z,.)])\s--\s(?=[A-Za-z])/g) || []).length + (s.match(/(?<=[a-z,.)])\s–\s(?=[a-z])/g) || []).length; };
const properNoun = (t, m) => { // a capitalised match that is mid-sentence, or opens a capitalised name ("Clearly Canadian"), is a name, not our word
  if (!/^[A-Z]/.test(m[0])) return false;
  if (!/(?:^|[.!?]["”']?\s+)$/.test(t.slice(0, m.index))) return true;
  return /^\s+[A-Z][a-z]/.test(t.slice(m.index + m[0].length, m.index + m[0].length + 20));
};
const norm = s => s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const gramNorm = s => s.toLowerCase().replace(/[’‘“”"]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/(^|\s)'+|'+(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
// Deliberate shared text on the Spectre Brands site (labels, disclaimers, method statements). Applied in default mode, when no
// inputs are given and ./companies exists; --no-allow turns it off. Body-prose repeats are never listed here.
const SPECTRE_ALLOW = [
  'tap a cause to see the evidence',
  'the evidence under each one is sourced',
  'the percentages are our editorial weighting',
  'weights are an interpretive model',
  'weights are our judgment',
  'is a matter of opinion',
  'how much each factor contributed',
  'what if panels are speculation',
  'decisions where the story could',
  'what they said at the time',
  'a sourced post-mortem of',
  'click one to open the original capture',
  'internet archive\'s wayback machine',
  'screenshots of pages saved by the internet archive',
  'later careers are included only where',
  'later careers are left out where',
  'where we have no source',
  'titles are as given in',
  'roles and dates are from',
  'original illustration in the spirit of',
  'not an official asset',
  'this page is built from',
  'the press of the time',
  'contemporary press and the archived website',
  'not a measured quantity',
  'the filings document the symptoms',
  'screenshots of internet archive captures',
  'screenshots of pages saved by',
  'substantial doubt about',
];
let allow = [];
function loadAllow(f) { if (f && fs.existsSync(f)) allow = allow.concat(fs.readFileSync(f, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')).map(gramNorm)); }

// ---------- analysis ----------
function analyze(docs, { corpus = true } = {}) {
  const issues = [], docStats = [];
  const push = (sev, rule, doc, where, msg, excerpt, ref) => { if (!ONLY.length || ONLY.includes(rule)) issues.push({ sev, rule, doc, where, msg: msg + (ref ? ` [${ref}]` : ''), excerpt }); };
  const ngramDocs = new Map(), ngramBody = new Map(), openerDocs = new Map(), closers = new Map(), skeletons = new Map(), firsts = new Map(), metaDocs = new Map();
  const rank = { error: 0, warn: 1, info: 2 };
  for (const d of docs) {
    let words = 0, dashes = 0, colons = 0, ex = 0, triads = 0, bold = 0, sentCount = 0; const lens = [], ends = [], seenSent = new Map(), tierC = new Map(), openers = new Map(), mine = new Map(); let nPara = 0, band = 0, intens = 0;
    const loc = p => `${path.basename(p.file)} ${p.where}`;
    for (const p of d.paras) {
      const ign = p.ignore || []; if (ign.includes('*')) continue;
      const ok = id => !ign.includes(id);
      const { t, cites } = prepare(p.text);       const hasCiteAfter = (idx, span = 220) => cites.some(c => c >= idx && c <= idx + span);
      const found = [];
      for (const r of SPAN_RULES) {
        if (!ok(r.id)) continue;
        const src = r.raw ? p.text.replace(/`[^`]*`/g, ' ').replace(/\*\*/g, '') : t; r.re.lastIndex = 0; let m;
        while ((m = r.re.exec(src))) {
          if (m[0] === '') { r.re.lastIndex++; continue; }
          if (r.proper && properNoun(src, m)) continue;
          if (r.skip && r.skip(m, src)) continue;
          if (r.skipBy === 'foster' && /^foster/i.test(m[0]) && fosterSkip(m, src)) continue;
          if (r.needsNoCite && hasCiteAfter(m.index + m[0].length)) continue;
          const q = p.quote || inQuote(src, m.index);
          found.push({ r, start: m.index, end: m.index + m[0].length, q, src });
          if (!r.re.global) break;
        }
      }
      // overlap: keep the most severe, then the longest; one finding per span
      found.sort((a, b) => rank[a.r.sev] - rank[b.r.sev] || (b.end - b.start) - (a.end - a.start) || a.start - b.start);
      const kept = []; for (const f of found) if (!kept.some(k => f.src === k.src && f.start < k.end && f.end > k.start)) kept.push(f);
      for (const f of kept) {
        const sevOut = f.q ? 'info' : f.r.sev;
        const ctx = f.src.slice(Math.max(0, f.start - 50), f.end + 50).replace(/\s+/g, ' ');
        push(sevOut, f.r.id, d.name, loc(p), f.r.msg + (f.q ? ' (inside a quotation: leave it)' : ''), ctx, f.r.ref);
        if (!f.q && (f.r.id === 'intensifier' || f.r.id === 'intensifier-soft')) intens++;
      }
      // sentence-initial transitions
      for (const [re, sev] of [[TRANSITION, 'warn'], [TRANSITION_WEAK, 'info']]) { re.lastIndex = 0; let m; while ((m = re.exec(t))) if (ok('transition')) push(p.quote || inQuote(t, m.index) ? 'info' : sev, 'transition', d.name, loc(p), 'mechanical transition at sentence start (keep one that states a real cause, condition or contrast)', t.slice(Math.max(0, m.index - 30), m.index + m[0].length + 60).replace(/\s+/g, ' '), 'W1'); }
      // tier B cluster: two distinct words in one paragraph
      if (ok('ai-vocab-soft')) {
        const hits = new Map(); TIER_B.lastIndex = 0; let m;
        while ((m = TIER_B.exec(t))) {
          const word = m[0].toLowerCase().split(/\s+/)[0].replace(/[^a-z-]/g, ''), stem = word.slice(0, 6);
          const sk = SENSE[Object.keys(SENSE).find(k => word.startsWith(k.slice(0, 5)))]; if (sk && sk(m, t)) continue;
          if (properNoun(t, m) || p.quote || inQuote(t, m.index)) continue; hits.set(stem, word);
        }
        if (hits.size >= 2) push('warn', 'ai-vocab-soft', d.name, loc(p), `${hits.size} overused words in one paragraph: ${[...hits.values()].join(', ')}`, t.slice(0, 140), 'W2');
      }
      // tier C counts (doc density, reported after the loop)
      TIER_C.lastIndex = 0; { let m; while ((m = TIER_C.exec(t))) if (!p.quote && !inQuote(t, m.index) && !properNoun(t, m)) { const k = m[0].toLowerCase().replace(/ly$/, '').replace(/ive$/, 'iv'); tierC.set(k, (tierC.get(k) || 0) + 1); } }
      // metaphor and promptonym registry (cross-doc)
      METAPHORS.lastIndex = 0; { let m; while ((m = METAPHORS.exec(t))) if (!p.quote && !inQuote(t, m.index) && !properNoun(t, m) && !(m[0].toLowerCase() === 'landscape' && landscapeSkip(m, t))) { const k = m[0].toLowerCase(); if (!metaDocs.has(k)) metaDocs.set(k, new Set()); metaDocs.get(k).add(d.name); } }
      PROMPTONYM.lastIndex = 0; { let m; while ((m = PROMPTONYM.exec(t))) if (ok('promptonym')) push('warn', 'promptonym', d.name, loc(p), 'stock LLM name: use a real name from a source or a neutral label', m[0], 'R2f'); }
      // punctuation counts (outside quotations)
      if (p.quote) continue; // below: punctuation, rhythm and repetition stats describe our prose, not quoted speech
      const noq = stripQuotes(t), pd = countDashes(t); dashes += pd; colons += (noq.match(/:\s/g) || []).length; ex += (noq.match(/!/g) || []).length; bold += (p.text.replace(/^\s*\*\*[^*\n]+\*\*/, '').match(/\*\*[^*\n]+\*\*/g) || []).length; // a bold label that opens a paragraph is a run-in heading, not emphasis
      if (pd >= 3 && ok('em-dash-cluster')) push('warn', 'em-dash-cluster', d.name, loc(p), `${pd} dashes in one paragraph (limit 2)`, t.slice(0, 140), 'P1');
      if (/(?<=[A-Za-z,.)])\s—\s(?=[A-Za-z])|(?<=[A-Za-z,.)])\s--\s(?=[A-Za-z])/.test(noq) && ok('spaced-dash')) push('warn', 'spaced-dash', d.name, loc(p), 'spaced em dash or double hyphen used as a dash', t.slice(0, 120), 'P1');
      if (/[\u{1F300}-\u{1FAFF}✅✨❌]/u.test(p.text) && d.kind === 'md' && ok('emoji')) push('warn', 'emoji', d.name, loc(p), 'emoji in expository prose', t.slice(0, 100), 'P6');
      if (d.kind === 'md' && p.list && /^\s*\*\*[^*]+\*\*\s*[:—–-]?\s*\w/.test(p.text) && ok('inline-header-list')) push('warn', 'inline-header-list', d.name, loc(p), 'bold lead-in label on a list item', p.text.slice(0, 100), 'S11');
      // sentence statistics
      const ss = sentences(t); nPara++;
      if (ss.length) { const last = ss[ss.length - 1]; if (nwords(p.text) >= 30) ends.push(nwords(last) <= 6); }
      let prevOp = '', run = 0, prevLen = 0;
      ss.forEach((s, si) => {
        const w = nwords(s); lens.push(w); words += w; sentCount++; if (w >= 8 && w <= 20) band++;
        const key = norm(s); if (w >= 12) { if (seenSent.has(key)) { if (ok('duplicate-sentence')) push(/(?:source|note|caption|artCaption|disclaimer|credit)(?:\[\d+\])?$/i.test(p.where) ? 'info' : 'warn', 'duplicate-sentence', d.name, loc(p), `sentence repeated verbatim (first at ${seenSent.get(key)})`, s.slice(0, 120), 'R1'); } else seenSent.set(key, loc(p)); }
        const toks = s.split(/\s+/); const op = toks.slice(0, 3).join(' ').toLowerCase().replace(/[^a-z' ]/g, '');
        if (op.split(' ').length === 3) { openers.set(op, (openers.get(op) || 0) + 1); if (!openerDocs.has(op)) openerDocs.set(op, new Set()); openerDocs.get(op).add(d.name); }
        const o1 = toks.slice(0, 2).every(x => /^[A-Za-z']+$/.test(x)) && !MONTH.test(toks[1]) ? toks.slice(0, 2).join(' ').toLowerCase() : ''; // three consecutive sentences with the same two-word opener
        if (o1 && w >= 6 && o1 === prevOp) run++; else run = o1 && w >= 6 ? 1 : 0; prevOp = o1 && w >= 6 ? o1 : '';
        if (run === 3 && ok('repeated-opener')) push('warn', 'repeated-opener', d.name, loc(p), `three sentences in a row open with "${o1}…"`, s.slice(0, 100), 'R1');
        if (w >= 45) push('info', 'long-sentence', d.name, loc(p), `${w}-word sentence`, s.slice(0, 140));
        if (/\b[\w-]+(?: [\w-]+)?, [\w-]+(?: [\w-]+)?,? (?:and|or) [\w-]+/.test(s)) triads++;
        if (/\b(?:\w+ly )?\w+(?:ful|ive|ous|ing|al|ic|ent|ant)\b, \b\w+(?:ful|ive|ous|ing|al|ic|ent|ant)\b,? and \b\w+(?:ful|ive|ous|ing|al|ic|ent|ant)\b/i.test(s) && !/selling, general,? and administrative/i.test(s) && ok('rule-of-three')) push('warn', 'rule-of-three', d.name, loc(p), 'triad of adjectives/abstractions: does each item add a different idea?', s.slice(0, 140), 'S6');
      });
      if (nwords(t) >= 8 && d.kind === 'md') { const ng = t.toLowerCase().split(/\W+/).filter(Boolean); for (let i = 0; i + 6 <= ng.length; i++) { const g = ng.slice(i, i + 6); if (g.filter(x => !STOP.has(x)).length < 3 || g.some(x => /^\d/.test(x))) continue; const k = g.join(' '); mine.set(k, (mine.get(k) || 0) + 1); } }
      // cross-document 5-grams (template detection)
      let nt = gramNorm(t); for (const a of allow) if (nt.includes(a)) nt = nt.split(a).join(' | '); // approved boilerplate breaks the n-gram windows
      const toks = nt.split(' ').filter(Boolean);
      for (let i = 0; i + 5 <= toks.length; i++) { const g = toks.slice(i, i + 5); if (g.includes('|') || g.filter(x => !STOP.has(x)).length < 2 || g.some(x => /^\d+$/.test(x))) continue; const k = g.join(' '); if (!ngramDocs.has(k)) ngramDocs.set(k, new Set()); ngramDocs.get(k).add(d.name); if (d.kind === 'md' || BODY_KEY.test(p.where)) { if (!ngramBody.has(k)) ngramBody.set(k, new Set()); ngramBody.get(k).add(d.name); } }
    }
    for (const [k, n] of mine) if (n >= 3) push('info', 'repeated-phrase', d.name, '', `"${k}" appears ${n} times in one document`, '', 'R1');
    for (const [op, n] of openers) if (n >= Math.max(6, Math.ceil(sentCount * 0.04))) push('info', 'opener-frequency', d.name, '', `${n} of ${sentCount} sentences open with "${op}…"`, '', 'R1');
    // markdown headings and format metrics
    if (d.kind === 'md') {
      let prev = 0; const stockH = /^(?:conclusion|in summary|final thoughts|key takeaways?|looking ahead|future outlook|the future|challenges and|awards and recognition|wrapping up|takeaways?)\b/i;
      for (const h of d.heads) {
        const ign = h.ignore || []; if (ign.includes('*')) continue; const wh = `${path.basename(h.file)} L${h.line}`; const ws = h.text.replace(/[*_`]/g, '').split(/\s+/).filter(Boolean);
        const sig = ws.slice(1).filter(x => /^[A-Za-z]{4,}$/.test(x)); if (ws.length >= 4 && sig.length >= 3 && sig.every(x => /^[A-Z]/.test(x)) && !ign.includes('heading-case')) push('warn', 'heading-case', d.name, wh, 'Title Case heading: use sentence case', h.text, 'S12');
        if (stockH.test(h.text) && !ign.includes('heading-stock')) push('warn', 'heading-stock', d.name, wh, 'stock heading: name the content instead', h.text, 'S12');
        if (/[\u{1F300}-\u{1FAFF}→✅]/u.test(h.text) && !ign.includes('heading-emoji')) push('warn', 'heading-emoji', d.name, wh, 'emoji or arrow in a heading', h.text, 'S12');
        if (/—|\s--\s/.test(h.text)) push('warn', 'heading-dash', d.name, wh, 'dash in a heading', h.text, 'P1');
        if (/:\s*$/.test(h.text)) push('info', 'heading-colon', d.name, wh, 'trailing colon in a heading', h.text, 'P5');
        if (prev && h.level > prev + 1) push('info', 'heading-skip', d.name, wh, `heading level jumps from ${prev} to ${h.level}`, h.text, 'S12');
        prev = h.level;
        if (h.after) { const hw = new Set(norm(h.text).split(' ').filter(x => x.length > 3)), fs1 = h.after.split(/(?<=[.!?])\s/)[0], fw = norm(fs1).split(' ').filter(x => x.length > 3); if (hw.size && nwords(fs1) <= 8 && fw.length && fw.filter(x => hw.has(x)).length / hw.size >= 0.6 && !ign.includes('heading-echo')) push('warn', 'heading-echo', d.name, wh, 'first sentence restates the heading', `${h.text} / ${fs1}`, 'S12'); }
      }
      const raw = d.paras.map(p => p.text).join('\n'); if (/“/.test(raw) && /(?<![=\w])"[A-Za-z]/.test(raw)) push('info', 'mixed-quotes', d.name, '', 'curly and straight double quotes in one document', '', 'P6');
    }
    if (!lens.length) continue;
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length, sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length), cv = sd / mean;
    const per1k = words ? dashes / words * 1000 : 0;
    docStats.push({ doc: d.name, words, sentences: lens.length, meanLen: +mean.toFixed(1), sdLen: +sd.toFixed(1), cv: +cv.toFixed(2), dashesPer1k: +per1k.toFixed(1), colonsPer1k: +(colons / words * 1000).toFixed(1) });
    if (lens.length >= 15 && cv < 0.4) push('warn', 'uniform-rhythm', d.name, '', `sentence lengths too uniform (CV ${cv.toFixed(2)}, mean ${mean.toFixed(1)})`, '', 'S17');
    if (lens.length >= 25 && band / lens.length > 0.85) push('info', 'band-8-20', d.name, '', `${Math.round(band / lens.length * 100)}% of sentences are 8 to 20 words`, '', 'S17');
    if (ends.length >= 5 && ends.filter(Boolean).length / ends.length >= 0.4) push('warn', 'punchy-endings', d.name, '', `${ends.filter(Boolean).length} of ${ends.length} paragraphs end on a sentence of 6 words or fewer`, '', 'S2');
    if (words >= 150 && intens / words * 1000 > 6) push('warn', 'intensifier-density', d.name, '', `${(intens / words * 1000).toFixed(1)} intensifiers per 1,000 words (limit 6)`, '', 'H3');
    if (words >= 300 && per1k > 2 && dashes >= 3) push('warn', 'em-dash-density', d.name, '', `${per1k.toFixed(1)} dashes per 1,000 words (aim for 1, limit 2)`, '', 'P1');
    if (words >= 300 && colons / words * 1000 > 7) push('info', 'colon-density', d.name, '', `${(colons / words * 1000).toFixed(1)} colons per 1,000 words`, '', 'P2');
    if (d.kind === 'md' && words >= 150 && ex / words * 1000 > 2) push('info', 'exclamation-density', d.name, '', `${(ex / words * 1000).toFixed(1)} exclamation marks per 1,000 words`, '', 'P6');
    if (d.kind === 'md' && bold >= 4 && bold / words * 1000 > 6) push('warn', 'bold-density', d.name, '', `${bold} bold spans, ${(bold / words * 1000).toFixed(1)} per 1,000 words`, '', 'P5');
    if (words >= 150 && sentCount >= 6 && triads / sentCount > 0.25 && triads >= 4) push('info', 'triad-density', d.name, '', `${triads} of ${sentCount} sentences contain a comma triad`, '', 'S6');
    const cth = Math.max(4, Math.floor(words * 0.01)); for (const [k, n] of tierC) if (n >= cth) push('warn', 'ai-vocab-density', d.name, '', `"${k}" appears ${n} times in ${words} words`, '', 'W3');
    if (d.kind === 'md' && d.paras.length) { const lastP = d.paras[d.paras.length - 1], ls = sentences(prepare(lastP.text).t); if (ls.length && nwords(ls[ls.length - 1]) >= 6) { const k = norm(ls[ls.length - 1]); if (!closers.has(k)) closers.set(k, []); closers.get(k).push(d.name); } const first = sentences(prepare(d.paras[0].text).t)[0]; if (first) { const k = norm(first).split(' ').slice(0, 4).join(' '); if (k.split(' ').length === 4) { if (!firsts.has(k)) firsts.set(k, []); firsts.get(k).push(d.name); } } const sk = d.heads.filter(h => h.level === 2).map(h => norm(h.text)).join('|'); if (sk.split('|').length >= 3) { if (!skeletons.has(sk)) skeletons.set(sk, []); skeletons.get(sk).push(d.name); } }
  }
  // ----- site-wide repetition -----
  const DOCN = docs.length;
  if (corpus && DOCN > 1) {
    const repeated = [...ngramDocs].filter(([, s]) => s.size >= Math.max(MIN_DOCS, 2));
    const chains = new Map(); // signature -> [{text, docs}]: overlapping 5-grams that share a document set become one repeated passage
    for (const [k, s] of repeated) {
      const sig = [...s].sort().join('|'); const list = chains.get(sig) || []; const w = k.split(' ');
      const hit = list.find(c => c.text.endsWith(w.slice(0, 4).join(' ')));
      if (hit) hit.text += ' ' + w[4]; else list.push({ text: k, docs: s, body: ngramBody.get(k) || new Set() });
      chains.set(sig, list);
    }
    const passages = [...chains.values()].flat().sort((a, b) => b.docs.size - a.docs.size || b.text.length - a.text.length);
    for (const c of passages.slice(0, 80)) {
      const share = c.docs.size / DOCN;
      const prose = c.body.size >= Math.max(MIN_DOCS, 2) && c.text.split(' ').length >= 7; // repeated body prose is a finding; repeated labels are a template
      push(share >= 0.6 || !prose ? 'info' : 'warn', share >= 0.6 || !prose ? 'site-template' : 'cross-doc-ngram', `${c.docs.size} docs`, '',
        share >= 0.6 || !prose ? `shared template text in ${c.docs.size}/${DOCN} documents (fine if it is a deliberate label; vary it if it reads as prose)` : `"${c.text}" repeats in body prose across ${c.body.size} documents`, share >= 0.6 || !prose ? `"${c.text}"` : [...c.body].slice(0, 8).join(', '), 'R2a');
    }
    for (const [op, s] of openerDocs) if (s.size >= Math.max(6, Math.ceil(DOCN / 4))) push('info', 'cross-doc-opener', `${s.size} docs`, '', `sentence opener "${op}…" used in ${s.size} documents`, '', 'R2d');
    for (const [k, s] of metaDocs) if (s.size >= 3) push('warn', 'metaphor-spread', `${s.size} docs`, '', `"${k}" used as a figure in ${s.size} documents: keep it in one, say the literal thing elsewhere`, [...s].slice(0, 8).join(', '), 'R2e');
    for (const [k, l] of closers) if (l.length >= 2) push('warn', 'repeated-closer', `${l.length} docs`, '', 'identical final sentence in several documents', `${k} (${l.join(', ')})`, 'R2b');
    for (const [k, l] of firsts) if (l.length >= 3) push('warn', 'repeated-first-sentence', `${l.length} docs`, '', `first sentences all begin "${k}…"`, l.join(', '), 'R2d');
    for (const [k, l] of skeletons) if (l.length >= 3) push('warn', 'same-skeleton', `${l.length} docs`, '', 'same sequence of H2 headings in several documents', `${k.replaceAll('|', ' / ')} (${l.join(', ')})`, 'R2c');
    if (DOCN >= 8) { const ws = docStats.map(s => s.words), m = ws.reduce((a, b) => a + b, 0) / ws.length, cvw = Math.sqrt(ws.reduce((a, b) => a + (b - m) ** 2, 0) / ws.length) / m; if (cvw < 0.15) push('info', 'uniform-page-length', `${DOCN} docs`, '', `page lengths are nearly identical (CV ${cvw.toFixed(2)})`, '', 'R2h'); }
  }
  issues.sort((a, b) => rank[a.sev] - rank[b.sev] || a.rule.localeCompare(b.rule));
  return { issues, docStats };
}

// ---------- fact diff (RULES F1, F2) ----------
function facts(text) {
  const t = text.replace(/[’‘]/g, "'"), get = (re, f = m => m[0]) => [...t.matchAll(re)].map(f);
  return {
    urls: get(/https?:\/\/[^\s)\]>"']+/g).map(u => u.replace(/[.,;]+$/, '')),
    numbers: get(/(?<![\w.])\$?\d[\d,]*(?:\.\d+)?(?:\s?(?:%|percent|ms|GB|MB|kg|km|[MBKkmb]\b))?/g).map(x => x.replace(/\s+/g, '')),
    years: get(/\b(?:1[5-9]|20)\d\d\b/g),
    quotes: get(/[“"]([^”"\n]{12,})[”"]/g, m => m[1].trim()),
    citations: get(/\[\^[\w-]+\]|\[\d+\]|\b10\.\d{4,}\/\S+/g).map(x => x.replace(/[.,;)]+$/, '')),
  };
}
function diffFacts(a, b) {
  const A = facts(fs.readFileSync(a, 'utf8')), B = facts(fs.readFileSync(b, 'utf8')); let n = 0;
  const bag = arr => arr.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  console.log(`slop-lint --diff: ${path.basename(a)} -> ${path.basename(b)}`);
  for (const k of Object.keys(A)) {
    const ba = bag(A[k]), bb = bag(B[k]), dropped = [], added = [];
    for (const [x, c] of ba) if ((bb.get(x) || 0) < c) dropped.push(c - (bb.get(x) || 0) > 1 ? `${x} (x${c - (bb.get(x) || 0)})` : x);
    for (const [x, c] of bb) if ((ba.get(x) || 0) < c) added.push(c - (ba.get(x) || 0) > 1 ? `${x} (x${c - (ba.get(x) || 0)})` : x);
    n += dropped.length + added.length;
    if (dropped.length) console.log(`  [error] F2-dropped-${k}: ${dropped.join(' | ')}`);
    if (added.length) console.log(`  [error] F1-added-${k}: ${added.join(' | ')}`);
  }
  console.log(n ? `${n} differences. Each must be a deliberate, reported change; anything added needs a source.` : 'No differences in URLs, numbers, years, quotations or citation markers.');
  return n;
}

// ---------- self test ----------
function selftest() {
  let fail = 0; const ok = (c, msg) => { console.log(`  ${c ? 'ok  ' : 'FAIL'} ${msg}`); if (!c) fail++; };
  const lintText = (text, kind = 'md') => { docs.length = 0; const { paras } = parseMarkdown(text); const d = addDoc('t', kind); paras.forEach(p => d.paras.push({ ...p, file: 't.md' })); return analyze(docs, { corpus: false }).issues; };
  const hits = (text, rule, minSev = 'warn') => lintText(text).some(i => i.rule === rule && (minSev === 'info' || i.sev !== 'info'));
  const CASES = [ // [text, rule, should it fire]
    ['We will delve into the filings and see what they show.', 'ai-vocab', true], ['The brand became a rich tapestry of regional tastes.', 'ai-vocab', true], ['This record is a testament to the team.', 'ai-vocab', true],
    ['The 1988 buyout was a leveraged buyout financed with new notes.', 'ai-vocab', false], ['Operating leverage fell as sales dropped across all the stores.', 'ai-vocab', false], ['We plan to leverage our brand across all the stores.', 'ai-vocab', true],
    ['Foster City is where the company kept its head office for the whole period.', 'ai-vocab', false], ['Clearly Canadian said that sales of the drink fell in every quarter of the year.', 'intensifier-soft', false],
    ['The firm was robust, comprehensive and nuanced in how it described the whole landscape of things.', 'ai-vocab-soft', true], ['Standard errors were robust to outliers and the landscape orientation was fixed for the print.', 'ai-vocab-soft', false],
    ['It is not a database, it is a platform for building applications on top of the data.', 'not-x-but-y', true], ['This is not just a tool but a movement for everyone who builds software.', 'not-just', true], ['Delete the local cache, not the remote originals, before you restart the whole service.', 'not-just', false],
    ['Moreover, the store count fell by 682 in a single year and the company said so.', 'transition', true], ['The count fell by 682 in a year. However, revenue held above five billion dollars.', 'transition', false],
    ['I hope this helps with the rest of your research on the company.', 'chatbot', true], ['The page still contains oaicite markers from the tool that drafted it.', 'markup-residue', true], ['The source line reads [Insert source here] and nothing else was supplied.', 'placeholder', true],
    ['The firm closed, highlighting its decline in the whole market over the next several years.', 'ing-tail', true], ['The site serves as a hub for everything the company ever published about itself.', 'copula', true],
    ['It could potentially help the company recover some of the lost sales over the year.', 'hedge-stack', true], ['Analysts said revenue would fall by a third before the end of that year.', 'vague-attribution', true], ['Analysts said revenue would fall by a third before the end of that year.[^3]', 'vague-attribution', false],
    ['Three dashes — one, two — and three — appear in this one paragraph of prose here.', 'em-dash-cluster', true], ['The result? Clarity, and nothing more than that, for every reader of the page.', 'rhetorical-q', true],
    ['That is the real win for anyone who reads the page from top to bottom this year.', 'closer', true], ['Honestly, the chain had been shrinking for a decade before the outbreak was reported.', 'candor', true],
    ['The ship stayed at the dock while the crew counted 9,094 stores in 25 countries and wrote it down.', 'ai-vocab', false],
    ['He said: “This record is a testament to the team and its work over the years.”', 'ai-vocab', false],
    ['Open the the file and read the first line before you do anything else with it today.', 'lexical-illusion', true],
    ['Six years later it filed for bankruptcy. This is the full post-mortem, built from the company’s own SEC filings.', 'deck-closer', true], ['A sourced post-mortem of Chi-Chi’s, from its owners’ filings.', 'deck-closer', true],
    ['This post looks at why the chain closed its last stores in 2008 and what came after.', 'meta-doc', true], ['Picture a strip mall in Dallas, with a line out the door and a wall of new releases.', 'scene-opener', true],
    ['It was a cold morning in Pittsfield when the brothers opened their candy business on the main street.', 'scene-opener', true], ['On a cold day in 2008 the company filed its second Chapter 11 petition in Delaware.', 'scene-opener', true],
    ['The first store opened in Dallas on October 19, 1985, with some 8,000 tapes on the shelves.', 'scene-opener', false],
    ['Blockbuster is filed under the same cause as the chain that replaced it on the high street.', 'site-filler', true], ['The 3DO and Ouya are other console makers covered on this site, with their own pages.', 'site-filler', true],
    ['Groupon grew faster than anything the consumer internet had seen before its public listing.', 'unsupported-superlative', true], ['Revenue rose from $14.5M in 2009 to $1.6B in 2011, faster than at eBay or Amazon in their first years.[^4]', 'unsupported-superlative', false],
    ['The figures come from its [SEC filings](/about/) and the press of the period it covers.', 'link-anchor', true], ['The figures come from its [SEC filings](#sources) and the press of the period it covers.', 'link-anchor', false],
  ];
  console.log('micro cases');
  for (const [text, rule, want] of CASES) ok(hits(text, rule) === want, `${want ? 'flags' : 'ignores'} ${rule}: ${text.slice(0, 60)}`);
  const quoted = lintText('He said: “This record is a testament to the team and its work over the years.”');
  ok(quoted.some(i => i.rule === 'ai-vocab' && i.sev === 'info'), 'a direct quotation is reported as info, not error');
  const ign = lintText('<!-- slop-lint-ignore -->\nWe will delve into the filings and see what they show to readers here.');
  ok(!ign.some(i => i.rule === 'ai-vocab'), 'slop-lint-ignore skips the next paragraph');
  console.log('fixtures');
  const dir = path.join(HERE, 'tests');
  for (const [name, want] of [['bad.md', 'bad'], ['good.md', 'good']]) {
    const f = path.join(dir, name); if (!fs.existsSync(f)) { ok(false, `${name} exists`); continue; }
    docs.length = 0; addDoc(name, 'md'); const { paras, heads } = parseMarkdown(fs.readFileSync(f, 'utf8')); const d = docs[0]; paras.forEach(p => d.paras.push({ ...p, file: f })); heads.forEach(h => d.heads.push({ ...h, file: f }));
    const { issues } = analyze(docs, { corpus: false }), e = issues.filter(i => i.sev === 'error'), w = issues.filter(i => i.sev === 'warn'), rules = new Set(issues.filter(i => i.sev !== 'info').map(i => i.rule));
    if (want === 'bad') {
      ok(e.length > 0, `bad.md produces errors (${e.length} errors, ${w.length} warnings, ${rules.size} distinct rules)`);
      const need = ['deck-closer', 'scene-opener', 'site-filler', 'ai-vocab', 'stock-phrase', 'not-x-but-y', 'not-just', 'significance', 'chatbot', 'markup-residue', 'placeholder', 'transition', 'ing-tail', 'em-dash-cluster', 'heading-stock', 'ai-vocab-soft', 'vague-attribution', 'closer', 'rhetorical-q', 'hedge-stack', 'intensifier', 'copula', 'false-balance', 'inline-header-list', 'heading-case'];
      const miss = need.filter(r => !rules.has(r)); ok(!miss.length, `bad.md exercises the main rules${miss.length ? ' (missing: ' + miss.join(', ') + ')' : ''}`);
    } else { ok(e.length === 0, `good.md produces no errors (${e.length})`); ok(w.length === 0, `good.md produces no warnings (${w.length}${w.length ? ': ' + [...new Set(w.map(i => i.rule))].join(', ') : ''})`); }
  }
  console.log(fail ? `\nselftest FAILED: ${fail} check(s)` : '\nselftest passed'); process.exit(fail ? 1 : 0);
}

// ---------- main ----------
if (flag('--list-rules')) {
  const rows = [...SPAN_RULES.map(r => [r.id, r.sev, r.ref, r.msg]), ['ai-vocab-soft', 'warn', 'W2', 'two or more tier B words in one paragraph'], ['ai-vocab-density', 'warn', 'W3', 'tier C word above max(4, 1% of words)'], ['transition', 'warn', 'W1', 'mechanical transition at sentence start'], ['em-dash-cluster', 'warn', 'P1', '3+ dashes in one paragraph'], ['em-dash-density', 'warn', 'P1', 'more than 2 dashes per 1,000 words'], ['spaced-dash', 'warn', 'P1', 'spaced em dash or double hyphen'], ['rule-of-three', 'warn', 'S6', 'adjective triad'], ['uniform-rhythm', 'warn', 'S17', 'sentence-length CV below 0.4'], ['punchy-endings', 'warn', 'S2', '40% of paragraphs end on 6 words or fewer'], ['repeated-opener', 'warn', 'R1', 'three consecutive sentences with the same opener'], ['duplicate-sentence', 'warn', 'R1', 'same 12+ word sentence twice'], ['intensifier-density', 'warn', 'H3', 'more than 6 intensifiers per 1,000 words'], ['heading-case / heading-stock / heading-emoji / heading-dash / heading-echo', 'warn', 'S12', 'heading habits (markdown)'], ['inline-header-list / bold-density / emoji', 'warn', 'S11 P5 P6', 'formatting habits (markdown)'], ['cross-doc-ngram / site-template', 'warn/info', 'R2a', 'text repeated across documents'], ['metaphor-spread / repeated-closer / repeated-first-sentence / same-skeleton', 'warn', 'R2b-e', 'site-wide sameness'], ['promptonym', 'warn', 'R2f', 'stock LLM names']];
  for (const [id, sev, ref, msg] of rows) console.log(`${String(id).padEnd(28)} ${String(sev).padEnd(9)} ${String(ref).padEnd(9)} ${msg}`); process.exit(0);
}
if (flag('--diff')) { const i = argv.indexOf('--diff'); const [a, b] = [argv[i + 1], argv[i + 2]]; if (!a || !b) { console.error('usage: slop-lint.mjs --diff before.md after.md'); process.exit(2); } const n = diffFacts(a, b); process.exit(flag('--strict') && n ? 1 : 0); }
if (flag('--selftest')) selftest();
loadAllow(opt('--allow', '')); loadAllow('slop-lint-allow.txt');
if (!inputs.length && !flag('--no-allow')) allow = allow.concat(SPECTRE_ALLOW.map(gramNorm));
loadInputs(inputs);
const { issues, docStats } = analyze(docs, { corpus: !flag('--no-corpus') });
const DOCN = docs.length;

// ---------- output ----------
const byRule = {}; for (const i of issues) { byRule[i.rule] ??= { error: 0, warn: 0, info: 0 }; byRule[i.rule][i.sev]++; }
const totals = { docs: DOCN, words: docStats.reduce((a, b) => a + b.words, 0), error: issues.filter(i => i.sev === 'error').length, warn: issues.filter(i => i.sev === 'warn').length, info: issues.filter(i => i.sev === 'info').length };
if (flag('--json')) { console.log(JSON.stringify({ totals, byRule, docStats, issues }, null, 1)); }
else {
  console.log(`slop-lint: ${totals.docs} documents, ${totals.words.toLocaleString()} words — ${totals.error} errors, ${totals.warn} warnings, ${totals.info} info`);
  console.log('\nBy rule (error/warn/info):'); for (const [r, c] of Object.entries(byRule).sort((a, b) => (b[1].error * 100 + b[1].warn) - (a[1].error * 100 + a[1].warn))) console.log(`  ${r.padEnd(20)} ${c.error}/${c.warn}/${c.info}`);
  if (!flag('--quiet')) { console.log(`\nTop ${TOP} issues:`); for (const i of issues.filter(i => flag('--info') || i.sev !== 'info').slice(0, TOP)) console.log(`  [${i.sev}] ${i.rule} · ${i.doc} ${i.where}\n      ${i.msg}${i.excerpt ? `\n      … ${i.excerpt} …` : ''}`); }
  const flat = docStats.filter(s => s.sentences >= 15).sort((a, b) => a.cv - b.cv).slice(0, 5);
  if (flat.length) console.log('\nMost uniform rhythm (lowest sentence-length CV):', flat.map(s => `${s.doc} ${s.cv}`).join(', '));
  const dash = docStats.slice().sort((a, b) => b.dashesPer1k - a.dashesPer1k).slice(0, 5); console.log('Highest dash density per 1k words:', dash.map(s => `${s.doc} ${s.dashesPer1k}`).join(', '));
}
if (flag('--strict') && totals.error) process.exit(1);

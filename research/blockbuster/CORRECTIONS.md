# Blockbuster: corrections and open items from the v2 writing pass

Nothing in the first two sections was applied to the page. The frozen-facts guard blocks changes to existing text, so each item gives the old text, the proposed text and the ledger ids that support it. Paths are inside `companies/blockbuster/`. Sections 3 to 5 list what the writing pass could not place and why.

## 1. Corrections to existing text

1. Name owner (`sections/afterlife.json`, `blocks[0].nodes[6]`).
   Old: owner "Dish Network (EchoStar)", text "Holds the brand. One franchised store in Bend, Oregon trades under it.[^36][^31][^32]"
   Proposed: owner "Blockbuster L.L.C.", text "Owner of record of the BLOCKBUSTER word mark at the USPTO on October 10, 2026. One franchised store in Bend, Oregon trades under the name.[^41][^42][^31][^32]"
   Why: footnote 36 supports only the December 31, 2023 merger of EchoStar and Dish. EchoStar's FY2025 10-K and its Exhibit 21 never mention Blockbuster (gap `bb-118`). Ledger: `bb-069`, `bb-071`, `bb-117`. No source names the parent of Blockbuster L.L.C. today.

2. Date the corporate stores ended (`company.json`, `tierWhy` and `findings[4]`).
   Old: "the last corporate stores closed by January 2014" and "Dish closed the corporate stores by January 2014."
   Proposed: "Dish said Blockbuster had ceased all material operations on December 31, 2013" and "Dish said Blockbuster had ceased all material operations by December 31, 2013.", citing [^28]. Keep [^27] for the AP report of November 6, 2013 that the closings were expected by early January.
   Why: no source gives the date the last store closed. Ledger: `bb-061`, `bb-103`.

3. Timeline count (`sections/timeline.json`, `title`).
   Old: "Forty-four years, 35 moments"
   Proposed: "Forty-four years, 48 moments"
   Why: the pass added 13 events to the 35. The build prints "All 48 events" under the old title until this changes.

4. Bend address and manager (`sections/afterlife.json`, `items[0].text`).
   Old: "A franchise at 211 NE Revere Avenue in Bend, Oregon, owned by Ken and Debbie Tisher and managed by Sandi Harding. ...[^29][^30]"
   Proposed: add [^50] after "Bend, Oregon" and [^49] after "Sandi Harding".
   Why: footnotes 29 and 30 do not carry the street address, and Harding appears as store manager in the Bulletin (new footnote 49). Ledger: `bb-107`, `bb-109`, `bb-105`. The Bulletin attributes to Harding that Ken Tisher also owns part of the building; the AP describes a lease. We state neither as current title.

5. Late-fee projection scope (`company.json`, `findings[2].text`; `sections/cause.json`, `causes[2].text`).
   Old: "Ending them in 2005 was expected to cost $250M to $300M of operating income a year." and "it expected to forgo $250M to $300M of operating income a year."
   Proposed: "was projected to cost $250M to $300M of operating income in 2005" and "it projected it would forgo $250M to $300M of operating income in 2005."
   Why: the FY2004 10-K gives the figure for 2005, not per year (footnote 5). The ledger entry for the projection, `bb-093`, was rejected only for dropping "estimated" and "approximately" in its value, so the corrected text still needs a replacement entry.

6. "About" on the distribution (`company.json`, `keyNumbers.rows[1].text`; `sections/numbers.json`, counters block, third item, and the scale block's left value and equation; `sections/whatif.json`, `forks[1].actual`; `sections/cause.json`, `causes[1].text`).
   Old: "$905.6M" stated as an exact amount.
   Proposed: "about $905.6M", as the story chapter already says.
   Why: the FY2004 10-K says approximately. Ledger `bb-095` was rejected for the same missing qualifier, so no entry supports the corrected text yet.

7. Website check (`sections/story.json` chapter 6, `sections/afterlife.json` `items[0]`, `sections/timeline.json` "Still open", `company.json` `keyNumbers.rows[3]`).
   Old: the store's website "was live when we checked on October 3, 2026".
   Status: not disproven. The Bend store's site returned a captcha page to scripted requests on October 10, 2026, and the Wayback Machine was offline (gap `bb-119`). A person should open bendblockbuster.com and confirm. If it cannot be confirmed, "still trading" in `keyNumbers` and "Still open" in the timeline should become "open when last reported", with the date of the latest report we could read: Seattle Met (new footnote 50). The 2023 and 2024 articles show the store open then, not in October 2026.

## 2. Precision notes with no change proposed

- "25 countries" in the hero deck is the United States plus the 24 other countries in the FY2004 10-K. It is correct but derived. Ledger `bb-099` was rejected, so the comparison with the FY2005 filing stays unused.
- The Chapter 11 petition in the filing is by Blockbuster Inc. and "certain of its domestic subsidiaries". Existing text says "its U.S. subsidiaries" in the timeline and "Blockbuster and its U.S. subsidiaries" in the story. Ledger `bb-100` was rejected over that missing word, so no entry supports the corrected wording yet.
- The timeline event for November 6, 2013 and the story say the stores were to shut "by early January". That is the AP's prospective wording and is accurate as written.
- The "Alaska 2018" and "Perth 2019" events hold up against the AP (`bb-132`). The AP also says all corporate-owned stores had shuttered "by 2014".

## 3. Not placed because of the additive guard

The guard accepts a new number only if it appears in a verified entry's `value` or `quote`, and a new footnote id only if some verified entry carries it as `fn`. These are the items that failed that test. Each needs a ledger edit by the research pass or a change to the guard.

1. Stock chart. The 46 verified quarters are in `proposal.json` under `stock`, with ledger ids `bb-001` to `bb-046`. JSON drops trailing zeros, so a printed price of 15.10 becomes the number 15.1, which no entry contains. Fifteen values fail the same way: 15.1, 25.2, 21.9, 26.8, 11.8, 18.6, 14.5, 15.7, 15.6, 6.5, 3.3, 7.3, 5.8, 3.7 and 0.6. Fix by comparing numeric tokens by value in `lib/facts-additive.mjs`, or by writing those prices without the trailing zero in the entries' `value` fields. Dropping only those quarters would show false gaps, so the whole block was left out. Proposed events: trading begins August 11, 1999 (`bb-001`), ex-dividend date August 25, 2004 (`bb-021`), NYSE exit July 7, 2010 (`bb-088`). The chart note should say 2004Q3 spans the ex-dividend date, that 2010Q3 and 2010Q4 are OTCQB quotes, and that the prices are unadjusted highs and lows.
2. Revenue chart for Hollywood Entertainment and Movie Gallery. Their figures are printed in thousands and the proposal divided by 1,000 (1296.237 and similar). Those numbers are in no entry. Supply values in USD millions in the ledger, or accept a chart in thousands without Blockbuster.
3. Footnote ids with no `fn`. Add `fn` to these entries so the writing pass can cite them: `fn: 10` for `bb-058`, `bb-084` to `bb-089`, `bb-126`, `bb-129` and the 2010 stock quarters `bb-043` to `bb-046`; `fn: 9` for `bb-053`, `bb-035` to `bb-042`; `fn: 8` for `bb-051`, `bb-031` to `bb-034`; `fn: 7` for `bb-050`, `bb-027` to `bb-030`; `fn: 4` for `bb-057`, `bb-011` to `bb-018`; `fn: 2` for `bb-047`. Items affected:
   - The fact file row "What it was" has no source number (`bb-126`).
   - The recovery insight is not on the page: $600.7M of senior secured notes and $300.0M of senior subordinated notes among the liabilities subject to compromise on January 2, 2011 (`bb-084`), $300.0M still outstanding on January 3, 2010 (`bb-129`), the $675M of 11.75% notes sold October 1, 2009 (`bb-085`), $100M paid and $24.6M expected by July 12, 2011 (`bb-086`), and the company's statement that proceeds were well below claims (`bb-087`). Keep the dates and bases from `bb-084`, which are carrying amounts at the January 2011 balance sheet date, not the petition date.
   - Timeline events for October 1, 2009 (`bb-085`), January 28, 2010 when Carl Icahn left the board (`bb-089`) and July 7, 2010 when the shares moved from the NYSE to the Pink OTCQB market (`bb-088`).
   - Source numbers on the store-count points for 1999, 2003, 2006, 2007, 2009 and 2010 in the story chart and the rival chart, and on the 2009 column of the store map. Their table rows show no source, and the captions name the filings in words.
4. Dates that live only in a source entry. The Seattle Met article is May 2024 and the AP article is March 2021, but no `value` or `quote` carries those years, so the page text and source 50 omit them. Put "2024-05" in the `value` of `bb-107` to restore the date.
5. Recheck windows. "365d" adds the number 365. Trademark cards use the renderer's default of 365 days and all other cards the default of 90, so none sets `recheck`. The estate and corporate-store cards are historical and will show an overdue badge after 90 days.
6. Profit contrast. The note on Hollywood Entertainment's 2004 profit cannot restate Blockbuster's $1,248.8M net loss in `rivals.json`, because the figure is not an entry there. It points to The numbers section instead.
7. Listing dates. `listed` uses years (1999, 2010) because ISO date strings add the tokens 08 and 07. The OTCQB listing is not in `listed`: no entry shows whether the shares trade today.

## 4. Left out on purpose (VERIFY.md)

- Entries `bb-093`, `bb-095`, `bb-099`, `bb-100` and `bb-130` are rejected and not referenced anywhere. The shared-address comparison with Dish's office is dropped.
- Edges: Circuit City (an offer whose end we did not find, gap `bb-123`), BB Liquidating Inc. as a subsidiary (docket identity only) and Carl Icahn as an investor (a board resignation does not show a shareholding end date) are not in `site-data.json`. Dish to Blockbuster L.L.C. carries the dated FY2013 wording, not "2011–". The trademark relation is "owned", not "licensed". Rivalry years are limited to the years the store-count and revenue entries cover.
- The Dish counts after 2010 are not drawn on the stage chart. The April 2011 "more than 1,700" figure has no stated geography, so it appears only in prose with that caveat.
- The UK closing on December 16, 2013 is stated as Engadget's report of a plan, not as a completed closing.
- No overrun is calculated from the late-fee projection and the later $500M reduction; the story says the two statements may not share a baseline.
- The file `rivalchartAlt` (revenue) and `insights[4]` (Hollywood against Blockbuster net income) are not used as proposed, for the reasons in section 3.

## 5. What was added

New sources 37 to 55 are all cited. The fact file has eight rows (two "remains" rows keep the store and the website on separate dates). The story is `scrolly` with a 12-point 1999 to 2010 U.S. store series; the timeline is `animated` with 13 events; the afterlife has five "where are they now" cards; the what-if section features forks 0 and 1; the numbers section has a store map; the rivals section has a store-count chart. `site-data.json` has six glossary terms, eight entities and eight edges.

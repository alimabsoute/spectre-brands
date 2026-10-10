# Blockbuster research notes (v2 pilot)

Author: claude-sonnet-5-5. Accessed: 2026-10-10. Status of every entry: proposed (nothing is verified yet).

## What is in the ledger

`claims.jsonl` holds 131 entries: 127 sourced claims and 4 gaps. 23 of the 127 are legacy re-checks of values already on the page (`"legacy": true`, with the existing footnote). The other 104 are new. Every snapshot is a `.txt` converted with `totext.py` from a raw copy in `/workspace/spectre-research/blockbuster/raw/`, and `node scripts/ledger-check.mjs blockbuster` passes (schema, quote in snapshot, hash).

`new-sources.json` proposes footnotes 37 to 55. Each has at least one ledger entry. `proposal.json` has the fact file, stock, store map, stage, two rival charts, timeline additions, "where are they now" cards, glossary, entities, edges and five insights.

## What was found

Stock chart. 46 quarters of Class A high and low prices, from Q3 1999 (listing on August 11, 1999) to Q4 2010, each with its own ledger entry quoting the 10-K table. Quarters from Q3 2010 are OTCQB quotes after the July 7, 2010 NYSE delisting. The 10-Ks do not adjust for the September 2004 special distribution, so Q3 2004 spans the ex-dividend date (high $15.12, low $7.24). Gap: nothing exists before the 1999 listing. Confidence: high. The prices are printed tables, and each quote matches its snapshot.

Store map. State-by-state tables for seven dates: December 31, 1999 (totals only), then 2004 through 2009 (company-operated, franchised and total). The proposal maps 2004 against 2009 (5,803 against 4,018 stores) and carries the other years in `byYear` for an animation. States plus Guam, Puerto Rico and the U.S. Virgin Islands reconcile to each filing's printed total in all seven years. No state gained stores between 2004 and 2009. Franchised stores fell 55% and company-operated stores 25% (derived). The FY2010 10-K has no state table, only a U.S. total of 3,090 stores on January 2, 2011 (330 franchised) plus 7,769 kiosks. A table quote runs to about 1,500 characters because the table is the evidence.

Stage series. U.S. stores for 1999 to 2010 from those tables and the 10-K store-count sentences, then a tail from Dish's own filings: more than 1,700 locations at the April 2011 deal, over 1,500 at the end of 2011, about 800 at the end of 2012, about 300 announced in November 2013. The tail counts only Dish-operated stores and uses the filings' "over" and "about", so it is flagged as not comparable.

Rivals. `rivalchart` compares U.S. year-end store counts for Blockbuster, Hollywood Entertainment (to 2004) and Movie Gallery (2000 to 2007, including Hollywood Video from 2005). `rivalchartAlt` compares revenue. The existing page already compares 2010 revenue for Blockbuster, Netflix and Redbox, so the new charts add the two chains Blockbuster actually competed with on the high street. Hollywood's numbers are as restated in its FY2004 10-K.

Name owner. The USPTO's TSDR record lists Blockbuster L.L.C., a Colorado company at 9601 S. Meridian Blvd., Englewood, as current owner of the BLOCKBUSTER word mark (registrations 1771243 and 3661761, both live). Dish's FY2013 10-K calls Blockbuster L.L.C. its wholly-owned subsidiary, and 9601 S. Meridian Blvd. is Dish's principal executive office. The torn-ticket logo registration (5008368) was cancelled on February 10, 2023 for a missing Section 8 declaration. The TSDR API now requires a key, but the public status view page loads without one.

Estate. CourtListener's copy of the PACER docket shows case 10-14997 captioned BB Liquidating Inc., listed as Chapter 7 with Robert L. Geltzer as trustee, terminated June 29, 2017. I did not find the date of the Chapter 7 conversion.

Dish years. Stores closed in 2012 (about 700), the UK administration on January 16, 2013 (about $46 million of charges, split $21 million and $25 million in the 8-K), the 91 UK stores closing on December 16, 2013 (Engadget, secondary), Dish's statement that Blockbuster had ceased all material operations on December 31, 2013, and the Mexico sale on January 14, 2014. Dish reported net losses from discontinued operations of $47 million in 2013 and $37 million in 2012; those figures cover all Blockbuster businesses, not only the stores.

Bend store. Address (211 NE Revere Ave #3, Bend, OR 97701), the 2000 franchise conversion, the Tishers' lease and ownership of the building, and the March 2018 position: Bend alone in the contiguous 48 states, five stores in Alaska.

## Insights proposed

1. The $300.0 million of 9% senior subordinated notes issued on August 20, 2004 to fund the Viacom distribution were still outstanding when the company filed. They sat behind $600.7 million of secured notes, and the sale price ($320.6 million) was below the secured notes alone. Confidence: high on each figure; the "behind" ordering follows the notes' names and the company's own statement that creditors would be paid substantially less than in full.
2. Ending late fees cost more than projected: the FY2004 10-K projected $400 to $450 million of 2005 revenue, and the FY2005 10-K says rental revenues were reduced by over $500 million at a cost of about $60 million. The two sentences use similar but not identical wording, so the page should quote both rather than subtract them.
3. The store map: no state grew between 2004 and 2009, and franchised stores fell faster than company stores. All percentages are derived from the two tables.
4. Dish's year-by-year closures, as above.
5. Hollywood Entertainment was profitable ($71.3 million of net income in 2004, as restated) while Blockbuster lost $1.25 billion that year (mostly non-cash impairments, existing page figure).

## Corrections the writing pass should make to existing text

- The nameOwner sentence "Dish Network (EchoStar) holds the brand" (afterlife chain node, `tierWhy` and fn 36) is not supported by fn 36. EchoStar's FY2025 10-K and its Exhibit 21 never mention Blockbuster; fn 36 supports only the December 31, 2023 merger. Use the USPTO record and Dish's FY2013 10-K. No source I found names Blockbuster L.L.C.'s parent today.
- "Last corporate stores closed by January 2014": the AP report says closures were expected by early January 2014, and Dish says all material operations had ceased on December 31, 2013. No source gives the closing date of the last store.
- The timeline entries for 2018 (Alaska) and 2019 (Perth) hold up: KATU (fn 30) says the Anchorage and Fairbanks stores shut in 2018 and Perth in 2019, and Fortune (fn 29) agrees ("last July" before March 7, 2019). KATU also says all corporate-owned stores had shuttered "by 2014".
- The hero's "25 countries" is the United States plus the "24 other countries" in the FY2004 and FY2005 10-Ks. It is correct but derived.
- The Bend street address was attached to fn 29 and 30, which do not carry it. Seattle Met (new fn 50) does.
- The FY2004 10-K says the 9% notes were due August 20, 2012 and the FY2010 10-K says September 1, 2012. I did not use the maturity date.

## What I could not do

- bendblockbuster.com (fn 31, "viewed October 3, 2026") returns a captcha interstitial to scripted clients, and the Wayback Machine was offline on October 10, 2026. The "store is open now" claim therefore rests on Seattle Met (2024) and KTVZ (February 2023) and should carry an `asOf` no later than that, unless a person re-checks the site by hand.
- The outcome of Blockbuster's April 2008 offer for Circuit City (at least $6.00 a share in cash). I found the offer, not its end.
- The price Huizenga's group paid in 1987 (already noted on the page).
- The Chapter 11 claims-agent docket was not reachable; CourtListener's search record gave the caption, chapter, trustee and termination date only, and the document images are not available without PACER.
- Netflix and Redbox figures, 2010 revenue and the other existing comparisons were not re-opened. Only values used in the fact file, key numbers and new modules were re-checked against their existing footnotes.

## Method notes

Two facts rest only on secondary sources that I could reach: Engadget for the UK closing date and The Bulletin for the March 2018 store positions. Press sources are marked secondary in the ledger. USPTO status pages are marked `dataset`. The CourtListener entry is marked `court` but is an aggregator's copy of the docket, not the court's own page.

I proposed `map` as the signature visual because the state tables give a before-and-after picture of the collapse; if the template prefers `stock` for listed companies, the stock block is complete.

Not edited: anything under `companies/`, `data/` or `scripts/`.

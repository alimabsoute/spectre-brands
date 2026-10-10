# Blockbuster verification

122 claims are verified and five are rejected. The four `closed-unavailable` gaps are unchanged. Verification was performed by `gpt-6.1-sol` on October 10, 2026 against the supplied snapshots and raw files. Rejected entries require replacement evidence or corrected author entries before they can render.

## Evidence checks

All 127 non-gap entries were checked against their snapshots, including surrounding text, table headers, fiscal dates, geographic scope, units and qualifications. Every quote also appears in the corresponding raw source after HTML/entity and whitespace normalization. The stock rows were checked as Class A high/low sale prices; financial tables were checked for millions versus thousands and restatement qualifications.

SEC submission metadata confirmed issuer, accession, filing type and filing date for every cited filing. The older full-submission files also carry their own accession and filing headers. SEC document filenames match the cited URLs; the FY2001 raw file contains the complete submission containing `d10k.txt`. Press captures identify their articles through titles, canonical URLs and publication dates. The Bulletin and Engadget URLs redirect to their captured articles.

The CourtListener snapshot is the search JSON in `raw/courtlistener-search.json`. Its `docket_absolute_url`, docket number, court and Blockbuster document descriptions identify the cited docket. It is not the docket-page HTML or a court order. Both the saved docket-page HTML and a fresh curl request returned 403. Entries `bb-111` through `bb-114` are verified only as the search record's metadata; they establish neither a conversion date nor a corporate dissolution date. The record's metadata timestamp is March 3, 2025, despite its October 2026 access date. Its `primary`/`court` classification needs an author review before publication.

Live curl checks covered 31 ledger entries across 22 source URLs, exceeding one in ten of the 127 sourced claims. This included every `ownership` entry, the current holding page, the address claim, the CourtListener record and the sources used for the Bend card. USPTO records, blockbuster.com and the checked news articles returned 200. All 11 sampled SEC archive URLs returned 403; their filing identities and dates were checked through stored and live SEC submission metadata. The CourtListener docket also returned 403. These responses do not establish that the underlying documents are missing.

Live checked ledger IDs were `bb-010`, `bb-020`, `bb-030`, `bb-040`, `bb-050`, `bb-060`, `bb-061`, `bb-067`, `bb-069`, `bb-070`, `bb-071`, `bb-072`, `bb-073`, `bb-080`, `bb-090`, `bb-100`, `bb-104`, `bb-105`, `bb-106`, `bb-107`, `bb-108`, `bb-109`, `bb-110`, `bb-111`, `bb-112`, `bb-113`, `bb-114`, `bb-117`, `bb-124`, `bb-130` and `bb-132`.

The live [USPTO word-mark records](https://tsdr.uspto.gov/statusview/sn74313601) and [second registration](https://tsdr.uspto.gov/statusview/sn77453895) still name Blockbuster L.L.C. The [logo registration](https://tsdr.uspto.gov/statusview/sn85842359) still reports cancellation. [blockbuster.com](https://www.blockbuster.com/) still contains the quoted holding-page text and Sling TV link. A separate request to [bendblockbuster.com](https://bendblockbuster.com/) returned a 202 captcha interstitial. The 2023 and 2024 articles establish historical store operation, not October 2026 operation.

## Rejected entries

| ID | Reason | Exact correction proposed |
| --- | --- | --- |
| `bb-093` | The claim preserves the projection; `value` drops the estimated/approximately qualifiers. | Value: `Estimated $400-450M revenue; approximately $250-300M operating income, projected for 2005`. |
| `bb-095` | The source and claim qualify the aggregate distribution as approximately/about; `value` gives an unqualified amount. | Value: `About $905.6M; paid Sep 3, 2004`. |
| `bb-099` | The FY2004 comparison is absent from this FY2005 quote and snapshot. | Claim: `Blockbuster said it had over 9,000 stores in the United States, its territories and 24 other countries on December 31, 2005.` The comparison requires the separate FY2004 filing. |
| `bb-100` | The filing says “certain of its domestic subsidiaries”; the claim drops “certain.” | Claim: `Blockbuster Inc. and certain of its domestic subsidiaries filed voluntary Chapter 11 petitions in the U.S. Bankruptcy Court for the Southern District of New York, case 10-14997, on September 23, 2010.` |
| `bb-130` | A February 2013 cover page cannot establish DISH's current office address. | Claim: `DISH's February 15, 2013 Form 8-K listed its principal executive offices at 9601 South Meridian Blvd., Englewood, Colorado 80112; the October 10, 2026 USPTO records list that address for Blockbuster L.L.C.` A shared address does not prove current parent ownership. |

`bb-099` is not referenced in the proposal. Its rejection does not invalidate the separate, supported country count in the legacy FY2004 footnote.

## Proposal references requiring replacement

Paths use zero-based array indexes. Every explicit ledger reference was inspected recursively in both files. No referenced ledger ID is missing, and neither file references a gap entry.

| File and path | Rejected ID | Required action |
| --- | --- | --- |
| `proposal.json`, `factFile[3]` (`end`) | `bb-100` | Use a corrected petition claim with “certain” retained. |
| `proposal.json`, `factFile[5]` (`nameOwner`) | `bb-130` | Date the shared-address comparison; remove its implication of a current DISH office or parent relationship. |
| `proposal.json`, `stock.events[1]` | `bb-095` | Reference a replacement entry preserving the approximate aggregate amount. |
| `proposal.json`, `timelineAdd[1]` | `bb-095` | Replace the rejected entry, even though the event's exact per-share amount and ex-dividend date are supported. |
| `proposal.json`, `insights[0]` | `bb-095` | Restore “approximately” for the aggregate distribution and replace the rejected reference. |
| `proposal.json`, `insights[1]` | `bb-093` | Keep the projection qualification and replace the rejected reference. |
| `new-sources.json`, `[18]` (footnote 55) | `bb-130` | This source still has verified `bb-131`; remove or replace the rejected address reference. |

Every proposed source from 37 through 55 has at least one verified entry with a matching `fn`. Source 55 is the only new-source item referencing a rejected entry. Source 52 must identify the search-record evidence and its access limitation. Footnote 55 correctly separates its February 12 event date from its February 15 filing date.

## Numerical traceability

Chart years were checked as fiscal-year labels, not assumed calendar-end dates. Footnote IDs, array indexes, trademark serial/registration identifiers, addresses and `recheck` intervals are identifiers or configuration, not quantitative measurements. Registration identifiers and addresses were still checked against their source records. Observation dates and ownership intervals require the qualifications below.

Some verified entries put a whole historical series in `claim`/`quote` but only one endpoint or rounded amount in `value`. The contract allows verified quotes in its additive gate, but the brief asks for traceability to verified values or existing page footnotes. The following numbers fail that stricter value-field test. They are supported by the quoted tables and need explicit series values or separately ledgered points before import; they are not fabricated data.

| Proposal path | Numbers absent at this precision from a verified `value` and without a checked existing-footnote fallback | Evidence available |
| --- | --- | --- |
| `rivalchart.series[1].points[0..3]` | 2000: 1,819; 2001: 1,801; 2002: 1,831; 2003: 1,920 | `bb-075` claim/quote; its value contains only 2,006 for 2004. New footnote 44. |
| `rivalchart.series[2].points[0]` | 2000: 1,020 | `bb-078` claim/quote; its value contains only 2,482. New footnote 45. |
| `rivalchartAlt.series[1].points[0..4]` | 2000: 1,296.237; 2001: 1,379.503; 2002: 1,490.066; 2003: 1,682.548; 2004: 1,782.364 USD millions | `bb-074` claim/quote in thousands divided by 1,000; its value has rounded endpoint billions. New footnote 44. |
| `rivalchartAlt.series[2].points[0]` | 2000: 318.936 USD millions | `bb-079` claim/quote: 318,936 USD thousands divided by 1,000. New footnote 45. |
| `rivalchartAlt.series[2].points[6]` | 2006: 2,541.933 USD millions | `bb-081` claim/quote: 2,541,933 USD thousands divided by 1,000; its value rounds to $2.54B. New footnote 46. |
| `insights[4].summary` | Hollywood 2004 revenue $1,782.4M | Rounded from `bb-074` claim/quote, 1,782,364 USD thousands / 1,000 = 1,782.364 USD millions. Its value rounds to $1.78B. |
| `storemap.byYear["2008"].states` and `.unknown` | All 51 state/DC counts listed below; territory subtotal 28 | `bb-052` quote, new footnote 38. Its value contains only the 4,585 domestic total. |

The complete FY2008 value-field exception set is `AK 16, AL 57, AR 17, AZ 127, CA 527, CO 102, CT 59, DC 4, DE 15, FL 378, GA 153, HI 22, IA 23, ID 9, IL 193, IN 98, KS 53, KY 66, LA 78, MA 89, MD 99, ME 6, MI 140, MN 57, MO 92, MS 35, MT 4, NC 130, ND 6, NE 26, NH 19, NJ 135, NM 18, NV 43, NY 201, OH 152, OK 65, OR 81, PA 161, RI 18, SC 73, SD 9, TN 96, TX 422, UT 45, VA 122, VI/PR/GU combined 28, VT 8, WA 115, WI 66, WV 18, WY 9`. Territory subtotal: Guam 2 + Puerto Rico 24 + Virgin Islands 2 = 28. All values match the quote.

Movie Gallery's 2001–2004 counts and revenues, and its exact 2005 revenue, also appear in the raw FY2005 filing already cited by existing footnote 25. Blockbuster's FY2001–2005 revenue points appear in existing footnote 6's table. The other map years have existing-footnote table coverage: 1999 via 2; 2004 via 5; 2005 via 6; 2006 via 7; 2007 via 8; 2009 via 9. Hollywood's $71.3M net income and $351.3M obligations are in verified values `bb-076` and `bb-077`; Blockbuster's $1,248.8M loss and $1,119.7M debt are existing page figures under footnote 6.

These additional numerical statements require correction or qualification:

| Proposal path | Finding |
| --- | --- |
| `signatureWhy` | “Nine annual filings” is unsupported. The proposal has seven captured state tables: 1999 and 2004–2009. The count is seven. |
| `storemap.note` | “45 stores in 2004” is wrong. Guam 3 + Puerto Rico 39 + Virgin Islands 2 = 44. The numeric `unknown[0]` and `unknownDetail` already contain 44. The 1999 territory subtotal is 45. |
| `factFile[6].asOf` and its “one franchised store” wording | October 10, 2026 is not a verified store-operating observation date. The cited store evidence reaches May 2024; the holding page was checked in October 2026. Separate their dates. |
| `now[5].text` and `insights[0].summary` | $600.7M secured carrying amount is dated January 2, 2011 in `bb-084`, not the September 23, 2010 petition date. `bb-129` establishes $300M subordinated principal on January 3, 2010, not at the petition. Replace “at the filing” with the actual balance-sheet date. |
| `edges[2].years`, `edges[3].years` | `2011–` is not established for continuing ownership or licensing. `bb-067` is a historical FY2013 ownership statement; `bb-071` identifies current trademark ownership, not a licensing agreement or its start date. |
| `edges[4..7].years` | The referenced financial/store rows do not establish every proposed start/end year for rivalry. The numerical interval assertions need dated relationship evidence, especially Netflix's 2000 start and Redbox's 2004 start. |
| `edges[9].years` | A 2010 board resignation does not establish an investor's shareholding end date. The evidence does not support the full `2005–2010` investor interval. |
| `timelineAdd[10]`, `now[4]` | December 16, 2013 and 91/808 are supported as the planned UK closure date, store count and job losses in a December 12 report. The proposal changes this into confirmed completed closures. Retain the report's prospective wording or find retrospective evidence. |
| `rivalchartAlt.title` | “Three largest” is a ranking claim without a verified ranking entry. Use the named chains unless a dated market-ranking source is supplied. |

## Series bases and calculations

### Stock

All 46 price pairs match the cited Class A tables. They are unadjusted high/low sales prices, not closing prices, total returns or Class B prices. The 1999Q3 range starts August 11. The 2004Q3 range spans the August 25 ex-dividend date for the $5.00 distribution; the fall cannot be presented entirely as lost shareholder value.

Fiscal quarters after 2006 do not align with calendar quarters. FY2007 ends January 6, 2008; FY2008 ends January 4, 2009; FY2009 ends January 3, 2010; FY2010 ends January 2, 2011. Preserve these dates in tooltips or notes.

`stock.exchange` says NYSE and `ticker` says BBI for the entire chart, but `2010Q3` and `2010Q4` carry `otc: true`. The reporting basis changes July 7, 2010; the whole Q3 range is the fiscal-quarter range and should retain that boundary. Display the market change. The quoted Item 5 sentence says the OTC symbols are “currently” BLOAQ/BLOBQ; it does not timestamp the Q-suffix assignment. `listed[1].to: null` must not imply current trading. Neither a continuing 2026 listing nor the actual cancellation date has been verified.

### Stage

`points` consistently counts stores in the United States and territories, including franchises. Kiosks are excluded. Independent recomputation confirmed `bb-054` through `bb-057`: 4,273 + 918 = 5,191; 4,393 + 981 = 5,374; 4,518 + 1,048 = 5,566; 4,579 + 1,091 = 5,670.

`tail` switches to Dish-operated stores and approximate/bounded counts. Preserve “over” for 1,500 and “about” for 800 and 300. The 300 count is the November 6, 2013 closure announcement, not a December 31 year-end count. Draw the tail separately and supply actual observation dates; a continuous line would suggest comparable totals. The April 2011 “more than 1,700 locations” quote does not identify geography or an exact acquired-store perimeter, so `insights[3]` cannot silently make it an exact U.S. corporate-store baseline.

### Rivals

The store chart's U.S. title overstates its scope. Movie Gallery's consolidated totals include Canada; its FY2006 filing splits the 4,642 total into 4,368 United States and 274 Canada. Those geographic inputs are source context, not separately ledgered proposed points. A U.S.-only chart needs U.S.-only ledger entries, or the title and labels must name the different scopes.

Hollywood's row counts Hollywood Video stores; Game Crazy departments are separate. Movie Gallery's post-acquisition total also includes freestanding Game Crazy stores. The 2005 jump includes Hollywood and VHQ acquisitions. Do not interpret it as organic growth or add Hollywood again after the acquisition. The chart title says 2000–2010 but includes a 1999 Blockbuster point.

Movie Gallery's fiscal year ends on the first Sunday following December 30, not the Sunday nearest December 31 as the proposal says. Its FY2001 and FY2007 are 53-week years. Hollywood uses December 31; Blockbuster later changes to fiscal years ending in early January. Exact source dates should accompany year labels.

The alternative revenue chart converts Hollywood and Movie Gallery USD thousands to USD millions by dividing by 1,000. All converted numbers match their quoted rows. Blockbuster is worldwide, Hollywood is consolidated including Game Crazy and the disclosed Reel.com period, and Movie Gallery includes non-U.S. operations. Preserve the restatement label for Hollywood. Movie Gallery's FY2005 results include Hollywood only after April 27, whereas FY2006 includes a full year; the change is not a comparable organic revenue-growth rate. Blockbuster's figures use the FY2005 selected-data basis, not the later discontinued-operations restatements.

The claim that Hollywood “stopped filing after” April 2005 is unsupported and too broad. Live SEC submission metadata includes an S-4 dated July 26, 2005 and a 424B5 dated August 8, 2005. End this particular standalone series at FY2004 without asserting that no subsequent filings exist.

### Store map

All 357 state/DC values across seven annual tables match their quoted rows. Each 51-region sum plus the known territory subtotal reconciles to the printed domestic total. Every paired 2004/2009 map value also matches its corresponding `byYear` value. No state or DC gained stores between the two observations.

| Fiscal label | Actual date | States and DC | Territories | Domestic total |
| --- | --- | --- | --- | --- |
| 1999 | December 31, 1999 | 4,748 | 45 | 4,793 |
| 2004 | December 31, 2004 | 5,759 | 44 | 5,803 |
| 2005 | December 31, 2005 | 5,652 | 44 | 5,696 |
| 2006 | December 31, 2006 | 5,150 | 44 | 5,194 |
| 2007 | January 6, 2008 | 4,813 | 42 | 4,855 |
| 2008 | January 4, 2009 | 4,557 | 28 | 4,585 |
| 2009 | January 3, 2010 | 4,003 | 15 | 4,018 |

`unknown` contains identified territories, not missing location data. Label it “territories outside the state grid.” Counts include company-operated and franchised stores, plus specialty game stores where disclosed; they are not exclusively Blockbuster-branded video shops. The 2004 U.S. company-operated count includes 61 RHINO VIDEO GAMES stores. The comparison is December 2004 versus January 2010, with 2009 used as a fiscal label.

Independent calculations for `insights[2]`, using `bb-048` and `bb-053`, are:

| Comparison | Formula | Result and displayed rounding |
| --- | --- | --- |
| Domestic total | `(4018 - 5803) / 5803 * 100` | -30.7599517491%, rounds to -31%. |
| Franchised | `(493 - 1095) / 1095 * 100` | -54.9771689498%, rounds to -55%. |
| Company-operated | `(3525 - 4708) / 4708 * 100` | -25.1274426508%, rounds to -25%. |
| California loss | `681 - 468` | 213 stores, largest absolute state loss. |
| Montana loss share | `(8 - 1) / 8 * 100` | 87.5%, largest state loss share. |
| New Mexico | `35 - 7`; `(35 - 7) / 35 * 100` | 28 stores; 80%. |
| Idaho | `16 - 4`; `(16 - 4) / 16 * 100` | 12 stores; 75%. |

The rounded -31%, -55% and -25% figures are correct derived results, but none is an independently ledgered `value`. Add derived entries with these formulas if the value-field gate is required. Keeping this audit calculation does not authorize a new rendered ledger ID.

## Other proposal changes needed

`factFile[5]` can name the current trademark owner and date DISH's historical subsidiary description. Neither the shared address nor the December 2023 EchoStar merger establishes the current parent of Blockbuster L.L.C. `factFile[6]` must date the Bend observation separately from the current holding page. `now[3].asOf` is `2024-05`, whereas the contract requires `YYYY-MM-DD`; no day is evidenced, so do not invent one.

`now[0]` says the logo was cancelled because no Section 8 declaration was filed. The source says no *acceptable* declaration was filed. Restore “acceptable” and identify registration 5008368; cancellation of that registration does not establish loss of every logo right.

`edges[1]` is an acquisition of assets, not the original corporation or its shares. `edges[2]` cannot assert continuing parent ownership. `edges[3]` labels trademark ownership as licensing without licensing evidence. `edges[8]` labels a Circuit City offer as an acquisition and calls it unaccepted despite gap `bb-123`; remove the completed-acquisition edge. `edges[10]` labels the same renamed debtor as an owned subsidiary. Its evidence supports docket identity, not an ownership relationship. None of these relations becomes verified merely because its proposal object already says `status: verified`.

`insights[1]` compares a projected direct contribution from extended viewing fees with the later rental-revenue reduction associated with the broader no-late-fees program. The quoted wording does not establish an identical counterfactual baseline. Attribute both statements and do not calculate an overrun from them or assert that the like-for-like cost exceeded the forecast.

`insights[0]` may compare the gross $320.6M asset price with the January 2011 secured-note carrying amount, but it must retain those dates and bases. Approximately $226M is estate net proceeds; approximately $228M was DISH's earlier expected cash payment. They are different measures. The $1,150M facility is lending capacity, not a demonstrated $1,150M draw or an amount paid entirely to Viacom. The $100M paid and $24.6M expected cannot establish final recoveries. The displayed $600.7M + $300.0M + $14.4M components sum to $915.1M while the filing prints a $915.2M subtotal; preserve the reported rounding difference rather than silently changing the source.

## Validation and final counts

Only verification fields in `claims.jsonl`, this report and `time.log` were edited. The protected claim/source/quote/value/snapshot/hash fields have the same SHA-256 comparison digest before and after verification: `056dee7cf1b20da96e14880cc899f465d35edf667e033a0508c39e57ba65ef82`. Proposal files and existing page content were left for the author to correct.

The required `node scripts/ledger-check.mjs blockbuster` passed with zero errors. Writing lint was run on this report; any retained technical notation or source qualifications were reviewed.

Final counts are 122 verified, five rejected, four unchanged gaps and zero proposed claims, across 131 entries.

The highest risks are current ownership and store-operation claims inferred from old evidence; comparisons that mix geographic scope, franchise coverage, fiscal dates or acquisition accounting; and proposal imports that retain rejected references or turn forecasts into completed events. Correct the proposal before rendering its new material.

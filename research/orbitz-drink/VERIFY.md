# Orbitz verification

Review date: 2026-10-10. Verifier: gpt-6.1-sol. Author: claude-sonnet-5-5.

The ledger has 143 verified claims, 16 rejected claims and 13 unchanged gaps. The proposal needs corrections before it can render. The ledger checker validates evidence files and verification metadata; it does not certify the proposal's prose, chart bases or source lists.

## Evidence checks

I opened all 40 snapshots covering the 159 non-gap entries, found each saved quote, and read surrounding text for attribution, dates, units and scope. Every snapshot hash matches. Every normalized quote also occurs in its corresponding raw HTML, text or extracted PDF. The raw documents match the source identity, including publication headers, patent/application numbers, archive destinations, SEC form types and fiscal periods. Saved SEC submissions metadata confirms the filing dates; release datelines were checked separately.

Curl checked all 35 distinct original source URLs, covering all non-gap entries and every ownership or current-status claim. Both TSDR records and the maker's shop returned their expected content. SEC filings and the patent record matched; the SEC revocation PDF was also fetched and independently extracted. Original FindArticles URLs and orbitz.com timed out. The Washington Post original failed HTTP/2, then timed out on an HTTP/1.1 retry; its saved archive returned the article. Fast Company returned 403; its December 2024 archive returned the matching report. Strategy returned an empty 202 response. The Rheology Bulletin original redirected to the society homepage; its archive returned a PDF but the download timed out before completion. The complete saved PDF was read locally. All six exact orbitz.com archive captures and both FindArticles archives returned matching pages.

Verification confirms what the cited source says. Secondary histories and company forecasts retain their attribution and limits. It does not establish present trademark ownership, a domain-transfer transaction or current eBay sale prices.

## Rejected claims

Corrections below are proposals for the author. The original claim, value, quote, source, snapshot and hash remain unchanged.

| ID | Reason and proposed correction |
|---|---|
| od-002 | October 1996 year-end language is a projection, not completed sales. Correct claim: In October 1996 Cronin projected a million cases by year's end. Correct value: projected 1M cases by year-end 1996. |
| od-006 | The saved quote establishes fluid-gel suspension but omits gellan gum, which appears in a separate passage (od-007). Correct claim: AP described fluid-gel technology that keeps gelatinous dumplings suspended in liquid. Correct value: fluid-gel. |
| od-012 | The saved quote establishes Water Joe's 45-state distribution but omits its debut timing in a separate paragraph. Correct claim: AP reported that Water Joe was already sold in 45 states. Correct value: Water Joe; 45 states. |
| od-028 | The saved quote does not include the planned super-oxygenated drink. Correct claim: As of August 1998 Clearly Canadian had no immediate plans to discontinue Orbitz. Correct value: no immediate plans to discontinue. |
| od-037 | The saved quote contains the risk-factor figures but omits the selected-data table comparison. Correct claim: The 2002 20-F risk-factor text gives 2002 revenue as $20,447,000 and 1998 revenue as $35,153,000. Keep the current value; use od-035 separately for table figures. |
| od-041 | The saved quote names only Cadbury Schweppes and its brands; it omits Hansen and the other competitors. Correct claim: The 20-F lists Cadbury Schweppes as a direct competitor in the new age beverage market. Correct value: Cadbury Schweppes. Hansen is supported separately by od-042. |
| od-081 | The source spells the supplier Bush Broake Allen; the value silently changes that proper name. Correct claim: The student newspaper attributes a secret, patented recipe to Bush Broake Allen of Montvale, N.J. Correct value: patented recipe attributed to Bush Broake Allen (paper's spelling). Patent identity remains unconfirmed. |
| od-103 | The article mentions Q4 total revenue growth but does not specify the comparison period for its 25% beverage decline. Correct claim: BevNET reported Q4 2007 total revenue more than tripled, attributing it to two food acquisitions, and reported beverage revenue down 25% without specifying the comparison period. Correct value: beverage revenue down 25% (comparison period unspecified). |
| od-110 | Raw HTML puts 18 in a separate centered page-number paragraph between Orbitz and its description. Correct claim: The 2007 20-F lists Orbitz (beverage with floating beads) among historical innovations. Correct value: Orbitz. |
| od-114 | The release attributes the quoted financing statement to Douglas Mason, whom the same release says Lokash replaces as chief executive. Correct claim: Douglas Mason said a successful restructuring and financing with BG Capital Group had been completed earlier in 2005. Keep the current value. |
| od-120 | The numbers match Item 9, but it calls them actual trading prices and does not label this table as restated; the 2004 Q3/Q4 values are not exactly ten times od-117. Correct claim: The 2005 20-F prints the listed 2004 and 2005 quarterly USD high/low quotations. Correct value: 2004 and 2005 quarters as printed in the 2005 20-F; consolidation adjustment basis unresolved. |
| od-124 | The claim retains expected, but the value presents 25c/$ without that qualifier. Keep the claim; correct value: expected 25c/$ cash offer or new shares. Cancellation of existing classes is in the adjacent list item. |
| od-128 | May 26 identifies the shares and shareholders of record; the July 6 release does not explicitly date cancellation to May 26. Correct claim: On July 6, 2010 the company announced cancellation of common shares issued and outstanding as of May 26, 2010. Correct value: cancellation announced 2010-07-06; record date 2010-05-26. |
| od-140 | The selected capture is dated Dec 21, 1996; the raw page and supplied CDX queries do not establish that it is the earliest capture ever. Correct claim: A Dec 21, 1996 Wayback capture of orbitz.com shows the drink's Welcome Page. Keep the current value. |
| od-147 | Current is unsupported as of this verification; the source identifies the marketing chief in October 2024. Correct claim: In October 2024 Casey Howe listed the launch and failure of Orbitz among the previous company's mistakes. Keep the current value; preserve the historical attribution. |
| od-150 | The source and claim say some 40,000, but the value removes that approximation. Keep the claim; correct value: about 40,000 cases pre-sold. |

## Proposal references that cannot render

The paths below identify every proposal reference to a rejected ledger entry. Indexes are zero based. No referenced ledger ID is missing from either the proposal or new-sources file.

| Rejected ID | Every proposal reference |
|---|---|
| od-002 | `proposal.factFile[2].ledger[1]` |
| od-006 | `proposal.factFile[0].ledger[1]` |
| od-012 | `proposal.rivals.items[1].ledger[0]` |
| od-037 | `proposal.legacyChecks.differences[0].ledger[1]`; `proposal.legacyChecks.differences[1].ledger[1]` |
| od-041 | `proposal.rivals.items[2].ledger[0]` |
| od-081 | `proposal.timelineAdd[0].ledger[1]`; `proposal.edges[1].evidence[1].ledger`; `proposal.storyChapters[0].points[3].ledger` |
| od-103 | `proposal.stage.points[9].noteLedger[0]`; `proposal.timelineAdd[19].ledger[1]`; `proposal.insights[3].ledger[4]` |
| od-110 | `proposal.insights[2].ledger[2]` |
| od-114 | `proposal.edges[3].evidence[0].ledger` |
| od-120 | `proposal.stock.series[16].ledger`; `proposal.stock.series[17].ledger`; `proposal.stock.series[18].ledger`; `proposal.stock.series[19].ledger`; `proposal.stock.rebased2004[0].ledger`; `proposal.stock.rebased2004[1].ledger`; `proposal.stock.rebased2004[2].ledger`; `proposal.stock.rebased2004[3].ledger` |
| od-124 | `proposal.glossary[8].ledger[1]` |
| od-128 | `proposal.factFile[4].ledger[1]`; `proposal.timelineAdd[22].ledger[3]`; `proposal.now[2].ledger[1]` |
| od-140 | `proposal.timelineAdd[4].ledger[0]`; `proposal.now[4].ledger[0]`; `proposal.insights[1].ledger[1]`; `proposal.website[0].ledger` |
| od-147 | `proposal.insights[2].ledger[9]`; `proposal.causeEvidence[2].ledger` |

Gap references are present records, not missing IDs. The evidence fields below still cannot treat them as verified claims. Dedicated gapLedger fields and the gaps index can remain as gap annotations.

| Gap ID | Every proposal occurrence |
|---|---|
| od-160 | `proposal.gaps.orbitz_sales` |
| od-161 | `proposal.factFile[2].ledger[2]`; `proposal.gaps.currency` |
| od-162 | `proposal.gaps.bw_1996_97` |
| od-163 | `proposal.gaps.newspress` |
| od-164 | `proposal.gaps.bevnet_review` |
| od-165 | `proposal.factFile[5].ledger[3]`; `proposal.now[1].ledger[4]`; `proposal.gaps.tm_search` |
| od-166 | `proposal.now[4].ledger[5]`; `proposal.insights[1].ledger[8]`; `proposal.gaps.domain` |
| od-167 | `proposal.stock.gapLedger[0]`; `proposal.gaps.stock_1996` |
| od-168 | `proposal.storemapWhy`; `proposal.gaps.storemap` |
| od-169 | `proposal.factFile[3].ledger[2]`; `proposal.gaps.discontinue_date` |
| od-170 | `proposal.gaps.bba_court` |
| od-171 | `proposal.stage.gapLedger[0]`; `proposal.gaps.pre1998_revenue` |
| od-172 | `proposal.gaps.wiki_claims` |

## Proposed sources

All 28 proposed source IDs are unique, use existing ledger IDs and match each referenced entry's fn. No ID collides with the existing source IDs 1 to 7. The rejected references are listed below. Source 30 and source 32 have no verified supporting entry, so appending either would violate the contract. Other source lists must remove or replace their rejected IDs before use.

| New source ID | Verified IDs | Rejected IDs |
|---|---|---|
| 8 | od-055, od-056, od-057, od-058, od-059, od-060, od-061, od-062, od-063, od-064, od-065, od-066 | None |
| 9 | od-067, od-068, od-069, od-070, od-071 | None |
| 10 | od-072, od-073, od-074, od-075, od-076, od-077, od-078, od-079 | None |
| 11 | od-080 | od-081 |
| 12 | od-082, od-083, od-084, od-085 | None |
| 13 | od-086, od-087, od-088, od-089, od-090, od-091, od-092, od-093, od-094 | None |
| 14 | od-095 | None |
| 15 | od-096, od-116 | None |
| 16 | od-097, od-117, od-118, od-119 | None |
| 17 | od-098, od-108 | od-120 |
| 18 | od-099, od-100, od-109, od-121 | None |
| 19 | od-101, od-102, od-122 | od-110 |
| 20 | od-156 | None |
| 21 | od-157 | None |
| 22 | od-131, od-132, od-133, od-134, od-135, od-136 | None |
| 23 | od-137, od-138, od-139 | None |
| 24 | od-146, od-148, od-149, od-151, od-152, od-153, od-154 | od-147, od-150 |
| 25 | od-111, od-112, od-113 | od-114 |
| 26 | od-115 | None |
| 27 | od-123 | od-124 |
| 28 | od-125, od-126 | None |
| 29 | od-127 | None |
| 30 |  | od-128 |
| 31 | od-129, od-130 | None |
| 32 |  | od-103 |
| 33 | od-104, od-105, od-155 | None |
| 34 | od-106, od-107 | None |
| 35 | od-141, od-142, od-143, od-144, od-145 | od-140 |

Source 35 links to the first capture, while its text describes six captures. Preserve each exact archive URL when displaying the sequence. Source 10 uses a broad 2020 archive selector that resolved to a September 2021 capture; freeze that actual capture when reauthoring source metadata. The primary patent citation supports its own filing record, not a confirmed Orbitz-specific patent identity.

## Numbers that lack the required value provenance

A number can be supported by a quote while absent from the entry's value field. Under the brief's value-or-existing-footnote rule, those numbers still need a value-bearing entry. Existing footnotes 1 to 7 are allowed evidence for their own source passages. Document identifiers, footnote IDs, array indexes, chapter/rank numbers, review dates and recheck intervals are operational metadata. They are excluded from factual counts.

The stock ranges for 1998 to 2002 can be traced to existing footnote 6. Later stock ranges and Hansen figures below occur in claim/quote fields but lack numeric value fields and have no existing page footnote. The stage's ten revenue amounts occur in verified values, as do its original-revenue comparisons of 11.586M and 9.141M in od-097 and od-098. The note fields should cite those entries explicitly.

### Financial and physical amounts


| Proposal paths | Displayed amounts | Ledger / limit |
|---|---|---|
| stock.series[8].hi / .lo (2003Q1) | 0.51 / 0.4 USD | od-116; value is only a period label |
| stock.series[9].hi / .lo (2003Q2) | 0.48 / 0.37 USD | od-116; value is only a period label |
| stock.series[10].hi / .lo (2003Q3) | 0.44 / 0.27 USD | od-116; value is only a period label |
| stock.series[11].hi / .lo (2003Q4) | 0.37 / 0.2 USD | od-116; value is only a period label |
| stock.series[12].hi / .lo (2004Q1) | 0.45 / 0.21 USD | od-117; value is only a period label |
| stock.series[13].hi / .lo (2004Q2) | 0.39 / 0.26 USD | od-117; value is only a period label |
| stock.series[14].hi / .lo (2004Q3) | 0.37 / 0.16 USD | od-117; value is only a period label |
| stock.series[15].hi / .lo (2004Q4) | 0.28 / 0.14 USD | od-117; value is only a period label |
| stock.series[16].hi / .lo (2005Q1) | 3.4 / 2.1 USD | od-120; rejected adjustment-basis claim |
| stock.series[17].hi / .lo (2005Q2) | 2.3 / 1.2 USD | od-120; rejected adjustment-basis claim |
| stock.series[18].hi / .lo (2005Q3) | 1.9 / 1.1 USD | od-120; rejected adjustment-basis claim |
| stock.series[19].hi / .lo (2005Q4) | 2.22 / 1.17 USD | od-120; rejected adjustment-basis claim |
| stock.series[20].hi / .lo (2006Q1) | 2.62 / 2.11 USD | od-121; value is only a period label |
| stock.series[21].hi / .lo (2006Q2) | 4.41 / 2.34 USD | od-121; value is only a period label |
| stock.series[22].hi / .lo (2006Q3) | 3.68 / 2.48 USD | od-121; value is only a period label |
| stock.series[23].hi / .lo (2006Q4) | 2.95 / 2.05 USD | od-121; value is only a period label |
| stock.series[24].hi / .lo (2007Q1) | 3.18 / 2.4 USD | od-122; value is only a period label |
| stock.series[25].hi / .lo (2007Q2) | 2.99 / 2.2 USD | od-122; value is only a period label |
| stock.series[26].hi / .lo (2007Q3) | 2.95 / 2.05 USD | od-122; value is only a period label |
| stock.series[27].hi / .lo (2007Q4) | 2.09 / 0.4 USD | od-122; value is only a period label |
| stock.rebased2004[0].hi / .lo (2004Q1) | 4.5 / 2.1 USD | od-120 rejected |
| stock.rebased2004[1].hi / .lo (2004Q2) | 3.9 / 2.6 USD | od-120 rejected |
| stock.rebased2004[2].hi / .lo (2004Q3) | 3.4 / 1.6 USD | od-120 rejected |
| stock.rebased2004[3].hi / .lo (2004Q4) | 2.6 / 1.7 USD | od-120 rejected |
| rivalchart.series[1].points[0].value (1998); also insights[3].summary | 48.628M USD | od-156 value omits the actual net-sales amounts |
| rivalchart.series[1].points[1].value (1999) | 66.184M USD | od-156 value omits the actual net-sales amounts |
| rivalchart.series[1].points[2].value (2000) | 71.706M USD | od-156 value omits the actual net-sales amounts |
| rivalchart.series[1].points[3].value (2001) | 80.658M USD | od-156 value omits the actual net-sales amounts |
| rivalchart.series[1].points[4].value (2002); also insights[3].summary | 92.046M USD | od-156 value omits the actual net-sales amounts |
| rivalchart.note | 53.866M USD in 1998 | od-157 value omits the amount |
| rivalchart.derived[0].value / .formula; insights[3].summary | -41%; -0.413 formula output | No derived ledger entry; independently recomputed 20.477 / 34.889 - 1 = -0.4130814870, or -41.30814870% |
| rivalchart.derived[1].value / .formula; insights[3].summary | +89%; +0.893 formula output | No derived ledger entry; independently recomputed 92.046 / 48.628 - 1 = +0.8928600806, or +89.28600806% |

The formulas and rounded percentages are arithmetically correct. The contract still requires new derived entries before publishing them. If the restated 20.205M endpoint is used instead, the parent calculation is 20.205 / 34.889 - 1 = -42.08776405%, so the chart cannot silently switch endpoints. The existing Orbitz decrease is independently recomputed as (1.46 / 9.4 - 1) = -84.46808511%; existing footnote 4 documents that derivation.

### Dates, counts and relation periods

These items either depend on rejected evidence, add a date found only in source metadata or quotes, or assert a period that the evidence does not establish. Repeated appearances are listed with their paths.

| Proposal paths | Number or date | Evidence limit |
|---|---|---|
| factFile[2].value | about a million cases by year-end 1996 | Existing footnote 1 supports the forecast, but od-002 is rejected; this is not a verified sales total. |
| factFile[4].value; timelineAdd[22].text; now[2].text | May 26, 2010 as cancellation date | Rejected od-128 uses a record date as an exact cancellation date. The release is July 6, 2010. |
| parentListed[3].to | 2010-04 | od-126 establishes ineligibility by April 5, not an exact April removal date; CCBC also ceased to be the relevant ticker in 2005. |
| signatureWhy; timelineAdd[4]; now[4].text; insights[1].summary; website[0].capture | December 1996; December 21, 1996 | od-140 is rejected for its earliest-capture claim. The selected archive date is real but needs a corrected verified entry. |
| timelineAdd[2].date | July 24, 1996 | Day 24 is in the Wildcat publication header, not od-080's value. |
| timelineAdd[3].date; people[4].role | October 4, 1996; Science World in 1996 | Publication metadata in the Science World source, not a verified value for the publication date. |
| timelineAdd[7].text; timelineAdd[11].year/date; insights[0].summary | January 1999 publication | Bulletin issue metadata, not a verified value-bearing publication-date entry. |
| timelineAdd[7].text; insights[0].summary; numbersAdd[2].items[2].text | 5 mm diameter | Quotes in od-072/od-077, but their values omit particle diameter. Preserve diameter, not radius. |
| insights[0].summary | two course participants | od-072's quote, but not its value. |
| insights[0].summary; numbersAdd[2].items[1].text | 100 per second | od-076's claim/quote, but its value contains only the viscosity ratio. |
| timelineAdd[8].date; website[1].capture | December 11, 1997 | od-141's value specifies December 1997, not day 11. Exact archive URL supports the day. |
| insights[1].summary | February 9, 1999 | Saved CDX results supply this boundary; no verified ledger value or existing footnote establishes it. |
| signatureWhy; timelineAdd[13].date; now[4].text; insights[1].summary; website[3].capture | February 29, 2000 | od-143's value gives February 2000 but omits day 29. Exact archive URL supports the day; month-only appearances are supported by the value. |
| timelineAdd[15].date; website[4].capture | January 19, 2001 | od-144's value gives January 2001 but omits day 19. |
| timelineAdd[15].text; insights[1].summary; website[4].what | copyright 2000 | od-144's quote, not its value; this is distinct from the January 2001 capture. |
| website[2].capture | January 25, 1999 | od-142's value gives January 1999 but omits day 25. |
| website[5].capture | May 6, 2001 | od-145's value gives May 2001 but omits day 6. |
| timelineAdd[17].date | October 4, 2005 | od-111's value gives October 2005 but omits day 4. |
| insights[2].summary | 2005, 2006 and 2007 annual-report years | Filing metadata and claims in od-108/od-109; od-110 is rejected. Their values do not contain the report years. |
| now[0].text; now[3].text; insights[2].summary; people[9].role; timelineAdd[26].year/date; legacyChecks.differences[4].detail; causeEvidence[2].add | October 2024; October 7, 2024; 2024 role/report dates | Fast Company metadata establishes the report date, but its role, sale and ownership values omit it. od-152's value does support the 2024 forecast year; it does not establish the role date or a 2026 status. |
| edges[0].years | 1996–1999 ownership | Launch and discontinuation dates do not establish the term of legal ownership. |
| edges[1].years | 1996–1998 supplier relation | The secondary reference identifies a former supplier and a May 1998 settlement; it does not date the supply relationship. |
| edges[2].years | 1998–2002 rivalry | The filing identifies Hansen as a competitor; it does not establish rivalry throughout this interval. |
| edges[3].years | 2005– investor relation | Control was reported approximately three years before May 2008. The open interval and exact start lack support. |
| edges[6].years; edges[7].years | 2005–; 1993– | Historical appointment/arrival dates do not establish continuing executive roles. Cronin's fall-1993 start is in existing footnote 6. |
| causeEvidence[1].add | 1995–1998 distribution buyback | od-092's value covers June 1998 only. The 1995 start is in the secondary source's wider narrative, without its own verified value. |
| timelineNote | 10 existing events; 27 additions; about 25 core; cap of 30 | 10 and 27 are independently counted file contents; 30 is an editorial cap. The proposal actually marks 18 added events core, not about 25. These are editorial counts, not source facts. |

now[1].text says the 2014 application was withdrawn within two months. March 5 to May 9 is 65 days, so use about two months and retain the exact dates.

The 25% beverage decline also appears in stage.points[9].note and insights[3].summary. The amount is in rejected od-103 and needs a replacement entry with its comparison period left unspecified. It cannot become an annual beverage-growth measure. The 50% maximum price premium is supported by od-087; the fourfold viscosity, approximately twofold yield-stress comparison, 0.04 Pa yield stress and approximately 12 kg/m3 density mismatch have verified values. The 300 ml bottle and launch-sales amounts have existing footnotes. Dollar-to-million conversions were checked; no interpolation or currency conversion was used.

## Series compatibility

### Stock

The main series changes basis between 2004Q4 and 2005Q1. Breaking at 2005Q2, as the proposed event says, would leave the artificial jump connected. The May 2 legal consolidation and May 5 start of trading on the new basis are separate dates. A 2005Q1 point described as after the consolidation is retrospectively scaled, since that quarter precedes the event.

od-120 is rejected because the filing does not identify its quarterly table as a consolidation restatement. The 2004 comparisons are also inconsistent with multiplying the original table by ten. Original Q3 high 0.37 would become 3.70, but the later table gives 3.40. Original Q4 0.28/0.14 would become 2.80/1.40, but the later table gives 2.60/1.70. The amounts can be recorded as printed, but the adjustment basis must remain unresolved. Keep the versions separate until there is evidence for a common basis.

CCBC is a historical symbol. The 2005 filing states that trading under CCBEF began May 5, 2005. Both stock.ticker and parentListed[3] incorrectly extend CCBC across that change. The USD price rows are Nasdaq/OTCBB quotations, not TSX Canadian-dollar prices; 2001Q1 spans the Nasdaq delisting. These are inter-dealer quotations without commissions and may not be actual sales prices.

The annual 1999 range spans the unadjusted 4.25-for-1 consolidation and cannot be compared as a continuous investment-return series. The annual ranges remain separate from the quarters. stock.note says 1996 to 1998 are missing even though stock.annual includes 1998; distinguish the missing quarterly series from available annual ranges. The whole chart concerns the parent after the drink's launch years.

### Stage

Every revenue point was checked against its year header and USD unit. The series combines filing vintages and uses later restatements for 2002, 2004 and 2005. Calling the cited entries the latest filing for each year is inaccurate: some values are cited to earlier filings even though later tables repeat them. Use an explicit source/basis description.

The 2002 annual report table gives 20.477M, its risk-factor prose gives 20.447M, and later selected data give 20.205M. The 1998 table gives 34.889M while risk-factor prose gives 35.153M. Preserve which source and basis each figure uses. The 2006 filing nets sales incentives under EIC-156 and restates 2004/2005; earlier years are not established on that same incentive basis.

The 2007 rise includes acquired food businesses. It cannot describe an Orbitz recovery or beverage-only recovery, and the accompanying 25% beverage decline lacks a comparison period. Total net loss from od-102 differs from continuing-operation loss; keep that distinction if extending the existing chart.

### Rival chart

Both series are annual parent-company USD amounts for 1998 to 2002. Clearly Canadian uses Canadian GAAP total revenues; Hansen uses net sales with sales allowances reclassified under EITF 01-9. Hansen's original 1998 figure is 53.866M, versus 48.628M on the later comparative basis. The chart correctly uses one Hansen filing throughout, but the two companies' accounting definitions differ.

The market comparison is 1992 to 2002, not the chart's five years. Delete the phrase suggesting the same five years. Market values are US wholesale sales, with 2002 estimated, whereas company revenues cover their own businesses. They do not establish market share or gel-drink rivalry. numbersAdd[4].items[0].value also needs to retain estimated before the 13.1B endpoint.

### Store map

storemap is null. There is no store series to reconcile, and no verified zero-store count. Keep the non-applicability decision separate from a measured store count. Third-party distribution coverage cannot be converted into company-operated stores.

## Other proposal corrections

now[0] asserts present non-production while its equipment evidence is historical. now[3] correctly attributes ownership to October 2024, but asOf 2026-10-10 must mean review date, not a newly established ownership date. now[5] changes a possible resale price into an actual sale assertion. Use the undated article's can-sell wording and retain its attribution. The shop page's Nearly ready title describes direct-order readiness, not the absence of retail production.

insights[2] says the name was never used again. An abandoned application does not establish that negative, and TSDR lists claimed 2014 use dates in the unrelated application. That record is not evidence of an official revival. The historical owner of an abandoned application is not the current owner of a registered beverage mark. The cited Canadian expiration field is not a current CIPO search.

Several story points cite only part of their text. storyChapters[0].points[1] needs od-070 for Chalupa; storyChapters[1].points[2] needs the separate AP entries for the opening description, BevNET, Al Ries and Water Joe; storyChapters[2].points[0] needs od-056 for May 1; storyChapters[2].points[1] needs od-022 for the larger Jessup plant. storyChapters[3].points[2] needs separate evidence for the planned drinks, and points[3] needs od-092 for the distribution buyback. storyChapters[4].points[2] needs od-095 for July 2000 naming. storyChapters[5].points[0] needs od-131 for the 2006 application, points[2] needs od-129 for 2017 revocation, and points[3] needs od-151 for the 2017 production restart.

timelineAdd[9] attributes the patent allegation to Clearly Canadian even though the evidence is a secondary history. timelineAdd[17] does not establish Lokash's CEO title; the release appoints him president and says he replaces Mason. timelineAdd[19] puts later revenue reporting under the February 2007 acquisition date; separate event dates from the 2008 reporting dates. timelineAdd[25] gives a January 4 date to both securities revocation and an undated-within-2017 production restart; separate them.

No source identifies US 6,106,883 as the Orbitz patent or the patent in the 1998 dispute. The matching Chalupa names do not establish one person's identity. A patent's original assignee also does not establish ownership today. Preserve the existing caveats in these items.

insights[0].summary changes the measured viscosity and apparent consistency into pours like water; keep the shear-rate-specific ratio and the source's appearance description. The fluid-gel glossary definition should allow the partial settling observed in od-069.

The glossary's yield-stress definition calls stress a force; stress is force per area and the quoted measurement uses Pa. The statement-of-use definition omits the extension-request alternative expressly present in od-135. The share-consolidation definition overstates unchanged ownership without stating the proportional basis and possible rounding. Generic glossary definitions need evidence appropriate to their scope rather than a product measurement alone.

The existing Washington Post date note disagrees with the saved byline, which reads April 21, 1997. The live original was unavailable, so describe the archive result without claiming a live-page date. The existing Orbitz.com sales claim exceeds hawked/promoted evidence. Legacy financial figures can remain on their documented original basis; they must not be relabeled as the latest restatement. Existing sources have been read, but that does not make every legacy claim confirmed.


## Raw evidence inventory

All paths below are relative to /workspace/spectre-research/orbitz-drink. HTML identity was checked against title/canonical or archive destination; SEC identity includes form, issuer and reporting period. Raw text and PDF identity was read directly. Quotes matched in every row.

| Snapshot | Raw file | Claim IDs | Source identity/date |
|---|---|---|---|
| s1-latimes.txt | raw/s1-latimes.html | od-001, od-002, od-003, od-004, od-005, od-006, od-007, od-008, od-009, od-010, od-011, od-012, od-013 | ‘Fluid-Gel’ Soft Drink Has Market in Suspense; 1996-10-16 |
| s2-spokesman.txt | raw/s2-spokesman.html | od-014, od-015, od-016, od-017, od-018 | Orbitz: The New Soft Drink You Can Chew, Too; 1997-01-29 |
| s3-wapo-wb.txt | raw/s3-wapo-wb.html | od-019, od-020, od-021, od-022, od-158 | Cool Drink; 1997-04-21 |
| s4-strategy.txt | raw/s4-strategy.html | od-023, od-024, od-025, od-026, od-027, od-028, od-029, od-030 | Clearly Canadian not deterred by Orbitz collapse; 1998-08-31 |
| s5-atlas.txt | raw/s5-atlas.html | od-031, od-032, od-033, od-034 | Orbitz; undated |
| 20f-2002.txt | raw/20f-2002.htm | od-035, od-036, od-037, od-038, od-039, od-040, od-041, od-042, od-043, od-044, od-045, od-046, od-047, od-048, od-049, od-050, od-051, od-052, od-053, od-054 | Clearly Canadian Beverage Corp, Form 20-F for the year ended December 31, 2002; 2003-06-24 |
| bw-1997-canada.txt | raw/bw-1997-canada.html | od-055, od-056, od-057, od-058, od-059, od-060, od-061, od-062, od-063, od-064, od-065, od-066 | Clearly Canadian launches Orbitz in Canada; 1997-04-14 |
| fa-m1590.txt | raw/fa-m1590.html | od-067, od-068, od-069, od-070, od-071 | Defy gravity? As if! (Science World, Maria L. Chang); 1996-10-04 |
| rheology-bulletin-1999-jan-flow.txt | raw/rheology-bulletin-1999-jan.pdf | od-072, od-073, od-074, od-075, od-076, od-077, od-078, od-079 | Yield stress in Orbitz (P. Dontula and C.W. Macosko), Rheology Bulletin vol. 68 no. 1, pp. 4-5; 1999-01 |
| wildcat-arizona.txt | raw/wildcat-arizona.html | od-080, od-081 | New Beverage Leaves Bad Taste in Mouth (Jon Roig); 1996-07-24 |
| patent-6106883.txt | raw/patent-6106883.html | od-082, od-083, od-084, od-085 | US6106883A Method of suspending inclusions; 2000-08-22 |
| funding.txt | raw/funding.html | od-086, od-087, od-088, od-089, od-090, od-091, od-092, od-093, od-094 | Clearly Canadian Beverage Corporation History; undated |
| fu-orbitz-inc.txt | raw/fu-orbitz-inc.html | od-095 | Orbitz, Inc. History; undated |
| 20f-2003.txt | raw/20f-2003.htm | od-096, od-116 | Clearly Canadian Beverage Corp, Form 20-F for 2003; 2004-06-18 |
| 20f-2004.txt | raw/20f-2004.txt | od-097, od-117, od-118, od-119 | Clearly Canadian Beverage Corp, Form 20-F for 2004; 2005-06-30 |
| 20f-2005.txt | raw/20f-2005.htm | od-098, od-108, od-120 | Clearly Canadian Beverage Corp, Form 20-F for 2005; 2006-06-30 |
| 20f-2006.txt | raw/20f-2006.htm | od-099, od-100, od-109, od-121 | Clearly Canadian Beverage Corp, Form 20-F for 2006; 2007-07-02 |
| 20f-2007.txt | raw/20f-2007.htm | od-101, od-102, od-110, od-122 | Clearly Canadian Beverage Corp, Form 20-F for 2007; 2008-06-30 |
| bevnet-2008-apr.txt | raw/bevnet-2008-apr.html | od-103 | Clearly Canadian’s earnings up, bev revenue down; 2008-04-01 |
| bevnet-2008-growth.txt | raw/bevnet-2008-growth.html | od-104, od-105, od-155 | Clearly Canadian posts growth in sales for the first time in 10 years; 2008-05-07 |
| bevnet-2007-dmr.txt | raw/bevnet-2007-dmr.html | od-106, od-107 | Clearly Canadian Acquires Eastern Canada’s Leading Organic Snack Company; 2007-02-07 |
| ed-2005-10-04-6k.txt | raw/ed-2005-10-04-6k.htm | od-111, od-112, od-113, od-114 | Clearly Canadian Beverage Corp, Form 6-K (press release, Oct 4 2005); 2005-10-04 |
| ed-2005-11-03-6k.txt | raw/ed-2005-11-03-6k.htm | od-115 | Clearly Canadian Beverage Corp, Form 6-K (press release, Nov 2 2005); 2005-11-03 |
| ed-2010-03-ex99.txt | raw/ed-2010-03-ex99.txt | od-123, od-124 | Clearly Canadian Beverage Corp, Form 6-K, Exhibit 99.1 (Mar 18 2010); 2010-03-19 |
| ed-2010-04-ex99.txt | raw/ed-2010-04-ex99.txt | od-125, od-126 | Clearly Canadian Beverage Corp, Form 6-K, Exhibit 99.1 (Apr 5 2010); 2010-04-05 |
| ed-2010-05-ex99.txt | raw/ed-2010-05-ex99.txt | od-127 | Clearly Canadian Beverage Corp, Form 6-K, Exhibit 99.1 (May 3 2010); 2010-05-03 |
| ed-2010-07-ex99.txt | raw/ed-2010-07-ex99.txt | od-128 | Clearly Canadian Beverage Corp, Form 6-K, Exhibit 99.1 (Jul 6 2010); 2010-07-06 |
| revoked-2017.txt | raw/revoked-2017.pdf | od-129, od-130 | Notice that initial decision has become final, Release No. 79727, Admin. Proc. File No. 3-17565 (In the Matter of Capital Preferred Yield Fund-III, LP, Clearly Canadian Beverage Corp., and Diversinet Corp.); 2017-01-04 |
| tsdr-sn77010850.txt | raw/tsdr-sn77010850.html | od-131, od-132, od-133, od-134, od-135, od-136 | USPTO TSDR status, ORBITZ, serial number 77010850; 2026-10-10 |
| tsdr-sn86211897.txt | raw/tsdr-sn86211897.html | od-137, od-138, od-139 | USPTO TSDR status, ORBITZ DEFY GRAVITY DRINK ORBITZ, serial number 86211897; 2026-10-10 |
| wb-orbitzcom-19961221123433.txt | raw/wb-orbitzcom-19961221123433.html | od-140 | orbitz.com home page, Wayback Machine capture of 1996-12-21; 1996-12-21 |
| wb-orbitzcom-19971211050441.txt | raw/wb-orbitzcom-19971211050441.html | od-141 | orbitz.com home page, Wayback Machine capture of 1997-12-11; 1997-12-11 |
| wb-orbitzcom-19990125091300.txt | raw/wb-orbitzcom-19990125091300.html | od-142 | orbitz.com home page, Wayback Machine capture of 1999-01-25; 1999-01-25 |
| wb-orbitzcom-20000229050453.txt | raw/wb-orbitzcom-20000229050453.html | od-143 | orbitz.com home page, Wayback Machine capture of 2000-02-29; 2000-02-29 |
| wb-orbitzcom-20010119174700.txt | raw/wb-orbitzcom-20010119174700.html | od-144 | orbitz.com home page, Wayback Machine capture of 2001-01-19; 2001-01-19 |
| wb-orbitzcom-20010506034511.txt | raw/wb-orbitzcom-20010506034511.html | od-145 | orbitz.com home page, Wayback Machine capture of 2001-05-06; 2001-05-06 |
| fastco-2024.txt | raw/fastco-2024.html | od-146, od-147, od-148, od-149, od-150, od-151, od-152, od-153, od-154 | Clearly Canadian was an iconic soda in the ’90s. Now it’s back and more popular than ever; 2024-10-07 |
| hansen-10k-fy2002.txt | raw/hansen-10k-fy2002.txt | od-156 | Hansen Natural Corp, Form 10-K for 2002; 2003-03-31 |
| hansen-10k-fy1998.txt | raw/hansen-10k-fy1998.txt | od-157 | Hansen Natural Corp, Form 10-K for 1998; 1999-03-31 |
| s7-cc.txt | raw/s7-cc.html | od-159 | Clearly Canadian Shop · Nearly ready; 2026-10-10 |

## Validation

The field audit compared the completed ledger with the original saved at verification start. All 159 reviewed entries changed only status, verifier, verified_at and verifier_note. Every other field is identical, and all 13 gap lines are byte-for-byte unchanged. All verification timestamps parse as ISO dates.

`node scripts/ledger-check.mjs orbitz-drink` passes with 172 entries and zero errors. The writing linter reports zero errors and zero warnings for this report. No proposal, source-list, snapshot, raw document or site file was edited.

## Counts and remaining risks

143 claims are verified and 16 rejected; all 13 closed-unavailable gap lines remain unchanged. All 159 non-gap entries have verifier and ISO timestamp fields.

The largest publication risks are the unsupported stock adjustment basis and ticker history, exact cancellation dates inferred from record dates, current-status cards based on 2024 or undated reporting, and proposal numbers supported only by quote fields. Rejected and gap IDs must not render as verified evidence. The primary records do not identify the current ORBITZ beverage-mark owner, the domain-transfer transaction, the exact drink-production end date or the patent in the reported dispute.

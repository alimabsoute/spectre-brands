# Pets.com verification

The proposal needs corrections before publication. All 154 non-gap entries received a cross-vendor decision from gpt-6.1-sol, against claims authored by claude-sonnet-5-5. The 11 closed-unavailable gaps retain their original records.

## Evidence checked

Each quote was located in its snapshot and checked against the corresponding raw file. Reads included financial-table headings, periods, units, historical versus pro forma columns, and nearby qualifications. Quote matching allowed whitespace and the ledger checker's punctuation normalization. Every quote also occurs in its raw document after text extraction.

All 39 distinct ledger source URLs were requested with curl, covering every sourced entry and every ownership or current-status source. With the research contact user agent, the SEC filing bodies matched the stored raw bytes; the two Los Angeles Times article bodies also matched. SEC headers identify the expected accessions, filing types and periods. The prospectus is dated February 10, 2000 and filed February 11; `source.date` records the document date. The file called `10ka-fy2001.txt` is the July 10, 2002 amendment for FY2000.

The CNBC URL returned a 301 to its `/make-it/` path; following it returned the same article and supported pc-026. Archive pages returned the expected farewell letter and Bar None release. Live TSDR pages confirmed the five application records, and live Verisign RDAP confirmed the registration event and registrar. The December 28, 2025 archive response returned 301, with that capture date and a redirect to PetSmart. Direct HTTP and HTTPS requests to pets.com each timed out at connection establishment; pc-144 remains a gap. Requests with a shorter user agent returned SEC 403 responses; they were not treated as source evidence.

The provenance exception is pc-023: its source URL is the company filing index, while its quote, snapshot and raw file are the Form 15 itself. The index links to the correct filing but is a different document. The raw Form 15 identifies IPET Holdings at the top and contains an inconsistent Beyond.com name in its signature boilerplate. The dated filing and Couch signature can be cited after repairing the source link; they do not prove immediate termination of registration or reporting obligations.

## Rejected entries and corrections

Rejection applies to the entire entry if either its claim or displayed value exceeds the evidence. Several rejected claims have correct figures but lose a qualifier in `value`. An author must make the correction and submit the entry for another verification decision.

| Ledger id | Reason and proposed correction |
|---|---|
| pc-009 | Claim preserves the estimate but value does not. Correct value to 'approximately 255 of 320'; retain the Nov 7 announcement wording. |
| pc-014 | The quoted 8-K gives an anticipated date. Correct claim to 'The board approved an initial $0.09-per-share distribution with an anticipated date of Sep 28, 2001.' Actual payment is separately supported by pc-043. |
| pc-015 | The quoted 8-K gives an anticipated date. Correct claim to 'The board approved a $0.075-per-share liquidating distribution with an anticipated date of Sep 27, 2002.' Actual payment is separately supported by pc-044. |
| pc-016 | The June 22 date was anticipated, not confirmed. Correct claim to 'The board approved a final $0.00747-per-share distribution with an anticipated date of June 22, 2004; the company said its shares would be worthless following that distribution.' |
| pc-023 | Source URL identifies the filing index, but quote/snapshot/raw identify accession 0000950134-05-011306, Form 15-12G. Keep the dated filing claim only after citing https://www.sec.gov/Archives/edgar/data/1100683/000095013405011306/0000950134-05-011306.txt. Filing is not proof of immediate termination. |
| pc-024 | Orders qualifier omitted. Correct claim to 'The farewell page said the store closed effective Nov 9, 2000 and that orders for in-stock items placed before 11am Pacific Time that day would be processed and shipped; backorders not shipped by Nov 14 would be cancelled.' |
| pc-025 | Attribute the estimate and distinguish value from ownership. Correct claim to 'Amazon spokeswoman Patty Smith said Amazon owned about 30% as of Oct 31, 2000 and that the value of its stake at that date was down to zero.' Compare the dated 13G, not a zero shareholding. |
| pc-031 | The passage reports receivables as of the FY2001 10-K discussion, without an explicit Dec 31 balance date. Correct claim to 'The FY2001 10-K reported $153,811 of unpaid Fun4All royalties and $90,000 due from an individual's domain-name purchase, with a full $243,811 allowance for doubtful accounts.' |
| pc-045 | Displayed value drops 'approximately'. Correct value to 'approximately $1.4M retention bonuses + approximately $1.4M severance'; claim about ten officers is supported. |
| pc-046 | Value omits other compensation. Correct value to '$2.8M in severance and other compensation'; the claim's approximately 255 of 320 and Nov 7 date are supported. |
| pc-049 | Displayed value makes an approximate lump sum exact. Correct value to 'approximately $490,000 + $60,000'; the $100,264 deposit return and settlement date are supported. |
| pc-053 | The $94.5M value is net loss, not the comparison marketing expense. Correct value to '$66.479M (Jan 1-Nov 4, 2000); $42.491M (Feb 17-Dec 31, 1999)'. Claim is otherwise supported. |
| pc-065 | Displayed value drops the adjustment's approximation. Correct value to '-20% -> -3%; approximately $631,000'; the source does not state the adjustment's direction. |
| pc-073 | Claim covers payroll, but value broadens it to all fulfillment costs. Correct value to 'customer-service, fulfillment and distribution-support payroll in sales and marketing'. |
| pc-077 | No-sale statement is limited to this registration statement. Correct claim to 'On Nov 30, 2000 PETsMART.com requested withdrawal of its S-1 and said no securities had been sold pursuant to that registration statement.' |
| pc-081 | Product and shipping costs are one component, not total cost of sales. Correct claim to 'Petopia's historical cost of sales comprised $5,616 thousand of product and shipping costs plus $23 thousand of equity-based charges, totaling $5,639 thousand.' Correct value to 'product and shipping costs plus equity-based charges'. |
| pc-083 | Exclusivity is reversed. Correct claim to 'In July 1999 Petopia formed a strategic alliance under which Petopia was PETCO's exclusive online partner.' |
| pc-084 | Value states completed withdrawal; the filing requests an order. Correct value to 'withdrawal requested Feb 2, 2001'; claim about assets sold and business ended is supported. |
| pc-097 | Displayed amounts omit the source's approximation. Correct value to 'approximately $64.4M (2000); approximately $7.6M (1999)'; retain warehouse/delivery costs in G&A. |
| pc-111 | Prospectus ownership denominator is pro forma, not an observed post-offering share count. Correct claim to 'The prospectus based post-offering ownership percentages on 29,544,737 common shares outstanding after the proposed offering.' |
| pc-121 | Source permits failure to respond or late response. Correct claim to 'PETS.COM application 75737216 was abandoned because the applicant failed to respond or filed a late response to an Office action.' |

## Proposal references that need repair

The paths below use zero-based array indexes. Every structured ledger reference exists; no actual ledger id is missing. Rejected ids also occur in explanatory text. The descriptive range in `legacyRechecks.ledger_ids[0]` includes rejected pc-009, pc-014, pc-015, pc-016, pc-023, pc-024 and pc-025. It must be treated as a range description, never passed to a ledger resolver as a literal id.

| Proposal item | Rejected references |
|---|---|
| `proposal.factFile[2]` | pc-009 |
| `proposal.factFile[3]` | pc-009, pc-024 |
| `proposal.factFile[3].note` (text) | pc-024 |
| `proposal.factFile[5].note` (text) | pc-121 |
| `proposal.stock.events[2]` | pc-009 |
| `proposal.rivalchart.series[0].whatGrossMarginCounted` | pc-073 |
| `proposal.rivalchart.series[0].fate` | pc-077 |
| `proposal.rivalchart.series[2].whatGrossMarginCounted` | pc-081 |
| `proposal.rivalchart.series[2].fulfillment` | pc-083 |
| `proposal.rivalchart.series[2].fate` | pc-084 |
| `proposal.stage.points[6]` | pc-009 |
| `proposal.timelineAdd[12]` | pc-049 |
| `proposal.now[1]` | pc-121 |
| `proposal.now[2]` | pc-031 |
| `proposal.now[3]` | pc-014, pc-015, pc-016, pc-023 |
| `proposal.now[5]` | pc-111, pc-025 |
| `proposal.edges[12].evidence[2]` | pc-023 |
| `proposal.edges[13].evidence[0]` | pc-083 |
| `proposal.insights[0]` | pc-065, pc-097 |
| `proposal.insights[2]` | pc-014, pc-015, pc-016, pc-045, pc-046, pc-049 |
| `proposal.numbersAdd[0].rows[1]` | pc-053 |
| `proposal.corrections[0]` | pc-025 |
| `proposal.corrections[0].issue` (text) | pc-025 |
| `proposal.corrections[2]` | pc-016 |
| `proposal.corrections[2].issue` (text) | pc-016 |
| `proposal.corrections[3]` | pc-024 |
| `proposal.corrections[3].issue` (text) | pc-024 |
| `proposal.legacyRechecks.ledger_ids[2]` (text) | pc-111 |

Gap references are disclosure, not verified support. They occur at `factFile[5].note` and `now[0].gap` (pc-144); `factFile[6].note` and `now[2].gap` (pc-146); `stock.gaps[0]` (pc-142); `now[1].gap` and `.note` (pc-145); `now[4].gap` (pc-149); `insights[0].summary` (pc-143 and pc-164); and `numbersAdd[0].note` (pc-150). None may establish a positive claim. The other three gaps, pc-147, pc-148 and pc-154, remain unavailable regardless of which cards are selected.

## Numbers without cleared evidence

Source ids, chapter indexes, recheck intervals, glossary form names and proposal item ids are parameters or identifiers. Counts of four rival companies, five applications, nine proposed stage points, five existing story chapters and three newly proposed stage dates can be recounted from the files. The existing headcount chart contains six points. The plan's eight-point requirement is an editorial rule, not an observed company figure.

| Location | Figure or date | Evidence problem and required treatment |
|---|---|---|
| `factFile[2]`, `[3]`, `stock.events[2]`, `stage.points[6]` | Nov 7, 2000; 320; approximately 255 | References rejected pc-009. The underlying date and 320 are supported, but the displayed layoff estimate needs its qualifier. |
| `factFile[3]`, its note and correction C4 | Nov 9, 2000; 11am | Rejected pc-024 omits the in-stock condition. The closure date itself is supported by the farewell letter. |
| `factFile[6].asOf`, `now[2].asOf` | Oct 10, 2026 | Historical puppet transactions and a Dec 2025 redirect do not establish current rights ownership or site behavior. Use a historical evidence date. |
| `stage.points[8]` | Zero on Jan 16, 2001 | pc-012 establishes zero after the meeting, not on its date. The existing chart's footnote makes the same overstatement and cannot resolve it. |
| `now[1].text` | Abandonments ending Jan 2002 | pc-127 extends the checked range to Jun 12, 2002. Correct to July 2000 through June 2002. |
| `now[2].text` | $153,811 at end of 2001 | Rejected pc-031 attaches a balance date absent from its passage. Attribute to the FY2001 report. |
| `now[3].text`, I3 and C3 | $0.09; $0.075; $0.00747; Jun 22, 2004 | pc-014 to pc-016 are rejected. pc-043 and pc-044 confirm the first two payments; pc-016 supports only the approved final amount and anticipated date after correction. |
| `now[3].text`, `.asOf`, `edges[12]` | Jun 3, 2005; 2001–2005 | Rejected pc-023 needs the direct filing URL. Filing a Form 15 does not establish immediate completed termination or uninterrupted service. |
| `now[4].text` | Advising through end of 2022 | pc-131 reports an agreement to remain an employee in the Founder role until the earlier of Dec 31, 2022 or employment ending. It does not prove she stayed until year-end. |
| `now[5]`, C1 | About 30% at Oct 31; 29,544,737 after IPO | Rejected pc-025 needs attribution and value/ownership separation; pc-111 describes a prospectus basis. Keep the 13G's event and denominator dates separate. |
| `rivalchart.series[0].fate` | Nov 30, 2000 | pc-077 is rejected for an overbroad no-sale claim. Its value supports a withdrawal request, not a completed SEC withdrawal. |
| `rivalchart.series[2].fate` | Feb 2, 2001 | Rejected pc-084 calls a request a completed withdrawal. |
| `timelineAdd[12]`, I3 | $490,000; $550K | Rejected pc-049 loses approximately. Gross termination payments sum to approximately $550,000; the $100,264 deposit return makes the net cash outflow approximately $449,736. Neither derived amount has its own ledger value. |
| `numbersAdd[0].rows[1]` | $109.0M and input 66,479 | Calculation is correct, but rejected pc-053 contains the wrong second displayed value. Repair the input entry before use. |
| I1 | Approximately $631,000; approximately $64.4M and $7.6M | pc-065 and pc-097 are rejected because values drop approximately. Their derived percentages remain conditional on corrected inputs. |
| Petstore rival rows and I1 formulas | 2,100.462; 22,630.515; 45,003.256; -3,060.791; 5,161.253, all USD thousands | These reproduce precision in verified claims/quotes, but values in pc-105, pc-086, pc-087 and pc-106 are rounded millions. Put exact converted inputs in ledger values or derived entries before rendering that extra precision. |
| I3 formula and summary | 34,741,080 shares; 34.7M shares | Present in the FY2001 snapshot, but absent from any ledger value and from existing page prose/footnotes checked. Ledger the share denominator and its date; do not assume it stayed fixed through the final payout. |
| I3 summary | Inventory $4.8M; equity stakes $5.7M; other prepaids $2.5M; net cash use about $3.3M | Rows exist outside the ledgered passages in the liquidation statement. No verified values or existing page footnotes establish these line items. Ledger $4,812K, $3,585K + $2,073K, $2,513K, and $7,098K - $3,795K respectively. |
| `timelineAdd[6].text` | Jan 12, 2001; four days before the vote | pc-029 dates the engagement Jan 12; pc-013 says Couch served after Jan 16. FY2001 Note 2 groups the appointment with engagement but does not resolve that disagreement. Remove the assertion that Couch became sole director four days before the vote. |
| `timelineAdd[8].text` | 16 months | Mar 20, 2001 to Jul 10, 2002 is 15 months and 20 days, approximately 16 months. No derived ledger value; add approximately and ledger the calculation. |
| `edges[1]`, `[4]`, `[5]`, `[10]`, `[11]`, `[13]` | 1999–2000; 2000–; 1999–2001; 1999–2001; 2011–2022; 1999–2000 | The attached evidence does not establish all endpoints. pc-026 supports November 2000, not Wainwright's whole Pets.com tenure. Eleven years of RealReal leadership does not alone establish an exact 2011 start. A historical controlling stake cannot support an open-ended current ownership interval. Ledger dated endpoints. |
| `stage.alternatives` | Five quarter-end cash points beginning Sep 30, 1999 | Existing `numbers.json` runway rows show four dates from Dec 1999 to Sep 2000. The proposed earlier point is not a ledger value or existing cited row there; attach evidence before using it. |

The existing page supplies $82.5M IPO gross proceeds through footnotes 1 and 6; $31.6M sales, $103.1M marketing and sales, and $146.6M cumulative loss through footnote 4; two distribution centers through footnote 6; Chewy's FY2024 $11.86B and nearly 80% through its existing card sources; and the current title's 34 moments and seven-year span through the timeline itself. These are legacy traceability, not new verification decisions. The final-distribution completion claim remains unsupported despite its presence on the existing page.

## Recomputed derived figures

All arithmetic below was independently recomputed. Ratios require multiplication by 100 when displayed as percentages. The proposed derived results have no separate verified ledger entries; add entries with formulas and verified inputs before publishing them. Rejected inputs are identified in the preceding sections.

| Result | Inputs and formula | Recomputed display |
|---|---|---|
| First-period gross margin, PETsMART.com / Pets.com / Petopia / Petstore | pc-068/069, pc-061/064, pc-079, pc-105/106; gross margin ÷ sales × 100 | -60.2%; -131.8%; -63.4%; -145.7% |
| Petstore margin after fulfillment move | pc-105/106/090; (-3,060.791 + 2,959) ÷ 2,100.462 × 100 | -4.8%, illustrative mixed-precision inputs |
| Marketing and sales per $1 sold, same company order | pc-068/070, pc-061/062, pc-079/080, pc-105/086; expense ÷ sales | 3.20; 7.34; 7.01; 10.77 |
| PETsMART.com sales relative to Pets.com | pc-068/061; 10,446 ÷ 5,787 | 1.81, or 1.8× in summary |
| Petstore 1999 fulfillment / sales and / cost of sales | pc-090/105; 2,959 ÷ 2,100.462 and ÷ 5,161.253, × 100 | 140.9%; 57.3%, or 141% and 57% |
| Petstore H1 2000 fulfillment / sales and / cost of sales | pc-091/092; 3,974 ÷ 4,385 and ÷ 10,163, × 100 | 90.6%; 39.1%, or 91% and 39% |
| Petstore H1 margin before / after move | pc-091/092; (4,385 - 10,163) ÷ 4,385; add 3,974 to numerator, × 100 | -131.8%; -41.1% |
| Webvan warehouse/delivery costs / sales | pc-097/099; 64.4 ÷ 178.5 × 100 | Approximately 36.1%, or 36% |
| Webvan margin with those costs included | pc-097/098/099; (0.265 × 178.5 - 64.4) ÷ 178.5 × 100 | Approximately -9.6%, or about -10% |
| Kozmo gross profit / revenue and delivery / revenue | pc-102/103/104; 1,512 ÷ 3,509 and 3,265 ÷ 3,509, × 100 | 43.1%; 93.0%; $3.265M delivery rounds to $3.3M |
| Pets.com non-advertising marketing and sales | pc-060/062; 42,491 - 26,934; remainder ÷ 42,491 × 100 | $15,557K; 36.6% |
| Pets.com Q3 gross margin and shipping adjustment / sales | pc-065/066; (9,365 - 9,642) ÷ 9,365 and 631 ÷ 9,365, × 100 | -3.0%; approximately 6.7% |
| Audited operating-life sales / marketing / net loss | pc-061/052, pc-062/053, pc-063/054; add the two operating periods | $34.435M → $34.4M; $108.970M → $109.0M; $156.282M → $156.3M |
| Audited operating-life gross margin | pc-064/052/061; (-7,625 - 8,093) ÷ (5,787 + 28,648) × 100 | -45.6% |
| Sum of approved per-share payouts | pc-014/015/016 after correction; 0.09 + 0.075 + 0.00747 | $0.17247; $0.172 is rounded and needs about |
| Hypothetical final payout and combined aggregate | pc-016 after correction, pc-043/044, unledgered share base; 0.00747 × 34,741,080; add 3,128,127 + 2,605,581 | $259,515.8676; $5,993,223.8676, about $5.99M or $6.0M |
| Hypothetical aggregate / IPO gross proceeds | preceding hypothetical ÷ 82,500,000 × 100 | 7.2645%, rounding to 7.3% |

The final payout and aggregate are scenarios using an unverified denominator and an approved payment amount. They cannot be described as money received. The first payout's reported $3,128,127 includes an initial preferred-stock payment, so a constant common-share multiplication also misses that distinction. The I3 equity-stake sum is $5,658K and net cash use is $3,303K; both calculations need their unledgered source rows entered first. The non-advertising percentage's denominator is missing from its proposed formula; add remainder ÷ total marketing and sales.

## Series bases and scope

`stock` uses USD per-share Nasdaq sales-price ranges for four 2000 quarters. Q1 begins February 11 rather than January 1. The $11 offer price is not a daily close or the range midpoint. January 18, 2001 has a verified Nasdaq close, so `stock.gaps[0]` cannot say Nasdaq quarters after Q4 do not exist; Q1 2001 lacks a ledgered range. OTC ranges are inter-dealer quotes that may not be transactions. Keep their venue separate and do not connect them to Nasdaq ranges. Evidence covers OTC quotes through 2001, not the assertion in `listed[0].note` that quotation continued until the final distribution. July 12 is the 8-K/A valuation date; the 10-Q and 10-K say acquisition July 13. Preserve the disagreement.

`stage` mixes generic employees in the prospectus with full-time employees at December 31, 2000. Label that scope change. November 7's 320 is before the approximately 255 layoffs. The zero endpoint has no exact date, and FY2001 Note 2 separately describes terminating 33 remaining employees in 2001, against FY2000's 26 full-time employees at December 31. Do not infer a continuous series, an exact resignation day, or a resolution of these headcount definitions. `year` contains full dates; the shared contract currently illustrates year values, so the consumer must accept dates before use.

`rivalchart` compares historical first reporting periods with different inception and ending dates. PETsMART.com had development months before its June 29 store launch; Petopia's historical column excludes predecessor and pro forma results; Petstore's underlying audited dollar figures include a subsidiary. The thousand-dollar conversions are numerically correct, but cannot add precision beyond ledgered values. Petstore's gross margin includes fulfillment while its as-reported marketing expense excludes it. Moving $2,959K changes both lines: normalized marketing/sales would be approximately 12.18 per $1, not the as-reported 10.77. Petopia's cost of sales includes $23K of equity-based charges. PETCO's strategic alliance is not evidence for the `investor` edge, and the rival card reverses whose online partnership was exclusive.

Webvan's adjustment omits approximately $4.6M of warehouse/delivery stock compensation disclosed next to the ledgered passage. Its recalculated -9.6% is therefore an illustrative partial expense transfer. Kozmo delivery is primarily payroll, not exclusively payroll. Chewy's FY2025 52-week figures and FY2024 53-week figures are outside the rivals' first-period basis. Chewy defines Autoship customer status by an Autoship order shipped during the preceding 364 days; the reported metric is customer sales, not a subscription-shipment percentage. I1's claim that no accounting artifact occurred is stronger than finding no reclassification in the reviewed filings. State the reviewed scope.

`storemap` is null. No state-count series, reconciliation or geographic interpolation is proposed. The two existing distribution-center locations describe facilities, not a store footprint.

## Source and citation wiring

The 19 proposed source ids, 40 through 58, do not collide with existing ids 1 through 39. The following new-source items reference rejected entries.

| New source id | Rejected references |
|---|---|
| 40 | pc-031, pc-045, pc-046 |
| 41 | pc-049 |
| 43 | pc-053 |
| 44 | pc-073 |
| 45 | pc-077 |
| 46 | pc-081, pc-083 |
| 47 | pc-084 |
| 49 | pc-097 |
| 53 | pc-121 |

Sources 45 and 47 have no verified backing entry because their sole entries pc-077 and pc-084 are rejected. Source 48 is the September 26, 2000 Form 8-K/A with financial statements; existing footnote 7 is the different July 28 Form 8-K. Do not substitute footnote 7 for this amendment. All source documents match their stated titles and dates, subject to the pc-023 provenance exception already identified.

None of the ledger entries assigned to new sources has `fn` set to its proposed new source id. A `ledger` array in `new-sources.json` does not assign that field. The contract requires each appended source to have a verified entry with that `fn`; all 19 sources need wiring after rejected entries are repaired. Existing-source entries without `fn` also need their established source numbers if they are used in ledger-only blocks. The verifier's permitted fields exclude `fn`, so those changes belong to the author.

Some proposal `src` arrays omit their own evidence. `stock.src` lacks footnote 1 for the IPO event and source 48 for the acquisition-price event. `rivalchart.src` omits sources 45, 47 and 58 for its fate claims. `factFile[0]` points to source 6 while its ledger entry quotes source 40. New timeline items and stage points depend on the missing `fn` assignments. Confirm paragraph/card citations after wiring, rather than assuming a block-wide source list covers every claim.

In `now[3]`, distinguish the Jan 16 name-change filing from the Jan 18 dissolution effective date. In `timelineAdd[8]`, March 20 is the auditor's departure date; Stempek's engagement was effective March 26.

The name-owner label asserts more than the evidence: a historical domain purchase and redirect do not establish ownership of the name today. The puppet's representation agreement and name/logo licenses do not establish that all six agreements licensed the puppet. The acquisition edge for Petstore must specify assets, as the filings do. Open-ended ownership and employment dates need separate evidence. C3 correctly notices an anticipated final payment, but the company card and I3 still call it received.

## Checks and remaining risks

Protected claim fields and gap records were compared with the pre-verification ledger. Only `status`, `verifier`, `verified_at` and `verifier_note` changed. Hashes and quote matches are checked by `node scripts/ledger-check.mjs pets-com`; prose is checked with the writing-rules linter. The proposal and new-source files remain unchanged for the author to correct.

Final counts are 133 verified, 21 rejected and 11 unchanged closed-unavailable gaps, across 165 entries. No non-gap entry remains proposed.

The largest publication risks are the wrong pc-053 marketing value, dates and outcomes inferred from anticipated payouts, current ownership inferred from historical records, and cost comparisons that mix reported and reclassified expense bases. The zero-headcount date and unledgered liquidation inputs also need repair before they appear in a chart or payout total.

The final ledger check passed with zero errors. The report prose lint passed with zero errors and zero warnings. A semantic comparison against the original ledger preserved every protected field and gap record; the fact diff of those preserved fields reported no changes. A whole-record prose diff flagged the requested verifier metadata and notes, which add timestamps, corrections and source references.

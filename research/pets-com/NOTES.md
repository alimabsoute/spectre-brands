# Pets.com research notes (v2 pilot)

Author: claude-sonnet-5-5. Run: 2026-10-10. Ledger: `claims.jsonl`, 165 entries, all `proposed`. 154 are sourced facts (29 of them legacy re-checks) and 11 are gaps. `node scripts/ledger-check.mjs pets-com` passes (schema, quote in snapshot, hash). Snapshots and raw files are in `/workspace/spectre-research/pets-com/`.

## What the research changes

The page is already strong on the prospectus and 10-Qs. The new material comes from filings it never opened: the FY2001 10-K, the FY2000 10-K/A with audited statements, the Petstore.com financials inside Pets.com's own 8-K/A, and the S-1s of PETsMART.com and Petopia. Those answer the Codex question for this slug (how much of the margin improvement came from expense classification) and give the rival comparison primary numbers.

1. Gross margin never counted fulfillment (insight I1, high confidence on the filing text). The 424B4 says fulfillment sits in marketing and sales. The 10-Q definitions keep "distribution expenses" in marketing and sales every quarter. No filing records a change in classification, so the move from −132% (1999) to −3% (Q3 2000) is not a reclassification effect. It simply measures products plus shipping. The only fulfillment dollars in the record are Petstore.com's: Pets.com's own pro forma moved $2,959K (1999) and $3,974K (H1 2000) of them out of Petstore.com's cost of sales. Webvan kept $64.4M of 2000 warehouse and delivery cost in G&A, and Kozmo booked delivery payroll below gross profit. The three headline margins are not comparable. Pets.com's own fulfillment cost is not disclosed anywhere (gap pc-143).
2. First-year rival table from S-1s (insight I2). PETsMART.com sold $10.4M in its first period against Pets.com's $5.8M, spent $33.5M against $42.5M on sales and marketing, and still lost $47.5M. Three of the four rivals describe a scheduled-delivery program in their filings (Keep It Comin', You Sit We Fetch, Bottomless Bowl). The page's "built on subscriptions" line for Chewy needs that context. The "reading" is analysis; the figures are filed numbers.
3. Estate arithmetic (insight I3, optional). Net assets in liquidation were $58.7M on Nov 5, 2000, $9.6M a month and a half later and $4.2M a year after that. Stockholders got about $6.0M in total (derived). Tone needs care: the numbers sit next to $4.2M of retention and severance paid in Nov–Dec 2000.
4. Audited operating-life totals through Nov 4, 2000: net sales $34.4M, marketing and sales $109.0M, net loss $156.3M. The page stops at Sep 30.
5. Domain and trademark facts: pets.com was first registered in November 1994 (registry), PetSmart bought the names on Dec 20, 2000, the Dec 28, 2025 Wayback capture redirects to petsmart.com, and the five 1999 trademark applications checked at the USPTO are all abandoned. The domain list sold includes ihatepets.com and petscomsucks.com.
6. Sock puppet licensing: an exclusive agent signed in March 2000, six license agreements by September 2000, a $125,000 sale in 2001, royalty arrears of $153,811 and a 2002 lawsuit.
7. Stock chart: four Nasdaq quarters from the 10-K (matches the page), one extra anchor (Jul 12, 2000 close of $1.8125) and four post-delisting over-the-counter quarters that the 10-K itself calls possibly non-transactional.
8. Stage series: nine dated headcount points (4 to 320 to 0), three of them new, spanning all five story chapters.
9. Corrections for the page (proposal.json `corrections`): Amazon's "about 30% at Oct 31, 2000" does not reconcile with its own Schedule 13G (24.5% on the same 8,973,029 shares at Dec 31, 2000); Chewy figures are a year old; the Jun 22, 2004 final payout date is an "anticipated" date in the 8-K.

## What I could not get

- A daily IPET price series. Yahoo reports the symbol as delisted; other data hosts were blocked from the sandbox. Only quarterly ranges and a handful of dated closes exist in the record.
- Pets.com's dollar fulfillment cost, order-level economics, or any note describing a reclassification.
- The live pets.com site today. The sandbox cannot connect to it, and the Wayback CDX API was offline. The Dec 28, 2025 capture is the latest evidence.
- Current US trademark registrations. TSDR works for serial numbers I already had, but it cannot search by name or owner, and its API needs a key. "Abandoned" applies to the five checked applications only.
- Who owns the sock puppet after 2002.
- 2000 results for PETsMART.com, Petopia or Petstore.com (beyond Petstore.com's first half).
- Any primary source for the Super Bowl ad cost.
- Julie Wainwright after 2022.
- Hummer Winblad, Disney and Merrill Lynch edges were not re-checked.

## Judgment calls for the reviewer

- Nov 9 or Nov 10 for the store closing: both are in filings. The farewell page says closed effective Nov 9 and the 10-K says closure effective Nov 10. The proposal uses Nov 9 for orders.
- Hakan & Associates vs Hakan Enterprises: the 2000 agreement names Brian P. Hakan & Associates, Inc., the 2001 buyer is Hakan Enterprises, Inc. The sources do not say they are one entity; the edges keep them separate.
- The $631,000 "one-time shipping charge adjustment" in Q3 2000: the filing does not say which way it moved the margin, so the proposal states the amount and its share of Q3 sales (6.7%) without a direction.
- Webvan's "about −10% if warehouse and delivery costs move into cost of goods sold" is derived from a rounded 26.5% and ignores $4.6M of related stock compensation. It is labelled derived with its formula.
- Rival periods differ by days and by inception date. They are first-year figures, not calendar 1999.
- Petopia's S-1 extract names no place for fulfillment cost, so its gross margin is listed as reported, with that caveat.
- PETCO is listed as Petopia's partner, not as an investor; the passage logged does not show an equity stake.
- The `stage` points use dated headcounts rather than years, because the filings give dates; the contract's `year` field would need to accept a date string.
- Unreferenced backing entries (pc-017, pc-019, pc-050, pc-055, pc-067, pc-074, pc-078, pc-085, pc-119, pc-124, pc-129) are logged for the verifier but not used in the proposal.

## Confidence

High for every quoted filing figure and date. Medium for cross-company ratios and the Amazon discrepancy (both depend on rounded or differently dated inputs). Low for anything about today (domain redirect, trademark ownership): single captures, one registry lookup.

## For the verifier

Entries marked `legacy: true` (pc-001 to pc-026, pc-110 to pc-112) check text already on the page. Entries for the 424B4, 10-Qs, FY2000 10-K, 8-K and 8-K/A carry the existing footnote's URL, so no new source is needed for them. `new-sources.json` proposes sources 40 to 58, each tied to ledger ids. TSDR pages and RDAP were fetched on 2026-10-10 and will change.

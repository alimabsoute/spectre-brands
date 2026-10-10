# Orbitz research notes

Research agent: claude-sonnet-5-5. Run date: 2026-10-10. Nothing here is verified yet; every entry in `claims.jsonl` has status `proposed` and needs a verifier from another vendor.

## What is in the folder

- `claims.jsonl`: 172 entries. 159 are claims with a quote, hash and snapshot; 13 are gaps (`closed-unavailable`). 33 of the claims are legacy rechecks of text already on the page (`legacy: true`, with the existing footnote number). `node scripts/ledger-check.mjs orbitz-drink` passes with 0 errors.
- `proposal.json`: fact file, parent-company stock block, rival chart, stage series, 27 added timeline events, 7 where-are-they-now cards, 12 glossary terms, 8 edges, 4 ranked insights, a 6-chapter story outline, extra numbers views, press clips, people, rivals, website captures, and a list of differences found in existing text.
- `new-sources.json`: 28 proposed sources, ids 8 to 35, each with its ledger list. The ids are provisional. Every new-source ledger entry carries `fn` set to the same id.
- Snapshots and raw files are in `/workspace/spectre-research/orbitz-drink/`.

## What the page can now say that it could not before

1. How the drink worked. A Bush Boake Allen patent on suspending inclusions (filed Oct 25, 1995), a 1996 Science World test, and a University of Minnesota rheology paper (Rheology Bulletin, Jan 1999) that measured the liquid: yield stress 0.04 Pa, viscosity four times water's at a shear rate of 100 per second, and a tolerance of about 12 kg/m3 for 5 mm balls. The page had no mechanism before.
2. The name. orbitz.com was the drink's own site (Wayback captures from Dec 21, 1996). By Feb 29, 2000 it was a parked page and by Jan 19, 2001 it read "©2000 Orbitz, LLC". The sources do not say how the address changed hands.
3. The afterlife. The maker's 20-Fs for 2005 to 2007 still list Orbitz. It applied to register ORBITZ on Sept 29, 2006 and let the application lapse on Dec 8, 2008 (USPTO TSDR). A different applicant filed and withdrew ORBITZ DEFY GRAVITY in 2014. Fast Company (Oct 2024) reports the trademark was sold and the machine was sold for parts. The maker filed a creditor proposal on Mar 17, 2010, its shares were cancelled on May 26, 2010, and the SEC revoked its registration on Jan 4, 2017.
4. Launch detail. US introduction in May 1996 (Science World), a July 1996 Arizona test market, the Canadian launch on Apr 14, 1997 with sales from May 1, packaging awards, and planned expansion to the UK, Australia, Sweden and Asia.
5. A rival comparison. Clearly Canadian's own 20-F names Hansen Natural as a direct competitor. From 1998 to 2002 Clearly Canadian's revenue fell 41% (derived) while Hansen's net sales rose 89% (derived).

## Decisions for the orchestrator

- Signature. I propose `recreation`, built from the five dated captures, because no other page can use it. The `stage` series exists as a fallback for `scrolly`, but it is the parent's revenue, not Orbitz's.
- `listed` is empty because Orbitz was never listed. The stock block charts the parent and says so in its `scope` field. If the renderer treats a stock chart on a product page as a contract violation, drop it; the rival chart and stage series do not depend on it.
- The stock series mixes two bases. Quarters 2001 to 2004 are as first reported; 2005 onward are after the 10-for-1 consolidation of May 2, 2005. I did not multiply anything. The 2004 quarters appear on both bases (`series` and `rebased2004`). The chart must break the line at 2005Q2. Annual 1998 to 2000 ranges are separate because the Feb 1999 4.25-for-1 consolidation also breaks them.
- The stage series uses the latest filing that reports each year, so 2002 is $20.205M (restated), not the $20.477M in the 2002 20-F's own table that the page shows as $20.5M. Both figures are in the ledger. Keep $20.5M in the existing chart and label the source.
- Names of private people. The 2014 trademark applicant is an individual. The ledger entry quotes only "Legal Entity Type: INDIVIDUAL"; the TSDR snapshot contains the name and a home address. Do not put either on the page.

## Differences found in existing text (for the writer)

- Washington Post date. The archived page reads April 21, 1997. The existing Sources note says the page is dated April 20. Check the live page before keeping the note.
- Gastro Obscura. The Conflicts note says it says Orbitz was "launched and sold through Orbitz.com". The article says the site "hawked" the drink. Suggest "promoted through".
- Revenue figures in the 2002 20-F disagree internally: 2002 is $20,477,000 in the table and $20,447,000 in the risk-factor text; 1998 is $34,889,000 in the table and $35,153,000 in the text. The page uses the table, which is the better choice. Later filings restate 2002 to $20,205,000, 2004 to $11,064,000 and 2005 to $8,712,000.
- The page's afterlife card says the maker's shop shows "Nearly ready". Still true on Oct 10, 2026, but Fast Company (Oct 2024) says the brand is in full production and on track to sell about 45 million bottles in 2024.
- All seven existing sources opened. Their quotes match the text that the page uses. The only source whose content I could not reopen in full is the 2015 News-Press interview, which Gastro Obscura quotes; the News-Press page returned HTTP 402.

## What I could not find

Thirteen gap entries record the searches. The ones that matter most:

- Any Orbitz-specific sales, shipments or write-down figure beyond the Strategy article's first-half numbers. I downloaded all 173 electronic filings for the company (2002 to 2010) and searched them. The 2002, 2003 and 2004 20-Fs do not contain the word Orbitz. The earlier annual reports are on paper.
- The currency of the $9.4M and $1.46M figures. Strategy does not say, and I found no second source. The 1996 "million cases" was said in October 1996, so it is a projection.
- Two Business Wire releases from Oct 1996 and Jan 1997 that might have held actual shipments. The Wayback copies return 404.
- The 1996 to 1997 share price (the Orbitz years). The filings that cover them are on paper.
- A current owner of the ORBITZ name. TSDR needs a serial number, and Justia returned 403. Only two serial numbers were opened.
- A court record for the Bush Boake Allen dispute, and confirmation that US 6,106,883 is the patent in suit.
- How orbitz.com passed to Orbitz, LLC. The Wayback Machine has no capture between Feb 9, 1999 and Feb 29, 2000 (CDX query saved in `raw/`).
- Revenue for 1992 to 1997. FundingUniverse and the Arizona student paper disagree ($155.2M against $141M for 1992), so I left both out of the proposal's series.

No store map: Orbitz had no stores.

## Confidence

High: the EDGAR figures and listing history, the TSDR records, the SEC notices, the Wayback captures, the patent record, the rheology paper and the Business Wire release. These are primary documents, and the quotes were machine-matched to the saved text.

Medium: the contemporary press (AP, Spokesman-Review, Washington Post, Strategy, Science World, BevNET). The text is accurate to the pages, but the facts are the writers' own accounts.

Lower, flagged with `secondary` or `note` in the ledger: FundingUniverse (a reference work; its 1996 revenue, the May 1998 patent settlement and the fall 1999 suspension have no second source), the Arizona student paper (the Bush Boake Allen attribution; its revenue figures are wrong or inconsistent and were not used), and Fast Company 2024 (the only source for the trademark sale, the scrapped machine, the 2012 acquisition and the current owners, and the quote comes from a marketing executive of the new owners).

Unconfirmed identity: Science World quotes "William Chalupa, a fluid-gel expert", and the patent names "William F. Chalupa" as an inventor. The name matches; I could not confirm it is one person. The proposal says so.

## Method notes

- The Rheology Bulletin snapshot was made with `pdftotext` in reading order, not `totext.py`'s `-layout` mode. In `-layout` mode the two columns interleave line by line and a quote cannot run across lines. The raw PDF is in `raw/`.
- Wayback captures were fetched in raw mode (`id_`) so the saved page has no archive toolbar.
- The FundingUniverse reference was used only for facts that the proposal marks `secondary`.
- Wikipedia was read for leads and never cited. Its Orbitz article rests partly on pages that returned 403 here.
- The derived percentages carry their formulas in `proposal.json`; the numbers I derived were not typed into any quote.

# Corrections to frozen claims on the Pets.com page

These come from the verified ledger. None is applied: the frozen-facts guard blocks edits to existing text. Each row gives the location, the current text, the proposed text and the ledger ids.

## C1. Amazon's stake, afterlife item "Amazon's stake"

Current: "About 30% as of Oct 31, 2000. A spokeswoman said its value was “down to zero.”[^11]"

Proposed: "An Amazon spokeswoman said Amazon owned about 30% as of Oct 31, 2000 and that the value of its stake at that date was down to zero.[^11] Amazon's Schedule 13G reports 24.5% of the class on 8,973,029 shares, computed on 36,660,961 shares outstanding at Nov 20, 2000, with Dec 31, 2000 as the event date.[^51]"

Ledger: pc-107, pc-108, pc-109, pc-136 (verified). pc-025 was rejected because the value dropped the attribution and mixed value with ownership. The same 8,973,029 shares were 30.4% in the prospectus (pc-110, a pro forma post-offering figure), so the two percentages rest on different share counts. The page's cap-table subtitle already uses 29,544,737 post-offering shares; pc-111 was rejected for presenting that denominator as observed, so it should read "prospectus basis".

## C2. Chewy figures are a year old, afterlife item "The idea" and key finding 5

Current: "Chewy did $11.86B in FY2024 net sales, nearly 80% of it from Autoship subscriptions.[^19]" and "Chewy did $11.86B in sales in FY2024, built on subscriptions and positive gross margins.[^19]"

Proposed: Use FY2025 (ended Feb 1, 2026): net sales of $12.60 billion, and Autoship customer sales at 83.3% of net sales against 79.2% in FY2024.[^57] The wording "of it from Autoship subscriptions" overstates the metric: Autoship customer sales are all sales to customers who had an Autoship order in the prior 364 days, not sales shipped by subscription. The versus table row "Autoship = 79.2% of sales" needs the same change. FY2025 has 52 weeks and FY2024 has 53, so keep the basis in the sentence.

Ledger: pc-133, pc-134, pc-135.

## C3. Final payout is a scheduled date, not a confirmed payment

Locations and current text:
- Timeline, "Jun 22, 2004 / Final payout: $0.00747": "The shares are declared worthless."
- Story chapter 5: "...and a final $0.00747 in 2004." and the big figure "$0.172" with its caption "total liquidation payout per share, 2001–2004"
- Hero key number "$0.172 total paid back per share in liquidation, 2001–04"; afterlife item "The company" ("Holders got $0.172 in total"); people, Richard G. Couch; the numbers stats block; the versus table row "Liquidated; $0.172/sh returned"

Issue: the 8-K (fn 10) approves a final distribution of $0.00747 per share with an "anticipated" date of Jun 22, 2004 and says the shares would be worthless after it. We found no filing that confirms the payment. The first two payments are confirmed as paid: $3,128,127 on Sep 28, 2001 (pc-043) and $2,605,581 in September 2002 (pc-044).

Proposed: "The board approved a final $0.00747 distribution, anticipated for Jun 22, 2004; the company said the shares would be worthless after it." Where the page totals $0.172, say "approved distributions totaling $0.172 a share" or "$0.165 paid and $0.00747 approved". Both are derived from pc-014 to pc-016 once those entries are corrected as VERIFY.md describes.

Ledger: pc-016 (rejected until corrected), pc-043, pc-044. pc-014 and pc-015 need the same "anticipated date" correction.

## C4. Store closing, timeline "Nov 9" and story chapter 5

Current: "“We have closed our virtual doors.” Orders placed before 11am PT ship." and "The site stopped taking orders at 11am Pacific on November 9, 2000."

Proposed: "Orders for in-stock items placed before 11am PT that day would be processed and shipped; backorders not shipped by Nov 14 would be cancelled." The FY2000 10-K dates the closure of the web store and the end of all sales effective Nov 10, 2000 (pc-160). The two dates are not in conflict if Nov 9 is the farewell page and Nov 10 the plan's effective date; say so once.

Ledger: pc-160 (verified). pc-024 was rejected for omitting the in-stock condition.

## C5. Timeline title counts 34 moments

Current: "Seven years, 34 moments"

Proposed: "Seven years, 44 moments". The page now has 44 events. The frozen-facts guard blocks the change, so the title is wrong by 10 until it is lifted. The span is unchanged (Oct 1998 to Jun 2005).

## C6. Footnote 23 points to the EDGAR filing index

Current source text: "SEC EDGAR — IPET Holdings filing index (Form 15-12G, Jun 3, 2005)."

Proposed: link the Form 15-12G directly: https://www.sec.gov/Archives/edgar/data/1100683/000095013405011306/0000950134-05-011306.txt. The filing is dated Jun 3, 2005 and signed by Richard G. Couch. It does not by itself show that registration and reporting duties ended on that day, so "The company leaves the public record" (timeline) and "the registration ended in 2005" (afterlife) should say "filed a Form 15".

Ledger: pc-023 (rejected for the source URL).

## C7. Headcount chart, point "Jan 16, ’01: 0"

Current: bar labelled "Jan 16, ’01" with tooltip "All remaining staff resigned", and the chart source "all remaining employees resigned Jan 16, 2001".

Proposed: label the bar "After Jan 16, ’01". The 10-K says all employees resigned subsequent to the Jan 16 meeting, with no exact date. The 26 at Dec 31, 2000 are full-time employees; the FY2001 10-K separately describes terminating 33 remaining employees in 2001, so do not read the series as continuous.

Ledger: pc-012.

## C8. Present-tense claims about pets.com

Locations: company.json `tierWhy` ("pets.com only redirects to PetSmart"), afterlife chain node "Today / PetSmart" ("pets.com forwards to PetSmart's store, as it has since early 2001"), afterlife item "The domain".

Issue: the latest evidence is a Wayback capture of Dec 28, 2025 showing a redirect to petsmart.com (pc-130). Direct connections to pets.com failed from the research environment (gap pc-144), and the registrant is not public, so the page cannot say who owns the name today.

Proposed: "As of a Dec 28, 2025 capture, pets.com redirects to petsmart.com." Drop "Today" or add the date.

## C9. Petstore.com share count, timeline "Jul 2000 / Buys Petstore.com" (needs a check)

Current: "All stock: 5.8M common shares plus preferred stock. It brings in $3M of cash."

Issue: the Q3 2000 10-Q and the FY2000 10-K/A say Pets.com issued 5,243,752 common shares for Petstore.com's assets (pc-162, pc-094), valued at $10.3 million. Separately, Pets.com sold Discovery $3 million of Series A redeemable preferred stock and common stock (pc-095). The 5.8M figure may add the two common-share issues, but no entry confirms that, so treat it as unresolved. The deal also dates differently by filing: the 8-K/A values the shares at the Jul 12 close, the 10-Q and 10-K say the acquisition closed Jul 13 (pc-093, pc-162).

## C10. PetSmart's stake, timeline "Nov 30 / PetSmart.com pulls its IPO"

Current: "PetSmart later raises its stake to 81%."

Proposed: "On Dec 20, 2000 PetSmart raised its voting ownership from about 46% to more than 81% and assumed control." The 81% is voting ownership, not necessarily economic ownership.

Ledger: pc-137, pc-138, pc-139.

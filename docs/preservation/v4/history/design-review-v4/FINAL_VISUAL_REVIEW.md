# Integrated local visual review — 12 October 2026 UTC

Target: `alimabsoute/spectre-brands`, isolated checkout `spectre-hero`, branch `v2-pilot`, unchanged base/HEAD `2f066ae5047159a385584646bd9b975583eff4a0`. Routes: `/blockbuster/`, `/pets-com/`, `/orbitz-drink/`. No commit, push, merge, deployment, subscriber import, email send, live database migration, DNS change or service configuration change occurred.

## Feedback mapped to the result

| Request | Result |
|---|---|
| Too much text and dead space at the top | Original short standfirst, prominent title and primary visual lead; overview/facts remain in native expandable dossiers. The signup entry is a 45px closed disclosure at normal text size. |
| Three distinct layouts, rather than a repeated template | Blockbuster is a cinematic CRT opening; Pets.com is a website/journey opener with the original mascot drawing; Orbitz is a product/archive composition with the original bottle drawing. |
| Preserve the beloved Blockbuster title | Barlow Condensed remains the Blockbuster display face. Existing brand colors and site type conventions remain. |
| Use the supplied videos, especially the rain/neon sign | A complete 35.7s, nine-cut edit uses the first four films. Whole 16:9 frames are shown inside a dimensional 4:3 tube. The fifth game is held separately. |
| Condense without losing information | Fourteen full film transcript lines retain qualifications, figures, Marc Randolph attribution and numbered source links. Short visible cues, original illustration descriptions and image provenance use accessible disclosures. |
| Keep good lower sections, graphs and custom art | Original company/section words, figures, citations and assets are preserved. Weak/sparse captures are in the bottom Archive with provenance. Chart changes are confined to responsive container sizing at enlarged text. |
| Free updates only | Top disclosure, engagement prompt and footer form; double opt-in; pending and confirmed states are distinct. No accounts, passwords, payments, tiers or membership. |

The original branch screenshots are in `docs/hero-review/before/`. `docs/design-review-v4/before/` is the first-pass hero immediately before the integrated film/layout work; it is not the original branch baseline. The portable report labels that distinction and includes actual original baseline and current captures.

## Impeccable brand and polish audit

Used the installed Impeccable skill at `${LOCAL_PATH}`, its brand and polish references, PRODUCT.md and the real site tokens. This is a manual visual/interaction audit supported by browser evidence, not an automated claim of design quality. No formal critique/delegated audit was invoked.

- Hierarchy: the distinct brand title, concise standfirst and meaningful visual read first at desktop and phone widths. The CRT is deliberately dominant for Blockbuster; the other brands do not inherit television, map or globe decoration.
- Disclosure: substantive overview text, figure tables and source detail remain reachable by native keyboard controls. Illustration descriptions and the technical film edit detail no longer crowd the opening. At 200% text the page grows vertically rather than clipping controls.
- Alignment and spacing: site gutters, paper bands, hairlines and type conventions are used. The top signup competes less with the story. The mobile masthead retains 44px controls at enlarged text.
- Motion: no film autoplay or automatic sound. Explicit Play/Pause, Sound, chapter selection, keyboard seeking, Replay and offscreen/visibility pause. Changing a chapter or seeking pauses first. Reduced motion uses settled stills and manual cue navigation, including a no-JavaScript poster fallback.
- Contrast: measured selected title, standfirst, controls, signup and footer text in dark mode meets the applicable 3:1 or 4.5:1 threshold. Existing first-pass light/dark measurements remain in the earlier hero review. These checks do not certify every pixel of embedded footage.
- Final observed defects repaired: oversized mobile signup; oversized masthead controls at text zoom; overlapping film buttons; chart min-content expansion; missing no-JS reduced-motion still; overwide old footer columns and a long act-heading word. No substantive lower-section rewrite was needed.

## Validation and evidence

- Build and full repository check pass: 69 generated pages, 53,400 internal references; browser smoke on 68 pages at 375/1280, plus keyboard, search, reduced motion, video facades, timelines, image viewer and no-JS checks. External URLs were counted, not all independently verified.
- 37 unit tests pass with none skipped: 11 existing v2 tests and 26 email-list tests. D1 statements were exercised against local SQLite, not a live D1 instance. Resend was a mock.
- Dedicated browser matrix: three routes at 320/375/768/1024/1280/1440, expanded/collapsed disclosures, 320px at 200% root text, dark and reduced motion, no-JS, real form validation/pending/retry, reading-time/progress gating, overlay/media/typing suppression and dismissal persistence. Raw results and screenshots are in `qa/`.
- Complete 1080p master playback: 35.7s, 1,071 decoded frames, seven dropped under the concurrent local QA workload, no playback error. Web derivative completed at both 1280 and 375 with 1,071 frames, four/two dropped, zero caption position change, CLS 0 / 0.000022.
- HyperFrames final lint: zero findings. Final software-rendered runtime/layout check: zero findings at 1.5, 19.3 and 34.5s. Earlier nine-position check passed before final audio schema polish. A later hardware-rendered rerun stalled on readiness and was stopped; it is not reported as a pass.
- Original prose guard: 47 JSON files, 3,897 strings and 1,342 values preserve original words, qualifiers, numbers, quotes and citations. Existing nine word links retain their wording. Supplied film hashes before/after copying match; the originals were read only.
- The self-contained review and its actual Downloads copy pass 14 offline cases with no runtime errors or external requests, including three phone layouts, source artwork, film playback, preserved chart rendering, and local demo submission. Existing remote thumbnails are replaced only inside the offline artifact with explicit availability labels; the site source stays intact.
- The project is JavaScript; no dedicated TypeScript check is configured. Build, imports, unit tests and browser execution validate the relevant code paths. Source syntax and whitespace checks are recorded separately.

## Email and integration limits

Confirmation and welcome HTML/plain-text emails are local previews. Browser rendering at 320/600 is checked; Gmail/Outlook inbox rendering and real delivery are not. The confirmation request says “Check your inbox to confirm.” Only a fresh confirmed state celebrates, with a finite ticket-stub burst; repeated confirmation and reduced motion do not replay it.

The local backend is disabled until explicitly configured with the intended existing connection, database, secret and HTTPS origin. `hello@spectrebrands.com` is the proposed sender, not a verified live sender. Welcome mail is held without an appropriate configured mailing address; no home/apartment address was used. Database schema and configuration files are examples only. Confirmation/welcome retries use stable idempotency keys; ambiguous sends outside the provider's 24h window wait for manual review.

Official references: [Resend domain listing](https://resend.com/docs/api-reference/domains/list-domains), [domain verification details](https://resend.com/docs/api-reference/domains/get-domain), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), and [FTC commercial-email guidance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).

Automatic approval review rejected a proposed broad credential search across unrelated projects as excessive discovery outside the authorized Spectre scope. The proposed probe did not execute, no token was used, and it was not retried. The exact Spectre Resend connection/source remains pending with the parent/user. This does not block the delivered film or local review.

The existing 21st.dev MCP connection successfully searched and retrieved the Newsletter reference by kevingirelli (demo 35256, component 19742). No new login, grants or purchases. Its license was unspecified, so no source code was copied; the implementation is original vanilla HTML/CSS/JS. See `updates/21st-source.md` for attribution and response evidence. Actual Claude Code streamed `claude-opus-5-5` for the implementation passes; sanitized metadata is in `claude-code-evidence.json`. Private logs/configuration are excluded from deliverables.

Safari/Firefox, screen-reader speech output, audio listening quality and real subscriber/delivery systems were not tested. The portable review deliberately disables remote embeds and labels their offline thumbnails. Local illustrations, articles, graphs and supplied films are retained.

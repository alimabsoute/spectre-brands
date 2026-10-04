# Redesign and content expansion: change log

Run of 2026-10-03, on a headless Linux box, committed locally to `main` and **not pushed** (the box has no
GitHub credentials). Phase by phase: what changed, what was added, what was verified and how, and what
is still open.

## 1. Design changes

**Fixed from the audit** ([DESIGN_AUDIT.md](DESIGN_AUDIT.md), baseline screenshots in `docs/audit/before/`)

- **Story section.** The single sticky "stage" and the 72vh chapters are gone. Each chapter is now a row
  with its own figure card and its own visual (a commercial, an archive screenshot, a photo or a drawing)
  beside the text; the visual is sticky only inside its row. No fixed heights, no 35%-opacity text, plain
  stacked blocks under 900 px. The RadioShack story went from 3,240 px to roughly the height of its content.
- **Background.** Page `#FCFBF8`, cards `#FFFFFF`, hairlines `#E8E6E1`. The tan alternate bands, beige map
  fill and tan chart series are gone (old `tan`/`sand` chart colour names now map to neutral greys).
- **Hierarchy.** Headlines and figures in Source Serif 4, interface and data in Inter. One type scale, one
  4 px spacing scale, three shadows, three radii, all in `assets/css/tokens.css`.
- **Template tells removed.** No letter-spaced uppercase eyebrows (section labels are sentence case), no
  generic stat-card grid (key numbers are counters with a context sentence), no emoji, no Roman numerals,
  no gradient glows, no italic accent words.
- **Content is visible without JavaScript.** Reveal animations apply only when the runtime is running.

**New**

- Homepage: headstone for every brand that flips to show its years, Dead vs Ghost explainer, featured
  post-mortem, "On this day" (or the next anniversary when nothing matches today), filters by status,
  category, decade and cause, card rows per category.
- Category pages `/category/<id>/`, About and methodology `/about/`, search (press `/` or Ctrl/Cmd+K),
  sitemap.xml, robots.txt, canonical URLs, OpenGraph image per brand, Article / WebSite / CollectionPage JSON-LD,
  favicon and wordmark.
- Global nav: Home, Categories (dropdown with counts), About, Search; a sheet menu on mobile; skip link.
- "Commercials & footage" section on every brand page, plus inline videos beside the chapters they belong to.
- Nine build-time infographic blocks: `arc`, `waffle`, `flow`, `multiples`, `counters`, `scale`, `chain`,
  `compare`, `bars`. Every chart and infographic has a data table underneath.
- Brand gallery with credits and licenses, and a then-vs-now slider.
- Footer trademark and fair-use disclaimer on every page.

**Motion** (CSS first; no animation library)

- Scroll reveals; arc lines draw in; bars and cause-of-death bars grow; waffle cells pop in; counters tick up.
- Idle motion on hero drawings per brand (`hero.motion`: bob, drive, flicker, fizz, spin, float); drawings
  slide in with scroll-driven animation where the browser supports it.
- Card hover: lift, slight rotation of the drawing, and a fade-to-ghost for ghost-tier brands.
- Cross-document view transitions between pages (drawing and title are shared elements).
- `prefers-reduced-motion`: all of the above stops. Layout shift measured by Lighthouse is 0 on every page.

**Performance work**

- Fonts and libraries are self-hosted. Chart.js and the map libraries (d3-geo instead of all of d3) load
  only when a chart or map is near the viewport. One stylesheet, one deferred script.
- Sections use `content-visibility: auto`, which cut mobile style-and-layout time on the longest page from
  about 1.6 s to 0.2 s under Lighthouse throttling.
- Images are AVIF with a JPEG fallback, intrinsic sizes and lazy loading. Videos are facades.
- `vercel.json` skips `npm install` (the build has no dependencies) and adds cache headers.

## 2. Research inputs: MCPs and skills

| Input | Status | What was taken |
|---|---|---|
| shadcn MCP | used | Registry listing and the `command`, `tabs`, `hover-card` items as behaviour specifications; re-implemented in plain HTML/CSS/JS (command palette, tabs with arrow keys, accordion, tooltip, toggle group, slider). Table in DESIGN_RESEARCH.md section 2. |
| Mobbin MCP | **not available on this machine** | Nothing. Public-page research was done instead (The Pudding, Rest of World, Stripe Press, FT Visual Vocabulary, Datawrapper, d3-annotation, Mapbox storytelling, WAI-ARIA APG). Mobbin's own pages returned 403. |
| 21st.dev Magic MCP | **not available on this machine** | Nothing from 21st.dev itself (only its landing page loaded). Equivalent public references: Magic UI number ticker and marquee, Aceternity compare / 3D card / timeline / tooltip, `lite-youtube-embed`, `img-comparison-slider`, MDN view transitions and scroll-driven animations. Table in DESIGN_RESEARCH.md section 4. |
| `design:design-critique` skill | used | Structure of the audit. |
| `design:accessibility-review` skill | used | WCAG 2.1 AA checklist for the audit and QA. |
| `design:design-system` skill | used | Token audit; the remaining hard-coded colours were moved into tokens (the only literals left are three period colours inside the "old website, rebuilt" recreation). |
| impeccable / polish / frontend-design skills | not installed | Principles applied by hand. |
| seo-audit, brand-review, theme-factory, canvas-design, ux-copy, design-handoff | not used | Not needed for what was built. |

The follow-up list for a machine that has the Mobbin and 21st.dev MCPs is in DESIGN_RESEARCH.md section 6.

## 3. Phase 0: repo hygiene

- All 18 `.b64` files decoded to real `.avif` / `.png` files and removed; the build no longer decodes base64.
- There were no `_parts/` chunked files in the repository, so there was nothing to reassemble.
- `npm run dev` (live reload) and `npm run check` (build, link and anchor check, Playwright at 375 and 1280,
  plus keyboard, search, reduced-motion, video-facade and no-JavaScript tests).

## 4. Brands (17: 6 dead, 11 ghost)

| # | Brand | Tier | Category | Main cause | Sources | Videos | Infographics | Images | Drawings | Map | Old website |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 001 | [Pets.com](../companies/pets-com/) | Dead | Dot-com & internet | Unit economics | 39 | 6 | 7 | 5 | 4 | yes | yes |
| 002 | [Webvan](../companies/webvan/) | Dead | Dot-com & internet | Overexpansion | 33 | 7 | 8 | 8 | 3 | yes | yes |
| 003 | [RadioShack](../companies/radioshack/) | Ghost | Electronics retail | Technology shift | 38 | 7 | 8 | 9 | 5 | yes | yes |
| 004 | [Circuit City](../companies/circuit-city/) | Ghost | Electronics retail | Strategy and management | 39 | 6 | 10 | 8 | 4 | no | yes |
| 005 | [Toys “R” Us](../companies/toys-r-us/) | Ghost | Toy stores | Debt and buyouts | 39 | 8 | 9 | 8 | 4 | no | yes |
| 006 | [KB Toys](../companies/kb-toys/) | Ghost | Toy stores | Outcompeted | 39 | 6 | 10 | 6 | 4 | no | yes |
| 007 | [Kiddie City](../companies/kiddie-city/) | Dead | Toy stores | Outcompeted | 35 | 6 | 10 | 0 | 4 | no | no |
| 008 | [Groupon](../companies/groupon/) | Ghost | Dot-com & internet | A fad that faded | 31 | 6 | 9 | 10 | 4 | no | yes |
| 009 | [AOL](../companies/aol/) | Ghost | Dot-com & internet | Technology shift | 38 | 7 | 9 | 8 | 4 | no | yes |
| 010 | [Zima](../companies/zima/) | Ghost | Food & drink | A fad that faded | 36 | 6 | 10 | 9 | 4 | no | yes |
| 011 | [Crystal Pepsi](../companies/crystal-pepsi/) | Ghost | Food & drink | A fad that faded | 37 | 7 | 8 | 5 | 4 | no | no |
| 012 | [Sega Dreamcast](../companies/dreamcast/) | Dead | Video games | Outcompeted | 27 | 6 | 11 | 7 | 4 | no | yes |
| 013 | [Atari](../companies/atari/) | Ghost | Video games | Strategy and management | 33 | 7 | 11 | 12 | 4 | no | yes |
| 014 | [Blockbuster](../companies/blockbuster/) | Ghost | Film & home video | Technology shift | 36 | 7 | 8 | 9 | 4 | no | yes |
| 015 | [Quibi](../companies/quibi/) | Dead | Film & home video | Strategy and management | 37 | 6 | 9 | 9 | 4 | no | yes |
| 016 | [Howard Johnson’s](../companies/howard-johnsons/) | Ghost | Restaurants | Strategy and management | 31 | 6 | 8 | 4 | 4 | yes | no |
| 017 | [Burger Chef](../companies/burger-chef/) | Dead | Restaurants | Overexpansion | 25 | 7 | 8 | 4 | 4 | no | no |
| | **Total** | | | | **593** | **111** | **153** | **121** | **68** | | |

001–003 existed before and were upgraded; 004–017 are new. Each brand's one-line tier justification is in its `company.json` (`tierWhy`) and is shown in the page hero and in the table on `/about/`.

## 5. Videos embedded per brand (111 in total, all verified on 2026-10-03)

Every id below returned HTTP 200 from YouTube's oEmbed endpoint, or a valid item from `archive.org/metadata`, in the final run of `node scripts/verify-media.mjs` (111 checked, 0 failed). "Verified" means the video exists and allows embedding; playback itself was exercised with Playwright on one page (the facade creates a youtube-nocookie.com iframe on click), not on all 111. Years marked in captions as "uploader's date" could not be confirmed independently.

**Pets.com**

- 2000, commercial: If You Leave Me Now, the Super Bowl XXXIV spot (youtu.be/DUoWcYoOjFQ)
- 1999, commercial: A reel of Pets.com commercials, 1999–2000 (youtu.be/sICSyC9u5iI)
- 2000, commercial: Please Don’t Go (youtu.be/nXHrlm5Nk5w)
- 2002, commercial: The puppet’s second job: 1-800-BarNone (youtu.be/NSt5PlxN_m4)
- 2016, news: MSNBC: The Pets.com Phenomenon (youtu.be/NHu_PFKIJxw)
- 2024, retrospective: Company Man: Pets.com: The Rapid Rise and Fall (youtu.be/-WGjMaeOkVg)

**Webvan**

- 1999, commercial: Manifesto, a one-minute Webvan commercial (youtu.be/gOw5i1PJ3vs)
- 2000, commercial: The line (youtu.be/hlYAR2UY9eU)
- 2001, commercial: A Webvan commercial from the final weeks (youtu.be/Jjue_uM5kH8)
- 2010, film: Inside a Webvan distribution center (youtu.be/os66TTScS1o)
- 2001, news: TechTV news: Webvan and the Nasdaq’s $1 rule (archive.org/details/g4tv.com-video2458)
- 2001, news: TechTV news: Webvan sells off assets (archive.org/details/g4tv.com-video3079)
- 2021, retrospective: Bit of Business: The Collapse of Webvan (youtu.be/FYbyC4-9pOk)

**RadioShack**

- 2014, commercial: The ’80s called, the Super Bowl XLVIII spot (youtu.be/YpkixVDFpcI)
- 1978, commercial: Radio Shack introduces the TRS-80 (youtu.be/gas3RFpjP_8)
- 1995, commercial: You’ve got questions. We’ve got answers.: cellular phones (youtu.be/rTvS2NavAYE)
- 1991, documentary: Computer Chronicles: Tandy / Radio Shack Computers (archive.org/details/episode_921)
- 2015, news: CNBC: RadioShack Files for Chapter 11 Bankruptcy (youtu.be/gxo_zdc8sAY)
- 2015, news: The Dallas Morning News: RadioShack declares bankruptcy (youtu.be/brABo4GaQvE)
- 2017, retrospective: Company Man: The Decline of RadioShack...What Happened? (youtu.be/JFivtOmXPPM)

**Circuit City**

- 1990, commercial: Where Service Is State of the Art, 60-second spot (youtu.be/xUgNff4ps_0)
- 1993, commercial: Circuit City commercial, 1993 (youtu.be/WbvukTApM_k)
- 1999, commercial: Circuit City Divx commercial (youtu.be/4wHm2pFAhXc)
- 2009, commercial: The going-out-of-business commercial (youtu.be/5ix1IJSJA1g)
- 2009, news: KXLY 4 News: Circuit City closing all stores (youtu.be/FbiTrReIHKo)
- 2022, retrospective: Company Man: The Decline of Circuit City...What Happened? (youtu.be/l2BuRy3e_xU)

**Toys “R” Us**

- 1983, commercial: I’m a Toys R Us Kid (youtu.be/_KjbL0cnQPE)
- 1990, commercial: I Don’t Wanna Grow Up (youtu.be/mBUL4a45c3M)
- 2001, commercial: Times Square flagship commercial (youtu.be/7HEKjKlswPA)
- 2017, news: CNBC: Bankruptcy Is ‘Balance Sheet Issue, Not Business Iss (youtu.be/OjVJpYdXB68)
- 2018, news: PIX11: workers rally for severance in New Jersey (youtu.be/9PrbxST_0fw)
- 2018, news: KRIS 6: End of an era (youtu.be/jrkLSy_CrKQ)
- 2018, retrospective: CNBC: The Rise And Fall Of Toys R Us (youtu.be/7Actdg5JcM8)
- 2019, documentary: The Wall Street Journal: How Toys ‘R’ Us Went Bankrupt (youtu.be/W9CxiNsX0zs)

**KB Toys**

- 1985, commercial: Kay-Bee Toy Stores holiday commercial (youtu.be/WelD5pCFeKU)
- 1999, commercial: Five KBkids.com holiday commercials (youtu.be/xWRBBdS9-e4)
- 2008, interview: A talk with Howard Kaufman (youtu.be/6-EDo5SNhCQ)
- 2008, news: Associated Press: Money Minute: KB Toys, Lehman, Taxes (youtu.be/ueSnqb7lsJg)
- 2018, news: CBS Philadelphia: KB Toys Plans To Make Comeback After Toy (youtu.be/wlSq2C3vSYc)
- 2021, retrospective: Company Man: The Decline of KB Toys...What Happened? (youtu.be/kP9w6O3M5HQ)

**Kiddie City**

- 1983, commercial: Lionel Playworld: Turn that frown upside down (youtu.be/kCmqhqo8wYE)
- 1978, commercial: Lionel Playworld holiday commercial (youtu.be/0h9uk11nWNo)
- 1984, commercial: Kiddie City commercial, November 1984 (youtu.be/HUzqGlIhueA)
- 1987, commercial: Lionel Playworld commercial (youtu.be/pzhdRhF_BiY)
- 1988, commercial: Lionel Kiddie City Christmas ad (youtu.be/23v0l41KshM)
- 2015, retrospective: Lionel Kiddie City Toy Store Memories (youtu.be/lP021BQYH_c)

**Groupon**

- 2011, commercial: Save the Money: Tibet, the Super Bowl XLV spot (youtu.be/vVkFT2yjk0A)
- 2011, news: Radio Free Asia: Super Bowl Stirs Tibet Backlash (youtu.be/hDnRDv9RQVs)
- 2010, interview: Andrew Mason at DEMO Fall 2010 (youtu.be/vIPk4M3rRag)
- 2011, news: The New York Times DealBook: In Groupon I.P.O., Echo of Te (youtu.be/SOqOJU8-aCs)
- 2018, commercial: Who Wouldn’t, the 2018 Super Bowl spot with Tiffany Haddis (youtu.be/2-Pcloghy5Y)
- 2023, retrospective: Company Man: The Decline of Groupon...What Happened? (youtu.be/WlBuTnwGfck)

**AOL**

- 1995, commercial: A Friend Said Try AOL (youtu.be/u6pS5qrrhOM)
- 1997, commercial: Steve Case: working day and night to fix the problem (youtu.be/vdp9MJczP5w)
- 1999, commercial: So easy to use, no wonder it’s number one (youtu.be/oQ4SmwNCwwE)
- 2000, news: CNN on the AOL and Time Warner merger (youtu.be/wMlf1Y74L48)
- 2012, interview: You’ve Got Mail with Elwood Edwards (youtu.be/yKgiqsdyiAA)
- 2019, retrospective: CNBC: The Rise and Fall of AOL (youtu.be/jCQCWA-e6gI)
- 2025, news: BBC News: AOL ends dial-up service (youtu.be/CPSBJdAG8_s)

**Zima**

- 1994, commercial: Zomething different, the launch commercial (youtu.be/t_uxyXekDjo)
- 1993, commercial: Zima Clearmalt commercial from the regional rollout (youtu.be/SbvKGdFlSQ0)
- 1995, commercial: Zomething in common (youtu.be/tXfqieTMtGk)
- 1995, commercial: Zima Gold commercial (youtu.be/ij51h37PUQU)
- 2017, news: TMJ4 News: MillerCoors plans to bring back Zima (youtu.be/_oMEYzoArgw)
- 2022, retrospective: Weird History Food: Zima Was Popular in the 90s, Until Peo (youtu.be/VBYimQrnOGY)

**Crystal Pepsi**

- 1993, commercial: The one-minute Right Now launch ad (youtu.be/KPvyq_KmXhc)
- 1992, news: CBS News on the clear cola test (youtu.be/BGPyYG5SG8A)
- 1992, documentary: Crystal Pepsi employee training video (youtu.be/JJYsS82khTc)
- 1993, film: Saturday Night Live: Crystal Gravy (youtu.be/g0sjRG34DlA)
- 1993, commercial: Coca-Cola’s Tab Clear commercial (youtu.be/hYpyKelIOAI)
- 2015, event: L.A. Beast: Crystal Pepsi Is Back Baby! (youtu.be/3-ynjaF6JRg)
- 2021, interview: David Novak on Crystal Pepsi (Yahoo Finance) (youtu.be/QjuUpXuNPo4)

**Sega Dreamcast**

- 1999, commercial: Apocalypse, the 9/9/99 launch commercial (youtu.be/yvyofEPGwE0)
- 1999, commercial: The It’s Thinking commercials, 1999–2000 (youtu.be/JL5-sx2A0-M)
- 1999, news: KATU News: the Dreamcast launch (youtu.be/gT9gseRFzqA)
- 2000, commercial: SegaNet commercial (youtu.be/BTs2i9PrIoc)
- 2001, news: AP: Japan: Sega announces future of Dreamcast (youtu.be/8WTxxmuk0PU)
- 2015, retrospective: IGN: The Rise and Fall of the Sega Dreamcast (youtu.be/g7o96FD5lRo)

**Atari**

- 1978, commercial: Atari Video Computer System commercial (youtu.be/ePPJaC0h1RQ)
- 1982, commercial: Pac-Man for the Atari 2600 (youtu.be/1FHkMqHx5xM)
- 1982, commercial: Berzerk: Have you played Atari today? (youtu.be/KyyKYXq215o)
- 1982, commercial: E.T. the Extra-Terrestrial for the Atari 2600 (youtu.be/52UJWA-_6Jw)
- 1984, news: CBS 8 San Diego special report on the video game slump (youtu.be/bcyjjK1Hhnk)
- 2014, news: KRQE: cartridges found at the Atari dig (youtu.be/9NwKtKUhhm4)
- 1994, commercial: Atari Jaguar: Do the Math (youtu.be/mlRWqqWay7c)

**Blockbuster**

- 1994, commercial: Make it a Blockbuster Night (youtu.be/McUmL8HidSA)
- 2002, commercial: Carl and Ray: seven spots (youtu.be/gpiunE_x6Rc)
- 2005, commercial: No more late fees (youtu.be/h9VAqC65_Tw)
- 2007, commercial: Blockbuster Total Access (youtu.be/X0WBEnr8l9E)
- 2009, news: Associated Press: Blockbuster May Close Over 900 US Stores (youtu.be/m3txyPqnbcw)
- 2013, news: The Wall Street Journal: Blockbuster Closes Remaining Stor (youtu.be/vWz0CrS75Ww)
- 2018, news: CBS Mornings: Visiting America’s last Blockbuster store (youtu.be/QAdRzpcdCbs)

**Quibi**

- 2020, commercial: Bank Heist, the Super Bowl LIV spot (youtu.be/cBlKObT5dv0)
- 2020, event: The Quibi keynote at CES 2020 (youtu.be/F8uW12uKoDQ)
- 2019, interview: CNBC: Whitman and Katzenberg explain Quibi, a year early (youtu.be/sjP8G1Rdg20)
- 2020, interview: CNBC: Shutting down operations was most honorable choice f (youtu.be/2EjrShc3eug)
- 2020, news: Good Morning America: Billion dollar short form streaming  (youtu.be/tEfx_MxEXq4)
- 2020, retrospective: Ordinary Things: The Dumpster Fire Failure of Quibi (youtu.be/WZ4lR0G3ytE)

**Howard Johnson’s**

- 1962, commercial: Howard Johnson’s television commercial (youtu.be/EBNUUeHNkDI)
- 1970, commercial: Animated commercial for children’s parties (youtu.be/eoB7xxrUkPs)
- 2015, news: CBS Sunday Morning: The last Howard Johnson’s restaurant (youtu.be/BdyTO6V4fuM)
- 2017, news: BBC News: The last Howard Johnson’s (youtu.be/l0FStYXDtqo)
- 2022, news: WNYT: Last Howard Johnson’s restaurant in America closes (youtu.be/J1ktoIkRFz0)
- 2021, interview: A history of Howard Johnson’s, with Anthony Sammarco (youtu.be/JGTec1bDWfM)

**Burger Chef**

- 1970, commercial: We Always Treat You Right (youtu.be/P29Z9At4g3c)
- 1974, commercial: Burger Chef and Jeff (youtu.be/fFrS4YIOnv4)
- 1978, commercial: Star Wars Fun Meals (youtu.be/YFUOkES9A48)
- 1980, commercial: A 1980 spot (youtu.be/zAuhmkHWk60)
- 2018, retrospective: Indiana Historical Bureau: Hoosier Fast-Food Pioneer (youtu.be/ReoW7dbXpuc)
- 2018, news: WTHR: Burger Chef case 40 years later (youtu.be/84AQnQJHWgo)
- 2021, retrospective: Recollection Road: Burger Chef (youtu.be/vBpwKZ_G0J8)

## 6. Infographics per brand

| Brand | Blocks |
|---|---|
| Pets.com | chain, compare, arc, scale, flow, multiples, cause waffle (auto) |
| Webvan | chain, scale, compare, flow, arc, bars, multiples, cause waffle (auto) |
| RadioShack | chain, compare, arc, scale, bars, flow, multiples, cause waffle (auto) |
| Circuit City | chain, bars, compare, arc, waffle, flow, counters, scale, multiples, cause waffle (auto) |
| Toys “R” Us | chain, compare, arc, flow, scale, counters, bars, multiples, cause waffle (auto) |
| KB Toys | chain, compare, arc, counters, flow, bars ×2, waffle, multiples, cause waffle (auto) |
| Kiddie City | chain, compare, arc, flow, counters, multiples, bars ×2, scale, cause waffle (auto) |
| Groupon | chain, compare, arc, flow, waffle, scale, counters, multiples, cause waffle (auto) |
| AOL | chain, compare, arc, counters, flow, scale, bars, multiples, cause waffle (auto) |
| Zima | chain, counters, compare, bars ×2, arc, waffle, scale, multiples, cause waffle (auto) |
| Crystal Pepsi | chain, counters ×2, scale, arc, bars, multiples, cause waffle (auto) |
| Sega Dreamcast | chain, compare, counters ×2, arc, waffle, flow, bars, multiples, scale, cause waffle (auto) |
| Atari | chain, counters ×2, scale, compare, bars, arc ×2, flow, multiples, cause waffle (auto) |
| Blockbuster | chain, compare, arc, counters, scale, bars, multiples, cause waffle (auto) |
| Quibi | chain, compare, scale, flow, counters, bars, arc, multiples, cause waffle (auto) |
| Howard Johnson’s | chain, compare, arc, flow, scale, multiples, bars, cause waffle (auto) |
| Burger Chef | chain, compare, counters, arc, bars, scale, multiples, cause waffle (auto) |

## 7. Categories

| Category | Brands |
|---|---|
| Dot-com & internet | Pets.com, Webvan, Groupon, AOL |
| Electronics retail | RadioShack, Circuit City |
| Toy stores | Toys “R” Us, KB Toys, Kiddie City |
| Food & drink | Zima, Crystal Pepsi |
| Video games | Sega Dreamcast, Atari |
| Film & home video | Blockbuster, Quibi |
| Restaurants | Howard Johnson’s, Burger Chef |

Decisions: Circuit City was placed with RadioShack in Electronics retail so that category has two brands,
which left the three toy chains as their own "Toy stores" category (the brief's "Retail"). The old
"Retail & consumer" category was split accordingly.

## 8. Tier decisions worth a second look

- **Groupon (Ghost).** It is still an operating, listed company. It was included as a ghost at the owner's
  request; the page says plainly that it is not defunct and gives the sourced fall from the peak. `died` is
  2020 (Goods exit, reverse split), explained in an editorial data note.
- **AOL (Ghost).** Still a portal and mail service, now under Bending Spoons. `died` is 2025, the end of dial-up.
- **Circuit City (Ghost, not Dead as expected).** circuitcity.com loaded as a working store under a new
  owner on 2026-10-03. No physical stores were found. If the site goes dark this should become Dead.
- **KB Toys (Ghost).** A licensed online collectibles shop uses the name; the licence claim is the shop's own.
- **Zima and Crystal Pepsi (Ghost).** Discontinued, then limited re-releases; Zima is sold in Japan again.
- **Webvan (Dead).** Amazon ran webvan.com until at least 2016; the domain is now parked and loads no site.
- **Burger Chef, Kiddie City, Quibi, Dreamcast, Pets.com (Dead).** Nothing operates under the name. For
  Dreamcast the page is explicit that the console and Sega's hardware line died, not Sega.

## 9. Data gaps, skipped items and things a human should check

Each page lists its own derived figures, estimates, conflicts and unknowns under Sources → Data notes. The
ones that matter most:

- **Kiddie City** has no real images: no freely licensed photo exists and there was never a website. The
  gallery is original drawings, and says so. Two UPI articles were read only through a text extractor;
  their figures and one quote should be checked by a person. Sources disagree on store counts and rank.
- **Crystal Pepsi**: PepsiCo never published sales for the brand. The widely repeated "$474M / 1% share" is
  labelled unverified as a first-year sales figure; the rise-and-fall chart is a derived index and says so.
- **Zima**: Coors never published 1994 volume; 1.3M barrels is the brand manager's figure via the press.
- **Quibi**: private company, so most figures are press-reported or Sensor Tower estimates, labelled as such.
- **Burger Chef, Howard Johnson’s**: pre-EDGAR; unit counts are ranges from retrospectives. The New York
  Times archive was unreachable for Howard Johnson’s.
- **Atari**: no annual revenue series for 1977–84 could be sourced, so the main arc is Warner's share price.
- **Dreamcast**: lifetime sales are given as Sega's own 8.20M with the conflicting figures labelled.
- **Blockbuster**: the "$800M of late fees in 2000" figure is unverified; the last filing figure found is
  $692.6M for 1999. The $50M Netflix offer is Marc Randolph's account.
- **AOL**: a few lines are general knowledge without a citation (the running-man logo, MSN and Prodigy as
  competitors); three quote attributions were not re-checked against the source page.
- **Webvan**: the 10-K reports 28.75M IPO shares ($431.3M gross) while the original page text uses 25M
  shares and $375M. The existing text was kept and the difference is flagged in a data note; it should be reconciled.
- **Commercial air dates** often come only from the uploader; captions say so.
- **Maps**: only Pets.com, Webvan, RadioShack and Howard Johnson’s have one. The others had no sourced
  store-level geography, or geography is not the story.
- **Old website module** is absent for Kiddie City, Burger Chef and Howard Johnson’s (pre-web) and for
  Crystal Pepsi (no usable capture).
- **Source links**: 674 cited URLs were fetched by script. 572 returned 200, 100 refused automated requests
  (mostly sec.gov without a registered contact, and news sites) and 2 did not load: a USA Today 2009 page
  (RadioShack source 23; no Wayback copy found) and a Democrat and Chronicle page that is behind a paywall
  (Kiddie City source 28). Four dead CNN Money and MarketWatch links were repointed to Wayback copies.
  The list is in `docs/qa/sources.json`.
- **Brands not added**: THQ, Midway, Hollywood Video, MoviePass, Sambo's, Kenny Rogers Roasters, and the
  optional categories (social networks, airlines, cars, mobile). Every category has two brands; none has a
  third beyond toy stores and dot-com. This was a scope decision, not a sourcing failure.

## 10. QA results (final run)

| Check | Result |
|---|---|
| `npm run check` | passed: 27 HTML files, 7,317 internal references, 0 broken links or anchors; 26 pages at 375 and 1280 with 0 console errors, 0 failed requests, 0 broken images, 0 horizontal scroll; keyboard, search, reduced-motion, video-facade and no-JavaScript tests pass |
| `node scripts/verify-media.mjs` | 111 videos, 0 failed |
| Lighthouse mobile, 26 pages | Performance 90–99 (lowest: AOL 90, Circuit City 92), Accessibility 100, Best Practices 100, SEO 100, CLS 0 on every page. Run against the local server with gzip; results in `docs/qa/lighthouse.json` |
| Screenshots | 104 full-page captures (26 pages × 375 / 768 / 1280 / 1440) in `docs/qa/`, stored at reduced scale |
| Automated layout report | `docs/qa/report.json`: on all 104, horizontal overflow 0, empty chapter visuals 0, empty boxes 0, elements past the viewport 0, background `rgb(252, 251, 248)` |
| Manual review | Contact sheets of Pets.com, RadioShack, KB Toys and Howard Johnson’s (1280), Pets.com and Quibi (375) and the homepage (1280, 375) were looked at for blank halves, overlap and tan. The remaining pages were covered by the automated report only, not by eye. |

Not done, or not verifiable from this box:

- **Not pushed, not deployed.** The Vercel deployment could not be confirmed. After pushing, check that the
  deployment is READY and that the live site matches; `vercel.json` now sets an `installCommand` that skips
  `npm install`, which is the one build-pipeline change.
- Lighthouse was run locally, not against the Vercel URL.
- Video playback was confirmed by endpoint for all 111 and by an actual click for one.
- No screen-reader pass was done; accessibility was checked with Lighthouse/axe rules and keyboard tests.

## 11. Remaining TODOs

1. Push, confirm the Vercel deployment, run `npm run lighthouse` against production numbers if wanted.
2. Follow-up design pass with the Mobbin and 21st.dev MCPs (list in DESIGN_RESEARCH.md section 6).
3. Reconcile the Webvan IPO figures; have a person check the items in section 9.
4. Register a real contact address for SEC EDGAR requests. Research in this run used the User-Agent
   "Spectre Brands research contact@spectrebrands.com"; that mailbox may not exist yet.
5. A third brand per category (THQ or Midway, Hollywood Video or MoviePass, Sambo's or Kenny Rogers Roasters)
   and the optional categories.
6. Maps for Circuit City, Blockbuster and Toys “R” Us if store-level data can be sourced.
7. `docs/qa/` (36 MB) and `docs/audit/before/` (17 MB) are screenshots; move them out of the repository if
   its size matters.
8. Re-run `npm run media` and `npm run sources` periodically; video uploads and news URLs rot.

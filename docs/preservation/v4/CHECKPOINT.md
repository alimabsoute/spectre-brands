# Checkpoint: Spectre v4, paused

## Resume point

The latest local source is v4 on `backup/spectre-v4-paused-2026-10-13`, in the existing `alimabsoute/spectre-brands` repository. The repository is public; its owner and the authenticated GitHub user are `alimabsoute`. Push permission was verified on 2026-10-13 UTC. This checkpoint preserves the work for a later session. Design work is paused.

The source parent is `2f066ae5047159a385584646bd9b975583eff4a0` on `v2-pilot`. The live remote still matched that SHA during preflight. Remote `main` was `b55221ef211ef9f697191cc3e1578f33652b1722`. Neither existing branch is changed by this backup. Resolve this backup branch's current commit with `git rev-parse HEAD`; the exact pushed commit is recorded in the private project notes and the final preservation receipt.

Vercel's connected integration previously created previews from `v2-pilot` pushes. This branch adds only a branch-specific `git.deploymentEnabled` rule set to false. Other configuration values and other branches retain their prior behavior. No deployment command is part of restoration. See [Vercel's Git configuration](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled).

## What changed

The three routes are `/blockbuster/`, `/pets-com/` and `/orbitz-drink/`. v4 contains the distinct cinematic, website/journey and product/archive openings; concise summaries and native detail disclosures; the Blockbuster CRT and complete cited transcript; the original lower charts and archive provenance; and the disabled double-opt-in email-updates implementation. The 35.7-second 720p runtime film and chapter stills are included so a fresh local build can render the current opening.

The implementation files are in `lib/`, `assets/css/`, `assets/js/`, `backend/`, `build.mjs`, `tests/` and the source/review scripts. Private connector helpers and workflow context are excluded. `source-manifest.json` enumerates the preserved changes, sizes and SHA-256 hashes. It records both captured working-copy bytes and normalized Git blob bytes; line endings can differ by checkout platform. `public-evidence-manifest.json` enumerates the copied technical documentation and selected actual article screenshots. Public evidence copies omit private delivery IDs and replace machine-specific document paths with aliases. Original local documentation remains intact. Vendored license/source whitespace is preserved rather than edited during a backup.

## Versions and validation

| Version | Preservation | Status and evidence |
|---|---|---|
| Production history | Existing `main`, observed at `b55221ef211ef9f697191cc3e1578f33652b1722` | Existing production lineage; not redesigned or redeployed here. |
| Original v2 pilot | Existing `v2-pilot`, `2f066ae5047159a385584646bd9b975583eff4a0` | Original parent, with interactive graphs and the earlier hero. |
| First compact-hero pass | `archive/spectre-versions/first-pass-2026-10-12/` overlay on the source parent | Historical build, 11 v2 tests, responsive/no-JS/contrast and content preservation evidence. A separate restoration test was not run in this preservation task. |
| v3 A/B/C CRT experiments | `archive/spectre-versions/tv-v3-2026-10-12/` source overlay | Three experimental treatments and their generator/vendor source. Historical browser/HyperFrames evidence preserved. User preferred a different film direction; do not use v3 as the latest design. |
| Integrated v4 | This backup branch | Latest locally hardened source. Fresh 37 unit tests and original-content checks accompany this checkpoint. Previous full build, browser and playback evidence is retained, with its original date. The fresh build retry stalled before page generation and was stopped; it is not a pass. No live email or deployment verification is claimed. |

The previous v4 validation covered 69 generated pages, 53,400 internal references, the repository smoke suite on 68 pages at two widths, 18 focused route/width cases plus three enlarged-text cases, no-JS/reduced motion, signup validation/timing/dismissal and four email renders. The full and compact review files passed 14 and 17 offline cases respectively. These are historical observations from the completed design work, not newly run browser checks in this preservation task.

The master and web film completed playback with 1,071 decoded frames each. Master: seven dropped, no error; web desktop/mobile: four/two dropped, stable captions, CLS 0 / 0.000022. Final software-rendered HyperFrames checks had no findings at three positions. A hardware readiness run stalled and was stopped. The earlier nine-position check predates final audio-schema polish.

## Large assets and private material

`local-only-assets.json` records the high-quality master, raw source films, generated recordings and large portable review files by path alias, size and hash. Those files are not in this Git backup. Existing local copies were left in place; a manifest is not a media backup. New Downloads, Library, release-asset or other media uploads need separate authorization.

The optimized runtime MP4 is 7,852,529 bytes and is included in Git. The 1080p master is 30,339,232 bytes and remains outside Git. Its hash is `f6f9539b98ff15f08078929e461ef5e3a4b99142ca132c8d69022d9146a4c023`. The web encode hash is `502de8e46f86f2b8d8461967bf6fb7dc7353095d7486a50953ce555a3ae757e8`. The four original twenty-second source films and separate fifth game are listed in the manifest. Full-quality review bundles, source recordings, private delivery metadata, account configuration, raw workflow logs, dependencies and build caches are excluded.

The editable film EDL, source hashes, generator and chapter stills are preserved. Remastering still requires the original source films and FFmpeg; building and viewing the current site does not. Missing source films must be reported rather than replaced with unrelated footage. Do not delete original media or treat excluded files as disposable.

## Risks and unknowns

The email backend remains disabled. The intended sender/domain, existing Resend connection, appropriate mailing address, live D1 instance and inbox delivery have not been verified. Tests use synthetic addresses, a mock mailer and local SQLite. No credentials, real subscriber data, account/password features or live configuration were added. Safari/Firefox, screen-reader speech and audio listening quality were not tested.

Private local paths for the original media and project notes are retained outside this public repository. Public history notes describe their original authoring stage; claims such as an initial test not yet run should be read alongside the completed validation in this checkpoint.

## Restore the current v4 locally

Use a new destination directory to avoid overwriting another checkout:

```powershell
git clone --branch backup/spectre-v4-paused-2026-10-13 --single-branch https://github.com/alimabsoute/spectre-brands.git spectre-v4-restored
Set-Location spectre-v4-restored
git rev-parse HEAD
npm ci
node --test tests/v2.test.mjs tests/updates.test.mjs
npm run build
npm run dev
```

Node 22 was used for the local SQLite tests. The site build itself has no install-time framework dependency. Open the three pilot routes locally. Keep the backup deployment guard and disabled email configuration until a separate request authorizes further work or publication.

For a film remaster, place the original sources in an approved local directory, verify them against `docs/design-review-v4/source-hashes.json`, then run the preserved generator with explicit paths:

```powershell
node scripts/build-opening.mjs --src "<approved source-film directory>" --ffmpeg "<installed ffmpeg executable>"
```

## Restore an older source overlay

Clone the backup into a separate directory first. Use its manifest to copy an overlay into a separate worktree created from the original parent. Do not overlay it onto current v4. The overlay manifests enumerate exactly which paths belong to each older version; unchanged files come from the original parent. The v3 source generator expects its original `docs/design-review-v3/` paths after restoration.

```powershell
git worktree add ../spectre-first-pass-restored 2f066ae5047159a385584646bd9b975583eff4a0
```

Copy the first-pass overlay's manifest-listed paths into that new worktree. For v3 experiments, use a separate destination and the v3 manifest. Neither archived experiment is a request to resume design work.

## Pending external actions

No design or deployment action is pending as part of this checkpoint. Higher-quality media still requires a separately approved off-device backup. The remote push and Obsidian verification receipts are recorded after the commit; no release, force push, deletion, new repository or new artifact upload is part of this preservation task.

# Research log (ledger)

Every NEW fact on a page enters through `research/<slug>/claims.jsonl`, one JSON object per line.
Existing (legacy) claims stay frozen by `scripts/facts.mjs`; legacy claims promoted into the key-facts box or JSON-LD are logged here too with `"legacy": true` and their existing footnote number.

Fields:
- `id` (e.g. `bb-012`), `slug`, `claim` (plain sentence), `value` (the figure/date/name as displayed)
- `kind`: number | date | name | ownership | quote | event | geo | price
- `source`: { title, publisher, date, url, archive_url, type: primary|secondary, authority: filing|court|company|press|book|dataset|archive-capture }
- `quote`: verbatim passage from the source supporting the claim (must appear in the snapshot)
- `locator`: page / section / paragraph / table row
- `snapshot`: path relative to `/workspace/spectre-research/` of the stored text copy (outside git)
- `sha256`: hash of that snapshot file
- `author`: model that proposed it; `accessed`: ISO date
- `status`: proposed | verified | rejected; `verifier` (must be another vendor than `author`), `verified_at`, `verifier_note`
- `use`: where it renders, e.g. `["factFile.peak","viz.stock","prose.story.3","whereNow.0"]`
- `legacy`: true when it re-checks an existing footnoted claim; `fn`: that footnote number

Rules: no entry without an opened source and verbatim quote; a quote not found in its snapshot fails `scripts/ledger-check.mjs`; only `verified` entries may render; syndicated copies count once; gaps are logged as `kind: "gap"` with `status: "closed-unavailable"`.

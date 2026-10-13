# Changed files

This checkout includes the earlier authorized hero/citation work and the integrated v4. `changed-files.json` is the exact final inventory of tracked changes and non-ignored untracked files. Generated build outputs are ignored; private Claude logs, Library metadata and account configuration live outside the repo and are excluded.

## Integrated v4 source

- `lib/film.mjs`: reusable film metadata, concise cues/full cited transcript and CRT/player markup.
- `lib/updates.mjs`: shared forms, states and branded HTML/plain-text emails.
- `lib/sections.mjs`: three opener patterns, original art description disclosures, bottom Archive placement.
- `lib/sitetheme.mjs`, `build.mjs`: shared film/signup asset wiring and mid-article placement.
- `assets/css/hero-v2.css`: brand type and compositions, illustration credit disclosure, scoped enlarged-text masthead/footer/heading repairs.
- `assets/css/film.css`, `assets/js/film.js`: responsive CRT, explicit playback, sound, chapter/keyboard seek, no-JS and reduced-motion stills.
- `assets/css/updates.css`, `assets/js/updates.js`: compact top disclosure, form states and engagement/dismissal behavior; finite confirmed celebration.
- `assets/css/v2.css`: narrow responsive scrolly/container repair; data and animation preserved.
- `backend/updates-worker.mjs`, `backend/updates-schema.sql`, `backend/updates-config.example.json`: disabled local integration seam, opt-in lifecycle, queued/idempotent sends, validation/rate limits; examples not applied.
- `tests/updates.test.mjs`: 26 meaningful email-list tests, including local SQLite store and no live email.
- `scripts/build-opening.mjs`: verified source copies, EDL/HyperFrames generator, master/web encodes and chapter stills.
- `scripts/updates-email-preview.mjs`: clearly synthetic email/form/state previews.
- `scripts/review-http.mjs`, `scripts/v4-capture.mjs`, `scripts/v4-qa.mjs`, `scripts/master-playback.mjs`, `scripts/v4-review.mjs`, `scripts/v4-review-qa.mjs`: local render/interaction evidence and portable report. Diagnostic scripts and completed Claude briefs are included in the exact inventory.
- `assets/media/blockbuster-opening-v4.mp4`, `assets/media/blockbuster-opening-v4-web.mp4`, `assets/media/blockbuster-opening-v4/`: generated film and stills.
- `docs/design-review-v4/`: film source/EDL, reserved fifth film, source hashes, synthetic email previews, tests, screenshots, audit, sanitized model evidence and portable review.

Earlier hero/citation changes are documented in `docs/hero-review/CHANGED_FILES.md`. Original company/section strings are preserved apart from existing word-link markup, as verified by the prose guard. Original pictures and custom drawings are unchanged. No source film was edited in place.

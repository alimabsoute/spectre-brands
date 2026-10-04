#!/bin/sh
# Verify one finished brand and commit it. Usage: scripts/ship.sh <slug> "<Name>" "<tier/category note>"
# Builds the brands already in git plus this one, checks its videos, generates its OpenGraph image,
# runs the link and browser checks, then commits only that brand's folder and its og image.
set -e
slug="$1"; name="$2"; note="$3"
done_list=$(git ls-files 'companies/*/company.json' | cut -d/ -f2 | grep -v '^_' | tr '\n' ',')"$slug"
node scripts/img.mjs --fallbacks "companies/$slug/img" >/dev/null 2>&1 || true
node scripts/verify-media.mjs "$slug" | tail -1
node scripts/og.mjs "$slug" >/dev/null
node scripts/check.mjs --only "$done_list" > /tmp/check-$slug.log 2>&1 || { tail -25 /tmp/check-$slug.log; exit 1; }
grep -E "^$slug |warning: $slug" /tmp/check-$slug.log || true
git add "companies/$slug" "og/$slug.png"
git commit -qm "Add $name post-mortem ($note)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline | head -1

#!/usr/bin/env bash
# Pilot gate; FACTS_FLAGS can select the strict legacy or relaxed guard.
set -euo pipefail; cd "$(dirname "$0")/.."
node scripts/ledger-check.mjs
node build.mjs > /tmp/gate-build.log 2>&1 || { tail -20 /tmp/gate-build.log; echo "gate: build failed"; exit 1; }
node scripts/check-citations.mjs
node scripts/facts.mjs ${FACTS_FLAGS---additive}
node scripts/slop-lint.mjs --strict --quiet > /tmp/gate-lint.log || { cat /tmp/gate-lint.log; echo "gate: lint errors"; exit 1; }
head -1 /tmp/gate-lint.log
[ "${FAST:-}" = 1 ] || node scripts/check.mjs > /tmp/gate-check.log 2>&1 || { grep -E "✗" /tmp/gate-check.log | head; echo "gate: check failed"; exit 1; }
echo "gate: passed"

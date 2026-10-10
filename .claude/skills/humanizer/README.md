# Spectre/Ali Writing Rules (canonical)

This folder is the single source of truth for the anti-AI-slop and humanizer rules that Claude Code and Codex apply to all prose, in every project. Edit only the files here. Then run `./sync.sh`, which copies them to:

| Target | What |
|---|---|
| `~/.claude/skills/humanizer/` | Claude Code user-level skill (`SKILL.md` and the rule files) |
| `~/.claude/CLAUDE.md` | A managed block telling Claude Code to apply the rules to all prose |
| `~/.codex/skills/humanizer/` | Codex skill (same files) |
| `~/.codex/AGENTS.md` | A managed block for Codex |
| `<repo>/docs/writing-rules/`, `<repo>/.claude/skills/humanizer/`, `<repo>/CLAUDE.md`, `<repo>/AGENTS.md`, `<repo>/scripts/slop-lint.mjs` | Project copies (default repo: `/workspace/spectre-brands`; pass other repo paths as arguments) |

The managed blocks sit between `<!-- BEGIN writing-rules … -->` and `<!-- END writing-rules -->`. Anything else in those files is left alone.

## Files
- `RULES.md` is the full ruleset: tiers, structural tells, repetition, punctuation, factual integrity, the finishing procedure and examples.
- `QUICK.md` is the compact always-on block that gets embedded into `CLAUDE.md` and `AGENTS.md`.
- `VOICE-SPECTRE.md` is the house voice for spectrebrands.com.
- `SOURCES.md` lists the research behind the rules, with URLs and why each is credible.
- `slop-lint.mjs` is the linter (zero dependencies). Run `node slop-lint.mjs --help-ish`; the header comment documents the flags. `--selftest` checks it against `tests/`.
- `CHANGELOG.md` records rule versions.
- `SKILL.template.md` is the skill wrapper; `sync.sh` fills in the QUICK block.

## Updating the rules (Stage 4 of the plan)
1. Add the new pattern to `RULES.md`, with an example. If it can be checked mechanically, add it to `slop-lint.mjs` and to `tests/bad.md`.
2. Run `node slop-lint.mjs --selftest`, then `./sync.sh`.
3. Note it in `CHANGELOG.md` and commit the repo copy (`docs/writing-rules/`).

This folder is a local git repo (`git log` shows the version history).

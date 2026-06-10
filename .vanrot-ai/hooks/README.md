# Vanrot Hooks

This directory is the versioned source for Vanrot AI/workflow hooks.

Local `.git/hooks/*` files should be tiny delegates into this directory. That keeps hook logic reviewable and shared between Codex and Claude workflows.

## Current Hooks

- `pre-commit.sh` — staged-file based verification for component cascade, site docs, web-types, phase docs, and `.vanrot-ai` workflow hygiene.

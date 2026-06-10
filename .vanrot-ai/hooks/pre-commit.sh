#!/bin/sh
set -eu

if [ "${VANROT_SKIP_PHASE_HOOK:-}" = "1" ]; then
  exit 0
fi

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root"

staged_files="$(git diff --cached --name-only)"

if [ -z "$staged_files" ]; then
  exit 0
fi

has_staged_match() {
  printf '%s\n' "$staged_files" | grep -Eq "$1"
}

if [ "${VANROT_SKIP_COMPONENT_CASCADE:-}" != "1" ]; then
  if has_staged_match '^(apps/vanrot-site/src/|packages/|examples/|web-types\.json|apps/vanrot-site/web-types\.json|scripts/verify-component-cascade)'; then
    node scripts/verify-component-cascade.mjs --staged
  fi
fi

if has_staged_match '^(apps/vanrot-site/src/pages/docs/|apps/vanrot-site/src/docs/docs-page-tree\.ts|apps/vanrot-site/src/docs/site-data\.ts|apps/vanrot-site/src/docs/site-navigation\.ts|apps/vanrot-site/src/routes\.ts|scripts/migrate-docs-to-page-components\.mjs|scripts/verify-site-docs\.mjs|scripts/verify-site-docs\.test\.mjs)'; then
  node scripts/verify-site-docs.mjs
  pnpm exec vitest run scripts/verify-web-types-coverage.test.mjs
fi

if has_staged_match '^(docs/superpowers/feature-maturity\.md|docs/superpowers/future-pipeline\.md|docs/vanrot-presentation\.html)$' || has_staged_match '^docs/superpowers/plans/.*\.md$'; then
  node scripts/verify-phase-docs.mjs
fi

if has_staged_match '^(AGENTS\.md|CLAUDE\.md|\.vanrot-ai/)'; then
  node .vanrot-ai/diagnostics/workflow-hygiene.mjs
fi

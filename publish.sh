#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COPIES_ROOT="$ROOT_DIR/.vanrot/release-dry-run/package-copies"
NPM_TAG="${NPM_TAG:-latest}"
NPM_AUTH_TYPE="${NPM_AUTH_TYPE:-web}"
PUBLISH_DRY_RUN="${PUBLISH_DRY_RUN:-0}"
SKIP_VERIFY="${SKIP_VERIFY:-0}"
SKIP_EXISTING="${SKIP_EXISTING:-1}"

PUBLISH_PACKAGES=(
  devtools
  config
  ai
  runtime
  behavior
  forms
  store
  formatters
  ui
  compiler
  router
  ssr
  testing
  language-server
  seo
  forge
  cli
  vite-plugin
)

say() {
  printf '\033[1;34m%s\033[0m\n' "$*"
}

fail() {
  printf '\033[1;31merror:\033[0m %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

package_field() {
  local package_dir="$1"
  local field="$2"

  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$package_dir/package.json', 'utf8'));
    if (typeof pkg['$field'] !== 'string' || pkg['$field'].length === 0) process.exit(1);
    console.log(pkg['$field']);
  "
}

require_command node
require_command npm
require_command pnpm

cd "$ROOT_DIR"

if [[ "$SKIP_VERIFY" != "1" ]]; then
  say "running pnpm verify"
  pnpm verify

  say "refreshing kept release artifacts"
  node scripts/verify-release-dry-run.mjs --keep
else
  say "skipping verify because SKIP_VERIFY=1"
fi

[[ -d "$COPIES_ROOT" ]] || fail "Missing release package copies. Run node scripts/verify-release-dry-run.mjs --keep first."

if [[ "$PUBLISH_DRY_RUN" != "1" ]]; then
  npm whoami >/dev/null 2>&1 || fail "npm is not logged in. Run npm login --auth-type=web first."
fi

published_count=0

for package_dirname in "${PUBLISH_PACKAGES[@]}"; do
  package_dir="$COPIES_ROOT/$package_dirname"
  [[ -f "$package_dir/package.json" ]] || fail "Missing package copy: $package_dir/package.json"

  package_name="$(package_field "$package_dir" name)"
  package_version="$(package_field "$package_dir" version)"

  if [[ "$PUBLISH_DRY_RUN" != "1" ]] && npm view "$package_name@$package_version" version >/dev/null 2>&1; then
    if [[ "$SKIP_EXISTING" == "1" ]]; then
      say "skipping existing $package_name@$package_version"
      continue
    fi

    fail "$package_name@$package_version already exists on npm. Bump versions or set SKIP_EXISTING=1."
  fi

  publish_args=(publish --access public --tag "$NPM_TAG" --auth-type="$NPM_AUTH_TYPE")

  if [[ "$PUBLISH_DRY_RUN" == "1" ]]; then
    publish_args+=(--dry-run)
  fi

  say "publishing $package_name@$package_version"
  (cd "$package_dir" && npm "${publish_args[@]}")
  published_count=$((published_count + 1))
done

if [[ "$PUBLISH_DRY_RUN" != "1" && "$published_count" -eq 0 ]]; then
  fail "No new package versions were published. Run pnpm release:bump first or set SKIP_EXISTING=0 to fail on existing versions."
fi

say "publish script complete ($published_count package(s) published)"

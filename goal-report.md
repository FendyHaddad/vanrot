# Phase 1-25 Hardening Goal Report

Date: 2026-05-27

## Scope

Audit phases 1 through 25 before Phase 26. Phase 17 through Phase 22 remain post-production features and are checked only for roadmap ordering, not forced into the current framework behavior.

## Issues And Fixes

| Status | Phase | Line Item | Evidence | Fix |
| --- | --- | --- | --- | --- |
| Fixed | Phase 16E | Input component documentation template | `apps/vanrot-site/src/pages/components/component-input.page.html` had nested `<section>` markup and closing `</section>` tags at the same indentation level. | Reindented the content, preview, API section, and closing section tags so the template structure is readable and framework examples do not model bad formatting. |
| Fixed | Phase 24 | Deep documentation system | `apps/vanrot-site/src/docs/framework-reference.json` listed CLI commands, but each command had only name, usage, status, summary, and docs path. That was too shallow for user-facing reference docs and AI bundle consumption. | Added command examples, notes, and subcommand summaries; updated the reference page to render summaries, examples, notes, and subcommands; added tests requiring every command to have examples and notes. |
| Fixed | Phase 25 | AI-readable documentation bundle | `docs/superpowers/feature-maturity.md` still marked the AI-readable docs bundle as `Deferred` while the phase roadmap marked Phase 25 done. | Updated the maturity row to `Production-Ready through Phase 25` and clarified that MCP, Skill.sh, and `vr ai` consume the official bundle. |
| Fixed | Phase 25 | Optional AI commands | The maturity row still described provider adapter verification for OpenAI, Claude, Ollama, and self-hosted providers even though the approved Phase 25 spec made provider-specific forks out of scope. | Reworded the line item around verified provider-neutral bundle commands and left provider-specific adapters as future extensions. |
| Fixed | Phase 25 | MCP and Skill.sh consumers | The generated Skill.sh file was too thin and did not mention MCP resources or `search_vanrot_knowledge`; MCP resources covered only the smallest docs subset. | Expanded Skill.sh workflow/security guidance and MCP resources to include packages, public API, generated files, components, routes, examples, limitations, and improved bundle search. |
| Fixed | Phase 25 | AI knowledge index contract | The Phase 25 spec required packages, exports, commands, diagnostics, routes, components, generated files, conventions, examples, and docs pages in the AI index, but the bundle omitted routes, components, limitations, and deployment notes. | Added those index sections, generated knowledge documents, manifest counts, verifier checks, and coverage tests. |
| Fixed | Phase 25 | MCP resource drift | The AI bundle gained conventions, deployment notes, and docs-page entries, but MCP resources did not expose every bundle index section as a dedicated resource. | Added MCP resources for conventions, deployment, and guide docs, then added a test that every bundle index key has a matching MCP resource. |
| Fixed | Phase 25 / Phase 26 readiness | Security leak check | Initial scan found no real committed provider keys or private keys; one source-code token name false positive showed the scan was ad hoc and not wired into release verification. | Added `verify:security-leaks`, a tested repository scanner for private keys, provider keys, model keys, tokens, and secret assignments, then wired it into `pnpm verify`. |
| Fixed | Phase 16E / Phase 24 | Component page template formatting | A deeper scan found the `component-input.page.html` indentation issue repeated across 23 sibling component docs pages. | Reindented the affected component templates and added `verify:site-format` so same-indent nested closing tags fail verification. This is a repo/framework guardrail, not an IntelliJ-only plugin problem. |
| Fixed | Phase 25 | Docs-page AI knowledge | The AI index counted 24 documentation pages, but generated knowledge files did not include a docs-page Markdown surface. | Added `knowledge/docs.md` generation and test coverage so AI consumers can read docs-page summaries without scraping the site. |
| Fixed | Phase 25 | Skill.sh metadata verification | The Skill.sh package metadata did not explicitly record the AI bundle schema version, and `verify:ai-docs` only checked Skill.sh files were non-empty. | Added schema version metadata to generated Skill.sh files and changed `verify:ai-docs` to compare generated Skill.sh files exactly. |
| Fixed | Phase 25 / Phase 26 readiness | Hidden-file security scan coverage | The security leak verifier scanned normal repo files but did not include hidden files such as `.env.local` if they were present in the workspace. | Added hidden-file scanning while still excluding `.git`, build output, coverage, and package dependency folders. |
| Fixed | Phase 25 / Phase 26 readiness | Provider-key scanner precision | Hidden-file coverage tests showed the OpenAI key detector also matched Anthropic-shaped `sk-ant-*` keys, and redaction masked long environment variable names. | Tightened provider-key detection so OpenAI and Anthropic keys are classified separately, and changed redaction to preserve variable names while masking assigned secret values. |

## Non-Issues Checked

- `docs/superpowers/plans/Phase-12B.md` contains an unchecked `- [ ] **Step N: Step title**` string inside a fenced example block. This is intentional instruction text, not an open task.
- Aggregate plan/spec naming for older Phase 12, 13, 15, and 16 slices predates the stricter phase-file convention and is already covered by checked slice plans plus `verify:phase-docs`.

## Security Notes

- No real secret material was found in the initial current-state scan.
- The only initial hit was `packages/config/src/load.ts` using `exportToken = 'export default'`, which is source-code terminology and not a credential.
- The new verifier avoids that false positive while still detecting provider keys and common committed-secret patterns.
- Hidden text files are now included in the security leak scan, so local `.env*` style files cannot silently bypass the release-facing check.
- Provider-key scanning now distinguishes OpenAI-style keys from Anthropic-style keys and preserves environment variable names in failure output.
- `pnpm audit --audit-level moderate` reported no known dependency vulnerabilities.
- `pnpm audit:core` passed the existing core security/contract audit suite.

## Verification Checklist

- [x] Regenerate `docs/ai` after source changes.
- [x] Run focused AI package tests.
- [x] Run focused site docs/reference tests.
- [x] Run site template format verifier.
- [x] Run security leak verifier.
- [x] Run `pnpm audit --audit-level moderate`.
- [x] Run `pnpm audit:core`.
- [x] Run full `pnpm verify`.
- [x] Restart `apps/vanrot-site` on port `1964` and verify `http://localhost:1964`.

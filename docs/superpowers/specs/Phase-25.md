# Phase 25 AI Consumption

## Purpose

Phase 25 makes Vanrot consumable by AI tools through official, versioned, generated knowledge instead of source-code guessing or stale copied prompts.

Phase 23 made Vanrot project structure inspectable through project intelligence and graph metadata. Phase 24 made the framework understandable through complete public documentation. Phase 25 packages those authoritative sources into one AI knowledge bundle, then exposes that same bundle through MCP, Skill.sh, and first-party CLI commands.

## Approved Direction

Phase 25 uses the **Bundle-Core First** approach.

The AI knowledge bundle is the center of the phase. MCP tools, Skill.sh packaging, and `vr ai` commands are thin consumers of that bundle. They must not maintain separate copies of Vanrot knowledge.

This direction optimizes for drift control. When Vanrot grows, one generator and one verification gate should identify missing AI knowledge updates before stale guidance reaches users or agents.

## Phase Slices

Phase 25 has two implementation slices:

- **25A AI Knowledge Bundle**: create the versioned bundle, manifest, index, generated knowledge documents, provider-neutral rules, and freshness checks.
- **25B AI Consumers**: ship the local MCP server, Skill.sh package, and `vr ai` command surface over the same bundle contract.

Both slices belong to one phase because the consumers only have product value when they prove that they read the same generated source of truth.

## Architecture

The generated AI bundle is the single machine-readable knowledge layer.

```
Phase 23 project intelligence
Phase 24 docs registries
command references
package references
diagnostics
conventions
examples
generated-file docs
        |
        v
AI knowledge generator
        |
        v
versioned bundle manifest + index + knowledge documents + rules
        |
        +--> MCP server
        +--> Skill.sh package
        +--> vr ai commands
```

The public website remains the human documentation surface. The AI bundle is the stable machine layer. Consumers should read the bundle manifest and index, not scrape the site.

## Bundle Contract

The bundle should be generated and versioned. It should contain these stable sections:

- **Manifest**: schema version, Vanrot version, generated time, source fingerprints, source file groups, included package count, command count, diagnostic count, example count, docs count, and coverage status.
- **Knowledge documents**: compact Markdown or JSON knowledge files for install, app structure, runtime patterns, compiler syntax, router, config, CLI, UI, testing, devtools, examples, diagnostics, limitations, and production caveats.
- **Index**: machine-readable lookup data for packages, public exports, commands, diagnostics, routes, components, generated files, conventions, examples, and docs pages.
- **Rules**: provider-neutral agent guidance covering framework rules, preferred patterns, anti-patterns, file suffixes, no-string-literal conventions, signal-first state, scoped CSS, and links back to authoritative docs.

The bundle contract should be deterministic. Generated output should avoid environment-specific noise except where the manifest explicitly records generation metadata.

## Freshness Model

The bundle manifest should store source fingerprints for every source group that can affect AI knowledge:

- docs registries and reference data;
- command metadata;
- package exports;
- diagnostic catalogs;
- example manifests;
- project intelligence schema;
- generated-file documentation;
- framework conventions and phase maturity data.

`vr ai verify` and `pnpm verify:ai-docs` should compare current source fingerprints against the manifest. Stale, missing, unreadable, unsupported, or incomplete bundle states should fail with guided diagnostics.

This is the durable hook for future growth. Git hooks may call the normal verification path, but `pnpm verify` is the primary freshness gate.

## MCP Server

The MCP server should be local-first and deterministic. It should not require network access.

It should expose bundle-backed resources or tools for:

- Vanrot docs;
- commands;
- diagnostics;
- framework patterns;
- examples;
- package and export references;
- generated files;
- conventions and anti-patterns.

Resource names should be stable and readable, such as `vanrot://docs`, `vanrot://commands`, `vanrot://diagnostics`, `vanrot://patterns`, and `vanrot://examples`.

The MCP server should report clear states for missing bundle, stale bundle, unsupported schema, and empty search results. It should never silently fall back to stale built-in knowledge.

## Skill.sh Package

The Skill.sh package should expose the same official bundle as an installable AI knowledge package.

The package should point agents to canonical Vanrot rules, docs, and examples without copying a second content set. Its generated metadata should identify the bundle schema and Vanrot version it was built from.

The Skill.sh package should be treated as a distribution wrapper around the bundle, not as a separate authoring surface.

## CLI Commands

Phase 25 should add a small first-party `vr ai` command group:

- `vr ai build`: generate or refresh the AI knowledge bundle.
- `vr ai verify`: validate bundle schema, source freshness, and coverage.
- `vr ai doctor`: explain missing, stale, unsupported, or incomplete AI bundle states.
- `vr ai mcp`: either run the local MCP server or print exact setup instructions, depending on what the implementation plan proves safest.

Command output should follow the existing CLI product direction: guided, colored, human-readable, and scriptable where needed.

## Verification

Phase 25 should add `verify:ai-docs` and wire it into `pnpm verify`.

Verification should include:

- generator tests proving deterministic bundle output from fixtures;
- schema tests for manifest, index, knowledge documents, and rules;
- coverage tests proving every public package, CLI command, diagnostic, generated file, documented convention, and example from the Phase 24 inventories appears in the AI index;
- freshness tests proving changed source fingerprints fail verification until the bundle is regenerated;
- consumer contract tests proving MCP, Skill.sh, and `vr ai` commands all load the same bundle manifest;
- readable failure-output tests for missing, stale, unsupported, and incomplete bundle states.

Phase 25 completion should update `docs/superpowers/feature-maturity.md`, `docs/superpowers/plans/Phase-25.md`, `docs/superpowers/final-tdd-inventory.md`, and `docs/vanrot-presentation.html`, then pass full `pnpm verify`.

## Out Of Scope

Phase 25 should not:

- introduce provider-specific prompt forks as the canonical knowledge source;
- require network access for MCP or verification;
- make the website renderer responsible for AI bundle generation;
- ship release publishing, npm provenance, Homebrew distribution, or release CI work from Phase 26;
- enter Phase 17 through Phase 22 post-production implementation work.

## Success Criteria

Phase 25 is done when:

- Vanrot has one generated, versioned AI knowledge bundle with manifest, index, documents, and rules.
- MCP, Skill.sh, and `vr ai` commands all consume that same bundle.
- `pnpm verify` fails when framework-facing knowledge sources change without regenerating or updating the AI bundle.
- Failure messages tell maintainers exactly what is stale, missing, unsupported, or incomplete.
- The phase tracker, implementation plan, final TDD inventory, and presentation roadmap stay synchronized.

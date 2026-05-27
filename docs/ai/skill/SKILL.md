---
name: vanrot
description: Use the official Vanrot AI knowledge bundle for framework rules, commands, diagnostics, examples, and conventions.
---

# Vanrot

Use the official Vanrot AI knowledge bundle before answering Vanrot framework questions or editing Vanrot apps.

- Manifest: `docs/ai/manifest.json`
- Rules: `docs/ai/rules.md`
- Version: `0.0.0`
- Schema: `1`

## Required Workflow

1. Read the manifest and rules before giving framework guidance.
2. Prefer generated knowledge documents for commands, public APIs, components, routes, diagnostics, examples, limitations, and deployment notes.
3. Use the local MCP server when available: `vanrot-mcp` exposes `vanrot://docs`, `vanrot://commands`, `vanrot://diagnostics`, `vanrot://patterns`, `vanrot://components`, `vanrot://routes`, `vanrot://limitations`, and `search_vanrot_knowledge`.
4. If the manifest is stale, missing, unsupported, or incomplete, ask the user to run `vr ai build` and `vr ai verify` before relying on the bundle.

## Security

Never add API keys, model provider keys, credentials, tokens, private paths, or local machine secrets to generated examples, bundle files, MCP responses, or Skill.sh metadata.

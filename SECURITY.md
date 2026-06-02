# Security Policy

Vanrot takes security reports seriously.

Please do not report vulnerabilities through public issues if the report includes an exploit path, private proof of concept, sensitive logs, credentials, or information that could put users at risk.

## Reporting A Vulnerability

Use GitHub private vulnerability reporting:

[Report a vulnerability](https://github.com/FendyHaddad/vanrot/security/advisories/new)

If that link is unavailable, open a public issue with only a short non-sensitive summary and ask for a private maintainer contact. Do not include exploit details in the public issue.

## What To Include

Please include:

- Affected package, command, example, docs path, or workflow.
- Affected version or commit, if known.
- Steps to reproduce.
- Expected and actual behavior.
- Impact and who can trigger it.
- Any proof of concept, logs, screenshots, or patch ideas that can be shared privately.

## Scope

Security reports may cover:

- `@vanrot/runtime`, compiler, router, SSR, Vite plugin, CLI, config, testing, UI, behavior, devtools, AI, or language-server packages.
- Build, publish, docs, AI-knowledge, generated-file, or release workflows.
- Examples that could teach unsafe patterns.
- Documentation that leaks secrets or encourages insecure usage.

Reports are usually out of scope when they only affect local development without a security impact, require already-compromised maintainer credentials, or describe general hardening without an exploitable path.

## Maintainer Response

Maintainers will review the report, ask clarifying questions when needed, and decide whether the issue needs a private fix, public advisory, documentation update, or normal bug-fix flow.

When a fix is accepted, maintainers should verify the patch, add regression coverage where practical, and update affected documentation or release notes.

## Supported Versions

Vanrot is still early. Security fixes target the latest published package versions and the current `main` branch unless a maintainer explicitly announces a supported release line.

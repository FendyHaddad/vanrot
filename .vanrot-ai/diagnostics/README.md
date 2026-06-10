# Vanrot Diagnostics

Diagnostics are read-only by default.

- `workflow-hygiene.mjs` checks AI workflow structure, mirrored rule files, and hook delegation.
- `spec-plan-cleanup.mjs` classifies old Superpowers specs/plans as active, reference-only, or executed/obsolete candidates.

`spec-plan-cleanup.mjs` removes files only with explicit flags:

```sh
node .vanrot-ai/diagnostics/spec-plan-cleanup.mjs --remove --confirm-remove
```

Do not use removal flags unless the current user task authorizes file removal.

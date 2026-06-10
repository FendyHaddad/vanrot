# Cleanup Diagnostic

Old plans/specs are not default context. Source, tests, site docs, and generated artifacts are the current truth.

## Classifications

- **Active**: unchecked tasks, current phase work, explicit user reference, or active verifier dependency.
- **Reference-only**: historical rationale still referenced by current docs or code.
- **Executed/obsolete**: implementation has shipped, tasks are checked, no active verifier depends on the file, and source/site docs/tests now carry the truth.

`docs/superpowers/plans/Phase-*.md` files are verifier-owned while `verify-phase-docs` requires completed phase plans to exist. Do not remove those phase plan files unless the verifier is changed first.

## Removal Rule

Remove executed/obsolete specs/plans only when both are true:

1. the current task authorizes file removal;
2. `.vanrot-ai/diagnostics/spec-plan-cleanup.mjs` classifies the file as an executed/obsolete candidate.

Do not remove active or reference-only files.

## Hard Safety Rule

Never change or delete DB/data values unless the user explicitly asks for that exact data operation.

# Pre-Commit Hook

Local install target:

```sh
.git/hooks/pre-commit
```

The local hook should delegate to:

```sh
.vanrot-ai/hooks/pre-commit.sh
```

The hook is intentionally staged-file based. It should not run broad release or publish checks unless staged files require them.

Bypasses:

- `VANROT_SKIP_PHASE_HOOK=1`
- `VANROT_SKIP_COMPONENT_CASCADE=1`

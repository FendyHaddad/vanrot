# Phase 14 CLI UI Enhancement

**Status:** Approved  
**Parent spec:** `2026-05-23-phase-14-cli-product-experience-design.md`

## What This Covers

Root help screen redesign and reporter color/alignment upgrade. This is the "Jobs-quality" bar — not cosmetic polish, but functional clarity: every output line communicates exactly one thing, aligned so the eye lands in the right place.

## Root Help Screen (`vr` / `vr --help`)

### Fire Animation

- HTML canvas, logical buffer 140×26 px, CSS-scaled to full terminal width with `image-rendering: pixelated`
- Doom fire cellular automaton: bottom row seeded at 255 each frame, values propagate upward with random 1px horizontal drift and probabilistic decay
- **Palette:** value 0 = transparent. Low values (dying tips, top) → dark red → red → magenta → violet → deep blue → bright blue-white (high values, base seed)
- Result: blue base flame, red tips — gas-flame aesthetic
- Canvas background: near-black `#000408`

### VANROT ASCII Banner

- Box-drawing block characters (`██╗ ██║ ╚` etc.) overlaid centered on canvas via `position: absolute` + flexbox
- Text color: `#000` (black), no glow, no text-shadow
- Font: `SF Mono` / `JetBrains Mono` / Menlo monospace, 11px, 14px line-height, `white-space: pre`

### Help Content

Fades in 500ms after fire starts playing (CSS `opacity` + `translateY` transition, 800ms `setTimeout`).

**Layout:**

```
Usage   vr <command> [options]

SCAFFOLD
create <name>              Create a new Vanrot project
generate <role> <name>     Generate a component or page
add <primitive>            Add a UI primitive to the project
e.g.  vr create my-app  ·  vr generate component header  ·  vr add button

DEVELOPMENT
dev                        Start dev server with HMR
build                      Compile and bundle for production
test                       Run the test suite

MAINTENANCE
doctor                     Check project health and config
config <action>            Validate, migrate, or recover config
map                        Print the project structure map
init-ai                    Set up AI context rules for this project

Run vr <command> --help for flags and examples.
```

- Command column: `min-width: 30ch` — accommodates `generate <role> <name>` (22 chars) with 8ch breathing room
- Group headers: uppercase, `#30363d` (dim), 10–11px, letter-spacing
- Command names: `#79c0ff` (blue)
- Descriptions: `#8b949e` (muted)
- Examples line: only under Scaffold group; `#58a6ff` for the command snippets
- Footer: `#484f58` (very dim), `#79c0ff` for `vr <command> --help`

## Reporter Output (`packages/cli/src/reporter/`)

### Label System

All output uses fixed-width 8-char labels, left-aligned, followed by two spaces then content:

| Label     | Color     | Hex       |
|-----------|-----------|-----------|
| `success` | green     | `#3fb950` |
| `info   ` | cyan      | `#58a6ff` |
| `warning` | amber     | `#d29922` |
| `error  ` | red       | `#f85149` |
| `next   ` | green     | `#3fb950` |

All labels padded to 8 chars (e.g., `"error   "`, `"next    "`).

### Warning Format

Single line: `warning  <filePath>` then indented body text on next line.

Before:
```
warning
src/features/auth/home.role.ts
missing @VanrotComponent decorator
```

After:
```
warning   src/features/auth/home.role.ts
          missing @VanrotComponent decorator
```

### Error + Next Format

```
error     vanrot.config.ts not found
          Vanrot needs a config file to resolve source paths,
          role suffixes, and generated file conventions.
next      run vr config recover
```

### Doctor Output

Each check on one line. Blank line between check groups. Single `next` at end.

```
success   vanrot.config.ts found
success   TypeScript configured

warning   src/features/auth/home.role.ts
          missing @VanrotComponent decorator

error     Node.js version too old
          requires 18.0.0 or later

next      upgrade Node.js to 18+
```

## Implementation Scope

### `packages/cli/src/reporter/reporter.ts`

- Add `chalk` (or ANSI escape strings) for color
- Fix `warning()`: single-line label + path, indented body
- Fix `nextSteps()`: use `next    ` label (padded), no "Next" header, no `> ` prefix
- Add `success()`, `info()`, `error()` methods if not present

### `packages/cli/src/cli.ts`

Replace `rootHelp` string with grouped, 30ch-aligned output matching the layout above.

### `packages/cli/src/commands/metadata.ts`

Add `description` field to `CliCommandMetadata`. Currently `doctor`, `map`, `init-ai`, `dev`, `build`, `test` have degenerate help text. Each needs a one-line description used in root help.

Proposed descriptions:
- `create <name>` → "Create a new Vanrot project"
- `generate <role> <name>` → "Generate a component or page"
- `add <primitive>` → "Add a UI primitive to the project"
- `dev` → "Start dev server with HMR"
- `build` → "Compile and bundle for production"
- `test` → "Run the test suite"
- `doctor` → "Check project health and config"
- `config <action>` → "Validate, migrate, or recover config"
- `map` → "Print the project structure map"
- `init-ai` → "Set up AI context rules for this project"

### Command Groups

Add group metadata to `metadata.ts`:

```typescript
export const commandGroups = [
  { label: 'Scaffold', commands: ['create', 'generate', 'add'] },
  { label: 'Development', commands: ['dev', 'build', 'test'] },
  { label: 'Maintenance', commands: ['doctor', 'config', 'map', 'init-ai'] },
] as const;
```

## Out of Scope

- Fire animation in the terminal (this is a CLI tool — fire is browser-only mockup context). The actual terminal output uses the ASCII banner and help layout only.
- Per-command help screens (covered in main Phase 14 spec)
- Interactive prompts

## Terminal Reality Note

The fire animation exists in the design mockup to convey energy and craft. The real terminal output uses the VANROT ASCII banner (static, printed once) then the grouped help content. No canvas, no animation — terminals don't support that. The mockup establishes the visual language; the implementation expresses it through color, alignment, and layout.

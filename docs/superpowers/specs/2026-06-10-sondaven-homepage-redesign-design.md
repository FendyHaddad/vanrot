# Sondaven-Inspired Homepage Redesign — Design

Date: 2026-06-10
Reference research: `2026-06-09-sondaven-ui-inspiration.md`
Surface: `apps/vanrot-site` (vanrot.vankode.com)

## Rules (user-set, non-negotiable)

1. Hero + dashboard section stay untouched (`home-hero`, `home-components`).
2. Mobile nav becomes a button that opens a listed menu — no minified desktop nav.
3. Black theme stays.

## Goals

Capture Sondaven's interaction grammar with Vanrot-owned assets:

- Long, rich scroll story (framework + UI library deserves it).
- ASCII design language instead of line-video animation — underground hacker vibe.
- A scroll-driven section where text emerges from the center.
- Horizontal scroll for the package manifest.
- A site footer (currently missing).
- A JetBrains plugin section below the dashboard (IntelliJ IDEA + WebStorm marks).

## Page composition (top → bottom)

1. `home-hero` — unchanged.
2. `home-components` (dashboard) — unchanged.
3. **`home-plugin` (new)** — "Vanrot in your IDE." Two mono tiles with original
   monogram marks (IJ / WS) for IntelliJ IDEA and WebStorm, JetBrains Marketplace
   note. Data: `jetbrainsTools` const in `home.page.ts` (single source).
4. `home-ai` — unchanged.
5. `home-signals` — unchanged.
6. **`home-anatomy` (new)** — the three-file component model. Triptych of code
   cards: `counter.component.ts` / `.html` / `.css`. Snippet text lives in
   `home.page.ts` strings (template `{{ }}` cannot be escaped in HTML), rendered
   into `<pre>` via interpolation.
7. `home-proof` — unchanged.
8. **`home-manifesto` (new)** — animation-only scroll section. Tall track
   (~300svh) with a sticky viewport. ASCII canvas backdrop (ambient glyph field
   that brightens radially from center as progress grows). Manifesto lines
   emerge from center: widget writes scroll progress to CSS var `--p`; CSS
   per-line `clamp()` windows drive opacity/scale/blur. Reduced motion: static
   lines, no canvas loop.
9. **`home-packages` (rework)** — horizontal package rail.
   - Desktop: section height = `100svh + rail distance`; sticky inner viewport;
     vertical scroll maps to `translate3d(-progress * distance)` on the track.
     Counter `01 / NN` updates with the focused card.
   - Mobile (≤760px): native `overflow-x` + scroll-snap; counter follows
     `scrollLeft`.
   - Reduced motion (desktop): track wraps into a grid; widget skips.
   - Data: existing `packages` array (from `packageReferenceDocs`) with padded
     index, still the single source of truth.
10. `home-start` — unchanged.
11. **Site footer (new, in `app.layout`)** — brand + tagline, route links
    (`<vr route.* />`, labels owned by `routes.ts`), install command, copyright,
    and a giant faded VANROT wordmark strip.

## Mobile nav

- `app.layout.html`: hamburger `<button data-vr-site-menu-trigger>` in the
  header (visible ≤760px; `.site-top-nav` hidden there), full-screen menu panel
  `[data-vr-site-menu]` under the header listing the same `<vr route.* />`
  links, large type.
- New `src/app/app-shell-interactions.widget.ts` using
  `createOverlayController` from `@vanrot/behavior/overlay`
  (`closeOnOutsidePointer: false`; trigger uses `toggleOverlay`, since
  `registerTrigger` is open-only and outside-pointer close would fight the
  toggle). Syncs `aria-expanded`, `data-state`, `hidden`; closes on Escape and
  on link click; toggles a body scroll lock class.
- `AppLayout` gains `copy` (menu label strings) and calls the widget in its
  constructor — same pattern as `HomePage`/docs shell.

## Animation & accessibility ground rules

- IntersectionObserver + rAF only; no animation libraries.
- Every new motion has a `prefers-reduced-motion` fallback (static text, grid
  rail, no canvas loop).
- Manifesto text is real text in the DOM (screen readers read it regardless of
  emergence animation).
- ASCII canvases are `aria-hidden` decoration; cell/glyph language reuses the
  hero's (cell 7px, dense/faint glyph sets, hash-based pseudo-random,
  JetBrains Mono).

## Out of scope

- Hero and dashboard markup/behavior.
- Route table changes.
- Any new dependencies.

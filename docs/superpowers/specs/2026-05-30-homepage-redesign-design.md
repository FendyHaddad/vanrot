# Homepage Redesign — Design Spec

**Date:** 2026-05-30
**Status:** Approved (brainstorm complete)
**Mockups:** `docs/superpowers/homepage-mockups/homepage-full.html` (canonical), `hero-v5.html`, `dashboard-v2.html`

## Goal

Replace the current "basic" homepage with a shadcn-blocks-grade, Angular.dev-rhythm landing page. Pure monochrome
(black ↔ white, no brand orange). Must read like an awwwards-quality page: an ASCII hero with motion, well-spaced
sections, scroll-reveal animation, and a component showcase that proves the design system instead of describing it.

The page must pay off every hero claim lower down and **dogfood real `@vanrot/ui` components** — not hand-rolled
divs like the current page or the mockups.

## Design Language

- **Color:** pure monochrome. Black canvas (`#000`–`#0c0c0c`), white/gray text, hairline borders
  (`rgba(255,255,255,.06–.2)`). Drop `--vr-color-brand` (#f05a3d) from the homepage entirely.
- **Type:** Geist for alpha/headings/body; JetBrains Mono for numerics, code, package names, eyebrows, stats.
- **Motion:** smooth, deterministic, restrained. Hacker/cybersec tone in the hero only; rest is calm.
- **Layout:** every section centered (max-width inner ~780px), generous vertical rhythm (~96px section padding).

## Section Order (locked)

1. **Sticky nav** — logo + Docs / Components / Packages / Blog + GitHub.
2. **Hero** — ASCII "VANROT" decode on canvas2D. Eyebrow `AI-FIRST · SIGNAL-BASED · SECURE BY DESIGN`, typed
   subtitle "The only framework you need. Reactivity without the magic.", two CTAs (solid "Read the docs" +
   ghost "$ npm i @vanrot/runtime"). Scanline + vignette overlays.
3. **Component system** — "A component system, not a starter kit." Dashboard block (sidebar + 4 stat cards +
   package table with breadcrumb + avatar). CTA button **"Browse UI components →" → `/docs/components`**.
4. **AI-first & secure** (merged) — 4 cards: Agent manifest (`docs/ai`), `vr ai`, No eval codegen, Zero deps.
   Card icon in a rounded chip, **title centered, description centered**.
5. **Signals** — code panel (`signal` → `computed` → `effect`) + dependency-flow diagram. "No magic, no diffing."
6. **Proof strip** — 4-up monospace stats: `3.9kb` runtime, `0` dependencies, `9` packages, `100%` typed.
   This is where the lean/"<4kb" claim finally gets context (removed from hero).
7. **Package widgets** — 9 cards (3-col), each: icon + package name + status badge, description, footer
   (role · version · size). Hover-lit border. Replaces the old generic card grid and the table-list variant.
8. **Get started / final CTA** — `$ npm create vanrot@latest` + copy button, Docs + GitHub links.

## Hero Animation (locked = mockup `hero-v5.html`)

- Canvas2D, no three.js. (three.js evaluated and deferred — see post-production md; ~150kb conflicts with lean
  positioning, stays opt-in app dependency, never in `@vanrot/runtime`.)
- Offscreen canvas renders "VANROT" in Geist 900; sampled into a per-cell mask (`cell=7px`).
- Lit cells draw dense glyphs (`@#%&8$ABXYZ`); unresolved/background cells draw faint glyphs (`01:.+=*`).
- **Determinism:** hash `Math.sin(x*127.1+y*311.7)*43758.5453`; no per-frame `Math.random`. Glyph churn capped
  (`CHURN=5/s`), smoothstep intro over 2s, time-based rain. This is what removed the jitter.
- **Font-ready guard (critical):** build the mask on `document.fonts.ready` with a `setTimeout(go, 600)` fallback,
  guaranteed font fallbacks (`Arial, sans-serif`). Without this the wordmark renders blank.
- Implement as a Vanrot `.widget.ts`: canvas created/torn down via `onMount`/`onDestroy`, `requestAnimationFrame`
  loop cancelled on destroy. Respect `prefers-reduced-motion` (render a static resolved frame).

## Scroll Reveal

- `IntersectionObserver` (threshold ~.18, `rootMargin: 0px 0px -8% 0px`), fires once per section (`unobserve`).
- On enter: section gets `.in` → headings/lead/frames fade-up (`translateY(30px)→0`, ~.8s cubic-bezier).
- Staggered children: feature cards, proof stats, package widgets cascade (transition-delay steps).
- Animated divider: a center-out glowing line draws across each section seam (width `0→72%`, ~1.1s).
- `prefers-reduced-motion: reduce` disables all of it (content visible, no transforms).

## Component Mapping (dogfood real `@vanrot/ui`)

The mockups use raw divs; the implementation must use real components where they exist:

| Mockup element            | Real component            |
|---------------------------|---------------------------|
| dashboard sidebar         | `vr-sidebar` + `vr-nav`   |
| stat cards                | `vr-stat` / `vr-card`     |
| package table             | `vr-table` (+ sub-elems)  |
| status pills              | `vr-badge`                |
| avatar                    | `vr-avatar`               |
| ⌘K search                 | `vr-command-menu`         |
| section dividers          | `vr-separator` (or CSS)   |

Package data (names, versions, status) must come from the existing single source of truth (`site-data.ts` /
`packageReferenceDocs`), not be re-hardcoded. The `/docs/components` route used by the CTA must reference the
route name from `defineRoutes`, not a literal path duplicated ad hoc.

## File Plan (role-based suffixes, three-file components)

- `home.page.{html,css,ts}` — rewritten. Composition of the sections; pulls package data from `site-data.ts`.
- `home-hero.widget.{ts,html,css}` — the canvas ASCII animation (signals for reduced-motion + lifecycle).
- Section sub-components as needed (`.component.ts/.html/.css`) to keep `home.page` small and each unit focused —
  e.g. proof strip, package-widget grid, signals demo. No UI markup in TS; no logic in HTML; scoped CSS.

## Out of Scope

- three.js / WebGL hero (deferred to post-production).
- Light theme tuning for the new sections (monochrome dark is the target; keep token-driven so it can follow later).
- Real `/docs/components` content changes — CTA links to the existing route.

## Constraints

- Follow `AGENTS.md`: guard clauses, signals for mutable state, single source of truth for shared strings,
  role-based suffixes, scoped CSS.
- No new runtime dependencies. Hero stays canvas2D.
- Don't spread unrelated refactors; touch only what the redesign needs.

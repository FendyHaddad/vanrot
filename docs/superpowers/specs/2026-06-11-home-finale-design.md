# Home Finale: Manifesto → ASCII Shatter → DNA Spiral

Date: 2026-06-11
Status: Approved design, pending implementation plan

## Goal

Merge the home page `home-manifesto` section ("No virtual DOM / No hydration / No magic / Just signals") and the `home-packages` rail into one continuous pinned scroll sequence. The manifesto lines fly toward the viewer and dissipate into ASCII particles, then the packages appear as a DNA-like 3D helix carousel rendered with three.js. The sequence ends by releasing the pin into the footer.

Reference feel: the spiral carousel at pacomepertant.com — elegant, depth-driven, mouse-reactive — adapted to Vanrot's monochrome ASCII/starfield aesthetic. No click gate; everything is driven by continuous scroll.

## Scroll Sequence

One pinned section (~700vh total scroll distance) with four phases mapped to scroll progress `p`:

| Phase | `p` range | Behavior |
|-------|-----------|----------|
| Manifesto | 0.00–0.35 | Current behavior preserved: the four lines fade in sequentially over the twinkling glyph canvas. |
| Hyperspace shatter | 0.35–0.50 | Lines scale and translate toward the viewer (perspective zoom). As each line crosses a near-screen threshold, it breaks into ASCII glyph particles — per-character sampling of the line's text — which scatter outward, drift, and fade into the star field. Background glyph dots stretch into short star streaks during the zoom. |
| DNA spiral | 0.50–0.95 | three.js scene takes over. Package cards ride a double-helix curve (two interleaved strands, smooth pitch). Scroll advances helix rotation; the focused card lands center and faces the camera while others curve away with depth fade. A gentle idle undulation keeps the helix alive between scrolls. Counter shows `nn / total`. Mouse movement applies subtle camera parallax tilt. Twinkling starfield background persists, rendered as a three.js points field so depth matches the helix. |
| Release | 0.95–1.00 | Helix recedes and fades, pin releases, normal scroll resumes into the footer. |

## Rendering Architecture

- **WebGL layer (three.js `WebGLRenderer`)**: starfield points (twinkle preserved from current glyph aesthetic), depth fog, helix idle motion.
- **DOM layer (three.js `CSS3DRenderer`)**: package cards remain real `vr-card` DOM nodes positioned on the helix — crisp text, native links, scoped CSS, accessible focus.
- Helix placement per card: `x = R·cos(θᵢ + s)`, `z = R·sin(θᵢ + s)`, `y = pitch·(θᵢ + s)`, with cards alternating between the two strands (θ offset of π).
- ASCII shatter runs on the existing 2D glyph canvas (extension of the current manifesto canvas code), not in three.js — the handoff to WebGL happens at phase 3.
- `three` is added as a dependency of `apps/vanrot-site` only. It is loaded via dynamic `import()` when the section approaches the viewport (~1.5 viewport heights), so the main bundle and the `@vanrot/runtime` size budget are untouched.

## Files

- `apps/vanrot-site/src/pages/home/home.page.html` — merged section markup; manifesto lines and package cards (`@for (railPackages)`) stay in the template; user-facing copy stays in HTML.
- `apps/vanrot-site/src/pages/home/home-spiral.widget.ts` (new) — phases 2–4: shatter particles, three.js scene lifecycle, scroll/mouse bindings, dynamic three import, disposal.
- `apps/vanrot-site/src/pages/home/home-interactions.widget.ts` — `setupPackageRail` removed; `setupManifestoScene` trimmed to phase 1 plus streak handoff.
- `apps/vanrot-site/src/pages/home/home.page.css` — hyperspace transforms, helix card styling, fallback grid styles.
- `apps/vanrot-site/src/pages/home/home.page.ts` — `railPackages` remains the single data source; no new data files.

## Fallbacks

- **`prefers-reduced-motion` or no WebGL**: no pinning, no three.js load. Manifesto lines render static; packages render as a static card grid (same markup, CSS grid fallback class).
- **Mobile (≤760px)**: spiral skipped; current swipeable horizontal rail behavior is kept. The helix is desktop-only.

## Out of Scope

- No changes to the footer itself, other home sections, docs pages, or any `@vanrot/*` package.
- No click-to-enter gate.
- No autoplay audio, no post-processing passes (bloom/DOF) in v1.

## Verification

Page/site lane: site build, dev server restart per CLAUDE.md, rendered route proof at `http://localhost:1964/` (DOM + console errors, not just HTTP 200), reduced-motion and ≤760px spot checks, confirm `three` chunk is code-split and absent from the initial bundle.
